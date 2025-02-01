import React, { useEffect, useState } from 'react';
import { useFirebase } from '../context/Firebase';
import BookCard from '../components/BookCard'; // Import the BookCard component
import { motion } from "framer-motion";

const Home = () => {
    const firebase = useFirebase();
    const [books, setBooks] = useState([]);

    useEffect(() => {
        firebase.getBookListings().then((data) => {
            setBooks(data);
        });
    }, [firebase]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6 pt-8 mt-[6.5vh]">
            {/* Page Title */}
            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-bold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
            >
                Book Listings
            </motion.h2>

            {/* Book Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mx-auto max-w-7xl mb-8">
                {books.map((book) => (
                    <div
                        key={book.id}
                        className="transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
                    >
                        <BookCard book={book} />
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {books.length === 0 && (
                <div className="text-center text-gray-400 mt-12">
                    <p className="text-2xl">No books available yet.</p>
                    <p className="text-lg">Check back later or add a new listing!</p>
                </div>
            )}
        </div>
    );
};

export default Home;