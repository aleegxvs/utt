import { auth, db, rtdb } from './config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { doc, getDoc, updateDoc, collection, addDoc, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

let currentUser = null;
let currentProfile = null;

// Handle Auth State
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        await loadUserProfile();
        await loadRoutines();
    } else {
        window.location.href = 'login.html'; // Redirecionar se não estiver logado
    }
});

// Logout
window.logout = async () => {
    await signOut(auth);
    window.location.href = 'login.html';
};

// Load User Profile from Firestore
async function loadUserProfile() {
    try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            currentProfile = docSnap.data();
            updateProfileUI();
            if(currentProfile.device_id) {
                listenToDevice(currentProfile.device_id);
            }
        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
    }
}

// Update UI with Profile Data
function updateProfileUI() {
    if (!currentProfile) return;

    // Sidebar
    const resp = currentProfile.responsavel;
    if (resp && resp.nome) {
        document.getElementById('sidebar-name').textContent = resp.nome;
        document.getElementById('sidebar-avatar').textContent = resp.nome[0].toUpperCase();
        
        // Aba Perfil - Responsável
        document.getElementById('profile-name-resp').textContent = resp.nome;
        document.getElementById('profile-email-resp').textContent = resp.email;
        document.getElementById('profile-avatar-resp').textContent = resp.nome[0].toUpperCase();
        document.getElementById('input-nome-resp').value = resp.nome;
        document.getElementById('input-email-resp').value = resp.email;
        document.getElementById('input-tel-resp').value = resp.telefone || "";
    }

    const child = currentProfile.crianca;
    if (child && child.nome) {
        document.getElementById('profile-name-child').textContent = child.nome;
        document.getElementById('profile-avatar-child').textContent = child.nome[0].toUpperCase();
        document.getElementById('input-nome-child').value = child.nome;
        document.getElementById('input-idade-child').value = child.idade || "";
        document.getElementById('input-obs-child').value = child.observacoes || "";
    }

    const configs = currentProfile.configuracoes;
    if (configs) {
        document.getElementById('device-display-name').textContent = configs.device_name || "UTOME";
        document.getElementById('input-device-name').value = configs.device_name || "";
        document.getElementById('toggle-calmante').checked = configs.modo_calmante || false;
        document.getElementById('toggle-sons').checked = configs.sons_celebracao !== false;
    }

    if (currentProfile.device_id) {
        document.getElementById('device-display-id').textContent = currentProfile.device_id;
        document.getElementById('input-device-id').value = currentProfile.device_id;
    }
}

// Save Profile
window.saveProfile = async (type) => {
    if (!currentUser) return;
    const docRef = doc(db, "users", currentUser.uid);
    
    try {
        if (type === 'resp') {
            const nome = document.getElementById('input-nome-resp').value.trim();
            const tel = document.getElementById('input-tel-resp').value.trim();
            if (!nome) return;
            
            await updateDoc(docRef, {
                "responsavel.nome": nome,
                "responsavel.telefone": tel
            });
            window.showToast('Perfil do responsável salvo!');
        } else {
            const nome = document.getElementById('input-nome-child').value.trim();
            const idade = document.getElementById('input-idade-child').value.trim();
            const obs = document.getElementById('input-obs-child').value.trim();
            if (!nome) return;
            
            await updateDoc(docRef, {
                "crianca.nome": nome,
                "crianca.idade": parseInt(idade) || null,
                "crianca.observacoes": obs
            });
            window.showToast('Perfil da criança salvo!');
        }
        await loadUserProfile(); // Recarregar para atualizar tudo
    } catch (error) {
        console.error("Error updating profile:", error);
        window.showToast('Erro ao salvar!');
    }
};

// Save Device Configs
window.saveDevice = async () => {
    if (!currentUser) return;
    const docRef = doc(db, "users", currentUser.uid);
    const nome = document.getElementById('input-device-name').value.trim();
    const calmante = document.getElementById('toggle-calmante').checked;
    const sons = document.getElementById('toggle-sons').checked;

    try {
        await updateDoc(docRef, {
            "configuracoes.device_name": nome,
            "configuracoes.modo_calmante": calmante,
            "configuracoes.sons_celebracao": sons
        });
        window.showToast('Configurações do UTOME salvas!');
        await loadUserProfile();
        
        // Sync to RTDB se tiver device
        if (currentProfile.device_id) {
            const rtdbRef = ref(rtdb, 'devices/' + currentProfile.device_id + '/configs');
            await set(rtdbRef, {
                modo_calmante: calmante,
                sons: sons
            });
        }
    } catch (error) {
        console.error("Error updating device configs:", error);
    }
};

window.linkDevice = async () => {
    if (!currentUser) return;
    const id = document.getElementById('input-new-device-id').value.trim();
    if (!id) return;
    
    try {
        const docRef = doc(db, "users", currentUser.uid);
        await updateDoc(docRef, {
            "device_id": id
        });
        document.getElementById('input-new-device-id').value = '';
        window.showToast('UTOME vinculado com sucesso!');
        await loadUserProfile(); // Will trigger listenToDevice
    } catch (error) {
        console.error("Error linking device:", error);
    }
};

// Realtime Database Listener (ESP32 Communication)
function listenToDevice(deviceId) {
    const deviceRef = ref(rtdb, 'devices/' + deviceId);
    onValue(deviceRef, (snapshot) => {
        const data = snapshot.val();
        updateDeviceStatusUI(data);
    });
}

function updateDeviceStatusUI(data) {
    const statusBadges = document.getElementById('device-status-badges'); // Precisamos adicionar este id no HTML
    
    if (data && data.online) {
        // Online
        document.querySelector('.device-status-card .badge-online').innerHTML = '<span class="badge-dot badge-dot--green"></span> Conectado';
        document.querySelector('.device-status-card .badge-online').className = 'badge badge-online';
        document.querySelector('.topbar-actions .badge').innerHTML = '<span class="badge-dot badge-dot--green"></span> UTOME Conectado';
        document.querySelector('.topbar-actions .badge').className = 'badge badge-online';
    } else {
        // Offline
        document.querySelector('.device-status-card .badge-online').innerHTML = '<span class="badge-dot badge-dot--red"></span> Offline';
        document.querySelector('.device-status-card .badge-online').className = 'badge badge-offline';
        document.querySelector('.topbar-actions .badge').innerHTML = '<span class="badge-dot badge-dot--red"></span> UTOME Offline';
        document.querySelector('.topbar-actions .badge').className = 'badge badge-offline';
    }

    if (data && data.estado_atual) {
        const estado = data.estado_atual === 'COMPANION' ? 'Modo Companhia' : 
                       data.estado_atual === 'TASK_PENDING' ? 'Tarefa Pendente' : 
                       data.estado_atual === 'CELEBRATION' ? 'Celebrando' : data.estado_atual;
        document.querySelector('.device-status-card .badge-mode').innerHTML = '<span class="badge-dot badge-dot--orange"></span> ' + estado;
    }
}

// Enviar Comando para RTDB
window.sendTaskToDevice = async (taskName) => {
    if (!currentProfile || !currentProfile.device_id) {
        alert("Nenhum UTOME vinculado!");
        return;
    }

    const commandRef = ref(rtdb, 'devices/' + currentProfile.device_id + '/comando_pendente');
    try {
        await set(commandRef, {
            acao: "EXECUTAR_TAREFA",
            nome_tarefa: taskName,
            timestamp: Date.now()
        });
        window.showToast("Tarefa enviada para o UTOME!");
    } catch(error) {
        console.error("Erro ao enviar comando: ", error);
        window.showToast("Erro ao comunicar com o UTOME");
    }
};

// Rotinas (Simples Placeholder para expansão via Firestore)
async function loadRoutines() {
    // Para um MVP as rotinas continuarão sendo renderizadas via JS na interface,
    // Em produção total aqui fariamos um getDocs na subcoleção 'rotinas'
    console.log("Routines load ready");
}
