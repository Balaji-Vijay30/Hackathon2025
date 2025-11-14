// Navigation links
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', function(e){
    e.preventDefault();
    const id = this.getAttribute('href').substring(1); // get section id from href
    showSection(id);

    // Update active class
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    this.classList.add('active');
  });
});

// Show Section with login check
function showSection(id){
  const loggedIn = localStorage.getItem("loggedIn") === "true";

  // Only block protected pages
  if((id==='addDetails' || id==='viewDetails') && !loggedIn){
    alert("Please sign in first to access this page.");
    return;
  }

  document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}


// Show Sign Up / Sign In
function showSignUp(){ showSection('signup'); }
function showSignIn(){ showSection('signin'); }

// Update Home buttons
function updateHomeButtons(){
  const loggedIn = localStorage.getItem("loggedIn") === "true";
  document.getElementById("homeButtons").style.display = loggedIn ? "none" : "block";
  document.getElementById("userActions").style.display = loggedIn ? "block" : "none";
}
window.onload = updateHomeButtons;


// On page load
window.onload = updateHomeButtons;

// Sign Up
document.getElementById('signupForm').addEventListener('submit', function(e){
  e.preventDefault();
  const username = document.getElementById('signupUsername').value;
  const password = document.getElementById('signupPassword').value;
  if(username && password){
    localStorage.setItem("username", username);
    localStorage.setItem("password", password);
    alert("Sign Up successful! Please Sign In.");
    showSignIn();
    this.reset();
  }
});

// Sign In
document.getElementById('signinForm').addEventListener('submit', function(e){
  e.preventDefault();
  const username = document.getElementById('signinUsername').value;
  const password = document.getElementById('signinPassword').value;
  const storedUser = localStorage.getItem("username");
  const storedPass = localStorage.getItem("password");

  if(username === storedUser && password === storedPass){
    localStorage.setItem("loggedIn","true");
    alert("Sign In successful!");
    updateHomeButtons();
    showSection('home');
    this.reset();
  } else {
    alert("Invalid username or password!");
  }
});

// Sign Out
function signOut(){
  localStorage.setItem("loggedIn","false");
  updateHomeButtons();
  showSection('home');
  alert("You have been signed out.");
}

// Add Details
document.getElementById('detailsForm').addEventListener('submit', function(e){
  e.preventDefault();
  if(localStorage.getItem("loggedIn") !== "true"){
    alert("Please sign in to add details.");
    return;
  }
  const name = document.getElementById('fullName').value;
  const email = document.getElementById('userEmail').value;
  const dob = document.getElementById('dob').value;

  if(name && email && dob){
    const userDetails = {name,email,dob};
    localStorage.setItem("userDetails",JSON.stringify(userDetails));
    alert("Details saved successfully!");
    this.reset();
  } else alert("All fields are required!");
});

// View Details Page
function showUserDetails(){
  if(localStorage.getItem("loggedIn") !== "true"){
    alert("Please sign in to view details.");
    return;
  }
  const userDetails = JSON.parse(localStorage.getItem("userDetails"));
  const container = document.getElementById('detailsDisplay');
  container.innerHTML = "";
  if(userDetails){
    container.innerHTML = `
      <div class="detail-row"><span class="label">Full Name:</span> ${userDetails.name}</div>
      <div class="detail-row"><span class="label">Email:</span> ${userDetails.email}</div>
      <div class="detail-row"><span class="label">Date of Birth:</span> ${userDetails.dob}</div>
    `;
    showSection('viewDetails');
  } else {
    alert("No details found. Please add your details first.");
    showSection('addDetails');
  }
}

// Bind View Details button
document.getElementById('viewDetailsBtn').addEventListener('click', showUserDetails);

// Contact Form
document.getElementById('contactForm').addEventListener('submit', function(e){
  e.preventDefault();
  document.getElementById('response').textContent = "✅ Message sent successfully!";
  this.reset();
});

// Document Vault
const uploadForm = document.getElementById('uploadForm');
const docList = document.getElementById('docList');

uploadForm.addEventListener('submit', function(e){
  e.preventDefault();

  if(localStorage.getItem("loggedIn") !== "true"){
    alert("Please sign in to upload documents.");
    return;
  }

  const fileInput = document.getElementById('docFile');
  const docName = document.getElementById('docName').value;

  if(fileInput.files.length === 0 || !docName){
    alert("Please select a file and enter a document name.");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function(e){
    // Get existing documents or empty array
    let docs = JSON.parse(localStorage.getItem("documents")) || [];
    // Store as {name, fileData, fileType}
    docs.push({name: docName, data: e.target.result, type: file.type});
    localStorage.setItem("documents", JSON.stringify(docs));
    alert("Document uploaded successfully!");
    fileInput.value = "";
    document.getElementById('docName').value = "";
    renderDocuments();
  };
  reader.readAsDataURL(file);
});

// Render uploaded documents
function renderDocuments(){
  const docs = JSON.parse(localStorage.getItem("documents")) || [];
  docList.innerHTML = "";

  if(docs.length === 0){
    docList.innerHTML = "<p>No documents uploaded yet.</p>";
    return;
  }

  docs.forEach((doc, index) => {
    const docCard = document.createElement('div');
    docCard.className = "feature";
    docCard.innerHTML = `
      <h4>${doc.name}</h4>
      <p>Type: ${doc.type}</p>
      <a href="${doc.data}" download="${doc.name}">Download</a>
    `;
    docList.appendChild(docCard);
  });
}

// Render documents whenever user opens Document Vault
document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', function(){
    if(this.textContent === "Document Vault"){
      renderDocuments();
    }
  });
});

