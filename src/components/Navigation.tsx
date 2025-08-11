import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, BarChart3, User, Info, MessageCircle, Menu, X, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hide navigation on auth pages
  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';
  if (isAuthPage) {
    return null;
  }

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Create Quiz', path: '/create-quiz', icon: FileText },
    { name: 'History', path: '/quiz-history', icon: BarChart3 },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: MessageCircle },
  ];
  
  const unauthenticatedNavItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: MessageCircle },
  ];

  const itemsToDisplay = user ? navItems : unauthenticatedNavItems;

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/signin');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="relative border-b border-gray-700 bg-gray-900 backdrop-blur-sm">
      {/* Gradient background for dark mode only */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="group flex items-center space-x-3 transition-transform duration-300 hover:scale-105">
                <div className="relative">
                  <div className="w-10 h-10 flex items-center justify-center">
                  <img src="/favicon.ico" alt="Site icon" className="w-8 h-8" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Quizzer
                  </span>
                  <span className="text-xs text-gray-400 -mt-1">AI Quiz Generator</span>
                </div>
              </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-baseline space-x-2">
              {itemsToDisplay.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`group relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm'
                    }`}
                  >
                    <Icon size={16} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span>{item.name}</span>
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
                    )}
                  </Link>
                );
              })}
              
              <div className="ml-4 pl-4 border-l border-gray-600 flex items-center space-x-2">
                {user ? (
                  <div className="flex items-center space-x-3">
                    <Link to="/profile" className="text-blue-400 font-medium hover:underline text-sm">
                      Welcome, {user.username}
                    </Link>
                    <button onClick={handleLogout} className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-red-600/20 transition-all duration-300 group">
                      <LogOut size={16} className="group-hover:scale-110 transition-transform duration-300" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/signin"
                    className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <LogIn size={16} />
                    <span>Login</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-110"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-700 shadow-xl animate-fade-in">
            <div className="px-4 py-6 space-y-3">
              {itemsToDisplay.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              <div className="pt-4 border-t border-gray-700 flex items-center space-x-2">
                {user ? (
                  <div className="space-y-3">
                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-2 text-blue-400 font-medium hover:underline block">
                      Welcome, {user.username}
                    </Link>
                    <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-red-600/20 transition-all duration-300 w-full">
                      <LogOut size={20} />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/signin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white transition-all duration-300"
                  >
                    <LogIn size={20} />
                    <span>Login</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
