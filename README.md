# Prasar Bharati Dehradun Cluster - Government Guest House Booking Portal

A complete, production-ready Government Guest House Booking Portal for Prasar Bharati – Dehradun Cluster. Built using a modern full-stack architecture with Next.js, TailwindCSS, ShadCN UI, and Supabase.

---

## 🚀 Tech Stack

- **Frontend**: Next.js (App Router, React 19, TypeScript)
- **Styling**: TailwindCSS (v4) & ShadCN UI
- **Backend & Database**: Supabase (Auth, PostgreSQL DB, Storage)
- **Payments**: Razorpay
- **Email**: SMTP / Resend
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions

---

## 📂 Project Folder Structure

```
├── .github/workflows/      # CI/CD pipelines
│   └── ci.yml              # Build, lint, and typecheck workflow
├── src/
│   ├── app/                # Next.js App Router pages & layouts
│   │   ├── globals.css     # Global CSS styles including Tailwind configurations
│   │   ├── layout.tsx      # Main application layout
│   │   └── page.tsx        # Entrypoint home page
│   ├── components/         # Reusable frontend components
│   │   └── ui/             # ShadCN UI base components (e.g. button.tsx)
│   ├── lib/                # Shared utilities & configurations
│   │   ├── supabase.ts     # Supabase client integration
│   │   └── utils.ts        # Helper functions (e.g. cn for tailwind merging)
├── public/                 # Static assets (images, fonts, icons)
├── .env.example            # Environment variables template
├── .env.local              # Local environment variables (git-ignored)
├── components.json         # ShadCN UI configuration
├── next.config.ts          # Next.js configuration
├── package.json            # Node project configuration
├── tsconfig.json           # TypeScript configuration
└── vercel.json             # Vercel deployment configuration
```

---

## 🛠️ Getting Started

### Prerequisites

- Node.js (v20+ recommended, current workspace uses v26)
- npm (v10+)

### Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/etherhunt2023/Guest-House-Booking.git
   cd "Guest House Booking"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and fill in the required Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```
   Add your keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://amfygxmkhkcgbdbuodge.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-supabase-anon-key
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Development Phase Progression

This project is built using a strict Phase-Gated Development Process. The phases are:
1. **Phase 1: Project Initialization** (Current)
2. **Phase 2: Authentication**
3. **Phase 3: Database Architecture**
4. **Phase 4: Guest House Module**
5. **Phase 5: Room Management**
6. **Phase 6: Booking Module**
7. **Phase 7: Approval Workflow**
8. **Phase 8: Occupancy Calendar**
9. **Phase 9: Payment Integration (Razorpay)**
10. **Phase 10: Invoicing & Receipt PDF Generation**
11. **Phase 11: Email & SMS Notifications**
12. **Phase 12: Reports (Excel & PDF Export)**
13. **Phase 13: Admin Dashboard & Charts**
14. **Phase 14: Audit Logs**
15. **Phase 15: UI Polish & Animations**
16. **Phase 16: Automated & Security Testing**
17. **Phase 17: Production Deployment**

---

## 🧑‍💻 Verification & Build Checks

To verify that the code complies with quality metrics and builds correctly:
- Run linting checks: `npm run lint`
- Run TypeScript checks: `npm run typecheck`
- Run production build: `npm run build`
