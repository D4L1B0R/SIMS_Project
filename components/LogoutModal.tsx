"use client";

import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  const router = useRouter();
  
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    onConfirm();
    router.push('/');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray rounded-lg w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Odjava</h2>
          <p className="text-gray-600 mb-6">Da li ste sigurni da želite da se odjavite?</p>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Otkaži
            </Button>
            <Button
              variant="destructive"
              onClick={handleSignOut}
            >
              Odjavi se
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}