/**
 * UTOME Gen 1 - Scripts Globais
 *
 * Arquivo principal para interações do front-end.
 * Versão: 1.2.0
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('UTOME - Interface inicializada com sucesso.');
    initDemoInterativa();
});

/* ══════════════════════════════════════════
   DEMO INTERATIVA — 3 estados reais do UTOME
   COMPANION → ROUTINE_PENDING → ROUTINE_COMPLETE → COMPANION
   ══════════════════════════════════════════ */

let demoState = 'COMPANION'; // estado atual da demo
let demoTouchCount = 0;       // contagem de toques no estado ROUTINE_PENDING
let demoCooldown = false;     // evita cliques duplos rápidos

const demoConfig = {
    COMPANION: {
        badge: 'COMPANION',
        badgeClass: 'demo-state-companion',
        desc: 'O UTOME está em modo companhia — animações calmas, resposta livre ao toque.',
        oledText: 'Modo Companhia',
        faceType: 'happy',
        screenClass: '',
        showTouchBtn: true,
        showRoutineBtn: true,
        showConfirmBtn: false,
    },
    ROUTINE_PENDING: {
        badge: 'ROUTINE PENDING',
        badgeClass: 'demo-state-routine',
        desc: 'Uma tarefa foi enviada! O UTOME aguarda a criança confirmar com 3 toques.',
        oledText: 'Beber água! 💧',
        faceType: 'blink',
        screenClass: 'oled-routine',
        showTouchBtn: false,
        showRoutineBtn: false,
        showConfirmBtn: true,
    },
    ROUTINE_COMPLETE: {
        badge: 'COMPLETE!',
        badgeClass: 'demo-state-complete',
        desc: 'Missão cumprida! O UTOME celebra e volta ao Modo Companhia.',
        oledText: 'Você conseguiu!',
        faceType: 'celebrate',
        screenClass: 'oled-complete',
        showTouchBtn: false,
        showRoutineBtn: false,
        showConfirmBtn: false,
    },
};

function applyDemoState(state) {
    const cfg = demoConfig[state];
    demoState = state;

    // Badge
    const badge = document.getElementById('demo-state-badge');
    if (badge) {
        badge.textContent = cfg.badge;
        badge.className = 'demo-state-badge ' + cfg.badgeClass;
    }

    // Descrição
    const desc = document.getElementById('demo-state-desc');
    if (desc) desc.textContent = cfg.desc;

    // OLED texto
    const txt = document.getElementById('oled-text');
    if (txt) txt.textContent = cfg.oledText;

    // OLED screen class
    const screen = document.getElementById('oled-screen');
    if (screen) screen.className = 'oled-screen ' + cfg.screenClass;

    // Face
    setOledFace(cfg.faceType);

    // Botões
    setDisplay('demo-btn-touch',   cfg.showTouchBtn   ? '' : 'none');
    setDisplay('demo-btn-routine', cfg.showRoutineBtn ? '' : 'none');
    setDisplay('demo-btn-confirm', cfg.showConfirmBtn ? '' : 'none');
}

function setOledFace(type) {
    const eyeL = document.getElementById('oled-eye-l');
    const eyeR = document.getElementById('oled-eye-r');
    const mouth = document.getElementById('oled-mouth');
    const dots  = document.getElementById('oled-dots');
    if (!eyeL) return;

    eyeL.className = 'oled-eye';
    eyeR.className = 'oled-eye';

    if (type === 'happy') {
        eyeL.className = 'oled-eye eye-open';
        eyeR.className = 'oled-eye eye-open';
        mouth.className = 'oled-mouth mouth-smile';
        dots.style.display = 'none';
    } else if (type === 'blink') {
        eyeL.className = 'oled-eye eye-open';
        eyeR.className = 'oled-eye eye-open';
        mouth.className = 'oled-mouth mouth-neutral';
        dots.style.display = 'flex';
        updateDemoDots(0);
    } else if (type === 'celebrate') {
        eyeL.className = 'oled-eye eye-star';
        eyeR.className = 'oled-eye eye-star';
        mouth.className = 'oled-mouth mouth-big-smile';
        dots.style.display = 'none';
    }
}

function updateDemoDots(count) {
    for (let i = 1; i <= 3; i++) {
        const dot = document.getElementById('dot-' + i);
        if (dot) dot.className = 'oled-dot' + (i <= count ? ' dot-filled' : '');
    }
}

function setDisplay(id, val) {
    const el = document.getElementById(id);
    if (el) el.style.display = val;
}

// Toque no modo companhia — feedback imediato
window.demoTouch = function () {
    if (demoCooldown || demoState !== 'COMPANION') return;
    demoCooldown = true;

    const screen = document.getElementById('oled-screen');
    if (screen) screen.classList.add('oled-pulse');

    const txt = document.getElementById('oled-text');
    const responses = ['Estou aqui.', 'Muito bem!', 'Vamos com calma.', 'Olá! 😊'];
    if (txt) txt.textContent = responses[Math.floor(Math.random() * responses.length)];

    setTimeout(() => {
        if (txt) txt.textContent = 'Modo Companhia';
        if (screen) screen.classList.remove('oled-pulse');
        demoCooldown = false;
    }, 1800);
};

// Responsável envia tarefa
window.demoSendRoutine = function () {
    if (demoState !== 'COMPANION') return;
    demoTouchCount = 0;
    applyDemoState('ROUTINE_PENDING');
    updateTouchCountDisplay();
};

// Criança confirma com 3 toques
window.demoConfirmTouch = function () {
    if (demoState !== 'ROUTINE_PENDING' || demoCooldown) return;

    demoTouchCount++;
    updateTouchCountDisplay();
    updateDemoDots(demoTouchCount);

    const screen = document.getElementById('oled-screen');
    if (screen) {
        screen.classList.add('oled-pulse');
        setTimeout(() => screen.classList.remove('oled-pulse'), 300);
    }

    if (demoTouchCount >= 3) {
        demoCooldown = true;
        setTimeout(() => {
            applyDemoState('ROUTINE_COMPLETE');
            // Volta ao companhia após celebração
            setTimeout(() => {
                demoTouchCount = 0;
                demoCooldown = false;
                applyDemoState('COMPANION');
            }, 3000);
        }, 400);
    }
};

function updateTouchCountDisplay() {
    const el = document.getElementById('touch-count-display');
    if (el) el.textContent = demoTouchCount;
}

function initDemoInterativa() {
    // Inicializar estado
    applyDemoState('COMPANION');
}

/* ══════════════════════════════════════
   MODAL DE TERMOS
   ══════════════════════════════════════ */

function openTermsModal(event) {
    if (event) event.preventDefault();
    const modal = document.getElementById('terms-modal');
    if (modal) {
        modal.classList.add('active');
        document.getElementById('check-terms').checked = false;
        document.getElementById('check-privacy').checked = false;
        validateTerms();
    }
}

function closeTermsModal() {
    const modal = document.getElementById('terms-modal');
    if (modal) modal.classList.remove('active');
}

function validateTerms() {
    const checkTerms   = document.getElementById('check-terms').checked;
    const checkPrivacy = document.getElementById('check-privacy').checked;
    const btnCreate    = document.getElementById('btn-create-account');
    if (btnCreate) {
        if (checkTerms && checkPrivacy) {
            btnCreate.disabled = false;
            btnCreate.onclick = () => {
                window.location.href = 'Frontend/html/cadastro.html';
                closeTermsModal();
            };
        } else {
            btnCreate.disabled = true;
            btnCreate.onclick = null;
        }
    }
}

// Fechar modal ao clicar fora
document.addEventListener('click', (event) => {
    const modal = document.getElementById('terms-modal');
    const modalContent = document.querySelector('.modal-content');
    if (modal && modal.classList.contains('active')) {
        if (!modalContent.contains(event.target) && !event.target.closest('.btn-primary')) {
            closeTermsModal();
        }
    }
});
