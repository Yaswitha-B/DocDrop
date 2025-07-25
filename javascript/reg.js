import * as ENV from './env.js';
import * as Appwrite from "https://cdn.jsdelivr.net/npm/appwrite@13.0.0/+esm";

const client = new Appwrite.Client()
  .setEndpoint(ENV.ENDPOINT)
  .setProject(ENV.PROJECT_ID);

const account = new Appwrite.Account(client);
const databases = new Appwrite.Databases(client);

const form = document.getElementById("registerForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  const userid = document.getElementById("userid")?.value.trim();
  const department = document.getElementById("department")?.value.trim();
  const year = document.getElementById("year")?.value.trim();
  const section = document.getElementById("section")?.value.trim();

  try {
    const user = await account.create('unique()', email, password);
    const uid = user.$id;

    await databases.createDocument(
      ENV.DATABASE_ID,
      ENV.COLLECTION_ID,
      uid,
      {
        name,
        email,
        userid,
        department,
        year: parseInt(year),
        section,
      }
    );

    message.textContent = "🎉 Registered and data saved!";
    message.style.color = "green";
    form.reset();
  } catch (error) {
    console.error("❌ Registration Error:", error);
    message.textContent = "❌ " + error.message;
    message.style.color = "red";
  }
});
