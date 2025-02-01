import { Facebook, Twitter, Instagram, ArrowUp } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <div className="flex flex-col">
            {/* Footer */}
            <footer className="bg-gray-900 text-white pt-12 pb-8">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        {/* Left Side - Logo & Description */}
                        <div className="flex flex-col space-y-4">
                            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                                Bookify
                            </h2>
                            <p className="text-gray-400 text-sm">
                                Your go-to platform for discovering and sharing books. Explore, connect, and enjoy the world of literature.
                            </p>
                        </div>

                        {/* Center - Quick Links */}
                        <div className="flex flex-col space-y-4">
                            <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
                            {["Home", "About", "Contact", "Privacy"].map((item, index) => (
                                <motion.a
                                    key={index}
                                    href="#"
                                    whileHover={{ scale: 1.05 }}
                                    className="text-gray-300 hover:text-white transition"
                                >
                                    {item}
                                </motion.a>
                            ))}
                        </div>

                        {/* Sitemap or Additional Links */}
                        <div className="flex flex-col space-y-4">
                            <h3 className="text-lg font-semibold mb-2">Resources</h3>
                            {["Blog", "FAQs", "Careers", "Terms of Service"].map((item, index) => (
                                <motion.a
                                    key={index}
                                    href="#"
                                    whileHover={{ scale: 1.05 }}
                                    className="text-gray-300 hover:text-white transition"
                                >
                                    {item}
                                </motion.a>
                            ))}
                        </div>

                        {/* Right Side - Newsletter & Social Media Links */}
                        <div className="flex flex-col space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Subscribe to our Newsletter</h3>
                                <form className="flex flex-col space-y-4">
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="p-2 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                                    >
                                        Subscribe
                                    </button>
                                </form>
                            </div>

                            <div className="flex space-x-4">
                                {[Facebook, Twitter, Instagram].map((Icon, index) => (
                                    <motion.a
                                        key={index}
                                        href="#"
                                        whileHover={{ scale: 1.2 }}
                                        className="text-gray-300 hover:text-white transition"
                                    >
                                        <Icon size={24} />
                                    </motion.a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-800 my-6"></div>

                    {/* Bottom Section - Copyright & Back to Top */}
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <p className="text-gray-400 text-sm text-center md:text-left">
                            © 2025 Bookify. All rights reserved.
                        </p>

                        {/* Back to Top Button */}
                        <motion.button
                            onClick={scrollToTop}
                            whileHover={{ scale: 1.1 }}
                            className="flex items-center text-gray-300 hover:text-white transition mt-4 md:mt-0"
                        >
                            <ArrowUp size={20} className="mr-2" />
                            Back to Top
                        </motion.button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Footer;