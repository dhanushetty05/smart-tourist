# 🎯 How to Use the Smart Tourist Safety System

## 📱 Step-by-Step User Guide

### 🌐 Access the Website

Open your browser and go to: **http://localhost:3000**

---

## 👤 FOR TOURISTS

### Step 1: Register as a Tourist

1. **Go to**: http://localhost:3000
2. **Click**: "Register" or "Get Started" button
3. **Fill in the form**:
   ```
   Email:    tourist@example.com
   Name:     John Doe
   Password: password123
   Role:     tourist (select from dropdown)
   ```
4. **Click**: "Register" button
5. **Result**: You'll be automatically logged in!

### Step 2: Complete Your Tourist Profile

After registration, you'll be redirected to profile setup:

1. **Fill in your details**:
   ```
   Full Name:              John Doe
   Passport Number:        AB1234567
   Trip Start Date:        11-02-2026 (today)
   Trip End Date:          20-02-2026 (future date)
   Emergency Contact:      +1234567890
   Photo URL:              (optional - leave empty)
   ```

2. **Click**: "Create Digital Tourist ID"

3. **Result**: Profile created! You'll see your dashboard.

### Step 3: Tourist Dashboard Features

Once logged in, you can:

#### ✅ View Your Digital ID Card
- See your tourist ID number
- View QR code
- Check passport details
- See trip dates

#### ✅ View Your Location
- Map shows your current location
- Location updates automatically
- Safety score displayed

#### ✅ Use Panic Button
- Red emergency button
- Click to send alert to authorities
- Creates high-priority alert (risk score = 100)

#### ✅ Check Safety Score
- Displayed as a ring/circle
- Score from 0-100
- Updates based on your movements

### Step 4: Login Next Time

1. **Go to**: http://localhost:3000/login
2. **Enter**:
   ```
   Email:    tourist@example.com
   Password: password123
   ```
3. **Click**: "Login"
4. **Result**: Redirected to your dashboard

---

## 👮 FOR ADMIN (Police/Tourism Officers)

### Step 1: Register as Admin

1. **Go to**: http://localhost:3000
2. **Click**: "Register"
3. **Fill in the form**:
   ```
   Email:    admin@example.com
   Name:     Admin User
   Password: admin123
   Role:     police (or tourism_officer)
   ```
4. **Click**: "Register"
5. **Result**: Admin account created!

### Step 2: Admin Login

**Option A: Direct Admin Login**
1. **Go to**: http://localhost:3000/admin/login
2. **Enter**:
   ```
   Email:    admin@example.com
   Password: admin123
   ```
3. **Click**: "Login"

**Option B: Regular Login (works too)**
1. **Go to**: http://localhost:3000/login
2. **Enter admin credentials**
3. System automatically redirects to admin dashboard

### Step 3: Admin Dashboard Features

Once logged in as admin, you can:

#### ✅ View All Tourists
- See list of all registered tourists
- View tourist details
- Check tourist IDs
- See trip dates

#### ✅ View All Alerts
- See all panic button alerts
- View AI-generated alerts
- Check geo-fence violations
- See alert timestamps

#### ✅ Manage Alerts
- Update alert status:
  - Pending → Acknowledged → Resolved
- Assign officers to alerts
- Add notes/comments
- Track response times

#### ✅ View Tourist Locations
- See all tourists on map
- Track real-time locations
- Identify tourists in high-risk zones
- Monitor movement patterns

#### ✅ View Analytics
- Total active tourists
- Active alerts count
- Alerts per day graph
- High-risk zones count
- Average response time

---

## 🔐 All Available Routes

### Public Routes (No Login Required)
- `/` - Landing page
- `/login` - User login
- `/register` - User registration
- `/admin/login` - Admin login

### Tourist Routes (Login Required)
- `/tourist/profile-setup` - Complete profile
- `/tourist/dashboard` - Main dashboard

### Admin Routes (Admin Login Required)
- `/admin/dashboard` - Admin control panel

---

## 📝 Sample Test Accounts

### Tourist Account 1
```
Email:    tourist1@test.com
Password: test123
Role:     tourist
```

### Tourist Account 2
```
Email:    tourist2@test.com
Password: test123
Role:     tourist
```

### Admin Account 1
```
Email:    admin@test.com
Password: admin123
Role:     police
```

### Admin Account 2
```
Email:    officer@test.com
Password: officer123
Role:     tourism_officer
```

---

## 🎮 Testing Scenarios

### Scenario 1: Tourist Journey
1. Register as tourist
2. Complete profile
3. View dashboard
4. Check location on map
5. Click panic button
6. View alert created

### Scenario 2: Admin Monitoring
1. Register as admin
2. Login to admin dashboard
3. View all tourists
4. Check alerts list
5. Update alert status
6. View tourist locations on map

### Scenario 3: Multi-User Test
1. Open browser window 1: Register tourist
2. Open browser window 2 (incognito): Register admin
3. Tourist: Click panic button
4. Admin: See alert appear in real-time
5. Admin: Update alert status
6. Tourist: See status update

---

## 🔧 Troubleshooting

### Can't Register?
- Check if email already exists
- Try different email
- Ensure all fields are filled
- Check password is at least 6 characters

### Can't Login?
- Verify email and password
- Check if you registered first
- Try "Forgot Password" (if implemented)
- Clear browser cache

### Profile Creation Fails?
- Ensure all required fields filled
- Check date format (YYYY-MM-DD)
- Verify passport number entered
- Try refreshing page

### Dashboard Not Loading?
- Check if profile is complete
- Verify you're logged in
- Check browser console for errors
- Refresh the page

### Panic Button Not Working?
- Ensure you're logged in
- Check if profile is complete
- Verify location permissions granted
- Check browser console

---

## 🎯 Quick Start Commands

### Start the Application
```bash
# Terminal 1: Backend
cd backend-temp
npm run dev

# Terminal 2: Frontend
cd frontend
npm start
```

### Access URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Register**: http://localhost:3000/register
- **Login**: http://localhost:3000/login
- **Admin Login**: http://localhost:3000/admin/login

---

## 📊 User Roles Explained

### Tourist Role
**Can do**:
- Create profile
- View own dashboard
- See own location
- Use panic button
- View own alerts
- Update own profile

**Cannot do**:
- View other tourists
- Access admin dashboard
- Manage alerts
- View analytics

### Police/Tourism Officer Role
**Can do**:
- View all tourists
- See all alerts
- Update alert status
- Assign officers
- View all locations
- Access analytics
- Monitor system

**Cannot do**:
- Create tourist profiles
- Use panic button as tourist
- Modify tourist data

---

## 🎨 UI Navigation

### Tourist Dashboard Layout
```
┌─────────────────────────────────────┐
│  Header (Logout button)             │
├─────────────────────────────────────┤
│  Digital ID Card    │  Safety Score │
│  - Tourist ID       │  - Ring Chart │
│  - QR Code          │  - Score: 85  │
│  - Passport         │               │
│  - Dates            │               │
├─────────────────────────────────────┤
│  Live Map                           │
│  - Your location marker             │
│  - High-risk zones                  │
├─────────────────────────────────────┤
│  [PANIC BUTTON]                     │
├─────────────────────────────────────┤
│  Recent Alerts                      │
│  - Alert list                       │
│  - Status                           │
└─────────────────────────────────────┘
```

### Admin Dashboard Layout
```
┌─────────────────────────────────────┐
│  Header (Logout button)             │
├─────────────────────────────────────┤
│  Statistics Cards                   │
│  - Total Tourists                   │
│  - Active Alerts                    │
│  - Response Time                    │
├─────────────────────────────────────┤
│  Tabs:                              │
│  [Tourists] [Alerts] [Map] [Analytics]
├─────────────────────────────────────┤
│  Content Area                       │
│  - List/Table view                  │
│  - Action buttons                   │
│  - Filters                          │
└─────────────────────────────────────┘
```

---

## 🎉 Success Indicators

### Registration Success
✅ "Registration successful" message
✅ Redirected to profile setup (tourist) or dashboard (admin)
✅ JWT token stored

### Login Success
✅ "Login successful" message
✅ Redirected to appropriate dashboard
✅ User info displayed in header

### Profile Creation Success
✅ "Profile created successfully" message
✅ Digital ID card displayed
✅ QR code generated
✅ Dashboard loaded

### Panic Button Success
✅ "Alert sent successfully" message
✅ Alert appears in alerts list
✅ Admin receives notification
✅ Risk score set to 100

---

## 📞 Need Help?

### Check These First:
1. Is MongoDB running? (`net start MongoDB`)
2. Is backend running? (Check port 5000)
3. Is frontend running? (Check port 3000)
4. Are you using correct credentials?
5. Did you complete profile setup?

### Common Issues:
- **"Invalid credentials"** → Check email/password
- **"Profile not found"** → Complete profile setup first
- **"Access denied"** → Check if you have correct role
- **"Network error"** → Check if backend is running

---

## 🚀 You're All Set!

Now you can:
1. ✅ Register as tourist or admin
2. ✅ Login to your account
3. ✅ Use all features
4. ✅ Test the system

**Enjoy your Smart Tourist Safety Monitoring System!** 🎊
