import { createContext, useContext, useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signInWithPopup, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth'
import { collection, getDocs, getFirestore, addDoc, getDoc, doc, query, where, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { getDatabase, ref, set, get, runTransaction } from "firebase/database";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const FirebaseContext = createContext(null);

// Your web app's Firebase configuration
console.log(process.env.REACT_APP_apiKey);
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

    const handleCreateNewListing = async (name, isbn, price, coverPicUrls, author, description, category, publicationYear, language, Quantity) => {
        try {
            if (!coverPicUrls || coverPicUrls.length === 0) {
                throw new Error("No cover picture URLs provided.");
            }

            const docRef = await addDoc(collection(firestore, "books"), {
                name, isbn, price, coverPics: coverPicUrls, author, description, category, publicationYear, language, sellerId: user.uid
            });

            await set(ref(realtimeDB, `bookQuantity/${docRef.id}`), Quantity);
            await addBookToSeller(docRef.id);
        } catch (error) { console.error(error); }
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
        try {
            if (!bookId) {
                console.error("Invalid bookId provided");
                return null;
            }
            
            const docRef = doc(firestore, 'books', bookId);
            const result = await getDoc(docRef);
            
            if (result.exists()) {
                return {
                    id: result.id,  // Include the document ID
                    ...result.data(),
                };
            } else {
                console.log(bookId)
                console.log(`Book with ID ${bookId} not found`);
                return null;
            }
        } catch (error) {
            console.error("Error getting book by ID:", error);
            return null;
        }
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

    const purchaseWithId = async (bookId, selectedQuantity, bookName) => {
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
                name: bookName,
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

    const addToCart = async (book) => {
        try {
            const userId = user?.uid;
            if (!userId) throw new Error("User not logged in");

            console.log(book);
            console.log(`users/${userId}/cart/${book.id}`);

            // Reference to the specific book in the cart
            const bookCartRef = doc(firestore, `users/${userId}/cart/${book.id}`);

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

    const removeFromCart = async (book) => {
        try {
            const userId = user?.uid;
            console.log(book);
            console.log(`users/${userId}/cart/${book.id}`);
            if (!userId) throw new Error("User not logged in");

            // Reference to the specific book in the cart
            const bookCartRef = doc(firestore, `users/${userId}/cart/${book.id}`);

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
    
            // Corrected path: 'users' instead of 'user'
            const cartRef = collection(firestore, `users/${userId}/cart`);
            const cartSnapshot = await getDocs(cartRef);
    
            // If no items in cart, return empty array
            if (cartSnapshot.empty) {
                return { success: true, cartItems: [] };
            }
    
            // Map the documents to an array of cart items
            const itemsArray = cartSnapshot.docs.map((doc) => ({
                bookId: doc.id,  // Use document ID as bookId
                ...doc.data(),
            }));
    
            return { success: true, cartItems: itemsArray };
        } catch (error) {
            console.error("Get cart error:", error);
            return { success: false, error: error.message };
        }
    };

    const confirmPurchase = async (bookId, selectedQuantity, bookName, bookPrice) => {
        try {
            const firestore = getFirestore();
            const realtimeDB = getDatabase();
    
            if (!firebaseAuth.currentUser) {
                return { success: false, message: "User not logged in!" };
            }
    
            const userId = firebaseAuth.currentUser.uid;
            const userEmail = firebaseAuth.currentUser.email;
            const quantityRef = ref(realtimeDB, `bookQuantity/${bookId}`);
    
            // ✅ Fetch existing quantity before transaction
            const snapshot = await get(quantityRef);
            if (!snapshot.exists()) {
                return { success: false, message: "Book not found in database!" };
            }
    
            // ✅ Firebase Transaction to Update Quantity
            await runTransaction(quantityRef, (currentQuantity) => {
                if (currentQuantity === null || typeof currentQuantity !== "number") {
                    throw new Error("Invalid quantity data.");
                }
    
                if (currentQuantity < selectedQuantity) {
                    throw new Error("Insufficient stock!");
                }
    
                return currentQuantity - selectedQuantity; // ✅ Correct update
            });
    
            // ✅ Find Seller for this Book
            const sellersQuery = collection(firestore, "sellers");
            const sellerSnapshot = await getDocs(sellersQuery);
            let sellerId = null;
    
            for (const sellerDoc of sellerSnapshot.docs) {
                const sellerBooksRef = collection(firestore, "sellers", sellerDoc.id, "books");
                const bookQuery = query(sellerBooksRef, where("bookId", "==", bookId));
                const bookSnapshot = await getDocs(bookQuery);
                if (!bookSnapshot.empty) {
                    sellerId = sellerDoc.id;
                    break;
                }
            }
    
            if (!sellerId) {
                return { success: false, message: "Seller not found!" };
            }
    
            // ✅ Generate Order ID
            const orderId = `${userId}_${bookId}_${Date.now()}`;
    
            // ✅ Order Data
            const orderData = {
                orderId,
                buyerId: userId,
                buyerEmail: userEmail,
                sellerId,
                bookId,
                bookName,
                quantity: selectedQuantity,
                totalPrice: selectedQuantity * bookPrice, // Calculate total price using provided book price
                status: "Pending",
                purchaseDate: new Date().toISOString(),
            };
    
            // ✅ Save Order in Firestore for Buyer & Seller
            await setDoc(doc(firestore, "users", userId, "orders", orderId), orderData);
            await setDoc(doc(firestore, "sellers", sellerId, "orders", orderId), orderData);
            await setDoc(doc(firestore, "orders", orderId), orderData);
    
            return { success: true, message: "Order placed successfully!" };
        } catch (error) {
            console.error("Purchase error:", error);
            return { success: false, message: error.message || "Error placing order. Try again!" };
        }
    };

    return <FirebaseContext.Provider value={{ confirmPurchase, updateOrderStatus, getCart, removeFromCart, addToCart, firebaseAuth, getOrdersByEmail, user, authLoading, logout, signupUserWithEmailAndPassword, realtimeDB, reduceBookQuantity, signInUserWithEmailAndPassword, signinWithGoogle, isLoggedIn, handleCreateNewListing, getBookListings, getBookListingById, purchaseWithId }}>
        {props.children}
    </FirebaseContext.Provider>
};

/*
import { createContext, useContext, useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import {
  collection,
  getDocs,
  getFirestore,
  addDoc,
  getDoc,
  doc,
  query,
  where,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { getDatabase, ref, set, get, runTransaction } from "firebase/database";
import { useNavigate } from "react-router-dom";

// Create Firebase Context
const FirebaseContext = createContext(null);

// Initialize Firebase using environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_apiKey,
  authDomain: process.env.REACT_APP_authDomain,
  projectId: process.env.REACT_APP_projectId,
  storageBucket: process.env.REACT_APP_storageBucket,
  messagingSenderId: process.env.REACT_APP_messagingSenderId,
  appId: process.env.REACT_APP_appId,
  databaseURL: process.env.REACT_APP_databaseURL,
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();
const firestore = getFirestore(firebaseApp);
const realtimeDB = getDatabase(firebaseApp);

// Helper function to get or create a seller document for a user
const getOrCreateSeller = async (user) => {
  try {
    const sellerQuery = query(
      collection(firestore, "sellers"),
      where("email", "==", user.email)
    );
    const sellerSnapshot = await getDocs(sellerQuery);
    if (!sellerSnapshot.empty) {
      return sellerSnapshot.docs[0];
    } else {
      const sellerRef = doc(collection(firestore, "sellers"));
      await setDoc(sellerRef, {
        email: user.email,
        name: user.displayName,
      });
      // Return a simulated document object with an id and a data function
      return { id: sellerRef.id, data: () => ({ email: user.email, name: user.displayName }) };
    }
  } catch (error) {
    throw new Error(`Error getting or creating seller: ${error.message}`);
  }
};

// Helper function to find a seller who has the provided bookId in their subcollection
const findSellerForBook = async (bookId) => {
  const sellersSnapshot = await getDocs(collection(firestore, "sellers"));
  for (const sellerDoc of sellersSnapshot.docs) {
    const sellerBooksRef = collection(firestore, "sellers", sellerDoc.id, "books");
    const bookQuery = query(sellerBooksRef, where("bookId", "==", bookId));
    const bookSnapshot = await getDocs(bookQuery);
    if (!bookSnapshot.empty) {
      return sellerDoc;
    }
  }
  return null;
};

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const isLoggedIn = !!user;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Logout function
  const logout = async () => {
    try {
      await signOut(firebaseAuth);
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  // BOOK FUNCTIONS

  // Fetch all book listings from Firestore "books" collection
  const getBookListings = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, "books"));
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching book listings:", error.message);
      throw error;
    }
  };

  // Get a specific book listing by its ID
  const getBookListingById = async (bookId) => {
    if (!bookId) {
      console.error("Invalid bookId provided");
      return null;
    }
    try {
      const docRef = doc(firestore, "books", bookId);
      const result = await getDoc(docRef);
      if (result.exists()) {
        return { id: result.id, ...result.data() };
      } else {
        console.warn(`Book with ID ${bookId} not found`);
        return null;
      }
    } catch (error) {
      console.error("Error getting book by ID:", error.message);
      return null;
    }
  };

  // Create a new book listing along with its realtime quantity and add it to the seller's books subcollection
  const createNewListing = async (listingData, quantity) => {
    const {
      name,
      isbn,
      price,
      coverPicUrls,
      author,
      description,
      category,
      publicationYear,
      language,
    } = listingData;
    try {
      if (!coverPicUrls || coverPicUrls.length === 0) {
        throw new Error("No cover picture URLs provided.");
      }
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
        sellerId: user.uid,
      });
      // Set book quantity in the Realtime Database
      await set(ref(realtimeDB, `bookQuantity/${docRef.id}`), quantity);
      // Add the book to seller's subcollection
      await addBookToSeller(docRef.id);
      return { success: true, bookId: docRef.id };
    } catch (error) {
      console.error("Error creating new listing:", error.message);
      return { success: false, message: error.message };
    }
  };

  // Add the created book to the seller's books subcollection
  const addBookToSeller = async (bookId) => {
    try {
      const sellerDoc = await getOrCreateSeller(user);
      const sellerBooksRef = collection(firestore, "sellers", sellerDoc.id, "books");
      await setDoc(doc(sellerBooksRef, bookId), { bookId });
    } catch (error) {
      console.error("Error adding book to seller:", error.message);
      throw error;
    }
  };

  // AUTHENTICATION FUNCTIONS

  // Sign up a new user using email and password
  const signupUserWithEmailAndPassword = async (email, password) => {
    if (!email || !password) {
      return { success: false, message: "Email and password are required." };
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      return {
        success: true,
        message: "User registered successfully.",
        user: userCredential.user,
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Sign in an existing user using email and password
  const signInUserWithEmailAndPassword = async (email, password) => {
    if (!email || !password) {
      return { success: false, message: "Email and password are required." };
    }
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      return {
        success: true,
        message: "User signed in successfully.",
        user: userCredential.user,
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Sign in using Google authentication
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const signedInUser = result.user;
      return {
        success: true,
        user: signedInUser,
        message: `Welcome, ${signedInUser.displayName}!`,
      };
    } catch (error) {
      console.error("Google Sign-In error:", error.message);
      return { success: false, message: error.message };
    }
  };

  // PURCHASE FUNCTIONS

  // Simple purchase function by adding order to the seller's orders subcollection
  const purchaseWithId = async (bookId, selectedQuantity, bookName) => {
    if (!user) {
      return { success: false, message: "User not logged in" };
    }
    try {
      const sellerDoc = await findSellerForBook(bookId);
      if (!sellerDoc) {
        throw new Error("Seller not found for the provided book ID.");
      }
      const orderData = {
        bookId,
        buyerEmail: user.email,
        name: bookName,
        Quantity: selectedQuantity,
        status: "pending",
        purchaseDate: new Date(),
      };
      await addDoc(collection(firestore, "sellers", sellerDoc.id, "orders"), orderData);
      return { success: true, message: "Order placed successfully!" };
    } catch (error) {
      console.error("Error in purchaseWithId:", error.message);
      return { success: false, message: error.message };
    }
  };

  // Reduce the available book quantity in the Realtime Database
  const reduceBookQuantity = async (bookId, quantityToReduce) => {
    if (!bookId || quantityToReduce <= 0) return;
    const quantityRef = ref(realtimeDB, `bookQuantity/${bookId}`);
    try {
      const snapshot = await get(quantityRef);
      if (!snapshot.exists()) return;
      const currentQuantity = snapshot.val();
      if (currentQuantity < quantityToReduce) return;
      await set(quantityRef, currentQuantity - quantityToReduce);
    } catch (error) {
      console.error("Error reducing book quantity:", error.message);
    }
  };

  // Fetch orders based on the seller's email
  const getOrdersByEmail = async () => {
    if (!user) {
      return { success: false, message: "User not logged in" };
    }
    try {
      const sellerQuery = query(
        collection(firestore, "sellers"),
        where("email", "==", user.email)
      );
      const sellerSnapshot = await getDocs(sellerQuery);
      if (sellerSnapshot.empty) {
        throw new Error("No seller found with this email.");
      }
      const sellerId = sellerSnapshot.docs[0].id;
      const ordersSnapshot = await getDocs(collection(firestore, "sellers", sellerId, "orders"));
      const orders = ordersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return { success: true, orders };
    } catch (error) {
      console.error("Error fetching orders:", error.message);
      return { success: false, message: "Failed to load orders. Please try again later." };
    }
  };

  // Update the status of an order for a seller
  const updateOrderStatus = async (orderId, newStatus) => {
    if (!user) {
      return { success: false, message: "You must be logged in to update orders." };
    }
    try {
      const sellerQuery = query(
        collection(firestore, "sellers"),
        where("email", "==", user.email)
      );
      const sellersSnapshot = await getDocs(sellerQuery);
      if (sellersSnapshot.empty) {
        return { success: false, message: "No seller found with this email." };
      }
      const sellerId = sellersSnapshot.docs[0].id;
      const orderRef = doc(firestore, "sellers", sellerId, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
      return { success: true, message: "Order status updated successfully!" };
    } catch (error) {
      console.error("Error updating order status:", error.message);
      return { success: false, message: "Failed to update order status." };
    }
  };

  // CART FUNCTIONS

  // Add a book to the user's cart
  const addToCart = async (book) => {
    if (!user) return { success: false, message: "User not logged in" };
    try {
      const cartDocRef = doc(firestore, `users/${user.uid}/cart/${book.id}`);
      const bookDoc = await getDoc(cartDocRef);
      if (bookDoc.exists()) {
        return { success: false, message: "This book is already in your cart!" };
      }
      await setDoc(cartDocRef, { addedAt: new Date() });
      return { success: true, message: "Book added to cart!" };
    } catch (error) {
      console.error("Error adding to cart:", error.message);
      return { success: false, message: "Failed to add book to cart." };
    }
  };

  // Remove a book from the user's cart
  const removeFromCart = async (book) => {
    if (!user) return { success: false, message: "User not logged in" };
    try {
      const cartDocRef = doc(firestore, `users/${user.uid}/cart/${book.id}`);
      const bookDoc = await getDoc(cartDocRef);
      if (!bookDoc.exists()) {
        return { success: false, message: "This book is not in your cart!" };
      }
      await deleteDoc(cartDocRef);
      return { success: true, message: "Book removed from cart!" };
    } catch (error) {
      console.error("Error removing from cart:", error.message);
      return { success: false, message: "Failed to remove book from cart." };
    }
  };

  // Retrieve all cart items for the logged-in user
  const getCart = async () => {
    if (!user) return { success: false, message: "User not logged in" };
    try {
      const cartSnapshot = await getDocs(collection(firestore, `users/${user.uid}/cart`));
      const cartItems = cartSnapshot.empty
        ? []
        : cartSnapshot.docs.map((doc) => ({ bookId: doc.id, ...doc.data() }));
      return { success: true, cartItems };
    } catch (error) {
      console.error("Error fetching cart:", error.message);
      return { success: false, error: error.message };
    }
  };

  // Confirm purchase with realtime quantity update and order creation in multiple collections
  const confirmPurchase = async (bookId, selectedQuantity, bookName, bookPrice) => {
    if (!firebaseAuth.currentUser) {
      return { success: false, message: "User not logged in!" };
    }
    try {
      const userId = firebaseAuth.currentUser.uid;
      const userEmail = firebaseAuth.currentUser.email;
      const quantityRef = ref(realtimeDB, `bookQuantity/${bookId}`);

      // Check and update quantity atomically via transaction
      const snapshot = await get(quantityRef);
      if (!snapshot.exists()) {
        return { success: false, message: "Book not found in database!" };
      }
      await runTransaction(quantityRef, (currentQuantity) => {
        if (currentQuantity === null || typeof currentQuantity !== "number") {
          throw new Error("Invalid quantity data.");
        }
        if (currentQuantity < selectedQuantity) {
          throw new Error("Insufficient stock!");
        }
        return currentQuantity - selectedQuantity;
      });

      // Locate the seller for the book
      const sellerDoc = await findSellerForBook(bookId);
      if (!sellerDoc) {
        return { success: false, message: "Seller not found!" };
      }

      // Generate order data and store it in buyer's, seller's, and general orders collection
      const orderId = `${userId}_${bookId}_${Date.now()}`;
      const orderData = {
        orderId,
        buyerId: userId,
        buyerEmail: userEmail,
        sellerId: sellerDoc.id,
        bookId,
        bookName,
        quantity: selectedQuantity,
        totalPrice: selectedQuantity * bookPrice,
        status: "Pending",
        purchaseDate: new Date().toISOString(),
      };

      await setDoc(doc(firestore, "users", userId, "orders", orderId), orderData);
      await setDoc(doc(firestore, "sellers", sellerDoc.id, "orders", orderId), orderData);
      await setDoc(doc(firestore, "orders", orderId), orderData);

      return { success: true, message: "Order placed successfully!" };
    } catch (error) {
      console.error("Purchase error:", error.message);
      return { success: false, message: error.message || "Error placing order. Try again!" };
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        // Authentication
        firebaseAuth,
        user,
        authLoading,
        isLoggedIn,
        signupUserWithEmailAndPassword,
        signInUserWithEmailAndPassword,
        signInWithGoogle,
        logout,
        // Book Listings
        getBookListings,
        getBookListingById,
        createNewListing,
        // Cart
        addToCart,
        removeFromCart,
        getCart,
        // Orders
        getOrdersByEmail,
        updateOrderStatus,
        purchaseWithId,
        confirmPurchase,
        // Realtime DB Functionality
        reduceBookQuantity,
        realtimeDB,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

*/