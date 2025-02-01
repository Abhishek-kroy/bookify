import { createContext, useContext, useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signInWithPopup, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth'
import { collection, getDocs, getFirestore, addDoc, getDoc, doc, query, where, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { getDatabase, ref, set, get } from "firebase/database";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const FirebaseContext = createContext(null);

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: `${process.env.REACT_APP_apiKey}`,
    authDomain: `${process.env.REACT_APP_authDomain}`,
    projectId: `${process.env.REACT_APP_projectId}`,
    storageBucket: `${process.env.REACT_APP_storageBucket}`,
    messagingSenderId: `${process.env.REACT_APP_messagingSenderId}`,
    appId: `${process.env.REACT_APP_appId}`,
    databaseURL: `${process.env.REACT_APP_databaseURL}`
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const firebaseAuth = getAuth(firebaseApp);

const googleProvider = new GoogleAuthProvider();

const firestore = getFirestore(firebaseApp);

const realtimeDB = getDatabase(firebaseApp);

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider = (props) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const isLoggedIn = user ? true : false;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false); // Set loading to false after fetching user
        });

        return () => unsubscribe(); // Cleanup listener
    }, []);

    const logout = async () => {
        try {
            await signOut(firebaseAuth);
            setUser(null);
            navigate("/login");  // Ensure user is null before redirecting
        } catch (error) {
        }
    };

    const getBookListings = async () => {
        try {
            const querySnapshot = await getDocs(collection(firestore, "books"));
            const bookListings = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            return bookListings;  // Return an array of all the book listings
        } catch (error) {
            return error;  // Return the error in case of failure
        }
    };

    const handleCreateNewListing = async (
        name,
        isbn,
        price,
        coverPicUrls,
        author,
        description,
        category,
        publicationYear,
        language,
        Quantity
    ) => {
        try {
            if (!coverPicUrls || coverPicUrls.length === 0) {
                throw new Error("No cover picture URLs provided.");
            }

            if (!language) {
                return;
            }

            // Add book to Firestore
            const docRef = await addDoc(collection(firestore, "books"), {
                name,
                isbn,
                price,
                coverPics: coverPicUrls,
                author,
                description,
                category,
                publicationYear,
                language,
            });


            // Push Quantity to Firebase Realtime Database
            const quantityRef = ref(realtimeDB, `bookQuantity/${docRef.id}`);
            await set(quantityRef, Quantity);


            await addBookToSeller(docRef.id);

        } catch (error) {
        }
    };

    const addBookToSeller = async (bookId) => {
        try {
            // Check if the seller exists by querying the sellers collection based on the user's email
            const sellerQuery = query(
                collection(firestore, "sellers"),
                where("email", "==", user.email) // Match seller email
            );
            const querySnapshot = await getDocs(sellerQuery);

            if (!querySnapshot.empty) {
                // If seller exists, get the seller’s document reference
                const sellerDoc = querySnapshot.docs[0];
                const sellerId = sellerDoc.id;

                // Add the book to the seller's books sub-collection
                const sellerBooksRef = collection(firestore, "sellers", sellerId, "books");
                await setDoc(doc(sellerBooksRef, bookId), {
                    bookId: bookId,
                });

            } else {
                // If seller doesn't exist, create a new seller document
                const sellerRef = doc(collection(firestore, "sellers"));
                await setDoc(sellerRef, {
                    email: user.email,
                    name: user.displayName,
                });

                // Now add the book to the new seller's books collection
                const newSellerBooksRef = collection(firestore, "sellers", sellerRef.id, "books");
                await setDoc(doc(newSellerBooksRef, bookId), {
                    bookId: bookId,
                });
            }
        } catch (error) {
        }
    };



    // Firebase.js (or wherever you have the Firebase functions)
    const getBookListingById = async (bookId) => {
        const docRef = doc(firestore, 'books', bookId);
        const result = await getDoc(docRef)
        return result;
    };


    const signupUserWithEmailAndPassword = async (email, password) => {
        try {
            // Input validation (optional but recommended)
            if (!email || !password) {
                throw new Error("Email and password are required.");
            }

            // Firebase sign-up function
            const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
            const user = userCredential.user;

            return {
                success: true,
                message: "User registered successfully.",
                user,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    };

    // Function to sign in a user
    const signInUserWithEmailAndPassword = async (email, password) => {
        try {
            // Input validation (optional but recommended)
            if (!email || !password) {
                throw new Error("Email and password are required.");
            }

            // Firebase sign-in function
            const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
            const user = userCredential.user;

            return {
                success: true,
                message: "User signed in successfully.",
                user,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    };

    const signinWithGoogle = async () => {
        try {
            // Sign in with Google popup
            const result = await signInWithPopup(firebaseAuth, googleProvider);

            // Extract user information
            const user = result.user;

            // Provide success feedback
            alert(`Welcome, ${user.displayName}!`);
            return {
                success: true,
                user,
            };
        } catch (error) {
            // Handle errors
            alert(`Google Sign-In failed: ${error.message}`);
            return {
                success: false,
                message: error.message,
            };
        }
    };

    const purchaseWithId = async (bookId, selectedQuantity) => {
        const buyerEmail = user.email;
        try {
            const firestore = getFirestore();

            // Query to find the seller who has the book with the specified bookId
            const sellerQuery = query(
                collection(firestore, "sellers")
            );
            const querySnapshot = await getDocs(sellerQuery);

            let sellerFound = false;
            let sellerDocId = null;

            // Loop through the sellers and check their books sub-collection
            for (const sellerDoc of querySnapshot.docs) {
                const sellerId = sellerDoc.id;

                const sellerBooksRef = collection(firestore, "sellers", sellerId, "books");
                const bookQuery = query(sellerBooksRef, where("bookId", "==", bookId));
                const bookSnapshot = await getDocs(bookQuery);

                if (!bookSnapshot.empty) {
                    // Seller found
                    sellerFound = true;
                    sellerDocId = sellerId;
                    break; // Exit loop as we found the seller
                }
            }

            if (!sellerFound) {
                throw new Error("Seller not found for the provided book ID.");
            }

            // Add the order to the seller's orders collection
            const orderRef = collection(firestore, "sellers", sellerDocId, "orders");
            const orderData = {
                bookId: bookId,
                buyerEmail: buyerEmail,
                Quantity: selectedQuantity,
                status: "pending",
                purchaseDate: new Date(),
            };

            await addDoc(orderRef, orderData);
        } catch (error) {
        }
    };

    const reduceBookQuantity = async (bookId, quantityToReduce) => {
        if (!bookId || quantityToReduce <= 0) {
            return;
        }

        const quantityRef = ref(realtimeDB, `bookQuantity/${bookId}`);

        try {
            // Fetch the current quantity
            const snapshot = await get(quantityRef);
            if (!snapshot.exists()) {
                return;
            }

            let currentQuantity = snapshot.val();

            // Ensure we don't reduce below zero
            if (currentQuantity < quantityToReduce) {
                return;
            }

            // Update quantity in the database
            await set(quantityRef, currentQuantity - quantityToReduce);
        } catch (error) {
        }
    };

    const getOrdersByEmail = async () => {
        const userEmail = user.email;
        try {


            // Step 1: Fetch Seller by Email
            const sellersQuery = query(
                collection(firestore, "sellers"),
                where("email", "==", userEmail)
            );

            const sellersSnapshot = await getDocs(sellersQuery);

            if (sellersSnapshot.empty) {
                throw new Error("No seller found with this email.");
            }

            // Step 2: Get Seller ID (assuming only one seller exists per email)
            const sellerDoc = sellersSnapshot.docs[0];
            const userId = sellerDoc.id;

            // Step 3: Fetch Orders for the Seller
            const ordersQuery = query(collection(firestore, "sellers", userId, "orders"));

            const ordersSnapshot = await getDocs(ordersQuery);

            const fetchedOrders = [];
            ordersSnapshot.forEach((doc) => {
                fetchedOrders.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });

            return fetchedOrders;
        } catch (error) {
            throw new Error("Failed to load orders. Please try again later.");
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        if (!user || !user.email) {
            return { success: false, message: "You must be logged in to update orders." };
        }
    
        try {
            const userEmail = user.email;
            const sellersQuery = query(
                collection(firestore, "sellers"),
                where("email", "==", userEmail)
            );
    
            const sellersSnapshot = await getDocs(sellersQuery);
    
            if (sellersSnapshot.empty) {
                return { success: false, message: "No seller found with this email." };
            }
    
            // Get Seller ID
            const sellerDoc = sellersSnapshot.docs[0];
            const userId = sellerDoc.id;
    
            // Reference to the order document
            const orderRef = doc(firestore, "sellers", userId, "orders", orderId);
    
            // Update the order status
            await updateDoc(orderRef, { status: newStatus });
    
            return { success: true, message: "Order status updated successfully!" };
        } catch (error) {
            return { success: false, message: "Failed to update order status." };
        }
    };

    const addToCart = async (bookId) => {
        try {
            const userId = user?.uid;
            if (!userId) throw new Error("User not logged in");

            // Reference to the specific book in the cart
            const bookCartRef = doc(firestore, `user/${userId}/cart/${bookId}`);

            // Check if the book is already in the cart
            const bookDoc = await getDoc(bookCartRef);
            if (bookDoc.exists()) {
                return {
                    success: false,
                    message: "This book is already in your cart!",
                };
            }
            // If not in the cart, add it
            await setDoc(bookCartRef, {
                addedAt: new Date(),
            });

            return {
                success: true,
                message: "Book added to cart!",
            };
        } catch (error) {
            return {
                success: false,
                message: "Failed to add book to cart.",
            };
        }
    };

    const removeFromCart = async (bookId) => {
        try {
            const userId = user?.uid;
            if (!userId) throw new Error("User not logged in");

            // Reference to the specific book in the cart
            const bookCartRef = doc(firestore, `user/${userId}/cart/${bookId}`);

            // Check if the book exists in the cart
            const bookDoc = await getDoc(bookCartRef);
            if (!bookDoc.exists()) {
                return {
                    success: false,
                    message: "This book is not in your cart!",
                };
            }

            // Remove the book by deleting the document
            await deleteDoc(bookCartRef);

            return {
                success: true,
                message: "Book removed from cart!",
            };
        } catch (error) {
            return {
                success: false,
                message: "Failed to remove book from cart.",
            };
        }
    };

    const getCart = async () => {
        try {
            const userId = user?.uid;
            if (!userId) throw new Error("User not logged in");

            // Reference to the user's cart collection
            const cartRef = collection(firestore, `user/${userId}/cart`);
            const cartSnapshot = await getDocs(cartRef);

            // If no items in cart, return empty array
            if (cartSnapshot.empty) {
                return { success: true, cartItems: [] };
            }

            // Map the documents to an array of cart items
            const itemsArray = cartSnapshot.docs.map((doc) => ({
                bookId: doc.id,
                ...doc.data(),
            }));

            return { success: true, cartItems: itemsArray };

        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    return <FirebaseContext.Provider value={{updateOrderStatus, getCart, removeFromCart, addToCart, firebaseAuth, getOrdersByEmail, user, authLoading, logout, signupUserWithEmailAndPassword, realtimeDB, reduceBookQuantity, signInUserWithEmailAndPassword, signinWithGoogle, isLoggedIn, handleCreateNewListing, getBookListings, getBookListingById, purchaseWithId }}>
        {props.children}
    </FirebaseContext.Provider>
};