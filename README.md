# PackersMart Platform - 1-Day Full-Stack Developer Assessment

An industry-level, production-ready Full-Stack MVP for the **PackersMart Lead-to-Booking Workflow**. Built with **Node.js (Express)**, **MySQL Database**, **MVC Architecture**, and **React (Vite + Tailwind CSS)**.

---

## 📐 Architecture & Folder Structure

The backend follows an **Industry-Level MVC + Service Layer Architecture** (Separation of Concerns between Routes, Controllers, Services, Models, and Middlewares):

```
PackersMart Platform/
├── backend/
│   ├── config/
│   │   └── db.js                 # MySQL Pool & automatic table/seed initializer
│   ├── controllers/
│   │   ├── leadController.js     # HTTP request handlers for Leads & OTP
│   │   ├── companyController.js  # HTTP handlers for Matching Companies
│   │   └── dashboardController.js# HTTP handlers for Admin Dashboard Stats
│   ├── services/
│   │   ├── leadService.js        # Lead DB transaction management & aggregations
│   │   ├── otpService.js         # OTP generation & expiration verification
│   │   ├── leadScoringService.js # Lead Quality Scoring Engine (Hot/Warm/Cold)
│   │   └── matchingService.js    # Rule-based Logistics Company Matching Algorithm
│   ├── routes/
│   │   ├── leadRoutes.js         # REST endpoints for /api/leads
│   │   └── dashboardRoutes.js    # REST endpoint for /api/dashboard
│   ├── middlewares/
│   │   ├── validateLead.js       # Input field validation middleware
│   │   └── errorHandler.js       # Global error handler middleware
│   ├── seeders/
│   │   └── seedCompanies.js      # Seed script for 8 sample logistics companies
│   ├── sql/
│   │   └── schema.sql            # MySQL Database DDL script
│   ├── .env                      # Environment config file
│   └── server.js                 # Express application server entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx            # Top navigation & system status
    │   │   ├── LeadForm.jsx          # Customer registration form with validation
    │   │   ├── OtpModal.jsx          # Interactive OTP verification popup with test hint
    │   │   ├── AdminDashboard.jsx    # Admin lead queue & analytics overview
    │   │   ├── LeadDetailsModal.jsx  # Single lead inspector with matched companies
    │   │   └── StatCard.jsx          # Metric cards component
    │   ├── services/
    │   │   └── api.js                # Axios API client wrapper
    │   ├── App.jsx                   # Main application container
    │   └── main.jsx                  # React DOM entry point
    └── vite.config.js                # Vite configuration
```

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18 (Vite), Tailwind CSS, Lucide Icons, Axios |
| **Backend** | Node.js, Express.js (MVC Architecture) |
| **Database** | MySQL (Relational DB using `mysql2` Promise Pool) |
| **Business Logic** | Custom Lead Scoring Engine, Rule-based Company Matching Algorithm |

---

## 🗄️ Database Design & Schema

The relational database (`packersmart_db`) comprises 4 normalized tables:

1. **`leads`**: `id`, `customer_name`, `mobile`, `email`, `pickup_city`, `destination_city`, `service_type`, `moving_date`, `additional_requirements`, `status` (`Pending`, `Verified`, `Fake`, `Duplicate`, `Re-attempt`), `lead_score`, `lead_quality` (`Hot`, `Warm`, `Cold`, `Unverified`), `created_at`, `updated_at`.
2. **`otp_verifications`**: `id`, `lead_id` (FK), `otp` (6-digit), `expires_at`, `verified_at`, `is_used`, `created_at`.
3. **`companies`**: `id`, `company_name`, `coverage_cities` (JSON Array), `service_types` (JSON Array), `rating` (0.0 to 5.0), `status` (`Active`/`Inactive`), `contact_phone`, `email`.
4. **`lead_company_matches`**: `id`, `lead_id` (FK), `company_id` (FK), `match_score` (0 to 100%), `notification_status`, `created_at`.

*The SQL schema dump file is available at `backend/sql/schema.sql`.*

---

## 🧠 Business Logic & Algorithms

### 1. OTP Verification Logic (`otpService.js`)
- Generates a random 6-digit numeric OTP upon lead form submission.
- Stores OTP in `otp_verifications` with a **5-minute expiration time** (`expires_at`).
- For testing purposes (per prompt requirement #2), the generated OTP is logged and displayed in the frontend testing banner.
- On valid verification: OTP is marked `is_used = 1`, lead status changes to **`Verified`**, lead quality score is automatically calculated, and company matching is triggered.

### 2. Lead Quality Scoring Engine (`leadScoringService.js`)
Scores verified leads on a scale of **0 to 100 points**:
- **Base Verification Score**: +30 points
- **Moving Date Urgency**:
  - Move within 7 days: **+35 points** (High urgency / immediate demand)
  - Move within 8–15 days: **+20 points**
  - Move within 16–30 days: **+10 points**
- **Detail Completeness**: Additional requirements specified: **+15 points**
- **Inter-City Moving**: Pickup city $\neq$ Destination city: **+10 points**
- **Email Quality**: Valid corporate/personal email format: **+10 points**

**Classification**:
- 🔥 **Hot Lead**: Score $\ge 80$
- ⚡ **Warm Lead**: Score $50 - 79$
- ❄️ **Cold Lead**: Score $< 50$

### 3. Logistics Company Matching Algorithm (`matchingService.js`)
Rule-based matching algorithm evaluates active logistics companies against a verified lead:
- **Pickup City Match**: +40 points (if lead pickup city is in company coverage cities)
- **Destination City Match**: +40 points (if lead destination city is in company coverage cities)
- **Service Type Match**: +20 points (if company supports requested service type, e.g., Home Relocation)

Matches with score $\ge 40\%$ are ranked by **Match Score DESC**, followed by **Company Rating DESC**, and saved to `lead_company_matches`.

---

## 🌐 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/leads` | Submit customer lead & generate 6-digit OTP |
| `POST` | `/api/leads/:id/verify-otp` | Verify OTP code & mark lead as `Verified` |
| `GET` | `/api/leads` | Retrieve leads (supports `?status=Verified` filter) |
| `GET` | `/api/leads/:id` | Get detailed lead record with matched companies |
| `PATCH` | `/api/leads/:id/status` | Update lead status (`Pending`, `Verified`, `Fake`, `Duplicate`, `Re-attempt`) |
| `GET` | `/api/leads/:id/matching-companies` | Get matching logistics companies for a lead |
| `GET` | `/api/dashboard` | Get real-time aggregated dashboard metrics |

---

## 🚀 Setup & Installation Instructions

### Prerequisites
- Node.js (v18+)
- MySQL Server (Installed locally or via XAMPP / cloud DB)

### 1. Database Setup
Make sure MySQL server is running. Create database or configure credentials in `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=packersmart_db
DB_PORT=3306
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
*(The backend automatically creates the `packersmart_db` database, table structures, and seeds 8 sample logistics companies on first launch).*

### 3. Frontend Setup
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser.
