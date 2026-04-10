"""
Stripe Payment Integration for Wasteland Zero
Handles checkout sessions, webhooks, and purchase verification
"""

from fastapi import APIRouter, HTTPException, Request, Header
from pydantic import BaseModel
import stripe
import os
from typing import Optional
import hmac
import hashlib

router = APIRouter(prefix="/api/payments", tags=["payments"])

# Initialize Stripe - read from environment (REQUIRED)
stripe_key = os.getenv('STRIPE_SECRET_KEY')
if not stripe_key:
    raise ValueError('STRIPE_SECRET_KEY environment variable is required')
stripe.api_key = stripe_key
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET', '')

# Product catalog
PRODUCTS = {
    'premium_unlock': {
        'name': 'Wasteland Zero Premium',
        'description': 'Remove branding, exclusive title screen, premium support',
        'price': 499,  # $4.99 in cents
        'type': 'one_time',
        'benefits': ['no_branding', 'exclusive_title', 'priority_support']
    },
    'cyber_portraits': {
        'name': 'Cyberpunk Portrait Pack',
        'description': 'Alternative character portraits with cyberpunk aesthetic',
        'price': 299,  # $2.99
        'type': 'cosmetic',
        'benefits': ['cyber_portraits']
    },
    'neon_portraits': {
        'name': 'Neon Apocalypse Portrait Pack',
        'description': 'Glowing neon-style character portraits',
        'price': 299,
        'type': 'cosmetic',
        'benefits': ['neon_portraits']
    },
    'xp_boost_24h': {
        'name': '24h XP Boost',
        'description': '+50% XP gain for 24 hours',
        'price': 99,  # $0.99
        'type': 'boost',
        'benefits': ['xp_boost_24h']
    },
    'loot_boost_24h': {
        'name': '24h Loot Boost',
        'description': '+25% better drops for 24 hours',
        'price': 99,
        'type': 'boost',
        'benefits': ['loot_boost_24h']
    },
    'caps_boost_24h': {
        'name': '24h Caps Boost',
        'description': '+50% caps from all sources for 24 hours',
        'price': 99,
        'type': 'boost',
        'benefits': ['caps_boost_24h']
    },
    'mega_boost_bundle': {
        'name': 'Mega Boost Bundle',
        'description': 'All 3 boosts for 24 hours - Save 33%!',
        'price': 199,  # $1.99 (normally $2.97)
        'type': 'bundle',
        'benefits': ['xp_boost_24h', 'loot_boost_24h', 'caps_boost_24h']
    },
    'extra_save_slots': {
        'name': 'Extra Save Slots',
        'description': 'Unlock save slots 4, 5, and 6',
        'price': 199,
        'type': 'one_time',
        'benefits': ['extra_slots']
    },
    'season_pass_1': {
        'name': 'Season Pass - Season 1',
        'description': '50 tiers of exclusive rewards over 3 months',
        'price': 999,  # $9.99
        'type': 'season_pass',
        'benefits': ['season_1_rewards']
    }
}


class CheckoutRequest(BaseModel):
    product_id: str
    user_id: str  # Save slot identifier or unique user ID
    success_url: str
    cancel_url: str


class PurchaseVerification(BaseModel):
    user_id: str
    session_id: str


@router.post("/create-checkout")
async def create_checkout_session(request: CheckoutRequest):
    """Create a Stripe checkout session for a product"""
    
    if request.product_id not in PRODUCTS:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = PRODUCTS[request.product_id]
    
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'unit_amount': product['price'],
                    'product_data': {
                        'name': product['name'],
                        'description': product['description'],
                    },
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=request.success_url + '?session_id={CHECKOUT_SESSION_ID}',
            cancel_url=request.cancel_url,
            client_reference_id=request.user_id,
            metadata={
                'product_id': request.product_id,
                'user_id': request.user_id,
                'benefits': ','.join(product['benefits'])
            }
        )
        
        return {
            'session_id': checkout_session.id,
            'url': checkout_session.url
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify-purchase")
async def verify_purchase(request: PurchaseVerification):
    """Verify a purchase was completed successfully"""
    
    try:
        session = stripe.checkout.Session.retrieve(request.session_id)
        
        if session.payment_status == 'paid' and session.client_reference_id == request.user_id:
            product_id = session.metadata.get('product_id')
            benefits = session.metadata.get('benefits', '').split(',')
            
            return {
                'success': True,
                'product_id': product_id,
                'benefits': benefits,
                'amount_paid': session.amount_total / 100  # Convert cents to dollars
            }
        else:
            return {'success': False, 'error': 'Payment not completed'}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks for payment events"""
    
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        
        # Fulfill the purchase
        user_id = session.get('client_reference_id')
        product_id = session['metadata'].get('product_id')
        
        # TODO: Store purchase in database
        print(f"✓ Purchase completed: {product_id} for user {user_id}")
        
    elif event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        print(f"✓ PaymentIntent succeeded: {payment_intent['id']}")
        
    return {"status": "success"}


@router.get("/products")
async def get_products():
    """Get all available products"""
    return PRODUCTS


@router.get("/user-purchases/{user_id}")
async def get_user_purchases(user_id: str):
    """Get all purchases for a user (mock for now)"""
    # TODO: Implement database lookup
    return {
        'user_id': user_id,
        'purchases': [],
        'active_boosts': []
    }
