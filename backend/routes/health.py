from fastapi import APIRouter
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api", tags=["health"])

@router.get("/health")
async def health_check():
    """
    Health check endpoint for uptime monitoring.
    Checks MongoDB connection and returns service status.
    """
    try:
        # Check MongoDB connection
        mongo_url = os.environ.get('MONGO_URL')
        client = AsyncIOMotorClient(mongo_url)
        db = client[os.environ.get('DB_NAME')]
        
        # Ping MongoDB
        await db.command('ping')
        
        return {
            "status": "healthy",
            "services": {
                "api": "up",
                "database": "up"
            }
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "services": {
                "api": "up",
                "database": "down"
            },
            "error": str(e)
        }
