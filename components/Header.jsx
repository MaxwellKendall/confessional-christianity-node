import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faChild, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const Header = ({ showAuthLinks = true }) => {
  const { user, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 mb-4">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <span className="cursor-pointer text-lg font-medium">
            Confessional Christianity
          </span>
        </Link>
        
        {showAuthLinks && (
          <nav className="flex items-center gap-4">
            {loading ? (
              <FontAwesomeIcon icon={faSpinner} spin className="text-gray-400" />
            ) : user ? (
              <>
                <Link 
                  href="/dashboard"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
                >
                  <FontAwesomeIcon icon={faChild} />
                  <span className="hidden sm:inline">My Children</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/signin"
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup"
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
