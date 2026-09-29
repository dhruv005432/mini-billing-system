# 📊 Mini Billing System (Full-Stack GST Billing & Invoicing)

A modern, full-stack GST Billing and Inventory Management application built with **React 19**, **Vite**, **Node.js/Express**, **MongoDB**, **Socket.IO**, and **Nodemailer**.

---

## 🌟 Key Features

### 1. 🔐 Security & Two-Factor Authentication (2FA)
- **Dedicated Login & Registration Pages**:
  - Secure credential authentication with Email or 10-Digit Mobile Number.
  - Strong Password Policy enforcement (`8+ chars`, Uppercase, Lowercase, Number, and Special symbol, e.g. `Abc@#!20006`).
  - Interactive live password strength meter and checklist.
- **Compulsory 2FA (Phone SMS & Real-Time Mail OTP)**:
  - 6-digit OTP verification required for access.
  - Native Phone Messages app trigger (`sms:+91...?body=...`).
  - Real-time HTML email dispatch with live preview links (via Nodemailer & Ethereal/Gmail).
  - Web Audio chime sound and phone hardware vibration on alert.
- **Social OAuth Integration**: Quick sign-in with Google, Facebook, and GitHub with compulsory mobile verification.

### 2. 🧾 Invoices & GST Billing (Phase 6)
- Create itemized tax invoices with real-time stock deduction.
- Automatic tax breakdown (CGST + SGST or IGST slabs: 0%, 5%, 12%, 18%, 28%).
- Professional A4 print and "Save as PDF" browser support.
- Invoice deletion with automatic stock restoration.

### 3. 💳 Payments & Outstanding Balances (Phase 7)
- Support for Partial and Full payments.
- Automatic tracking of `amountPaid` and `amountDue`.
- Payment history ledger per invoice.
- Payment receipts delivered via email and SMS.

### 4. 📈 Business Reports & Analytics (Phase 8)
- Daily, monthly, and custom date range sales reports.
- Product-wise and customer-wise sales analysis.
- GST summary reports for tax filing.
- One-click CSV export and print-ready analytics sheets.

### 5. ⚡ Real-Time Socket.IO Live Updates
- Instant multi-tab and multi-device synchronizations:
  - `otp:sent`
  - `auth:login`
  - `invoice:created`
  - `payment:recorded`
  - `invoice:deleted`

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, React Router 7, Bootstrap 5, Bootstrap Icons, Socket.io Client
- **Backend**: Node.js, Express 5, Socket.IO, Nodemailer, Mongoose
- **Database**: MongoDB (Local or MongoDB Atlas)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) running locally on port 27017

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dhruv005432/mini-billing-system.git
   cd mini-billing-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `server/.env.example` to `server/.env`:
   ```bash
   cp server/.env.example server/.env
   ```

4. **Run Both Server and Client:**
   ```bash
   npm run dev:all
   ```
   Or separately:
   - Backend Server: `npm run server` (runs on http://localhost:5000)
   - React Frontend: `npm run dev` (runs on http://localhost:5173)

---

## 📝 Default Admin Credentials

- **Email / ID**: `admin@abctraders.com` (or mobile `9876543210`)
- **Password**: `Abc@#!20006`

---

## 📜 License

MIT License. Built with ❤️ by Dhruv.
