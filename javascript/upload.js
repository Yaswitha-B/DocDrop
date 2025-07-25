import * as ENV from './env.js';
import * as Appwrite from "https://cdn.jsdelivr.net/npm/appwrite@13.0.0/+esm";

const client = new Appwrite.Client()
  .setEndpoint(ENV.ENDPOINT)
  .setProject(ENV.PROJECT_ID);

const storage = new Appwrite.Storage(client);
const databases = new Appwrite.Databases(client);

const form = document.getElementById("uploadForm");
const message = document.getElementById("message");

const departmentSelect = document.getElementById("department");
const subjectSelect = document.getElementById("subject");

const subjectMap = {
  CSE: ["DBMS", "DSA", "OS", "CN", "AI", "Other"],
  ECE: ["VLSI", "Signal Processing", "EM Theory", "Other"],
  MECH: ["Thermodynamics", "Machine Design", "Fluid Mechanics", "Other"],
  CIVIL: ["Structural Analysis", "Concrete Tech", "Transportation Engg", "Other"],
  EEE: ["Power Systems", "Control Systems", "Electrical Machines", "Other"]
};

const customSubjectInput = document.createElement("input");
customSubjectInput.type = "text";
customSubjectInput.id = "customSubject";
customSubjectInput.name = "customSubject";
customSubjectInput.placeholder = "Enter custom subject";
customSubjectInput.required = false;
customSubjectInput.style.display = "none";
subjectSelect.insertAdjacentElement("afterend", customSubjectInput);

// 👂 Department change triggers subject options
departmentSelect.addEventListener("change", () => {
  const selectedDept = departmentSelect.value.trim().toUpperCase();
  subjectSelect.innerHTML = `<option value="">Select Subject</option>`;
  customSubjectInput.style.display = "none";
  customSubjectInput.required = false;

  if (subjectMap[selectedDept]) {
    subjectMap[selectedDept].forEach(subject => {
      const option = document.createElement("option");
      option.value = subject;
      option.textContent = subject;
      subjectSelect.appendChild(option);
    });
  }
});

// 👂 Show custom input if "Other" selected
subjectSelect.addEventListener("change", () => {
  if (subjectSelect.value === "Other") {
    customSubjectInput.style.display = "block";
    customSubjectInput.required = true;
  } else {
    customSubjectInput.style.display = "none";
    customSubjectInput.required = false;
    customSubjectInput.value = "";
  }
});

// 🚀 Form submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = document.getElementById("fileInput").files[0];
  const userid = document.getElementById("userid").value.trim();
  const department = departmentSelect.value.trim();
  const selectedSubject = subjectSelect.value;
  const customSubject = customSubjectInput.value.trim();
  const subject = selectedSubject === "Other" ? customSubject : selectedSubject;
  const description = document.getElementById("description").value.trim();
  const year = document.getElementById("year").value;


  if (!file) {
    alert("Please select a file.");
    return;
  }

  if (!subject) {
    alert("Please select or enter a subject.");
    return;
  }

  try {
    const fileResponse = await storage.createFile(
      ENV.BUCKET_ID,
      Appwrite.ID.unique(),
      file,
      [
        Appwrite.Permission.read("any"),
        Appwrite.Permission.write("any")
      ]
    );

    await databases.createDocument(
      ENV.DATABASE_ID, 
      ENV.COLLECTION_ID,
      Appwrite.ID.unique(),
      {
        userid,
        department,
        subject,
        year,
        description,
        fileId: fileResponse.$id,
        fileName: fileResponse.name,
      }
    );

    message.textContent = "🎉 File uploaded and details saved!";
    message.style.color = "green";
    form.reset();
    customSubjectInput.style.display = "none";

  } catch (error) {
    console.error("❌ Upload Error:", error);
    message.textContent = "❌ " + error.message;
    message.style.color = "red";
  }
});
