"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { X, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  callbackUrl?: string;
}

export default function LoginModal({ isOpen, onClose, callbackUrl }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && callbackUrl) {
      // Ako želiš odmah da preusmeriš posle uspešnog signina, ostavi ovde logiku
      // Ovde zasad samo čistimo eventualni callback iz URL-a
      history.replaceState(null, "", "/");
    }
  }, [isOpen, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("signin", {
        email,
        password,
        redirect: false,
        // callbackUrl se može proslediti ako koristiš NextAuth redirect
        // callbackUrl: callbackUrl || "/"
      });

      if (result?.error) {
        setError("Pogrešni podaci za prijavu");
      } else {
        history.replaceState(null, "", "/");
        onClose();
      }
    } catch {
      setError("Došlo je do greške pri prijavi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Prijavljivanje</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700" aria-label="Zatvori">
            <X className="bg-red-600 text-white rounded-sm shadow-sm" size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Mejl adresa:</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="email"
                placeholder="Unesite vašu mejl adresu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 pr-4 py-2 w-full"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Lozinka:</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Unesite vašu lozinku"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-12 py-2 w-full"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Sakrij lozinku" : "Prikaži lozinku"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex flex-row justify-around gap-4">
            <Button variant="default" className="w-1/3" type="button">
              Nisam robot
            </Button>
            <Button
              type="submit"
              className="w-1/3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
              disabled={isLoading}
            >
              {isLoading ? "Prijavljivanje..." : "Prijavi se"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
