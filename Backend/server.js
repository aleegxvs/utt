require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const crypto = require('crypto');
const { db, auth } = require('./firebase-admin');

const app = express();

// ── SEGURANÇA: CORS RESTRITO ──
const allowedOrigins = [
    'http://localhost:5000',
    'http://localhost:3000',
    'http://127.0.0.1:5500',
    'http://localhost:8080',
    'https://uttomebr.web.app',
    'https://uttomebr.firebaseapp.com'
];

app.use(cors({
    origin: function (origin, callback) {
        // Permitir requisições sem origin (ex: ESP32 microcontrolador, curl local)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Bloqueado por política de CORS de segurança'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10kb' })); // Proteção contra Payload Flooding

// ── SEGURANÇA: RATE LIMITER EM MEMÓRIA ──
const rateLimits = new Map();

function rateLimiter({ windowMs = 60 * 1000, max = 10, message = 'Muitas requisições. Tente novamente mais tarde.' } = {}) {
    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();
        const clientData = rateLimits.get(ip) || { count: 0, resetTime: now + windowMs };

        if (now > clientData.resetTime) {
            clientData.count = 1;
            clientData.resetTime = now + windowMs;
        } else {
            clientData.count++;
        }

        rateLimits.set(ip, clientData);

        if (clientData.count > max) {
            return res.status(429).json({ error: message });
        }
        next();
    };
}

// ── SEGURANÇA: MIDDLEWARE DE AUTENTICAÇÃO OBRIGATÓRIA (FIREBASE ID TOKEN) ──
async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Acesso não autorizado: Token de autenticação ausente.' });
        }
        if (!auth) {
            return res.status(500).json({ error: 'Módulo de autenticação do Firebase indisponível no servidor.' });
        }
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(idToken);
        req.user = decodedToken; // Contém UID verificado e legítimo
        next();
    } catch (err) {
        console.error("Falha na validação de token:", err.message);
        return res.status(401).json({ error: 'Sessão inválida ou expirada. Faça login novamente.' });
    }
}

// Constantes
const EXPIRATION_MINUTES = 5;

// ── SEGURANÇA: CSPRNG (Criptografia Segura com crypto.randomBytes) ──
function generatePairingCode() {
    // Caracteres alfanuméricos sem I, O, 0, 1 (evita ambiguidade e falhas humanas)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    const bytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
        code += chars[bytes[i] % chars.length];
    }
    return code;
}

// ── ROTAS DA API ──

// Health Check oficial
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'UTOME API',
        version: '1.4.0'
    });
});

// 1. Gerar um novo código de pareamento (Requer Autenticação + Rate Limiter)
app.post('/api/pair/generate', requireAuth, rateLimiter({ windowMs: 60 * 1000, max: 5 }), async (req, res) => {
    try {
        const uid = req.user.uid; // Extraído do token criptográfico verificado

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

// 2. Vincular Dispositivo (Chamado pelo ESP32 — Rate Limiter Anti-Brute-Force)
app.post('/api/pair/link', rateLimiter({ windowMs: 60 * 1000, max: 10, message: 'Muitas tentativas. Bloqueado temporariamente por segurança.' }), async (req, res) => {
    try {
        const { code, device_id } = req.body;
        
        if (!code || !device_id) {
            return res.status(400).json({ error: 'code e device_id são obrigatórios.' });
        }

        // Validação de entrada
        if (typeof code !== 'string' || code.trim().length !== 6) {
            return res.status(400).json({ error: 'Código deve conter exatamente 6 caracteres.' });
        }

        if (typeof device_id !== 'string' || device_id.length > 50 || !/^[A-Za-z0-9_-]+$/.test(device_id)) {
            return res.status(400).json({ error: 'Identificador device_id inválido.' });
        }

        if (!db) {
            return res.status(500).json({ error: 'Firestore não inicializado.' });
        }

        const cleanCode = code.trim().toUpperCase();
        const codeRef = db.collection('pairing_codes').doc(cleanCode);
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
            device_id: device_id.trim()
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
    console.log(`API do UTOME rodando com segurança ativa na porta ${PORT}`);
});
