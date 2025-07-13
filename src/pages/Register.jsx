import React, { useState, useEffect } from "react";
import { useFirebase } from "../context/Firebase";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FaGoogle, FaBook, FaShoppingCart, FaBookmark, FaChartLine } from "react-icons/fa";

const RegisterForm = () => {
    const firebase = useFirebase();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
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
        if (!formData.name.trim()) formErrors.name = "Name is required.";
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
                const response = await firebase.signupUserWithEmailAndPassword(
                    formData.email,
                    formData.password
                );
                if (response.success) {
                    // Update user profile with name
                    await firebase.updateUserProfile({
                        displayName: formData.name,
                    });
                    navigate('/');
                } else {
                    alert(`Registration Failed: ${response.message}`);
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
                    {/* Left side - Register Form */}
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
                                    <h2 className="text-3xl font-bold mb-1 text-white">Create Account</h2>
                                    <p className="text-gray-400">Join thousands of book lovers today</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Name Field */}
                                <motion.div variants={itemVariants}>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                                        Full Name
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiUser className="text-gray-500 group-hover:text-blue-400 transition-colors duration-200" />
                                        </div>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            className={`block w-full pl-10 py-3 bg-gray-700 border ${errors.name ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    {errors.name && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-sm text-red-500 mt-1"
                                        >
                                            {errors.name}
                                        </motion.p>
                                    )}
                                </motion.div>

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
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                                        Password
                                    </label>
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
                                        "Create Account"
                                    )}
                                </motion.button>

                                {/* Google Sign Up Button */}
                                <motion.div variants={itemVariants} className="mt-4">
                                    <button
                                        type="button"
                                        onClick={firebase.signinWithGoogle}
                                        className="w-full bg-white text-gray-800 py-3 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition duration-300 flex items-center justify-center shadow-md"
                                    >
                                        <FaGoogle className="mr-2 text-red-500" /> Sign up with Google
                                    </button>
                                </motion.div>

                                <motion.div variants={itemVariants} className="mt-6 text-center">
                                    <p className="text-gray-400">
                                        Already have an account?{" "}
                                        <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium">
                                            Sign in
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
                                        <p className="text-blue-100 text-sm">Find amazing deals or sell your books hassle-free.</p>
                                    </div>
                                </motion.div>

                                {/* Wishlist & Tracking */}
                                <motion.div
                                    variants={itemVariants}
                                    className="flex items-start p-4 bg-blue-800 bg-opacity-30 rounded-xl backdrop-blur-sm border border-blue-700 border-opacity-30 transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-lg mr-4 shadow-md">
                                        <FaBookmark className="text-2xl text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-white">Wishlist & Tracking</h3>
                                        <p className="text-blue-100 text-sm">Save books for later and track your listings easily.</p>
                                    </div>
                                </motion.div>

                                {/* Book Recommendations */}
                                <motion.div
                                    variants={itemVariants}
                                    className="flex items-start p-4 bg-blue-800 bg-opacity-30 rounded-xl backdrop-blur-sm border border-blue-700 border-opacity-30 transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-lg mr-4 shadow-md">
                                        <FaBook className="text-2xl text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-white">Book Recommendations</h3>
                                        <p className="text-blue-100 text-sm">Discover new books based on your reading preferences.</p>
                                    </div>
                                </motion.div>

                                {/* Transaction History */}
                                <motion.div
                                    variants={itemVariants}
                                    className="flex items-start p-4 bg-blue-800 bg-opacity-30 rounded-xl backdrop-blur-sm border border-blue-700 border-opacity-30 transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-lg mr-4 shadow-md">
                                        <FaChartLine className="text-2xl text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-white">Transaction History</h3>
                                        <p className="text-blue-100 text-sm">View your past purchases and sales in one place.</p>
                                    </div>
                                </motion.div>
                            </div>

                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default RegisterForm;
