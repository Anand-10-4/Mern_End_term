# AmberRoast OS
### Specialty Coffee Batch Allocation & Sensory Cupping Protocol Platform

> **End-Term Software Engineering Project Submission**  
> **Student Name**: Anand Mohan  
> **Platform**: Full-Stack MERN (MongoDB, Express, React, Node.js) with TailwindCSS  

---

## ☕ 1. Problem Statement

Specialty coffee roasteries, estate farmers, and independent cafe collectives operate in a high-value, quality-critical market where green coffee lots fluctuate wildly based on sensory cupping scores. However, the current workflow suffers from major operational bottlenecks:
1. **Manual & Unstandardized Cupping Sheets**: Sensory cupping assessments are often hand-written or siloed in spreadsheets, leading to inconsistent defect tracking, delayed score publications, and opaque quality assertions.
2. **Allocation Allocation Spoilage & Hoarding**: Micro-lots often sell out in minutes, but buyers frequently hold uncommitted reservations, preventing roasters from locking real purchase orders and resulting in bean aging and moisture loss.
3. **Escrow Trust Deficit**: Cafes hesitate to disburse upfront funds without verified pre-shipment cupping audits, while roasters cannot afford to roast and ship custom micro-lots without payment guarantees.

AmberRoast OS solves this by unifying **sensory quality scoring (SCA 10-Attribute Protocol)**, **real-time 15-minute reservation locks**, and **multi-milestone B2B escrow contracts** with tamper-proof cryptographic lot certificates.

---

## 👥 2. Target Users

- **Artisan Micro-Roasters**: Ingest fresh green coffee, calibrate roast profiles (Nordic Filter, City+), track bean chemistry and moisture shrinkage loss, and sell reserved wholesale allocations.
- **Certified Q-Graders**: Conduct official 10-attribute sensory evaluations, subtract defect penalties, and digitally verify specialty grade status.
- **Wholesale Cafe Buyers**: Discover rare origin micro-lots, lock 15-minute reservation quotas, benefit from volume/tier discounts, and inspect verified flavor radar profiles.
- **Estate Producers & Protocol Administrators**: Monitor global harvest distributions, manage multi-sig escrow settlements, and inspect immutable system audit logs.

---

## 💡 3. Solution Overview

AmberRoast OS replaces generic e-commerce with a purpose-built B2B allocation engine. Every micro-lot has a traceable origin story, chemical density, and verified SCA score. Orders are executed through an automated state machine escrow pipeline where buyer funds are held in vault until roasting is scheduled, sensory quality is re-verified, and courier delivery is confirmed.

---

## 🎨 4. Design & Color Palette

Designed around an artisan craft roastery and golden honey motif:
- **Soft Cream Wax**: `#F9E6A8` (rgb 249, 230, 168)
- **Vibrant Honey Amber**: `#F2A900` (rgb 242, 169, 0)
- **Roasted Warm Amber**: `#CC6F00` (rgb 204, 111, 0)
- **Deep Espresso Brown**: `#4D2A00` (rgb 77, 42, 0)
- **Elevated Surfaces**: Deep charcoal-roast `#120A05`, `#1D1208`, glowing golden borders, and glassmorphism panels.

---

## ⚡ 5. Core Engineering Workflows

### Workflow 1: Multi-Role Authentication & Allocation Quota Management
- Secure JWT-based authentication with bcrypt password encryption.
- Distinct roles: `roaster`, `buyer`, `qgrader`, and `admin`.
- Tiered buyer quota limits (`Standard` 500 kg, `Silver` 1,000 kg, `Gold Reserve` 2,000 kg) with real-time usage tracking.
- Pre-configured 1-click evaluator persona switcher in the navigation bar.

### Workflow 2: Official SCA 10-Attribute Sensory Cupping Protocol
- Interactive Q-Grader scoring bench implementing the official Specialty Coffee Association formula:
  $$\text{Total Score} = \sum_{i=1}^{10} \text{Attribute}_i - (\text{Defect Cups} \times \text{Defect Intensity})$$
- Real-time SVG radar wheel visualization reacting dynamically to attribute sliders.
- Automatic grade categorization:
  - $\ge 90.00$: **Presidential Exemplar**
  - $85.00 - 89.99$: **Excellent Specialty**
  - $80.00 - 84.99$: **Specialty Grade**
  - $< 80.00$: **Commercial / Sub-Specialty (Auto-drafted)**
- Commits audit logs and instantly updates the lot's public certification.

### Workflow 3: Expiring Allocation Locks (15-Minute Reservation Countdown)
- High-concurrency allocation lock mechanism.
- Buyers can lock up to available kilograms for 15 minutes with a cryptographic reservation token.
- Background and on-query automated cleanup cleans expired reservations and restores available inventory.

### Workflow 4: Milestone-Backed B2B Escrow Pipeline
- Full state machine transition logic:
  $$\text{Escrow Held} \rightarrow \text{Roast Scheduled} \rightarrow \text{Cupping Verified} \rightarrow \text{Dispatched} \rightarrow \text{Delivered} \rightarrow \text{Escrow Released}$$
- Role-based transition permissions preventing unauthorized lifecycle skips.
- Generates downloadable/printable **Official Certificate of Authenticity** with SHA-256 digital seals and QR hashes.

### Workflow 5: Roastery Telemetry & Yield Analytics
- Live roast shrinkage loss calculations:
  $$\text{Shrinkage \%} = \frac{\text{Green Weight} - \text{Roasted Weight}}{\text{Green Weight}} \times 100$$
- Origin distribution breakdown by country (Ethiopia, Panama, Colombia, Kenya, Costa Rica).
- Real-time operational audit log stream tracking all system events.

---

## 🛠 6. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, TailwindCSS 3, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js (v20+), Express.js 4, Express-Validator, Morgan |
| **Database** | MongoDB with Mongoose ODM |
| **Security** | JSON Web Tokens (JWT), Bcrypt.js, CORS, Input Sanitization |
| **Testing** | Native automated test runner (`npm test`) |

---

## 📁 7. Project Structure

```text
Mern EndTerm/
├── backend/
│   ├── config/
│   │   └── db.js                        # Database connection setup
│   ├── controllers/
│   │   ├── authController.js            # Authentication & directory
│   │   ├── batchController.js           # Lots, inventory & expiring locks
│   │   ├── cuppingController.js         # SCA protocol scoring engine
│   │   ├── orderController.js           # Escrow state machine & certificates
│   │   └── analyticsController.js       # Yield & telemetry aggregator
│   ├── middlewares/
│   │   ├── authMiddleware.js            # JWT & role authorization
│   │   ├── errorMiddleware.js           # Centralized error handler
│   │   └── validateMiddleware.js        # Request parameter validation
│   ├── models/
│   │   ├── User.js                      # User schema with roles & quotas
│   │   ├── BatchLot.js                  # Specialty batch lot with reservations
│   │   ├── CuppingSession.js            # 10-attribute cupping record
│   │   ├── Order.js                     # Escrow contract with milestone logs
│   │   └── AuditLog.js                  # Global operational audit trail
│   ├── routes/
│   │   ├── authRoutes.js                # /api/auth/*
│   │   ├── batchRoutes.js               # /api/batches/*
│   │   ├── cuppingRoutes.js             # /api/cuppings/*
│   │   ├── orderRoutes.js               # /api/orders/*
│   │   └── analyticsRoutes.js           # /api/analytics/*
│   ├── scripts/
│   │   └── seed.js                      # Realistic database seeder
│   ├── test/
│   │   └── api.test.js                  # Unit & integration test suite
│   ├── utils/
│   │   ├── scaCalculator.js             # SCA algorithm & shrinkage math
│   │   └── tokenHelper.js               # JWT tokens & SHA256 hashes
│   ├── .env                             # Backend environment variables
│   ├── index.js                         # Express server entry point
│   ├── package.json                     # Backend dependencies
│   ├── README.md                        # Backend documentation
│   └── AmberRoast_API_Collection.json   # Postman test collection
│
├── frontend/
│   ├── dist/                            # Production build
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Navigation & 1-click persona switch
│   │   │   ├── LotCard.jsx              # Micro-lot card with progress bar
│   │   │   ├── CuppingRadar.jsx         # 10-attribute SVG radar wheel
│   │   │   ├── ReservationModal.jsx     # 15-min lock & pricing calculator
│   │   │   └── CertificateModal.jsx     # Printable Certificate of Authenticity
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          # Auth state & session switcher
│   │   │   └── ToastContext.jsx         # Animated toast notification system
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx            # Executive telemetry dashboard
│   │   │   ├── Marketplace.jsx          # Faceted search & allocation grid
│   │   │   ├── BatchDetail.jsx          # Deep terroir & chemistry profile
│   │   │   ├── CuppingLab.jsx           # Interactive SCA cupping bench
│   │   │   ├── CreateLot.jsx            # Micro-lot registration form
│   │   │   ├── OrdersEscrow.jsx         # Escrow milestone progression ledger
│   │   │   ├── Analytics.jsx            # Roastery graphs & audit stream
│   │   │   └── LoginRegister.jsx        # Login & registration view
│   │   ├── services/
│   │   │   └── api.js                   # REST API client
│   │   ├── App.jsx                      # Main app shell & router
│   │   ├── index.css                    # Tailwind & glassmorphism theme
│   │   └── main.jsx                     # React root mount
│   ├── .env                             # Frontend environment variables
│   ├── index.html                       # HTML5 entry with Google Fonts
│   ├── package.json                     # Frontend dependencies
│   ├── postcss.config.js                # PostCSS configuration
│   ├── tailwind.config.js               # Tailwind custom color theme
│   ├── vite.config.js                   # Vite configuration with proxy
│   ├── scratch/                         # Scratch folder
│   └── README.md                        # Frontend documentation
│
└── README.md                            # Comprehensive Root Documentation
```

---

## 🚀 8. Local Setup Instructions

### 1. Clone & Navigate
```bash
cd "Mern EndTerm"
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed       # Seeds realistic lots, buyers, roasters, cuppings & orders
npm test           # Runs the automated test suite
npm run dev        # Starts backend API on http://localhost:5001
```

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev        # Starts Vite dev server on http://localhost:5173
```
Open **`http://localhost:5173`** in your browser.

---

## 🔑 9. Demo Credentials & Quick Personas

The top banner of the application includes a **1-click Persona Switcher**, or you can log in manually:

| Persona | Email | Password | Role | Tier Quota |
|---|---|---|---|---|
| **Wholesale Buyer** | `buyer@amberroast.io` | `password123` | `buyer` | Gold Reserve (1,500 kg) |
| **Artisan Roaster** | `roaster@amberroast.io` | `password123` | `roaster` | Gold Reserve (3,000 kg) |
| **Q-Grader CQI** | `qgrader@amberroast.io` | `password123` | `qgrader` | Certified Q-Grader #4092 |
| **Director Admin** | `admin@amberroast.io` | `password123` | `admin` | Protocol Director |

---

## 📋 10. Submission Summary Form Fields

```text
Project Name: AmberRoast OS - Specialty Batch Allocation & Sensory Cupping Protocol Platform
Student Name: Anand Mohan
Problem Statement: Fragmented quality grading, inventory hoarding, and escrow payment risks in specialty coffee micro-batch trade
GitHub Repository: [Your GitHub Repo Link]
Deployed Application / Build: http://localhost:5173
Demo Video: [Link to 3-5 Minute Demo Video]
Tech Stack: MongoDB, Express.js, React 18, Node.js, TailwindCSS, Vite
Major Features:
1. SCA 10-Attribute Cupping Protocol Scoring Engine with Dynamic SVG Radar Wheel
2. High-concurrency 15-minute expiring allocation reservation locks
3. B2B Multi-milestone Escrow Pipeline (Escrow Held -> Roast Scheduled -> Cupping Verified -> Dispatched -> Delivered -> Released)
4. Printable Digital Certificate of Authenticity with SHA-256 seal
5. Roastery Telemetry & Roast Shrinkage Loss Ratio Analytics
```
