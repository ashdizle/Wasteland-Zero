"""
Leaderboard API for Wasteland Zero
Tracks top players by XP, caps, rifts discovered, and deepest level
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]


class LeaderboardEntry(BaseModel):
    player_name: str = Field(..., min_length=1, max_length=30)
    total_xp: int = Field(default=0, ge=0)
    caps_earned: int = Field(default=0, ge=0)
    rifts_discovered: int = Field(default=0, ge=0)
    deepest_level: int = Field(default=1, ge=1)
    archetype: Optional[str] = None
    race: Optional[str] = None
    territory: Optional[str] = None
    bosses_killed: int = Field(default=0, ge=0)


class LeaderboardSubmission(BaseModel):
    player_name: str = Field(..., min_length=1, max_length=30)
    total_xp: int = Field(default=0, ge=0)
    caps_earned: int = Field(default=0, ge=0)
    rifts_discovered: int = Field(default=0, ge=0)
    deepest_level: int = Field(default=1, ge=1)
    archetype: Optional[str] = None
    race: Optional[str] = None
    territory: Optional[str] = None
    bosses_killed: int = Field(default=0, ge=0)


@router.post("/submit")
async def submit_score(entry: LeaderboardSubmission):
    """Submit a player's score to the leaderboard"""
    
    try:
        # Check if player already exists
        existing = await db.leaderboard.find_one(
            {"player_name": entry.player_name},
            {"_id": 0}
        )
        
        # Only update if new score is higher
        if existing:
            if entry.total_xp > existing.get('total_xp', 0):
                await db.leaderboard.update_one(
                    {"player_name": entry.player_name},
                    {
                        "$set": {
                            **entry.model_dump(),
                            "updated_at": datetime.now(timezone.utc).isoformat()
                        }
                    }
                )
                return {
                    "success": True,
                    "message": "New high score recorded!",
                    "rank": await get_player_rank(entry.player_name)
                }
            else:
                return {
                    "success": True,
                    "message": "Score submitted, but not a new record",
                    "rank": await get_player_rank(entry.player_name)
                }
        else:
            # New player
            await db.leaderboard.insert_one({
                **entry.model_dump(),
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            })
            return {
                "success": True,
                "message": "Score recorded!",
                "rank": await get_player_rank(entry.player_name)
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/top")
async def get_top_players(
    limit: int = 10,
    sort_by: str = "total_xp"
):
    """Get top players from the leaderboard"""
    
    valid_sorts = ["total_xp", "caps_earned", "rifts_discovered", "deepest_level", "bosses_killed"]
    if sort_by not in valid_sorts:
        raise HTTPException(status_code=400, detail=f"Invalid sort_by. Use one of: {valid_sorts}")
    
    try:
        players = await db.leaderboard.find(
            {},
            {"_id": 0}
        ).sort(sort_by, -1).limit(min(limit, 100)).to_list(length=None)
        
        return {
            "success": True,
            "sort_by": sort_by,
            "players": players
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/player/{player_name}")
async def get_player_stats(player_name: str):
    """Get a specific player's stats and rank"""
    
    try:
        player = await db.leaderboard.find_one(
            {"player_name": player_name},
            {"_id": 0}
        )
        
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")
        
        rank = await get_player_rank(player_name)
        
        return {
            "success": True,
            "player": player,
            "rank": rank
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_player_rank(player_name: str) -> int:
    """Helper function to get a player's rank"""
    player = await db.leaderboard.find_one({"player_name": player_name}, {"_id": 0})
    if not player:
        return -1
    
    # Count how many players have higher XP
    higher_count = await db.leaderboard.count_documents({
        "total_xp": {"$gt": player.get("total_xp", 0)}
    })
    
    return higher_count + 1
