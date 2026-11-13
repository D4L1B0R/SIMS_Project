"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { Input } from "./ui/input";

export default function RankingListModal({
  isOpen,
  onClose,
  refresh
}: {
  isOpen: boolean;
  onClose: () => void;
  refresh: () => void;
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleClose(): void {
    onClose();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const run = async () => {
      try {
        setLoading(true);

        const formData = new FormData(event.currentTarget)
        const description = formData.get('description')

        if(description == '' || !description)
          throw new Error("Morate uneti deskripciju!");

        const response = await fetch("/api/ranking-list", {
          method: 'POST',
          body: JSON.stringify({
            description
          })
        })

        if(!response.ok)
          throw new Error("Failed to create ranking list!")

        await refresh()
        onClose();
      } catch (error) {
        setError(error + "");
      } finally {
        setLoading(false);
      }
    };
    run();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Kreiraj Rang Listu</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Zatvori"
          >
            <X
              className="bg-red-600 text-white rounded-sm shadow-sm"
              size={28}
            />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Deskripcija:
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Unesite deskripciju"
                className="py-2 w-full"
                name="description"
                required
              />
            </div>
          </div>
          <div className="flex flex-row justify-around gap-4">
            <Button
              type="submit"
              className="w-1/3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
              disabled={loading}
            >
              {loading ? "Kreiranje..." : "Kreiraj"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}