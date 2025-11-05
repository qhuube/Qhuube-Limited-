from itertools import product
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, header, product, currency, offer
from app.core import validate_file

app = FastAPI(title="Qhuube Tax Compliance")

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(header.router, prefix="/api/v1", tags=["Header"])
app.include_router(product.router, prefix="/api/v1", tags=["Product"])
app.include_router(validate_file.router, prefix="/api/v1", tags=["File Validation"])
app.include_router(currency.router, prefix="/api/v1", tags=["Currency Rates"])
app.include_router(offer.router, prefix="/api/v1", tags=["Offer"])


app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://www.qhuube.com", "https://qhuube.com", "https://qhuube.vercel.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)