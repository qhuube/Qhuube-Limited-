# backend/app/routes/email_report.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
import os, base64, requests

from app.utils.postmark_client import send_with_attachment  # uses the helper you added

router = APIRouter(prefix="/api/v1", tags=["email"])

class SendReportBody(BaseModel):
    to: EmailStr
    # Use whichever you have available; at least one must be provided:
    zip_path: Optional[str] = None      # absolute path on the server (e.g. /var/app/output/xyz/VAT-Report.zip)
    zip_url: Optional[str]  = None      # signed URL to download the zip, if you store it in S3/GCS/etc.
    filename: Optional[str] = "VAT-Report.zip"

def _attachment_from_path(path: str, name: str):
    if not os.path.exists(path):
        raise FileNotFoundError(f"ZIP not found at {path}")
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    return {"Name": name, "Content": b64, "ContentType": "application/zip"}

def _attachment_from_url(url: str, name: str):
    r = requests.get(url, timeout=60)
    r.raise_for_status()
    b64 = base64.b64encode(r.content).decode()
    return {"Name": name, "Content": b64, "ContentType": "application/zip"}

@router.post("/send-vat-report-email")
async def send_vat_report_email(body: SendReportBody):
    """
    Sends the processed VAT report as a ZIP attachment via Postmark.
    Provide either zip_path (server file path) or zip_url (downloadable link).
    """
    try:
        if not body.zip_path and not body.zip_url:
            raise ValueError("Provide either 'zip_path' or 'zip_url'.")

        # Build attachment from whichever source you pass
        if body.zip_path:
            att = _attachment_from_path(body.zip_path, body.filename or "VAT-Report.zip")
        else:
            att = _attachment_from_url(body.zip_url, body.filename or "VAT-Report.zip")

        subject = "Your VAT report"
        html = "<p>Your VAT compliance report is attached as a ZIP file.</p>"
        text = "Your VAT compliance report is attached as a ZIP file."

        message_id = send_with_attachment(
            to=body.to,
            subject=subject,
            html=html,
            text=text,
            attachments=[att],
        )
        return {"ok": True, "provider": "postmark", "messageId": message_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"EMAIL_SEND_FAILED: {e}")
