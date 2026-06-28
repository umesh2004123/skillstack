import { db, auth, googleProvider } from './firebase-config.js';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { syncUserToDB, getUserProfile, logUserVisit } from './db.js';

// === Auth Actions ===

export async function loginWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        await syncUserToDB(user);
        window.location.href = new URL('../profile.html', import.meta.url).href; // Redirect to profile
    } catch (error) {
        console.error("Google Sign-in Error:", error);
        alert(error.message);
    }
}

export async function registerWithEmail(email, password, name) {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Update auth profile immediately
        await updateProfile(result.user, { displayName: name });
        await syncUserToDB({ ...result.user, displayName: name });
        window.location.href = new URL('../profile.html', import.meta.url).href;
    } catch (error) {
        console.error("Registration Error:", error);
        alert(error.message);
    }
}

export async function loginWithEmail(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = new URL('../profile.html', import.meta.url).href;
    } catch (error) {
        console.error("Login Error:", error);
        alert(error.message);
    }
}

export async function logout() {
    await signOut(auth);
    window.location.href = new URL('../index.html', import.meta.url).href; // Go back to home
}

export async function updateUserProfile(updates) {
    if (auth.currentUser) {
        try {
            await updateProfile(auth.currentUser, updates);
            // Also sync to DB to keep everything fresh
            await syncUserToDB(auth.currentUser);
            // alert("Profile updated successfully!"); // Caller handles alert
        } catch (error) {
            throw error; // Let caller handle error
        }
    }
}

export async function resetUserPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset email sent to " + email);
    } catch (error) {
        alert("Error sending reset email: " + error.message);
    }
}

// === State Listener ===

/**
 * Initializes UI elements based on auth state.
 * Pass in callbacks to update the UI (e.g. show/hide buttons).
 */
export function initAuthStateListener(onUserLoggedIn, onUserLoggedOut) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                // Log visit for activity heatmap
                logUserVisit(user.uid);

                // Fetch extended profile (for premium status)
                const profile = await getUserProfile(user.uid);
                onUserLoggedIn(user, profile);
            } catch (e) {
                console.error("Profile Fetch Error", e);
                // Still log them in even if profile fetch fails (fallback)
                onUserLoggedIn(user, null);
            }
        } else {
            onUserLoggedOut();
        }
    });
}
