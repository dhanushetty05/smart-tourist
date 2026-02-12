# Smart Tourist Safety Monitoring System - Setup Guide

## ✅ Technical Stack Verification

### Frontend
- ✅ React.js
- ✅ Tailwind CSS
- ✅ Axios (for API calls)
- ✅ React Router (for navigation)
- ✅ Leaflet (can be replaced with Google Maps JavaScript API)

### Backend
- ✅ Node.js
- ✅ Express.js
- ✅ JWT (JSON Web Token) for authentication
- ✅ bcryptjs (for password hashing)
- ✅ Mongoose (for database connection)

### Database
- ✅ MongoDB

### Geo-Fencing
- ✅ Rule-based distance calculation (Haversine formula)
- ✅ Browser Geolocation API (frontend)

### AI (Simple Version)
- ✅ Rule-based risk detection logic inside backend
- ✅ No ML model, only condition-based scoring

### Security
- ✅ JWT Authentication
- ✅ Role-Based Access Control (Admin / Tourist)
- ✅ Password hashing using bcryptjs
- ✅ Environment variables (.env)

### Real-Time Alerts
- ✅ Socket.io

## Prerequisites

1. **Node.js** (v16 or higher)
   - Download: https://nodejs.org/

2. **MongoDB** (v5 or higher)
   - Download: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

3. **Git** (optional, for version control)
   - Download: https://git-scm.com/

## Installation Steps

### 1. Install MongoDB

**Option A: Local Installation**
- Download and install MongoDB Community Edition
- Start MongoDB service:
  ```bash
  # Windows
  net start MongoDB
  
  # Mac/Linux
  sudo systemctl start mongod
  ```

**Option B: MongoDB Atlas (Cloud)**
- Create free account at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string and update `.env` file

### 2. Setup Backend (Node.js)

```bash
# Navigate to backend directory
cd smart-tourist/backend-nodejs

# Install dependencies
npm install

# Configure environment variables
# Edit .env file with your settings:
# MONGO_URI=mongodb://localhost:27017/tourist_safety_db
# JWT_SECRET=your-secret-key-here
# PORT=5000

# Start the server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Setup Frontend (React)

```bash
# Navigate to frontend directory
cd smart-tourist/frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will run on `http://localhost:3000`

## Testing the Application

### 1. Register a Tourist Account
- Open browser: `http://localhost:3000`
- Click "Register"
- Fill in details with role: "tourist"
- Submit

### 2. Create Tourist Profile
- After login, complete the tourist profile setup
- Enter passport details, dates, emergency contact
- QR code will be generated

### 3. Test Location Tracking
- Allow browser location access
- Dashboard will show your location on map
- Safety score will be calculated based on movements

### 4. Test Panic Button
- Click the panic button on tourist dashboard
- Alert will be created and sent to admin dashboard

### 5. Register Admin Account
- Register with role: "police" or "tourism_officer"
- Access admin dashboard to view:
  - All tourists
  - Active alerts
  - Analytics
  - Geo zones

## API Testing with Postman

### Register User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "tourist@example.com",
  "name": "John Doe",
  "password": "password123",
  "role": "tourist"
}
```

### Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "tourist@example.com",
  "password": "password123"
}
```

### Create Tourist Profile (requires JWT token)
```
POST http://localhost:5000/api/tourists
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "John Doe",
  "passportNumber": "AB1234567",
  "entryDate": "2024-01-01",
  "exitDate": "2024-01-15",
  "emergencyContact": "+1234567890"
}
```

## Project Structure

```
smart-tourist/
├── backend-nodejs/          # Node.js + Express backend
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   ├── utils/              # Utility functions (safety score)
│   ├── server.js           # Main server file
│   ├── package.json
│   └── .env
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # Context providers
│   │   └── App.js
│   ├── package.json
│   └── .env
│
└── backend/               # Old Python backend (can be removed)
```

## Common Issues & Solutions

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- For Atlas, whitelist your IP address

### Port Already in Use
- Change PORT in backend `.env` file
- Update REACT_APP_BACKEND_URL in frontend `.env`

### CORS Errors
- Ensure backend CORS_ORIGIN matches frontend URL
- Default: `http://localhost:3000`

### JWT Token Errors
- Check JWT_SECRET is set in backend `.env`
- Ensure token is included in Authorization header

## Next Steps

1. **Google Maps Integration**
   - Get API key from Google Cloud Console
   - Replace Leaflet with Google Maps JavaScript API
   - Update map components in frontend

2. **Deploy to Production**
   - Backend: Heroku, Railway, or DigitalOcean
   - Frontend: Vercel, Netlify, or AWS S3
   - Database: MongoDB Atlas

3. **Add Features**
   - Email notifications
   - SMS alerts
   - Advanced analytics
   - Mobile app (React Native)

## Support

For issues or questions:
1. Check MongoDB is running
2. Verify all dependencies are installed
3. Check console logs for errors
4. Ensure .env files are configured correctly
