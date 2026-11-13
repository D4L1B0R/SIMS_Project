import { prisma } from "@/prisma/prismaclient";
import { AuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { Gender } from "@/lib/generated/prisma";

export const authOptions: AuthOptions = {
  providers: [
    // REGISTRACIJA
    CredentialsProvider({
      name: "SignUp",
      id: "signup",
      credentials: {
        first_name: { label: "First Name", type: "text" },
        last_name: { label: "Last Name", type: "text" },
        email: { label: "Email", type: "email" },
        phone_number: { label: "Phone Number", type: "text" },
        date_of_birth: { label: "Date of Birth", type: "date" },
        gender: { label: "Gender", type: "text" },
        password: { label: "Password", type: "password" },
        confirm_password: { label: "Confirm Password", type: "password" },
        privileged_user:{ label:"Privileged User", type: "text"}
      },
      async authorize(credentials, req) {
        try {
          // jel postoji vec korisnik
          const userExists = await prisma.profile.findUnique({
            where: { email: credentials?.email }
          });
          
          if (userExists) {
            console.log('User already exists');
            return null;
          }

          // validacija i konverzija gender vrednosti
          let genderValue: Gender;
          if (credentials?.gender === 'FEMALE') {
            genderValue = Gender.FEMALE;
          } else if (credentials?.gender === 'MALE') {
            genderValue = Gender.MALE;
          } else {
            console.log('Invalid gender value');
            return null;
          }

          // validacjia lozinke
          if (credentials?.password !== credentials?.confirm_password) {
            console.log('Passwords do not match');
            return null;
          }
          // validacija ostalih polja
          if(!credentials?.password || !credentials?.email || !credentials?.confirm_password || !credentials.date_of_birth || !credentials.first_name || !credentials.last_name) {
            return null;
          }

          
          const privilegedUser = credentials?.privileged_user === 'true';
          // kreiranje korisnika
          const user = await prisma.user.create({
            data: {
              first_name: credentials?.first_name  ,
              last_name: credentials?.last_name ,
              gender: genderValue,
              phone_number: credentials?.phone_number ,
              date_of_birth: credentials?.date_of_birth 
                ? new Date(credentials.date_of_birth) 
                : new Date(),
            }
          });

          if (!user) {
            console.log('User not created');
            return null;
          }

          // kreiranje profila
          const profile = await prisma.profile.create({
            data: {
              email: credentials?.email || '',
              password: credentials?.password 
                ? await bcrypt.hash(credentials.password, 10) 
                : '',
              userId: user.id,
            }
          });
          
          if (!profile) {
            await prisma.user.delete({ where: { id: user.id } });
            return null;
          }
          
          // svako ko se registruje preko stranice auutomatski postaje kuvarpocetnikk
          // sto znaci da admin i moderator se postavljaju u bazi
          const ChefBeginner = await prisma.chefBeginner.create({
            data: {
              privileged_user : privilegedUser,
              userId: user.id,
            }
          })

          if(!ChefBeginner){
            await prisma.user.delete({ where: { id: user.id } });
            return null;
          }

          
          const nextAuthUser: any = {
            id: user.id.toString(),
            email: profile.email,
            name: `${user.first_name} ${user.last_name}`,
            firstName: user.first_name,  
            lastName: user.last_name,  
            chefBeginnerId: ChefBeginner.id, 
            privilegedUser: privilegedUser, 
            moderator: null,           
            isAdmin: false,             
            isModerator: false,
            isSponsor: false,          
          };

          console.log('Registered user:', nextAuthUser);
          return nextAuthUser;

        } catch (error) {
          console.log('Error during registration:', error);
          return null;
        }
      }
    }),

    //login
    CredentialsProvider({
      name: "SignIn",
      id: "signin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          
          const profile = await prisma.profile.findUnique({
            where: { email: credentials.email },
            include: { 
              user: {
                include: {
                  ChefBeginner: true,
                  Moderator: {
                    include: {
                      Administrator: true
                    }
                  },
                  Sponsor:true,
                }
              } 
            }
          });

          if (!profile || !profile.user) {
            console.log('User not found');
            return null;
          }

          
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            profile.password
          );

          if (!isPasswordValid) {
            console.log('Invalid password');
            return null;
          }
// ???? console.log('User from DB:', profile.user);
    // console.log('Moderator data:', profile.user.Moderator);
    // console.log('Admin data:', profile.user.Moderator?.Administrator);

          const isModerator = !!profile.user.Moderator;
          const isAdmin = !!profile.user.Moderator?.Administrator;
          const isSponsor = !!profile.user.Sponsor;
          const privilegedUser = profile.user.ChefBeginner?.privileged_user || false;
          let chefBeginnerId;
          if(isAdmin || isModerator)
            chefBeginnerId =  null;
          else
            chefBeginnerId= profile.user.ChefBeginner?.id
          
          const nextAuthUser: any = {
            id: profile.user.id.toString(),
            email: profile.email,
            name: `${profile.user.first_name} ${profile.user.last_name}`,
            firstName: profile.user.first_name,  
            lastName: profile.user.last_name,   
            chefBeginnerId: chefBeginnerId,
            privilegedUser: privilegedUser,
            moderator: profile.user.Moderator,  
            isAdmin: isAdmin,
            isModerator: isModerator,
            isSponsor: isSponsor,
          };


          console.log('Logged in user:', nextAuthUser);
          return nextAuthUser;

        } catch (error) {
          console.log('Error during login:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.chefBeginnerId = user.chefBeginnerId;
        token.moderator = user.moderator;
        token.isAdmin = user.isAdmin;
        token.isModerator = user.isModerator;
        token.privileged_user = user.privilegedUser;
        token.isSponsor = user.isSponsor;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.chefBeginnerId = token.chefBeginnerId;
        session.user.moderator = token.moderator;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.isModerator = token.isModerator as boolean;
        session.user.privileged_user = token.privileged_user;
        session.user.isSponsor = token.isSponsor as boolean;
      } 
      return session;
    }
  },
  pages: {
    signIn: '/',
    signOut: '/',
  },
  secret: process.env.NEXTAUTH_SECRET || ''
};