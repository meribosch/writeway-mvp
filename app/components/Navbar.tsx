'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-playfair font-bold text-purple-700">Writeway</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link 
                  href="/my-stories" 
                  className={`text-gray-600 hover:text-purple-700 font-medium ${pathname === '/my-stories' ? 'text-purple-700' : ''}`}
                >
                  My Stories
                </Link>
                <Link 
                  href="/new-story" 
                  className={`text-gray-600 hover:text-purple-700 font-medium ${pathname === '/new-story' ? 'text-purple-700' : ''}`}
                >
                  New Story
                </Link>
                <Link 
                  href="/profile" 
                  className={`text-gray-600 hover:text-purple-700 font-medium ${pathname === '/profile' ? 'text-purple-700' : ''}`}
                >
                  Profile
                </Link>
                <button 
                  onClick={logout} 
                  className="text-gray-600 hover:text-purple-700 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className={`text-gray-600 hover:text-purple-700 font-medium ${pathname === '/login' ? 'text-purple-700' : ''}`}
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="px-4 py-2 rounded-md bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="text-gray-600 hover:text-purple-700 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-3">
              {user ? (
                <>
                  <Link 
                    href="/my-stories" 
                    className={`text-gray-600 hover:text-purple-700 font-medium ${pathname === '/my-stories' ? 'text-purple-700' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Stories
                  </Link>
                  <Link 
                    href="/new-story" 
                    className={`text-gray-600 hover:text-purple-700 font-medium ${pathname === '/new-story' ? 'text-purple-700' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    New Story
                  </Link>
                  <Link 
                    href="/profile" 
                    className={`text-gray-600 hover:text-purple-700 font-medium ${pathname === '/profile' ? 'text-purple-700' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }} 
                    className="text-gray-600 hover:text-purple-700 font-medium text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className={`text-gray-600 hover:text-purple-700 font-medium ${pathname === '/login' ? 'text-purple-700' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    className="px-4 py-2 rounded-md bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors w-fit"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 