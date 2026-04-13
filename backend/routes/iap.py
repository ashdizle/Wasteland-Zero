from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import httpx
import base64
import json

router = APIRouter(prefix="/api/iap", tags=["iap"])

class IAPReceipt(BaseModel):
    receipt_data: str
    product_id: str
    transaction_id: str

class IAPVerifyResponse(BaseModel):
    success: bool
    product_id: str
    message: str

# Apple IAP Product IDs (must match App Store Connect)
PRODUCTS = {
    "com.wastelandzero.app.radiation_pack": {
        "name": "Radiation Pack",
        "price": 4.99,
        "caps": 0,
        "items": {"rad_protection": 250, "radaway": 5}
    },
    "com.wastelandzero.app.survival_kit": {
        "name": "Survival Kit",
        "price": 9.99,
        "caps": 1000,
        "items": {"stimpak": 10, "ammo": 500}
    },
    "com.wastelandzero.app.boss_slayer": {
        "name": "Boss Slayer Bundle",
        "price": 14.99,
        "caps": 2000,
        "items": {"legendary_weapon": 1, "boss_tracker": 1}
    },
    "com.wastelandzero.app.ultimate_pack": {
        "name": "Ultimate Wasteland Pack",
        "price": 24.99,
        "caps": 5000,
        "items": {"exclusive_skin": 1, "all_items": 1}
    }
}

@router.get("/products")
async def get_products():
    """
    Get list of available IAP products.
    Called by iOS app to display in store.
    """
    return {
        "products": [
            {
                "id": product_id,
                "name": product["name"],
                "price": product["price"],
                "caps": product["caps"],
                "items": product["items"]
            }
            for product_id, product in PRODUCTS.items()
        ]
    }

@router.post("/verify", response_model=IAPVerifyResponse)
async def verify_receipt(receipt: IAPReceipt):
    """
    Verify Apple IAP receipt with Apple servers.
    
    IMPORTANT: This is a simplified implementation.
    In production, you MUST:
    1. Verify receipt with Apple's production server
    2. Store transaction_id to prevent replay attacks
    3. Validate product_id matches expected value
    4. Check receipt signature
    """
    
    # Get product info
    if receipt.product_id not in PRODUCTS:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    product = PRODUCTS[receipt.product_id]
    
    try:
        # Verify with Apple's production server
        # For production: https://buy.itunes.apple.com/verifyReceipt
        # For sandbox (testing): https://sandbox.itunes.apple.com/verifyReceipt
        
        async with httpx.AsyncClient() as client:
            # Try production first
            response = await client.post(
                "https://buy.itunes.apple.com/verifyReceipt",
                json={"receipt-data": receipt.receipt_data},
                timeout=10.0
            )
            
            result = response.json()
            
            # If status=21007, receipt is from sandbox, retry with sandbox
            if result.get("status") == 21007:
                response = await client.post(
                    "https://sandbox.itunes.apple.com/verifyReceipt",
                    json={"receipt-data": receipt.receipt_data},
                    timeout=10.0
                )
                result = response.json()
            
            # Check if receipt is valid
            if result.get("status") == 0:
                # Receipt is valid
                # TODO: Store transaction_id in database to prevent duplicate consumption
                # TODO: Grant items/caps to user
                
                return IAPVerifyResponse(
                    success=True,
                    product_id=receipt.product_id,
                    message=f"Purchase verified: {product['name']}"
                )
            else:
                # Receipt invalid
                return IAPVerifyResponse(
                    success=False,
                    product_id=receipt.product_id,
                    message=f"Receipt verification failed: {result.get('status')}"
                )
                
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to verify receipt: {str(e)}"
        )

@router.post("/consume")
async def consume_purchase(receipt: IAPReceipt):
    """
    Mark purchase as consumed (grant items to player).
    Called after successful verification.
    
    TODO: Implement actual item granting logic:
    1. Add caps to player account
    2. Add items to player inventory
    3. Mark transaction as consumed in DB
    4. Return updated player stats
    """
    
    if receipt.product_id not in PRODUCTS:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    product = PRODUCTS[receipt.product_id]
    
    # TODO: Grant items to user
    # Example:
    # user = get_user_from_session()
    # user.caps += product["caps"]
    # user.inventory.update(product["items"])
    # save_transaction(receipt.transaction_id, user.id, receipt.product_id)
    
    return {
        "success": True,
        "product": product["name"],
        "granted": {
            "caps": product["caps"],
            "items": product["items"]
        },
        "message": "Purchase consumed successfully"
    }
