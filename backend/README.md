# AmberRoast OS - Backend API

AmberRoast OS is an enterprise-grade specialty coffee micro-batch allocation, sensory cupping protocol, and escrow contract platform built with Node.js, Express, and MongoDB.

---

## 🛠 Tech Stack

- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs password hashing
- **Validation**: Express-Validator
- **Testing**: Native automated test suite covering SCA algorithms & Mongoose integration

---

## 📂 Architecture & Directory Structure

```text
backend/
├── config/
│   └── db.js                      # MongoDB connection setup
├── controllers/
│   ├── authController.js          # Authentication, user profiles & directory
│   ├── batchController.js         # Batch registration, inventory & expiring reservations
│   ├── cuppingController.js       # Official SCA 100-point cupping protocol evaluations
│   ├── orderController.js         # Escrow contract lifecycle & quality certificates
│   └── analyticsController.js     # Yield efficiency, roast loss & telemetry
├── middlewares/
│   ├── authMiddleware.js          # JWT verification & role-based authorization
│   ├── errorMiddleware.js         # Centralized error handler & Mongoose error parser
│   └── validateMiddleware.js      # Request schema validator
├── models/
│   ├── User.js                    # User schema (Roasters, Buyers, Q-Graders, Admin)
│   ├── BatchLot.js                # Specialty coffee lot with expiring reservation locks
│   ├── CuppingSession.js          # 10-attribute SCA sensory evaluation schema
│   ├── Order.js                   # B2B Escrow milestone contract schema
│   └── AuditLog.js                # System-wide operational audit log
├── routes/
│   ├── authRoutes.js              # /api/auth/*
│   ├── batchRoutes.js             # /api/batches/*
│   ├── cuppingRoutes.js           # /api/cuppings/*
│   ├── orderRoutes.js             # /api/orders/*
│   └── analyticsRoutes.js         # /api/analytics/*
├── scripts/
│   └── seed.js                    # High-fidelity realistic dataset seeder
├── test/
│   └── api.test.js                # Unit and integration test suite
├── utils/
│   ├── scaCalculator.js           # SCA 100-pt formula & roast shrinkage loss math
│   └── tokenHelper.js             # JWT signer & SHA256 cryptographic lot hash
├── .env                           # Environment configuration
├── index.js                       # Express application entry point
├── package.json                   # Dependencies and scripts
└── AmberRoast_API_Collection.json # Postman API test collection
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure MongoDB is running locally (`mongodb://127.0.0.1:27017`) or configure `MONGODB_URI` in `.env`.

### 2. Install Dependencies
```bash
npm install
```

### 3. Seed Database
Populates the database with realistic specialty coffee lots, certified cupping records, buyers, roasters, and active escrow orders:
```bash
npm run seed
```

### 4. Run Automated Tests
```bash
npm test
```

### 5. Start Development Server
```bash
npm run dev
# Server will run at http://localhost:5001
```

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Email | Password | Tier / Quota |
|---|---|---|---|
| **Artisan Roaster** | `roaster@amberroast.io` | `password123` | Gold Reserve (3,000 kg) |
| **Wholesale Buyer** | `buyer@amberroast.io` | `password123` | Gold Reserve (1,500 kg) |
| **Specialty Q-Grader** | `qgrader@amberroast.io` | `password123` | CQI Certified #4092 |
| **System Admin** | `admin@amberroast.io` | `password123` | Protocol Director |
