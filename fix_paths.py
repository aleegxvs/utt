import os

root = r'c:\Users\alejandro\Downloads\Alejandro\Trabalho\Utt'

# Fix index.html
index_path = os.path.join(root, 'index.html')
with open(index_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('href="css/', 'href="Frontend/css/')
content = content.replace('href="assets/', 'href="Frontend/assets/')
content = content.replace('src="assets/', 'src="Frontend/assets/')
content = content.replace('src="js/', 'src="Frontend/js/')
content = content.replace('href="login.html"', 'href="Frontend/html/login.html"')
content = content.replace('href="termos.html"', 'href="Frontend/html/termos.html"')
content = content.replace('href="privacidade.html"', 'href="Frontend/html/privacidade.html"')

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(content)

# Fix main.js
main_path = os.path.join(root, 'Frontend', 'js', 'main.js')
with open(main_path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace("'cadastro.html'", "'Frontend/html/cadastro.html'")
with open(main_path, 'w', encoding='utf-8') as f:
    f.write(content)

# Fix files in Frontend/html/
html_dir = os.path.join(root, 'Frontend', 'html')
for filename in os.listdir(html_dir):
    if filename.endswith('.html'):
        filepath = os.path.join(html_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        content = content.replace('href="css/', 'href="../css/')
        content = content.replace('href="assets/', 'href="../assets/')
        content = content.replace('src="assets/', 'src="../assets/')
        content = content.replace('src="js/', 'src="../js/')
        content = content.replace('href="index.html', 'href="../../index.html')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print('Paths updated successfully!')
