from fastapi import FastAPI, APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import hashlib
from sklearn.ensemble import IsolationForest
import numpy as np
import qrcode
from io import BytesIO
import base64
import socketio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Secret
JWT_SECRET = os.environ.get('JWT_SECRET', 'tourist-safety-secret-key-2025')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Socket.IO for real-time alerts
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio, app)

security = HTTPBearer()

# Active WebSocket connections
active_connections: List[WebSocket] = []

# ==================== MODELS ====================

class UserRole:
    TOURIST = "tourist"
    POLICE = "police"
    TOURISM_OFFICER = "tourism_officer"

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str
    password_hash: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: str = UserRole.TOURIST

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Tourist(BaseModel):
    model_config = ConfigDict(extra="ignore")
    tourist_id: str = Field(default_factory=lambda: f"TID{uuid.uuid4().hex[:10].upper()}")
    user_id: str
    name: str
    passport_number: str
    passport_hash: str
    entry_date: datetime
    exit_date: datetime
    emergency_contact: str
    photo_url: Optional[str] = None
    status: str = "active"
    blockchain_hash: str
    safety_score: float = 85.0
    qr_code: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TouristCreate(BaseModel):
    name: str
    passport_number: str
    entry_date: datetime
    exit_date: datetime
    emergency_contact: str
    photo_url: Optional[str] = None

class Location(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tourist_id: str
    latitude: float
    longitude: float
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LocationCreate(BaseModel):
    latitude: float
    longitude: float

class Alert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tourist_id: str
    tourist_name: str
    alert_type: str
    risk_score: float
    reason: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str = "pending"
    assigned_officer: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    resolved_at: Optional[datetime] = None

class AlertCreate(BaseModel):
    alert_type: str
    reason: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class GeoZone(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    risk_level: str
    center_lat: float
    center_lng: float
    radius: float
    description: Optional[str] = None

class GeoZoneCreate(BaseModel):
    name: str
    risk_level: str
    center_lat: float
    center_lng: float
    radius: float
    description: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = decode_token(credentials.credentials)
    user_data = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
    if not user_data:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user_data)

def generate_blockchain_hash(tourist_id: str, passport_hash: str) -> str:
    """Simulate blockchain hash generation"""
    data = f"{tourist_id}{passport_hash}{datetime.now(timezone.utc).isoformat()}"
    return hashlib.sha256(data.encode()).hexdigest()

def generate_qr_code(data: str) -> str:
    """Generate QR code as base64 string"""
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode()

async def calculate_safety_score(tourist_id: str) -> float:
    """AI-based safety score calculation using anomaly detection"""
    # Get recent locations
    locations = await db.locations.find(
        {"tourist_id": tourist_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(50).to_list(50)
    
    if len(locations) < 5:
        return 85.0  # Default score for new tourists
    
    # Extract features for anomaly detection
    features = []
    for loc in locations:
        # Time of day (hours)
        ts = loc['timestamp']
        if isinstance(ts, str):
            ts = datetime.fromisoformat(ts)
        hour = ts.hour
        features.append([loc['latitude'], loc['longitude'], hour])
    
    # Use Isolation Forest for anomaly detection
    features_array = np.array(features)
    iso_forest = IsolationForest(contamination=0.1, random_state=42)
    predictions = iso_forest.fit_predict(features_array)
    
    # Calculate score based on anomalies
    anomaly_count = np.sum(predictions == -1)
    anomaly_ratio = anomaly_count / len(predictions)
    
    # Base score
    safety_score = 100.0 - (anomaly_ratio * 50)
    
    # Check for high-risk zones
    geo_zones = await db.geo_zones.find({"risk_level": "high"}, {"_id": 0}).to_list(100)
    
    latest_loc = locations[0]
    for zone in geo_zones:
        # Simple distance check (can be improved with proper geospatial queries)
        distance = ((latest_loc['latitude'] - zone['center_lat']) ** 2 + 
                   (latest_loc['longitude'] - zone['center_lng']) ** 2) ** 0.5
        if distance < zone['radius']:
            safety_score -= 20
            break
    
    return max(0.0, min(100.0, safety_score))

# ==================== AUTHENTICATION ROUTES ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        name=user_data.name,
        role=user_data.role,
        password_hash=hash_password(user_data.password)
    )
    
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    await db.users.insert_one(user_dict)
    
    # Create token
    token = create_access_token({"sub": user.id, "role": user.role})
    
    return TokenResponse(
        access_token=token,
        user={"id": user.id, "email": user.email, "name": user.name, "role": user.role}
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user_data = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_data or not verify_password(credentials.password, user_data['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = User(**user_data)
    token = create_access_token({"sub": user.id, "role": user.role})
    
    return TokenResponse(
        access_token=token,
        user={"id": user.id, "email": user.email, "name": user.name, "role": user.role}
    )

# ==================== TOURIST ROUTES ====================

@api_router.post("/tourists", response_model=Tourist)
async def create_tourist(tourist_data: TouristCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.TOURIST:
        raise HTTPException(status_code=403, detail="Only tourists can create tourist profiles")
    
    # Check if tourist profile already exists
    existing = await db.tourists.find_one({"user_id": current_user.id})
    if existing:
        raise HTTPException(status_code=400, detail="Tourist profile already exists")
    
    # Create passport hash
    passport_hash = hashlib.sha256(tourist_data.passport_number.encode()).hexdigest()
    
    tourist = Tourist(
        user_id=current_user.id,
        name=tourist_data.name,
        passport_number=tourist_data.passport_number,
        passport_hash=passport_hash,
        entry_date=tourist_data.entry_date,
        exit_date=tourist_data.exit_date,
        emergency_contact=tourist_data.emergency_contact,
        photo_url=tourist_data.photo_url,
        blockchain_hash=generate_blockchain_hash(tourist_data.passport_number, passport_hash)
    )
    
    # Generate QR code
    qr_data = f"TOURIST_ID:{tourist.tourist_id}|NAME:{tourist.name}|BLOCKCHAIN:{tourist.blockchain_hash[:16]}"
    tourist.qr_code = generate_qr_code(qr_data)
    
    tourist_dict = tourist.model_dump()
    tourist_dict['entry_date'] = tourist_dict['entry_date'].isoformat()
    tourist_dict['exit_date'] = tourist_dict['exit_date'].isoformat()
    tourist_dict['created_at'] = tourist_dict['created_at'].isoformat()
    
    # Store blockchain hash
    await db.blockchain.insert_one({
        "tourist_id": tourist.tourist_id,
        "blockchain_hash": tourist.blockchain_hash,
        "entry_date": tourist_dict['entry_date'],
        "exit_date": tourist_dict['exit_date'],
        "status": "active",
        "created_at": tourist_dict['created_at']
    })
    
    await db.tourists.insert_one(tourist_dict)
    
    return tourist

@api_router.get("/tourists/me", response_model=Tourist)
async def get_my_tourist_profile(current_user: User = Depends(get_current_user)):
    tourist_data = await db.tourists.find_one({"user_id": current_user.id}, {"_id": 0})
    if not tourist_data:
        raise HTTPException(status_code=404, detail="Tourist profile not found")
    
    # Convert ISO strings back to datetime
    tourist_data['entry_date'] = datetime.fromisoformat(tourist_data['entry_date'])
    tourist_data['exit_date'] = datetime.fromisoformat(tourist_data['exit_date'])
    tourist_data['created_at'] = datetime.fromisoformat(tourist_data['created_at'])
    
    return Tourist(**tourist_data)

@api_router.get("/tourists/{tourist_id}", response_model=Tourist)
async def get_tourist(tourist_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.POLICE, UserRole.TOURISM_OFFICER]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    tourist_data = await db.tourists.find_one({"tourist_id": tourist_id}, {"_id": 0})
    if not tourist_data:
        raise HTTPException(status_code=404, detail="Tourist not found")
    
    tourist_data['entry_date'] = datetime.fromisoformat(tourist_data['entry_date'])
    tourist_data['exit_date'] = datetime.fromisoformat(tourist_data['exit_date'])
    tourist_data['created_at'] = datetime.fromisoformat(tourist_data['created_at'])
    
    return Tourist(**tourist_data)

@api_router.get("/tourists", response_model=List[Tourist])
async def get_all_tourists(current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.POLICE, UserRole.TOURISM_OFFICER]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    tourists = await db.tourists.find({"status": "active"}, {"_id": 0}).to_list(1000)
    
    for tourist in tourists:
        tourist['entry_date'] = datetime.fromisoformat(tourist['entry_date'])
        tourist['exit_date'] = datetime.fromisoformat(tourist['exit_date'])
        tourist['created_at'] = datetime.fromisoformat(tourist['created_at'])
    
    return tourists

@api_router.get("/tourists/verify/{tourist_id}")
async def verify_tourist(tourist_id: str):
    # Verify against blockchain
    blockchain_data = await db.blockchain.find_one({"tourist_id": tourist_id}, {"_id": 0})
    tourist_data = await db.tourists.find_one({"tourist_id": tourist_id}, {"_id": 0})
    
    if not blockchain_data or not tourist_data:
        return {"verified": False, "message": "Tourist ID not found"}
    
    # Verify hash matches
    if blockchain_data['blockchain_hash'] == tourist_data['blockchain_hash']:
        return {
            "verified": True,
            "tourist_id": tourist_id,
            "name": tourist_data['name'],
            "status": tourist_data['status'],
            "entry_date": blockchain_data['entry_date'],
            "exit_date": blockchain_data['exit_date']
        }
    
    return {"verified": False, "message": "Blockchain verification failed"}

# ==================== LOCATION ROUTES ====================

@api_router.post("/locations")
async def create_location(location_data: LocationCreate, current_user: User = Depends(get_current_user)):
    # Get tourist profile
    tourist = await db.tourists.find_one({"user_id": current_user.id}, {"_id": 0})
    if not tourist:
        raise HTTPException(status_code=404, detail="Tourist profile not found")
    
    location = Location(
        tourist_id=tourist['tourist_id'],
        latitude=location_data.latitude,
        longitude=location_data.longitude
    )
    
    location_dict = location.model_dump()
    location_dict['timestamp'] = location_dict['timestamp'].isoformat()
    await db.locations.insert_one(location_dict)
    
    # Update safety score
    new_score = await calculate_safety_score(tourist['tourist_id'])
    await db.tourists.update_one(
        {"tourist_id": tourist['tourist_id']},
        {"$set": {"safety_score": new_score}}
    )
    
    # Check for anomalies and create alerts
    if new_score < 50:
        alert = Alert(
            tourist_id=tourist['tourist_id'],
            tourist_name=tourist['name'],
            alert_type="ai_anomaly",
            risk_score=new_score,
            reason="Low safety score detected by AI analysis",
            latitude=location_data.latitude,
            longitude=location_data.longitude
        )
        
        alert_dict = alert.model_dump()
        alert_dict['created_at'] = alert_dict['created_at'].isoformat()
        await db.alerts.insert_one(alert_dict)
        
        # Emit real-time alert
        await sio.emit('new_alert', alert_dict)
    
    return {"success": True, "safety_score": new_score}

@api_router.get("/locations/tourist/{tourist_id}")
async def get_tourist_locations(tourist_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.POLICE, UserRole.TOURISM_OFFICER]:
        # Check if it's the tourist's own data
        tourist = await db.tourists.find_one({"user_id": current_user.id})
        if not tourist or tourist['tourist_id'] != tourist_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    locations = await db.locations.find(
        {"tourist_id": tourist_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(100).to_list(100)
    
    for loc in locations:
        loc['timestamp'] = datetime.fromisoformat(loc['timestamp']).isoformat()
    
    return locations

# ==================== ALERT ROUTES ====================

@api_router.post("/alerts/panic")
async def create_panic_alert(location_data: LocationCreate, current_user: User = Depends(get_current_user)):
    tourist = await db.tourists.find_one({"user_id": current_user.id}, {"_id": 0})
    if not tourist:
        raise HTTPException(status_code=404, detail="Tourist profile not found")
    
    alert = Alert(
        tourist_id=tourist['tourist_id'],
        tourist_name=tourist['name'],
        alert_type="panic",
        risk_score=100.0,
        reason="Emergency panic button activated by tourist",
        latitude=location_data.latitude,
        longitude=location_data.longitude
    )
    
    alert_dict = alert.model_dump()
    alert_dict['created_at'] = alert_dict['created_at'].isoformat()
    await db.alerts.insert_one(alert_dict)
    
    # Emit real-time alert
    await sio.emit('new_alert', alert_dict)
    
    return alert

@api_router.get("/alerts", response_model=List[Alert])
async def get_alerts(current_user: User = Depends(get_current_user)):
    query = {}
    
    if current_user.role == UserRole.TOURIST:
        tourist = await db.tourists.find_one({"user_id": current_user.id})
        if tourist:
            query["tourist_id"] = tourist['tourist_id']
    
    alerts = await db.alerts.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for alert in alerts:
        alert['created_at'] = datetime.fromisoformat(alert['created_at'])
        if alert.get('resolved_at'):
            alert['resolved_at'] = datetime.fromisoformat(alert['resolved_at'])
    
    return alerts

@api_router.patch("/alerts/{alert_id}")
async def update_alert(alert_id: str, status: str, assigned_officer: Optional[str] = None, current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.POLICE, UserRole.TOURISM_OFFICER]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    update_data = {"status": status}
    if assigned_officer:
        update_data["assigned_officer"] = assigned_officer
    if status == "resolved":
        update_data["resolved_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.alerts.update_one({"id": alert_id}, {"$set": update_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return {"success": True}

# ==================== GEO ZONE ROUTES ====================

@api_router.post("/geo-zones", response_model=GeoZone)
async def create_geo_zone(zone_data: GeoZoneCreate, current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.POLICE, UserRole.TOURISM_OFFICER]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    zone = GeoZone(**zone_data.model_dump())
    zone_dict = zone.model_dump()
    await db.geo_zones.insert_one(zone_dict)
    
    return zone

@api_router.get("/geo-zones", response_model=List[GeoZone])
async def get_geo_zones():
    zones = await db.geo_zones.find({}, {"_id": 0}).to_list(1000)
    return zones

# ==================== ANALYTICS ROUTES ====================

@api_router.get("/analytics/dashboard")
async def get_dashboard_analytics(current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.POLICE, UserRole.TOURISM_OFFICER]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Total active tourists
    total_tourists = await db.tourists.count_documents({"status": "active"})
    
    # Active alerts
    active_alerts = await db.alerts.count_documents({"status": "pending"})
    
    # Recent alerts (last 7 days)
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_alerts = await db.alerts.find(
        {"created_at": {"$gte": seven_days_ago.isoformat()}},
        {"_id": 0}
    ).to_list(1000)
    
    # Alerts per day
    alerts_per_day = {}
    for alert in recent_alerts:
        date = alert['created_at'][:10]
        alerts_per_day[date] = alerts_per_day.get(date, 0) + 1
    
    # High-risk zones frequency
    risk_zones = await db.geo_zones.find({"risk_level": "high"}, {"_id": 0}).to_list(100)
    
    # Average response time (mock data for now)
    avg_response_time = 12.5
    
    return {
        "total_tourists": total_tourists,
        "active_alerts": active_alerts,
        "alerts_per_day": alerts_per_day,
        "high_risk_zones_count": len(risk_zones),
        "avg_response_time_minutes": avg_response_time
    }

# ==================== WebSocket Events ====================

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

# ==================== ROOT ====================

@api_router.get("/")
async def root():
    return {"message": "Smart Tourist Safety Monitoring System API", "version": "1.0.0"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    # Create default geo zones
    existing_zones = await db.geo_zones.count_documents({})
    if existing_zones == 0:
        default_zones = [
            {
                "id": str(uuid.uuid4()),
                "name": "High Crime Area - Downtown",
                "risk_level": "high",
                "center_lat": 28.6139,
                "center_lng": 77.2090,
                "radius": 0.05,
                "description": "Known for petty theft"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Tourist Safe Zone - Central Park",
                "risk_level": "low",
                "center_lat": 28.6329,
                "center_lng": 77.2195,
                "radius": 0.03,
                "description": "24/7 police patrol"
            }
        ]
        await db.geo_zones.insert_many(default_zones)
        logger.info("Default geo zones created")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()