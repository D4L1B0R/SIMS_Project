"use client";

import React, { useState, useEffect, Suspense } from "react";
import { UserDTO, RecipeDTO } from "@/lib/dtos";
import Navbar from "@/components/Navbar";
import UserComponent from "@/components/UserComponent";
import RecipeComponent from "@/components/RecipeComponent";
import StatisticsDashboard from "@/components/Statistics";
import { useSession } from "next-auth/react";
import RankingList from "@/components/RankingList";
import { useRouter } from "next/navigation";

function NavbarWithSuspense() {
  return (
    <Suspense fallback={<div>Loading navigation...</div>}>
      <Navbar />
    </Suspense>
  );
}

interface UserWithRecipes extends UserDTO {
  recipes?: RecipeDTO[];
}

export default function ModeratorDashboardPage() {
  const [users, setUsers] = useState<UserWithRecipes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); 
  const session = useSession();
  const router = useRouter();
  
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const usersResponse = await fetch("/api/user");
        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users");
        }
        const usersData: UserDTO[] = await usersResponse.json();
        const usersWithRecipes = await Promise.all(
          usersData.map(async (user) => {
            if (user.chefBeginner) {
              try {
                const recipesResponse = await fetch(
                  `/api/user/recipe?userId=${user.id}`
                );
                if (recipesResponse.ok) {
                  const recipes: RecipeDTO[] = await recipesResponse.json();
                  return { ...user, recipes: recipes ?? [] };
                }
              } catch (error) {
                console.error(
                  `Error fetching recipes for user ${user.id}:`,
                  error
                );
              }
            }
            return user;
          })
        );

        setUsers(usersWithRecipes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Došlo je do greške");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [refreshTrigger]); // Dodaj refreshTrigger kao dependency

  if (loading) {
    return (
      <>
        <NavbarWithSuspense />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Učitavanje podataka ...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavbarWithSuspense />
        <div className="container mx-auto p-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Greška pri učitavanju podataka: {error}</p>
            <button 
              onClick={refreshData}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Pokušaj ponovo
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavbarWithSuspense />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Pregled korisnika i recepata</h1>
          <button 
            onClick={refreshData}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Osveži podatke
          </button>
        </div>

        {users && users.length !== 0 ? (
          <div
            className="w-full bg-white rounded-lg shadow-md overflow-y-auto"
            style={{ maxHeight: "500px" }}
          >
            {users.map((user) => (
              <div key={user.id}>
                <UserComponent user={user} refreshData={refreshData} />
                {user.recipes &&
                  user.recipes.map((recipe) => (
                    <RecipeComponent key={recipe.id} recipe={recipe} refreshData={refreshData} />
                  ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">Nema korisnika za prikaz</p>
          </div>
        )}
        <RankingList />
      </div>
    </>
  );
}