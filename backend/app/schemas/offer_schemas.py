from pydantic import BaseModel, Field
from typing import List
from app.schemas.py_object_id import PyObjectId

class OfferCreateSchema(BaseModel):
    title: str
    text: str
    amount: float
    discount: float
    price: float

class OfferSchema(OfferCreateSchema):
    id: PyObjectId = Field(..., alias="_id")
    
    class Config:
        populate_by_name = True

class OfferListResponse(BaseModel):
    success: bool
    offers: List[OfferSchema]

class OfferResponse(BaseModel):
    success: bool
    offer: OfferSchema
