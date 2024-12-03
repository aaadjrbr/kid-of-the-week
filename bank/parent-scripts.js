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
    const kidData = (await getDoc(kidDoc)).data();
    const priorBalance = kidData.balance;

    // Calculate the change
    const change = newBalance - priorBalance;
    const type = change > 0 ? "add" : "deduct";

    // Update the balance and history
    await updateDoc(kidDoc, {
      balance: newBalance,
      history: [
        ...kidData.history,
        {
          timestamp: new Date().toISOString(), // Use ISO string for full date and time
          change,
          type,
          priorBalance,
        },
      ],
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
    if (selectedKid) {
      const kidDoc = doc(db, "bank", selectedKid);
      const kidSnapshot = await getDoc(kidDoc);
  
      if (kidSnapshot.exists()) {
        const kidData = kidSnapshot.data();
  
        // Ensure `history` exists and is an array
        if (!Array.isArray(kidData.history)) {
          console.log(`History field is missing or invalid for kid: ${selectedKid}`);
          
          // Initialize `history` field as an empty array in Firestore
          await updateDoc(kidDoc, { history: [] });
          kidData.history = []; // Update local reference
        }
  
        // Display history
        historyList.innerHTML = '';
        kidData.history.forEach((entry) => {
          const listItem = document.createElement("li");
          listItem.textContent = `${entry.timestamp}: ${
            entry.type === "add" ? "+" : "-"
          }$${entry.change} (Prior: $${entry.priorBalance})`;
          historyList.appendChild(listItem);
        });
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
