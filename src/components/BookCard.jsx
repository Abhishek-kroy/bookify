import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Book, ShoppingCart, Heart, Eye } from 'lucide-react';
import { useFirebase } from "../context/Firebase";

const BookCard = ({ book}) => {
    console.log(book);
    const navigate = useNavigate();
    const firebase = useFirebase();
    const [isHovered, setIsHovered] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    // Extract the URL from coverPics array
    const coverPicUrl = book.coverPics && book.coverPics.length > 0 ? book.coverPics[0].url : "https://via.placeholder.com/150";
    const bookId = book.id  || "default-id";  // Fallback for missing book.id

    // Calculate discount percentage if there's an original price
    const hasDiscount = book.originalPrice && book.originalPrice > book.price;
    const discountPercentage = hasDiscount ? Math.round((1 - book.price / book.originalPrice) * 100) : 0;

    useEffect(() => {
        // Check if the book is already in favorites
        // setIsFavorite(firebase.getCart().some(fav => fav.id === bookId));
        
        const gettingCart = async () => {
            try {
                const cart = await firebase.getCart();
                const cartItems = cart.cartItems || [];
                console.log("cartItems:", cartItems);
                
                const isInfavorites = cartItems.some(fav => {
                    console.log(fav.bookId, " ", book.id);
                    return fav.bookId === book.id; // Ensure the function returns a value
                });
        
                console.log("isInfavorites:", isInfavorites);
                setIsFavorite(isInfavorites);
        
                console.log("cartItems:", cartItems);
            } catch (error) {
                console.error("Error fetching cart:", error);
            }
        };        
        gettingCart();
    }, [firebase, bookId]);

    return (
        <motion.div 
            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ 
                y: -5,
                boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)",
                transition: { duration: 0.2 } 
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative overflow-hidden">
                {/* Book Cover */}
                <img
                    src={coverPicUrl}
                    alt={book.name}
                    className="w-full h-64 object-cover transform transition-transform duration-500 hover:scale-110"
                />
                
                {/* Discount Badge */}
                {hasDiscount && (
                    <div className="absolute top-0 left-0 bg-red-500 text-white px-3 py-1 rounded-br-lg font-semibold">
                        {discountPercentage}% OFF
                    </div>
                )}
                
                {/* Quick Action Buttons */}
                <motion.div 
                    className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-3 opacity-0 transition-opacity duration-300"
                    animate={{ opacity: isHovered ? 1 : 0 }}
                >
                    <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-gray-800 p-2 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
                        onClick={() => navigate(`/book/view/${bookId}`)}
                    >
                        <Eye size={20} />
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-gray-800 p-2 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
                        onClick={() => setIsFavorite(!isFavorite)}
                    >
                        <Heart size={20} className={isFavorite ? "fill-red-500 text-red-500" : ""} />
                    </motion.button>
                </motion.div>
            </div>

            <div className="p-4">
                {/* Book Category */}
                <div className="flex items-center mb-2">
                    <Book size={16} className="text-blue-500 mr-1" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{book.category || "Fiction"}</span>
                </div>

                {/* Book Title */}
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white line-clamp-2 h-14">{book.name}</h3>
                
                {/* Book Author */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 italic">
                    by {book.author}
                </p>

                {/* Book Price */}
                <div className="flex items-center mb-4">
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">${book.price}</span>
                    {hasDiscount && (
                        <span className="ml-2 text-sm text-gray-500 line-through">${book.originalPrice}</span>
                    )}
                </div>

                {/* Book Details */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>
                        <strong>Language:</strong> {book.language}
                    </span>
                    <span className="flex items-center">
                        <strong>Rating:</strong> 
                        <div className="ml-1 flex">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-sm ${i < (book.rating || 4) ? "text-yellow-400" : "text-gray-300"}`}>★</span>
                            ))}
                        </div>
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate(`/book/view/${bookId}`)}
                        className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-md hover:from-blue-600 hover:to-blue-800 transition-all flex items-center justify-center"
                    >
                        <Eye size={18} className="mr-2" />
                        View Details
                    </motion.button>
                    
                    {isFavorite ? (
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={async () => { await firebase.removeFromCart(book); setIsFavorite(false); console.log(book)}}
                            
                            className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-md hover:from-red-600 hover:to-red-800 transition-all flex items-center justify-center"
                        >
                            <ShoppingCart size={18} className="mr-2" />
                                Remove From Cart
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-md hover:from-green-600 hover:to-green-800 transition-all flex items-center justify-center"
                            onClick={async () => { await firebase.addToCart(book); setIsFavorite(true);}}
                        >
                            <ShoppingCart size={18} className="mr-2" />
                                Add to Cart
                        </motion.button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default BookCard;