from collections import defaultdict
from pymongo import DESCENDING
from datetime import datetime, timedelta
from app.core.database import db

async def get_ecb_fx_rates_from_db() -> dict[str, dict[str, float]]:
    historical_rates = defaultdict(dict)
    cursor = db["currency_update"].find().sort("date", DESCENDING)

    async for doc in cursor:
        date = doc.get("date")
        currency = doc.get("currency_code")
        value = doc.get("value")
        if date and currency and value:
            historical_rates[date][currency.upper()] = value
            historical_rates[date]["EUR"] = 1.0

    return historical_rates





def get_fx_rate_by_date_from_db_rates(rates_dict: dict[str, dict[str, float]], order_date: str, currency: str) -> float:

    currency = currency.upper()
    if currency == "EUR":
        return 1.0
    
    try:
        target_date = datetime.strptime(order_date, "%Y-%m-%d")

        # ECB weekend adjustment
        weekday = target_date.isoweekday()  # Monday=1, Sunday=7
        if weekday == 7:  # Sunday
            target_date -= timedelta(days=2)
        elif weekday == 6:  # Saturday
            target_date -= timedelta(days=1)

        # ECB holiday adjustment - go backward until a rate exists
        while target_date >= datetime(2023, 1, 1):
            date_str = target_date.strftime("%Y-%m-%d")
            if date_str in rates_dict and currency in rates_dict[date_str]:
                return rates_dict[date_str][currency]
            target_date -= timedelta(days=1)  # move back 1 day

    except Exception as e:
        print(f"Error fetching FX rate: {e}")

    # Fallback if no rate found
    return 1.0
