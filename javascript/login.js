import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCcFtubHmsOQdm0U_7rU-Yvjgj3U7fb8kA",
  authDomain: "docdrop-a2e10.firebaseapp.com",
  projectId: "docdrop-a2e10",
  storageBucket: "docdrop-a2e10.firebasestorage.app",
  messagingSenderId: "805124077909",
  appId: "1:805124077909:web:090451de707f9336f897dc",
  measurementId: "G-DEVERKRB8D"
};

// Firebase Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Form
const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, password);
    message.textContent = "Login successful!";
    message.style.color = "green";

    //  Optional: Redirect to homepage
    setTimeout(() => {
      window.location.href = "../html/home.html"; // Replace with your actual homepage
    }, 1500);

  } catch (error) {
    console.error("❌ Login Error:", error.code);
    if (error.code === "auth/user-not-found") {
      message.textContent = "❌ No user found with this email.";
    } else if (error.code === "auth/wrong-password") {
      message.textContent = "❌ Incorrect password.";
    } else {
      message.textContent = "❌ " + error.message;
    }
    message.style.color = "red";
  }
});
