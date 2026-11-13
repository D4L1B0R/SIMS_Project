"use client";

import { useState, FormEvent, useEffect } from 'react';
import { Search, X, Menu, FilterIcon, ListFilter} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SessionProvider, useSession } from 'next-auth/react';
import LoginModal from '@/components/LoginModal';
import RegisterModal from '@/components/RegisterModal';
import LogoutModal from '@/components/LogoutModal';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { SessionUser } from '@/lib/dtos';
import FilterModal from './FilterModal';
import { Category, Heaviness } from '@/lib/models/enums';

export interface Filters {
  category: Category;
  heaviness: Heaviness;
  startTime: number;
  endTime: number;
  startNumber: number;
  endNumber: number;
}

function NavbarContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters | null>(null)

  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const userId = (session.data?.user as SessionUser)?.id;

  const isModerator = Boolean((session.data?.user as SessionUser)?.isModerator);
  const isAdmin = Boolean((session.data?.user as SessionUser)?.isAdmin);
  const isSponsor = Boolean((session.data?.user as SessionUser)?.isSponsor);
  
  useEffect(() => {
    const search = searchParams.get('search') || '';

    const category = searchParams.get('category') as Category;
    const heaviness = searchParams.get('heaviness') as Heaviness;
    const startTime = parseInt(searchParams.get('startTime') as string) || 0;
    const endTime = parseInt(searchParams.get('startTime') as string) || 0;
    const startNumber = parseInt(searchParams.get('startTime') as string) || 0;
    const endNumber = parseInt(searchParams.get('startTime') as string) || 0;

    setSearchQuery(search);
    setFilters({ category, heaviness, startTime, endTime, startNumber, endNumber})
  }, [searchParams]);

  useEffect(() => {
    if (pathname !== '/') return;
    
    const debounceTimer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      } else {
        params.delete('search');
      }
      
      router.replace(`/?${params.toString()}`, { scroll: false });
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, pathname, router, searchParams]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    
    if (pathname === '/') {
      return;
    } else {
      const params = new URLSearchParams();

      // filters && Object.entries(filters).forEach(([key, value]) => {
      //   if(value != null && value !== undefined && value !== "")
      //     params.set(key, String(value));
      //   else
      //     params.delete(key);
      // });

      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }

      // console.log(params, "????");

      router.push(`/?${params.toString()}`);
    }
  };

  const handleLogin = () => {
    setShowLoginModal(true);
  };
  
  const handleRegister = () => {
    setShowRegisterModal(true);
  };
  
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleFilters = () => {
    setShowFiltersModal(true);
  }
  
  const closeModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
    setShowLogoutModal(false);
    setShowFiltersModal(false);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
  };
  
  return (
    <>
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 py-3 md:py-0 md:h-16">
          
          <div className="flex flex-row justify-between items-center w-full md:w-auto">
            
            <div className="md:flex-shrink-0">
              {session.status === "authenticated" ? (
                isAdmin ? (
                  <Link
                    href="/administrator"
                    className="text-xl font-medium text-gray-900"
                  >
                    ADMIN
                  </Link>
                ) : isModerator ? (
                  <Link
                    href="/moderator"
                    className="text-xl font-medium text-gray-900"
                  >
                    MODERATOR
                  </Link>
                ) : isSponsor?(
                  <Link
                    href="/sponsor"
                    className="text-xl font-medium text-gray-900"
                  >
                    SPONZOR
                  </Link>
                ):(
                  <Link
                    href={userId ? `/user/${userId}` : "#"}
                    className="text-xl font-medium text-gray-900"
                  >
                    KORISNIK
                  </Link>
                )
              ) : (
                <p className="text-xl font-medium text-gray-900">GOST</p>
              )}
            </div>


            <div className="max-w-xs md:flex-1 md:max-w-sm mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  className="pl-10 pr-4 py-2 w-full"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            <ListFilter onClick={handleFilters}/>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>

          <div className={`flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto ${isMenuOpen ? 'flex' : 'hidden md:flex'}`}>
            {session.status === "authenticated" ? (
              <>
                <Button variant="secondary" className="w-auto md:w-auto" onClick={handleLogout}>
                  Odjava
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-auto md:w-auto" 
                  onClick={() => {
                    if (window.location.pathname === '/' && window.location.search === '') {
                      return;
                    }
                    router.push('/');
                  }}
                >
                  <X className="h-4 w-4" size={24} />
                </Button>
              </>
            ) : (
              <>
                <Button className="w-auto md:w-auto" onClick={handleRegister}>
                  Registracija
                </Button>
                <Button variant="secondary" className="w-auto md:w-auto" onClick={handleLogin}>
                  Prijavljivanje
                </Button>
              </>
            )}
          </div>

        </div>

      </div>
    </nav>
      <LoginModal 
          isOpen={showLoginModal} 
          onClose={closeModals}
        />
        
        <RegisterModal 
          isOpen={showRegisterModal} 
          onClose={closeModals}
        />
        
        <LogoutModal 
          isOpen={showLogoutModal} 
          onClose={closeModals}
          onConfirm={handleLogoutConfirm}
        />

        <FilterModal
          isOpen={showFiltersModal}
          onClose={closeModals}
        /> 
    </>
  );
}

export default function Navbar() {
  return (
      <NavbarContent />
  );
}