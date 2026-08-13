import re

with open('/Users/josuegarcia/Antigravity/Launch Jul 26/unirme.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find the anchor tag with "OPCIÓN DE PAGO FRACCIONADO"
pattern = r'(<a href="[^"]*pay\.hotmart\.com[^"]*"[^>]*class=")([^"]*)("[^>]*>.*?OPCIÓN DE PAGO FRACCIONADO.*?</a>)'

# Append 'hidden ' to the class attribute
def replace_func(m):
    classes = m.group(2)
    if 'hidden' not in classes.split():
        classes = 'hidden ' + classes
    return m.group(1) + classes + m.group(3)

html = re.sub(pattern, replace_func, html, flags=re.DOTALL)

with open('/Users/josuegarcia/Antigravity/Launch Jul 26/unirme.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Hidden fraccionado buttons!")
