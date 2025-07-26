import * as ENV from './env.js';
import * as Appwrite from "https://cdn.jsdelivr.net/npm/appwrite@13.0.0/+esm";

const client = new Appwrite.Client()
  .setEndpoint(ENV.ENDPOINT)
  .setProject(ENV.PROJECT_ID); 

const account = new Appwrite.Account(client);

let userEmail = '';
console.log('Checking user session in dashboard.js...');

try {
  const user = await account.get();
  userEmail = user.email;
  document.getElementById('userEmail').textContent = userEmail;
  console.log('✅ User session found:', userEmail);
} catch (error) {
  console.error('❌ No user session found or error getting user:', error);
  window.location.href = 'login.html';
} 

const subjectMap = {
  CSE: ["DBMS", "DSA", "OS", "CN", "AI", "Other"],
  ECE: ["VLSI", "Signal Processing", "EM Theory", "Other"],
  MECH: ["Thermodynamics", "Machine Design", "Fluid Mechanics", "Other"],
  CIVIL: ["Structural Analysis", "Concrete Tech", "Transportation Engg", "Other"],
  EEE: ["Power Systems", "Control Systems", "Electrical Machines", "Other"]
};

const departmentFilter = document.getElementById('departmentFilter');
const subjectFilter = document.getElementById('subjectFilter');
const customSubjectInput = document.getElementById('customSubject');
const searchBtn = document.getElementById('searchBtn');
const resultsContainer = document.getElementById('resultsContainer');

departmentFilter.addEventListener('change', () => {
  const selectedDepartment = departmentFilter.value;
  subjectFilter.innerHTML = '<option value="">Select Subject</option>'; 
  customSubjectInput.style.display = 'none';

  if (selectedDepartment && subjectMap[selectedDepartment]) {
    subjectMap[selectedDepartment].forEach(subject => {
      const option = document.createElement('option');
      option.value = subject;
      option.textContent = subject;
      subjectFilter.appendChild(option);
    });
    subjectFilter.disabled = false;
  } else {
    subjectFilter.disabled = true;
  }
});

subjectFilter.addEventListener('change', () => {
  customSubjectInput.style.display = subjectFilter.value === 'Other' ? 'block' : 'none';
});

searchBtn.addEventListener('click', searchFiles);

async function getFileData(fileId) {
  const storage = new Appwrite.Storage(client);
  try {
    const downloadUrl = storage.getFileDownload(ENV.BUCKET_ID, fileId).href;
    console.log(`✅ Download URL for fileId ${fileId}:`, downloadUrl);
    return downloadUrl;
  } catch (error) {
    console.error(`❌ Error fetching file data for fileId ${fileId}:`, error);
    return null;
  }
}

const databases = new Appwrite.Databases(client);

async function fetchDocuments(queries = []) {
    try {
        const response = await databases.listDocuments(ENV.DATABASE_ID, ENV.COLLECTION_ID, queries);
        return response.documents;
    } catch (error) {
        console.error('Error fetching documents:', error);
        return [];
    }
}

async function searchByFileName(fileName) {
    if (!fileName) return null;
    console.log('Searching by fileName:', fileName);
    return fetchDocuments([Appwrite.Query.search('fileName', fileName)]);
}

async function searchByUserId(userId) {
    if (!userId) return null;
    console.log('Searching by userId:', userId);
    return fetchDocuments([Appwrite.Query.equal('userid', userId)]);
}

async function searchByDepartmentYearSubject(department, year, subject, customSubject) {
    const queries = [];
    if (department) {
        queries.push(Appwrite.Query.equal('department', department));
    }
    if (year) {
        queries.push(Appwrite.Query.equal('year', year));
    }
    if (subject && subject !== 'Other') {
        queries.push(Appwrite.Query.equal('subject', subject));
    } else if (subject === 'Other' && customSubject) {
        queries.push(Appwrite.Query.search('subject', customSubject));
    }
    if (queries.length === 0) return null;
    console.log('Searching by department/year/subject with queries:', queries);
    return fetchDocuments(queries);
}

function getIntersection(arrays) {
    if (arrays.length === 0) return [];
    if (arrays.includes(null)) return []; // If any search returned null, it means no criteria was met for that search type

    let intersection = new Set(arrays[0].map(doc => doc.$id));

    for (let i = 1; i < arrays.length; i++) {
        const currentIds = new Set(arrays[i].map(doc => doc.$id));
        intersection = new Set([...intersection].filter(id => currentIds.has(id)));
    }

    // Reconstruct documents from the first array based on intersection IDs
    const allDocs = new Map();
    arrays.forEach(arr => arr.forEach(doc => allDocs.set(doc.$id, doc)));

    return Array.from(intersection).map(id => allDocs.get(id));
}

async function searchFiles(e) {
    e.preventDefault();

    const fileName = document.getElementById('fileNameSearch').value.trim();
    const userId = document.getElementById('userIdSearch').value.trim();
    console.log('User ID from input for search:', userId);
    const selectedDepartment = departmentFilter.value;
    const selectedYear = document.getElementById('yearFilter').value;
    const selectedSubject = subjectFilter.value;
    const customSubject = customSubjectInput.value.trim();

    console.log('Search parameters:', { fileName, userId, selectedDepartment, selectedYear, selectedSubject, customSubject });

    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = '';

    let allResults = [];

    const fileNameResults = await searchByFileName(fileName);
    const userIdResults = await searchByUserId(userId);
    const departmentYearSubjectResults = await searchByDepartmentYearSubject(selectedDepartment, selectedYear, selectedSubject, customSubject);

    const activeSearches = [
        fileNameResults,
        userIdResults,
        departmentYearSubjectResults
    ].filter(result => result !== null);

    if (activeSearches.length === 0) {
        // If no search criteria are provided, fetch all documents
        console.log('No search criteria provided, fetching all documents.');
        allResults = await fetchDocuments();
    } else {
        // Get the intersection of all active search results
        allResults = getIntersection(activeSearches);
    }

    console.log('Final search results:', allResults);

    if (allResults.length === 0) {
        resultsContainer.textContent = 'No documents found matching your criteria.';
        return;
    }

    for (const file of allResults) {
        console.log(`📄 Document ID: ${file.$id}, fileId in document: ${file.fileId}`);
        console.log('File details:', file);
        console.log('User ID from document:', file.userid);
        
        if (!file.fileId) {
            console.warn(`⚠️ Skipping file ${file.$id} — fileId is missing`);
            continue;
        }

        const fileDataUrl = await getFileData(file.fileId);
        if (fileDataUrl) {
            const fileInfoElement = displayFileInfo(file, fileDataUrl);
            resultsContainer.appendChild(fileInfoElement);
        }
    }
}

function displayFileInfo(file, fileDataUrl) {
    const container = document.createElement('div');
    container.classList.add('file-info');

    const title = document.createElement('h3');
    title.textContent = file.fileName || 'Unnamed File';
    container.appendChild(title);

    const userId = document.createElement('p');
    userId.textContent = `User ID: ${file.userid || 'N/A'}`;
    container.appendChild(userId);

    const description = document.createElement('p');
    description.textContent = `Description: ${file.description || 'No description'}`;
    container.appendChild(description);

    const downloadLink = document.createElement('a');
    downloadLink.href = fileDataUrl;
    downloadLink.textContent = 'Download File';
    downloadLink.target = '_blank';
    downloadLink.rel = 'noopener noreferrer';
    container.appendChild(downloadLink);

    return container;
}