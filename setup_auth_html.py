import os
import re

html_dir = r'c:\Users\alejandro\Downloads\Alejandro\Trabalho\Utt\Frontend\html'

login_script = """<script type="module">
        import { loginUser } from '../js/firebase/auth.js';

        // O togglePassword precisa estar no escopo global para o onclick funcionar
        window.togglePassword = function() {
            const input = document.getElementById('password');
            const icon = document.getElementById('eye-icon');
            if (input.type === 'password') {
                input.type = 'text';
                icon.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;
            } else {
                input.type = 'password';
                icon.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
            }
        }

        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = document.querySelector('#login-form button[type="submit"]');
            
            const originalText = btn.textContent;
            btn.textContent = 'Entrando...';
            btn.disabled = true;

            try {
                await loginUser(email, password);
                window.location.href = 'dashboard.html';
            } catch (error) {
                alert('Erro ao fazer login: ' + error.message);
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });

        document.getElementById('btn-google').addEventListener('click', () => {
            alert('Login com Google em breve!');
        });
    </script>"""

cadastro_script = """<script type="module">
        import { registerUser } from '../js/firebase/auth.js';

        window.togglePassword = function(inputId, iconId) {
            const input = document.getElementById(inputId);
            const icon = document.getElementById(iconId);
            if (input.type === 'password') {
                input.type = 'text';
                icon.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;
            } else {
                input.type = 'password';
                icon.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
            }
        }

        window.validateForm = function() {
            const agreed = document.getElementById('agree-terms').checked;
            document.getElementById('btn-signup').disabled = !agreed;
        }

        document.getElementById('signup-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const pw = document.getElementById('password').value;
            const cpw = document.getElementById('confirm-password').value;
            const btn = document.getElementById('btn-signup');

            if (pw !== cpw) {
                document.getElementById('confirm-password').classList.add('error');
                alert('As senhas não coincidem!');
                return;
            }

            const originalText = btn.textContent;
            btn.textContent = 'Criando conta...';
            btn.disabled = true;

            try {
                await registerUser(email, pw, name);
                window.location.href = 'dashboard.html';
            } catch (error) {
                alert('Erro ao cadastrar: ' + error.message);
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });

        document.getElementById('btn-google').addEventListener('click', () => {
            alert('Cadastro com Google em breve!');
        });
    </script>"""

esqueci_script = """<script type="module">
        import { resetPassword } from '../js/firebase/auth.js';

        document.getElementById('reset-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const btn = document.querySelector('#reset-form button[type="submit"]');

            if (!email) {
                document.getElementById('email').focus();
                return;
            }

            const originalText = btn.textContent;
            btn.textContent = 'Enviando...';
            btn.disabled = true;

            try {
                await resetPassword(email);
                document.getElementById('form-state').style.display = 'none';
                document.getElementById('success-state').style.display = 'block';
            } catch (error) {
                alert('Erro ao enviar e-mail de redefinição: ' + error.message);
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });
    </script>"""


def replace_script(filename, new_script):
    filepath = os.path.join(html_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # replace the entire <script>...</script> block
    content = re.sub(r'<script>.*?</script>', new_script, content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

replace_script('login.html', login_script)
replace_script('cadastro.html', cadastro_script)
replace_script('esqueci-senha.html', esqueci_script)

print("Updated HTML files.")
