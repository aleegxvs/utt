require('dotenv').config();
const admin = require('firebase-admin');

// No ambiente de produção, essas credenciais vêm do arquivo .env
// No ambiente local, você deve baixar o arquivo serviceAccountKey.json do Console do Firebase

let serviceAccount;

try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        // Se estiver num servidor (Render/Railway), pode usar base64
        const buff = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64');
        serviceAccount = JSON.parse(buff.toString('ascii'));
    } else {
        // Usa o arquivo local
        serviceAccount = require('./serviceAccountKey.json');
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL || "https://uttomebr-default-rtdb.firebaseio.com" // Substitua se necessário
    });

    console.log("Firebase Admin SDK inicializado com sucesso.");
} catch (error) {
    console.error("Erro ao inicializar Firebase Admin SDK:");
    console.error("Certifique-se de que baixou o serviceAccountKey.json do Firebase Console e colocou na pasta db/.");
    // Não encerra o processo imediatamente para permitir que a API inicie e mostre o erro nos endpoints
}

const db = admin.firestore ? admin.firestore() : null;
const rtdb = admin.database ? admin.database() : null;

module.exports = { admin, db, rtdb };
