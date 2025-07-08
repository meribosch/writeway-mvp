'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-playfair font-bold text-purple-600">
          Writeway
        </Link>
        
        <div className="flex space-x-6 items-center">
          <Link 
            href="/" 
            className={`nav-link ${pathname === '/' ? 'nav-link-active' : ''}`}
          >
            Home
          </Link>
          
          {user ? (
            <>
              <Link 
                href="/my-stories" 
                className={`nav-link ${pathname === '/my-stories' ? 'nav-link-active' : ''}`}
              >
                My Stories
              </Link>
              
              <Link 
                href="/new-story" 
                className={`nav-link ${pathname === '/new-story' ? 'nav-link-active' : ''}`}
              >
                Write Story
              </Link>
              
              {isAdmin && (
                <Link 
                  href="/admin" 
                  className={`nav-link ${pathname === '/admin' ? 'nav-link-active' : ''}`}
                >
                  Admin
                </Link>
              )}
              
              <div className="flex items-center space-x-3 ml-2">
                <span className="text-sm text-gray-600 font-medium">
                  {user.username}
                </span>
                <button 
                  onClick={logout}
                  className="btn-secondary text-sm"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className={`nav-link ${pathname === '/login' ? 'nav-link-active' : ''}`}
              >
                Login
              </Link>
              
              <Link 
                href="/register" 
                className="btn-primary"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 