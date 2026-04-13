from fastapi import APIRouter, HTTPException, Header
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api", tags=["admin"])

@router.get("/admin/stats")
async def get_admin_stats(authorization: str = Header(None)):
    """
    Admin stats endpoint - requires password authentication.
    Returns newsletter count, leaderboard count, and top players.
    """
    # Simple password check
    admin_password = os.environ.get('ADMIN_PASSWORD', 'wasteland2025')
    
    if not authorization or authorization != f"Bearer {admin_password}":
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        mongo_url = os.environ.get('MONGO_URL')
        client = AsyncIOMotorClient(mongo_url)
        db = client[os.environ.get('DB_NAME')]
        
        # Get newsletter count
        newsletter_count = await db.newsletter.count_documents({})
        
        # Get leaderboard count
        leaderboard_count = await db.leaderboard.count_documents({})
        
        # Get top 10 players by XP
        top_players = await db.leaderboard.find(
            {}, 
            {"_id": 0}
        ).sort("xp", -1).limit(10).to_list(10)
        
        return {
            "newsletter_subscribers": newsletter_count,
            "leaderboard_entries": leaderboard_count,
            "top_players": top_players
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
