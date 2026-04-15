"""
Cosmetics & Gem Currency System for Wasteland Zero
Handles premium currency, cosmetic items, and purchases
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone

router = APIRouter(prefix="/api/cosmetics", tags=["cosmetics"])

# Cosmetic Items Catalog
COSMETIC_ITEMS = {
    # Character Skins (Pure Cosmetic)
    "skin_vault_dweller": {
        "name": "Vault Dweller",
        "description": "Classic vault jumpsuit appearance",
        "type": "character_skin",
        "price_gems": 150,
        "rarity": "common",
        "bonus": None
    },
    "skin_raider": {
        "name": "Raider Lord",
        "description": "Intimidating raider armor",
        "type": "character_skin",
        "price_gems": 200,
        "rarity": "uncommon",
        "bonus": None
    },
    "skin_ghoul": {
        "name": "Ghoulish Horror",
        "description": "Radiation-scarred survivor",
        "type": "character_skin",
        "price_gems": 250,
        "rarity": "rare",
        "bonus": None
    },
    
    # Dice Skins (Pure Cosmetic)
    "dice_metal": {
        "name": "Scrap Metal Dice",
        "description": "Worn metal dice from the wasteland",
        "type": "dice_skin",
        "price_gems": 100,
        "rarity": "common",
        "bonus": None
    },
    "dice_neon": {
        "name": "Neon Glow Dice",
        "description": "Glowing neon dice",
        "type": "dice_skin",
        "price_gems": 150,
        "rarity": "uncommon",
        "bonus": None
    },
    "dice_crystal": {
        "name": "Crystal Dice",
        "description": "Pristine crystal dice",
        "type": "dice_skin",
        "price_gems": 200,
        "rarity": "rare",
        "bonus": None
    },
    
    # UI Themes (Pure Cosmetic)
    "theme_dark": {
        "name": "Void Dark Theme",
        "description": "Pure black UI theme",
        "type": "ui_theme",
        "price_gems": 100,
        "rarity": "common",
        "bonus": None
    },
    "theme_neon": {
        "name": "Neon Nights Theme",
        "description": "Vibrant neon UI",
        "type": "ui_theme",
        "price_gems": 150,
        "rarity": "uncommon",
        "bonus": None
    },
    
    # Legendary Items (Small Stat Bonuses - Max +10%)
    "legendary_golden_dice": {
        "name": "Golden Fortune Dice",
        "description": "Legendary dice that brings fortune",
        "type": "dice_skin",
        "price_gems": 500,
        "rarity": "legendary",
        "bonus": {"xp_multiplier": 1.05, "caps_multiplier": 1.05}  # +5% XP and Caps
    },
    "legendary_phoenix_armor": {
        "name": "Phoenix Rebirth Armor",
        "description": "Rise from the ashes stronger",
        "type": "character_skin",
        "price_gems": 600,
        "rarity": "legendary",
        "bonus": {"max_hp": 15, "revival_chance": 0.05}  # +15 HP, 5% revival chance
    },
    "legendary_rift_sight": {
        "name": "Rift Sight Goggles",
        "description": "See through reality itself",
        "type": "accessory",
        "price_gems": 700,
        "rarity": "legendary",
        "bonus": {"rift_preview": 2, "rift_luck": 1.1}  # See 2 extra outcomes, 10% better rift rewards
    },
    
    # Death Animations
    "death_anim_fade": {
        "name": "Fade to Black",
        "description": "Elegant death animation",
        "type": "death_animation",
        "price_gems": 80,
        "rarity": "common",
        "bonus": None
    },
    "death_anim_explosion": {
        "name": "Atomic Explosion",
        "description": "Go out with a bang",
        "type": "death_animation",
        "price_gems": 120,
        "rarity": "uncommon",
        "bonus": None
    },
    
    # Victory Poses
    "victory_pose_default": {
        "name": "Wasteland Salute",
        "description": "Classic victory pose",
        "type": "victory_pose",
        "price_gems": 100,
        "rarity": "common",
        "bonus": None
    },
    "victory_pose_epic": {
        "name": "Legendary Stance",
        "description": "Epic hero pose",
        "type": "victory_pose",
        "price_gems": 180,
        "rarity": "rare",
        "bonus": None
    }
}

# Gem Packages (IAP)
GEM_PACKAGES = {
    "starter_deal": {
        "name": "Starter Pack",
        "gems": 100,
        "price_usd": 0.99,
        "bonus_gems": 20,  # First purchase only
        "special": "first_purchase"
    },
    "small_pack": {
        "name": "Small Gem Pack",
        "gems": 100,
        "price_usd": 4.99,
        "bonus_gems": 0
    },
    "medium_pack": {
        "name": "Medium Gem Pack",
        "gems": 500,
        "price_usd": 19.99,
        "bonus_gems": 50
    },
    "large_pack": {
        "name": "Large Gem Pack",
        "gems": 1200,
        "price_usd": 39.99,
        "bonus_gems": 200
    },
    "mega_pack": {
        "name": "Mega Gem Pack",
        "gems": 2500,
        "price_usd": 74.99,
        "bonus_gems": 500
    }
}

# Ways to Earn Free Gems
GEM_EARNING = {
    "daily_login": 5,           # Daily login bonus
    "prestige": 10,             # Per prestige
    "boss_kill": 3,             # Per boss killed
    "rift_complete": 1,         # Per Reality Rift completed
    "watch_ad": 5,              # Per ad watched (max 10/day)
    "achievement": 10,          # Special achievements
    "leaderboard_top10": 50     # Weekly leaderboard reward
}

class PlayerCosmeticsData(BaseModel):
    player_id: str
    total_gems: int = 0
    gems_spent: int = 0
    owned_cosmetics: List[str] = []
    equipped_cosmetics: Dict[str, str] = {}  # {type: item_id}
    first_purchase_claimed: bool = False
    ads_watched_today: int = 0
    last_ad_date: Optional[str] = None
    last_daily_login: Optional[str] = None

class GemPurchase(BaseModel):
    player_id: str
    package_id: str
    transaction_id: str

class CosmeticPurchase(BaseModel):
    player_id: str
    item_id: str

class GemEarning(BaseModel):
    player_id: str
    source: str  # "daily_login", "prestige", "ad", etc.

@router.get("/catalog")
async def get_cosmetics_catalog():
    """Get all available cosmetic items"""
    return {
        "items": COSMETIC_ITEMS,
        "gem_packages": GEM_PACKAGES,
        "earning_methods": GEM_EARNING
    }

@router.get("/player-data")
async def get_player_cosmetics(player_id: str = "default"):
    """Get player's cosmetics data"""
    try:
        mongo_url = os.environ.get('MONGO_URL')
        client = AsyncIOMotorClient(mongo_url)
        db = client[os.environ.get('DB_NAME')]
        
        data = await db.cosmetics.find_one({"player_id": player_id}, {"_id": 0})
        
        if not data:
            data = {
                "player_id": player_id,
                "total_gems": 0,
                "gems_spent": 0,
                "owned_cosmetics": [],
                "equipped_cosmetics": {},
                "first_purchase_claimed": False,
                "ads_watched_today": 0,
                "last_ad_date": None,
                "last_daily_login": None
            }
            await db.cosmetics.insert_one(data.copy())
        
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/purchase-gems")
async def purchase_gems(purchase: GemPurchase):
    """Purchase gem package (IAP)"""
    try:
        mongo_url = os.environ.get('MONGO_URL')
        client = AsyncIOMotorClient(mongo_url)
        db = client[os.environ.get('DB_NAME')]
        
        # Get player data
        player_data = await db.cosmetics.find_one({"player_id": purchase.player_id}, {"_id": 0})
        if not player_data:
            player_data = PlayerCosmeticsData(player_id=purchase.player_id).dict()
        
        # Get package info
        package = GEM_PACKAGES.get(purchase.package_id)
        if not package:
            raise HTTPException(status_code=404, detail="Package not found")
        
        # Calculate gems to award
        gems_awarded = package["gems"]
        
        # First purchase bonus
        if not player_data["first_purchase_claimed"] and package.get("special") == "first_purchase":
            gems_awarded += package.get("bonus_gems", 0) * 2  # Double bonus for first purchase
            player_data["first_purchase_claimed"] = True
        else:
            gems_awarded += package.get("bonus_gems", 0)
        
        # Award gems
        player_data["total_gems"] += gems_awarded
        
        # Save
        await db.cosmetics.update_one(
            {"player_id": purchase.player_id},
            {"$set": player_data},
            upsert=True
        )
        
        # Log transaction
        await db.gem_transactions.insert_one({
            "player_id": purchase.player_id,
            "type": "purchase",
            "package_id": purchase.package_id,
            "transaction_id": purchase.transaction_id,
            "gems_awarded": gems_awarded,
            "date": datetime.now(timezone.utc).isoformat()
        })
        
        return {
            "success": True,
            "gems_awarded": gems_awarded,
            "total_gems": player_data["total_gems"],
            "first_purchase_bonus": not player_data.get("first_purchase_claimed", True)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/purchase-cosmetic")
async def purchase_cosmetic(purchase: CosmeticPurchase):
    """Purchase cosmetic item with gems"""
    try:
        mongo_url = os.environ.get('MONGO_URL')
        client = AsyncIOMotorClient(mongo_url)
        db = client[os.environ.get('DB_NAME')]
        
        # Get player data
        player_data = await db.cosmetics.find_one({"player_id": purchase.player_id}, {"_id": 0})
        if not player_data:
            raise HTTPException(status_code=404, detail="Player data not found")
        
        # Get item info
        item = COSMETIC_ITEMS.get(purchase.item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        # Check if already owned
        if purchase.item_id in player_data.get("owned_cosmetics", []):
            raise HTTPException(status_code=400, detail="Item already owned")
        
        # Check if enough gems
        if player_data["total_gems"] < item["price_gems"]:
            raise HTTPException(status_code=400, detail="Not enough gems")
        
        # Purchase item
        player_data["total_gems"] -= item["price_gems"]
        player_data["gems_spent"] += item["price_gems"]
        player_data.setdefault("owned_cosmetics", []).append(purchase.item_id)
        
        # Auto-equip if first of type
        item_type = item["type"]
        if item_type not in player_data.get("equipped_cosmetics", {}):
            player_data.setdefault("equipped_cosmetics", {})[item_type] = purchase.item_id
        
        # Save
        await db.cosmetics.update_one(
            {"player_id": purchase.player_id},
            {"$set": player_data}
        )
        
        return {
            "success": True,
            "item_purchased": purchase.item_id,
            "remaining_gems": player_data["total_gems"],
            "bonus": item.get("bonus")
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/earn-gems")
async def earn_gems(earning: GemEarning):
    """Award gems for gameplay actions"""
    try:
        mongo_url = os.environ.get('MONGO_URL')
        client = AsyncIOMotorClient(mongo_url)
        db = client[os.environ.get('DB_NAME')]
        
        # Get player data
        player_data = await db.cosmetics.find_one({"player_id": earning.player_id}, {"_id": 0})
        if not player_data:
            player_data = PlayerCosmeticsData(player_id=earning.player_id).dict()
        
        # Calculate gems to award
        gems_earned = GEM_EARNING.get(earning.source, 0)
        
        if gems_earned == 0:
            raise HTTPException(status_code=400, detail="Invalid earning source")
        
        # Special handling for daily login
        if earning.source == "daily_login":
            today = datetime.now(timezone.utc).date().isoformat()
            if player_data.get("last_daily_login") == today:
                return {"success": False, "message": "Already claimed today"}
            player_data["last_daily_login"] = today
        
        # Special handling for ads
        if earning.source == "watch_ad":
            today = datetime.now(timezone.utc).date().isoformat()
            if player_data.get("last_ad_date") != today:
                player_data["ads_watched_today"] = 0
                player_data["last_ad_date"] = today
            
            if player_data["ads_watched_today"] >= 10:
                return {"success": False, "message": "Daily ad limit reached (10/day)"}
            
            player_data["ads_watched_today"] += 1
        
        # Award gems
        player_data["total_gems"] += gems_earned
        
        # Save
        await db.cosmetics.update_one(
            {"player_id": earning.player_id},
            {"$set": player_data},
            upsert=True
        )
        
        return {
            "success": True,
            "gems_earned": gems_earned,
            "total_gems": player_data["total_gems"],
            "source": earning.source
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/equip")
async def equip_cosmetic(player_id: str, item_id: str):
    """Equip a cosmetic item"""
    try:
        mongo_url = os.environ.get('MONGO_URL')
        client = AsyncIOMotorClient(mongo_url)
        db = client[os.environ.get('DB_NAME')]
        
        # Get player data
        player_data = await db.cosmetics.find_one({"player_id": player_id}, {"_id": 0})
        if not player_data:
            raise HTTPException(status_code=404, detail="Player data not found")
        
        # Check if owned
        if item_id not in player_data.get("owned_cosmetics", []):
            raise HTTPException(status_code=400, detail="Item not owned")
        
        # Get item info
        item = COSMETIC_ITEMS.get(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        # Equip
        player_data.setdefault("equipped_cosmetics", {})[item["type"]] = item_id
        
        # Save
        await db.cosmetics.update_one(
            {"player_id": player_id},
            {"$set": {"equipped_cosmetics": player_data["equipped_cosmetics"]}}
        )
        
        return {
            "success": True,
            "equipped": item_id,
            "type": item["type"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/active-bonuses")
async def get_active_cosmetic_bonuses(player_id: str = "default"):
    """Get all active bonuses from equipped cosmetics"""
    try:
        mongo_url = os.environ.get('MONGO_URL')
        client = AsyncIOMotorClient(mongo_url)
        db = client[os.environ.get('DB_NAME')]
        
        player_data = await db.cosmetics.find_one({"player_id": player_id}, {"_id": 0})
        if not player_data:
            return {"bonuses": {}}
        
        # Aggregate bonuses from equipped items
        total_bonuses = {}
        
        for item_type, item_id in player_data.get("equipped_cosmetics", {}).items():
            item = COSMETIC_ITEMS.get(item_id)
            if item and item.get("bonus"):
                for key, value in item["bonus"].items():
                    if key in total_bonuses:
                        if isinstance(value, (int, float)):
                            total_bonuses[key] += value
                        else:
                            total_bonuses[key] = value
                    else:
                        total_bonuses[key] = value
        
        return {
            "equipped_items": player_data.get("equipped_cosmetics", {}),
            "bonuses": total_bonuses
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
