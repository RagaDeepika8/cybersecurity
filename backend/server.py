from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from enum import Enum


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Campus Web Access Security System", description="Cisco Virtual Internship - Web Filtering & Network Security")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums for Security System
class PolicyAction(str, Enum):
    ALLOW = "allow"
    BLOCK = "block"
    WARN = "warn"

class PolicyCategory(str, Enum):
    EDUCATION = "education"
    RESEARCH = "research"
    SOCIAL_MEDIA = "social_media"
    STREAMING = "streaming"
    GAMING = "gaming"
    MALWARE = "malware"
    ADULT_CONTENT = "adult_content"
    CUSTOM = "custom"

class DeviceType(str, Enum):
    ROUTER = "router"
    FIREWALL = "firewall"
    SWITCH = "switch"
    UTM = "utm"
    STUDENT_DEVICE = "student_device"
    SERVER = "server"

class AlertSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

# Security Policy Models
class WebFilteringPolicy(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: PolicyCategory
    action: PolicyAction
    domains: List[str] = []
    keywords: List[str] = []
    enabled: bool = True
    priority: int = 1
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class WebFilteringPolicyCreate(BaseModel):
    name: str
    description: str
    category: PolicyCategory
    action: PolicyAction
    domains: List[str] = []
    keywords: List[str] = []
    enabled: bool = True
    priority: int = 1

class WebFilteringPolicyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[PolicyCategory] = None
    action: Optional[PolicyAction] = None
    domains: Optional[List[str]] = None
    keywords: Optional[List[str]] = None
    enabled: Optional[bool] = None
    priority: Optional[int] = None

# Network Device Models
class NetworkDevice(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    device_type: DeviceType
    ip_address: str
    location: str
    description: str
    status: str = "active"
    position: Dict[str, float] = {"x": 0, "y": 0}
    connections: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class NetworkDeviceCreate(BaseModel):
    name: str
    device_type: DeviceType
    ip_address: str
    location: str
    description: str
    status: str = "active"
    position: Dict[str, float] = {"x": 0, "y": 0}
    connections: List[str] = []

# Security Alert Models
class SecurityAlert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    severity: AlertSeverity
    source_ip: str
    destination: str
    policy_triggered: Optional[str] = None
    device_id: Optional[str] = None
    resolved: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None

class SecurityAlertCreate(BaseModel):
    title: str
    description: str
    severity: AlertSeverity
    source_ip: str
    destination: str
    policy_triggered: Optional[str] = None
    device_id: Optional[str] = None

# Dashboard Statistics Model
class DashboardStats(BaseModel):
    total_policies: int
    active_policies: int
    total_devices: int
    active_devices: int
    total_alerts: int
    unresolved_alerts: int
    blocked_requests_today: int
    allowed_requests_today: int

# Policy Management Endpoints
@api_router.get("/policies", response_model=List[WebFilteringPolicy])
async def get_policies():
    """Get all web filtering policies"""
    try:
        policies = await db.web_filtering_policies.find().to_list(1000)
        return [WebFilteringPolicy(**policy) for policy in policies]
    except Exception as e:
        logger.error(f"Error fetching policies: {e}")
        raise HTTPException(status_code=500, detail="Error fetching policies")

@api_router.post("/policies", response_model=WebFilteringPolicy)
async def create_policy(policy: WebFilteringPolicyCreate):
    """Create a new web filtering policy"""
    try:
        policy_obj = WebFilteringPolicy(**policy.dict())
        await db.web_filtering_policies.insert_one(policy_obj.dict())
        return policy_obj
    except Exception as e:
        logger.error(f"Error creating policy: {e}")
        raise HTTPException(status_code=500, detail="Error creating policy")

@api_router.get("/policies/{policy_id}", response_model=WebFilteringPolicy)
async def get_policy(policy_id: str):
    """Get a specific web filtering policy"""
    try:
        policy = await db.web_filtering_policies.find_one({"id": policy_id})
        if not policy:
            raise HTTPException(status_code=404, detail="Policy not found")
        return WebFilteringPolicy(**policy)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching policy: {e}")
        raise HTTPException(status_code=500, detail="Error fetching policy")

@api_router.put("/policies/{policy_id}", response_model=WebFilteringPolicy)
async def update_policy(policy_id: str, policy_update: WebFilteringPolicyUpdate):
    """Update a web filtering policy"""
    try:
        update_data = {k: v for k, v in policy_update.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        result = await db.web_filtering_policies.update_one(
            {"id": policy_id}, 
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Policy not found")
        
        updated_policy = await db.web_filtering_policies.find_one({"id": policy_id})
        return WebFilteringPolicy(**updated_policy)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating policy: {e}")
        raise HTTPException(status_code=500, detail="Error updating policy")

@api_router.delete("/policies/{policy_id}")
async def delete_policy(policy_id: str):
    """Delete a web filtering policy"""
    try:
        result = await db.web_filtering_policies.delete_one({"id": policy_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Policy not found")
        return {"message": "Policy deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting policy: {e}")
        raise HTTPException(status_code=500, detail="Error deleting policy")

# Network Topology Endpoints
@api_router.get("/network/devices", response_model=List[NetworkDevice])
async def get_network_devices():
    """Get all network devices"""
    try:
        devices = await db.network_devices.find().to_list(1000)
        return [NetworkDevice(**device) for device in devices]
    except Exception as e:
        logger.error(f"Error fetching devices: {e}")
        raise HTTPException(status_code=500, detail="Error fetching devices")

@api_router.post("/network/devices", response_model=NetworkDevice)
async def create_network_device(device: NetworkDeviceCreate):
    """Create a new network device"""
    try:
        device_obj = NetworkDevice(**device.dict())
        await db.network_devices.insert_one(device_obj.dict())
        return device_obj
    except Exception as e:
        logger.error(f"Error creating device: {e}")
        raise HTTPException(status_code=500, detail="Error creating device")

@api_router.put("/network/devices/{device_id}", response_model=NetworkDevice)
async def update_network_device(device_id: str, device_update: NetworkDeviceCreate):
    """Update a network device"""
    try:
        update_data = device_update.dict()
        result = await db.network_devices.update_one(
            {"id": device_id}, 
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Device not found")
        
        updated_device = await db.network_devices.find_one({"id": device_id})
        return NetworkDevice(**updated_device)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating device: {e}")
        raise HTTPException(status_code=500, detail="Error updating device")

@api_router.delete("/network/devices/{device_id}")
async def delete_network_device(device_id: str):
    """Delete a network device"""
    try:
        result = await db.network_devices.delete_one({"id": device_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Device not found")
        return {"message": "Device deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting device: {e}")
        raise HTTPException(status_code=500, detail="Error deleting device")

# Security Alerts Endpoints
@api_router.get("/alerts", response_model=List[SecurityAlert])
async def get_security_alerts():
    """Get all security alerts"""
    try:
        alerts = await db.security_alerts.find().sort("created_at", -1).to_list(1000)
        return [SecurityAlert(**alert) for alert in alerts]
    except Exception as e:
        logger.error(f"Error fetching alerts: {e}")
        raise HTTPException(status_code=500, detail="Error fetching alerts")

@api_router.post("/alerts", response_model=SecurityAlert)
async def create_security_alert(alert: SecurityAlertCreate):
    """Create a new security alert"""
    try:
        alert_obj = SecurityAlert(**alert.dict())
        await db.security_alerts.insert_one(alert_obj.dict())
        return alert_obj
    except Exception as e:
        logger.error(f"Error creating alert: {e}")
        raise HTTPException(status_code=500, detail="Error creating alert")

@api_router.put("/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: str):
    """Resolve a security alert"""
    try:
        result = await db.security_alerts.update_one(
            {"id": alert_id},
            {"$set": {"resolved": True, "resolved_at": datetime.utcnow()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        return {"message": "Alert resolved successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resolving alert: {e}")
        raise HTTPException(status_code=500, detail="Error resolving alert")

# Dashboard Statistics Endpoint
@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        # Count policies
        total_policies = await db.web_filtering_policies.count_documents({})
        active_policies = await db.web_filtering_policies.count_documents({"enabled": True})
        
        # Count devices
        total_devices = await db.network_devices.count_documents({})
        active_devices = await db.network_devices.count_documents({"status": "active"})
        
        # Count alerts
        total_alerts = await db.security_alerts.count_documents({})
        unresolved_alerts = await db.security_alerts.count_documents({"resolved": False})
        
        # Simulated request counts (in a real system, this would come from logs)
        blocked_requests_today = 142
        allowed_requests_today = 2891
        
        return DashboardStats(
            total_policies=total_policies,
            active_policies=active_policies,
            total_devices=total_devices,
            active_devices=active_devices,
            total_alerts=total_alerts,
            unresolved_alerts=unresolved_alerts,
            blocked_requests_today=blocked_requests_today,
            allowed_requests_today=allowed_requests_today
        )
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {e}")
        raise HTTPException(status_code=500, detail="Error fetching dashboard stats")

# Initialize Demo Data Endpoint
@api_router.post("/demo/initialize")
async def initialize_demo_data():
    """Initialize demo data for the security system"""
    try:
        # Clear existing data
        await db.web_filtering_policies.delete_many({})
        await db.network_devices.delete_many({})
        await db.security_alerts.delete_many({})
        
        # Create demo policies
        demo_policies = [
            {
                "name": "Block Social Media",
                "description": "Block access to social media sites during study hours",
                "category": "social_media",
                "action": "block",
                "domains": ["facebook.com", "instagram.com", "twitter.com", "tiktok.com"],
                "keywords": ["social", "chat", "messaging"],
                "enabled": True,
                "priority": 1
            },
            {
                "name": "Allow Educational Resources",
                "description": "Allow access to educational and research websites",
                "category": "education",
                "action": "allow",
                "domains": ["edu", "coursera.com", "khan-academy.org", "google.scholar"],
                "keywords": ["education", "learning", "research"],
                "enabled": True,
                "priority": 2
            },
            {
                "name": "Block Streaming Services",
                "description": "Block video streaming to conserve bandwidth",
                "category": "streaming",
                "action": "block",
                "domains": ["netflix.com", "youtube.com", "twitch.tv", "spotify.com"],
                "keywords": ["streaming", "video", "music"],
                "enabled": True,
                "priority": 1
            },
            {
                "name": "Block Gaming Sites",
                "description": "Block gaming websites to maintain productivity",
                "category": "gaming",
                "action": "block",
                "domains": ["steam.com", "epic.games", "roblox.com", "minecraft.net"],
                "keywords": ["gaming", "games", "play"],
                "enabled": True,
                "priority": 1
            }
        ]
        
        for policy_data in demo_policies:
            policy = WebFilteringPolicy(**policy_data)
            await db.web_filtering_policies.insert_one(policy.dict())
        
        # Create demo network devices
        demo_devices = [
            {
                "name": "ISP Router",
                "device_type": "router",
                "ip_address": "192.168.1.1",
                "location": "Network Edge",
                "description": "Main ISP connection router",
                "status": "active",
                "position": {"x": 100, "y": 50},
                "connections": ["fortigate-utm"]
            },
            {
                "name": "FortiGate UTM",
                "device_type": "utm",
                "ip_address": "192.168.1.10",
                "location": "Security Zone",
                "description": "Fortinet FortiGate UTM appliance for web filtering",
                "status": "active",
                "position": {"x": 300, "y": 50},
                "connections": ["isp-router", "core-switch"]
            },
            {
                "name": "Core Switch",
                "device_type": "switch",
                "ip_address": "192.168.1.20",
                "location": "Network Core",
                "description": "Main campus network switch",
                "status": "active",
                "position": {"x": 500, "y": 50},
                "connections": ["fortigate-utm", "student-devices"]
            },
            {
                "name": "Student Devices",
                "device_type": "student_device",
                "ip_address": "192.168.100.0/24",
                "location": "Campus Network",
                "description": "Student laptops and devices",
                "status": "active",
                "position": {"x": 700, "y": 50},
                "connections": ["core-switch"]
            }
        ]
        
        for device_data in demo_devices:
            device = NetworkDevice(**device_data)
            await db.network_devices.insert_one(device.dict())
        
        # Create demo security alerts
        demo_alerts = [
            {
                "title": "Blocked Social Media Access",
                "description": "Student attempted to access Facebook during study hours",
                "severity": "medium",
                "source_ip": "192.168.100.45",
                "destination": "facebook.com",
                "policy_triggered": "Block Social Media",
                "device_id": "fortigate-utm",
                "resolved": False
            },
            {
                "title": "Malware Detection",
                "description": "Potential malware detected from suspicious domain",
                "severity": "high",
                "source_ip": "192.168.100.23",
                "destination": "suspicious-site.com",
                "policy_triggered": "Block Malware",
                "device_id": "fortigate-utm",
                "resolved": False
            },
            {
                "title": "Bandwidth Threshold Exceeded",
                "description": "High bandwidth usage detected from streaming",
                "severity": "low",
                "source_ip": "192.168.100.67",
                "destination": "netflix.com",
                "policy_triggered": "Block Streaming Services",
                "device_id": "fortigate-utm",
                "resolved": True
            }
        ]
        
        for alert_data in demo_alerts:
            alert = SecurityAlert(**alert_data)
            await db.security_alerts.insert_one(alert.dict())
        
        return {"message": "Demo data initialized successfully"}
    except Exception as e:
        logger.error(f"Error initializing demo data: {e}")
        raise HTTPException(status_code=500, detail="Error initializing demo data")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()