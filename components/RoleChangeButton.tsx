"use client";

import { useState } from 'react';
import { UserDTO } from '@/lib/dtos';

interface RoleChangeButtonProps {
  user: UserDTO;
  currentUserIsAdmin: boolean;
  refreshData: () => void;
}

export default function RoleChangeButton({ user, currentUserIsAdmin, refreshData }: RoleChangeButtonProps) {
  const [isChanging, setIsChanging] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [privilegedUser, setPrivilegedUser] = useState(false);
  const [pib, setPib] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserIsAdmin) {
      alert('Samo administratori mogu da menjaju uloge');
      return;
    }
    setShowModal(true);
  };

  const handleRoleChange = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!currentUserIsAdmin) {
      alert('Samo administratori mogu da menjaju uloge');
      return;
    }

    setIsChanging(true);
    try {
      const body: any = {
        userId: user.id,
        role: selectedRole
      };

      if (selectedRole === 'chefBeginner') {
        body.privileged_user = privilegedUser;
      }

      if (selectedRole === 'sponsor') {
        body.pib = pib;
        body.company_name = companyName;
      }

      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        alert('Uloga je uspešno promenjena');
        setShowModal(false);
        refreshData(); 
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Greška pri promeni uloge');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Došlo je do greške');
    } finally {
      setIsChanging(false);
    }
  };

  const handleCloseModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(false);
    setSelectedRole('');
    setPrivilegedUser(false);
    setPib('');
    setCompanyName('');
  };

  if (!currentUserIsAdmin) return null;

  return (
    <>
      <button
        onClick={handleButtonClick} 
        className="ml-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
      >
        Promeni ulogu
      </button>

      {showModal && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleCloseModal} 
        >
          <div 
            className="bg-white p-6 rounded-lg w-96"
            onClick={(e) => e.stopPropagation()} 
          >
            <h3 className="text-lg font-bold mb-4">Promeni ulogu za {user.first_name} {user.last_name}</h3>
            
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full p-2 border rounded mb-3"
            >
              <option value="">Izaberi ulogu</option>
              <option value="chefBeginner">Kuvar</option>
              <option value="moderator">Moderator</option>
              <option value="administrator">Administrator</option>
              <option value="sponsor">Sponzor</option>
            </select>

            {selectedRole === 'chefBeginner' && (
              <label className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={privilegedUser}
                  onChange={(e) => setPrivilegedUser(e.target.checked)}
                  className="mr-2"
                />
                Privilegovani kuvar
              </label>
            )}

            {selectedRole === 'sponsor' && (
              <>
                <input
                  type="text"
                  placeholder="PIB"
                  value={pib}
                  onChange={(e) => setPib(e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Naziv kompanije"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-2 border rounded mb-3"
                  required
                />
              </>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={handleCloseModal}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                disabled={isChanging}
              >
                Otkaži
              </button>
              <button
                onClick={handleRoleChange}
                disabled={isChanging || !selectedRole || (selectedRole === 'sponsor' && (!pib || !companyName))}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isChanging ? 'Menjanje...' : 'Promeni'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}