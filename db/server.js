require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { db } = require('./firebase-admin'); // Assume inicialização bem sucedida se serviceAccountKey estiver presente

const app = express();
app.use(cors());
app.use(express.json());

// Constantes
const EXPIRATION_MINUTES = 5;

// Função utilitária para gerar código aleatório (6 caracteres alfanuméricos)
function generatePairingCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// ── ROTAS DA API ──

// 1. Gerar um novo código de pareamento (Chamado pelo site/dashboard)
app.post('/api/pair/generate', async (req, res) => {
    try {
        const { uid } = req.body;
        if (!uid) {
            return res.status(400).json({ error: 'UID do usuário é obrigatório.' });
        }

        if (!db) {
            return res.status(500).json({ error: 'Firestore não inicializado (Falta serviceAccountKey.json).' });
        }

        const code = generatePairingCode();
        const expiresAt = Date.now() + (EXPIRATION_MINUTES * 60 * 1000);

        // Salvar na coleção 'pairing_codes'
        await db.collection('pairing_codes').doc(code).set({
            uid: uid,
            expiresAt: expiresAt,
            createdAt: Date.now()
        });

        res.json({
            success: true,
            code: code,
            expiresIn: EXPIRATION_MINUTES * 60 // Segundos
        });

    } catch (error) {
        console.error("Erro ao gerar código:", error);
        res.status(500).json({ error: 'Erro interno ao gerar código.' });
    }
});

// 2. Vincular Dispositivo (Chamado pelo ESP32)
app.post('/api/pair/link', async (req, res) => {
    try {
        const { code, device_id } = req.body;
        
        if (!code || !device_id) {
            return res.status(400).json({ error: 'code e device_id são obrigatórios.' });
        }
        if (!db) {
            return res.status(500).json({ error: 'Firestore não inicializado.' });
        }

        const codeRef = db.collection('pairing_codes').doc(code.toUpperCase());
        const docSnap = await codeRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({ error: 'Código inválido ou não encontrado.' });
        }

        const data = docSnap.data();

        // Verificar se expirou
        if (Date.now() > data.expiresAt) {
            await codeRef.delete(); // Já apaga
            return res.status(400).json({ error: 'Código expirado.' });
        }

        // Código válido! Vincular o dispositivo ao usuário
        const userUid = data.uid;

        // Atualizar o perfil do usuário com o device_id
        await db.collection('users').doc(userUid).update({
            device_id: device_id
        });

        // Apagar o código para que não seja reutilizado
        await codeRef.delete();

        res.json({
            success: true,
            message: 'Dispositivo vinculado com sucesso!',
            uid: userUid
        });

    } catch (error) {
        console.error("Erro ao vincular dispositivo:", error);
        res.status(500).json({ error: 'Erro interno ao vincular.' });
    }
});

// ── CRON JOB (Limpeza de códigos expirados) ──
// Roda a cada minuto
cron.schedule('* * * * *', async () => {
    if (!db) return;
    try {
        const now = Date.now();
        const expiredQuery = await db.collection('pairing_codes')
            .where('expiresAt', '<', now)
            .get();
        
        if (expiredQuery.empty) return;

        const batch = db.batch();
        expiredQuery.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        console.log(`[Cron] Removidos ${expiredQuery.size} códigos de pareamento expirados.`);
    } catch (error) {
        console.error("[Cron] Erro ao limpar códigos:", error);
    }
});

// ── START SERVER ──
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API do UTOME (Serviço de Pareamento) rodando na porta ${PORT}`);
});
