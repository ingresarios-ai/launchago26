import re

with open('/Users/josuegarcia/Antigravity/Launch Jul 26/unirme.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Locate the red bar text div
pattern = r'(<div class="flex items-center gap-2 md:gap-3 uppercase tracking-wide text-sm md:text-lg lg:text-xl drop-shadow-md text-center">.*?</div>)'

replacement = r'\1<div id="countdown-container" class="flex gap-2 md:gap-3 items-center"></div>'

html = re.sub(pattern, replacement, html)

with open('/Users/josuegarcia/Antigravity/Launch Jul 26/unirme.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Timer container added to unirme.html")
