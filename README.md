# 🚛 TruckLink Logistics

TruckLink Logistics is a full-stack truck booking and logistics marketplace built to help users compare trucks, explore trusted transport providers, and complete bookings through a modern web experience.

It includes:

- 👤 User and owner authentication
- 🔐 MFA / authenticator app support
- 🚚 Truck discovery and booking flow
- ⭐ Review and rating support
- 📊 Owner and customer dashboards
- 🌍 Deploy-ready setup for Netlify + Render + MongoDB Atlas

## ✨ Features

- 🔎 Search trucks by route, service type, and availability
- 🛡️ Verified-provider focused booking flow
- 🔐 Login, signup, JWT auth, refresh token flow, and MFA
- 📱 QR code generation for MFA setup
- 👥 Separate customer and owner dashboard experiences
- 🧾 Booking confirmation flow with saved draft state
- 🌐 Hindi / English toggle
- 🎨 Interactive React frontend with Vite

## 🧱 Tech Stack

### Frontend

- React
- Vite
- Axios
- Leaflet
- QRCode

### Backend

- Node.js
- Express
- MongoDB + Mongoose
- JWT
- bcryptjs
- Speakeasy

## 📁 Project Structure

```bash
project-logistics--main/
├── backend/        # Express API, auth, routes, MongoDB models
├── src/            # React frontend
├── public assets   # Video, audio, static files
├── netlify.toml    # Netlify frontend deployment config
├── render.yaml     # Render backend deployment config
└── README.md
```

## 🚀 Local Development

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 3. Create environment files

Copy:

- `.env.example` → `.env`
- `backend/.env.example` → `backend/.env`

### 4. Start the frontend

```bash
npm run dev
```

### 5. Start the backend

```bash
npm run api
```

### 6. Local URLs

- Frontend: `http://127.0.0.1:5173`
- Backend: `http://127.0.0.1:5000/api`

## 🔑 Environment Variables

### Frontend `.env`

```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=
```

### Backend `backend/.env`

```bash
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/trucklink
JWT_SECRET=replace_with_a_long_random_secret
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## 🌐 Deployment Target

This project is prepared for:

- ▲ Netlify for the frontend
- ⚙️ Render for the backend API
- 🍃 MongoDB Atlas for the database

## ▲ Netlify Deployment

The frontend uses `netlify.toml`.

### Build settings

```bash
Build command: npm run build
Publish directory: dist
```

### Netlify environment variables

```bash
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
VITE_GOOGLE_MAPS_API_KEY=your_key_if_needed
```

## ⚙️ Render Deployment

The backend uses `render.yaml`.

If you create the backend service manually on Render, use:

```bash
Root directory: backend
Build command: npm install
Start command: npm start
```

### Render environment variables

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=use_a_long_random_secret
ALLOWED_ORIGINS=https://your-netlify-site.netlify.app
```

## 🍃 MongoDB Atlas Setup

Create a MongoDB Atlas cluster and use its connection string for `MONGODB_URI`.

Example:

```bash
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/trucklink?retryWrites=true&w=majority
```

For initial deployment, Atlas Network Access can temporarily allow:

```bash
0.0.0.0/0
```

You can tighten it later if needed.

## ✅ Recommended Deployment Order

1. Create the MongoDB Atlas database.
2. Deploy the backend to Render.
3. Copy the Render backend URL.
4. Deploy the frontend to Netlify.
5. Set `VITE_API_BASE_URL` in Netlify.
6. Update `ALLOWED_ORIGINS` in Render with your final Netlify domain.
7. Test login, signup, MFA, truck search, and booking flow in production.

## 🛡️ Production Notes

- The frontend API URL is controlled by `VITE_API_BASE_URL`.
- The backend CORS allowlist is controlled by `ALLOWED_ORIGINS`.
- Refresh cookies use production-safe settings automatically.
- Render health checks can use `/health`.
- Do not use local MongoDB credentials in production.

## 📌 Current Status

- ✅ Frontend production build is working
- ✅ Backend startup is working
- ✅ Deploy config files are included
- ✅ MFA QR code flow is implemented
- ✅ Login-before-booking flow is implemented

## 🤝 Next Step

Push this repo to GitHub, then connect:

- Netlify → GitHub repo
- Render → GitHub repo
- MongoDB Atlas → Render backend

Then you’ll be ready to deploy step by step.
