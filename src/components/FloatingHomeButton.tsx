import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';

const FloatingHomeButton = () => {
  const location = useLocation();

  // Don't show on home page or auth pages
  const isHomePage = location.pathname === '/';
  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';
  
  if (isHomePage || isAuthPage) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Link
        to="/"
        className="flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
        title="Go to Home"
      >
        <Home size={24} />
      </Link>
    </div>
  );
};

export default FloatingHomeButton; 