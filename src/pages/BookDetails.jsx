import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useFirebase } from '../context/Firebase';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, ShoppingCart, Star, Clock, Package, Award, 
  ShoppingBag, X, AlertTriangle, Check, ChevronLeft, ChevronRight,
  Heart, Share, CreditCard, MapPin, ArrowLeft
} from 'lucide-react';
import { onValue, ref } from "firebase/database";

const BookDetails = () => {
    const { bookId } = useParams();
    const firebase = useFirebase();
    const [book, setBook] = useState(null);
    const [quantity, setQuantity] = useState(0);
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [addedToCart, setAddedToCart] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [cartProcessing, setCartProcessing] = useState(false);
    const [isInCart, setIsInCart] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isWishlist, setIsWishlist] = useState(false);

    // Check if the book is in cart on initial load
    useEffect(() => {
        const checkCartStatus = async () => {
            if (!firebase?.user?.uid || !bookId) return;
            
            try {
                const cartData = await firebase.getCart();
                if (cartData.success && cartData.cartItems) {
                    const isBookInCart = cartData.cartItems.some(item => item.bookId === bookId);
                    setAddedToCart(isBookInCart);
                    setIsInCart(isBookInCart);
                }
            } catch (error) {
                console.error("Error checking cart status:", error);
            }
        };
        
        checkCartStatus();
    }, [firebase, bookId]);

    useEffect(() => {
        if (!bookId) {
            setError("Book ID is missing.");
            setLoading(false);
            return;
        }

        const fetchBookDetails = async () => {
            try {
                const result = await firebase.getBookListingById(bookId);
                if (result) {
                    setBook(result);
                    setLoading(false);
                } else {
                    setError("Book not found.");
                    setLoading(false);
                }
            } catch (err) {
                setError("Failed to load book details. Please try again later.");
                setLoading(false);
            }
        };

        fetchBookDetails();

        if (!firebase?.realtimeDB) {
            return;
        }

        const quantityRef = ref(firebase.realtimeDB, `bookQuantity/${bookId}`);
        const unsubscribe = onValue(quantityRef, (snapshot) => {
            if (snapshot.exists()) {
                const newQuantity = snapshot.val();
                setQuantity(newQuantity);
                
                // Adjust selectedQuantity if it exceeds available quantity
                if (selectedQuantity > newQuantity) {
                    setSelectedQuantity(Math.max(1, newQuantity));
                }
            }
        }, (error) => {
            console.error("Error fetching quantity:", error);
        });

        return () => unsubscribe();
    }, [bookId, firebase, selectedQuantity]);

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value) || 1;
        setSelectedQuantity(Math.min(Math.max(1, value), quantity));
    };

    const handleAddToCart = async () => {
        if (cartProcessing) return;
        
        setCartProcessing(true);

        try {
            const res = await firebase.addToCart(bookId);

            if (res.success) {
                toast.success("Added to cart!", {
                    icon: <ShoppingCart size={18} />,
                    position: "top-right",
                });
                setAddedToCart(true);
                setIsInCart(true);
            } else {
                toast.info(res.message, {
                    position: "top-right",
                });
            }
        } catch (error) {
            toast.error("Failed to add to cart. Please try again.", {
                icon: <AlertTriangle size={18} />,
                position: "top-right",
            });
        } finally {
            setCartProcessing(false);
        }
    };

    const handleRemoveFromCart = async () => {
        if (cartProcessing) return;
        
        setCartProcessing(true);

        try {
            const res = await firebase.removeFromCart(bookId);

            if (res.success) {
                toast.success("Removed from cart!", {
                    icon: <X size={18} />,
                    position: "top-right",
                });
                setAddedToCart(false);
                setIsInCart(false);
            } else {
                toast.info(res.message, {
                    position: "top-right",
                });
            }
        } catch (error) {
            toast.error("Failed to remove from cart. Please try again.", {
                icon: <AlertTriangle size={18} />,
                position: "top-right",
            });
        } finally {
            setCartProcessing(false);
        }
    };

    const handlePurchaseClick = () => {
        if (selectedQuantity <= 0) {
            toast.error("Please select at least 1 book.", {
                icon: <AlertTriangle size={18} />,
                position: "top-right",
            });
            return;
        }
        
        if (selectedQuantity > quantity) {
            toast.error("Not enough stock available.", {
                icon: <AlertTriangle size={18} />,
                position: "top-right",
            });
            return;
        }

        setIsConfirming(true);
    };

    const handlePurchase = async () => {
        setPlacingOrder(true);

        // Call `confirmPurchase` from Firebase context
        const response = await firebase.confirmPurchase(bookId, selectedQuantity, book.name, book.price);

        if (response.success) {
            toast.success(response.message, {
                icon: <Check size={18} />,
                position: "top-right",
            });
        } else {
            toast.error(response.message, {
                icon: <AlertTriangle size={18} />,
                position: "top-right",
            });
        }

        setPlacingOrder(false);
        setIsConfirming(false);
    };

    const toggleWishlist = () => {
        setIsWishlist(!isWishlist);
        toast.success(isWishlist ? "Removed from wishlist" : "Added to wishlist", {
            position: "top-right",
        });
    };

    const handleImageNavigation = (direction) => {
        if (!book?.coverPics?.length) return;
        
        if (direction === 'next') {
            setCurrentImageIndex((prev) => (prev + 1) % book.coverPics.length);
        } else {
            setCurrentImageIndex((prev) => (prev - 1 + book.coverPics.length) % book.coverPics.length);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center"
                >
                    <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-400 rounded-full animate-spin mb-4"></div>
                    <p className="text-xl font-medium">Loading your literary adventure...</p>
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-red-400">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center p-8 bg-gray-900/80 backdrop-blur-md rounded-xl shadow-2xl border border-gray-800"
                >
                    <AlertTriangle size={48} className="mb-4 text-amber-500" />
                    <h2 className="text-2xl font-bold mb-2">Oh no! A plot twist...</h2>
                    <p className="text-xl">{error}</p>
                    <button 
                        onClick={() => window.history.back()}
                        className="mt-6 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300 text-white px-6 py-3 rounded-lg shadow-lg"
                    >
                        <ArrowLeft size={18} />
                        Back to Bookshelf
                    </button>
                </motion.div>
            </div>
        );
    }

    const renderStarRating = (rating = 4.5) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={`star-${i}`} fill="#FFD700" color="#FFD700" size={18} />);
        }
        
        if (hasHalfStar) {
            stars.push(
                <div key="half-star" className="relative">
                    <Star fill="none" color="#FFD700" size={18} />
                    <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
                        <Star fill="#FFD700" color="#FFD700" size={18} />
                    </div>
                </div>
            );
        }
        
        const emptyStars = 5 - stars.length;
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Star key={`empty-star-${i}`} fill="none" color="#FFD700" size={18} />);
        }
        
        return (
            <div className="flex items-center gap-1">
                {stars}
                <span className="ml-2 text-amber-400 font-semibold">{rating} <span className="text-sm text-gray-400">(243 reviews)</span></span>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-purple-950 text-white">
        {/* <div className="mt-10 bg-gradient-to-b from-gray-900 via-gray-800 to-black"></div> */}
            {/* Back navigation */}
            <div className="relative top-20 left-4 z-10">
                <button 
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full transition-all duration-300"
                >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                </button>
            </div>
            
            <div className="container mx-auto px-4 pt-16 pb-12">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900/90 to-indigo-950/80 backdrop-blur-lg border border-gray-800/50 shadow-2xl"
                >
                    <div className="flex flex-col lg:flex-row">
                        {/* Book Cover Section */}
                        <div className="lg:w-2/5 relative overflow-hidden bg-gradient-to-br from-indigo-900/30 to-purple-900/30">
                            <div className="relative h-full min-h-96 lg:min-h-full flex items-center justify-center p-8">
                                {book?.coverPics?.length > 0 ? (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.7 }}
                                        className="w-full h-full relative"
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <motion.img
                                                key={currentImageIndex}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.5 }}
                                                src={book.coverPics[currentImageIndex].url}
                                                alt={`${book.name} - Cover`}
                                                className="max-h-96 lg:max-h-128 object-contain rounded-lg shadow-2xl"
                                            />
                                        </div>
                                        
                                        {/* Image navigation buttons */}
                                        {book.coverPics.length > 1 && (
                                            <>
                                                <button 
                                                    onClick={() => handleImageNavigation('prev')}
                                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full transition-all"
                                                >
                                                    <ChevronLeft size={24} />
                                                </button>
                                                <button 
                                                    onClick={() => handleImageNavigation('next')}
                                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full transition-all"
                                                >
                                                    <ChevronRight size={24} />
                                                </button>
                                                
                                                {/* Image pagination dots */}
                                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                                    {book.coverPics.map((_, index) => (
                                                        <button 
                                                            key={index}
                                                            onClick={() => setCurrentImageIndex(index)}
                                                            className={`w-2 h-2 rounded-full transition-all ${
                                                                currentImageIndex === index 
                                                                    ? 'bg-white w-4' 
                                                                    : 'bg-white/50'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-8 bg-gray-800/50 rounded-xl">
                                        <BookOpen size={64} className="text-gray-500 mb-4" />
                                        <p className="text-gray-400 text-center">No cover image available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Book Details Section */}
                        <div className="lg:w-3/5 p-8">
                            <div className="flex flex-col h-full">
                                {/* Header with title and actions */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <motion.h1 
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.2 }}
                                            className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
                                        >
                                            {book?.name || 'Untitled Work'}
                                        </motion.h1>
                                        
                                        <div className="flex gap-2">
                                            <motion.button 
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.3, delay: 0.4 }}
                                                onClick={toggleWishlist}
                                                className={`p-2 rounded-full transition-all ${
                                                    isWishlist
                                                        ? 'bg-pink-500/20 text-pink-500'
                                                        : 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-pink-400'
                                                }`}
                                            >
                                                <Heart size={20} fill={isWishlist ? "#ec4899" : "none"} />
                                            </motion.button>
                                            
                                            <motion.button 
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.3, delay: 0.5 }}
                                                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-indigo-400 transition-all"
                                            >
                                                <Share size={20} />
                                            </motion.button>
                                        </div>
                                    </div>
                                    
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5, delay: 0.3 }}
                                        className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4"
                                    >
                                        <p className="text-lg text-gray-300">by <span className="font-semibold text-indigo-300">{book?.author || 'Unknown Author'}</span></p>
                                        {renderStarRating()}
                                    </motion.div>
                                    
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5, delay: 0.4 }}
                                        className="flex flex-wrap gap-2 mt-2"
                                    >
                                        <span className="px-3 py-1 bg-indigo-900/60 text-indigo-300 rounded-full text-sm">
                                            {book?.category || 'Fiction'}
                                        </span>
                                        <span className="px-3 py-1 bg-purple-900/60 text-purple-300 rounded-full text-sm">
                                            Bestseller
                                        </span>
                                    </motion.div>
                                </div>
                                
                                {/* Price and Availability */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.5 }}
                                    className="mb-6 flex items-center justify-between"
                                >
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold text-white">${book?.price || '0.00'}</span>
                                            {book?.originalPrice && (
                                                <span className="text-lg text-gray-400 line-through">${book.originalPrice}</span>
                                            )}
                                        </div>
                                        {book?.originalPrice && (
                                            <div className="text-green-400 text-sm font-medium">
                                                Save ${(book.originalPrice - book.price).toFixed(2)} ({Math.round((1 - book.price/book.originalPrice) * 100)}% off)
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className={`px-4 py-1 rounded-full text-sm font-medium 
                                        ${quantity > 10 
                                            ? 'bg-green-900/60 text-green-300' 
                                            : quantity > 0 
                                                ? 'bg-amber-900/60 text-amber-300' 
                                                : 'bg-red-900/60 text-red-300'}`}
                                    >
                                        {quantity > 10 
                                            ? 'In Stock' 
                                            : quantity > 0 
                                                ? `Only ${quantity} left` 
                                                : 'Out of Stock'}
                                    </div>
                                </motion.div>
                                
                                {/* Book metadata */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.6 }}
                                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
                                >
                                    <div className="flex items-center gap-2">
                                        <Package size={16} className="text-indigo-400" />
                                        <div>
                                            <p className="text-xs text-gray-400">Publication</p>
                                            <p className="text-sm">{book?.publicationYear || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Award size={16} className="text-indigo-400" />
                                        <div>
                                            <p className="text-xs text-gray-400">ISBN</p>
                                            <p className="text-sm">{book?.isbn || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-indigo-400" />
                                        <div>
                                            <p className="text-xs text-gray-400">Delivery</p>
                                            <p className="text-sm">2-3 business days</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-indigo-400" />
                                        <div>
                                            <p className="text-xs text-gray-400">Ships To</p>
                                            <p className="text-sm">Nationwide</p>
                                        </div>
                                    </div>
                                </motion.div>
                                
                                {/* Description */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.7 }}
                                    className="mb-6"
                                >
                                    <h3 className="text-lg font-semibold mb-2">About this book</h3>
                                    <p className="text-gray-300 leading-relaxed">
                                        {book?.description || 'No description available for this book.'}
                                    </p>
                                </motion.div>
                                
                                {/* Quantity Selector */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.8 }}
                                    className="mb-6"
                                >
                                    <div className="flex items-center gap-4">
                                        <label className="text-sm font-medium">Quantity:</label>
                                        <div className="flex items-center">
                                            <button 
                                                onClick={() => setSelectedQuantity(prev => Math.max(1, prev - 1))}
                                                className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-l-lg transition-colors"
                                                disabled={selectedQuantity <= 1}
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                max={quantity}
                                                value={selectedQuantity}
                                                onChange={handleQuantityChange}
                                                className="w-12 h-8 bg-gray-800 border-x border-gray-700 text-center text-white"
                                            />
                                            <button 
                                                onClick={() => setSelectedQuantity(prev => Math.min(quantity, prev + 1))}
                                                className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-r-lg transition-colors"
                                                disabled={selectedQuantity >= quantity}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                                
                                {/* Action Buttons */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.9 }}
                                    className="mt-auto flex flex-col sm:flex-row gap-4"
                                >
                                    <motion.button
                                        whileHover={{ scale: placingOrder ? 1 : 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handlePurchaseClick}
                                        disabled={placingOrder || quantity === 0}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-base font-medium shadow-lg transition-all ${
                                            placingOrder || quantity === 0
                                                ? 'bg-gray-700 cursor-not-allowed opacity-70'
                                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-900/30'
                                        }`}
                                    >
                                        {placingOrder ? (
                                            <>
                                                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard size={18} />
                                                Buy Now
                                            </>
                                        )}
                                    </motion.button>

                                    <AnimatePresence mode="wait">
                                        {!addedToCart ? (
                                            <motion.button
                                                key="add-to-cart"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                whileHover={{ scale: cartProcessing ? 1 : 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleAddToCart}
                                                disabled={cartProcessing || quantity === 0}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-base font-medium transition-all ${
                                                    cartProcessing || quantity === 0
                                                        ? 'bg-gray-700 cursor-not-allowed opacity-70'
                                                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-900/30'
                                                }`}
                                            >
                                                {cartProcessing ? (
                                                    <>
                                                        <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                                                        Adding...
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingCart size={18} />
                                                        Add to Cart
                                                    </>
                                                )}
                                            </motion.button>
                                        ) : (
                                            <motion.button
                                                key="remove-from-cart"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                whileHover={{ scale: cartProcessing ? 1 : 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleRemoveFromCart}
                                                disabled={cartProcessing}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-base font-medium transition-all ${
                                                    cartProcessing
                                                        ? 'bg-gray-700 cursor-not-allowed opacity-70'
                                                        : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-lg shadow-rose-900/30'
                                                }`}
                                            >
                                                {cartProcessing ? (
                                                    <>
                                                        <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                                                        Removing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <X size={18} />
                                                        Remove from Cart
                                                    </>
                                                )}
                                            </motion.button>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Purchase Confirmation Modal */}
            <AnimatePresence>
                {isConfirming && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gradient-to-br from-gray-900 to-indigo-950 border border-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6"
                        >
                            <h3 className="text-xl font-bold mb-4 text-center">Confirm Purchase</h3>
                            
                            <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-300">Book:</span>
                                    <span className="font-medium">{book?.name}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-300">Quantity:</span>
                                    <span className="font-medium">{selectedQuantity}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-300">Price per unit:</span>
                                    <span className="font-medium">${book?.price}</span>
                                </div>
                                <div className="border-t border-gray-700 my-2"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Total:</span>
                                    <span className="font-bold text-lg">${(book?.price * selectedQuantity).toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsConfirming(false)}
                                    className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePurchase}
                                    disabled={placingOrder}
                                    className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
                                        placingOrder
                                            ? 'bg-indigo-700 cursor-not-allowed'
                                            : 'bg-indigo-600 hover:bg-indigo-500'
                                    } transition-colors`}
                                >
                                    {placingOrder ? (
                                        <>
                                            <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        'Confirm Purchase'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BookDetails;