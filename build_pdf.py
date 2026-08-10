import os
import re
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

def build_pdf():
    pdf_path = "Guion_Produccion_Live_Dia_1_El_Saboteador.pdf"
    
    # 0.6 in margins = 43.2 pt
    margin = 43.2
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=margin,
        rightMargin=margin,
        topMargin=margin,
        bottomMargin=margin
    )
    
    # Printable width = 612 - 2*43.2 = 525.6 pt
    usable_width = 525.6

    styles = getSampleStyleSheet()
    
    # Custom Palette
    COLOR_PRIMARY = colors.HexColor("#0F172A")    # Dark Navy
    COLOR_SECONDARY = colors.HexColor("#2563EB")  # Royal Blue
    COLOR_TEXT = colors.HexColor("#1E293B")       # Dark Charcoal
    COLOR_BG_BOX = colors.HexColor("#F8FAFC")     # Light Slate
    COLOR_BORDER = colors.HexColor("#E2E8F0")     # Light Border
    COLOR_HIGHLIGHT = colors.HexColor("#DC2626")  # Accent Red

    # Custom Styles
    style_category = ParagraphStyle(
        'CategoryHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=12,
        textColor=COLOR_SECONDARY,
        spaceAfter=4,
        textTransform='uppercase'
    )
    
    style_title = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=COLOR_PRIMARY,
        spaceAfter=4
    )
    
    style_subtitle = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor("#64748B"),
        spaceAfter=14
    )
    
    style_h2 = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=COLOR_PRIMARY,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    style_h3 = ParagraphStyle(
        'Heading3_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=COLOR_SECONDARY,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    style_body = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=COLOR_TEXT,
        spaceAfter=6
    )

    style_bullet = ParagraphStyle(
        'Bullet_Custom',
        parent=style_body,
        leftIndent=14,
        bulletIndent=4,
        spaceAfter=4
    )

    style_quote = ParagraphStyle(
        'Quote_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#334155"),
        leftIndent=16,
        spaceBefore=4,
        spaceAfter=6
    )

    style_tbl_hdr = ParagraphStyle(
        'TblHdr',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
        alignment=TA_LEFT
    )

    style_tbl_cell = ParagraphStyle(
        'TblCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=COLOR_TEXT,
        alignment=TA_LEFT
    )

    elements = []

    # Header
    elements.append(Paragraph("EL JUEGO MENTAL DEL DINERO · GUIÓN DE PRODUCCIÓN", style_category))
    elements.append(Paragraph("LIVE DÍA 1 — EL SABOTEADOR", style_title))
    elements.append(Paragraph("45 minutos · YouTube Live · guión completo con interacción permanente", style_subtitle))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=COLOR_SECONDARY, spaceBefore=0, spaceAfter=12))

    with open("Guion_Produccion_Live_Dia_1_El_Saboteador.md", "r", encoding="utf-8") as f:
        lines = f.readlines()

    in_table = False
    table_headers = []
    table_rows = []

    def format_inline_markdown(txt):
        # Convert **bold** to <b>bold</b>
        txt = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', txt)
        # Convert *italic* to <i>italic</i>
        txt = re.sub(r'\*(.*?)\*', r'<i>\1</i>', txt)
        return txt

    def render_table():
        nonlocal in_table, table_headers, table_rows
        if not in_table or not table_headers:
            return
        
        col_count = len(table_headers)
        if col_count == 3: # Interaccion table (Min | Tipo | Accion)
            col_widths = [usable_width * 0.15, usable_width * 0.35, usable_width * 0.50]
        elif col_count == 4: # Mapa del live (Bloque | Minutos | Contenido | Interaccion)
            col_widths = [usable_width * 0.22, usable_width * 0.18, usable_width * 0.30, usable_width * 0.30]
        else:
            col_widths = [usable_width / col_count] * col_count

        data = []
        hdr_cells = [Paragraph(format_inline_markdown(h.strip()), style_tbl_hdr) for h in table_headers]
        data.append(hdr_cells)

        for r_idx, row in enumerate(table_rows):
            row_cells = []
            for c_idx, val in enumerate(row):
                row_cells.append(Paragraph(format_inline_markdown(val.strip()), style_tbl_cell))
            data.append(row_cells)

        t = Table(data, colWidths=col_widths, repeatRows=1)
        ts = [
            ('BACKGROUND', (0, 0), (-1, 0), COLOR_PRIMARY),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ('LINEBELOW', (0, 0), (-1, 0), 1.5, COLOR_SECONDARY),
            ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ]
        for r in range(1, len(data)):
            if r % 2 == 0:
                ts.append(('BACKGROUND', (0, r), (-1, r), colors.HexColor("#F8FAFC")))
        t.setStyle(TableStyle(ts))
        elements.append(Spacer(1, 4))
        elements.append(t)
        elements.append(Spacer(1, 10))

        in_table = False
        table_headers = []
        table_rows = []

    skip_lines = True
    for line in lines:
        sline = line.strip()
        if "El sistema de retención" in sline:
            skip_lines = False
        if skip_lines:
            continue

        if sline.startswith("|"):
            parts = [p.strip() for p in sline.split("|")[1:-1]]
            if not parts or all(p.replace(":", "").replace("-", "") == "" for p in parts):
                continue
            if not in_table:
                in_table = True
                table_headers = parts
            else:
                table_rows.append(parts)
            continue
        else:
            if in_table:
                render_table()

        if not sline or sline.startswith("---"):
            continue

        formatted_line = format_inline_markdown(sline)

        if sline.startswith("## "):
            h_text = formatted_line.replace("## ", "")
            elements.append(Paragraph(h_text, style_h2))
        elif sline.startswith("### "):
            h_text = formatted_line.replace("### ", "")
            elements.append(Paragraph(h_text, style_h3))
        elif sline.startswith("• ") or sline.startswith("- "):
            b_text = formatted_line[2:]
            elements.append(Paragraph(f"• {b_text}", style_bullet))
        elif sline.startswith("⚡ ") or sline.startswith("CM ") or sline.startswith("Juan: ") or sline.startswith("EN PANTALLA:"):
            # Highlight callout box
            elements.append(Paragraph(formatted_line, style_quote))
        elif sline.startswith('"') or sline.startswith("“") or sline.startswith("•"):
            elements.append(Paragraph(formatted_line, style_body))
        else:
            elements.append(Paragraph(formatted_line, style_body))

    if in_table:
        render_table()

    doc.build(elements)
    print(f"PDF successfully generated: {pdf_path}")

if __name__ == "__main__":
    build_pdf()
