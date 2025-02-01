import React from 'react';
import { useNavigate } from 'react-router-dom';

const BookCard = ({ book, page, handleRemoveFromCart, id }) => {
    const navigate = useNavigate();

    // Extract the URL from coverPics array
    const coverPicUrl = book.coverPics && book.coverPics.length > 0 ? book.coverPics[0].url : "https://via.placeholder.com/150";
    const bookId = book.id || id || "default-id";  // Fallback for missing book.id

    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105">
            <img
                src={coverPicUrl}
                alt={book.name}
                className="w-full h-64 object-cover rounded-t-lg"
            />
            <div className="p-4">
                <h3 className="text-xl font-semibold text-white">{book.name}</h3>
                <p className="text-gray-400 mt-2">
                    <strong>Price:</strong> ${book.price}
                </p>
                <p className="text-gray-400 mt-2">
                    <strong>Author:</strong> {book.author}
                </p>
                <p className="text-gray-400 mt-2">
                    <strong>Language:</strong> {book.language}
                </p>
                <button
                    onClick={() => navigate(`/book/view/${bookId}`)}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors w-full"
                >
                    View Details
                </button>
                {
                    page === "Cart" ? <button
                        onClick={() => handleRemoveFromCart(id)} // Pass both cartId and bookId
                        className="mt-4 px-6 py-2 bg-red-500 text-white rounded-full hover:bg-blue-700 transition-colors hover:bg-red-600 w-full"
                    >
                        Remove From Cart
                    </button> : ''
                }
            </div>
        </div>
    );
};

export default BookCard;