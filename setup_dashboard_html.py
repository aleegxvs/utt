import os
import re

html_dir = r'c:\Users\alejandro\Downloads\Alejandro\Trabalho\Utt\Frontend\html'
dashboard_path = os.path.join(html_dir, 'dashboard.html')

with open(dashboard_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update "Sair" link
content = re.sub(
    r'<a href="\.\./\.\./index\.html" class="nav-item">\s*<img src="https://img.icons8.com/fluency/22/exit.png" alt="">\s*Sair\s*</a>',
    r'<button class="nav-item" onclick="logout()" style="border: none; background: none; font-family: inherit; font-size: inherit; text-align: left; width: 100%;"><img src="https://img.icons8.com/fluency/22/exit.png" alt="">Sair</button>',
    content,
    flags=re.IGNORECASE
)

# 2. Add the sendTaskToDevice onclick to the send buttons in the hardcoded routines
# The button is: <button class="btn-icon btn-icon--send" title="Enviar para o UTOME agora">
content = re.sub(
    r'<button class="btn-icon btn-icon--send" title="Enviar para o UTOME agora">',
    r'<button class="btn-icon btn-icon--send" title="Enviar para o UTOME agora" onclick="sendTaskToDevice(this.closest(\'.task-item\').querySelector(\'.task-name\').textContent)">',
    content
)

# 3. Same for the dynamically generated task template in main script
content = re.sub(
    r'<button class="btn-icon btn-icon--send" title="Enviar para o UTOME agora"><img src="https://img\.icons8\.com/fluency/16/sent\.png" alt="Enviar"></button>',
    r'<button class="btn-icon btn-icon--send" title="Enviar para o UTOME agora" onclick="sendTaskToDevice(\'${name}\')"><img src="https://img.icons8.com/fluency/16/sent.png" alt="Enviar"></button>',
    content
)

# 4. Inject the module script before the closing </body>
module_script = '<script type="module" src="../js/firebase/dashboard.js"></script>\n</body>'
content = content.replace('</body>', module_script)

# 5. Remove the dummy implementations in the inline script
# I will just regex remove the dummy implementations of saveProfile, saveDevice, and linkDevice.
content = re.sub(r'function saveProfile\(type\) \{.*?\n        \}', '', content, flags=re.DOTALL)
content = re.sub(r'function saveDevice\(\) \{.*?\n        \}', '', content, flags=re.DOTALL)
content = re.sub(r'function linkDevice\(\) \{.*?\n        \}', '', content, flags=re.DOTALL)

with open(dashboard_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("dashboard.html updated for Firebase integration.")
