"""Run on YOUR machine (needs internet): pip install requests beautifulsoup4 pdfplumber
Downloads each source_url in rag_documents.csv, saves the unchanged original to original_documents/,
extracts text to extracted_text/, and fills the path/status columns. Respects robots.txt;
skips login/CAPTCHA pages. Review every output before setting verification_status to verified."""
import csv, os, re, time, urllib.robotparser as rp
from urllib.parse import urlparse
import requests
from bs4 import BeautifulSoup
H={"User-Agent":"AdhikarAI-research/0.1"}
def allowed(url):
    p=urlparse(url); r=rp.RobotFileParser(f"{p.scheme}://{p.netloc}/robots.txt")
    try: r.read(); return r.can_fetch(H["User-Agent"],url)
    except Exception: return True
rows=list(csv.DictReader(open("rag_documents.csv",encoding="utf-8")))
for r in rows:
    url=r["original_file_url"] or r["source_url"]
    if not allowed(url): r["notes"]+=" | robots.txt disallows automated fetch; collect manually."; continue
    try: resp=requests.get(url,headers=H,timeout=30); resp.raise_for_status()
    except Exception as e: r["access_status"]="unavailable"; r["notes"]+=f" | fetch failed: {e}"; continue
    pdf="pdf" in resp.headers.get("content-type","").lower() or url.lower().endswith(".pdf")
    ext="pdf" if pdf else "html"
    op=f"original_documents/{r['document_id']}.{ext}"; open(op,"wb").write(resp.content)
    tp=f"extracted_text/{r['document_id']}.txt"
    if pdf:
        import pdfplumber
        with pdfplumber.open(op) as d: text="\n\n".join((pg.extract_text() or "") for pg in d.pages)
    else:
        soup=BeautifulSoup(resp.content,"html.parser")
        for t in soup(["script","style","nav","footer"]): t.decompose()
        text=re.sub(r"\n{3,}","\n\n",soup.get_text("\n"))
    open(tp,"w",encoding="utf-8").write(text)
    r.update(local_file_path=op,extracted_text_path=tp,document_format=ext.upper(),extraction_status="extracted" if len(text)>200 else "partially_extracted")
    time.sleep(2)
with open("rag_documents.csv","w",newline="",encoding="utf-8") as f:
    w=csv.DictWriter(f,fieldnames=rows[0].keys()); w.writeheader(); w.writerows(rows)
