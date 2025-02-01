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

    useEffect(() => {
        return () => {
            formData.coverPics.forEach((file) => URL.revokeObjectURL(file.preview));
        };
    }, [formData.coverPics]);

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCoverPicChange = (e) => {
        const files = Array.from(e.target.files);
        const newFiles = files.filter((file) => !formData.coverPics.some((pic) => pic.name === file.name));
        setFormData({ ...formData, coverPics: [...formData.coverPics, ...newFiles] });
    };

    const removeCoverPic = (index) => {
        const updatedPics = formData.coverPics.filter((_, idx) => idx !== index);
        setFormData({ ...formData, coverPics: updatedPics });
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required.";
        if (!formData.isbnNumber.trim()) newErrors.isbnNumber = "ISBN Number is required.";
        if (formData.price < 0) newErrors.price = "Price is required.";
        if (formData.Qty < 0) newErrors.Qty = "Quantity must be 0 or more.";
        if (!formData.author.trim()) newErrors.author = "Author is required.";
        if (!formData.description.trim()) newErrors.description = "Description is required.";
        if (!formData.category.trim()) newErrors.category = "Category is required.";
        if (!formData.publicationYear.trim()) newErrors.publicationYear = "Publication year is required.";
        if (!formData.language.trim()) newErrors.language = "Language is required.";
        if (formData.coverPics.length === 0) newErrors.coverPics = "At least one cover picture is required.";
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error("Please correct the errors before submitting.");
        } else {
            setErrors({});
            setIsSubmitting(true);

            try {
                const formDataToSend = new FormData();
                formData.coverPics.forEach((file) => {
                    formDataToSend.append("images", file);
                });

                const response = await axios.post("http://localhost:5000/upload", formDataToSend, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                const coverPicUrls = response.data.results;

                await firebase.handleCreateNewListing(
                    formData.name,
                    formData.isbnNumber,
                    formData.price,
                    coverPicUrls,
                    formData.author,
                    formData.description,
                    formData.category,
                    formData.publicationYear,
                    formData.language,
                    formData.Qty
                );

                setFormData({
                    name: "",
                    isbnNumber: "",
                    price: "",
                    coverPics: [],
                    author: "",
                    description: "",
                    category: "",
                    publicationYear: "",
                    language: "",
                    Qty: 0,
                });
                setIsSubmitting(false);
                toast.success("Book registered successfully!");
            } catch (error) {
                setIsSubmitting(false);
                toast.error("Failed to register book. Please try again.");
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-900 to-black text-white p-4 mt-[6.5vh]">
            <h2 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                Register Book
            </h2>
            <form onSubmit={handleSubmit} className="w-[80vw] bg-gray-800/50 backdrop-blur-md rounded-lg p-6 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name Field */}
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className={`w-full p-2 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border border-red-500" : ""}`}
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter Book Name"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* ISBN Number Field */}
                    <div className="mb-4">
                        <label htmlFor="isbnNumber" className="block text-sm font-medium mb-1">ISBN Number</label>
                        <input
                            type="text"
                            id="isbnNumber"
                            name="isbnNumber"
                            className={`w-full p-2 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.isbnNumber ? "border border-red-500" : ""}`}
                            value={formData.isbnNumber}
                            onChange={handleChange}
                            placeholder="Enter Book ISBN Number"
                        />
                        {errors.isbnNumber && <p className="text-red-500 text-sm mt-1">{errors.isbnNumber}</p>}
                    </div>

                    {/* Price Field */}
                    <div className="mb-4">
                        <label htmlFor="price" className="block text-sm font-medium mb-1">Price</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            className={`w-full p-2 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.price ? "border border-red-500" : ""}`}
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="Enter Book Price"
                        />
                        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                    </div>

                    {/* Quantity Field */}
                    <div className="mb-4">
                        <label htmlFor="Qty" className="block text-sm font-medium mb-1">Quantity</label>
                        <input
                            type="number"
                            id="Qty"
                            name="Qty"
                            className={`w-full p-2 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.Qty ? "border border-red-500" : ""}`}
                            value={formData.Qty}
                            onChange={handleChange}
                            placeholder="Enter Book Quantity"
                        />
                        {errors.Qty && <p className="text-red-500 text-sm mt-1">{errors.Qty}</p>}
                    </div>

                    {/* Cover Picture Field */}
                    <div className="mb-4 col-span-2">
                        <label htmlFor="coverPic" className="block text-sm font-medium mb-1">Cover Picture(s)</label>
                        <input
                            type="file"
                            id="coverPic"
                            name="coverPic"
                            className={`w-full p-2 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.coverPics ? "border border-red-500" : ""}`}
                            multiple
                            onChange={handleCoverPicChange}
                        />
                        {errors.coverPics && <p className="text-red-500 text-sm mt-1">{errors.coverPics}</p>}
                    </div>

                    {/* Display selected images */}
                    <div className="mb-4 col-span-2">
                        {formData.coverPics.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {formData.coverPics.map((file, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt="Cover"
                                            className="w-20 h-28 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeCoverPic(index)}
                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Author Field */}
                    <div className="mb-4">
                        <label htmlFor="author" className="block text-sm font-medium mb-1">Author</label>
                        <input
                            type="text"
                            id="author"
                            name="author"
                            className={`w-full p-2 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.author ? "border border-red-500" : ""}`}
                            value={formData.author}
                            onChange={handleChange}
                            placeholder="Enter Book Author"
                        />
                        {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
                    </div>

                    {/* Description Field */}
                    <div className="mb-4 col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            className={`w-full p-2 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? "border border-red-500" : ""}`}
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter Book Description"
                            rows="3"
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    {/* Category Field */}
                    <div className="mb-4">
                        <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
                        <input
                            type="text"
                            id="category"
                            name="category"
                            className={`w-full p-2 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.category ? "border border-red-500" : ""}`}
                            value={formData.category}
                            onChange={handleChange}
                            placeholder="Enter Book Category"
                        />
                        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                    </div>

                    {/* Publication Year Field */}
                    <div className="mb-4">
                        <label htmlFor="publicationYear" className="block text-sm font-medium mb-1">Publication Year</label>
                        <input
                            type="text"
                            id="publicationYear"
                            name="publicationYear"
                            className={`w-full p-2 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.publicationYear ? "border border-red-500" : ""}`}
                            value={formData.publicationYear}
                            onChange={handleChange}
                            placeholder="Enter Book Publication Year"
                        />
                        {errors.publicationYear && <p className="text-red-500 text-sm mt-1">{errors.publicationYear}</p>}
                    </div>

                    {/* Language Field */}
                    <div className="mb-4">
                        <label htmlFor="language" className="block text-sm font-medium mb-1">Language</label>
                        <input
                            type="text"
                            id="language"
                            name="language"
                            className={`w-full p-2 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.language ? "border border-red-500" : ""}`}
                            value={formData.language}
                            onChange={handleChange}
                            placeholder="Enter Book Language"
                        />
                        {errors.language && <p className="text-red-500 text-sm mt-1">{errors.language}</p>}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="text-center mt-8">
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition duration-300"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default List;