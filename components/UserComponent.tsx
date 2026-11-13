"use client";

import { SessionUser, UserDTO } from '@/lib/dtos';
import { Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import RoleChangeButton from './RoleChangeButton';

function RoleIcon({ role }: { role: string }) {
  switch(role) {
    case 'chef':
      return <span className="text-green-500 text-4xl">○</span>;
    case 'moderator':
      return <span className="text-green-500 text-4xl">●</span>;
    case 'administrator':
      return <span className="text-yellow-500 text-4xl">★</span>;
    case 'sponsor':
      return <span className="text-blue-500 text-4xl">$</span>;
    default:
      return <span className="text-gray-500 text-4xl">○</span>;
  }
}


export default function UserComponent({ user, refreshData }: { user: UserDTO; refreshData: () => void }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  
  function getRoleDisplay(user: UserDTO): string {
    console.log(user)
    if (user.sponsor) return 'sponsor';
    if (user.moderator?.administrator) return 'administrator';
    if (user.moderator) return 'moderator';
    if (user.chefBeginner) return 'chef';
    return 'user';
  }
  
  function handleClick() {
    router.push(`/user/${user.id}`);
  }

  const handleDeleteUser = async (userId: number, e: React.MouseEvent): Promise<void> => {
    e.stopPropagation();
    
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj nalog? Ova akcija je nepovratna!')) {
      return;
    }
    
    if (!isAdmin) {
      alert("Vi ne možete izbrisati ovog korisnika");
      return;
    }
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/user?id=${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Greška pri brisanju naloga');
      }

      alert('Korisnik je uspešno obrisan');
      refreshData(); 
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Došlo je do greške pri brisanju');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const isAdmin = Boolean((session?.user as SessionUser)?.isAdmin);
  const role = getRoleDisplay(user);
  
  return (
    <div onClick={handleClick} className='cursor-pointer'>
      <div className="flex items-center justify-between w-full p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
            <span className="text-gray-600 font-bold text-sm">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </span>
          </div>
          <span className="font-medium">{user.first_name} {user.last_name}</span>
        </div>
        <div className="flex items-center">
          {isAdmin && (
            <button 
              className="mr-3 text-red-500 hover:text-red-700 cursor-pointer p-1"
              onClick={(e) => handleDeleteUser(user.id, e)}
              title="Obriši korisnika"
              disabled={isDeleting}
            >
              {isDeleting ? 'Brisanje...' : <Trash2 size={16} />}
            </button>
          )}
          <RoleIcon role={role} />
          <RoleChangeButton 
            user={user} 
            currentUserIsAdmin={isAdmin} 
            refreshData={refreshData} 
          />
        </div>
      </div>
    </div>
  );
}