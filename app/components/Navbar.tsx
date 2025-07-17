'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useAIAssistant } from '../context/AIAssistantContext';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { openAIAssistant } = useAIAssistant();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Get display name (first name + last name, or username if not available)
  const displayName = user ? 
    (user.first_name || user.last_name) ? 
      `${user.first_name || ''} ${user.last_name || ''}`.trim() : 
      user.username : 
    '';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-purple">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-inter font-bold bg-gradient-purple text-transparent bg-clip-text">Writeway</span>
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
                <button
                  onClick={() => openAIAssistant()}
                  className={`text-gray-600 hover:text-purple-700 font-medium flex items-center`}
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Master WrAIter
                </button>
                <Link 
                  href="/profile" 
                  className={`flex items-center text-gray-600 hover:text-purple-700 font-medium ${pathname === '/profile' ? 'text-purple-700' : ''}`}
                >
                  {user.profile_image_url ? (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
                      <Image 
                        src={user.profile_image_url}
                        alt="Profile" 
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="32px"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mr-2">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {displayName}
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
                  className="btn-modern px-4 py-2"
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
                  {user.profile_image_url ? (
                    <div className="flex items-center mb-2">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
                        <Image 
                          src={user.profile_image_url}
                          alt="Profile" 
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="32px"
                        />
                      </div>
                      <span className="font-medium text-gray-800">{displayName}</span>
                    </div>
                  ) : (
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mr-2">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{displayName}</span>
                    </div>
                  )}
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
                  <button
                    onClick={() => {
                      openAIAssistant();
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-600 hover:text-purple-700 font-medium flex items-center"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Master WrAIter
                  </button>
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
                    className="btn-modern px-4 py-2 w-fit"
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