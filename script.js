// Simple script for navigation and interactivity
function learnMore() {
  showSection('features');
}

document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    this.classList.add('active');
    const sectionId = this.getAttribute('href').substring(1);
    showSection(sectionId);
  });
});

function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  document.getElementById('response').textContent = "✅ Message sent successfully!";
  this.reset();
});
