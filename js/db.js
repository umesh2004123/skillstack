import { db, auth } from './firebase-config.js';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// === User Management ===

/**
 * Creates or updates a user document in Firestore on login.
 */
export async function syncUserToDB(user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    const isAdmin = (user.email === "umeshvalavala2004@gmail.com");

    if (!userSnap.exists()) {
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            isPremium: isAdmin, // Auto-grant if admin
            accessRequested: false,
            accessStatus: isAdmin ? "approved" : "none",
            createdAt: new Date().toISOString()
        });
        console.log("User document created. Admin Status:", isAdmin);
    } else {
        // Force update premium status if it's the admin logging in (fix existing doc)
        if (isAdmin && !userSnap.data().isPremium) {
            await updateDoc(userRef, { isPremium: true });
            console.log("Admin privileges restored for existing user.");
        }
        console.log("User document exists.");
    }
}

/**
 * Gets the current user's profile data, including premium status.
 */
export async function getUserProfile(uid) {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        const data = userSnap.data();

        // Self-Healing: If Admin email but not premium, fix it now.
        if (data.email === "umeshvalavala2004@gmail.com" && !data.isPremium) {
            console.log("Auto-fixing Admin Premium Status...");
            await updateDoc(userRef, { isPremium: true });
            data.isPremium = true; // Return correct data immediately
        }

        return data;
    } else {
        return null;
    }
}

/**
 * Sends a request for premium access.
 * Uses setDoc with merge to ensure doc exists.
 */
export async function requestPremiumAccess(uid) {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, {
        uid: uid, // Ensure UID is present if creating new
        accessRequested: true,
        accessStatus: "pending",
        rejectionMessage: "",
        requestDate: new Date().toISOString()
    }, { merge: true });
    return true;
}

// === Admin Functions ===

/**
 * Fetches all users who have requested access but are not yet premium.
 */
export async function getPendingRequests() {
    // Simplified query: Find anyone asking for access
    const q = query(collection(db, "users"), where("accessRequested", "==", true));
    const querySnapshot = await getDocs(q);
    const requests = [];
    querySnapshot.forEach((doc) => {
        // Double check they aren't already premium in code just in case
        const data = doc.data();
        if (!data.isPremium) {
            requests.push(data);
        }
    });
    return requests;
}

/**
 * Approves a user's premium request.
 */
export async function approvePremium(targetUid) {
    const userRef = doc(db, "users", targetUid);
    await updateDoc(userRef, {
        isPremium: true,
        accessRequested: false, // Clear the request flag as it's now granted
        accessStatus: "approved",
        rejectionMessage: ""
    });
    return true;
}

/**
 * Rejects a user's premium request.
 */
export async function rejectPremium(targetUid, rejectionMessage = "Your access request was rejected by the admin.") {
    const userRef = doc(db, "users", targetUid);
    await updateDoc(userRef, {
        isPremium: false,
        accessRequested: false,
        accessStatus: "rejected",
        rejectionMessage,
        rejectionAt: new Date().toISOString()
    });
    return true;
}

/**
 * Fetches ALL users (for admin dashboard).
 */
export async function getAllUsers() {
    const q = query(collection(db, "users"));
    const querySnapshot = await getDocs(q);
    const users = [];
    querySnapshot.forEach((doc) => {
        users.push(doc.data());
    });
    return users;
}

// === Activity & Progress Tracking ===

/**
 * Logs a user visit for the current day.
 * Store as a map: activityLog: { "2024-01-01": true }
 */
export async function logUserVisit(uid) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const userRef = doc(db, "users", uid);

    // key must be dynamic, so we use computed property name
    // We use updateDoc because user must exist to log visit
    // but setDoc with merge is safer if unsure. Let's use setDoc merge.
    const updateData = {};
    updateData[`activityLog.${today}`] = true;
    updateData['lastActive'] = new Date().toISOString();

    await updateDoc(userRef, updateData).catch(async (err) => {
        // If doc doesn't exist or other error, try setDoc
        await setDoc(userRef, {
            activityLog: { [today]: true },
            lastActive: new Date().toISOString()
        }, { merge: true });
    });
}

/**
 * Marks a course as completed.
 * courseId should be a unique string (e.g., "python", "aptitude").
 */
export async function updateCourseProgress(uid, courseId) {
    const userRef = doc(db, "users", uid);

    const updateData = {};
    updateData[`progress.${courseId}`] = {
        completed: true,
        completedAt: new Date().toISOString()
    };

    await updateDoc(userRef, updateData).catch(async (err) => {
        await setDoc(userRef, {
            progress: {
                [courseId]: {
                    completed: true,
                    completedAt: new Date().toISOString()
                }
            }
        }, { merge: true });
    });
    return true;
}

/**
 * Stores a user message for admin review and reply.
 */
export async function sendAdminMessage({ uid, email, displayName, message }) {
    await addDoc(collection(db, "adminMessages"), {
        uid,
        email,
        displayName,
        message,
        createdAt: new Date().toISOString(),
        status: "new",
        adminResponse: ""
    });
    return true;
}

/**
 * Fetches all user messages for the admin portal.
 */
export async function getAdminMessages() {
    const querySnapshot = await getDocs(collection(db, "adminMessages"));
    const messages = [];
    querySnapshot.forEach((messageDoc) => {
        messages.push({
            id: messageDoc.id,
            ...messageDoc.data()
        });
    });

    return messages.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

/**
 * Fetches admin message threads for a single user.
 */
export async function getUserAdminMessages(uid) {
    const q = query(collection(db, "adminMessages"), where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    const messages = [];
    querySnapshot.forEach((messageDoc) => {
        messages.push({
            id: messageDoc.id,
            ...messageDoc.data()
        });
    });

    return messages.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

/**
 * Saves an admin response on a message thread.
 */
export async function respondToAdminMessage(messageId, response) {
    const messageRef = doc(db, "adminMessages", messageId);
    await updateDoc(messageRef, {
        adminResponse: response,
        status: "responded",
        respondedAt: new Date().toISOString()
    });
    return true;
}

/**
 * Saves a user's learning status for a specific item.
 * status should be one of: "not-started", "in-progress", "completed".
 */
export async function updateLearningItemStatus(uid, itemId, status) {
    const userRef = doc(db, "users", uid);
    const now = new Date().toISOString();
    const itemStatus = {
        status,
        completed: status === "completed",
        updatedAt: now
    };

    if (status === "in-progress") {
        itemStatus.startedAt = now;
    }

    if (status === "completed") {
        itemStatus.completedAt = now;
    }

    const updateData = {};
    updateData[`progress.${itemId}`] = itemStatus;

    await updateDoc(userRef, updateData).catch(async () => {
        await setDoc(userRef, {
            progress: {
                [itemId]: itemStatus
            }
        }, { merge: true });
    });

    return itemStatus;
}
