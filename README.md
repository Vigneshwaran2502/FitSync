# FitSync 🏋️‍♂️

FitSync is a premium, state-of-the-art gym management and membership platform. It provides a beautiful, modern interface for gym members to manage their subscriptions, track fitness progress, and request services like membership freezing.

## 🌟 Features
* **Modern Aesthetic UI:** Built with React, TailwindCSS, and sleek micro-animations for a highly engaging user experience.
* **Authentication & Authorization:** Secure JWT-based login with role-based access control (Members vs. Admin/Trainer).
* **Membership Management:** Users can subscribe to tiers (Basic, Standard, Premium), renew plans, and request to freeze their accounts.
* **Simulated Checkout:** A beautiful, fully custom "Simulated Razorpay" payment popup for easy testing and demonstrations without real payment credentials.
* **REST API Backend:** A scalable Node.js/Express backend connected to MongoDB.

## 🏗️ Project Structure
The project is cleanly divided into two independent directories:
* `/frontend` - React + Vite + TailwindCSS application.
* `/backend` - Node.js + Express + MongoDB server.

## 🚀 Getting Started

### 1. Run the Backend
Open a terminal and navigate to the backend folder:
```bash
cd backend
npm install
npm run dev
```

### 2. Run the Frontend
Open a second terminal and navigate to the frontend folder:
```bash
cd frontend
npm install
npm run dev
```

## 🛠️ Environment Variables
Ensure you have a `.env` file in **both** the `/frontend` and `/backend` directories containing the necessary secrets (like MongoDB URI, JWT Secret, and Google Client IDs).
