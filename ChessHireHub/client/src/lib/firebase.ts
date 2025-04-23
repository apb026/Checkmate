import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { apiRequest } from "./queryClient";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopment",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "chess-interview"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "chess-interview",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "chess-interview"}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:1234567890abcdef",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

// Google authentication
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Extract user info from Google auth result
    const user = result.user;
    const googleId = user.uid;
    const email = user.email || "";
    const firstName = user.displayName?.split(" ")[0] || "";
    const lastName = user.displayName?.split(" ").slice(1).join(" ") || "";
    const profilePictureUrl = user.photoURL || "";
    
    // Register with our backend
    const response = await apiRequest("POST", "/api/auth/google", {
      googleId,
      email,
      firstName,
      lastName,
      profilePictureUrl
    });
    
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Upload resume to Firebase storage
export const uploadResumeToFirebase = async (file: File) => {
  try {
    const fileExtension = file.name.split('.').pop();
    const filename = `resumes/${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, filename);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    return { filename: file.name, fileUrl: downloadURL };
  } catch (error) {
    console.error("Error uploading resume:", error);
    throw error;
  }
};

// Logout
export const logoutFromFirebase = async () => {
  try {
    await signOut(auth);
    // Also logout from our backend
    await apiRequest("POST", "/api/auth/logout", {});
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export default { signInWithGoogle, uploadResumeToFirebase, logoutFromFirebase };
