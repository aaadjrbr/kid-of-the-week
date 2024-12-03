import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD9myB6phhwC9DzTnfok2tjKxc4aPvDVXY",
  authDomain: "son-of-the-week.firebaseapp.com",
  projectId: "son-of-the-week",
  storageBucket: "son-of-the-week.firebasestorage.app",
  messagingSenderId: "632406897939",
  appId: "1:632406897939:web:62d36dda966dcd565416e6",
  measurementId: "G-48RYQSMEFK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const auth = getAuth(app); // Added Firebase Authentication initialization

export { db, auth };
