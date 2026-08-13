with open('/Users/josuegarcia/Antigravity/Launch Jul 26/unirme.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace $1,497 with $1,397
html = html.replace('1,497', '1,397')
# Let's also check for any 1497 without commas just in case
html = html.replace('1497', '1397')

with open('/Users/josuegarcia/Antigravity/Launch Jul 26/unirme.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Price updated!")
