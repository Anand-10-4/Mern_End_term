# GoldenCrust Bakery - Backend API

GoldenCrust is an artisan bakery platform and custom cake studio backend built with Node.js, Express, and MongoDB.

---

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs
- **Validation**: Express-Validator
- **Testing**: Automated integration and unit test suite

---

## 📂 Architecture & Directory Structure

```text
backend/
├── config/
│   └── db.js                      # MongoDB connection setup
├── controllers/
│   ├── authController.js          # Authentication, user profiles
│   ├── productController.js       # Daily bakery catalog, inventory & restock
│   ├── customCakeController.js    # Interactive custom cake pricing & builder
│   ├── orderController.js         # Kitchen prep pipeline state machine & checkout
│   └── analyticsController.js     # Bakery sales telemetry & kitchen queue KPIs
├── middlewares/
│   ├── authMiddleware.js          # JWT verification & role authorization
│   ├── errorMiddleware.js         # Centralized error handler
│   └── validateMiddleware.js      # Request parameter validator
├── models/
│   ├── User.js                    # Customer, Baker, and Admin schema
│   ├── Product.js                 # Fresh daily bakes with stock levels & dietary tags
│   ├── CustomCake.js              # Personalized cake studio designs
│   ├── Order.js                   # Kitchen orders with milestone state transitions
│   └── AuditLog.js                # System-wide operational audit log
├── routes/
│   ├── authRoutes.js              # /api/auth/*
│   ├── productRoutes.js           # /api/products/*
│   ├── customCakeRoutes.js        # /api/custom-cakes/*
│   ├── orderRoutes.js             # /api/orders/*
│   └── analyticsRoutes.js         # /api/analytics/*
├── scripts/
│   └── seed.js                    # Realistic bakery catalog & user seeder
├── test/
│   └── api.test.js                # Automated test runner
├── utils/
│   ├── cakePricing.js             # Dynamic custom cake pricing formula
│   └── tokenHelper.js             # JWT signer & order number generator
├── .env                           # Environment configuration
├── index.js                       # Express application entry point
├── package.json                   # Dependencies and scripts
└── GoldenCrust_API_Collection.json# Postman API test collection
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Seed sample data (Fresh bakes, Chef, Customer, Orders)
npm run seed

# Run automated tests
npm test

# Start backend server (Port 5001)
npm run dev
```
