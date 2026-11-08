import os
import shutil
import subprocess

docx_file = "PANDUAN_PRESENTASI_QA_QUIZMASTER.docx"
pdf_file = "PANDUAN_PRESENTASI_QA_QUIZMASTER.pdf"

ps_script = f'''
$docxPath = (Resolve-Path "{docx_file}").Path
$pdfPath = [System.IO.Path]::ChangeExtension($docxPath, ".pdf")

Write-Host "Exporting $docxPath to $pdfPath ..."

$word = New-Object -ComObject Word.Application
$word.Visible = $false

try {{
    $doc = $word.Documents.Open($docxPath)
    # 17 = wdExportFormatPDF
    $doc.ExportAsFixedFormat($pdfPath, 17)
    $doc.Close([ref]$false)
    Write-Host "SUCCESS: PDF export completed cleanly!"
}} catch {{
    Write-Host "ERROR: $($_.Exception.Message)"
}} finally {{
    $word.Quit()
}}
'''

with open('export_guide_pdf.ps1', 'w', encoding='utf-8') as f:
    f.write(ps_script)

res = subprocess.run(['powershell', '-ExecutionPolicy', 'Bypass', '-File', 'export_guide_pdf.ps1'], capture_output=True, text=True)
print(res.stdout)
if res.stderr:
    print('STDERR:', res.stderr)

if os.path.exists('export_guide_pdf.ps1'):
    os.remove('export_guide_pdf.ps1')

targets = [
    r"C:\Users\hafid\Downloads",
    r"C:\Downloads"
]

for t in targets:
    if os.path.exists(t):
        dest_docx = os.path.join(t, docx_file)
        dest_pdf = os.path.join(t, pdf_file)
        shutil.copy2(docx_file, dest_docx)
        print(f"Copied {docx_file} to {dest_docx} ({os.path.getsize(dest_docx):,} bytes)")
        if os.path.exists(pdf_file):
            shutil.copy2(pdf_file, dest_pdf)
            print(f"Copied {pdf_file} to {dest_pdf} ({os.path.getsize(dest_pdf):,} bytes)")
    else:
        print(f"Target directory {t} does not exist!")

