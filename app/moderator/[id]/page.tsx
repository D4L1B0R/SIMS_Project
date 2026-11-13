"use client";

import Navbar from "@/components/Navbar";
import RecipesModal from "@/components/RecipesModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Recipe } from "@/lib/models/Recipe";
import { Delete, Edit, Check, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RankingListPage() {
  const [data, setData] = useState<any>({ description: "" });
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  const { id } = useParams();
  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ranking-list/" + id);
      const { data } = await response.json();
      const res = await fetch("/api/recipe");
      setData(data);
      setRecipes(await res.json());
    } catch (error) {
      setError(error + "");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveDescription = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ranking-list/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: data.description }),
      });
      if (!response.ok) throw new Error("Failed to update description!");
      setEditing(false);
      await fetchData();
    } catch (error) {
      setError(error + "");
    } finally {
      setLoading(false);
    }
  };

  const removeRecipe = async (recipeId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ranking-list/${id}/${recipeId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove recipe!");
      await fetchData();
    } catch (error) {
      setError(error + "");
    } finally {
      setLoading(false);
    }
  };

  const deleteRankingList = async () => {
    if (!confirm("Are you sure you want to delete this ranking list? This cannot be undone.")) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/ranking-list/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete ranking list!");
      router.push("/moderator");
    } catch (error) {
      setError(error + "");
    } finally {
      setLoading(false);
    }
  };

  const availableRecipes = recipes.filter(
    (r) => !data?.recipes?.some((dr: Recipe) => dr.id === r.id)
  );

  return (
    <>
    <Navbar></Navbar>
    <div className="flex flex-col items-center mt-20 w-1/2 mx-auto">
      <div className="flex items-center gap-3 mb-5 w-full">
        {editing ? (
          <>
            <Input
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              className="flex-1"
            />
            <Button size="sm" onClick={saveDescription} disabled={loading}>
              <Check />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditing(false);
                fetchData();
              }}
            >
              <X />
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold flex-1">{data.description}</h2>
            <Edit className="cursor-pointer" onClick={() => setEditing(true)} />
          </>
        )}
      </div>

      <Button className="mb-5" onClick={() => setOpen(true)}>
        Add Recipe
      </Button>

      <Button
        variant="destructive"
        className="mb-5"
        onClick={deleteRankingList}
        disabled={loading}
      >
        Delete Ranking List
      </Button>

      <div className="w-full space-y-3">
        {data?.recipes?.map((recipe: Recipe) => (
          <div
            key={recipe.id}
            className="flex justify-between items-center p-2 border rounded-lg"
          >
            <span>{recipe.title}</span>
            <Delete
              className="cursor-pointer"
              onClick={() => removeRecipe(recipe.id)}
            />
          </div>
        ))}
      </div>

      <RecipesModal
        recipes={availableRecipes}
        isOpen={open}
        onClose={async (refresh) => {
          setOpen(false);
          if (refresh) await fetchData();
        }}
        rankingListId={parseInt(id + "")}
      />
    </div>
    </>
  );
}