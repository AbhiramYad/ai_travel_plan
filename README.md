# Trao AI Travel Planner

A secure, multi-user, responsive web application where users can create, customize, and save interactive travel itineraries using Google Gemini AI models. The app automatically computes budget categories, recommends hotels, and generates a personalized weather-aware packing assistant checklist.

---

## 🛠️ Tech Stack

- **Frontend**: React.js + Vite, Tailwind CSS v3, Axios, React Router DOM
- **Backend**: Node.js, Express.js (ES Modules, built-in `--watch` and `--env-file` loaders)
- **Database**: MongoDB Atlas with Mongoose ODM
- **AI Integration**: Google Gemini 2.5 Flash API (`gemini-2.5-flash` model)
- **Authentication**: JSON Web Tokens (JWT) + password hashing via `bcryptjs`

---

## 📂 Directory Structure

```
traoproject/
├── backend/            # Express.js backend API
│   ├── config/         # Database connection configuration
│   ├── controllers/    # Business logics (Auth & Trips)
│   ├── middleware/     # Auth protection security middleware
│   ├── models/         # User & Trip Mongoose schemas
│   ├── routes/         # API path routers mappings
│   └── server.js       # App entry point
├── frontend/           # React + Vite application
│   └── src/
│       ├── components/ # CreateTripForm, ItineraryCard, PackingList
│       ├── pages/      # Login, Register, Dashboard
│       └── utils/      # API axios interceptor client
├── docs/               # Technical PDF/HTML documentation files (Git ignored)
├── .env                # Root environment variables configuration file (Git ignored)
└── .gitignore          # Git tracking filter
```

---

## ⚙️ Installation & Setup

### 1. Prerequisite
Ensure you have **Node.js v20.6.0** (or higher) installed on your system to support built-in `--env-file` and `--watch-path` features.

### 2. Environment Variables Configuration
Create a `.env` file in the **root directory** of the project and populate it with your credentials:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/travel_planner
JWT_SECRET=your_jwt_secret_minimum_32_characters
GEMINI_API_KEY=your_gemini_api_key_from_google_ai_studio
```

---

## 🚀 Running the Project

### Start the Backend Server (Express)
The server runs on `http://localhost:5000` and automatically monitors changes without nodemon.
```bash
cd backend
npm run dev
```

### Start the Frontend Client (React)
The Vite development server runs on `http://localhost:5173`.
```bash
cd frontend
npm run dev
```

---

## ☁️ Deployment Notes

- **Backend API**: Can be hosted on platforms like Render, Railway, or Heroku.
- **Frontend App**: Can be deployed to hosting providers like Vercel, Netlify, or AWS Amplify.
- **Database**: Use MongoDB Atlas free tier for cloud database storage.
