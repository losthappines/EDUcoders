# OnaCare AI — Avtomatlashtirilgan Patronaj Tizimi (Continuity of Care)

National AI Hackathon **Task #11** solution: An AI-driven hospital-to-polyclinic discharge handoff and mandatory 24-hour Regional Family Doctor patronage platform for severe maternal and perinatal patients discharged from OvaBMU in Uzbekistan.

## Key Capabilities

1. **4-Step Agentic AI Continuity Coordinator (`/api/agent/discharge-handoff`)**
   - **Step 1 — EHR & Lab Synthesis Agent**: Evaluates ICD-10 diagnosis, inpatient vitals, and lab panels (Hb, BP, proteinuria, WBC, platelets) to compute a `0–100` post-discharge risk score and top 3 clinical red flags.
   - **Step 2 — Territorial Routing & Conflict Agent**: Matches the patient's district & mahalla to the responsible Family Polyclinic and books a conflict-free 2-hour home-visit window within 24 hours.
   - **Step 3 — Clinical Checklist & Patient Guide Agent**: Generates a condition-specific 5-item physical exam checklist in Uzbek (plus RU/EN) and plain-language home care rules.
   - **Step 4 — Autonomous SLA Escalation & Triage Agent**: Starts the strict `24:00:00` SLA timer, evaluates patient symptom check-ins, and fires automated 12h warning & 18h critical Telegram/SMS alerts to the Chief Doctor.

2. **Three Role-Based Portals + Hackathon Judge Demo Bar**
   - **Overview (`/`)**: Live continuity pipeline, KPI summary, AI trace & HL7 FHIR bundle inspection.
   - **Doctor & Clinical Dashboard (`/clinical`)**: OvaBMU Inpatient EHR & 1-click **"Discharge & Trigger AI Patronage (Javob berish)"** + Regional Family Doctor live **"Aktiv Chaqiruv"** queue, checklist, vitals logger, and follow-up lab ordering.
   - **Patient Portal (`/patient`)**: Mobile-first Uzbek / Russian / English portal with recovery guide, active e-prescriptions & adherence tracking, AI Home Symptom Check-in, and 4-digit OTP / 1-tap visit confirmation.
   - **Reception & Admin Panel (`/admin`)**: Bed release status, territorial routing table, Red/Yellow/Green 24-hour SLA compliance monitor, pharmacy stock & State Patronage Grant accounting (*"Davlat kafolatlangan tibbiy paket"*), and immutable security audit logs.

3. **Security, Privacy & Interoperability**
   - **RBAC Enforcement**: `OVABMU_MD`, `FAMILY_MD`, `PATIENT`, `ADMIN_RECEPTION` (clinical notes redacted for Reception/Admin; Family Doctors scoped to their polyclinic).
   - **AES-256-GCM Field Encryption & JSHSHIR Masking**: Sensitive clinical notes and national IDs encrypted at rest.
   - **HL7 FHIR R4 Bundle Export (`/api/fhir/[activeCallId]`)**: Generates valid `Bundle` containing `Patient`, `Encounter`, `CarePlan`, `Task`, and `MedicationRequest`.
   - **Object Storage Abstraction (`/api/storage/[...key]`)**: Epikriz HTML and ultrasound SVG archive with serverless cold-start reconstruction from PostgreSQL.

## Deploy to Vercel (Recommended)

1. Import `losthappines/EDUcoders` in [vercel.com](https://vercel.com) → **Add New → Project**.
2. Add a hosted **PostgreSQL** database from the Vercel Marketplace (e.g., **Neon** or **Supabase**) — this sets `DATABASE_URL` automatically.
3. Add `ENCRYPTION_KEY` in **Project Settings → Environment Variables** (e.g., `ovabmu-patronaj-aes256-hackathon-key-32b`).
4. Push the Prisma schema to your hosted Postgres database once (from your local terminal with `DATABASE_URL` set, or in Vercel's Build Command for the first deploy):
   ```bash
   npx prisma db push
   ```
5. Deploy — on the first request, `ensureSeeded()` automatically populates the 3 pre-seeded Uzbek OvaBMU clinical cases.

## Local Development (PostgreSQL)

```bash
cp .env.example .env
# Set DATABASE_URL in .env to your local or cloud PostgreSQL URL
npm install
npx prisma db push
npm run dev
```