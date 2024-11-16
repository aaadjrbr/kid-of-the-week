import { db } from "./firebaseConfig.js";
import { collection, getDocs, onSnapshot, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const weeklyRankingDiv = document.getElementById("weeklyRanking");
const totalRankingDiv = document.getElementById("totalRanking");
const goalListDiv = document.getElementById("goalList");
const weekEndDisplay = document.getElementById("weekEndDisplay");

// Fetch and display rankings
async function fetchRankings() {
  try {
    const kidsSnapshot = await getDocs(collection(db, "kids"));
    const kids = [];

    kidsSnapshot.forEach((doc) => {
      const data = doc.data();
      kids.push({ name: doc.id, ...data });
    });

    // Sort by weekly points
    const weeklyRankings = [...kids].sort((a, b) => b.weeklyPoints - a.weeklyPoints);

    // Sort by total points
    const totalRankings = [...kids].sort((a, b) => b.totalPoints - a.totalPoints);

    // Update the weekly ranking section
    weeklyRankingDiv.innerHTML = "<h3>Weekly Points</h3>";
    weeklyRankings.forEach((kid, index) => {
      const isFirstPlace = index === 0 ? "first-place" : "";
      const rankEmoji = index === 0 ? "🏆" : index < 3 ? "😭" : index + 1; // Trophy for 1st, crying emoji for 2nd/3rd, number otherwise
      weeklyRankingDiv.innerHTML += `
        <p class="${isFirstPlace}">
          <span class="rank-icon">${rankEmoji}</span>
          <strong>${kid.name}:</strong> ${kid.weeklyPoints} points
        </p>
      `;
    });

// Update the total ranking section
totalRankingDiv.innerHTML = "<h3>Total Points</h3>";
totalRankings.forEach((kid, index) => {
  const isFirstPlace = index === 0 ? "first-place" : "";
  const rankEmoji = index === 0 ? "🏆" : index < 3 ? "😭" : index + 1; // Trophy for 1st, crying emoji for 2nd/3rd, number otherwise
  totalRankingDiv.innerHTML += `
    <p class="${isFirstPlace}">
      <span class="rank-icon">${rankEmoji}</span>
      <strong>${kid.name}:</strong> ${kid.totalPoints} points
    </p>
  `;
});
  } catch (error) {
    console.error("Error fetching rankings:", error);
  }
}

// Fetch and display goals
function fetchGoals() {
  try {
    const goalRef = collection(db, "goals");

    onSnapshot(goalRef, (snapshot) => {
      goalListDiv.innerHTML = "<h3>Current Goals</h3>";
      if (snapshot.empty) {
        goalListDiv.innerHTML += `
          <p style="color: #000000;">Queen Ana has not set a goal yet 👑</p>
        `;
      } else {
        snapshot.forEach((doc) => {
          const data = doc.data();
          goalListDiv.innerHTML += `
            <p><strong>${doc.id}:</strong> ${data.goalPoints} points required</p>
          `;
        });
      }
    });
  } catch (error) {
    console.error("Error fetching goals:", error);
  }
}

// Fetch and display week end date
async function fetchWeekEnd() {
  try {
    const weekEndRef = doc(db, "settings", "weekEnd");
    const weekEndSnap = await getDoc(weekEndRef);

    if (weekEndSnap.exists()) {
      const data = weekEndSnap.data();
      const rawDate = data.date; // Example: "2024-11-17"

      // Split the raw date and rearrange it to MM/DD/YYYY
      const [year, month, day] = rawDate.split("-");
      const formattedDate = `${month}/${day}/${year}`; // Format as MM/DD/YYYY

      weekEndDisplay.innerText = `Week ends on: ${formattedDate}`;
    } else {
      weekEndDisplay.innerText = "Week end date not set.";
    }
  } catch (error) {
    console.error("Error fetching week end date:", error);
  }
}

// Initialize the rankings and goals
fetchRankings();
fetchGoals();
fetchWeekEnd();
