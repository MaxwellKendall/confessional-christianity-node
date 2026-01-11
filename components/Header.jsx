import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faChild, faSignOutAlt, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const UserAvatar = ({ user, onClick, isOpen }) => {
  const [imgError, setImgError] = useState(false);
  
  const getInitial = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '?';
  };

  useEffect(() => {
    setImgError(false)
  }, [user?.user_metadata?.avatar_url])

  const avatarUrl = user.user_metadata.avatar_url || user.user_metadata.picture;
  const showImage = avatarUrl && !imgError;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      {showImage ? (
        <img
          src={avatarUrl}
          alt="User avatar"
          className="w-9 h-9 rounded-full object-cover border-2 border-gray-200"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={(e) => {
            console.log('Error loading avatar image', e);
            setImgError(true)
          }}
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-white font-semibold text-sm border-2 border-amber-600">
          {getInitial()}
        </div>
      )}
      <FontAwesomeIcon 
        icon={faChevronDown} 
        className={`text-gray-500 text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
  );
};

const DropdownMenu = ({ isOpen, onClose, onSignOut, dropdownRef }) => {
  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50"
    >
      <Link
        href="/dashboard"
        onClick={onClose}
        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <FontAwesomeIcon icon={faChild} className="text-gray-400 w-4" />
        <span className="text-sm">Dashboard</span>
      </Link>
      <div className="border-t border-gray-100 my-1" />
      <button
        onClick={onSignOut}
        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
      >
        <FontAwesomeIcon icon={faSignOutAlt} className="text-gray-400 w-4" />
        <span className="text-sm">Sign Out</span>
      </button>
    </div>
  );
};

const Header = ({ showAuthLinks = true }) => {
  const { user, loading, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);

  const handleSignOut = async () => {
    try {
      setIsDropdownOpen(false);
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="w-full bg-white border-b border-gray-100">
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
              <div className="relative" ref={containerRef}>
                <UserAvatar 
                  user={user} 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  isOpen={isDropdownOpen}
                />
                <DropdownMenu
                  isOpen={isDropdownOpen}
                  onClose={() => setIsDropdownOpen(false)}
                  onSignOut={handleSignOut}
                  dropdownRef={dropdownRef}
                />
              </div>
            ) : (
              <Link 
                href="/auth/signin"
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                Sign In
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
