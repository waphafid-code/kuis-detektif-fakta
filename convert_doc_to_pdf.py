import os
import subprocess

ps_script = r'''
$docxPath = (Resolve-Path "LAPORAN_QA_AUDIT_OPTIMIZED.docx").Path
$pdfPath = [System.IO.Path]::ChangeExtension($docxPath, ".pdf")

Write-Host "Exporting $docxPath to $pdfPath ..."

$word = New-Object -ComObject Word.Application
$word.Visible = $false

try {
    $doc = $word.Documents.Open($docxPath)
    # 17 = wdExportFormatPDF
    $doc.ExportAsFixedFormat($pdfPath, 17)
    $doc.Close([ref]$false)
    Write-Host "SUCCESS: PDF export completed cleanly!"
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
} finally {
    $word.Quit()
}
'''

with open('export_pdf.ps1', 'w', encoding='utf-8') as f:
    f.write(ps_script)

res = subprocess.run(['powershell', '-ExecutionPolicy', 'Bypass', '-File', 'export_pdf.ps1'], capture_output=True, text=True)
print(res.stdout)
if res.stderr:
    print('STDERR:', res.stderr)

if os.path.exists('export_pdf.ps1'):
    os.remove('export_pdf.ps1')

pdf_file = 'LAPORAN_QA_AUDIT_OPTIMIZED.pdf'
if os.path.exists(pdf_file):
    print(f"Generated {pdf_file} (Size: {os.path.getsize(pdf_file):,} bytes)")
