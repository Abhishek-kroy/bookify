import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useFirebase } from "../context/Firebase";
import { toast } from "react-toastify";
import BookCard from "../components/BookCard";
import { motion } from "framer-motion";

const CartPage = () => {
    const { userId } = useParams();
    const { user, authLoading } = useFirebase(); // Get user & auth loading state
    const [cartItems, setCartItems] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const firebase = useFirebase();

    useEffect(() => {
        if (authLoading) return; // Don't fetch cart until auth is ready
    if (!userId || !user) {
            setError("User ID is missing or User not logged in.");
            setLoading(false);
            return;
        }

        const fetchCart = async () => {
            try {
                setLoading(true);
                const fetchedCart = await firebase.getCart();
                if (fetchedCart.success) {
                    setCartItems(fetchedCart.cartItems);
                } else {
                    setError(fetchedCart.error);
                }
            } catch (err) {
                setError("Error fetching cart: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [userId, user, authLoading,firebase]);

    useEffect(() => {
        const getBook = async (bookId) => {
            try {
                const result = await firebase.getBookListingById(bookId);
                if (result.exists) {    
                    return result.data();
                } else {
                    setError("Book not found.");
                    return null;
                }
            } catch (err) {
                setError("Failed to load book details. Please try again later.");
                return null;
            }
        };

        const fetchBooks = async () => {
            // Ensure cartItems are valid and contain bookId
            const validCartItems = cartItems.filter(item => item && item.bookId); // Filter out invalid items
            if (validCartItems.length > 0) {
                const bookPromises = validCartItems.map((item) => getBook(item.bookId));
                const fetchedBooks = await Promise.all(bookPromises);
                const validBooks = fetchedBooks.filter(book => book !== null);
                setBooks(validBooks);
            } else {
                setError("No valid cart items found.");
            }
        };

        if (cartItems.length > 0) {
            fetchBooks();
        }
    }, [cartItems, firebase]);

    const handleRemoveFromCart = async (bookId) => {
        try {
        const result = await firebase.removeFromCart(bookId); // Adjusted to handle both cartId and bookId
            if (result.success) {
                // Update the cartItems state by filtering out the bookId
                setCartItems(prevCartItems => prevCartItems.filter(item => item.bookId !== bookId));
                toast.success("Book removed from cart!");
            } else {
                toast.error("Failed to remove book from cart.");
            }
    } catch (err) {
            toast.error("An error occurred. Please try again.");
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-gray-900 to-black text-white text-2xl">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Loading...
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-gray-900 to-black text-red-500 text-2xl">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {error}
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6 pt-8 mt-[6.5vh]">
            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-bold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
            >
                Cart
            </motion.h2>

            {cartItems.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center text-xl text-gray-500"
                >
                    No items in cart.
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mx-auto max-w-7xl mb-8">
                    {books.map((book, index) => { 
                        // Ensure cartItem is valid and contains bookId
                        const cartItem = cartItems[index];
                        if (!cartItem || !cartItem.bookId) return null; // Skip invalid cart items        

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="relative transform transition-all duration-300 hover:scale-105"
                            >
                                <BookCard book={book} page="Cart" handleRemoveFromCart={handleRemoveFromCart} id={cartItem.bookId} />
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CartPage;