# DisasterLink 🆘
### Disaster Relief Coordination Platform

A full-stack real-time web application that connects **victims**, **volunteers**, and **NGOs** during disaster scenarios — enabling faster response, smarter resource allocation, and live coordination.

🌐 **Live Demo:** [disaster-link-eta.vercel.app](https://disaster-link-eta.vercel.app)  
⚙️ **Backend API:** [disasterlink-backend.onrender.com](https://disasterlink-backend.onrender.com)

> ⚠️ **Note:** Backend is hosted on Render's free tier. First load may take 30–50 seconds to wake up. Please wait before logging in.

---


## Features

### 🔐 Authentication & Roles
- JWT-based authentication with bcrypt password hashing
- Three role-based dashboards: **Victim**, **Volunteer**, **NGO**
- Auto-redirect to role-specific dashboard after login

### 🆘 SOS Request System
- Submit SOS requests with type, urgency level, location, and photo evidence
- Urgency levels: Critical, High, Medium, Low
- Real-time SOS notifications via Socket.io
- Image upload support via Multer

### 🗺️ Live Map Dashboard
- Interactive Leaflet.js map with dark/light CartoDB tiles
- Colour-coded urgency markers with glowing effects
- Filter by urgency level
- SOS detail modal on pin click
- Auto-refresh every 30 seconds
- Dark/Light theme toggle

### 🤝 Volunteer Management
- Volunteer profile with skills tagging
- Auto-match volunteers to nearby SOS requests by urgency
- Task assignment and completion tracking
- Availability toggle (Available / Deployed / Offline)

### 🏥 NGO & Resource Management
- Full NGO dashboard with overview, SOS, volunteers, resources, broadcast tabs
- Resource inventory CRUD with low-stock alerts
- Mass broadcast system for zone-wide alerts
- Real-time low-stock and broadcast notifications

### 💬 Real-time Communication
- Socket.io powered live chat between users
- Room-based messaging
- Toast notifications for SOS alerts, low stock, and broadcasts
- Live activity feed

### 📊 Analytics & Reporting
- KPI cards: Total SOS, Resolution Rate, Volunteers, Resources
- Charts: SOS last 7 days, by status, urgency, type, zone
- Volunteer availability breakdown
- Resource inventory chart
- PDF export via jsPDF + html2canvas

### 📱 PWA Support
- Installable on mobile home screen
- Offline caching via Service Worker
- Works in low-connectivity environments

---

## Tech Stack

### Frontend
| Technology | Usage |
|---|---|
| React + Vite | Frontend framework |
| React Router DOM | Client-side routing |
| Leaflet.js + React-Leaflet | Interactive maps |
| Socket.io Client | Real-time communication |
| Recharts | Analytics charts |
| Axios | HTTP requests |
| React Hot Toast | Push notifications |
| jsPDF + html2canvas | PDF export |

### Backend
| Technology | Usage |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database |
| Socket.io | WebSocket server |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Multer | File/image uploads |
| dotenv | Environment config |

### Infrastructure
| Service | Usage |
|---|---|
| MongoDB Atlas | Production database |
| Render | Backend hosting |
| Vercel | Frontend hosting |

---

## Architecture

```
DisasterLink/
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── MapDashboard.jsx
│   │   │   ├── VolunteerDashboard.jsx
│   │   │   ├── NGODashboard.jsx
│   │   │   └── AnalyticsDashboard.jsx
│   │   ├── components/
│   │   │   └── Chat.jsx
│   │   ├── hooks/
│   │   │   └── useSocketNotifications.js
│   │   └── api/
│   │       └── axios.js
│   └── public/
│       ├── manifest.json     # PWA config
│       └── sw.js             # Service Worker
│
└── backend/                  # Node.js + Express
    ├── models/
    │   ├── User.js
    │   ├── SOS.js
    │   ├── Volunteer.js
    │   ├── Resource.js
    │   ├── Broadcast.js
    │   └── Chat.js
    ├── routes/
    │   ├── auth.js
    │   ├── sos.js
    │   ├── volunteer.js
    │   ├── ngo.js
    │   ├── chat.js
    │   └── analytics.js
    ├── middleware/
    │   ├── auth.js           # JWT middleware
    │   └── upload.js         # Multer config
    └── server.js
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas account
- Git

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/Disha286/DisasterLink.git
cd DisasterLink
```

**2. Setup Backend**
```bash
cd backend
npm install
```

Create `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/disasterlink
JWT_SECRET=your_secret_key
```

```bash
nodemon server.js
```

**3. Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

### SOS
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/sos/submit` | Submit SOS request |
| GET | `/api/sos/all` | Get all SOS requests |
| GET | `/api/sos/mine` | Get my SOS requests |
| PATCH | `/api/sos/:id/status` | Update SOS status |

### Volunteer
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/volunteer/register` | Create volunteer profile |
| GET | `/api/volunteer/me` | Get my profile |
| GET | `/api/volunteer/matches` | Get matched SOS requests |
| PATCH | `/api/volunteer/availability` | Toggle availability |
| PATCH | `/api/volunteer/assign/:sosId` | Assign task |
| PATCH | `/api/volunteer/complete/:sosId` | Complete task |

### NGO
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/ngo/dashboard` | Get dashboard overview |
| GET | `/api/ngo/resources` | Get all resources |
| POST | `/api/ngo/resources` | Add resource |
| PATCH | `/api/ngo/resources/:id` | Update resource |
| DELETE | `/api/ngo/resources/:id` | Delete resource |
| POST | `/api/ngo/broadcast` | Send broadcast |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics` | Get all analytics data |

---

## Design System

| Token | Value |
|---|---|
| Primary Red | `#E8231A` |
| Orange | `#F57C2B` |
| Dark Background | `#0D0D0D` |
| Card Background | `#141414` |
| Text | `#E8E4DC` |
| Muted | `#7A7570` |
| Font — Display | Bebas Neue |
| Font — Body | DM Sans |
| Font — Mono | JetBrains Mono |

---

## Key Technical Decisions

**Why Socket.io over polling?**  
Real-time SOS alerts require instant delivery. Socket.io enables push-based communication with <100ms latency vs 3-5 second polling intervals — critical in disaster scenarios.

**Why MongoDB over SQL?**  
SOS requests have variable schemas (different disaster types carry different metadata). MongoDB's flexible document model handles this naturally without schema migrations.

**Why JWT over sessions?**  
Stateless authentication scales horizontally without shared session storage — important for potential multi-instance deployment during high-traffic disaster events.

**Why PWA over native app?**  
Victims in disaster zones can't be expected to install an app from a store. A PWA works directly from a browser link, installs in one tap, and caches critical data offline.

---

## Developer

**Disha** — Final Year CSE, PES College of Engineering
Full-stack Engineer · UI/UX Designer · Data Enthusiast

- 🌐 Portfolio:https://dishaa-portfolio.vercel.app/
- 💼 LinkedIn:https://linkedin.com/in/disha
- 🐙 GitHub:https://github.com/Disha286

---

## License

MIT License — feel free to use, modify, and distribute.

---

*Built as a Final Year Capstone Project*