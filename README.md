# 🍰 HoneyMilk Cakes and Steeze

> Boutique bakery web application offering honey-gold artisan cakes, bespoke custom pastry requests, interactive cart & checkout, and an administrative order management dashboard.

---

## 🍯 Tech Stack

- **Frontend**: React 19, TypeScript, React Router 7, Tailwind CSS, Lucide Icons, Motion
- **Backend**: PHP 8+ REST API with PDO prepared statements, CORS headers, JSON responses
- **Database**: MySQL / MariaDB (Schema in `database/schema.sql`)
- **Hosting / Dev Environment**: Google AI Studio Container (Vite + Node/Express live proxy) + standalone PHP REST API in `/backend`

---

## 📁 Project Structure

```
├── backend/
│   ├── api/
│   │   ├── auth.php            # POST /api/auth/login, GET /api/auth/verify
│   │   ├── custom_orders.php   # POST /api/custom-orders, GET /api/custom-orders, PATCH
│   │   ├── orders.php          # POST /api/orders, GET /api/orders, PATCH
│   │   └── products.php        # GET, POST, PUT, DELETE /api/products
│   ├── config/
│   │   ├── auth_helper.php     # Admin bearer token verification & generation
│   │   ├── cors.php            # CORS headers & JSON helper functions
│   │   └── db.php              # PDO database connection using prepared statements
│   ├── .env.example            # Environment variables for MySQL & JWT
│   └── index.php               # Unified router for PHP built-in server or Apache
├── database/
│   └── schema.sql              # MySQL schema & initial seed data (products, orders, custom orders, admin)
├── src/
│   ├── components/             # Reusable UI components (Navbar, Footer, CartDrawer, etc.)
│   ├── context/                # CartContext (persisted cart state with size/flavor options)
│   ├── data/                   # Initial cake products and fallback mock database
│   ├── pages/                  # Home, Menu, ProductDetail, CustomOrder, Checkout, About, Contact, Admin
│   ├── services/               # API service connecting to /api endpoints with fallback sync
│   ├── types.ts                # TypeScript types and interfaces
│   ├── App.tsx                 # React Router and main routes
│   └── index.css               # Warm boutique honey-gold & cream theme with Tailwind
├── server.ts                   # Integrated Node/Express API for the live AI Studio preview
└── README.md
```

---

## 🚀 Running Locally

### 1. Database Setup (MySQL)

1. Start your local MySQL server (via XAMPP, MAMP, Docker, or native service).
2. Import the schema and seed data:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   *This creates `honeymilk_db` with all tables, default admin account, and 8 curated boutique cakes.*

### 2. PHP Backend Setup

1. Copy the environment config:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Update database credentials in `backend/.env` if your MySQL username/password differs.
3. Start the PHP built-in development server on port 8000:
   ```bash
   php -S localhost:8000 backend/index.php
   ```

### 3. Frontend Setup (React + Vite)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.

---



## 📡 REST API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/products` | Retrieve all cakes (supports `?category=...&search=...`) | No |
| `GET` | `/api/products?id={id}` | Retrieve single cake detail | No |
| `POST` | `/api/products` | Create new cake product | **Yes (Admin)** |
| `PUT` | `/api/products?id={id}` | Update existing cake product | **Yes (Admin)** |
| `DELETE` | `/api/products?id={id}` | Delete cake product | **Yes (Admin)** |
| `POST` | `/api/orders` | Place new customer order (cart checkout) | No |
| `GET` | `/api/orders` | Retrieve list of all orders | **Yes (Admin)** |
| `PATCH` | `/api/orders?id={id}` | Update order status (`pending`, `baking`, `ready`, etc.) | **Yes (Admin)** |
| `POST` | `/api/custom-orders` | Submit bespoke custom cake design request | No |
| `GET` | `/api/custom-orders` | Retrieve list of custom inquiries | **Yes (Admin)** |
| `PATCH` | `/api/custom-orders?id={id}` | Update custom inquiry status | **Yes (Admin)** |
| `POST` | `/api/auth/login` | Authenticate admin, returns bearer token | No |
| `GET` | `/api/auth/verify` | Verify current admin session | **Yes (Admin)** |
