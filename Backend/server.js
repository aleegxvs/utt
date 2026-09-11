require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { db, rtdb, auth } = require('./firebase-admin');

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
        // Permitir requisições sem origin (ex: ESP32 microcontrolador, curl local, Postman)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Bloqueado por política de CORS de segurança'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-device-id', 'device-id']
}));

app.use(express.json({ limit: '10kb' })); // Proteção contra Payload Flooding

// ── SEGURANÇA: RATE LIMITER EM MEMÓRIA ──
const rateLimits = new Map();

function rateLimiter({ windowMs = 60 * 1000, max = 30, message = 'Muitas requisições. Tente novamente mais tarde.' } = {}) {
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

// Helper: Validador de formato de device_id
function isValidDeviceId(deviceId) {
    if (typeof deviceId !== 'string') return false;
    // Padrão UTOME-XXXXXX (6 caracteres alfanuméricos) ou variações seguras
    return /^UTOME-[A-Za-z0-9_-]{4,12}$/.test(deviceId.trim());
}

// Helper: Buscar proprietário do device_id no Firestore
async function getDeviceOwner(deviceId) {
    if (!db) return null;
    const cleanId = deviceId.trim();
    const snapshot = await db.collection('users').where('device_id', '==', cleanId).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { uid: doc.id, data: doc.data() };
}

// ── ROTAS DA API ──

// Health Check oficial
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'UTOME API',
        version: '2.0.0',
        rtdb_ready: !!rtdb,
        firestore_ready: !!db
    });
});

// ─────────────────────────────────────────────────────────────
// 1. ENDPOINTS DE DISPOSITIVO (ESP32 <-> API)
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/device/connect
 * Chamado pelo ESP32 após conexão ao WiFi via Captive Portal
 * Body: { device_id: "UTOME-XXXXXX", firmware: "1.0.0" }
 */
app.post('/api/device/connect', rateLimiter({ windowMs: 60 * 1000, max: 20 }), async (req, res) => {
    try {
        const { device_id, firmware } = req.body;

        if (!device_id || !isValidDeviceId(device_id)) {
            return res.status(400).json({ error: 'Identificador device_id ausente ou inválido (formato esperado: UTOME-XXXXXX).' });
        }

        const cleanDeviceId = device_id.trim();
        const owner = await getDeviceOwner(cleanDeviceId);

        if (!owner) {
            return res.status(404).json({
                error: 'Dispositivo não encontrado. Certifique-se de gerar o ID na plataforma web antes de conectar o UTOME.'
            });
        }

        const now = Date.now();
        const firmwareVer = typeof firmware === 'string' ? firmware.slice(0, 20) : '1.0.0';
        const userConfigs = owner.data.configuracoes || { modo_calmante: false, animacao_celebracao: true };

        // Atualizar no Realtime Database (usado para telemetria em tempo real com o dashboard)
        if (rtdb) {
            await rtdb.ref(`devices/${cleanDeviceId}`).update({
                online: true,
                last_seen: now,
                state: 'COMPANION',
                firmware: firmwareVer,
                owner_uid: owner.uid,
                configs: userConfigs
            });
        }

        // Atualizar status no documento do usuário no Firestore
        if (db) {
            await db.collection('users').doc(owner.uid).set({
                device_status: {
                    online: true,
                    last_seen: now,
                    firmware: firmwareVer
                }
            }, { merge: true });
        }

        console.log(`[Device Connect] UTOME ${cleanDeviceId} conectado com sucesso para o usuário ${owner.uid}`);

        res.json({
            success: true,
            device_id: cleanDeviceId,
            owner_uid: owner.uid,
            status: 'connected',
            configs: userConfigs,
            server_time: now
        });

    } catch (error) {
        console.error("Erro em /api/device/connect:", error);
        res.status(500).json({ error: 'Erro interno ao conectar dispositivo.' });
    }
});

/**
 * GET /api/device/status
 * Chamado pelo ESP32 para verificar seu estado e configurações
 * Headers: device-id ou x-device-id ou query param: ?device_id=...
 */
app.get('/api/device/status', rateLimiter({ windowMs: 60 * 1000, max: 60 }), async (req, res) => {
    try {
        const deviceId = req.headers['device-id'] || req.headers['x-device-id'] || req.query.device_id;

        if (!deviceId || !isValidDeviceId(deviceId)) {
            return res.status(400).json({ error: 'device_id ausente ou inválido.' });
        }

        const cleanDeviceId = deviceId.trim();

        if (rtdb) {
            // Heartbeat: atualizar last_seen e online sempre que o dispositivo consulta o status
            await rtdb.ref(`devices/${cleanDeviceId}`).update({
                online: true,
                last_seen: Date.now()
            });

            const snapshot = await rtdb.ref(`devices/${cleanDeviceId}`).once('value');
            if (snapshot.exists()) {
                const data = snapshot.val();
                return res.json({
                    success: true,
                    device_id: cleanDeviceId,
                    online: true,
                    state: data.state || 'COMPANION',
                    task: data.task || null,
                    comando_pendente: data.comando_pendente || null,
                    configs: data.configs || {}
                });
            }
        }

        // Se não achou no RTDB, checar se pertence a um usuário
        const owner = await getDeviceOwner(cleanDeviceId);
        if (!owner) {
            return res.status(404).json({ error: 'Dispositivo não encontrado.' });
        }

        res.json({
            success: true,
            device_id: cleanDeviceId,
            online: false,
            state: 'COMPANION',
            configs: owner.data.configuracoes || {}
        });

    } catch (error) {
        console.error("Erro em /api/device/status:", error);
        res.status(500).json({ error: 'Erro interno ao consultar status do dispositivo.' });
    }
});

/**
 * POST /api/device/events
 * Chamado pelo ESP32 quando a criança conclui uma tarefa (3 toques) ou outro evento físico
 * Body: { device_id, type: "routine_complete", routine_id, task_name, timestamp }
 */
app.post('/api/device/events', rateLimiter({ windowMs: 60 * 1000, max: 30 }), async (req, res) => {
    try {
        const { device_id, type, routine_id, task_name, timestamp } = req.body;

        if (!device_id || !isValidDeviceId(device_id)) {
            return res.status(400).json({ error: 'device_id ausente ou inválido.' });
        }

        const cleanDeviceId = device_id.trim();
        const owner = await getDeviceOwner(cleanDeviceId);

        if (!owner) {
            return res.status(404).json({ error: 'Dispositivo não vinculado a um usuário válido.' });
        }

        const eventType = type || 'routine_complete';
        const eventTimestamp = timestamp || Date.now();

        // 1. Gravar no histórico permanente do Firestore: users/{uid}/eventos
        if (db) {
            await db.collection('users').doc(owner.uid).collection('eventos').add({
                device_id: cleanDeviceId,
                type: eventType,
                task_name: task_name || 'Rotina concluída',
                routine_id: routine_id || null,
                timestamp: eventTimestamp,
                createdAt: Date.now()
            });
        }

        // 2. Atualizar estado no Realtime Database (retorna para Modo Companhia e limpa comando pendente)
        if (rtdb) {
            await rtdb.ref(`devices/${cleanDeviceId}`).update({
                state: 'COMPANION',
                task: null,
                comando_pendente: null,
                last_routine_complete: eventTimestamp,
                last_seen: Date.now()
            });
        }

        console.log(`[Device Event] Evento '${eventType}' registrado para ${cleanDeviceId} (Usuário: ${owner.uid})`);

        res.json({
            success: true,
            message: 'Evento registrado e estado do UTOME atualizado para COMPANION.',
            device_id: cleanDeviceId,
            timestamp: eventTimestamp
        });

    } catch (error) {
        console.error("Erro em /api/device/events:", error);
        res.status(500).json({ error: 'Erro interno ao registrar evento do dispositivo.' });
    }
});

/**
 * POST /api/device/offline
 * Chamado pelo ESP32 ao desligar ou reiniciar intencionalmente
 * Body: { device_id }
 */
app.post('/api/device/offline', rateLimiter({ windowMs: 60 * 1000, max: 20 }), async (req, res) => {
    try {
        const { device_id } = req.body;

        if (!device_id || !isValidDeviceId(device_id)) {
            return res.status(400).json({ error: 'device_id ausente ou inválido.' });
        }

        const cleanDeviceId = device_id.trim();
        const now = Date.now();

        if (rtdb) {
            await rtdb.ref(`devices/${cleanDeviceId}`).update({
                online: false,
                last_seen: now
            });
        }

        res.json({ success: true, message: 'Dispositivo marcado como offline.', device_id: cleanDeviceId });

    } catch (error) {
        console.error("Erro em /api/device/offline:", error);
        res.status(500).json({ error: 'Erro interno ao atualizar estado offline.' });
    }
});

// ─────────────────────────────────────────────────────────────
// 2. ENDPOINTS DE ROTINAS (DASHBOARD / RESPONSÁVEL <-> API)
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/routines/send
 * Envia uma tarefa imediatamente para o UTOME
 * Requer autenticação do responsável (Bearer token)
 * Body: { device_id, task, routine_id }
 */
app.post('/api/routines/send', requireAuth, rateLimiter({ windowMs: 60 * 1000, max: 30 }), async (req, res) => {
    try {
        const uid = req.user.uid;
        const { device_id, task, routine_id } = req.body;

        if (!task || typeof task !== 'string' || task.trim().length === 0) {
            return res.status(400).json({ error: 'Nome da tarefa é obrigatório.' });
        }

        if (!device_id || !isValidDeviceId(device_id)) {
            return res.status(400).json({ error: 'device_id ausente ou inválido.' });
        }

        const cleanDeviceId = device_id.trim();

        // Validar que o dispositivo pertence ao usuário logado
        if (db) {
            const userDoc = await db.collection('users').doc(uid).get();
            if (!userDoc.exists || userDoc.data().device_id !== cleanDeviceId) {
                return res.status(403).json({ error: 'Acesso negado: Este dispositivo não pertence à sua conta.' });
            }
        }

        const cleanTask = task.trim().slice(0, 100);
        const timestamp = Date.now();

        // Grava no Realtime Database para notificar o ESP32 em tempo real
        if (rtdb) {
            await rtdb.ref(`devices/${cleanDeviceId}`).update({
                state: 'ROUTINE_PENDING',
                task: cleanTask,
                comando_pendente: {
                    acao: 'EXECUTAR_TAREFA',
                    nome_tarefa: cleanTask,
                    routine_id: routine_id || null,
                    timestamp: timestamp
                }
            });
        }

        res.json({
            success: true,
            message: 'Rotina enviada com sucesso para o UTOME!',
            device_id: cleanDeviceId,
            task: cleanTask,
            timestamp: timestamp
        });

    } catch (error) {
        console.error("Erro em /api/routines/send:", error);
        res.status(500).json({ error: 'Erro interno ao enviar rotina.' });
    }
});

/**
 * GET /api/routines
 * Lista todas as rotinas e tarefas salvas do usuário autenticado
 */
app.get('/api/routines', requireAuth, async (req, res) => {
    try {
        const uid = req.user.uid;
        if (!db) {
            return res.status(500).json({ error: 'Firestore não inicializado.' });
        }

        const routinesSnap = await db.collection('users').doc(uid).collection('rotinas').get();
        const routines = [];

        for (const doc of routinesSnap.docs) {
            const routineData = doc.data();
            const tasksSnap = await doc.ref.collection('tarefas').get();
            const tasks = tasksSnap.docs.map(t => ({ id: t.id, ...t.data() }));

            routines.push({
                id: doc.id,
                ...routineData,
                tarefas: tasks
            });
        }

        res.json({ success: true, routines });

    } catch (error) {
        console.error("Erro em /api/routines:", error);
        res.status(500).json({ error: 'Erro interno ao buscar rotinas.' });
    }
});

/**
 * POST /api/routines
 * Cria uma nova rotina para o usuário autenticado
 * Body: { nome: "Manhã", hora: "08:00", tarefas: [{ nome: "Escovar os dentes", horario: "08:10" }] }
 */
app.post('/api/routines', requireAuth, rateLimiter({ windowMs: 60 * 1000, max: 20 }), async (req, res) => {
    try {
        const uid = req.user.uid;
        const { nome, hora, tarefas } = req.body;

        if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
            return res.status(400).json({ error: 'O nome da rotina é obrigatório.' });
        }

        if (!db) {
            return res.status(500).json({ error: 'Firestore não inicializado.' });
        }

        const routineRef = await db.collection('users').doc(uid).collection('rotinas').add({
            nome: nome.trim().slice(0, 80),
            hora: typeof hora === 'string' ? hora.trim() : '',
            createdAt: Date.now()
        });

        // Adicionar tarefas se informadas
        if (Array.isArray(tarefas) && tarefas.length > 0) {
            const batch = db.batch();
            for (const t of tarefas) {
                if (t && t.nome) {
                    const taskRef = routineRef.collection('tarefas').doc();
                    batch.set(taskRef, {
                        nome: String(t.nome).trim().slice(0, 80),
                        horario: t.horario ? String(t.horario).trim() : '',
                        createdAt: Date.now()
                    });
                }
            }
            await batch.commit();
        }

        res.json({
            success: true,
            id: routineRef.id,
            message: 'Rotina criada com sucesso.'
        });

    } catch (error) {
        console.error("Erro ao criar rotina:", error);
        res.status(500).json({ error: 'Erro interno ao criar rotina.' });
    }
});

/**
 * DELETE /api/routines/:id
 * Exclui uma rotina e suas tarefas
 */
app.delete('/api/routines/:id', requireAuth, async (req, res) => {
    try {
        const uid = req.user.uid;
        const routineId = req.params.id;

        if (!routineId || typeof routineId !== 'string') {
            return res.status(400).json({ error: 'ID da rotina inválido.' });
        }

        if (!db) {
            return res.status(500).json({ error: 'Firestore não inicializado.' });
        }

        const routineRef = db.collection('users').doc(uid).collection('rotinas').doc(routineId);
        const docSnap = await routineRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({ error: 'Rotina não encontrada.' });
        }

        // Excluir tarefas filhas
        const tasksSnap = await routineRef.collection('tarefas').get();
        const batch = db.batch();
        tasksSnap.docs.forEach(t => batch.delete(t.ref));
        batch.delete(routineRef);
        await batch.commit();

        res.json({ success: true, message: 'Rotina excluída com sucesso.' });

    } catch (error) {
        console.error("Erro ao excluir rotina:", error);
        res.status(500).json({ error: 'Erro interno ao excluir rotina.' });
    }
});

/**
 * GET /api/events
 * Retorna o histórico de eventos/conquistas registradas pelo UTOME (ex: 3 toques)
 */
app.get('/api/events', requireAuth, async (req, res) => {
    try {
        const uid = req.user.uid;
        if (!db) return res.status(500).json({ error: 'Firestore não inicializado.' });

        const snapshot = await db.collection('users').doc(uid).collection('eventos')
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();

        const eventos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ success: true, eventos });
    } catch (error) {
        console.error("Erro em /api/events:", error);
        res.status(500).json({ error: 'Erro ao buscar eventos.' });
    }
});

// ── CRON JOB (Verificação de heartbeat de dispositivos) ──
// A cada 5 minutos, marca dispositivos sem sinal há mais de 10 minutos como offline
cron.schedule('*/5 * * * *', async () => {
    if (!rtdb) return;
    try {
        const snapshot = await rtdb.ref('devices').once('value');
        if (!snapshot.exists()) return;

        const now = Date.now();
        const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutos sem sinal = offline
        const updates = {};
        let offlineCount = 0;

        snapshot.forEach(childSnap => {
            const dev = childSnap.val();
            if (dev && dev.online && dev.last_seen && (now - dev.last_seen > TIMEOUT_MS)) {
                updates[`devices/${childSnap.key}/online`] = false;
                offlineCount++;
            }
        });

        if (offlineCount > 0) {
            await rtdb.ref().update(updates);
            console.log(`[Cron Heartbeat] ${offlineCount} dispositivos marcados como offline por inatividade.`);
        }
    } catch (error) {
        console.error("[Cron Heartbeat] Erro ao verificar heartbeat:", error);
    }
});

// ── START SERVER ──
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API do UTOME 2.0 rodando com segurança ativa na porta ${PORT}`);
});
