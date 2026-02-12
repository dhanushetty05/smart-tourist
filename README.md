# Smart Tourist Safety Monitoring System

A full-stack web application for monitoring tourist safety with real-time location tracking, panic alerts, and risk assessment.

## Tech Stack

### Frontend
- React.js 19.0.0
- Tailwind CSS
- Leaflet Maps
- Axios
- React Router

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcrypt (Password Hashing)
- Socket.IO (Real-time)

## Features

### Tourist Features
- User registration and login
- Digital Tourist ID with QR code
- Live location tracking on map
- Safety score monitoring
- Panic button for emergencies
- Alert history

### Admin Features
- Police/Tourism Officer login
- View all active tourists
- Monitor alerts in real-time
- Update alert status
- Live map with tourist locations
- Analytics dashboard

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally on port 27017)
- npm or yarn

### Setup

1. **Clone the repository**
```bash
cd smart-tourist
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Configure Environment Variables**

Backend (.env in backend folder):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart-tourist
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=http://localhost:3000
```

Frontend (.env in frontend folder):
```
REACT_APP_BACKEND_URL=http://localhost:5000
```

## Running the Application

### Option 1: Using Batch Files (Windows)
```bash
# Start Backend
START_BACKEND.bat

# Start Frontend (in another terminal)
START_FRONTEND.bat
```

### Option 2: Manual Start

**Start Backend:**
```bash
cd backend
npm run dev
```

**Start Frontend:**
```bash
cd frontend
npm start
```

The application will open at: http://localhost:3000

## Usage

### Tourist Access
1. Go to http://localhost:3000
2. Click "Register" to create a tourist account
3. Login with your credentials
4. Complete your profile (passport, dates, emergency contact)
5. Access your dashboard with Digital ID, map, and panic button

### Admin Access
1. Go to http://localhost:3000/admin-login
2. Register as Police Officer or Tourism Officer
3. Login to access the admin dashboard
4. Monitor tourists, alerts, and locations

## Project Structure

```
smart-tourist/
├── backend/                 # Node.js Backend
│   ├── models/             # Mongoose models
│   ├── routes/             # Express routes
│   ├── middleware/         # Auth middleware
│   ├── utils/              # Utility functions
│   ├── server.js           # Main server file
│   └── package.json
│
├── frontend/               # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # Context providers
│   │   └── App.js
│   └── package.json
│
├── README.md
├── SETUP_GUIDE.md
├── HOW_TO_USE.md
├── START_BACKEND.bat
└── START_FRONTEND.bat
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

### Tourists
- POST `/api/tourists` - Create tourist profile
- GET `/api/tourists/me` - Get current tourist profile
- GET `/api/tourists` - Get all tourists (Admin)

### Alerts
- POST `/api/alerts/panic` - Create panic alert
- GET `/api/alerts` - Get all alerts
- PATCH `/api/alerts/:id` - Update alert status (Admin)

### Locations
- POST `/api/locations` - Update tourist location
- GET `/api/locations` - Get all locations (Admin)

### Geo Zones
- GET `/api/geo-zones` - Get all geo-fencing zones
- POST `/api/geo-zones` - Create geo zone (Admin)

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (Tourist/Police/Tourism Officer)
- Protected API routes
- Environment variable configuration

## License

MIT License
