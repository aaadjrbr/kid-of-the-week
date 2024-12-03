import { db } from "./firebaseConfig.js";
import { collection, doc, getDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Firestore reference
const bankRef = collection(db, "bank");

// DOM Elements
const kidSelect = document.getElementById("kid-select");
const balanceAmount = document.getElementById("balance-amount");
const historyList = document.getElementById("history-list");
const filterMonth = document.getElementById("filter-month");
const filterYear = document.getElementById("filter-year");

// Populate month and year dropdowns
function populateDateFilters() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // Month is zero-indexed

  // Populate years (last 10 years including current year)
  for (let year = currentYear; year >= currentYear - 10; year--) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    filterYear.appendChild(option);

    // Set the current year as the default selection
    if (year === currentYear) {
      option.selected = true;
    }
  }

  // Populate months (1–12)
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  months.forEach((month, index) => {
    const option = document.createElement("option");
    option.value = index + 1; // Month value (1-12)
    option.textContent = month;
    filterMonth.appendChild(option);

    // Set the current month as the default selection
    if (index + 1 === currentMonth) {
      option.selected = true;
    }
  });
}

// Fetch all kids and populate dropdown
async function fetchKids() {
  const snapshot = await getDocs(bankRef);
  snapshot.forEach((doc) => {
    const kid = doc.data();
    const option = document.createElement("option");
    option.value = doc.id;
    option.textContent = kid.name;
    kidSelect.appendChild(option);
  });
}

// Fetch and display balance and history for the selected kid
async function fetchKidData(kidId) {
  const kidDoc = await getDoc(doc(bankRef, kidId));
  if (kidDoc.exists()) {
    const kidData = kidDoc.data();
    // Display balance
    balanceAmount.textContent = `$${kidData.balance}`;
    // Display filtered history
    displayFilteredHistory(kidData.history);
  } else {
    alert("Kid data not found!");
  }
}

// Filter and display history by month and year
function displayFilteredHistory(history) {
  const selectedMonth = parseInt(filterMonth.value);
  const selectedYear = parseInt(filterYear.value);

  historyList.innerHTML = ""; // Clear current history list

  // Filter history entries by month and year
  const filteredHistory = history.filter((entry) => {
    const [entryYear, entryMonth] = entry.date.split("-").map(Number); // Extract year and month
    return entryMonth === selectedMonth && entryYear === selectedYear;
  });

  // Display filtered history
  if (filteredHistory.length === 0) {
    historyList.innerHTML = "<li>No history for the selected period.</li>";
  } else {
    filteredHistory.forEach((entry) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${entry.date}: ${
        entry.type === "add" ? "+" : "-"
      }$${entry.change} (Prior: $${entry.priorBalance})`;
      historyList.appendChild(listItem);
    });
  }
}

// Event listener for selecting a kid
kidSelect.addEventListener("change", () => {
  const selectedKidId = kidSelect.value;
  if (selectedKidId) {
    fetchKidData(selectedKidId);
  }
});

// Event listener for filtering history
filterMonth.addEventListener("change", () => {
  const selectedKidId = kidSelect.value;
  if (selectedKidId) {
    fetchKidData(selectedKidId);
  }
});
filterYear.addEventListener("change", () => {
  const selectedKidId = kidSelect.value;
  if (selectedKidId) {
    fetchKidData(selectedKidId);
  }
});

// Initialize
populateDateFilters();
fetchKids();