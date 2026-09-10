import { auth, db } from './config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail, 
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const googleProvider = new GoogleAuthProvider();

/**
 * Creates or updates a user profile in Firestore.
 * Used after both E-mail and Google sign-ins to ensure the document exists.
 * @param {User} user - Firebase user object
 * @param {string|null} customName - Optional override for display name
 */
async function ensureUserProfile(user, customName = null) {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    // Only create if not already existing (preserves data on re-login)
    if (!docSnap.exists()) {
        const name = customName || user.displayName || "Responsável";
        const email = user.email || "";

        await setDoc(docRef, {
            responsavel: {
                nome: name,
                email: email,
                telefone: ""
            },
            crianca: {
                nome: "Meu Filho",
                idade: null,
                observacoes: ""
            },
            device_id: "",
            configuracoes: {
                device_name: "Meu UTOME",
                modo_calmante: false,
                sons_celebracao: true,
                modo_offline: false
            },
            createdAt: new Date().toISOString()
        });
    }
}

/**
 * Register a new user with Email and Password.
 * @param {string} email 
 * @param {string} password 
 * @param {string} name 
 */
export async function registerUser(email, password, name) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await ensureUserProfile(userCredential.user, name);
    return userCredential.user;
}

/**
 * Login user with Email and Password.
 * @param {string} email 
 * @param {string} password 
 */
export async function loginUser(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

/**
 * Sign in or sign up with Google.
 * Automatically creates a Firestore profile if it's the first access.
 */
export async function loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    await ensureUserProfile(result.user);
    return result.user;
}

/**
 * Send password reset email.
 * @param {string} email 
 */
export async function resetPassword(email) {
    await sendPasswordResetEmail(auth, email);
}

/**
 * Logout user.
 */
export async function logoutUser() {
    await signOut(auth);
}

/**
 * Listen to auth state changes.
 * @param {function} callback 
 */
export function listenAuthState(callback) {
    return onAuthStateChanged(auth, callback);
}
