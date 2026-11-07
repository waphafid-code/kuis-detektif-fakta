import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

from text_cleaner import clean_latex_and_symbols, parse_markdown_runs

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color="D1D5DB", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def style_academic_table(table, col_widths=None, header_bg="E2E8F0", alt_bg="F8FAFC"):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table)
    
    # Header Row
    for idx, cell in enumerate(table.rows[0].cells):
        set_cell_background(cell, header_bg)
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        
        # Clean header text
        raw_text = cell.text
        cell.text = "" # Clear plain text
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        
        runs = parse_markdown_runs(raw_text)
        for sub_text, is_b, is_i in runs:
            run = p.add_run(sub_text)
            run.bold = True
            run.italic = is_i
            run.font.name = "Times New Roman"
            run.font.size = Pt(9.5)
            run.font.color.rgb = RGBColor(0, 0, 0)
            
        if col_widths and idx < len(col_widths):
            cell.width = Inches(col_widths[idx])
            
    # Data Rows
    for r_idx, row in enumerate(table.rows[1:]):
        bg = alt_bg if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, cell in enumerate(row.cells):
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            
            raw_text = cell.text
            cell.text = ""
            p = cell.paragraphs[0]
            # Center if short status or ID
            clean_check = raw_text.strip()
            if clean_check in ['PASS', 'FAIL', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14',
                               'TC-01', 'TC-02', 'TC-03', 'TC-04', 'TC-05', 'TC-06', 'TC-07', 'TC-08', 'TC-09', 'TC-10', 'TC-11', 'TC-12', 'TC-13', 'TC-14',
                               'REQ-01', 'REQ-02', 'REQ-03', 'REQ-04', 'REQ-05',
                               'RSK-01', 'RSK-02', 'RSK-03', 'RSK-04', 'RSK-05', 'RSK-06',
                               'TS-01', 'TS-02', 'TS-03', 'TS-04', 'TS-05']:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            
            runs = parse_markdown_runs(raw_text)
            for sub_text, is_b, is_i in runs:
                run = p.add_run(sub_text)
                run.bold = is_b or (clean_check in ['PASS', 'REQ-01', 'REQ-02', 'REQ-03', 'REQ-04', 'REQ-05', 'TC-01', 'TC-02', 'TC-03', 'TC-04', 'TC-05', 'TC-06', 'TC-07', 'TC-08', 'TC-09', 'TC-10', 'TC-11', 'TC-12', 'TC-13', 'TC-14'])
                run.italic = is_i
                run.font.name = "Times New Roman"
                run.font.size = Pt(9.0)
                run.font.color.rgb = RGBColor(0, 0, 0)
                
            if col_widths and c_idx < len(col_widths):
                cell.width = Inches(col_widths[c_idx])

print("Updated build_helpers.py successfully.")
