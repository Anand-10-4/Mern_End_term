# GoldenCrust Bakery
### Artisan Fresh Bakes & Custom Cake Studio Platform

> **End-Term Software Engineering Project Submission**  
> **Student Name**: Anand Mohan  
> **Platform**: Full-Stack MERN (MongoDB, Express, React, Node.js) with TailwindCSS  

---

## 🥐 1. Problem Statement

Local bakeries and specialty cake studios face clear daily operational challenges:
1. **Fresh Batch Spoilage & Uncertainty**: Daily bakes (croissants, sourdoughs, pastries) have short shelf-lives. Without real-time stock counters, customers face stock-outs while bakeries suffer food waste.
2. **Complex Custom Cake Ordering**: Customers ordering custom cakes struggle with manual calls/forms to calculate pricing based on sizes, sponges, fillings, dietary restrictions, and custom messages.
3. **Kitchen Bottlenecks & Order Tracking**: Customers have no visibility into whether their baked goods are in the oven, being decorated, or boxed and ready for counter pickup.

GoldenCrust Bakery solves this with a **simple, intuitive, and complete software platform** providing daily batch tracking, an interactive custom cake builder with dynamic pricing, and a live 5-stage kitchen preparation pipeline.

---

## 👥 2. Target Users

- **Bakery Customers**: Browse warm fresh daily bakes, design personalized celebration cakes, use promo coupons, redeem loyalty points, and track live order readiness.
- **Head Bakers & Kitchen Staff**: Monitor incoming orders, move orders through the deck oven and decorating stages with one click, and catalog new recipes.
- **Store Managers & Admins**: Monitor daily revenue, track sell-through percentage, and trigger morning restock routines.

---

## 🎨 3. Design & Color Palette

Crafted with an artisan bakery warmth following the specified color scheme:
- **Soft Cream / Vanilla**: `#F9E6A8` (rgb 249, 230, 168)
- **Vibrant Honey Glaze / Gold**: `#F2A900` (rgb 242, 169, 0)
- **Baked Warm Caramel**: `#CC6F00` (rgb 204, 111, 0)
- **Dark Chocolate / Espresso**: `#4D2A00` (rgb 77, 42, 0)
- **Surfaces**: Warm charcoal-oven black `#160B05`, `#1F1007`, elevated card panels, and glowing honey borders.

---

## ⚡ 4. Core Engineering Workflows

### Workflow 1: Multi-Role Authentication & Customer Loyalty Rewards
- Secure JWT-based authentication with bcrypt password hashing.
- Three user roles: `customer`, `baker`, and `admin`.
- Loyalty points rewards program: 50 points welcome credit, 1 point earned per $1 spent, 10 points = $1 checkout discount.
- 1-click persona switcher in the header for instant demo evaluation.

### Workflow 2: Daily Fresh Bakes & Inventory Management
- Real-time catalog of artisan sourdoughs, croissants, tarts, and savory bakes.
- Category filtering (`Breads`, `Croissants & Pastries`, `Tarts & Gateaux`, `Savory Bakes`).
- Dietary tagging (`Vegetarian`, `Vegan`, `Eggless`, `Gluten-Free`, `Nut-Free`).
- Automatic live stock decrement upon checkout and sold-out badges.

### Workflow 3: Interactive Custom Cake Studio & Dynamic Pricing
- Real-time cake customization engine:
  - Cake Size selection: Mini 4" ($18), Standard 6" ($34), Grand 8" ($48), Two-Tier ($85).
  - Sponge Flavors: Madagascar Vanilla, Belgian Chocolate, Red Velvet, Spiced Carrot.
  - Frosting Flavors: Honey Buttercream, Salted Caramel Ganache, Dark Fudge, Chantilly.
  - Dietary Surcharges: Eggless (+$3), Gluten-Free (+$5), Vegan (+$5).
  - Piped Custom Message with visual canvas preview.
- Dynamic price recalculation performed on every configuration change.

### Workflow 4: Cart, Checkout & Promotion Engine
- Integrated shopping bag supporting mixed daily bakes and custom cakes.
- Coupon discount engine (Code: `GOLDEN10` for 10% discount).
- Loyalty points redemption option.
- In-store counter pickup vs artisan courier delivery scheduling.

### Workflow 5: Live Kitchen Preparation Pipeline (State Machine)
- 5-stage order progression:
  $$\text{Order Received} \rightarrow \text{In Deck Oven} \rightarrow \text{Glazing \& Decor} \rightarrow \text{Ready for Pickup} \rightarrow \text{Completed}$$
- Bakers advance orders along the pipeline with 1 click.
- Customers and staff view milestone timestamps and real-time status bars.

### Workflow 6: Bakery Operations Telemetry & Morning Restock
- Daily revenue total, average order value, kitchen queue load, and batch sell-through percentage.
- One-click morning batch restock action for bakery staff.
- Operational audit log feed.

---

## 🛠 5. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, TailwindCSS 3, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js, Express.js 4, Express-Validator, Morgan |
| **Database** | MongoDB with Mongoose ODM |
| **Security** | JSON Web Tokens (JWT), Bcrypt.js, CORS |
| **Testing** | Automated unit & integration test runner (`npm test`) |

---

## 📁 6. Project Structure

```text
Mern EndTerm/
├── backend/
│   ├── config/
│   │   └── db.js                        # Database connection setup
│   ├── controllers/
│   │   ├── authController.js            # Authentication & user profile
│   │   ├── productController.js         # Daily bakes catalog & stock
│   │   ├── customCakeController.js      # Cake pricing formula & builder
│   │   ├── orderController.js           # Order placement & kitchen pipeline
│   │   └── analyticsController.js       # Bakery sales & kitchen telemetry
│   ├── middlewares/
│   │   ├── authMiddleware.js            # JWT & role authorization
│   │   ├── errorMiddleware.js           # Error handling middleware
│   │   └── validateMiddleware.js        # Request validator
│   ├── models/
│   │   ├── User.js                      # User schema with roles & loyalty points
│   │   ├── Product.js                   # Daily fresh bake schema
│   │   ├── CustomCake.js                # Custom cake configuration schema
│   │   ├── Order.js                     # Kitchen order schema with milestones
│   │   └── AuditLog.js                  # Operational audit log
│   ├── routes/
│   │   ├── authRoutes.js                # /api/auth/*
│   │   ├── productRoutes.js             # /api/products/*
│   │   ├── customCakeRoutes.js          # /api/custom-cakes/*
│   │   ├── orderRoutes.js               # /api/orders/*
│   │   └── analyticsRoutes.js           # /api/analytics/*
│   ├── scripts/
│   │   └── seed.js                      # Database seeder
│   ├── test/
│   │   └── api.test.js                  # Unit & integration test suite
│   ├── utils/
│   │   ├── cakePricing.js               # Cake pricing calculation formula
│   │   └── tokenHelper.js               # JWT tokens & order numbers
│   ├── .env                             # Backend environment variables
│   ├── index.js                         # Express server entry point
│   ├── package.json                     # Backend dependencies
│   ├── README.md                        # Backend documentation
│   └── GoldenCrust_API_Collection.json  # Postman test collection
│
├── frontend/
│   ├── dist/                            # Production build
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Navigation & 1-click persona switch
│   │   │   ├── ProductCard.jsx          # Bake item card with stock badge
│   │   │   └── CartModal.jsx            # Bag modal with checkout & coupons
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          # Auth state & session switcher
│   │   │   └── ToastContext.jsx         # Animated toast notifications
│   │   ├── pages/
│   │   │   ├── BakeryMenu.jsx           # Fresh bakes with category filters
│   │   │   ├── CustomCakeStudio.jsx     # Interactive custom cake studio
│   │   │   ├── KitchenTracker.jsx       # 5-stage kitchen preparation tracker
│   │   │   ├── AddBakeItem.jsx          # Form for baker to add bakes
│   │   │   ├── BakeryAnalytics.jsx      # Telemetry, revenue & queue stats
│   │   │   └── LoginRegister.jsx        # Login & registration view
│   │   ├── services/
│   │   │   └── api.js                   # REST API client
│   │   ├── App.jsx                      # Main app shell & router
│   │   ├── index.css                    # Tailwind theme
│   │   └── main.jsx                     # React root mount
│   ├── .env                             # Frontend environment variables
│   ├── index.html                       # HTML5 entry
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

## 🚀 7. Local Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed       # Seeds bakery catalog, users, and orders
npm test           # Runs test suite
npm run dev        # Starts backend API on http://localhost:5001
```

### 2. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev        # Starts Vite dev server on http://localhost:5173
```
Open **`http://localhost:5173`** in your browser.

---

## 🔑 8. Demo Credentials & Quick Personas

The top banner of the application includes a **1-click Persona Switcher**, or you can log in manually:

| Persona | Email | Password | Role | Features |
|---|---|---|---|---|
| **Customer** | `customer@goldencrust.com` | `password123` | `customer` | Order bakes, design custom cakes, loyalty points |
| **Chef Baker** | `baker@goldencrust.com` | `password123` | `baker` | Manage deck ovens, advance kitchen orders, add bakes |
| **Manager Admin** | `admin@goldencrust.com` | `password123` | `admin` | View revenue telemetry, morning restock, full access |

---

## 📋 9. Submission Summary Form Fields

```text
Project Name: GoldenCrust Bakery - Artisan Fresh Bakes & Custom Cake Studio Platform
Student Name: Anand Mohan
Problem Statement: Daily bakery inventory spoilage, opaque custom cake pricing, and lack of customer visibility into kitchen preparation stages
GitHub Repository: [Your GitHub Repo Link]
Deployed Application / Build: http://localhost:5173
Demo Video: [Link to 3-5 Minute Demo Video]
Tech Stack: MongoDB, Express.js, React 18, Node.js, TailwindCSS, Vite
Major Features:
1. Daily fresh bake catalog with live stock tracking and dietary filters
2. Interactive Custom Cake Studio with real-time dynamic pricing calculation
3. Live 5-stage Kitchen Preparation Pipeline with milestone state transitions
4. Cart with promotional coupon (GOLDEN10) and loyalty points redemption
5. Bakery Operations Telemetry with daily sell-through and one-click morning restock
```
