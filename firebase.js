// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDP6ByjiUIkoY36JudVtgp2fMDw6kCpGv8",
  authDomain: "inventory-tracker-866c5.firebaseapp.com",
  projectId: "inventory-tracker-866c5",
  storageBucket: "inventory-tracker-866c5.appspot.com",
  messagingSenderId: "196254527614",
  appId: "1:196254527614:web:c6d8122a8c4e23db33682f",
  measurementId: "G-E08RWM35NR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore}