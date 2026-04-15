"""
Prestige/Rebirth System for Wasteland Zero
Handles prestige levels, mastery points, and class mastery upgrades
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone

router = APIRouter(prefix="/api/prestige", tags=["prestige"])

# Mastery Points earned per prestige (scales with level)
def calculate_mastery_points(prestige_level: int, max_level_reached: int, bosses_killed: int) -> int:
    """Calculate mastery points earned based on performance"""
    base_points = 10  # Base points per prestige
    level_bonus = max_level_reached * 2  # 2 points per level
    boss_bonus = bosses_killed * 5  # 5 points per boss
    prestige_multiplier = 1 + (prestige_level * 0.1)  # 10% more per prestige
    
    total = int((base_points + level_bonus + boss_bonus) * prestige_multiplier)
    return max(total, 10)  # Minimum 10 points

# Universal Mastery Upgrades (available to all classes)
UNIVERSAL_MASTERIES = {
    "health_boost_1": {
        "name": "Wasteland Survivor I",
        "description": "+10 Max HP",
        "cost": 5,
        "bonus": {"max_hp": 10}
    },
    "health_boost_2": {
        "name": "Wasteland Survivor II",
        "description": "+20 Max HP",
        "cost": 10,
        "requires": "health_boost_1",
        "bonus": {"max_hp": 20}
    },
    "health_boost_3": {
        "name": "Wasteland Survivor III",
        "description": "+30 Max HP",
        "cost": 15,
        "requires": "health_boost_2",
        "bonus": {"max_hp": 30}
    },
    "xp_boost_1": {
        "name": "Quick Learner I",
        "description": "+10% XP gain",
        "cost": 8,
        "bonus": {"xp_multiplier": 1.1}
    },
    "xp_boost_2": {
        "name": "Quick Learner II",
        "description": "+20% XP gain",
        "cost": 15,
        "requires": "xp_boost_1",
        "bonus": {"xp_multiplier": 1.2}
    },
    "caps_boost_1": {
        "name": "Scavenger I",
        "description": "+15% Caps found",
        "cost": 8,
        "bonus": {"caps_multiplier": 1.15}
    },
    "caps_boost_2": {
        "name": "Scavenger II",
        "description": "+30% Caps found",
        "cost": 15,
        "requires": "caps_boost_1",
        "bonus": {"caps_multiplier": 1.3}
    },
    "crit_boost_1": {
        "name": "Lucky Strike I",
        "description": "+3% Critical Chance",
        "cost": 10,
        "bonus": {"crit_chance": 3}
    },
    "crit_boost_2": {
        "name": "Lucky Strike II",
        "description": "+5% Critical Chance",
        "cost": 20,
        "requires": "crit_boost_1",
        "bonus": {"crit_chance": 5}
    },
    "starting_caps": {
        "name": "Prepared Wasteland",
        "description": "Start each run with 100 Caps",
        "cost": 12,
        "bonus": {"starting_caps": 100}
    },
    "vendor_discount": {
        "name": "Master Negotiator",
        "description": "20% discount at vendors",
        "cost": 15,
        "bonus": {"vendor_discount": 0.2}
    },
    "rift_insight": {
        "name": "Rift Insight",
        "description": "See one extra Reality Rift outcome",
        "cost": 20,
        "bonus": {"rift_preview": 1}
    }
}

# Class-Specific Masteries
CLASS_MASTERIES = {
    "warrior": {
        "warrior_armor": {
            "name": "Iron Skin",
            "description": "+2 Armor",
            "cost": 10,
            "bonus": {"armor": 2}
        },
        "warrior_damage": {
            "name": "Brutal Force",
            "description": "+15% melee damage",
            "cost": 12,
            "bonus": {"melee_damage": 1.15}
        },
        "warrior_rage": {
            "name": "Unstoppable Rage",
            "description": "Gain +2 damage per kill (stacks to 10)",
            "cost": 25,
            "bonus": {"rage_stacks": True}
        }
    },
    "ranger": {
        "ranger_accuracy": {
            "name": "Deadeye",
            "description": "+10% hit chance with ranged weapons",
            "cost": 10,
            "bonus": {"ranged_accuracy": 10}
        },
        "ranger_ammo": {
            "name": "Ammo Conservation",
            "description": "25% chance to not consume ammo",
            "cost": 12,
            "bonus": {"ammo_save_chance": 0.25}
        },
        "ranger_multishot": {
            "name": "Multishot",
            "description": "10% chance to fire 2 shots at once",
            "cost": 25,
            "bonus": {"multishot_chance": 0.1}
        }
    },
    "scavenger": {
        "scavenger_loot": {
            "name": "Expert Looter",
            "description": "+1 item from loot drops",
            "cost": 10,
            "bonus": {"bonus_loot": 1}
        },
        "scavenger_healing": {
            "name": "Field Medic",
            "description": "Stimpaks heal 50% more",
            "cost": 12,
            "bonus": {"stimpak_bonus": 1.5}
        },
        "scavenger_luck": {
            "name": "Fortune Favored",
            "description": "Double chance for rare items",
            "cost": 25,
            "bonus": {"rare_item_chance": 2.0}
        }
    },
    "psyker": {
        "psyker_energy": {
            "name": "Mental Fortitude",
            "description": "+10 Max Energy",
            "cost": 10,
            "bonus": {"max_energy": 10}
        },
        "psyker_power": {
            "name": "Amplified Mind",
            "description": "+20% psionic damage",
            "cost": 12,
            "bonus": {"psionic_damage": 1.2}
        },
        "psyker_control": {
            "name": "Perfect Control",
            "description": "Psionic abilities cost 20% less energy",
            "cost": 25,
            "bonus": {"energy_cost_reduction": 0.2}
        }
    }
}

# Legendary Weapon Unlocks (one per prestige)
LEGENDARY_UNLOCKS = [
    {"name": "Wasteland Reaper", "type": "melee", "damage": "2d10+5", "special": "Lifesteal 10%"},
    {"name": "Plasma Annihilator", "type": "ranged", "damage": "3d8+3", "special": "Ignores armor"},
    {"name": "Rift Blade", "type": "melee", "damage": "2d12", "special": "10% chance to banish enemy"},
    {"name": "Atom Splitter", "type": "ranged", "damage": "4d6+4", "special": "AOE damage"},
    {"name": "Void Scythe", "type": "melee", "damage": "3d10", "special": "Drain enemy energy"},
    {"name": "Reality Breaker", "type": "ranged", "damage": "5d6", "special": "Piercing shots"},
    {"name": "Chaos Hammer", "type": "melee", "damage": "4d8+2", "special": "Stun on crit"},
    {"name": "Dimensional Rifle", "type": "ranged", "damage": "3d10+2", "special": "No ammo cost"},
    {"name": "Apocalypse Edge", "type": "melee", "damage": "5d8", "special": "Execute below 20% HP"},
    {"name": "Omega Cannon", "type": "ranged", "damage": "6d8", "special": "Charge shot mechanic"}
]

class PrestigeData(BaseModel):
    player_id: Optional[str] = None
    prestige_level: int = 0
    total_mastery_points: int = 0
    spent_mastery_points: int = 0
    unlocked_masteries: List[str] = []
    unlocked_legendaries: List[str] = []
    total_prestiges: int = 0
    last_prestige_date: Optional[str] = None

class PrestigeRequest(BaseModel):
    player_id: Optional[str] = None
    max_level_reached: int
    bosses_killed: int
    xp_earned: int

class MasteryPurchase(BaseModel):
    player_id: Optional[str] = None
    mastery_id: str
    mastery_type: str  # "universal" or class name

@router.get("/data")
async def get_prestige_data(player_id: str = "default"):
    """Get player's prestige data"""
    try:
        mongo_url = os.environ.get('MONGO_URL')
        client = AsyncIOMotorClient(mongo_url)
        db = client[os.environ.get('DB_NAME')]
        
        prestige = await db.prestige.find_one({"player_id": player_id}, {"_id": 0})
        
        if not prestige:
            # Create default prestige data
            prestige = {
                "player_id": player_id,
                "prestige_level": 0,
                "total_mastery_points": 0,
                "spent_mastery_points": 0,
                "unlocked_masteries": [],
                "unlocked_legendaries": [],
                "total_prestiges": 0,
                "last_prestige_date": None
            }
            await db.prestige.insert_one(prestige.copy())
            prestige.pop("_id", None)
        
        return prestige
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/rebirth")
async def perform_rebirth(request: PrestigeRequest):
    """Perform rebirth/prestige - resets character, awards mastery points"""
    try:
        mongo_url = os.environ.get('MONGO_URL')
        client = AsyncIOMotorClient(mongo_url)
        db = client[os.environ.get('DB_NAME')]
        
        player_id = request.player_id or "default"
        
        # Get current prestige data
        prestige = await db.prestige.find_one({"player_id": player_id}, {"_id": 0})
        if not prestige:
            prestige = {
                "player_id": player_id,
                "prestige_level": 0,
                "total_mastery_points": 0,
                "spent_mastery_points": 0,
                "unlocked_masteries": [],
                "unlocked_legendaries": [],
                "total_prestiges": 0
            }
        
        # Calculate mastery points earned
        mastery_earned = calculate_mastery_points(
            prestige["prestige_level"],
            request.max_level_reached,
            request.bosses_killed
        )
        
        # Unlock legendary weapon
        new_legendary = None
        if prestige["prestige_level"] < len(LEGENDARY_UNLOCKS):
            new_legendary = LEGENDARY_UNLOCKS[prestige["prestige_level"]]
            prestige["unlocked_legendaries"].append(new_legendary["name"])
        
        # Update prestige
        prestige["prestige_level"] += 1
        prestige["total_mastery_points"] += mastery_earned
        prestige["total_prestiges"] += 1
        prestige["last_prestige_date"] = datetime.now(timezone.utc).isoformat()
        
        # Save to database
        await db.prestige.update_one(
            {"player_id": player_id},
            {"$set": prestige},
            upsert=True
        )
        
        return {
            "success": True,
            "new_prestige_level": prestige["prestige_level"],
            "mastery_points_earned": mastery_earned,
            "total_mastery_points": prestige["total_mastery_points"],
            "available_points": prestige["total_mastery_points"] - prestige["spent_mastery_points"],
            "legendary_unlocked": new_legendary,
            "message": f"Reborn as Prestige {prestige['prestige_level']}! Earned {mastery_earned} Mastery Points."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/masteries")
async def get_available_masteries(player_class: str):
    """Get available mastery upgrades for a class"""
    try:
        universal = UNIVERSAL_MASTERIES
        class_specific = CLASS_MASTERIES.get(player_class.lower(), {})
        
        return {
            "universal": universal,
            "class_specific": class_specific
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/purchase-mastery")
async def purchase_mastery(purchase: MasteryPurchase):
    """Purchase a mastery upgrade"""
    try:
        mongo_url = os.environ.get('MONGO_URL')
        client = AsyncIOMotorClient(mongo_url)
        db = client[os.environ.get('DB_NAME')]
        
        player_id = purchase.player_id or "default"
        
        # Get prestige data
        prestige = await db.prestige.find_one({"player_id": player_id}, {"_id": 0})
        if not prestige:
            raise HTTPException(status_code=404, detail="Prestige data not found")
        
        # Get mastery info
        if purchase.mastery_type == "universal":
            mastery = UNIVERSAL_MASTERIES.get(purchase.mastery_id)
        else:
            mastery = CLASS_MASTERIES.get(purchase.mastery_type, {}).get(purchase.mastery_id)
        
        if not mastery:
            raise HTTPException(status_code=404, detail="Mastery not found")
        
        # Check if already unlocked
        if purchase.mastery_id in prestige["unlocked_masteries"]:
            raise HTTPException(status_code=400, detail="Mastery already unlocked")
        
        # Check if has enough points
        available_points = prestige["total_mastery_points"] - prestige["spent_mastery_points"]
        if available_points < mastery["cost"]:
            raise HTTPException(status_code=400, detail="Not enough mastery points")
        
        # Check requirements
        if "requires" in mastery:
            if mastery["requires"] not in prestige["unlocked_masteries"]:
                raise HTTPException(status_code=400, detail=f"Requires {mastery['requires']} first")
        
        # Purchase mastery
        prestige["unlocked_masteries"].append(purchase.mastery_id)
        prestige["spent_mastery_points"] += mastery["cost"]
        
        # Save
        await db.prestige.update_one(
            {"player_id": player_id},
            {"$set": prestige}
        )
        
        return {
            "success": True,
            "mastery_unlocked": purchase.mastery_id,
            "remaining_points": prestige["total_mastery_points"] - prestige["spent_mastery_points"],
            "bonus": mastery["bonus"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/bonuses")
async def get_active_bonuses(player_id: str = "default"):
    """Calculate all active bonuses from unlocked masteries"""
    try:
        mongo_url = os.environ.get('MONGO_URL')
        client = AsyncIOMotorClient(mongo_url)
        db = client[os.environ.get('DB_NAME')]
        
        prestige = await db.prestige.find_one({"player_id": player_id}, {"_id": 0})
        if not prestige:
            return {"bonuses": {}}
        
        # Aggregate all bonuses
        total_bonuses = {}
        
        for mastery_id in prestige["unlocked_masteries"]:
            # Check universal
            if mastery_id in UNIVERSAL_MASTERIES:
                bonus = UNIVERSAL_MASTERIES[mastery_id]["bonus"]
            else:
                # Check class masteries
                found = False
                for class_name, class_masteries in CLASS_MASTERIES.items():
                    if mastery_id in class_masteries:
                        bonus = class_masteries[mastery_id]["bonus"]
                        found = True
                        break
                if not found:
                    continue
            
            # Add bonuses
            for key, value in bonus.items():
                if key in total_bonuses:
                    if isinstance(value, (int, float)):
                        total_bonuses[key] += value
                    else:
                        total_bonuses[key] = value
                else:
                    total_bonuses[key] = value
        
        return {
            "prestige_level": prestige["prestige_level"],
            "bonuses": total_bonuses,
            "unlocked_legendaries": prestige["unlocked_legendaries"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
