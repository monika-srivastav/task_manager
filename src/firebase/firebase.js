// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAIFzQeVyimm-YuzKmplyWK6w0jPCCByW4",
  authDomain: "task-manager-7ee8a.firebaseapp.com",
  projectId: "task-manager-7ee8a",
  storageBucket: "task-manager-7ee8a.firebasestorage.app",
  messagingSenderId: "438737625727",
  appId: "1:438737625727:web:6eec2f717af1d5e024154a",
  measurementId: "G-15QHF3E56T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);