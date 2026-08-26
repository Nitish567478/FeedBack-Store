# 🌟 FeedBack Store — Store Directory & Rating Platform

A full-stack web application that enables registered users to browse stores, search by name and address, and submit/modify 1-to-5 star ratings. The application implements a **Single Authentication & Role-Based Access Control (RBAC)** system with 3 distinct user roles: **System Administrator**, **Normal User**, and **Store Owner**.

---

## 🗄️ Database (`database.sqlite`)

The application is powered by the SQLite database located at [`backend/data/database.sqlite`](file:///c:/Users/HP/OneDrive/Desktop/FeedBack%20Store/backend/data/database.sqlite) with:
- **12 Users** (System Admins, Store Owners, Normal Users)
- **4 Stores** (*Grand Valley Gourmet Grocers*, *Cybernetics Electronics Hub*, *The Vintage Bookstore & Cafe*, *kumar store*)
- **10 Ratings** (Full review history & live 1–5 star scores)

---

## 🔑 Database Accounts (Pre-configured)

Use these accounts to instantly test all three user roles on the local database:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@feedbackstore.com` | `Admin@12345` | Full administrative control & analytics (12 users, 4 stores, 10 ratings) |
| **Store Owner** | `arthur.owner@gourmetgrocer.com` | `Owner@12345` | Owns "Grand Valley Gourmet Grocers" (4.5 ★, 4 reviews) |
| **Store Owner 2** | `beatrix.owner@cyberhub.com` | `Owner@12345` | Owns "Cybernetics Electronics Hub" (3.0 ★, 3 reviews) |
| **Store Owner 3** | `charles.owner@bookvault.com` | `Owner@12345` | Owns "The Vintage Bookstore & Cafe" (5.0 ★, 2 reviews) |
| **Normal User** | `alexander.smith@example.com` | `User@12345` | Regular reviewer with 3 submitted ratings |
| **Normal User 2** | `benjamin.rodriguez@example.com` | `User@12345` | Regular reviewer with 2 submitted ratings |

> 💡 **Quick Login:** The Login page includes **1-click quick fill buttons** for Admin, Store Owner, and Normal User!

---

## ⚙️ Prerequisites

Before running the project locally, ensure you have:
- **Node.js**: `v18.0.0` or higher (tested on Node v22)
- **npm**: `v9.0.0` or higher
- **PostgreSQL Database Server**: Running locally on port `5432` (or remote PostgreSQL connection string)

---

## 💻 Step-by-Step Local Setup Guide

### 1. Clone or Open the Workspace

```bash
cd "FeedBack Store"
```

---

### 2. Backend Setup

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the `backend/` directory (or copy from `.env.example`):
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/feedback_store?schema=public"
   JWT_SECRET="feedback_store_jwt_secret_key_secure_2026"
   JWT_EXPIRES_IN="7d"
   ```
   *(Update `DATABASE_URL` with your PostgreSQL username, password, host, port, and database name if different).*

4. Run Database Schema Sync:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Seed the Database with Sample Data:
   ```bash
   npm run prisma:seed
   ```
   *(Or simply run `npm run setup` which automatically generates, pushes schema, and seeds).*

6. Start the Backend Server:
   ```bash
   npm run dev
   ```
   The backend API will start on **`http://localhost:5000`**.

---

### 3. Frontend Setup

1. In a new terminal tab, navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Frontend Development Server:
   ```bash
   npm run dev
   ```
   The frontend React app will be running at **`http://localhost:5173`**.

---

## 📡 REST API Reference

### 🔐 Authentication Endpoints (`/api/auth`)
- `POST /api/auth/signup` — Public registration for normal users.
- `POST /api/auth/login` — Single login endpoint for all roles (`ADMIN`, `NORMAL_USER`, `STORE_OWNER`).
- `PATCH /api/auth/update-password` — Update password for authenticated user (Bearer token required).
- `GET /api/auth/me` — Retrieve current authenticated user profile & associated store info.

### 🛡️ Admin Endpoints (`/api/admin`) *(Admin Token Required)*
- `GET /api/admin/dashboard-stats` — Fetch total counts of users, stores, and ratings + role breakdown.
- `POST /api/admin/users` — Create new user (`ADMIN`, `NORMAL_USER`, `STORE_OWNER`).
- `POST /api/admin/stores` — Create a new store and assign a Store Owner.
- `GET /api/admin/users` — Fetch all users with search, role filter, and sorting (`name`, `email`, `address`, `role`, `createdAt`).
- `GET /api/admin/stores` — Fetch all stores with overall average ratings, total reviews, and sorting.

### 🏬 Store & Rating Endpoints (`/api/stores`)
- `GET /api/stores` — List stores with search by name/address and sorting (includes overall rating and authenticated user's submitted rating).
- `POST /api/stores/:storeId/rate` — Submit or update a 1-to-5 star rating for a store (Authenticated user).

### 📊 Store Owner Endpoints (`/api/owner`) *(Store Owner Token Required)*
- `GET /api/owner/dashboard` — View assigned store overview, average rating, rating distribution, and customer rating breakdown with search and sorting.

---

## 🗂️ Project Directory Structure

```
FeedBack Store/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema (User, Store, Rating)
│   │   └── seed.js               # Database seeder with sample accounts & ratings
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.js         # Prisma client singleton
│   │   ├── controllers/
│   │   │   ├── authController.js # Signup, login, password update, profile
│   │   │   ├── adminController.js# Admin dashboard, user/store management
│   │   │   ├── storeController.js# User store browsing & rating submissions
│   │   │   └── ownerController.js# Store owner analytics & review history
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js # JWT verification & RBAC authorization
│   │   │   └── validateInput.js  # Express-validator input constraint schemas
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   ├── storeRoutes.js
│   │   │   └── ownerRoutes.js
│   │   └── server.js             # Express application entry point
│   ├── .env                      # Environment configurations
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosInstance.js  # Axios client with JWT auto-attachment
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation with role badges & profile menu
│   │   │   ├── StarRating.jsx    # Interactive 5-star rating widget
│   │   │   ├── ProtectedRoute.jsx# Role-based route protection
│   │   │   ├── UpdatePasswordModal.jsx # Password update dialog
│   │   │   ├── AddUserModal.jsx  # Admin user creation modal
│   │   │   └── AddStoreModal.jsx # Admin store creation modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state provider
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Interactive platform landing & overview page
│   │   │   ├── Login.jsx         # Single login with quick demo presets
│   │   │   ├── Register.jsx      # Normal user signup with live validation meter
│   │   │   ├── AdminDashboard.jsx# Admin metrics, directory & management
│   │   │   ├── UserStoreList.jsx # Normal user store search & rating page
│   │   │   └── OwnerDashboard.jsx# Store owner dashboard & customer reviews
│   │   ├── App.jsx               # Application routes
│   │   ├── index.css             # Tailwind v4 custom styling & glassmorphism
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── package.json                  # Root script shortcuts
├── spac.md                       # Original Project Specification Sheet
└── README.md                     # Documentation & Setup Guide
```

---

## 🧪 Testing the Application Flows

1. **Test Admin Role:**
   - Go to `http://localhost:5173/login`
   - Click the **Admin** quick-login button (`admin@feedbackstore.com` / `Admin@12345`) and click **Sign In**.
   - Review the metrics cards.
   - Switch between **Users Directory** and **Stores Directory** tabs, test search and sorting.
   - Click **Add User** or **Add Store** to create new records.
2. **Test Normal User Role:**
   - Sign in as Normal User (`alexander.smith@example.com` / `User@12345`) or create a new user on `/signup`.
   - Browse the store catalog on `/stores`.
   - Type in the search box to filter by store name or address.
   - Click any star (1–5) on a store card to submit or update your rating.
3. **Test Store Owner Role:**
   - Sign in as Store Owner (`arthur.owner@gourmetgrocer.com` / `Owner@12345`).
   - View your store average rating and total reviews.
   - Check the customer rating history table with reviewer details and timestamps.
4. **Test Password Modification:**
   - Click the user profile in the top-right navbar and select **Update Password**.
   - Enter your current password and a compliant new password (8-16 chars, 1 uppercase, 1 special char).
