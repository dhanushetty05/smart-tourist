# Smart Tourist Safety Monitoring System - Node.js Backend

## Technical Stack
- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Token)
- **Password Hashing**: bcryptjs
- **Real-time**: Socket.IO
- **AI**: Rule-based risk detection logic

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file with:
```
MONGO_URI=mongodb://localhost:27017/tourist_safety_db
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

3. Start MongoDB:
```bash
# Make sure MongoDB is running on your system
mongod
```

4. Run the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Tourists
- `POST /api/tourists` - Create tourist profile (Tourist only)
- `GET /api/tourists/me` - Get current tourist profile (Tourist only)
- `GET /api/tourists/:touristId` - Get tourist by ID (Admin only)
- `GET /api/tourists` - Get all tourists (Admin only)
- `GET /api/tourists/verify/:touristId` - Verify tourist (Public)

### Locations
- `POST /api/locations` - Create location entry (Tourist only)
- `GET /api/locations/tourist/:touristId` - Get tourist locations

### Alerts
- `POST /api/alerts/panic` - Create panic alert (Tourist only)
- `GET /api/alerts` - Get alerts
- `PATCH /api/alerts/:alertId` - Update alert status (Admin only)

### Geo Zones
- `POST /api/geo-zones` - Create geo zone (Admin only)
- `GET /api/geo-zones` - Get all geo zones (Public)

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics (Admin only)

## Features

✅ JWT Authentication with bcrypt password hashing
✅ Role-Based Access Control (Tourist, Police, Tourism Officer)
✅ Rule-based AI safety score calculation
✅ Real-time alerts via Socket.IO
✅ Geo-fencing with risk zones
✅ QR code generation for tourist verification
✅ Blockchain-style hash verification
✅ Location tracking and analysis

## Security
- JWT tokens with 24-hour expiration
- Password hashing with bcrypt (10 rounds)
- Role-based authorization middleware
- Environment variables for sensitive data
- CORS configuration
