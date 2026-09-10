import { auth, db } from './config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail, 
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

/**
 * Register a new user with Email and Password
 * @param {string} email 
 * @param {string} password 
 * @param {string} name 
 * @returns {Promise<UserCredential>}
 */
export async function registerUser(email, password, name) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create default profile in Firestore
        await setDoc(doc(db, "users", user.uid), {
            responsavel: {
                nome: name,
                email: email,
                telefone: ""
            },
            crianca: {
                nome: "Criança",
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

        return user;
    } catch (error) {
        throw error;
    }
}

/**
 * Login user
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<UserCredential>}
 */
export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw error;
    }
}

/**
 * Send password reset email
 * @param {string} email 
 * @returns {Promise<void>}
 */
export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        throw error;
    }
}

/**
 * Logout user
 * @returns {Promise<void>}
 */
export async function logoutUser() {
    try {
        await signOut(auth);
    } catch (error) {
        throw error;
    }
}

/**
 * Listen to auth state changes
 * @param {function} callback 
 */
export function listenAuthState(callback) {
    return onAuthStateChanged(auth, callback);
}
