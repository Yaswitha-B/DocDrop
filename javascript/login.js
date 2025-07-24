import * as Appwrite from "https://cdn.jsdelivr.net/npm/appwrite@13.0.0/+esm";

const client = new Appwrite.Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('6881bb6b0033e5d985b5');         // ✅ Your Project ID

const account = new Appwrite.Account(client);

const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    // ✅ Log in the user by creating a session
    await account.createEmailSession(email, password);

    message.textContent = "✅ Login successful!";
    message.style.color = "green";

    // 🛑 No redirect – stays on the page
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
