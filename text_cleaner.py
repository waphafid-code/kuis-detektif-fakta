import re

def clean_latex_and_symbols(text):
    if not text:
        return ""
    # Common LaTeX replacements
    replacements = [
        (r'\ge', '≥'),
        (r'\le', '≤'),
        (r'\times', '×'),
        (r'\rightarrow', '→'),
        (r'\leftrightarrow', '↔'),
        (r'\text{Benar}', 'Jumlah Benar'),
        (r'\text{Requirement Teruji}', 'Requirement Teruji'),
        (r'\text{Requirement Terdefinisi}', 'Requirement Terdefinisi'),
        (r'\text{', ''),
        (r'\}', ''),
        (r'2^2 = 4', '2² = 4'),
        (r'2^2', '2²'),
        (r'$< 1$', '< 1'),
        (r'$<1$', '< 1'),
        (r'$> 80$', '> 80'),
        (r'$< 80$', '< 80'),
        (r'$\ge 80$', '≥ 80'),
        (r'$C_1$', 'C1'),
        (r'$C_2$', 'C2'),
        (r'$C_3$', 'C3'),
        (r'$A_1$', 'A1'),
        (r'$A_2$', 'A2'),
        (r'$A_3$', 'A3'),
        (r'$V_1$', 'V1'),
        (r'$I_1$', 'I1'),
        (r'$I_2$', 'I2'),
        (r'$N-1$', 'N - 1'),
        (r'$N+1$', 'N + 1'),
        (r'$N$', 'N'),
        (r'$L \times I$', 'L × I'),
        (r'$L \times I', 'L × I'),
        (r'\frac{5 Requirement Teruji}{5 Requirement Terdefinisi} \times 100\% = 100.0\%', '(5 / 5) × 100% = 100%'),
        (r'\frac{14 AC Teruji}{14 AC Terdefinisi} \times 100\% = 100.0\%', '(14 / 14) × 100% = 100%'),
        (r'\frac{6 Risiko Termitigasi}{6 Risiko Teridentifikasi} \times 100\% = 100.0\%', '(6 / 6) × 100% = 100%'),
        (r'\frac{14 Test Case Dieksekusi}{14 Test Case Terencana} \times 100\% = 100.0\%', '(14 / 14) × 100% = 100%'),
        (r'\frac{14 Test Case Lolos}{14 Test Case Dieksekusi} \times 100\% = 100.0\%', '(14 / 14) × 100% = 100%'),
        (r'•', '-'), # Remove decorative bullets, use formal dash or numbers
    ]
    
    for old, new in replacements:
        text = text.replace(old, new)
        
    # Strip any remaining $ symbols
    text = text.replace('$', '')
    # Strip any backslashes from LaTeX remnants
    text = text.replace(r'\%', '%')
    text = re.sub(r'\\([a-zA-Z]+)', r'\1', text)
    
    return text

def parse_markdown_runs(text):
    """
    Parses a string containing **bold**, *italic*, and ***bold italic***
    into a list of tuples: (substring, is_bold, is_italic).
    No asterisks will remain in the output!
    """
    cleaned = clean_latex_and_symbols(text)
    
    # Pattern to match ***...***, **...**, *...*, or `...`
    pattern = re.compile(r'(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|`.*?`)')
    parts = pattern.split(cleaned)
    
    runs = []
    for part in parts:
        if not part:
            continue
        if part.startswith('***') and part.endswith('***') and len(part) >= 6:
            runs.append((part[3:-3], True, True))
        elif part.startswith('**') and part.endswith('**') and len(part) >= 4:
            runs.append((part[2:-2], True, False))
        elif part.startswith('*') and part.endswith('*') and len(part) >= 2:
            runs.append((part[1:-1], False, True))
        elif part.startswith('`') and part.endswith('`') and len(part) >= 2:
            runs.append((part[1:-1], False, False))
        else:
            # Clean any stray unclosed asterisks
            plain = part.replace('*', '').replace('`', '')
            runs.append((plain, False, False))
            
    return runs

if __name__ == '__main__':
    sample = r"• Sumber Evidence: Telemetri Riwayat ($< 1$ menit). Skor batas $\ge 80$ dan formula $(Jumlah Benar / 20) \times 100$. Ini adalah *Requirement Ambiguity Review & Alignment* dan **Hasil Pengujian**."
    runs = parse_markdown_runs(sample)
    print("Parsed runs:")
    for r in runs:
        print("  ", r)

