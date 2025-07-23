import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// ✅ Firebase config (your actual keys)
const firebaseConfig = {
  apiKey: "AIzaSyCcFtubHmsOQdm0U_7rU-Yvjgj3U7fb8kA",
  authDomain: "docdrop-a2e10.firebaseapp.com",
  projectId: "docdrop-a2e10",
  storageBucket: "docdrop-a2e10.firebasestorage.app",
  messagingSenderId: "805124077909",
  appId: "1:805124077909:web:090451de707f9336f897dc",
  measurementId: "G-DEVERKRB8D"
};

// ✅ Initialize Firebase app and services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Get the form and message element
const form = document.getElementById("registerForm");
const message = document.getElementById("message");

// ✅ Form submission event
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent page reload

  // ✅ Get all input values from the form
  const name = document.getElementById("name")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  const userid = document.getElementById("userid")?.value.trim();
  const department = document.getElementById("department")?.value.trim();
  const year = document.getElementById("year")?.value.trim();
  const section = document.getElementById("section")?.value.trim();

  // 🧪 Debug: show form values in the console
  console.log("📥 Form Data Submitted:", { name, email, userid, department, year, section });

  try {
    // ✅ Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    console.log("🔥 Writing to Firestore:", {
  name,
  email,
  userid,
  department,
  year,
  section
});


    // ✅ Save additional details in Firestore
    await setDoc(doc(db, "users", uid), {
      name,
      email,
      userid,
      department,
      year,
      section,
      createdAt: new Date()
    });

    // ✅ Show success message and clear the form
    message.textContent = "🎉 Registered successfully!";
    message.style.color = "green";
    form.reset();
  } catch (error) {
    console.error("❌ Registration Error:", error.code, error.message);
    if (error.code === "auth/email-already-in-use") {
      message.textContent = "❌ Email already registered.";
    } else if (error.code === "auth/invalid-email") {
      message.textContent = "❌ Invalid email address.";
    } else if (error.code === "auth/weak-password") {
      message.textContent = "❌ Password too weak (minimum 6 characters).";
    } else {
      message.textContent = "❌ " + error.message;
    }
    message.style.color = "red";
  }
});
