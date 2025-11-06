# backend/app/core/send_mail.py

from typing import Dict, List, Optional
import os
import base64
import mimetypes
import httpx
from dotenv import load_dotenv

from app.core.helper import generate_manual_review_summary

load_dotenv()


# ----------------------------------------------------------------------
# Low-level Postmark sender
# ----------------------------------------------------------------------
async def send_email_via_postmark_api(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None,
    attachments: Optional[List[Dict]] = None,
    from_email: Optional[str] = None,
    from_name: Optional[str] = None,
) -> bool:
    """
    Send an email via Postmark's Email API.
    Env vars expected (Render):
      - POSTMARK_SERVER_API_TOKEN (required)
      - POSTMARK_BASE_URL (default: https://api.postmarkapp.com)
      - POSTMARK_STREAM (default: outbound)
      - REPLY_TO_EMAIL (optional)
      - FROM_EMAIL (default: noreply@yourdomain.com)
      - POSTMARK_FROM_NAME (default: Qhuube Tax System)
    """
    try:
        # Auth + config
        server_token = os.getenv("POSTMARK_SERVER_API_TOKEN") or os.getenv("POSTMARK_SERVER_TOKEN")
        base_url = os.getenv("POSTMARK_BASE_URL", "https://api.postmarkapp.com")
        message_stream = os.getenv("POSTMARK_STREAM", "outbound")
        reply_to_email = os.getenv("REPLY_TO_EMAIL")

        default_from_email = os.getenv("FROM_EMAIL", "noreply@yourdomain.com")
        default_from_name = os.getenv("POSTMARK_FROM_NAME", "Qhuube Tax System")

        if not server_token:
            print("✗ POSTMARK_SERVER_API_TOKEN / POSTMARK_SERVER_TOKEN not configured.")
            return False

        sender = f'{from_name or default_from_name} <{from_email or default_from_email}>'

        # Build payload
        data: Dict = {
            "From": sender,
            "To": to_email,
            "Subject": subject,
            "HtmlBody": html_content,
            "MessageStream": message_stream,
        }
        if text_content:
            data["TextBody"] = text_content
        if reply_to_email:
            data["ReplyTo"] = reply_to_email

        # Attachments (convert caller dicts to Postmark shape)
        if attachments:
            pm_attachments = []
            for a in attachments:
                name = a.get("name") or "attachment"
                content_b64 = a.get("content")
                ctype = a.get("content_type")
                if not ctype:
                    ctype = mimetypes.guess_type(name)[0] or "application/octet-stream"
                pm_attachments.append({
                    "Name": name,
                    "Content": content_b64,
                    "ContentType": ctype,
                })
            if pm_attachments:
                data["Attachments"] = pm_attachments

        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Postmark-Server-Token": server_token,
        }

        print(f"Postmark: to={to_email} stream={message_stream}")
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(f"{base_url}/email", json=data, headers=headers)

        if resp.status_code == 200:
            print(f"✓ Email sent via Postmark to {to_email}")
            return True
        else:
            print(f"✗ Postmark API failed: {resp.status_code} - {resp.text}")
            return False

    except Exception as e:
        print(f"✗ Postmark API error: {e}")
        import traceback; traceback.print_exc()
        return False


# ----------------------------------------------------------------------
# Higher-level helpers (same interfaces you were already using)
# ----------------------------------------------------------------------
async def send_manual_vat_email(
    to_email: str,
    user_email: str,
    attachment: bytes,
    manual_review_rows: List[Dict]
):
    """Send manual VAT processing email using Postmark API"""
    try:
        print(f"Attempting to send manual VAT email to {to_email} via Postmark")

        summary_text = generate_manual_review_summary(manual_review_rows)

        html_content = f"""
        <html>
        <body>
            <h2>Manual VAT Processing Required</h2>
            <p>Some rows from a VAT submission could not be processed automatically.</p>

            <h3>User Details:</h3>
            <p><strong>User Email:</strong> {user_email}</p>

            <h3>Action Required:</h3>
            <p>Please review the attached Excel file which contains:</p>
            <ul>
                <li>Enriched VAT Report</li>
                <li>Manual Review Rows</li>
            </ul>

            <h3>Summary:</h3>
            <pre>{summary_text}</pre>

            <p>Best regards,<br>
            Qhuube Tax System</p>
        </body>
        </html>
        """

        text_content = f"""
        Manual VAT Processing Required

        Some rows from a VAT submission could not be processed automatically.

        User Email: {user_email}

        Please review the attached Excel file which contains:
        - Enriched VAT Report
        - Manual Review Rows

        {summary_text}

        Best regards,
        Qhuube Tax System
        """

        # XLSX attachment
        attachment_b64 = base64.b64encode(attachment).decode()
        attachments = [{
            "content": attachment_b64,
            "name": "manual_vat_review.xlsx",
            "content_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }]

        success = await send_email_via_postmark_api(
            to_email=to_email,
            subject="Manual VAT Processing Required",
            html_content=html_content,
            text_content=text_content,
            attachments=attachments,
            from_email=os.getenv("FROM_EMAIL"),
            from_name=os.getenv("POSTMARK_FROM_NAME", "Qhuube Tax System"),
        )

        if success:
            print(f"✓ Manual VAT email sent successfully to {to_email}")
        else:
            print(f"✗ Failed to send manual VAT email to {to_email}")

    except Exception as e:
        print(f"✗ Failed to send manual VAT email to {to_email}: {e}")
        import traceback; traceback.print_exc()


async def send_vat_report_email_safely(
    to_email: str,
    file_name: str,
    file_content: bytes,
    original_filename: str
):
    """Send VAT report email safely using Postmark API"""
    try:
        await send_vat_report_email_internal(to_email, file_name, file_content, original_filename)
        print(f"Successfully sent VAT report email to {to_email}")
    except Exception as e:
        import traceback
        print(f"Failed to send VAT report email to {to_email}: {e}")
        traceback.print_exc()


async def send_vat_report_email_internal(
    to_email: str,
    file_name: str,
    file_content: bytes,
    original_filename: str
):
    """Send VAT report email using Postmark API"""
    try:
        print(f"Attempting to send VAT report email to {to_email} via Postmark")

        html_content = f"""
        <html>
        <body>
            <h2>Your Processed VAT Report</h2>
            <p>Hello,</p>

            <p>Please find attached the processed VAT report for the file: <strong>{original_filename}</strong>.</p>

            <h3>The attached ZIP file includes:</h3>
            <ul>
                <li>VAT Report (Excel)</li>
                <li>Summary (Excel)</li>
            </ul>

            <p>If you have any questions, feel free to contact support at <a href="mailto:connect@qhuube.com">connect@qhuube.com</a>.</p>

            <p>Best regards,<br>
            Team Qhuube</p>
        </body>
        </html>
        """

        text_content = f"""
        Your Processed VAT Report

        Hello,

        Please find attached the processed VAT report for the file: {original_filename}.

        The attached ZIP file includes:
        - VAT Report (Excel)
        - Summary (Excel)

        If you have any questions, feel free to contact support at connect@qhuube.com.

        Best regards,
        Team Qhuube
        """

        attachment_b64 = base64.b64encode(file_content).decode()
        attachments = [{
            "content": attachment_b64,
            "name": file_name,
            "content_type": mimetypes.guess_type(file_name)[0] or "application/octet-stream",
        }]

        success = await send_email_via_postmark_api(
            to_email=to_email,
            subject="Your Processed VAT Report",
            html_content=html_content,
            text_content=text_content,
            attachments=attachments,
            from_email=os.getenv("FROM_EMAIL"),
            from_name="Team Qhuube",
        )

        if success:
            print(f"✓ VAT report email sent successfully to {to_email}")
        else:
            print(f"✗ Failed to send VAT report email to {to_email}")
            raise Exception("Failed to send VAT report email via Postmark API")

    except Exception as e:
        print(f"✗ Failed to send VAT report email to {to_email}: {e}")
        import traceback; traceback.print_exc()
        raise


async def send_email(to_email: str, subject: str, body: str):
    """Send simple email using Postmark API"""
    try:
        print(f"Attempting to send email to {to_email} via Postmark")

        html_content = f"""
        <html>
        <body>
            <pre>{body}</pre>
            <p>Best regards,<br>
            Qhuube Tax System</p>
        </body>
        </html>
        """

        success = await send_email_via_postmark_api(
            to_email=to_email,
            subject=subject,
            html_content=html_content,
            text_content=body,
            from_email=os.getenv("FROM_EMAIL"),
            from_name=os.getenv("POSTMARK_FROM_NAME", "Qhuube Tax System"),
        )

        if success:
            print(f"✓ Email sent successfully to {to_email}")
        else:
            print(f"✗ Failed to send email to {to_email}")

    except Exception as e:
        print(f"✗ Unexpected error in send_email: {e}")
        import traceback; traceback.print_exc()


async def send_quarter_issues_email(
    to_email: str,
    subject: str,
    body: str,
    attachment: bytes,
    filename: str,
    original_file: bytes = None,
    original_filename: str = None
):
    """Send quarter issues email with attachments using Postmark API"""
    try:
        print(f"Attempting to send quarter issues email to {to_email} via Postmark")

        html_content = f"""
        <html>
        <body>
            <h2>Quarter Validation Issues</h2>
            <pre>{body}</pre>
            <p>Best regards,<br>
            Qhuube Tax System</p>
        </body>
        </html>
        """

        attachments = []
        if attachment:
            attachments.append({
                "content": base64.b64encode(attachment).decode(),
                "name": filename,
                "content_type": mimetypes.guess_type(filename)[0] or "application/octet-stream",
            })

        if original_file and original_filename:
            attachments.append({
                "content": base64.b64encode(original_file).decode(),
                "name": f"ORIGINAL_{original_filename}",
                "content_type": mimetypes.guess_type(original_filename)[0] or "application/octet-stream",
            })

        success = await send_email_via_postmark_api(
            to_email=to_email,
            subject=subject,
            html_content=html_content,
            text_content=body,
            attachments=attachments,
            from_email=os.getenv("FROM_EMAIL"),
            from_name=os.getenv("POSTMARK_FROM_NAME", "Qhuube Tax System"),
        )

        if success:
            extras = [f"Excel: {filename}"]
            if original_file and original_filename:
                extras.append(f"Original: ORIGINAL_{original_filename}")
            print(f"✓ Quarter issues email sent successfully to {to_email} with attachments: {', '.join(extras)}")
        else:
            print(f"✗ Failed to send quarter issues email to {to_email}")

    except Exception as e:
        print(f"✗ Failed to send quarter issues email to {to_email}: {e}")
        import traceback; traceback.print_exc()
        return
