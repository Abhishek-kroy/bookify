import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useFirebase } from "../context/Firebase";
import { toast } from "react-toastify";
import BookCard from "../components/BookCard";
import { motion } from "framer-motion";
import { ShoppingBag, ChevronLeft, AlertTriangle, ShoppingCart } from "lucide-react";

const CartPage = () => {
    const { user, authLoading } = useFirebase();
    const [cartItems, setCartItems] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    // const [isProcessing, setIsProcessing] = useState(false);
    const firebase = useFirebase();
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setError("Please login to view your cart.");
            setLoading(false);
            return;
        }

        const fetchCart = async () => {
            try {
                setLoading(true);
                const fetchedCart = await firebase.getCart();
                if (fetchedCart.success) {
                    setCartItems(fetchedCart.cartItems || []);
                } else {
                    setError(fetchedCart.error || "Failed to load cart items");
                }
            } catch (err) {
                setError("Error fetching cart: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [user, authLoading, firebase]);

    useEffect(() => {
        const fetchBooks = async () => {
            if (!cartItems.length) {
                setBooks([]);
                return;
            }

            try {
                const bookPromises = cartItems.map(item => 
                    firebase.getBookListingById(item.bookId)
                );
                
                const fetchedBooks = await Promise.all(bookPromises);
                const validBooks = fetchedBooks
                    .map((book, index) => book ? {...book, cartItemId: cartItems[index].bookId} : null)
                    .filter(book => book !== null);
                
                setBooks(validBooks);
                
                // Calculate total price
                const total = validBooks.reduce((sum, book) => sum + (book.price || 0), 0);
                setTotalPrice(total);
            } catch (err) {
                console.error("Error fetching books:", err);
                setError("Failed to load book details");
            }
        };

        fetchBooks();
    }, [cartItems, firebase]);

    const handleCheckout = () => {
        toast.info("Checkout feature coming soon!", {
            position: "top-right",
        });
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-gray-900 via-indigo-950 to-purple-950 text-white">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center"
                >
                    <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-400 rounded-full animate-spin mb-4"></div>
                    <p className="text-xl font-medium">Loading your cart items...</p>
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-gray-900 via-indigo-950 to-purple-950 text-white">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center p-8 bg-gray-900/80 backdrop-blur-md rounded-xl shadow-2xl border border-gray-800 max-w-md"
                >
                    <AlertTriangle size={48} className="mb-4 text-amber-500" />
                    <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                    <p className="text-center text-gray-300 mb-6">{error}</p>
                    <Link 
                        to="/"
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition-colors px-6 py-3 rounded-lg shadow-lg"
                    >
                        <ChevronLeft size={18} />
                        Return to Home
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-purple-950 text-white pt-8 pb-16">
            {/* Back navigation */}
            <div className="absolute top-4 left-4 z-10">
                <Link 
                    to="/"
                    className="flex items-center gap-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full transition-all duration-300"
                >
                    <ChevronLeft size={16} />
                    <span>Continue Shopping</span>
                </Link>
            </div>
            
            <div className="container mx-auto px-4 pt-10">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-center gap-3 mb-6"
                >
                    <ShoppingBag size={30} className="text-indigo-400" />
                    <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                        Your Cart
                    </h2>
                </motion.div>

                {cartItems.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900/90 to-indigo-950/80 backdrop-blur-lg border border-gray-800/50 shadow-2xl max-w-2xl mx-auto p-8 text-center"
                    >
                        <ShoppingCart size={64} className="mx-auto mb-4 text-gray-500" />
                        <h3 className="text-2xl font-semibold mb-3">Your cart is empty</h3>
                        <p className="text-gray-400 mb-6">Looks like you haven't added any books to your cart yet.</p>
                        <Link 
                            to="/"
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition-colors px-6 py-3 rounded-lg shadow-lg"
                        >
                            Browse Books
                        </Link>
                    </motion.div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Cart items grid */}
                        <div className="lg:w-2/3">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="rounded-xl overflow-hidden bg-gradient-to-br from-gray-900/90 to-indigo-950/80 backdrop-blur-lg border border-gray-800/50 shadow-2xl p-6"
                            >
                                <h3 className="text-xl font-semibold mb-4">Cart Items ({books.length})</h3>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {books.map((book, index) => (
                                        <motion.div
                                            key={book.cartItemId || index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: index * 0.05 }}
                                            className="relative transform transition-all duration-300 hover:scale-105"
                                        >
                                            <BookCard 
                                                book={book} 
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                        
                        {/* Order summary */}
                        <div className="lg:w-1/3">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="rounded-xl sticky top-8 overflow-hidden bg-gradient-to-br from-gray-900/90 to-indigo-950/80 backdrop-blur-lg border border-gray-800/50 shadow-2xl p-6"
                            >
                                <h3 className="text-xl font-semibold mb-6">Order Summary</h3>
                                
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Subtotal</span>
                                        <span>${totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Shipping</span>
                                        <span>$4.99</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Tax</span>
                                        <span>${(totalPrice * 0.07).toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-gray-700 pt-4 flex justify-between font-bold">
                                        <span>Total</span>
                                        <span className="text-xl">${(totalPrice + 4.99 + totalPrice * 0.07).toFixed(2)}</span>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-colors py-3 rounded-lg font-medium shadow-lg flex items-center justify-center gap-2"
                                >
                                    Proceed to Checkout
                                </button>
                                
                                <div className="mt-6 text-gray-400 text-sm">
                                    <p className="mb-2">We accept:</p>
                                    <div className="flex gap-2">
                                        <div className="bg-gray-800 rounded px-2 py-1">Visa</div>
                                        <div className="bg-gray-800 rounded px-2 py-1">Mastercard</div>
                                        <div className="bg-gray-800 rounded px-2 py-1">PayPal</div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;