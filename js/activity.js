import { initAuthStateListener } from './auth.js';
import { logUserVisit } from './db.js';

// Automatically log visit when user is authenticated
initAuthStateListener((user) => {
    if (user) {
        logUserVisit(user.uid).then(() => {
            console.log("Visit logged for today.");
        }).catch(err => console.error("Error logging visit:", err));
    }
});
