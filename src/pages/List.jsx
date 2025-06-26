import React, { useState, useEffect } from "react";
import { useFirebase } from "../context/Firebase";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const List = () => {
    const firebase = useFirebase();
    const [formData, setFormData] = useState({
        name: "",
        isbnNumber: "",
        price: 0,
        coverPics: [],
        author: "",
        description: "",
        category: "",
        publicationYear: "",
        language: "",
        Qty: 0,
    });

    const [activeSection, setActiveSection] = useState("basic");
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewUrls, setPreviewUrls] = useState([]);

    useEffect(() => {
        // Clean up object URLs when component unmounts
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    const categoryOptions = [
        "Fiction", "Non-Fiction", "Mystery", "Thriller", "Romance", 
        "Science Fiction", "Fantasy", "Biography", "History", 
        "Self-Help", "Business", "Children", "Young Adult", "Academic", "Other"
    ];

    const languageOptions = [
        "English", "Spanish", "French", "German", "Italian", 
        "Chinese", "Japanese", "Russian", "Arabic", "Hindi", "Other"
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors({...errors, [name]: null});
        }
    };

    const handleCoverPicChange = (e) => {
        const files = Array.from(e.target.files);
        
        // Filter out already selected files
        const newFiles = files.filter(
            (file) => !formData.coverPics.some((pic) => pic.name === file.name)
        );
        
        // Create preview URLs
        const newUrls = newFiles.map(file => URL.createObjectURL(file));
        
        setFormData({ ...formData, coverPics: [...formData.coverPics, ...newFiles] });
        setPreviewUrls([...previewUrls, ...newUrls]);
        
        // Clear error if any
        if (errors.coverPics) {
            setErrors({...errors, coverPics: null});
        }
    };

    const removeCoverPic = (index) => {
        // Revoke the URL to prevent memory leaks
        URL.revokeObjectURL(previewUrls[index]);
        
        // Remove the file and its preview URL
        const updatedPics = formData.coverPics.filter((_, idx) => idx !== index);
        const updatedUrls = previewUrls.filter((_, idx) => idx !== index);
        
        setFormData({ ...formData, coverPics: updatedPics });
        setPreviewUrls(updatedUrls);
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Book title is required";
        if (!formData.isbnNumber.trim()) newErrors.isbnNumber = "ISBN is required";
        if (formData.price <= 0) newErrors.price = "Please enter a valid price";
        if (formData.Qty < 0) newErrors.Qty = "Quantity cannot be negative";
        if (!formData.author.trim()) newErrors.author = "Author name is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";
        if (!formData.category.trim()) newErrors.category = "Please select a category";
        if (!formData.publicationYear.trim()) newErrors.publicationYear = "Publication year is required";
        if (!formData.language.trim()) newErrors.language = "Please select a language";
        if (formData.coverPics.length === 0) newErrors.coverPics = "At least one cover image is required";
        
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error("Please fill in all required fields");
            return;
        }
        
        setErrors({});
        setIsSubmitting(true);

        try {
            // Create form data for image upload
            const formDataToSend = new FormData();
            formData.coverPics.forEach((file) => {
                formDataToSend.append("images", file);
            });

            // Upload images first
            const response = await axios.post(
                "https://bookify-0prq.onrender.com/upload", 
                formDataToSend, 
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            console.log("debugging response",response);

            const coverPicUrls = response.data.results;

            // Then create the book listing using Firebase
            await firebase.handleCreateNewListing(
                formData.name,
                formData.isbnNumber,
                Number(formData.price),
                coverPicUrls,
                formData.author,
                formData.description,
                formData.category,
                formData.publicationYear,
                formData.language,
                Number(formData.Qty)
            );

            // Reset form after successful submission
            setFormData({
                name: "",
                isbnNumber: "",
                price: 0,
                coverPics: [],
                author: "",
                description: "",
                category: "",
                publicationYear: "",
                language: "",
                Qty: 0,
            });
            setPreviewUrls([]);
            setIsSubmitting(false);
            toast.success("Book successfully listed for sale!");
        } catch (error) {
            console.error("Error submitting form:", error);
            setIsSubmitting(false);
            toast.error("Failed to list book. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black text-white p-4 pt-20">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400">
                        List Your Book
                    </h1>
                    <p className="text-gray-300">Share your books with readers around the world</p>
                </div>

                <div className="bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
                    {/* Progress Steps */}
                    <div className="flex border-b border-gray-700">
                        <button
                            className={`flex-1 py-4 text-center transition-all ${
                                activeSection === "basic" 
                                ? "bg-blue-600/30 border-b-2 border-blue-400" 
                                : "hover:bg-gray-700/50"
                            }`}
                            onClick={() => setActiveSection("basic")}
                        >
                            <span className="inline-block w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white mr-2">1</span>
                            Basic Info
                        </button>
                        <button
                            className={`flex-1 py-4 text-center transition-all ${
                                activeSection === "details" 
                                ? "bg-blue-600/30 border-b-2 border-blue-400" 
                                : "hover:bg-gray-700/50"
                            }`}
                            onClick={() => setActiveSection("details")}
                        >
                            <span className="inline-block w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white mr-2">2</span>
                            Book Details
                        </button>
                        <button
                            className={`flex-1 py-4 text-center transition-all ${
                                activeSection === "images" 
                                ? "bg-blue-600/30 border-b-2 border-blue-400" 
                                : "hover:bg-gray-700/50"
                            }`}
                            onClick={() => setActiveSection("images")}
                        >
                            <span className="inline-block w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white mr-2">3</span>
                            Images
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        {/* Basic Info Section */}
                        <div className={`${activeSection === "basic" ? "block" : "hidden"}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-200">
                                        Book Title <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        className={`w-full p-3 bg-gray-700/50 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                                            errors.name ? "border-red-500" : "border-gray-600"
                                        }`}
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter book title"
                                    />
                                    {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="author" className="block text-sm font-medium mb-2 text-gray-200">
                                        Author <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="author"
                                        name="author"
                                        className={`w-full p-3 bg-gray-700/50 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                                            errors.author ? "border-red-500" : "border-gray-600"
                                        }`}
                                        value={formData.author}
                                        onChange={handleChange}
                                        placeholder="Enter author name"
                                    />
                                    {errors.author && <p className="text-red-400 text-sm mt-1">{errors.author}</p>}
                                </div>

                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium mb-2 text-gray-200">
                                        Price ($) <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        min="0"
                                        step="0.01"
                                        className={`w-full p-3 bg-gray-700/50 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                                            errors.price ? "border-red-500" : "border-gray-600"
                                        }`}
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="Enter price"
                                    />
                                    {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price}</p>}
                                </div>

                                <div>
                                    <label htmlFor="Qty" className="block text-sm font-medium mb-2 text-gray-200">
                                        Quantity Available <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="Qty"
                                        name="Qty"
                                        min="0"
                                        className={`w-full p-3 bg-gray-700/50 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                                            errors.Qty ? "border-red-500" : "border-gray-600"
                                        }`}
                                        value={formData.Qty}
                                        onChange={handleChange}
                                        placeholder="Number of copies available"
                                    />
                                    {errors.Qty && <p className="text-red-400 text-sm mt-1">{errors.Qty}</p>}
                                </div>
                            </div>
                            
                            <div className="mt-8 flex justify-end">
                                <button
                                    type="button"
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition duration-300 flex items-center"
                                    onClick={() => setActiveSection("details")}
                                >
                                    Next: Book Details
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className={`${activeSection === "details" ? "block" : "hidden"}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="isbnNumber" className="block text-sm font-medium mb-2 text-gray-200">
                                        ISBN Number <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="isbnNumber"
                                        name="isbnNumber"
                                        className={`w-full p-3 bg-gray-700/50 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                                            errors.isbnNumber ? "border-red-500" : "border-gray-600"
                                        }`}
                                        value={formData.isbnNumber}
                                        onChange={handleChange}
                                        placeholder="Enter ISBN (e.g., 978-3-16-148410-0)"
                                    />
                                    {errors.isbnNumber && <p className="text-red-400 text-sm mt-1">{errors.isbnNumber}</p>}
                                </div>

                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium mb-2 text-gray-200">
                                        Category <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        id="category"
                                        name="category"
                                        className={`w-full p-3 bg-gray-700/50 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                                            errors.category ? "border-red-500" : "border-gray-600"
                                        }`}
                                        value={formData.category}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Category</option>
                                        {categoryOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
                                </div>

                                <div>
                                    <label htmlFor="publicationYear" className="block text-sm font-medium mb-2 text-gray-200">
                                        Publication Year <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="publicationYear"
                                        name="publicationYear"
                                        className={`w-full p-3 bg-gray-700/50 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                                            errors.publicationYear ? "border-red-500" : "border-gray-600"
                                        }`}
                                        value={formData.publicationYear}
                                        onChange={handleChange}
                                        placeholder="Enter publication year"
                                    />
                                    {errors.publicationYear && <p className="text-red-400 text-sm mt-1">{errors.publicationYear}</p>}
                                </div>

                                <div>
                                    <label htmlFor="language" className="block text-sm font-medium mb-2 text-gray-200">
                                        Language <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        id="language"
                                        name="language"
                                        className={`w-full p-3 bg-gray-700/50 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                                            errors.language ? "border-red-500" : "border-gray-600"
                                        }`}
                                        value={formData.language}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Language</option>
                                        {languageOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.language && <p className="text-red-400 text-sm mt-1">{errors.language}</p>}
                                </div>
                            </div>

                            <div className="mt-6">
                                <label htmlFor="description" className="block text-sm font-medium mb-2 text-gray-200">
                                    Description <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows="4"
                                    className={`w-full p-3 bg-gray-700/50 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                                        errors.description ? "border-red-500" : "border-gray-600"
                                    }`}
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter book description"
                                ></textarea>
                                {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
                            </div>

                            <div className="mt-8 flex justify-between">
                                <button
                                    type="button"
                                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition duration-300 flex items-center"
                                    onClick={() => setActiveSection("basic")}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Back to Basic Info
                                </button>
                                <button
                                    type="button"
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition duration-300 flex items-center"
                                    onClick={() => setActiveSection("images")}
                                >
                                    Next: Upload Images
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Images Section */}
                        <div className={`${activeSection === "images" ? "block" : "hidden"}`}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-2 text-gray-200">
                                    Cover Images <span className="text-red-400">*</span>
                                </label>
                                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                                    <input
                                        type="file"
                                        id="coverPics"
                                        name="coverPics"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleCoverPicChange}
                                    />
                                    <label
                                        htmlFor="coverPics"
                                        className="cursor-pointer block w-full"
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <svg
                                                className="w-12 h-12 text-gray-400 mb-3"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                ></path>
                                            </svg>
                                            <p className="text-gray-300 mb-2">
                                                Drag & Drop your images here or click to browse
                                            </p>
                                            <p className="text-gray-400 text-sm">
                                                Upload multiple images for better visibility
                                            </p>
                                        </div>
                                    </label>
                                </div>
                                {errors.coverPics && <p className="text-red-400 text-sm mt-1">{errors.coverPics}</p>}
                            </div>

                            {/* Preview section */}
                            {previewUrls.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-medium text-gray-200 mb-3">Preview</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {previewUrls.map((url, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={url}
                                                    alt={`Cover ${index + 1}`}
                                                    className="w-full h-40 object-cover rounded-lg shadow-md"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeCoverPic(index)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 flex justify-between">
                                <button
                                    type="button"
                                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition duration-300 flex items-center"
                                    onClick={() => setActiveSection("details")}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Back to Book Details
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded-lg transition duration-300 flex items-center"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            List Book
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default List;