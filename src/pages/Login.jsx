import React, { useState, useEffect } from "react";
import { useFirebase } from "../context/Firebase";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FaBook, FaChartBar, FaShoppingCart, FaHeart } from "react-icons/fa";

const LoginForm = () => {
  const firebase = useFirebase();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (firebase.isLoggedIn) {
      navigate('/');
    }
  }, [firebase.isLoggedIn, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    let formErrors = {};
    if (!formData.email.trim()) formErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      formErrors.email = "Email is invalid.";
    if (!formData.password.trim())
      formErrors.password = "Password is required.";
    else if (formData.password.length < 6)
      formErrors.password = "Password must be at least 6 characters.";
    return formErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length === 0) {
      setIsLoading(true);
      try {
        const response = await firebase.signInUserWithEmailAndPassword(
          formData.email,
          formData.password
        );
        if (response.success) {
          navigate('/');
        } else {
          alert(`Login Failed: ${response.message}`);
        }
      } catch (error) {
        // alert("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(formErrors);
    }
  };

  // Animation variants
  const formVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 }
  };

  const featureVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { staggerChildren: 0.15, delayChildren: 0.4 }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl bg-gray-800 rounded-2xl shadow-2xl overflow-hidden relative"
      >
        {/* Card effect */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-br from-blue-900 to-indigo-900 transform -skew-x-12 origin-top-right -mr-32 z-0"></div>
        
        <div className="flex flex-col md:flex-row relative z-10">
          {/* Left side - Login Form */}
          <div className="w-full md:w-1/2 p-8 md:p-10">
            <motion.div
              initial="initial"
              animate="animate"
              variants={formVariants}
              className="w-full max-w-md mx-auto"
            >
              <div className="flex items-center mb-8">
                <motion.div
                  initial={{ rotate: -20, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <FaBook className="text-4xl text-blue-500 mr-3" />
                </motion.div>
                <div>
                  <h2 className="text-3xl font-bold mb-1 text-white">Welcome Back</h2>
                  <p className="text-gray-400">Sign in to continue your reading journey</p>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="text-gray-500 group-hover:text-blue-400 transition-colors duration-200" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`block w-full pl-10 py-3 bg-gray-700 border ${errors.email ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  {errors.email && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 mt-1"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </motion.div>

                {/* Password Field */}
                <motion.div variants={itemVariants}>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                      Password
                    </label>
                    <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-500 group-hover:text-blue-400 transition-colors duration-200" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      className={`block w-full pl-10 pr-10 py-3 bg-gray-700 border ${errors.password ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FiEyeOff className="text-gray-400 hover:text-white transition-colors duration-200" />
                      ) : (
                        <FiEye className="text-gray-400 hover:text-white transition-colors duration-200" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 mt-1"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center font-medium"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Sign In"
                  )}
                </motion.button>

                <motion.div variants={itemVariants} className="mt-6 text-center">
                  <p className="text-gray-400">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium">
                      Create account
                    </Link>
                  </p>
                </motion.div>
              </form>
            </motion.div>
          </div>
          
          {/* Right side - Features */}
          <div className="w-full md:w-1/2 p-8 md:p-10 flex items-center justify-center relative z-10">
            <motion.div
              initial="initial"
              animate="animate"
              variants={featureVariants}
              className="w-full max-w-md"
            >
              <motion.div 
                variants={itemVariants}
                className="mb-8"
              >
                <h2 className="text-3xl font-bold text-white mb-3">Bookify Features</h2>
                <p className="text-blue-100">
                  Join thousands of readers who are organizing their libraries and discovering new books.
                </p>
              </motion.div>

              <div className="space-y-4">
      {/* Buy & Sell Books */}
      <motion.div
        variants={itemVariants}
        className="flex items-start p-4 bg-blue-800 bg-opacity-30 rounded-xl backdrop-blur-sm border border-blue-700 border-opacity-30 transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
      >
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-lg mr-4 shadow-md">
          <FaShoppingCart className="text-2xl text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Buy & Sell Books</h3>
          <p className="text-blue-100 text-sm">Easily buy and sell books within the community.</p>
        </div>
      </motion.div>

      {/* Book Recommendations */}
      <motion.div
        variants={itemVariants}
        className="flex items-start p-4 bg-blue-800 bg-opacity-30 rounded-xl backdrop-blur-sm border border-blue-700 border-opacity-30 transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
      >
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-lg mr-4 shadow-md">
          <FaChartBar className="text-2xl text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Smart Recommendations</h3>
          <p className="text-blue-100 text-sm">Get personalized book suggestions based on your reading preferences.</p>
        </div>
      </motion.div>

      {/* Wishlist & Favorites */}
      <motion.div
        variants={itemVariants}
        className="flex items-start p-4 bg-blue-800 bg-opacity-30 rounded-xl backdrop-blur-sm border border-blue-700 border-opacity-30 transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
      >
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-lg mr-4 shadow-md">
          <FaHeart className="text-2xl text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Wishlist & Favorites</h3>
          <p className="text-blue-100 text-sm">Save books you want to read or purchase later.</p>
        </div>
      </motion.div>
    </div>

              <motion.div 
                variants={itemVariants}
                className="mt-8"
              >
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)" }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 flex items-center justify-center"
                  >
                    Create a free account →
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginForm;