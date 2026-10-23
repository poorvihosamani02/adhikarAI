AdhikarAI Dataset 2 - README (prepared 2026-10-21)

PURPOSE
Starter metadata and knowledge records for a RAG chatbot and Know Your Rights module.
This is a SMALL, PARTIAL first pass. It is not the 15-20 documents / 10-15 records requested.

FILES
- rag_documents.csv      7 records (22 required columns)
- know_your_rights.csv   4 records (18 required columns)
- collect_and_extract.py script for you to run locally to download originals and extract text
- original_documents/    EMPTY. No original PDF/HTML was saved (see limitations).
- extracted_text/        EMPTY. No extracted text was created.

WHAT WAS ACTUALLY ACCESSED (2026-10-21)
- Read in full: rtionline.gov.in home page (DOC001) and FAQ (DOC002).
- Seen only as search excerpts/metadata: NALSA legal services (DOC003), Kerala SLSA legal aid page (DOC004),
  India Code RTI Act record (DOC005, metadata only), Kerala Police 1930 notice (DOC007).
- Not accessible: cybercrime.gov.in (DOC006) - automated access was refused, content not read.

LIMITATIONS
- The sandbox had no network access for downloads, so no original files were saved. No extracted text was
  written, because nothing was extracted into a file. All extraction_status values are therefore not_started
  except DOC005 (metadata only = partially_extracted).
- Only DOC001, DOC002 and RIGHT001-002 are marked verified, and only for portal procedure, not for the Act text.
- Statutory text (RTI Act, Legal Services Authorities Act) was not read; section numbers beyond those shown on
  official pages are NOT given. Confirm on India Code.
- Not covered at all: fundamental rights, consumer rights, grievance redressal (CPGRAMS), privacy/DPDP,
  student/scholarship rights, myScheme/NSP scheme guidelines, PIB Fact Check, Karnataka-specific procedures.
- Several non-official pages (law blogs, Wikipedia, news, Vikaspedia, Casemine) appeared in search and were
  deliberately NOT used as sources.

NEEDING FURTHER VERIFICATION
DOC003, DOC004, DOC005, DOC006, DOC007; RIGHT003, RIGHT004. Section 12 income ceilings in particular.
The RTI Online FAQ URL contains a changing pageid parameter.

NEXT STEPS
1. pip install requests beautifulsoup4 pdfplumber; run: python collect_and_extract.py (from this folder).
2. Open each saved original and check titles, dates and eligibility details by hand; then update verification_status.
3. Add the missing topics above from India Code, consumeraffairs.nic.in, myscheme.gov.in, scholarships.gov.in and
   Karnataka department sites; open cybercrime.gov.in manually.
4. Chunk extracted_text/<DOC_ID>.txt (e.g. 500-800 tokens, with overlap), keep document_id in each chunk's metadata,
   embed, store in a vector DB, and cite source_url in answers.
