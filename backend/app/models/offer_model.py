from app.core.database import db
from bson import ObjectId
from datetime import datetime

async def get_all_offers():
    """Fetch all offers from database"""
    offers_cursor = db.offers.find({}).sort("created_at", -1)
    offers = await offers_cursor.to_list(length=None)
    for offer in offers:
        if "_id" in offer:
            offer["_id"] = str(offer["_id"])
    return offers

async def get_offer_by_id(offer_id: str):
    """Fetch a single offer by ID"""
    offer = await db.offers.find_one({"_id": ObjectId(offer_id)})
    if offer:
        offer["_id"] = str(offer["_id"])
    return offer

async def create_offer(title: str, text: str, amount: float, discount: float, price: float):
    """Create a new offer"""
    offer = {
        "title": title,
        "text": text,
        "amount": amount,
        "discount": discount,
        "price": price,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    result = await db.offers.insert_one(offer)
    offer["_id"] = str(result.inserted_id)
    return offer

async def update_offer(offer_id: str, title: str, text: str, amount: float, discount: float, price: float):
    """Update an existing offer"""
    updated_data = {
        "title": title,
        "text": text,
        "amount": amount,
        "discount": discount,
        "price": price,
        "updated_at": datetime.utcnow()
    }
    result = await db.offers.update_one(
        {"_id": ObjectId(offer_id)},
        {"$set": updated_data}
    )
    if result.modified_count == 0:
        raise Exception("Offer not found or no changes made")
    
    updated_offer = await db.offers.find_one({"_id": ObjectId(offer_id)})
    if updated_offer:
        updated_offer["_id"] = str(updated_offer["_id"])
    return updated_offer

async def delete_offer(offer_id: str):
    """Delete an offer"""
    result = await db.offers.delete_one({"_id": ObjectId(offer_id)})
    if result.deleted_count == 0:
        raise Exception("Offer not found or already deleted")
    
    return {
        "success": True,
        "message": "Offer deleted successfully"
    }
