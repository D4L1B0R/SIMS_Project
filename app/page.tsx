import Navbar from "@/components/Navbar";
import { Recipe } from '@/lib/models/Recipe';
import HomePageContent from "@/components/HomePageContent";

async function getRecipes(params: Record<string, string | string[] | undefined>): Promise<Recipe[]> {
  const query = new URLSearchParams();

  for (const key in params) {
    let value = params[key];

    if (key === "search") {
      if (!value || (typeof value === "string" && value.trim() === "")) {
        value = "";
      }
    }

    if (typeof value === "string") {
      query.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach(v => query.append(key, v));
    }
  }

  let url = 'http://localhost:80/api/recipe';
  if (query.toString()) {
    url += `?${query.toString()}`;
  }

  const response = await fetch(url, {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch recipes');
  }

  return response.json();
}

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;

  const searchQuery =
    typeof params.search === "string" && params.search.trim() !== ""
      ? params.search
      : "";

  const recipes = await getRecipes({ ...params, search: searchQuery });

  return (
    <>
      <Navbar />
      <HomePageContent recipes={recipes} searchQuery={searchQuery} />
    </>
  );
}