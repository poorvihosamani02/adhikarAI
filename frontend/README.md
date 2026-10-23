# AdhikarAI — Frontend Application

Modern React + Vite citizen services portal for discovering government schemes, validating application documents, scanning suspicious scam messages, and consulting legal rights.

## Tech Stack
- **Framework:** React 18
- **Bundler / Server:** Vite 5
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Design System:** Vanilla CSS with custom tokens & glassmorphic aesthetics

## Key Features
1. **Mock Login (`/login`)**: Fast 1-click citizen login for hackathon practice.
2. **Citizen Dashboard (`/dashboard`)**: Prominent dual CTAs for *Find My Schemes* and *All Schemes*, plus quick-launch modules and dataset statistics.
3. **Profile Setup (`/profile`)**: Captures income, caste category, residence state, education, and occupation to power eligibility matching.
4. **Find My Schemes (`/find-schemes`)**: Scrollable cards with indicative match percentages, benefit breakdowns, and reasoning based on dataset criteria.
5. **All Schemes (`/schemes`)**: Full catalog of 20 verified schemes from `schemes_raw.csv` with category filtering and real-time search.
6. **Scheme Detail & Checklist (`/schemes/:id`)**: Comprehensive eligibility rules, source links, and an interactive document checklist with 1-click export to Document Doctor.
7. **Document Doctor (`/document-doctor`)**: Pre-validates uploaded certificates against 30 official Indian rules (`document_doctor_dataset.csv`).
8. **Scam Shield (`/scam-shield`)**: Heuristic message scanner matching suspicious SMS/WhatsApp alerts against 22 verified Indian threat typologies (`scam_message_dataset.csv`).
9. **Know Your Rights Chatbot (`/know-your-rights`)**: Grounded legal-rights assistant backed by `know_your_rights.csv` and `rag_documents.csv`.
10. **Demo Mode Switch**: Banner at the top allows 1-click toggling between Practice Demo Mode (with local dataset adapters) and Live Backend Mode (`http://localhost:3000`).

## How to Install & Run in Windows PowerShell

Open a PowerShell terminal:

```powershell
# Navigate to the frontend directory
cd c:\Users\DELL\Desktop\adhikar-practice\frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend will run at:
`http://localhost:5173/`

## Production Build Verification
To test building the production bundle:

```powershell
npm run build
```
