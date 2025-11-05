from fastapi import APIRouter, HTTPException, Depends
from app.core.security import verify_access_token
from app.schemas.offer_schemas import OfferSchema, OfferCreateSchema, OfferListResponse, OfferResponse
from app.models.offer_model import (
    get_all_offers, 
    create_offer, 
    update_offer, 
    get_offer_by_id, 
    delete_offer
)

router = APIRouter()

@router.post("/create/offer", response_model=OfferResponse)
async def create_new_offer(offer: OfferCreateSchema):
    """Create a new offer"""
    try:
        created_offer = await create_offer(
            offer.title,
            offer.text,
            offer.amount,
            offer.discount,
            offer.price
        )
        return {
            "success": True,
            "offer": created_offer
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create offer: {str(e)}")

@router.get("/offers", response_model=OfferListResponse)
async def get_offers():
    """Get all offers"""
    try:
        offers = await get_all_offers()
        return {
            "success": True,
            "offers": offers
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch offers: {str(e)}")

@router.get("/offer/{offer_id}", response_model=OfferResponse)
async def get_offer(offer_id: str):
    """Get a single offer by ID"""
    try:
        offer = await get_offer_by_id(offer_id)
        if not offer:
            raise HTTPException(status_code=404, detail="Offer not found")
        return {
            "success": True,
            "offer": offer
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch offer: {str(e)}")

@router.put("/update/offer/{offer_id}", response_model=OfferResponse)
async def update_offer_in_db(offer_id: str, updated: OfferCreateSchema):
    """Update an existing offer"""
    try:
        updated_offer = await update_offer(
            offer_id,
            updated.title,
            updated.text,
            updated.amount,
            updated.discount,
            updated.price
        )
        return {
            "success": True,
            "offer": updated_offer
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Failed to update offer: {str(e)}")

@router.delete("/delete/offer/{offer_id}")
async def delete_existing_offer(offer_id: str):
    """Delete an offer"""
    try:
        result = await delete_offer(offer_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
