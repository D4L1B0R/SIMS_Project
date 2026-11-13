'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Recipe } from "@/lib/models/Recipe"

interface RecipesModalProps {
  recipes: Recipe[]
  isOpen: boolean
  onClose: (refresh: boolean) => void
  rankingListId: number
}

export default function RecipesModal({ recipes, isOpen, onClose, rankingListId }: RecipesModalProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isOpen) setSelectedIds([])
  }, [isOpen])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose(false)
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKey)
      return () => document.removeEventListener("keydown", handleKey)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleConfirm = async () => {
    try {
        const selectedRecipes = recipes.filter((r) => selectedIds.includes(r.id as number))

        const response = await fetch("/api/ranking-list/" + rankingListId, {
            method: "POST",
            body: JSON.stringify({
                recipeIds: selectedIds
            })
        })
        
        if(!response.ok)
            throw new Error("Failed adding new recipes!")

        onClose(true)
    } catch (error) {
        setError(error + "")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={() => onClose(false)} />

      {/* modal */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Select Recipes</h2>
          <Button variant="ghost" size="sm" onClick={() => onClose(false)}>
            ✕
          </Button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {recipes.length === 0 ? (
            <p className="text-sm text-gray-500">No available recipes.</p>
          ) : (
            recipes.map((r) => (
              <label
                key={r.id}
                className="flex items-center gap-3 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(r.id as number)}
                  onChange={() => toggleSelect(r.id as number)}
                  className="h-4 w-4"
                />
                <span>{r.title}</span>
              </label>
            ))
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => onClose(false)}>
            Cancel
          </Button>
          <Button disabled={selectedIds.length === 0} onClick={handleConfirm}>
            Add Selected
          </Button>
        </div>
      </div>
    </div>
  )
}