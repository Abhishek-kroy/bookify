import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../context/Firebase';
import { motion } from "framer-motion";
import {
    BookOpen, Star, ShoppingCart, Heart, Search,
    Filter, ChevronDown, PlusCircle, Tag, BookmarkPlus
} from 'lucide-react';

const BookList = () => {
    const firebase = useFirebase();
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [wishlistedBooks, setWishlistedBooks] = useState({});

    useEffect(() => {
        setLoading(true);
        firebase.getBookListings()
            .then((bookData) => {
                console.log("Fetched Books:", bookData);

                if (bookData && bookData.length > 0) {
                    setBooks(bookData);

                    // Extract unique categories
                    const uniqueCategories = [...new Set(bookData.map(b => b.category).filter(Boolean))];
                    setCategories(['All', ...uniqueCategories]);
                } else {
                    setError("No books found");
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching books:", err);
                setError("Failed to load books");
                setLoading(false);
            });
    }, [firebase]);

    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const bookItem = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    // Filter books based on category and search query
    const filteredBooks = books.filter(book => {
        const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
        const matchesSearch = searchQuery === '' ||
            (book.name && book.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (book.author && book.author.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    // Sort books
    const sortedBooks = [...filteredBooks].sort((a, b) => {
        if (sortBy === 'name') {
            return a.name?.localeCompare(b.name || '');
        } else if (sortBy === 'priceAsc') {
            return (a.price || 0) - (b.price || 0);
        } else if (sortBy === 'priceDesc') {
            return (b.price || 0) - (a.price || 0);
        }
        return 0;
    });

    // Toggle wishlist status for a book
    const toggleWishlist = (bookId) => {
        setWishlistedBooks(prev => ({
            ...prev,
            [bookId]: !prev[bookId]
        }));
    };

    // Add to cart
    const addToCart = (bookId) => {
        // Implement cart functionality
        console.log(`Book ${bookId} added to cart`);
        // You could add a visual feedback here
    };

    // If loading
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white flex justify-center items-center">
                <motion.div
                    className="flex flex-col items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="relative w-24 h-24">
                        <div className="w-full h-full rounded-full border-4 border-blue-300 border-t-blue-500 animate-spin"></div>
                        <div className="absolute inset-0 flex justify-center items-center">
                            <BookOpen size={28} className="text-blue-400" />
                        </div>
                    </div>
                    <motion.p
                        className="mt-6 text-xl font-medium text-blue-300"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        Loading books from Bookify...
                    </motion.p>
                </motion.div>
            </div>
        );
    }

    // If error
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white flex justify-center items-center">
                <motion.div
                    className="bg-gray-800/80 backdrop-blur-sm p-10 rounded-2xl text-center max-w-md border border-gray-700 shadow-2xl"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <BookOpen size={64} className="text-red-500 mx-auto mb-6" />
                    </motion.div>
                    <motion.h2
                        className="text-3xl font-bold mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {error}
                    </motion.h2>
                    <motion.p
                        className="text-gray-300 mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        We couldn't load the books from our store. Please try again later.
                    </motion.p>
                    <motion.button
                        onClick={() => window.location.reload()}
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-900/30"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        Try Again
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
        <div className="mb-10 bg-gradient-to-b from-gray-900 via-gray-800 to-black"></div>
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute opacity-10 top-20 left-20 w-64 h-64 rounded-full bg-blue-500 filter blur-3xl"></div>
                <div className="absolute opacity-10 bottom-20 right-40 w-80 h-80 rounded-full bg-purple-500 filter blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Bookify Store
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Discover your next favorite book from our extensive collection.
                    </p>
                </motion.div>

                {/* Search and Filter Section */}
                <motion.div
                    className="mb-8 grid gap-6 md:grid-cols-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    {/* Search Bar */}
                    <div className="relative">
                        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by title, author..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-800/80 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Filter and Sort Controls */}
                    <div className="flex gap-4">
                        {/* Category Filter */}
                        <div className="relative flex-1">
                            <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <select
                                className="w-full appearance-none pl-10 pr-10 py-3 bg-gray-800/80 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none cursor-pointer"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                {categories.map((category, index) => (
                                    <option key={index} value={category}>{category}</option>
                                ))}
                            </select>
                            <ChevronDown size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative flex-1">
                            <Tag size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <select
                                className="w-full appearance-none pl-10 pr-10 py-3 bg-gray-800/80 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none cursor-pointer"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="name">Name (A-Z)</option>
                                <option value="priceAsc">Price (Low to High)</option>
                                <option value="priceDesc">Price (High to Low)</option>
                            </select>
                            <ChevronDown size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </motion.div>

                {/* Book Count */}
                <motion.div
                    className="mb-6 text-gray-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    Found {sortedBooks.length} {sortedBooks.length === 1 ? 'book' : 'books'}
                    {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
                    {searchQuery ? ` matching "${searchQuery}"` : ''}
                </motion.div>

                {/* Books Grid */}
                {sortedBooks.length > 0 ? (
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {sortedBooks.map((book) => (
                            <motion.div
                                key={book.id}
                                className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all group"
                                variants={bookItem}
                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            >
                                {/* Book Cover Image */}
                                <div
                                    className="aspect-[3/4] overflow-hidden relative cursor-pointer"
                                    onClick={() => navigate(`/book/${book.id}`)}
                                >
                                    {book.coverPics && book.coverPics.length > 0 ? (
                                        <img
                                            src={book.coverPics[0].url}
                                            alt={book.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-700 to-gray-800">
                                            <BookOpen size={40} className="text-gray-500" />
                                        </div>
                                    )}

                                    {/* Price Badge */}
                                    <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg shadow-red-900/30">
                                        ${book.price}
                                    </div>

                                    {/* Quick Actions Overlay */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <motion.button
                                            className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleWishlist(book.id);
                                            }
                                            }>
                                            {wishlistedBooks[book.id] ? <Heart size={20} /> : <BookmarkPlus size={20} />}
                                        </motion.button>
                                        <motion.button
                                            className="p-2 rounded-full bg-green-500 hover:bg-green-400 text-white"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart(book.id);
                                            }}
                                        >
                                            <ShoppingCart size={20} />
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Book Info */}
                                <div className="p-4">
                                    <div 
                                        className="mb-1 text-xs font-medium text-blue-400 uppercase"
                                    >
                                        {book.category || 'Uncategorized'}
                                    </div>
                                    <h3 
                                        className="font-semibold text-lg truncate cursor-pointer hover:text-blue-400 transition-colors"
                                        onClick={() => navigate(`/book/${book.id}`)}
                                    >
                                        {book.name}
                                    </h3>
                                    <p className="text-gray-400 text-sm truncate">by {book.author || 'Unknown Author'}</p>
                                    
                                    {/* Rating */}
                                    <div className="flex items-center mt-2">
                                        <div className="flex">
                                            {[...Array(5)].map((_, index) => (
                                                <Star 
                                                    key={index} 
                                                    size={14} 
                                                    className={`${index < (book.rating || 5) ? 'text-yellow-400' : 'text-gray-600'} mr-1`}
                                                    fill={index < (book.rating || 5) ? '#FBBF24' : 'transparent'}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-gray-400 text-xs ml-2">({book.reviewCount || 0} reviews)</span>
                                    </div>
                                    
                                    {/* Buy Button */}
                                    <motion.button
                                        className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg flex items-center justify-center"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate(`/book/view/${book.id}`)}
                                    >
                                        <ShoppingCart size={16} className="mr-2" />
                                        View Details
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div 
                        className="text-center py-16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <BookOpen size={64} className="text-gray-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">No books found</h3>
                        <p className="text-gray-400 mb-6">Try adjusting your search or filter to find what you're looking for.</p>
                        <button 
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('All');
                                setSortBy('name');
                            }}
                        >
                            Reset Filters
                        </button>
                    </motion.div>
                )}
                
                {/* Pagination (if needed) */}
                {sortedBooks.length > 12 && (
                    <motion.div 
                        className="flex justify-center items-center mt-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((page) => (
                                <button 
                                    key={page}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        page === 1 ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
                
                {/* Add New Book Button (for admin) */}
                <motion.button
                    className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-lg shadow-blue-900/30"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    onClick={() => navigate('/add-book')}
                >
                    <PlusCircle size={24} />
                </motion.button>
            </div>
        </div>
    );
};

export default BookList;
