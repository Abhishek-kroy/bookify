import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useFirebase } from '../context/Firebase';
import Carousel from 'react-bootstrap/Carousel';
import { toast } from 'react-toastify';
import { onValue, ref } from "firebase/database";
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';

const BookDetails = () => {
    const { bookId } = useParams();
    const firebase = useFirebase();
    const [book, setBook] = useState(null);
    const [quantity, setQuantity] = useState(0);
    const [selectedQuantity, setSelectedQuantity] = useState(1); // Initialize with default value of 1
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [addedToCart, setAddedToCart] = useState(false); // Ensure a proper default value
    const [isConfirming, setIsConfirming] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [cartProcessing, setCartProcessing] = useState(false);

    useEffect(() => {
        if (!bookId) {
            setError("Book ID is missing.");
            setLoading(false);
            return;
        }

        firebase.getBookListingById(bookId)
            .then((result) => {
                if (result.exists) {
                    setBook(result.data());
                    setLoading(false);
                } else {
                    setError("Book not found.");
                    setLoading(false);
                }
            })
            .catch(() => {
                setError("Failed to load book details. Please try again later.");
                setLoading(false);
            });

        if (!firebase?.realtimeDB) {
            return;
        }

        const quantityRef = ref(firebase.realtimeDB, `bookQuantity/${bookId}`);
        const unsubscribe = onValue(quantityRef, (snapshot) => {
            if (snapshot.exists()) {
                setQuantity(snapshot.val());
            }
        }, (error) => {
        });

        return () => unsubscribe();
    }, [bookId, firebase]);

    if (loading) {
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

    const handleAddToCart = async () => {

        setCartProcessing(true);

        const res = await firebase.addToCart(bookId);

        if (res.success) {
            toast.success("Added the book to the cart!");
            setAddedToCart(true); // Book is now in the cart
        } else {
            toast.info(res.message);
            setAddedToCart(true); // Book is now in the cart
        }
        setCartProcessing(false);
    };

    const handleRemoveToCart = async () => {
        setCartProcessing(true);
        const res = await firebase.removeFromCart(bookId);

        if (res.success) {
            toast.success("Removed the book from the cart!");
            setAddedToCart(false); // Book is no longer in the cart
        } else {
            toast.info(res.message);
        }
        setCartProcessing(false);
    };

    const handlePurchaseClick = () => {
        if (selectedQuantity <= 0 || selectedQuantity == null) {
            toast.error("Please select at least 1 book.");
            return;
        }
        if (selectedQuantity > quantity) {
            toast.error("Not enough stock available.");
            return;
        }

        setIsConfirming(true);
    };

    const confirmPurchase = async (confirmed) => {
        if (!confirmed) {
            setIsConfirming(false);
            return;
        }

        setPlacingOrder(true);

        try {
            await firebase.purchaseWithId(bookId, selectedQuantity,book.name);
            await firebase.reduceBookQuantity(bookId, selectedQuantity);
            toast.success(`Your order for ${selectedQuantity} book(s) has been placed successfully!`);
        } catch (error) {
            toast.error("There was an error placing your order. Please try again.");
        }

        setPlacingOrder(false);
        setIsConfirming(false);
    };

    return (
        <div className="min-h-screen p-6 bg-gradient-to-b from-gray-900 to-black text-white mt-[6.5vh]">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Image Carousel */}
                <div className="flex-1 h-[100vh]">
                    {book?.coverPics?.length > 0 ? (
                        <Carousel ride="carousel" interval={2000} indicators={true} fade>
                            {book.coverPics.map((pic, index) => (
                                <Carousel.Item key={index} className="h-[84vh] flex items-center justify-center">
                                    <img
                                        className="w-full h-[84vh] object-cover rounded-lg shadow-md"
                                        src={pic.url}
                                        alt={`Cover ${index + 1}`}
                                    />
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    ) : (
                        <div className="text-center p-8 text-xl text-gray-500">No Cover Image Available</div>
                    )}
                </div>

                {/* Details Section */}
                <div className="flex-1 space-y-6 p-6 bg-gray-800/50 backdrop-blur-md rounded-xl shadow-lg">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
                    >
                        {book?.name || 'Title Not Available'}
                    </motion.h2>
                    <p className="text-lg text-gray-300">{book?.author ? `by ${book.author}` : 'Author Not Available'}</p>

                    {/* Book Metadata */}
                    <div className="grid grid-cols-2 gap-4 text-gray-300">
                        <div>
                            <p className="text-sm font-medium">Category:</p>
                            <p className="text-base">{book?.category || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">ISBN:</p>
                            <p className="text-base">{book?.isbn || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Language:</p>
                            <p className="text-base">{book?.language || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Publication Year:</p>
                            <p className="text-base">{book?.publicationYear || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Stock Available:</p>
                            <p className="text-base">{quantity}</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-400">Description:</p>
                        <p className="text-base text-gray-300">{book?.description || 'No Description Available'}</p>
                    </div>

                    {/* Price */}
                    <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        Price: ${book?.price || 'N/A'}
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-4">
                        <label className="text-lg text-gray-300">Quantity:</label>
                        <input
                            type="number"
                            min="1"
                            max={quantity}
                            value={selectedQuantity}
                            onChange={(e) => setSelectedQuantity(Math.min(Math.max(1, Number(e.target.value)), quantity))}
                            className="w-16 text-center p-2 rounded bg-gray-700 border border-gray-600 text-white"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col justify-start gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handlePurchaseClick}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition duration-300"
                        >
                            {placingOrder ? 'Processing...' : 'Buy Now'}
                        </motion.button>

                        {!addedToCart ? (
                            <motion.button
                                whileHover={{ scale: cartProcessing ? 1 : 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleAddToCart}
                                disabled={cartProcessing} // Prevent multiple clicks
                                className={`px-6 py-3 rounded-lg transition duration-300 
            ${cartProcessing ? 'bg-gray-600 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white'}`}
                            >
                                {cartProcessing ? "Adding to Cart..." : "Add To Cart"}
                            </motion.button>
                        ) : (
                            <motion.button
                                whileHover={{ scale: cartProcessing ? 1 : 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleRemoveToCart}
                                disabled={cartProcessing} // Prevent multiple clicks
                                className={`px-6 py-3 rounded-lg transition duration-300 
            ${cartProcessing ? 'bg-gray-600 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white'}`}
                            >
                                {cartProcessing ? "Removing from Cart..." : "Remove From Cart"}
                            </motion.button>
                        )}

                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {isConfirming && (
                <div className="z-10 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-800 p-6 rounded-lg shadow-lg text-white"
                    >
                        <h2 className="text-2xl font-bold mb-4">Confirm Purchase</h2>
                        <p>Are you sure you want to buy {selectedQuantity} book(s)?</p>
                        <div className="mt-4 flex justify-end gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => confirmPurchase(false)}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-300"
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => confirmPurchase(true)}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition duration-300"
                            >
                                Confirm
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default BookDetails;