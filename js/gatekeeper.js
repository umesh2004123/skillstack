import { initAuthStateListener } from './auth.js';

// Configuration
const LOGIN_PAGE = new URL('../login.html', import.meta.url).href;
const PROFILE_PAGE = new URL('../profile.html', import.meta.url).href;

document.body.style.display = 'none'; // Hide content immediately

initAuthStateListener((user, profile) => {
    const ADMIN_EMAIL = "umeshvalavala2004@gmail.com";
    if (user && (user.email === ADMIN_EMAIL || (profile && profile.isPremium))) {
        // User is authorized (Admin or Premium)
        document.body.style.display = 'block';
        console.log("Access Granted");
    } else {
        // Not authorized
        if (!user) {
            alert("Please login to view this content.");
            window.location.href = LOGIN_PAGE;
        } else {
            alert("This is premium content. Please request access in your profile.");
            window.location.href = PROFILE_PAGE;
        }
    }
}, () => {
    // User logged out
    window.location.href = LOGIN_PAGE;
});
