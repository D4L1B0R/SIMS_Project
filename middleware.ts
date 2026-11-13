import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith('/administrator')) {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    
    if (!token?.isAdmin && !token?.isModerator ) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  if(pathname.startsWith('/sponsor')){
    const token = await getToken({
      req:request,
      secret: process.env.NEXTAUTH_SECRET
    })

    if(!token?.isSponsor && !token?.isAdmin && !token?.isModerator){
      return NextResponse.redirect(new URL('/',request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/administrator/:path*', '/sponsor/:path*'],
};
export const runtime = 'nodejs'; 