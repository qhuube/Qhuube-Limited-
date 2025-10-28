from fastapi import APIRouter
import httpx
from app.models.currency_model import fetch_two_years_ecb_rates
from app.utils.country_mapping import currency_country_map
from app.schemas.currencies_schemas import CurrencyUpdate
from app.core.database import db
from datetime import datetime, timedelta, timezone
import aiohttp
import logging

router = APIRouter()

@router.get("/currency/fetch-two-years")
async def sync_two_year_currency():
    inserted_count = await fetch_two_years_ecb_rates()
    return {
        "message": "2-year historical ECB currency data synced successfully.",
        "records_inserted": inserted_count
    }

@router.get("/currency/init-supported-countries-from-existing-data")
async def init_offline_supported_countries():
    # Step 1: Get all unique currencies in your data
    pipeline = [
        { "$match": { "currency_code": { "$ne": None } } },
        {
            "$group": {
                "_id": "$currency_code",
                "country_name": { "$first": "$currency_name" },
                "country_code": { "$first": "$country_code" },
                "min_date": { "$min": "$date" },
                "max_date": { "$max": "$date" }
            }
        }
    ]


    results = await db.currency_update.aggregate(pipeline).to_list(length=None)

    docs = []
    for item in results:
        docs.append({
            "country_name": item["country_name"],
            "country_code": item["country_code"],
            "currency_code": item["_id"],
            "is_active": True,
            "from_start_date": item["min_date"],
            "last_updated_currency_date": item["max_date"]
        })

    if docs:
        await db.offline_currency_supported_countries.insert_many(docs)
        return {"message": f"{len(docs)} countries initialized successfully."}
    else:
        return {"message": "No currency data found to initialize countries."}
    
currency_update_col = db["currency_update"]
cron_log_col = db["currency_cron_logs"]
supported_col = db["offline_currency_supported_countries"]

ECB_BASE_URL = "https://data-api.ecb.europa.eu/service/data/EXR/D.{currency}.EUR.SP00.A"
HEADERS = {"Accept": "application/vnd.sdmx.data+json;version=1.0.0-wd"}

def date_to_datetime(d: datetime.date) -> datetime:
    return datetime(d.year, d.month, d.day)



@router.get("/currency/daily_live_currency_sync")
async def daily_live_currency_sync():
    today = datetime.now(timezone.utc)
    today_date = today.date()
    weekday = today_date.weekday()  # 0 = Monday, 6 = Sunday

    supported = await supported_col.find({"is_active": True}).to_list(None)

    all_inserted = 0
    all_failed = 0
    all_holiday = 0
    logs = []

    for country in supported:
        currency_code = country["currency_code"]
        currency_name = currency_country_map.get(currency_code, {}).get("country_name", country["country_name"])
        country_code = country["country_code"]

        try:
            # Step 1: Detect weekend first (Sat = 5, Sun = 6)
            if weekday in [5, 6]:
                logs.append(f"{currency_code}: Weekend (ECB holiday).")
                all_holiday += 1
                continue

            # Step 2: Detect already up-to-date
            last_updated = country.get("last_updated_currency_date")
            if isinstance(last_updated, str):
                last_updated = datetime.strptime(last_updated, "%Y-%m-%d").date()

            if last_updated == today_date:
                logs.append(f"{currency_code}: Up-to-date.")
                continue

            from_date = (last_updated + timedelta(days=1)).strftime("%Y-%m-%d") if last_updated else today_date.strftime("%Y-%m-%d")
            to_date = today_date.strftime("%Y-%m-%d")

            url = f"{ECB_BASE_URL.format(currency=currency_code)}?startPeriod={from_date}&endPeriod={to_date}"
            async with httpx.AsyncClient(timeout=30.0) as client:
                try:
                    res = await client.get(url, headers=HEADERS)
                    res.raise_for_status()

                    if not res.content:
                        logs.append(f"{currency_code}: Empty response from ECB (Holiday).")
                        all_holiday += 1
                        continue

                    content_type = res.headers.get("Content-Type", "")
                    if not ("application/json" in content_type or content_type.startswith("application/vnd.sdmx.data+json")):
                        logs.append(f"{currency_code}: Unexpected content type: {res.headers.get('Content-Type')}")
                        all_failed += 1
                        continue

                    data = res.json()

                except Exception as e:
                    logs.append(f"{currency_code}: Failed due to {str(e)}")
                    all_failed += 1
                    continue

            # Step 3: Process observations
            series_data = data["dataSets"][0].get("series", {})
            date_values = data["structure"]["dimensions"]["observation"][0]["values"]

            if not series_data:
                logs.append(f"{currency_code}: No series data (ECB holiday).")
                all_holiday += 1
                continue

            inserted = 0
            for series_info in series_data.values():
                observations = series_info.get("observations")
                if not observations:
                    logs.append(f"{currency_code}: No observations (ECB holiday).")
                    all_holiday += 1
                    continue

                for idx, obs_data in observations.items():
                    date_str = date_values[int(idx)]["id"]
                    rate = obs_data[0]
                    if not rate:
                        continue

                    doc = CurrencyUpdate(
                        date=date_str,
                        country_code=country_code,
                        country_name=currency_name,
                        currency_code=currency_code,
                        currency_name=currency_name,
                        convert_to_currency="EUR",
                        value=round(rate, 6),
                        created_at=today
                    )
                    await currency_update_col.insert_one(doc.model_dump())
                    inserted += 1

            if inserted > 0:
                await supported_col.update_one(
                    {"_id": country["_id"]},
                    {"$set": {"last_updated_currency_date": today_date.strftime("%Y-%m-%d")}}
                )
                logs.append(f"{currency_code}: {inserted} records inserted (Updated).")
                all_inserted += 1
            else:
                logs.append(f"{currency_code}: No new data (ECB holiday).")
                all_holiday += 1

        except Exception as e:
            logs.append(f"{currency_code}: Failed due to {str(e)}")
            all_failed += 1

    # Step 4: Final cron status
    if all_inserted > 0:
        cron_status = "Updated"
    elif all_failed > 0:
        cron_status = "Failed"
    else:
        cron_status = "Holiday"

    await cron_log_col.insert_one({
        "date": date_to_datetime(today_date),
        "status": cron_status,
        "logs_details": "\n".join(logs),
        "created_at": today
    })

    return {
        "message": f"Sync completed. Success: {all_inserted}, Holiday: {all_holiday}, Failed: {all_failed}",
        "logs": logs
    }
