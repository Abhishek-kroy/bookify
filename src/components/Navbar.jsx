import React from 'react';
import { useFirebase } from '../context/Firebase';
import { useNavigate, Link } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaBars } from 'react-icons/fa'; // Added FaBars for mobile menu

export const NavbarCom = () => {
  const firebase = useFirebase();
  const navigate = useNavigate();

  // Handle Logout
  const handleLogout = () => {
    firebase.logout()
      .then(() => {
        navigate('/'); // Redirect to homepage after logging out
      })
      .catch((error) => {
        alert(error);
      });
  };

  // Toggle Mobile Menu
  const toggleMobileMenu = () => {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
  };

  return (
    <nav className="bg-gray-900/80 backdrop-blur-md fixed w-full top-0 z-50 border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left Side: Brand Logo */}
          <div className="flex items-center space-x-3">
          <img src="/bookify_icon.png" alt="Bookify Logo" className="h-8 w-8" /> 
            <Link to="/" className="text-2xl font-bold text-white hover:text-blue-400 transition duration-300">
              Bookify
            </Link>
          </div>

          {/* Center: Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-blue-400 transition duration-300">
              Home
            </Link>
            <Link to="/book/list" className="text-gray-300 hover:text-blue-400 transition duration-300">
              Add Listing
            </Link>
            {firebase.user && (
              <>
                <Link to={`/book/order/${firebase.user.uid}`} className="text-gray-300 hover:text-blue-400 transition duration-300">
                  My Orders
                </Link>
                <Link to={`/cart/${firebase.user.uid}`} className="text-gray-300 hover:text-blue-400 transition duration-300">
                  <FaShoppingCart className="inline-block mr-1" /> Cart
                </Link>
              </>
            )}
          </div>

          {/* Right Side: Login/Logout Button */}
          <div className="flex items-center">
            {firebase.user ? (
              <button
                onClick={handleLogout}
                className="flex items-center bg-red-600/90 text-white px-4 py-2 rounded-lg hover:bg-red-700/90 transition duration-300"
              >
                <FaSignOutAlt className="mr-2" /> Logout
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center bg-blue-600/90 text-white px-4 py-2 rounded-lg hover:bg-blue-700/90 transition duration-300"
              >
                <FaUser className="mr-2" /> Login
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              className="text-gray-300 hover:text-blue-400 focus:outline-none"
              onClick={toggleMobileMenu}
            >
              <FaBars className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Hidden by default) */}
      <div id="mobile-menu" className="hidden md:hidden bg-gray-900/95 backdrop-blur-md">
        <div className="px-4 pt-2 pb-3 space-y-1">
          <Link to="/" className="block text-gray-300 hover:text-blue-400 transition duration-300">
            Home
          </Link>
          <Link to="/book/list" className="block text-gray-300 hover:text-blue-400 transition duration-300">
            Add Listing
          </Link>
          {firebase.user && (
            <>
              <Link to={`/book/order/${firebase.user.uid}`} className="block text-gray-300 hover:text-blue-400 transition duration-300">
                My Orders
              </Link>
              <Link to={`/cart/${firebase.user.uid}`} className="block text-gray-300 hover:text-blue-400 transition duration-300">
                <FaShoppingCart className="inline-block mr-1" /> Cart
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavbarCom;