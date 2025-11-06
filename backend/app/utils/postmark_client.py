# backend/app/utils/postmark_client.py
import os

POSTMARK_TOKEN  = os.getenv("POSTMARK_SERVER_API_TOKEN")
FROM_EMAIL      = os.getenv("FROM_EMAIL")
MESSAGE_STREAM  = os.getenv("POSTMARK_STREAM", "outbound")
REPLY_TO        = os.getenv("REPLY_TO_EMAIL")  # <-- use your actual env var

_client = PostmarkClient(server_token=POSTMARK_TOKEN) if POSTMARK_TOKEN else None

def send_html(to: str, subject: str, html: str, text: Optional[str] = None) -> str:
    if not _client:
        raise RuntimeError("Postmark client not configured")

    payload = {
        "From": FROM_EMAIL,
        "To": to,
        "Subject": subject,
        "HtmlBody": html,
        "TextBody": text,
        "MessageStream": MESSAGE_STREAM,
    }
    if REPLY_TO:
        payload["ReplyTo"] = REPLY_TO  # <-- only include when not empty

    res = _client.emails.send(**payload)
    return res["MessageID"]

def send_with_attachment(to: str, subject: str, html: str, text: Optional[str], attachments: list) -> str:
    if not _client:
        raise RuntimeError("Postmark client not configured")

    payload = {
        "From": FROM_EMAIL,
        "To": to,
        "Subject": subject,
        "HtmlBody": html,
        "TextBody": text,
        "Attachments": attachments,
        "MessageStream": MESSAGE_STREAM,
    }
    if REPLY_TO:
        payload["ReplyTo"] = REPLY_TO

    res = _client.emails.send(**payload)
    return res["MessageID"]
