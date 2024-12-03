import { db } from "./firebaseConfig.js";
import { auth } from "./firebaseConfig.js";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// Firestore references
const bankRef = collection(db, "bank");

// DOM Elements
const balancesList = document.getElementById("balances-list");
const kidSelect = document.getElementById("kid-select");
const editKidSelect = document.getElementById("edit-kid-select");
const newBalanceInput = document.getElementById("new-balance");
const addKidNameInput = document.getElementById("add-kid-name");
const addKidBalanceInput = document.getElementById("add-kid-balance");
const newKidNameInput = document.getElementById("new-kid-name");
const historyList = document.getElementById("history-list");

// Authentication Check
function ensureAuthenticated() {
  if (!auth.currentUser) {
    alert("You need to be authenticated to perform this action.");
    throw new Error("User not authenticated.");
  }
}

// Fetch kids and update UI
async function fetchKids() {
  ensureAuthenticated();
  const snapshot = await getDocs(bankRef);
  const kids = [];
  snapshot.forEach((doc) => {
    kids.push({ id: doc.id, ...doc.data() });
  });
  updateKidsUI(kids);
}

// Update kids UI
function updateKidsUI(kids) {
  balancesList.innerHTML = '';
  kidSelect.innerHTML = '';
  editKidSelect.innerHTML = '';

  kids.forEach((kid) => {
    // Balance List
    const balanceItem = document.createElement('div');
    balanceItem.textContent = `${kid.name}: $${kid.balance}`;
    balancesList.appendChild(balanceItem);

    // Kid Select Options
    const option1 = document.createElement('option');
    option1.value = kid.id;
    option1.textContent = kid.name;
    kidSelect.appendChild(option1);

    const option2 = document.createElement('option');
    option2.value = kid.id;
    option2.textContent = kid.name;
    editKidSelect.appendChild(option2);
  });
}

// Add a kid
document.getElementById("add-kid-btn").addEventListener("click", async () => {
  ensureAuthenticated();
  const name = addKidNameInput.value;
  const balance = parseFloat(addKidBalanceInput.value);
  if (name && !isNaN(balance)) {
    await addDoc(bankRef, { name, balance, history: [] });
    alert(`Added ${name} with a balance of $${balance}`);
    fetchKids();
    addKidNameInput.value = '';
    addKidBalanceInput.value = '';
  } else {
    alert('Please enter a valid name and balance.');
  }
});

// Rename a kid
document.getElementById("rename-kid-btn").addEventListener("click", async () => {
  ensureAuthenticated();
  const selectedKid = editKidSelect.value;
  const newName = newKidNameInput.value;
  if (selectedKid && newName) {
    const kidDoc = doc(db, "bank", selectedKid);
    await updateDoc(kidDoc, { name: newName });
    alert(`Renamed kid to ${newName}`);
    fetchKids();
    newKidNameInput.value = '';
  } else {
    alert('Please select a kid and enter a new name.');
  }
});

// Remove a kid
document.getElementById("remove-kid-btn").addEventListener("click", async () => {
  ensureAuthenticated();
  const selectedKid = editKidSelect.value;
  if (selectedKid) {
    const kidDoc = doc(db, "bank", selectedKid);
    await deleteDoc(kidDoc);
    alert('Kid removed successfully.');
    fetchKids();
  } else {
    alert('Please select a kid to remove.');
  }
});

// Set balance for a kid
document.getElementById("set-balance-btn").addEventListener("click", async () => {
  ensureAuthenticated();
  const selectedKid = kidSelect.value;
  const newBalance = parseFloat(newBalanceInput.value);

  if (selectedKid && !isNaN(newBalance)) {
    const kidDoc = doc(db, "bank", selectedKid);
    const kidSnapshot = await getDoc(kidDoc);
    const kidData = kidSnapshot.exists() ? kidSnapshot.data() : {}; // Ensure kidData exists
    const priorBalance = kidData.balance ?? 0; // Default to 0 if balance is missing

    // Calculate the change
    const change = newBalance - priorBalance;
    const type = change > 0 ? "add" : "deduct";

    // Get current date details
    const now = new Date();
    const year = now.getFullYear().toString(); // Convert year to string for object key
    const month = (now.getMonth() + 1).toString(); // Convert month to string

    // Safely initialize `history` as an object
    let history = kidData.history;
    if (!history || typeof history !== "object" || Array.isArray(history)) {
      history = {}; // Force history to be an object
    }

    // Initialize year and month if not present
    if (!history[year]) history[year] = {};
    if (!history[year][month]) history[year][month] = [];

    // Add new transaction
    history[year][month].push({
      timestamp: now.toISOString(),
      change,
      type,
      priorBalance,
    });

    // Log the update object for debugging
    console.log("Update Object:", {
      balance: newBalance,
      history: history,
    });

    // Update Firestore
    await updateDoc(kidDoc, {
      balance: newBalance, // Ensure balance is valid
      history: history, // Ensure history is properly structured
    });

    alert(`Balance updated successfully!`);
    fetchKids();
    newBalanceInput.value = '';
  } else {
    alert('Please select a kid and enter a valid balance.');
  }
});

// View history for selected kid
document.getElementById("kid-select").addEventListener("change", async () => {
  const selectedKid = kidSelect.value;
  const selectedYear = parseInt(filterYear.value);
  const selectedMonth = parseInt(filterMonth.value);

  if (selectedKid) {
    const kidDoc = doc(db, "bank", selectedKid);
    const kidSnapshot = await getDoc(kidDoc);

    if (kidSnapshot.exists()) {
      const kidData = kidSnapshot.data();

      // Get transactions for the selected year and month
      const history = kidData.history || {};
      const monthlyHistory = history[selectedYear]?.[selectedMonth] || [];

      // Display transactions
      historyList.innerHTML = '';
      if (monthlyHistory.length === 0) {
        historyList.innerHTML = "<li>No transactions for this period.</li>";
      } else {
        monthlyHistory.forEach((entry) => {
          const listItem = document.createElement("li");
          listItem.textContent = `${new Date(entry.timestamp).toLocaleString()}: ${
            entry.type === "add" ? "+" : "-"
          }$${entry.change} (Prior: $${entry.priorBalance})`;
          historyList.appendChild(listItem);
        });
      }
    } else {
      console.error("Kid document not found.");
      alert("Selected kid data not found!");
    }
  }
});  

// Sign In Example
document.getElementById("sign-in-btn")?.addEventListener("click", async () => {
  const email = prompt("Enter your email:");
  const password = prompt("Enter your password:");
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Signed in successfully!");
    fetchKids();
  } catch (error) {
    alert("Authentication failed: " + error.message);
  }
});

// Sign Out Example
document.getElementById("sign-out-btn")?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    alert("Signed out successfully!");
  } catch (error) {
    alert("Sign out failed: " + error.message);
  }
});

// Initial Auth Check
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User signed in:", user.email);
    fetchKids();
  } else {
    console.log("User signed out.");
  }
});
