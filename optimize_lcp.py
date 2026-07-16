import re

# 1. Minify CSS
with open('styles.css', 'r') as f:
    css = f.read()

# Remove comments
css = re.sub(r'/\*[\s\S]*?\*/', '', css)
# Remove newlines and compress spaces
css = re.sub(r'\s+', ' ', css)
# Remove space around delimiters
css = re.sub(r'\s*([\{\}\:\;\,\>])\s*', r'\1', css)

# 2. Modify index.html
with open('index.html', 'r') as f:
    html = f.read()

# Inline CSS
html = re.sub(r'<link rel="stylesheet" href="styles\.css\?v=[0-9]+" />', f'<style>{css}</style>', html)

# Async Google Fonts
font_url = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap"
font_link = f'<link href="{font_url}" rel="stylesheet" />'
font_async = f'<link rel="preload" href="{font_url}" as="style" />\n  <link rel="stylesheet" href="{font_url}" media="print" onload="this.media=\'all\'" />\n  <noscript><link rel="stylesheet" href="{font_url}" /></noscript>'
html = html.replace(font_link, font_async)

# Add width/height to logo to prevent layout shift and satisfy PSI
html = html.replace('class="hero__logo" fetchpriority="high" />', 'class="hero__logo" fetchpriority="high" width="420" height="203" />')

with open('index.html', 'w') as f:
    f.write(html)

print("Optimization complete!")
