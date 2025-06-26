import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-toastify';
import {
  Package,
  Calendar,
  User,
  Book,
  Search,
  RefreshCw,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
  ShoppingBag,
  Edit3,
  X,
  Mail,
  Box,
  BarChart3,
  ArrowUpRight,
  Settings,
  ChevronDown,
  Zap,
  ShoppingCart,
  Tag,
  DollarSign,
  Info,
  Hash,
  CreditCard
} from "lucide-react";
import { ref, onValue } from "firebase/database";
import { useFirebase } from "../context/Firebase";

const BookOrders = () => {
  const [sortBy, setSortBy] = useState("newest");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getOrdersByEmail, user, authLoading, realtimeDB, updateOrderStatus } = useFirebase();
  const userId = user?.uid;

  useEffect(() => {
    if (authLoading) return;
    if (!userId || !user) {
      setError("Please log in to view your orders.");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const fetchedOrders = await getOrdersByEmail(user.email);
        setOrders(fetchedOrders || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Error fetching orders: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId, user, authLoading, getOrdersByEmail]);

  const orderStatuses = [
    { value: "All", label: "All Orders", color: "bg-blue-600", icon: Package },
    { value: "Pending", label: "Pending", color: "bg-yellow-500", icon: Clock },
    { value: "Confirming", label: "Confirming", color: "bg-blue-400", icon: AlertCircle },
    { value: "Placed", label: "Placed", color: "bg-indigo-500", icon: CheckCircle },
    { value: "Shipped", label: "Shipped", color: "bg-blue-500", icon: Truck },
    { value: "Delivered", label: "Delivered", color: "bg-green-500", icon: CheckCircle }
  ];

  const getStatusConfig = (status) => {
    return orderStatuses.find(s => s.value === status) || orderStatuses[0];
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === "All" || order.status === selectedStatus;
    const matchesSearch = searchTerm === "" ||
      order.bookName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.purchaseDate) - new Date(a.purchaseDate);
      case "oldest":
        return new Date(a.purchaseDate) - new Date(b.purchaseDate);
      case "quantity":
        return b.quantity - a.quantity;
      case "name":
        return a.bookName.localeCompare(b.bookName);
      default:
        return 0;
    }
  });

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    try {
      await updateOrderStatus(selectedOrder.orderId, newStatus);
      setOrders(prev => prev.map(o => 
        o.orderId === selectedOrder.orderId ? {...o, status: newStatus} : o
      ));
      toast.success(`Order status updated to "${newStatus}"`);
      setSelectedOrder(null);
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Failed to update order status");
    }
  };

  const refreshOrders = async () => {
    setIsRefreshing(true);
    try {
      const fetchedOrders = await getOrdersByEmail(user.email);
      setOrders(fetchedOrders || []);
      toast.success("Orders refreshed!");
    } catch (err) {
      toast.error("Failed to refresh orders");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Statistics calculation
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "Pending").length,
    delivered: orders.filter(o => o.status === "Delivered").length,
    totalQuantity: orders.reduce((sum, order) => sum + (order.quantity || 0), 0),
    totalValue: orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full"
          />
          <p className="text-white text-xl font-semibold">Loading your orders...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8"
        >
          <AlertCircle className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-blue-400 mb-2">Error Loading Orders</h2>
          <p className="text-blue-300">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshOrders}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center mx-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 pt-20 pb-10">
      {/* Floating Action Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="fixed bottom-8 right-8 z-40"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.href = '/books'}
          className="p-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center"
        >
          <ShoppingCart className="w-6 h-6 text-white" />
          <span className="sr-only">Browse Books</span>
        </motion.button>
      </motion.div>

      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              whileHover={{ rotate: 10 }}
              className="p-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded-2xl mr-4 shadow-lg"
            >
              <ShoppingBag className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent"
            >
              My Orders
            </motion.h1>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-blue-200 text-lg"
          >
            Welcome back, <span className="text-blue-300 font-semibold">{user?.displayName || 'Guest'}</span>!
          </motion.p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            { label: "Total Orders", value: stats.total, icon: Package, color: "from-blue-500 to-blue-400" },
            { label: "Pending", value: stats.pending, icon: Clock, color: "from-yellow-500 to-yellow-400" },
            { label: "Delivered", value: stats.delivered, icon: CheckCircle, color: "from-green-500 to-green-400" },
            { label: "Total Value", value: stats.totalValue ? `$${stats.totalValue.toLocaleString()}` : "$0", icon: DollarSign, color: "from-blue-600 to-blue-500" }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-blue-900/50 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-6 hover:border-blue-400/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-300 font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Controls Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-900/50 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-6 mb-8 shadow-lg"
        >
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search orders by book, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-blue-900/30 border border-blue-500/20 rounded-xl text-white placeholder-blue-300 focus:border-blue-400 focus:outline-none transition-colors"
                />
                {searchTerm && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-blue-900/30 border border-blue-500/20 rounded-xl text-white focus:border-blue-400 focus:outline-none appearance-none pr-8"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="quantity">By Quantity</option>
                  <option value="name">By Book Name</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-4 h-4 pointer-events-none" />
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={refreshOrders}
                className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-xl hover:from-blue-600 hover:to-blue-500 transition-all duration-300 flex items-center justify-center"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
              </motion.button>
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-3 mt-6">
            {orderStatuses.map((status) => {
              const Icon = status.icon;
              const count = status.value === "All" ? orders.length : orders.filter(o => o.status === status.value).length;
              return (
                <motion.button
                  key={status.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedStatus(status.value)}
                  className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    selectedStatus === status.value
                      ? `${status.color} text-white shadow-lg`
                      : "bg-blue-900/30 text-blue-200 hover:bg-blue-800/50"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {status.label}
                  <span className="ml-2 px-2 py-1 bg-black/20 rounded-full text-xs">
                    {count}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Orders Section */}
        <AnimatePresence mode="wait">
          {sortedOrders.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-20"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-blue-500/20 to-blue-400/20 rounded-full flex items-center justify-center relative">
                  <ShoppingBag className="w-16 h-16 text-blue-400" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-2 border-dashed border-blue-500/30"
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {searchTerm || selectedStatus !== "All" ? "No matching orders found" : "No orders yet"}
                </h3>
                <p className="text-blue-300 text-lg mb-8 max-w-md mx-auto">
                  {searchTerm || selectedStatus !== "All" 
                    ? "Try adjusting your search or filter criteria"
                    : "Start exploring our collection and place your first order!"
                  }
                </p>
                {(!searchTerm && selectedStatus === "All") && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-500 transition-all duration-300 flex items-center justify-center mx-auto"
                    onClick={() => window.location.href = '/books'}
                  >
                    Browse Books
                  </motion.button>
                )}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="orders"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {sortedOrders.map((order, index) => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <motion.div
                    key={order.orderId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                    className="bg-blue-900/50 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-6 hover:border-blue-400/50 transition-all duration-300 group"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-400 rounded-lg mr-3 shadow-md">
                          <Book className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-blue-300">Order #{index + 1}</p>
                          <p className="text-lg font-semibold text-white truncate max-w-[180px]">
                            {order.bookName}
                          </p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${statusConfig.color} flex items-center shadow-md`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {order.status}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-4">
                      <div className="flex items-center text-blue-200">
                        <Hash className="w-4 h-4 mr-3 text-blue-300" />
                        <span className="text-sm">Order ID: </span>
                        <span className="font-mono text-xs ml-1 truncate max-w-[100px]">{order.orderId}</span>
                      </div>
                      
                      <div className="flex items-center text-blue-200">
                        <Box className="w-4 h-4 mr-3 text-blue-300" />
                        <span className="text-sm">Quantity: </span>
                        <span className="font-semibold ml-1">{order.quantity}</span>
                      </div>
                      
                      <div className="flex items-center text-blue-200">
                        <DollarSign className="w-4 h-4 mr-3 text-blue-300" />
                        <span className="text-sm">Total: </span>
                        <span className="font-semibold ml-1">
  ${order.totalPrice?.toLocaleString() ?? "0"}
</span>
                      </div>
                      
                      <div className="flex items-center text-blue-200">
                        <Mail className="w-4 h-4 mr-3 text-blue-300" />
                        <span className="text-sm truncate">{order.buyerEmail}</span>
                      </div>
                      
                      <div className="flex items-center text-blue-200">
                        <Calendar className="w-4 h-4 mr-3 text-blue-300" />
                        <span className="text-sm">
                          {new Date(order.purchaseDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedOrder(order);
                        setNewStatus(order.status);
                      }}
                      className="w-full mt-6 py-3 bg-gradient-to-r from-blue-500/20 to-blue-400/20 hover:from-blue-500/30 hover:to-blue-400/30 border border-blue-500/30 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center group-hover:border-blue-400/50"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Update Status
                      <ArrowUpRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Update Modal */}
      <AnimatePresence>
          
        {selectedOrder && (() => {
        const { icon: StatusIcon } = getStatusConfig(selectedOrder.status);
         return ( <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-blue-900/95 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8 w-full max-w-md relative overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full filter blur-3xl" />
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-400 rounded-lg mr-3 shadow-md">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Update Order Status</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-blue-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="mb-6 relative z-10">
                <div className="bg-blue-900/30 rounded-xl p-4 mb-4">
                  <p className="text-blue-200 mb-2 flex items-center">
                    <Book className="w-4 h-4 mr-2 text-blue-400" />
                    <strong className="text-white mr-2">Book:</strong> 
                    <span className="truncate">{selectedOrder.bookName}</span>
                  </p>
                  <p className="text-blue-200 flex items-center">
                    <Info className="w-4 h-4 mr-2 text-blue-400" />
                    <strong className="text-white mr-2">Current Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusConfig(selectedOrder.status).color} flex items-center`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {selectedOrder.status}
                    </span>
                  </p>
                </div>

                <label className="block text-white font-medium mb-3 flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-blue-400" />
                  Select New Status:
                </label>
                <div className="relative">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-blue-900/30 border border-blue-500/20 rounded-xl text-white focus:border-blue-400 focus:outline-none appearance-none hover:bg-blue-800/50 transition-colors"
                  >
                    {orderStatuses.slice(1).map((status) => (
                      <option key={status.value} value={status.value} className="bg-blue-900">
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5 pointer-events-none" />
                </div>
              </div>

              <div className="flex gap-3 relative z-10">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-3 bg-blue-900/30 border border-blue-500/20 text-blue-200 rounded-xl font-medium hover:bg-blue-800/50 transition-all duration-300 flex items-center justify-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpdateStatus}
                  disabled={newStatus === selectedOrder.status}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Update Status
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
         )})(
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookOrders;