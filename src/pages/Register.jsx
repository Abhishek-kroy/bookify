import React, { useEffect, useState } from "react";
import { useFirebase } from "../context/Firebase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const RegisterForm = () => {
    const firebase = useFirebase();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (firebase.isLoggedIn) {
            navigate('/');
        }
    }, [firebase.isLoggedIn, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
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
                    alert("User Registered Successfully!");
                    setFormData({ name: "", email: "", password: "" });
                } else {
                    alert(`Registration Failed: ${response.message}`);
                }
            } catch (error) {
                alert("An unexpected error occurred.");
            } finally {
                setIsLoading(false);
            }
        } else {
            setErrors(formErrors);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black py-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-white border-opacity-20"
            >
                <h2 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    Register User
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Field */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        
                    >
                        <label htmlFor="name" className="block text-sm font-medium mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className={`w-full p-3 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-300 ${
                                errors.name ? "border border-red-500" : ""
                            }`}
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter Your Name"
                        />
                        {errors.name && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-sm mt-2"
                            >
                                {errors.name}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Email Field */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <label htmlFor="email" className="block text-sm font-medium mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className={`w-full p-3 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-300 ${
                                errors.email ? "border border-red-500" : ""
                            }`}
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter Your Email"
                        />
                        {errors.email && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-sm mt-2"
                            >
                                {errors.email}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Password Field */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <label htmlFor="password" className="block text-sm font-medium mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                className={`w-full p-3 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-300 ${
                                    errors.password ? "border border-red-500" : ""
                                }`}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter Your Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-white"
                            >
                                {showPassword ? "" : ""}
                            </button>
                        </div>
                        {errors.password && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-sm mt-2"
                            >
                                {errors.password}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Submit Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition duration-300 flex items-center justify-center"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            "Register"
                        )}
                    </motion.button>
                </form>

                {/* Separator */}
                <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-white border-opacity-20"></div>
                    <span className="mx-4 text-sm text-white">OR</span>
                    <div className="flex-grow border-t border-white border-opacity-20"></div>
                </div>

                {/* Google Signup Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={firebase.signinWithGoogle}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-lg hover:from-red-600 hover:to-pink-700 transition duration-300 flex items-center justify-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.344-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
                    </svg>
                    Sign Up with Google
                </motion.button>
            </motion.div>
        </div>
    );
};

export default RegisterForm;