import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getAnalytics } from "firebase/analytics"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAC-My_XxhPzTMDoSt6b3yFySpB5TLCy18",
  authDomain: "iadros-food-services.firebaseapp.com",
  projectId: "iadros-food-services",
  storageBucket: "iadros-food-services.firebasestorage.app",
  messagingSenderId: "679956873328",
  appId: "1:679956873328:web:aaab322155a0c0c30bf4b5",
  measurementId: "G-5FRYQ24T23",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

let analytics
if (typeof window !== "undefined") {
  analytics = getAnalytics(app)
}

export const actionCodeSettings = {
  url: process.env.NEXT_PUBLIC_APP_URL || "https://iadros-food-services.firebaseapp.com",
  handleCodeInApp: false,
}

export { analytics }
