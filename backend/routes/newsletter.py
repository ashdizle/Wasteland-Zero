"""
Newsletter API for Wasteland Zero
Collects email subscribers for future marketing campaigns
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field
from typing import List
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api/newsletter", tags=["newsletter"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]


class SubscribeRequest(BaseModel):
    email: EmailStr
    source: str = Field(default="game_title_screen")  # Track where signup came from


class SubscriberResponse(BaseModel):
    email: str
    subscribed_at: str
    source: str


@router.post("/subscribe")
async def subscribe(request: SubscribeRequest, http_request: Request):
    """Subscribe an email to the newsletter"""
    
    try:
        # Check if email already exists
        existing = await db.newsletter_subscribers.find_one(
            {"email": request.email.lower()},
            {"_id": 0}
        )
        
        if existing:
            return {
                "success": True,
                "message": "You're already subscribed!",
                "already_subscribed": True
            }
        
        # Add new subscriber
        subscriber_data = {
            "email": request.email.lower(),
            "source": request.source,
            "subscribed_at": datetime.now(timezone.utc).isoformat(),
            "ip_address": http_request.client.host if http_request.client else None
        }
        
        await db.newsletter_subscribers.insert_one(subscriber_data)
        
        return {
            "success": True,
            "message": "Successfully subscribed!",
            "already_subscribed": False
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/count")
async def get_subscriber_count():
    """Get total number of subscribers"""
    
    try:
        count = await db.newsletter_subscribers.count_documents({})
        return {
            "success": True,
            "total_subscribers": count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export")
async def export_subscribers():
    """Export all subscriber emails (for admin use)"""
    
    try:
        subscribers = await db.newsletter_subscribers.find(
            {},
            {"_id": 0}
        ).sort("subscribed_at", -1).to_list(length=None)
        
        return {
            "success": True,
            "total": len(subscribers),
            "subscribers": subscribers
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/unsubscribe")
async def unsubscribe(email: EmailStr):
    """Unsubscribe an email from the newsletter"""
    
    try:
        result = await db.newsletter_subscribers.delete_one(
            {"email": email.lower()}
        )
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Email not found")
        
        return {
            "success": True,
            "message": "Successfully unsubscribed"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
