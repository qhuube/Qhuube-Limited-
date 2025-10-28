from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = "mongodb+srv://mailer:pPo7zm5nYtDQ05lR@qhuubecluster01.knsozoe.mongodb.net"
client = AsyncIOMotorClient(MONGO_URI)
db = client["qhuube_db"]