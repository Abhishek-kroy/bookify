import { useEffect, useState, useCallback } from 'react';
import { useFirebase } from '../context/Firebase';
import BookCard from '../components/BookCard';
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, Search, BookOpen, TrendingUp, Star, Clock,TruckIcon, RefreshCcwIcon, ShieldIcon, HeadphonesIcon} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const firebase = useFirebase();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [featuredBooks, setFeaturedBooks] = useState([]);

    const navigate = useNavigate();

    const categories = ['All', 'Fiction', 'Non-Fiction', 'Mystery', 'Biography', 'Science Fiction', 'Romance','Children'];

    useEffect(() => {
        setLoading(true);
        firebase.getBookListings().then((data) => {
            const allBooks = Array.isArray(data) ? data : [];
            setBooks(allBooks);

            if (allBooks.length > 0) {
                const randomFeatured = [...allBooks]
                    .sort(() => 0.5 - Math.random())
                    .slice(0, Math.min(5, allBooks.length));
                setFeaturedBooks(randomFeatured);
            }

            setTimeout(() => setLoading(false), 500); // Add small delay for loading animation
        }).catch((error) => {
            console.error("Error fetching books:", error);
            setBooks([]);
            setLoading(false);
        });
    }, [firebase]);

    // Filter books based on category and search query
    const filteredBooks = books.filter(book => {
        const matchesCategory = activeCategory === 'All' || book.category === activeCategory;
        const matchesSearch = !searchQuery ||
            book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 1, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    // Hero section book carousel
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredBooks.length);
    });
    
    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + featuredBooks.length) % featuredBooks.length);
    };    

    useEffect(() => {
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [nextSlide]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        
            {/* Hero Section */}
            <section className="relative h-[60vh] overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20 z-0">
                
                    <div className="absolute inset-0" style={{
                        backgroundImage: "url('/pattern-bg.png')",
                        backgroundSize: "cover",
                        opacity: 0.05
                    }}></div>
                </div>
                
                
                {/* Featured Book Carousel */}
                {featuredBooks.length > 0 && (
                    <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
                        {featuredBooks.map((book, index) => (
                            <motion.div
                                key={book.id}
                                className="absolute inset-0 flex items-center justify-between"
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: currentSlide === index ? 1 : 0,
                                    zIndex: currentSlide === index ? 10 : 0
                                }}
                                transition={{ duration: 0.7 }}
                            >
                                {/* Book Info */}
                                <div className="w-full md:w-1/2 space-y-6 z-10">
                                    <motion.span
                                        className="inline-block px-3 py-1 bg-blue-600 text-sm font-semibold rounded-full"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        Featured Book
                                    </motion.span>
                                    <motion.h1
                                        className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        {book.name}
                                    </motion.h1>
                                    <motion.p
                                        className="text-lg text-gray-300"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        By <span className="text-blue-400">{book.author}</span>
                                    </motion.p>
                                    <motion.p
                                        className="text-gray-400 line-clamp-3"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.8 }}
                                    >
                                        {book.description || "Discover this amazing book and dive into a world of imagination. Perfect for readers who enjoy quality literature."}
                                    </motion.p>
                                    <motion.div
                                        className="flex space-x-4"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1 }}
                                    >
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
                                        >
                                            View Details
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-6 py-3 border border-blue-500 text-blue-400 rounded-lg font-semibold hover:bg-blue-500/10 transition-all"
                                        >
                                            Add to Cart
                                        </motion.button>
                                    </motion.div>
                                </div>

                                {/* Book Cover */}
                                <motion.div
                                    className="hidden md:block w-1/2 h-full relative"
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.7 }}
                                >
                                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-80 h-96">
                                        <div className="relative w-full h-full">
                                            {/* Book shadow */}
                                            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-3/4 h-12 bg-black/40 blur-xl rounded-full"></div>

                                            {/* Book cover */}
                                            <img
                                                src={book.coverPics && book.coverPics.length > 0 ? book.coverPics[0].url : "/book-cover-placeholder.jpg"}
                                                alt={book.name}
                                                className="w-full h-full object-cover rounded-lg transform rotate-3 shadow-2xl"
                                            />

                                            {/* Price tag */}
                                            <div className="absolute -top-5 -right-5 bg-red-500 text-white w-20 h-20 rounded-full flex items-center justify-center font-bold text-xl transform rotate-12 shadow-lg">
                                                ${book.price}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}

                        {/* Carousel Navigation */}
                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                            {featuredBooks.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`w-3 h-3 rounded-full ${currentSlide === index ? 'bg-blue-500' : 'bg-gray-500'}`}
                                />
                            ))}
                        </div>

                        {/* Prev/Next Buttons */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-all z-20"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-all z-20"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                )}
            </section>

            {/* Categories and Search */}
            <section className="py-8 bg-gray-800/50 backdrop-blur-sm sticky top-16 z-30">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Categories */}
                        <div className="flex items-center space-x-1 overflow-x-hidden pb-2 md:pb-0 scrollbar-hide w-full md:w-auto">
                            {categories.map((category) => (
                                <motion.button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`px-4 py-2 rounded-full whitespace-nowrap ${activeCategory === category
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {category}
                                </motion.button>
                            ))}
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full md:w-72">
                            <input
                                type="text"
                                placeholder="Search books or authors..."
                                className="w-full bg-gray-700 text-white py-2 pl-10 pr-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Collections */}
            <section className="py-12 bg-gradient-to-r from-gray-900 to-gray-800">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold mb-8 text-white"
                    >
                        Featured Collections
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { title: "Bestsellers", icon: <TrendingUp size={24} />, color: "from-blue-500 to-blue-700", image: "/collection-bestsellers.jpg" },
                            { title: "New Releases", icon: <Clock size={24} />, color: "from-purple-500 to-purple-700", image: "/collection-new.jpg" },
                            { title: "Award Winners", icon: <Star size={24} />, color: "from-green-500 to-green-700", image: "/collection-awards.jpg" }
                        ].map((collection, index) => (
                            <motion.div
                                key={index}
                                className="relative overflow-hidden rounded-xl h-64 group cursor-pointer"
                                whileHover={{ y: -5 }}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0 bg-gray-900 opacity-60 group-hover:opacity-40 transition-opacity">
                                </div>
                                <div
                                    className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
                                    style={{ backgroundImage: `url(${collection.image})` }}
                                ></div>

                                {/* Gradient Overlay */}
                                <div className={`absolute inset-0 opacity-70 bg-gradient-to-t ${collection.color}`}></div>

                                {/* Content */}
                                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                <div className="flex items-center mb-3">To Be Implemented </div>
                                    <div className="flex items-center mb-3">
                                        <div className="p-2 bg-white/20 rounded-full mr-3">
                                            {collection.icon}
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">{collection.title}</h3>
                                    </div>
                                    <p className="text-white/80 mb-4">Explore our curated selection of {collection.title.toLowerCase()}.</p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-all w-fit"
                                    >
                                        Explore Collection
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Book Listings */}
            <section className="py-16 bg-gray-900">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-center mb-8">
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            className="text-3xl font-bold text-white flex items-center"
                        >
                            <BookOpen className="mr-3 text-blue-500" size={28} />
                            {activeCategory === 'All' ? 'All Books' : activeCategory + ' Books'}
                        </motion.h2>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            className="text-blue-400 flex items-center cursor-pointer hover:text-blue-300 transition-colors"
                        >   
                        <button onClick={() => setActiveCategory(navigate('/books'))} className="text-blue-400 flex items-center cursor-pointer hover:text-blue-300 transition-colors">

                            View All
                        </button>
                            <ChevronRight size={20} className="ml-1" />
                        </motion.div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="relative w-20 h-20">
                                {/* Loading spinner animation */}
                                <div className="w-full h-full rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
                                <div className="absolute inset-0 flex justify-center items-center">
                                    <BookOpen size={24} className="text-blue-600 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    ) : filteredBooks.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-gray-800/50 rounded-xl p-8 text-center"
                        >
                            <div className="mx-auto w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mb-4">
                                <Search size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No books found</h3>
                            <p className="text-gray-400">
                                {searchQuery
                                    ? `No books matching "${searchQuery}" in the "${activeCategory}" category.`
                                    : `No books found in the "${activeCategory}" category.`}
                            </p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setActiveCategory('All');
                                }}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Reset Filters
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.1 }}
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                        >
                            {filteredBooks.map((book) => (
                                <motion.div
                                    key={book.id}
                                    variants={itemVariants}
                                    whileHover={{ y: -10, transition: { duration: 0.3 } }}
                                >
                                    <BookCard book={book} />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 bg-gradient-to-b from-gray-800 to-gray-900">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-white mb-4">What Our Readers Say</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Join thousands of satisfied readers who have discovered their next favorite book with Bookify.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Sarah Johnson",
                                role: "Book Lover",
                                avatar: "/avatars/avatar-1.jpg",
                                text: "Bookify has completely transformed how I discover new books. The recommendations are spot-on and I love the user experience!",
                                rating: 5
                            },
                            {
                                name: "Michael Chen",
                                role: "Literature Professor",
                                avatar: "/avatars/avatar-2.jpg",
                                text: "As someone who reads professionally, I appreciate the curation and attention to detail. The search functionality is exceptional.",
                                rating: 5
                            },
                            {
                                name: "Jessica Williams",
                                role: "Avid Reader",
                                avatar: "/avatars/avatar-3.jpg",
                                text: "The delivery is always prompt and the books arrive in perfect condition. Bookify has become my go-to for all my reading needs.",
                                rating: 4
                            }
                        ].map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.2 }}
                                viewport={{ once: true }}
                                className="bg-gray-800 p-6 rounded-xl shadow-lg relative hover:shadow-2xl transition-all duration-300"
                            >
                                {/* Quote mark decoration */}
                                <div className="absolute -top-4 -left-4 text-6xl text-blue-600/20 font-serif">❝</div>

                                {/* Content */}
                                <div className="relative z-10">
                                    {/* Stars */}
                                    <div className="flex mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={18}
                                                className={`${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-600'} mr-1`}
                                                fill={i < testimonial.rating ? '#FBBF24' : 'none'}
                                            />
                                        ))}
                                    </div>

                                    <p className="text-gray-300 mb-6 italic">"{testimonial.text}"</p>

                                    <div className="flex items-center">
                                        <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-blue-500">
                                            <img
                                                src={testimonial.avatar}
                                                alt={testimonial.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white">{testimonial.name}</h4>
                                            <p className="text-gray-400 text-sm">{testimonial.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <section className="py-16 bg-gradient-to-r from-blue-900 to-purple-900 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <motion.div
                            className="w-full md:w-1/2"
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Join Our Book Club</h2>
                            <p className="text-blue-100/80 mb-6">
                                Subscribe to our newsletter and get exclusive deals, early access to new releases, and personalized book recommendations.
                            </p>

                            <ul className="space-y-3 mb-6">
                                {[
                                    "Weekly book recommendations",
                                    "Exclusive discounts and offers",
                                    "Author interviews and insights",
                                    "Reading challenges and events"
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center text-blue-100/90">
                                        <div className="w-5 h-5 rounded-full bg-blue-400/30 flex items-center justify-center mr-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-200"></div>
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            className="w-full md:w-1/2 bg-white/10 backdrop-blur-sm p-8 rounded-2xl"
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                            viewport={{ once: true }}
                        >
                            <h3 className="text-xl font-semibold text-white mb-6">Sign up for our Newsletter</h3>
                            <form className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-blue-100 mb-1">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        className="w-full bg-white/20 border border-blue-300/20 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-blue-200/50"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-blue-100 mb-1">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        className="w-full bg-white/20 border border-blue-300/20 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-blue-200/50"
                                        placeholder="Your email address"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-blue-100 mb-1">Interests</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {["Fiction", "Non-Fiction", "Mystery", "Fantasy", "Romance", "Science Fiction"].map((genre) => (
                                            <label key={genre} className="flex items-center space-x-2 cursor-pointer">
                                                <input type="checkbox" className="text-blue-600 rounded focus:ring-blue-500" />
                                                <span className="text-blue-100">{genre}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    Subscribe Now
                                </motion.button>
                                <p className="text-xs text-blue-200/70 text-center">
                                    By subscribing, you agree to our Terms of Service and Privacy Policy.
                                </p>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gray-900">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold text-white mb-4">Why Choose Bookify</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            We're more than just an online bookstore. Discover the Bookify difference.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            {
                                icon: <TruckIcon size={24} />,
                                title: "Fast Delivery",
                                description: "Get your books delivered to your doorstep within 2-3 business days."
                            },
                            {
                                icon: <RefreshCcwIcon size={24} />,
                                title: "Easy Returns",
                                description: "Not satisfied? Return within 30 days for a full refund."
                            },
                            {
                                icon: <ShieldIcon size={24} />,
                                title: "Secure Payments",
                                description: "Multiple secure payment options to choose from."
                            },
                            {
                                icon: <HeadphonesIcon size={24} />,
                                title: "24/7 Support",
                                description: "Our customer support team is always ready to help."
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                className="bg-gray-800 p-6 rounded-xl text-center"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <div className="w-14 h-14 mx-auto mb-4 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-500">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-gray-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 bg-gradient-to-b from-gray-800 to-gray-900">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="bg-gradient-to-r from-blue-800 to-purple-800 rounded-2xl p-8 md:p-12 shadow-xl relative overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7 }}
                                viewport={{ once: true }}
                                className="text-center md:text-left"
                            >
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to start reading?</h2>
                                <p className="text-blue-100/80 text-lg mb-0 md:max-w-lg">
                                    Browse our extensive collection and find your next favorite book today.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.7 }}
                                viewport={{ once: true }}
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-white text-blue-900 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                                >
                                    Explore All Books
                                </motion.button>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;