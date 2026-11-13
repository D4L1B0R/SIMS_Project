"use client";

import { Cat, X } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { Category, Heaviness } from "@/lib/models/enums";
import { useRouter, useSearchParams } from "next/navigation";

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterModal({ onClose, isOpen }: FiltersModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    heaviness: "",
    startNumber: "",
    endNumber: "",
    startTime: "",
    endTime: "",
  });

  const portionNumberOptions = [
    { value: "", label: "Sve" },
    { value: "0", label: "0" },
    { value: "5", label: "5" },
    { value: "10", label: "10" },
    { value: "15", label: "15" },
    { value: "20", label: "20" },
  ];

  const preparationTimeOptions = [
    { value: "", label: "Sve" },
    { value: "0", label: "0 min" },
    { value: "5", label: "5 min" },
    { value: "10", label: "10 min" },
    { value: "15", label: "15 min" },
    { value: "20", label: "20 min" },
    { value: "25", label: "25 min" },
    { value: "30", label: "30 min" },
    { value: "35", label: "35 min" },
    { value: "40", label: "40 min" },
  ];

  const categoryLabels: Record<Category, string> = {
    [Category.BREAKFAST]: "Doručak",
    [Category.LUNCH]: "Ručak",
    [Category.DINNER]: "Večera",
    [Category.DESSERT]: "Dezert",
    [Category.DRINK]: "Piće",
    [Category.SNACK]: "Užina"
  };

  const heavinessLabels: Record<Heaviness, string> = {
    [Heaviness.LIGHT]: "Lako",
    [Heaviness.MEDIUM]: "Srednje",
    [Heaviness.HEAVY]: "Teško",
  };


  useEffect(() => {
    if (isOpen) {
      setFormData({
        category: searchParams.get("category") || "",
        heaviness: searchParams.get("heaviness") || "",
        startNumber: searchParams.get("startNumber") || "",
        endNumber: searchParams.get("endNumber") || "",
        startTime: searchParams.get("startTime") || "",
        endTime: searchParams.get("endTime") || "",
      });
    }
  }, [isOpen, searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      Object.entries(formData).forEach(([key, value]) => {
        if (value && value !== "") {
          params.set(key, value);
        }
      });

      router.push(`/?${params.toString()}`);
      handleClose();
    } catch (error) {
      setError("Greška pri primeni filtera!");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFormData({
      category: "",
      heaviness: "",
      startNumber: "",
      endNumber: "",
      startTime: "",
      endTime: "",
    });
    router.push("/");
    handleClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Filteri</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Zatvori"
          >
            <X
              className="bg-red-600 text-white rounded-sm shadow-sm hover:bg-red-700 transition-colors"
              size={28}
            />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategorija:
              </label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sve kategorije</option>
                {Object.values(Category).map((value) => (
                  <option key={value} value={value}>
                    {categoryLabels[value as Category]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Težina pripreme:
              </label>
              <select 
                name="heaviness"
                value={formData.heaviness}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sve težine</option>
                {Object.values(Heaviness).map((value) => (
                  <option key={value} value={value}>
                    {heavinessLabels[value as Heaviness]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Broj porcija:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <select 
                    name="startNumber"
                    value={formData.startNumber}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {portionNumberOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-gray-500 mt-1 block">Od</span>
                </div>
                <div>
                  <select 
                    name="endNumber"
                    value={formData.endNumber}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {portionNumberOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-gray-500 mt-1 block">Do</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vreme pripreme (min):
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <select 
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {preparationTimeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-gray-500 mt-1 block">Od</span>
                </div>
                <div>
                  <select 
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {preparationTimeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-gray-500 mt-1 block">Do</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={clearFilters}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Obriši filtere
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              disabled={loading}
            >
              {loading ? "Primenjivanje..." : "Primeni filtere"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}