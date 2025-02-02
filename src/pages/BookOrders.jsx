import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useFirebase } from "../context/Firebase";
import { onValue, ref } from "firebase/database";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FaSpinner, FaExclamationCircle, FaBox, FaCalendarAlt, FaUser, FaBook, FaTimes } from "react-icons/fa";
import { Dialog, DialogOverlay, DialogContent } from "@radix-ui/react-dialog";

const BookOrders = () => {
    const { userId } = useParams();
    const { user, authLoading } = useFirebase();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [bookQuantities, setBookQuantities] = useState({});
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [selectedOrder, setSelectedOrder] = useState(null); // Selected order for status change
    const [newStatus, setNewStatus] = useState(""); // New status for the modal dropdown
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

    const orderStatuses = ["All", "Pending", "Confirming", "Placed", "Shipped", "Delivered"];
    const filteredOrders = selectedStatus === "All" ? orders : orders.filter(order => order.status === selectedStatus);

    const updateOrderStatus = async () => {
        if (!selectedOrder || !newStatus) return;
        try {
            await firebase.updateOrderStatus(selectedOrder.id, newStatus);
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === selectedOrder.id ? { ...order, status: newStatus } : order
                )
            );
            toast.success(`Order status updated to "${newStatus}"`);
            setSelectedOrder(null); // Close modal
            setNewStatus(""); // Clear the new status
        } catch (err) {
            toast.error("Failed to update order status. Please try again.");
        }
    };

    const confirmStatusChange = (order) => {
        setSelectedOrder(order);
        setNewStatus(order.status); // Initialize the dropdown with the current order status
    };

    const closeModal = () => {
        setSelectedOrder(null); // Close the modal when the user clicks the close button
        setNewStatus(""); // Clear the new status
    };

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-900 to-black">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <FaSpinner className="animate-spin text-4xl text-blue-500" />
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-red-500">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <FaExclamationCircle className="text-4xl mb-4" />
                    <p className="text-xl">{error}</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-6 text-white mt-[6.5vh]">
            <h2 className="text-4xl font-bold mb-8 text-center text-blue-400">
                Orders for {firebase.user.displayName}
            </h2>

            {/* Status Filter Tabs */}
            <div className="mb-8">
                <div className="flex flex-wrap justify-center gap-2">
                    {orderStatuses.map((status) => (
                        <motion.button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                                selectedStatus === status
                                    ? "bg-blue-500 text-white shadow-lg"
                                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:shadow-md"
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {status}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Order Cards */}
            {filteredOrders.length === 0 ? (
                <p className="text-center text-gray-400">No orders found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrders.map((order, index) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                            whileHover={{ scale: 1.02 }}
                        >
                            <h3 className="text-xl font-semibold mb-4 flex items-center">
                                <FaBox className="mr-2 text-blue-400" /> Order {index + 1}
                            </h3>
                            <div className="space-y-3">
                                <p className="flex items-center">
                                    <FaBook className="mr-2 text-gray-400" /> <strong>Book Name : </strong> {order.name}
                                </p>
                                <p className="flex items-center">
                                    <FaBox className="mr-2 text-gray-400" /> <strong>Quantity : </strong> {order.Quantity}
                                </p>
                                <p className="flex items-center">
                                    <FaUser className="mr-2 text-gray-400" /> <strong>Buyer : </strong> {order.buyerEmail}
                                </p>
                                <p className="flex items-center">
                                    <FaCalendarAlt className="mr-2 text-gray-400" /> <strong>Purchase Date : </strong> {order.purchaseDate?.toDate().toLocaleString()}
                                </p>
                                <p className="flex items-center">
                                    <FaBox className="mr-2 text-gray-400" /> <strong>Available Stock : </strong> {bookQuantities[order.bookId] || 'N/A'}
                                </p>
                            </div>
                            <div className="mt-4">
                                <label className="block mb-2">Status  :</label>
                                <motion.button
                                    className="w-full p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                                    onClick={() => confirmStatusChange(order)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {`Change Status : ${selectedStatus === 'All' ? order.status : selectedStatus}`}
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal for Confirmation */}
            <AnimatePresence>
                {selectedOrder && (
                    <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                        <DialogOverlay className="fixed inset-0 bg-black/50" />
                        <DialogContent className="fixed inset-0 flex justify-center items-center">
                            <motion.div
                                className="bg-gray-800 p-6 rounded-lg w-11/12 max-w-md"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl text-white">Confirm Status Change</h2>
                                    <FaTimes className="text-white cursor-pointer" onClick={closeModal} />
                                </div>
                                <select
                                    className="w-full p-2 bg-gray-700 text-white rounded-lg mb-4"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                >
                                    {orderStatuses.slice(1).map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                                <button
                                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300"
                                    onClick={updateOrderStatus}
                                >
                                    Confirm
                                </button>
                            </motion.div>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BookOrders;