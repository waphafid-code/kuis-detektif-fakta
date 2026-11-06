import os
import re
import pandas as pd
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

# 1. Parse student_roster.js
with open("js/student_roster.js", "r", encoding="utf-8") as f:
    text = f.read()

classes = re.findall(r"'(X\s*E\s*\d)'\s*:\s*\[(.*?)\]", text, re.DOTALL)
roster_rows = []
num = 1
for cls_name, students_str in classes:
    names = re.findall(r'"([^"]+)"', students_str)
    for name in names:
        roster_rows.append({
            "No": num,
            "Kelas": cls_name,
            "Nama Siswa": name,
            "Status Sanitasi": "Tersanitasi (Sanitized)",
            "Kepatuhan Privasi": "Nama Siswa Resmi Tanpa NIK/No.HP (Sesuai UU PDP & Etika Praktikum Hal 5)"
        })
        num += 1

df_roster = pd.DataFrame(roster_rows)
df_roster.to_csv("test-cases/05_Dataset_Sanitized_Students_216.csv", index=False, encoding="utf-8")

# Export to Excel with styling
wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Dataset Roster 216 Siswa"

header_fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
header_font = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
data_font = Font(name="Segoe UI", size=10)
thin_border = Border(
    left=Side(style='thin', color='CBD5E1'),
    right=Side(style='thin', color='CBD5E1'),
    top=Side(style='thin', color='CBD5E1'),
    bottom=Side(style='thin', color='CBD5E1')
)

ws.append(list(df_roster.columns))
for c_i in range(1, len(df_roster.columns) + 1):
    cell = ws.cell(row=1, column=c_i)
    cell.fill = header_fill
    cell.font = header_font
    cell.alignment = Alignment(horizontal="center", vertical="center")
    
for r_i, r in df_roster.iterrows():
    ws.append(list(r))
    curr_row = r_i + 2
    for c_i in range(1, len(df_roster.columns) + 1):
        cell = ws.cell(row=curr_row, column=c_i)
        cell.font = data_font
        cell.border = thin_border
        if c_i in [1, 2, 4]:
            cell.alignment = Alignment(horizontal="center", vertical="center")
        else:
            cell.alignment = Alignment(vertical="center")

for col in ws.columns:
    max_len = max(len(str(c.value or "")) for c in col)
    ws.column_dimensions[col[0].column_letter].width = min(max(max_len + 3, 10), 50)
    
wb.save("test-cases/05_Dataset_Sanitized_Students_216.xlsx")
print(f"[OK] Exported {len(df_roster)} students to CSV & XLSX")

# 2. Parse default_records.js
with open("js/default_records.js", "r", encoding="utf-8") as f:
    rec_text = f.read()

rec_matches = re.findall(
    r'"id":\s*"([^"]+)".*?"moduleId":\s*"([^"]+)".*?"name":\s*"([^"]+)".*?"class":\s*"([^"]+)".*?"score":\s*(\d+).*?"duration":\s*"([^"]+)".*?"date":\s*"([^"]+)"',
    rec_text,
    re.DOTALL
)

if rec_matches:
    records_rows = []
    for idx, (rec_id, mod_id, name, cls, score, dur, dt) in enumerate(rec_matches, start=1):
        s_val = int(score)
        mod_label = "Keamanan Jaringan (Modul 2)" if "jaringan" in mod_id else "Detektif Fakta (Modul 1)"
        kkm_status = "LULUS KKM (TUNTAS)" if s_val >= 80 else "REMEDIAL (< 80)"
        records_rows.append({
            "No": idx,
            "ID Bukti Ujian": rec_id,
            "Nama Siswa": name.title(),
            "Kelas": cls,
            "Modul Kuis": mod_label,
            "Skor Capaian": s_val,
            "Status KKM 80": kkm_status,
            "Durasi": dur,
            "Tanggal Submit": dt,
            "Status Privasi": "Tersanitasi (Sanitized)"
        })
        
    df_rec = pd.DataFrame(records_rows)
    df_rec.to_csv("test-cases/05_Dataset_Historical_Scores_155.csv", index=False, encoding="utf-8")
    
    wb_r = openpyxl.Workbook()
    ws_r = wb_r.active
    ws_r.title = "Dataset Nilai Historis 155"
    
    pass_fill = PatternFill(start_color="D1FAE5", end_color="D1FAE5", fill_type="solid")
    pass_font = Font(name="Segoe UI", size=10, bold=True, color="065F46")
    remed_fill = PatternFill(start_color="FEE2E2", end_color="FEE2E2", fill_type="solid")
    remed_font = Font(name="Segoe UI", size=10, bold=True, color="991B1B")
    
    ws_r.append(list(df_rec.columns))
    for c_i in range(1, len(df_rec.columns) + 1):
        cell = ws_r.cell(row=1, column=c_i)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")
        
    for r_i, r in df_rec.iterrows():
        ws_r.append(list(r))
        curr_row = r_i + 2
        for c_i, val in enumerate(list(r), start=1):
            cell = ws_r.cell(row=curr_row, column=c_i)
            cell.font = data_font
            cell.border = thin_border
            if c_i == 7: # Status KKM
                if "LULUS" in str(val):
                    cell.fill = pass_fill
                    cell.font = pass_font
                else:
                    cell.fill = remed_fill
                    cell.font = remed_font
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif c_i in [1, 2, 4, 6, 8, 9, 10]:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            else:
                cell.alignment = Alignment(vertical="center")

    for col in ws_r.columns:
        max_len = max(len(str(c.value or "")) for c in col)
        ws_r.column_dimensions[col[0].column_letter].width = min(max(max_len + 3, 10), 45)

    wb_r.save("test-cases/05_Dataset_Historical_Scores_155.xlsx")
    print(f"[OK] Exported {len(df_rec)} records to CSV & XLSX")
