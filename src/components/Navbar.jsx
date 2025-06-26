import { useState } from 'react';
import { useFirebase } from '../context/Firebase';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingCart,
  User,
  LogOut,
  Menu,
  Heart,
  BookOpen,
  Settings,
  Book,
} from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { authLoading, user, logout } = useFirebase();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout()
      .then(() => navigate('/'))
      .catch((error) => console.error('Logout error:', error));
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-gray-900/80 backdrop-blur-md fixed w-full top-0 z-50 border-b border-gray-800/50 mb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-3"
          >
            <motion.div whileHover={{ rotate: 10, scale: 1.1 }} transition={{ duration: 0.3 }}>
              <img src="/bookify_icon.png" alt="Bookify Logo" className="h-8 w-8" />
            </motion.div>
            <Link
              to="/"
              className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 transition duration-300"
            >
              Bookify
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {[
              { name: 'Home', path: '/' },
              { name: 'Books', path: '/books' },
              ...(user
                ? [
                    { name: 'Orders', path: `/orders/${user.uid}` },
                    { name: 'Add Listing', path: '/book/list' },
                  ]
                : []),
            ].map((item, index) => (
              <motion.div key={index} whileHover={{ y: -2 }} transition={{ duration: 0.3 }}>
                <Link
                  to={item.path}
                  className="text-gray-300 hover:text-blue-400 transition duration-300 relative group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden md:flex items-center space-x-4">
                <motion.div whileHover={{ scale: 1.1 }}>
                  <Link
                    to={`/cart/${user.uid}`}
                    className="text-gray-300 hover:text-blue-400 relative"
                  >
                    <ShoppingCart size={20} />
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                      2
                    </span>
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Login / Logout Button */}
            {user ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-800 transition duration-300 shadow-md"
              >
                <LogOut size={18} className="mr-2" /> Logout
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition duration-300 shadow-md"
              >
                <User size={18} className="mr-2" /> Login
              </motion.button>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="text-gray-300 hover:text-blue-400 focus:outline-none"
                onClick={toggleMobileMenu}
              >
                <Menu size={24} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: mobileMenuOpen ? 'auto' : 0, opacity: mobileMenuOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="md:hidden bg-gray-900/95 backdrop-blur-md overflow-hidden border-t border-gray-800/30"
      >
        <div className="px-6 py-4 space-y-3">
          {[
            { name: 'Home', path: '/', icon: <BookOpen size={18} className="mr-3" /> },
            { name: 'Books', path: '/books', icon: <Book size={18} className="mr-3" /> },
            { name: 'Categories', path: '/categories', icon: <Settings size={18} className="mr-3" /> },
            ...(user
              ? [{ name: 'Add Listing', path: '/book/list', icon: <BookOpen size={18} className="mr-3" /> }]
              : []),
          ].map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="flex items-center text-gray-300 hover:text-blue-400 transition duration-300 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}

          {user && (
            <>
              <div className="border-t border-gray-800/30 my-2"></div>
              <Link
                to="/favorites"
                className="flex items-center text-gray-300 hover:text-pink-400 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart size={18} className="mr-3" />
                Favorites
                <span className="ml-auto bg-pink-500 text-white text-xs px-2 py-1 rounded-full">3</span>
              </Link>
              <Link
                to={`/cart/${user.uid}`}
                className="flex items-center text-gray-300 hover:text-blue-400 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingCart size={18} className="mr-3" />
                Cart
                <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">2</span>
              </Link>
              <Link
                to={`/book/order/${user.uid}`}
                className="flex items-center text-gray-300 hover:text-blue-400 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingCart size={18} className="mr-3" />
                My Orders
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;