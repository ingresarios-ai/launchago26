with open('/Users/josuegarcia/Antigravity/Launch Jul 26/unirme.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Remove accidental hidden class from main buttons
html = html.replace('class="hidden btn-primary', 'class="btn-primary')

# 2. Add hidden to fraccionado buttons
target_class_start = 'class="w-full max-w-lg mx-auto flex flex-col items-center justify-center gap-1 py-3 px-6 rounded-2xl border-2 border-brand-green/40'
new_class_start = 'class="hidden w-full max-w-lg mx-auto flex flex-col items-center justify-center gap-1 py-3 px-6 rounded-2xl border-2 border-brand-green/40'

html = html.replace(target_class_start, new_class_start)

with open('/Users/josuegarcia/Antigravity/Launch Jul 26/unirme.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Fixed classes!")
