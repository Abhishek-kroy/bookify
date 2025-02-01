import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useFirebase } from "../context/Firebase";
import { onValue, ref } from "firebase/database";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const BookOrders = () => {
    const { userId } = useParams();
    const { user, authLoading } = useFirebase();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [bookQuantities, setBookQuantities] = useState({});
    const firebase = useFirebase();


    useEffect(() => {
        if (authLoading) return;
        if (!userId || !user) {
            setError("User ID is missing or User not logged in.");
            setLoading(false);
            return;
        }

        const fetchOrders = async () => {
            try {
                setLoading(true);
                const fetchedOrders = await firebase.getOrdersByEmail(user.email);
                setOrders(fetchedOrders || []);
            } catch (err) {
                setError("Error fetching orders: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [userId, user, authLoading, firebase]);

    useEffect(() => {
        const listeners = orders.map((order) => {
            const quantityRef = ref(firebase.realtimeDB, `bookQuantity/${order.bookId}`);
            const unsubscribe = onValue(quantityRef, (snapshot) => {
                const quantity = snapshot.val();
                setBookQuantities((prevQuantities) => ({
                    ...prevQuantities,
                    [order.bookId]: quantity ?? 'N/A',
                }));
            });
            return unsubscribe;
        });

        return () => {
            listeners.forEach((unsubscribe) => unsubscribe());
        };
    }, [orders, firebase.realtimeDB]);

    // Function to update order status
    const updateOrderStatus = async (orderId, newStatus) => {
        if (!firebase) {
            toast.error("Unexpected error. Please try again.");
            return;
        }
    
        try {
            await firebase.updateOrderStatus(orderId, newStatus);
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId && order.status !== newStatus
                        ? { ...order, status: newStatus }
                        : order
                )
            );
    
            toast.success(`Order status updated to "${newStatus}"`);
        } catch (err) {
            toast.error("Failed to update order status. Please try again.");
        }
    };    

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-gray-900 to-black text-white text-2xl font-sans">
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
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-gray-900 to-black text-red-500 text-2xl font-sans">
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
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-6 text-white mt-[6.5vh]">
            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
            >
                Orders for {firebase.user.displayName}
            </motion.h2>

            {orders.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center text-xl text-gray-500"
                >
                    No orders found.
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map((order, index) => {
                        const { id, bookId, Quantity, buyerEmail, purchaseDate, status } = order || {};
                        const availableQuantity = bookQuantities[bookId] || 'N/A';

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
                            >
                                <h3 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                                    Order {index + 1}
                                </h3>
                                <div className="space-y-3">
                                    <p className="text-gray-300"><strong>Book ID:</strong> {bookId || 'N/A'}</p>
                                    <p className="text-gray-300"><strong>Quantity Ordered:</strong> {Quantity || 'N/A'}</p>
                                    <p className="text-gray-300"><strong>Buyer Email:</strong> {buyerEmail || 'N/A'}</p>
                                    <p className="text-gray-300"><strong>Purchase Date:</strong> {purchaseDate?.toDate().toLocaleString() || 'N/A'}</p>
                                    <p className="text-gray-300"><strong>Available Stock:</strong> {availableQuantity}</p>
                                    
                                    {/* Order Status Dropdown */}
                                    <div className="flex items-center space-x-3">
                                        <strong className="text-gray-300">Status:</strong>
                                        <select
                                            className="bg-gray-700 text-white p-2 rounded-lg cursor-pointer"
                                            value={status}
                                            onChange={(e) => updateOrderStatus(id, e.target.value)}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Confirming">Confirming</option>
                                            <option value="Placed">Placed</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BookOrders;