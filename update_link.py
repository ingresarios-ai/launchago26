with open('/Users/josuegarcia/Antigravity/Launch Jul 26/unirme.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the URL
html = html.replace('https://pay.hotmart.com/L104390213T?off=yudh4bit&amp;checkoutMode=10', 'https://pay.hotmart.com/L104390213T?off=1iqunvfz&amp;checkoutMode=10')
# Just in case some aren't escaped:
html = html.replace('https://pay.hotmart.com/L104390213T?off=yudh4bit&checkoutMode=10', 'https://pay.hotmart.com/L104390213T?off=1iqunvfz&checkoutMode=10')

with open('/Users/josuegarcia/Antigravity/Launch Jul 26/unirme.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Link updated!")
