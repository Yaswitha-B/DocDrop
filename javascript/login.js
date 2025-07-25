import * as ENV from './env.js';
import * as Appwrite from "https://cdn.jsdelivr.net/npm/appwrite@13.0.0/+esm";

const client = new Appwrite.Client()
  .setEndpoint(ENV.ENDPOINT)
  .setProject(ENV.PROJECT_ID);     

const account = new Appwrite.Account(client);

const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const currentUser = await account.get();
    message.textContent = "⚠️ Already logged in. Redirecting...";
    message.style.color = "orange";
    window.location.href = "dashboard.html";

  } catch {
    // if no session exists, next part creates it
  }

  try {
    await account.createEmailSession(email, password);

    message.textContent = "✅ Login successful!";
    message.style.color = "green";
    window.location.href = "dashboard.html"

  } catch (error) {
    console.error("❌ Login Error:", error);

    if (error.message.includes("user")) {
      message.textContent = "❌ No user found with this email.";
    } else if (error.message.includes("credentials")) {
      message.textContent = "❌ Incorrect password.";
    } else {
      message.textContent = "❌ " + error.message;
    }
    message.style.color = "red";
  }
});
