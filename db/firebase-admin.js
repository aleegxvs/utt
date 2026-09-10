require('dotenv').config();
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

let serviceAccount;
let db = null;
let rtdb = null;

try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        const buff = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64');
        serviceAccount = JSON.parse(buff.toString('ascii'));
    } else {
        serviceAccount = require('./serviceAccountKey.json');
    }

    const app = initializeApp({
        credential: cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL || "https://uttomebr-default-rtdb.firebaseio.com"
    });
    
    db = getFirestore(app);
    // rtdb = getDatabase(app); // Se precisarmos do RTDB no futuro

    console.log("Firebase Admin SDK inicializado com sucesso.");
} catch (error) {
    console.error("Erro ao inicializar Firebase Admin SDK:", error);
}

module.exports = { db, rtdb };
