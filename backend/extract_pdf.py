import pypdf

reader = pypdf.PdfReader('C:/Users/RAGHUNATH YADAV/Downloads/Problem_Statement_10.pdf')
full_text = []
for i, page in enumerate(reader.pages):
    full_text.append(f"=== PAGE {i+1} ===\n" + page.extract_text())

with open("c:/Hackathon/CampToCorp/backend/problem_statement_text.txt", "w", encoding="utf-8") as f:
    f.write("\n\n".join(full_text))

print(f"Extracted {len(reader.pages)} pages successfully to problem_statement_text.txt")
