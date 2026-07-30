import docx
import os
import re
import subprocess

def process_file(docx_path, pdf_path, html_path):
    doc = docx.Document(docx_path)
    
    # Process text & tables from DOCX
    html_sections = []
    
    # Header items
    category_text = "EL JUEGO MENTAL DEL DINERO  ·  GUIÓN DE PRODUCCIÓN"
    main_title = ""
    meta_subtitle = ""
    
    # Read paragraphs
    para_list = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
    
    if len(para_list) >= 3:
        category_text = para_list[0]
        main_title = para_list[1]
        meta_subtitle = para_list[2]
    
    # Adaptations in text
    meta_subtitle = meta_subtitle.replace("Zoom", "YouTube Live")
    
    # We will build full HTML
    html_parts = []
    html_parts.append(f'''<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>{main_title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    @page {{
      size: A4;
      margin: 14mm 14mm 14mm 14mm;
    }}

    * {{
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }}

    body {{
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      line-height: 1.55;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }}

    .header-tag {{
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #0284c7;
      text-transform: uppercase;
      margin-bottom: 4px;
    }}

    .main-title {{
      font-size: 24px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0 0 4px 0;
    }}

    .meta-subtitle {{
      font-size: 12px;
      color: #64748b;
      font-style: italic;
      margin-bottom: 18px;
    }}

    .divider {{
      height: 2px;
      background: #0284c7;
      margin-bottom: 20px;
      border: none;
    }}

    .retention-box {{
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-left: 5px solid #0284c7;
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 20px;
    }}

    .retention-title {{
      font-size: 15px;
      font-weight: 800;
      color: #0369a1;
      margin: 0 0 10px 0;
    }}

    .retention-box ul {{
      margin: 0;
      padding-left: 18px;
    }}

    .retention-box li {{
      margin-bottom: 6px;
      color: #1e293b;
    }}

    h2.section-heading {{
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 24px;
      margin-bottom: 10px;
      letter-spacing: -0.01em;
    }}

    table.custom-table {{
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 11.5px;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }}

    table.custom-table th {{
      background: #0f172a;
      color: #ffffff;
      font-weight: 800;
      text-align: left;
      padding: 9px 11px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}

    table.custom-table td {{
      padding: 8px 11px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }}

    table.custom-table tr:nth-child(even) {{
      background: #f8fafc;
    }}

    .time-bar {{
      background: #0f172a;
      color: #ffffff;
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 800;
      margin-top: 24px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }}

    .time-bar span.time {{
      color: #38bdf8;
      font-family: monospace;
      font-size: 12px;
    }}

    .interaction-box {{
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-left: 5px solid #10b981;
      border-radius: 8px;
      padding: 12px 16px;
      margin: 12px 0;
      color: #064e3b;
    }}

    .interaction-box.yellow {{
      background: #fffbeb;
      border-color: #fde68a;
      border-left-color: #f59e0b;
      color: #78350f;
    }}

    .interaction-title {{
      font-weight: 800;
      font-size: 12.5px;
      margin-bottom: 6px;
    }}

    .interaction-box ul {{
      margin: 6px 0 0 0;
      padding-left: 18px;
    }}

    .dialogue-box {{
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #64748b;
      border-radius: 8px;
      padding: 12px 16px;
      margin: 12px 0;
      font-size: 12.5px;
      line-height: 1.6;
      color: #1e293b;
    }}

    .dialogue-box p {{
      margin: 0 0 8px 0;
    }}

    .dialogue-box p:last-child {{
      margin-bottom: 0;
    }}

    .screen-note {{
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
      display: block;
    }}

    .tone-notes {{
      background: #fff7ed;
      border: 1px solid #ffedd5;
      border-left: 5px solid #f97316;
      border-radius: 8px;
      padding: 14px 18px;
      margin-top: 20px;
    }}

    .tone-notes h3 {{
      margin: 0 0 8px 0;
      color: #9a3412;
      font-size: 13.5px;
      font-weight: 800;
    }}

    .tone-notes ul {{
      margin: 0;
      padding-left: 18px;
    }}

    .tone-notes li {{
      margin-bottom: 5px;
      color: #431407;
    }}
  </style>
</head>
<body>

  <div class="header-tag">{category_text}</div>
  <h1 class="main-title">{main_title}</h1>
  <div class="meta-subtitle">{meta_subtitle}</div>
  <hr class="divider" />
''')

    # Iterate elements in docx
    # We will loop through children of docx body
    body_elements = []
    
    # Helper to clean text
    def clean_text(txt):
        txt = txt.replace("Zoom", "YouTube Live")
        txt = txt.replace("Juan Diego Gómez", "Juan Villegas")
        txt = txt.replace("Juan Diego", "Juan Villegas")
        # Bold tags
        txt = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', txt)
        return txt

    # Iterate paragraphs and tables in order
    for elem in doc.element.body:
        if elem.tag.endswith('p'):
            p = docx.text.paragraph.Paragraph(elem, doc)
            text = p.text.strip()
            if not text:
                continue
            
            # Skip top titles
            if text in [category_text, main_title, para_list[2]]:
                continue

            cleaned = clean_text(text)

            # Check heading vs box vs timebar vs body
            if text.startswith("Objetivo") or text.startswith("El guión") or text.startswith("Apéndice") or text.startswith("Notas") or text.startswith("Reglas") or text.startswith("Mapa"):
                html_parts.append(f'<h2 class="section-heading">{cleaned}</h2>')
            elif text.startswith("EN PANTALLA:"):
                html_parts.append(f'<span class="screen-note">{cleaned}</span>')
            elif text.startswith("⚡") or text.startswith("ENCUESTA") or text.startswith("CHAT") or text.startswith("VOTACIÓN") or text.startswith("QUIZ"):
                html_parts.append(f'<div class="interaction-box"><div class="interaction-title">{cleaned}</div></div>')
            elif text.startswith("“") or text.startswith('"') or text.startswith("(Sin") or text.startswith("Juan:"):
                html_parts.append(f'<div class="dialogue-box"><p>{cleaned}</p></div>')
            elif text.startswith("•") or text.startswith("-"):
                html_parts.append(f'<p style="margin: 4px 0; padding-left: 14px;">{cleaned}</p>')
            elif ":" in text and len(text.split(":")[0]) < 25 and ("00" in text or "→" in text or "Minuto" in text):
                html_parts.append(f'<div class="time-bar"><span>{cleaned}</span></div>')
            else:
                html_parts.append(f'<p style="margin: 6px 0;">{cleaned}</p>')

        elif elem.tag.endswith('tbl'):
            tbl = docx.table.Table(elem, doc)
            html_parts.append('<table class="custom-table">')
            for r_idx, row in enumerate(tbl.rows):
                if r_idx == 0:
                    html_parts.append('<thead><tr>')
                    for cell in row.cells:
                        c_text = clean_text(cell.text.strip())
                        html_parts.append(f'<th>{c_text}</th>')
                    html_parts.append('</tr></thead><tbody>')
                else:
                    html_parts.append('<tr>')
                    for cell in row.cells:
                        c_text = clean_text(cell.text.strip())
                        html_parts.append(f'<td>{c_text}</td>')
                    html_parts.append('</tr>')
            html_parts.append('</tbody></table>')

    html_parts.append('</body></html>')

    full_html = "\n".join(html_parts)
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(full_html)

    # Render PDF via Chrome Headless
    chrome_cmd = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}",
        f"file://{os.path.abspath(html_path)}"
    ]
    subprocess.run(chrome_cmd, check=True)
    print(f"✅ Exported PDF: {pdf_path}")

def main():
    folder = "referencias/GUIONES"
    
    # Process Día 1 from Guion_Live_Dia_1.html
    cmd_dia1 = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={folder}/Guion_Dia1_El_Saboteador.pdf",
        f"file://{os.path.abspath('Guion_Live_Dia_1.html')}"
    ]
    subprocess.run(cmd_dia1, check=True)
    print(f"✅ Exported PDF: {folder}/Guion_Dia1_El_Saboteador.pdf")

    # Mapping of DOCX files to final PDF names
    file_map = [
        ("Guion_Dia2_La_Cuenta_Espejo.docx", "Guion_Dia2_La_Cuenta_Espejo.pdf"),
        ("Guion_Dia3_Planear_Antes_De_Sentir.docx", "Guion_Dia3_Planear_Antes_De_Sentir.pdf"),
        ("Guion_Dia4_Ejecutar_Sin_Negociar.docx", "Guion_Dia4_Ejecutar_Sin_Negociar.pdf"),
        ("Guion_Dia5_Documentar_Sin_Mentirte.docx", "Guion_Dia5_Documentar_Sin_Mentirte.pdf"),
        ("Guion_Dia6_Evaluar_Y_Mejorar.docx", "Guion_Dia6_Evaluar_Y_Mejorar.pdf"),
        ("Guion_Dia7_Masterclass_120min.docx", "Guion_Dia7_Masterclass_120min.pdf"),
        ("Guion_Dia8_Panel_Estudiantes.docx", "Guion_Dia8_Panel_Estudiantes.pdf"),
        ("Guion_Dia9_La_Decision.docx", "Guion_Dia9_La_Decision.pdf"),
        ("Guion_Dia10_El_Ultimo_Nivel.docx", "Guion_Dia10_El_Ultimo_Nivel.pdf"),
    ]

    for docx_name, pdf_name in file_map:
        d_path = os.path.join(folder, docx_name)
        p_path = os.path.join(folder, pdf_name)
        h_path = os.path.join(folder, docx_name.replace(".docx", ".html"))
        process_file(d_path, p_path, h_path)

if __name__ == "__main__":
    main()
