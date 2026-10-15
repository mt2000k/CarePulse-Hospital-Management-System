# CarePulse Hospital Management System (HMS) 🏥

A complete, production-grade **Hospital Management System** built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). 

This application offers role-based portals for **Patients**, **Doctors**, and **Administrators**, featuring strict backend double-booking prevention, real-time schedule management, electronic medical records, digital prescriptions, and live MongoDB analytics.

---

## 🌟 Key Features

### 👨‍💼 Admin Portal
* **Dashboard Analytics:** Live visual metrics powered by Recharts (Appointments by Status, Department Distribution, Total Patients & Doctors).
* **Doctor Roster Management:** Create new doctor accounts, view qualifications, search by specialization, and activate/deactivate doctor status.
* **Patient Directory:** View registered patient details, medical history, blood group, and contact information.
* **Department CRUD:** Create, update, or deactivate clinical departments (Cardiology, Neurology, Orthopedics, Pediatrics, Dermatology, General Medicine).
* **Master Appointment Control:** View all hospital bookings with status filters and administrative status overrides.

### 👨‍⚕️ Doctor Portal
* **Doctor Dashboard:** View today's schedule, pending reviews, completed consultations, and patient treatment counts.
* **Weekly Schedule Management:** Set working hours per day of week, define lunch break intervals, maximum appointments, and slot durations.
* **Appointment Handling:** Accept/confirm pending requests or reject conflicting bookings.
* **Electronic Medical Records & Prescriptions:** Add clinical symptoms, diagnoses, consultation notes, follow-up advice, and itemized digital prescriptions (dosage, frequency, duration, instructions). Automatically completes appointments upon record release.

### 👨‍👩‍👧 Patient Portal
* **Patient Dashboard:** Welcome banner, quick metric cards, next upcoming appointment spotlight, and portal shortcuts.
* **Doctor Directory & Filtering:** Search doctors by name, department, or specialization with consultation fees and experience details.
* **Appointment Booking Engine:** Select department $\rightarrow$ doctor $\rightarrow$ preferred date $\rightarrow$ dynamically computed available time slot $\rightarrow$ reason for visit $\rightarrow$ instant booking confirmation reference.
* **Double-Booking Prevention:** Backend checks doctor active status, day schedules, working hours, break times, and existing non-cancelled bookings.
* **Medical Records & Prescriptions:** View released diagnostic notes, symptoms, treatment plans, and digital medicine prescriptions.
* **Personal Profile Management:** Update contact info, emergency contacts, and pre-existing medical history.

### 🌐 Public Hospital Website
* **Home Page:** Hero section, clinical excellence showcase, featured doctors, why choose us highlights, and emergency hotline info.
* **Doctor Directory:** Publicly accessible doctor directory with filters.
* **Departments Page:** Detailed overview of clinical facilities and active doctor counts.

---

## 🛠️ Tech Stack

* **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Axios, React Router v6.
* **Backend:** Node.js, Express.js, Mongoose.
* **Database:** MongoDB (MongoDB Atlas / local MongoDB / automated in-memory fallback).
* **Authentication:** JWT (JSON Web Tokens), `bcryptjs` password hashing.
* **Architecture:** RESTful API with centralized error handling & role-based middleware.

---

## 📁 Repository Structure

```text
Project/
├── backend/
│   ├── config/          # Database connection (with MongoDB Memory Server fallback)
│   ├── controllers/     # Express controllers (auth, doctor, patient, schedule, appointment, medicalRecord, stats, dept)
│   ├── middleware/      # JWT auth, role authorization & error handling middleware
│   ├── models/          # Mongoose Schemas (User, Patient, Doctor, Department, DoctorSchedule, Appointment, MedicalRecord, Prescription)
│   ├── routes/          # Express REST API endpoint definitions
│   ├── seed/            # Comprehensive database seeding script
│   ├── utils/           # JWT token sign/verify utilities
│   ├── app.js           # Express app setup & CORS configuration
│   ├── server.js        # Server listener entry point
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── assets/      # Static icons & brand graphics
    │   ├── components/  # Reusable UI components (Navbar, Footer, Sidebar, Modal, Button, Badge, LoadingSpinner, EmptyState, StatCard)
    │   ├── context/     # React Context (AuthContext & ToastContext)
    │   ├── layouts/     # PublicLayout & DashboardLayout
    │   ├── pages/       # Public, Patient, Doctor, and Admin pages
    │   ├── services/    # Axios API client with token interceptors
    │   ├── App.jsx      # Main Application Router
    │   ├── index.css    # Tailwind CSS imports
    │   └── main.jsx     # React DOM root entry point
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🔑 Demo Accounts

Run `npm run seed` in `backend` to populate demo data.

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@hms.com` | `adminpassword123` | System Administrator |
| **Doctor** | `sarah.jenkins@hms.com` | `doctorpassword123` | Dr. Sarah Jenkins (Cardiology) |
| **Doctor** | `marcus.vance@hms.com` | `doctorpassword123` | Dr. Marcus Vance (Neurology) |
| **Patient** | `john.doe@gmail.com` | `patientpassword123` | John Doe (Patient) |
| **Patient** | `emily.davis@gmail.com` | `patientpassword123` | Emily Davis (Patient) |

> 💡 *The Login page also includes 1-Click Demo Credentials buttons for instant testing!*

---

## 🚀 Quick Start Guide (Running Locally)

### Prerequisites
* Node.js v18+ and npm installed.

### 1. Setup & Run Backend

```bash
cd backend
npm install
npm run seed     # Populate database with demo accounts, departments, & schedules
npm run dev      # Start Express backend on http://localhost:5000
```

### 2. Setup & Run Frontend

```bash
cd frontend
npm install
npm run dev      # Start Vite dev server on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hms
JWT_SECRET=super_secret_hms_jwt_key_2026_production_ready
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🌐 Production Deployment Guide

1. **Database:** Create a MongoDB Atlas cluster and set `MONGODB_URI=mongodb+srv://...` in production environment variables.
2. **Backend (Render / Railway / Fly.io):** Deploy the `backend/` directory as a Node service. Set `NODE_ENV=production`, `PORT=5000`, `CLIENT_URL=https://your-frontend-domain.vercel.app`.
3. **Frontend (Vercel / Netlify):** Deploy `frontend/` directory with build command `npm run build` and publish directory `dist`. Set `VITE_API_URL=https://your-backend.onrender.com/api`.
