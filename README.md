# 🏥 DermAINE Dashboard — Clinical Dermatology Practice & Scheduling Portal

![UI Architecture Banner](https://github.com/shahjalal-labs/dermaine_dashboard/blob/main/assets/banner.svg)

---

## 📌 Executive Overview

**DermAINE Dashboard** is the multi-tenant clinical operations and medical practice command center for the DermAINE clinical dermatology network. Engineered with **Next.js 16 (Turbopack, App Router)**, **Ant Design**, **Redux Toolkit (RTK Query)**, and **Tailwind CSS**, this platform equips medical directors, clinic administrators, and dermatology practitioners with tools for real-time doctor availability management, patient diagnostic evaluation tracking, automated matchmaking rule authoring, consultation stream coordination, and subscription billing oversight.

---

## 🚀 Key Administrative & Domain Capabilities

- **Multi-Clinic Practice Tenancy:** Dedicated organizational spaces for clinics, dermatology centers, and independent medical groups to manage staff and operational settings.
- **Practitioner Scheduling & Slot Configuration:** Comprehensive scheduling engine to define dermatologist consultation hours, interval buffers, and holiday blackouts.
- **Diagnostic Rules & Scoring Engine:** Interactive authoring tools for configuring symptom scoring factors, diagnostic thresholds, and practitioner specialty routing rules.
- **Clinical Programs & Regimen Tracking:** Design custom patient skincare regimens, treatment intervals, and medical progress compliance tracking.
- **Financial Analytics & Stripe Subscriptions:** Auditing consultation payments, organizational membership subscriptions, and transaction settlement histories.
- **Telehealth Video Coordination:** Management and monitoring of live video consultation streams and clinical examination sessions.

---

## 🏛️ Application Architecture & Route Tree

```text
dermaine_dashboard/
├── assets/
│   └── banner.svg                     # High-resolution architectural banner
├── src/
│   ├── app/
│   │   ├── (auth)/                    # Multi-tier authentication
│   │   │   ├── admin/                 # Platform administrator access
│   │   │   ├── organization/          # Clinic organization onboarding
│   │   │   ├── login/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   └── verify-otp/
│   │   ├── (organization)/            # Multi-clinic tenancy viewports
│   │   │   └── organization/          # Facility details, staff rosters & reports
│   │   ├── (dashboard)/               # Central operations & system analytics
│   │   │   ├── admin/                 # SuperAdmin controls & platform rules
│   │   │   ├── layout.tsx             # Persistent sidebar & administrative topbar
│   │   │   └── page.tsx               # Analytics overview & operational KPIs
│   │   ├── layout.tsx                 # Root layout with Redux & Theme providers
│   │   └── globals.css                # Tailwind CSS styling and theme primitives
│   ├── components/
│   │   ├── organization/              # Clinic tenant management panels
│   │   ├── dashboard/                 # Analytics cards, Topbar, and Navigation
│   │   ├── modal/                     # Scheduling, subscription, and organization modals
│   │   └── table/                     # Data tables (Payments, Users, Subscriptions)
│   ├── redux/
│   │   ├── api/                       # RTK Query services (Admin, Org, Availability, Rules, Payments)
│   │   └── store.ts                   # Centralized application store
│   ├── schema/                        # Zod form validation schemas
│   └── types/                         # TypeScript interfaces & domain models
├── package.json                       # Next.js 16, React 18, Ant Design, RTK
└── tsconfig.json                      # Strict TypeScript compiler options
```

---

## 💻 Tech Stack Specification

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 16 (Turbopack, App Router, React 18) |
| **UI Design System** | Ant Design 5, Radix UI Primitives, Lucide Icons |
| **State & API Caching** | Redux Toolkit (RTK), RTK Query |
| **Styling & Animation** | Tailwind CSS 3.4, PostCSS, Tailwindcss-Animate |
| **Form Validation** | React Hook Form, Zod Resolver |
| **Authentication** | JWT Decode, JS Cookie, Input OTP, SweetAlert2 |
| **Language** | TypeScript 5 (Strict Mode) |

---

## 🛠️ Getting Started & Local Development

### Prerequisites

- **Node.js:** `v20.x` or higher
- **Package Manager:** `npm`, `yarn`, or `pnpm`

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/shahjalal-labs/dermaine_dashboard.git
cd dermaine_dashboard
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_BASE_URL_LOCAL=http://localhost:5000/api/v1
```

### 3. Run Development Server (Turbopack)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to access the administrative dashboard.

---

## 👨‍💻 Engineering & Authorship

Developed and engineered by **Md. Shahjalal**.

- **GitHub:** [@shahjalal-labs](https://github.com/shahjalal-labs)
- **Email:** [muhommodshahjalal@gmail.com](mailto:muhommodshahjalal@gmail.com)

---

## 📄 License

This project is licensed under the **ISC License**.
