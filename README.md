# **Kid of the Week 🎯**

Welcome to **Kid of the Week**, an engaging and fun web app designed for parents to motivate kids by rewarding their efforts through a point-based system. This app provides an interactive way to keep track of weekly achievements, set goals, and celebrate accomplishments.

---

## **Features**
1. **Add & Manage Kids**
   - Easily add kids to the leaderboard.
   - Assign or deduct points based on their activities.

2. **Weekly & Total Rankings**
   - Automatically tracks weekly points.
   - Displays total points for a long-term view of achievements.

3. **Goal Management**
   - Set specific goals with required points (e.g., "Christmas Present").
   - View all current goals in a dedicated section.

4. **Customizable Week End**
   - Parents can set a custom end date for the week.
   - Weekly points reset with the click of a button.

5. **Authentication**
   - Secure login system using Firebase Authentication.
   - Only logged-in users can make changes to the data.

6. **Session Caching**
   - Uses session storage to reduce database reads.
   - Refresh the info manually to fetch the latest updates.

---

## **How It Works**
1. **User Authentication**
   - Login with your email and password to access the dashboard.
   - Logout button appears when authenticated.

2. **Dashboard**
   - Manage points for kids, set goals, and reset weekly scores.
   - View the week’s end date and adjust it as needed.

3. **Rankings**
   - Weekly and total rankings are displayed dynamically.
   - Fun emojis (🏆 and 😭) highlight the top and runner-up positions.

4. **Refresh Info**
   - A dedicated button to fetch the latest data from the database.

---

## **Technologies Used**
1. **Frontend:**
   - **HTML5** for structure.
   - **CSS3** for styling (responsive design, animations, and hover effects).
   - **JavaScript** for interactivity and DOM manipulation.

2. **Backend:**
   - **Firebase Firestore** for real-time database management.
   - **Firebase Authentication** for user login and security.

3. **Tools:**
   - Google Fonts for typography.
   - Material Icons for icons.

---

## **Getting Started**
1. Clone the repository:
   ```bash
   git clone https://github.com/aaadjrbr/kid-of-the-week.git
   ```
2. Install dependencies (if applicable).
3. Update the `firebaseConfig.js` file with your Firebase project credentials.
4. Open the project in your browser to start using it!

---

## **Contributing**
Feel free to fork the repository, create a new branch, and submit a pull request. Contributions are always welcome!

---

## **License**
This project is licensed under the MIT License.
