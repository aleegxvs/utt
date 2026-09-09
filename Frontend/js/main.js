/**
 * UTOME Gen 1 - Scripts Globais
 * 
 * Arquivo principal para interações do front-end.
 * Versão: 1.1.0
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('UTOME - Interface inicializada com sucesso.');
    initDemoInterativa();
});

/**
 * Demo Interativa
 * Simula o comportamento do robô ao receber um toque.
 */
function triggerDemo() {
    const screen = document.getElementById('demo-screen');
    const message = document.getElementById('demo-message');
    const btn = document.getElementById('demo-btn');

    const responses = [
        'Você conseguiu!',
        'Muito bem!',
        'Estou aqui.',
        'Vamos com calma.',
        'Ótimo trabalho!',
    ];

    const randomMessage = responses[Math.floor(Math.random() * responses.length)];

    // Ativa o estado de resposta
    screen.classList.add('active');
    message.textContent = randomMessage;
    btn.disabled = true;

    // Retorna ao estado neutro após 2.5 segundos
    setTimeout(() => {
        screen.classList.remove('active');
        message.textContent = 'Pressione o botão para interagir';
        btn.disabled = false;
    }, 2500);
}

function initDemoInterativa() {
    // Suporte a teclado
    const btn = document.getElementById('demo-btn');
    if (btn) {
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                triggerDemo();
            }
        });
    }
}

/**
 * Lógica do Modal de Termos
 */
function openTermsModal(event) {
    if (event) event.preventDefault();
    
    const modal = document.getElementById('terms-modal');
    if (modal) {
        modal.classList.add('active');
        // Reset checkboxes when opening
        document.getElementById('check-terms').checked = false;
        document.getElementById('check-privacy').checked = false;
        validateTerms();
    }
}

function closeTermsModal() {
    const modal = document.getElementById('terms-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function validateTerms() {
    const checkTerms = document.getElementById('check-terms').checked;
    const checkPrivacy = document.getElementById('check-privacy').checked;
    const btnCreate = document.getElementById('btn-create-account');
    
    if (btnCreate) {
        if (checkTerms && checkPrivacy) {
            btnCreate.disabled = false;
            // Aqui você pode adicionar o evento de clique para redirecionar ou abrir o form de registro
            btnCreate.onclick = () => {
                    window.location.href = 'cadastro.html';
                    closeTermsModal();
                };
        } else {
            btnCreate.disabled = true;
            btnCreate.onclick = null;
        }
    }
}

// Fechar modal se clicar fora do conteúdo
document.addEventListener('click', (event) => {
    const modal = document.getElementById('terms-modal');
    const modalContent = document.querySelector('.modal-content');
    
    // Se o modal estiver ativo, e o clique não for dentro do modal-content, nem for no botão que abriu
    if (modal && modal.classList.contains('active')) {
        if (!modalContent.contains(event.target) && !event.target.closest('.btn-primary')) {
            closeTermsModal();
        }
    }
});
