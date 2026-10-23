import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ضع هنا مفاتيح الربط الخاصة بك من موقع Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAvKE4rfr9JLFsDJ0bgs3YW6bZcXLbNORI",
  authDomain: "car-wash-system-a2e3e.firebaseapp.com",
  projectId: "car-wash-system-a2e3e",
  storageBucket: "car-wash-system-a2e3e.firebasestorage.app",
  messagingSenderId: "371290377075",
  appId: "1:371290377075:web:11369038d43acc41791306"
};

// تهيئة الاتصال بـ Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);