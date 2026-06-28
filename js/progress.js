import { initAuthStateListener } from './auth.js';
import { updateCourseProgress } from './db.js';

let currentUser = null;
let courseId = null;
let isCompleted = false;

// 1. Determine Course ID from URL
// e.g., .../python.html -> "python"
const path = window.location.pathname;
const filename = path.substring(path.lastIndexOf('/') + 1);
courseId = filename.replace('.html', '');

// 2. Auth Listener
initAuthStateListener((user) => {
    currentUser = user;
    if (user) {
        // Optional: Check if already completed to disable listener?
        // keeping it simple for now.
    }
});

// 3. Scroll Listener
window.addEventListener('scroll', () => {
    if (!currentUser || isCompleted) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const bodyHeight = document.body.offsetHeight;

    // Trigger if within 50px of bottom
    if (scrollPosition >= bodyHeight - 50) {
        completeCourse();
    }
});

function completeCourse() {
    isCompleted = true;
    console.log(`Course ${courseId} completed!`);

    // UI Feedback
    showToast("Course Completed! 🎉");

    // Update DB
    updateCourseProgress(currentUser.uid, courseId).then(() => {
        console.log("Progress saved to DB.");
    });
}

function showToast(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.innerText = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.background = 'linear-gradient(to right, #00f260, #0575E6)';
    toast.style.color = 'white';
    toast.style.padding = '15px 25px';
    toast.style.borderRadius = '50px';
    toast.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
    toast.style.zIndex = '9999';
    toast.style.fontFamily = "'Poppins', sans-serif";
    toast.style.fontWeight = '600';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.5s ease-in-out';

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => toast.style.opacity = '1', 100);

    // Remove after 3s
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}
