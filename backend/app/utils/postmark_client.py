import os, base64
from typing import Optional, List, Dict
from postmarker.core import PostmarkClient

POSTMARK_TOKEN = os.getenv("POSTMARK_SERVER_API_TOKEN")
FROM_EMAIL = os.getenv("FROM_EMAIL")
MESSAGE_STREAM = os.getenv("POSTMARK_STREAM", "outbound")
REPLY_TO       = os.getenv("REPLY_TO_EMAIL", "connect@qhuube.com")

_client = PostmarkClient(server_token=POSTMARK_TOKEN) if POSTMARK_TOKEN else None

def _ensure():
    if not _client:
        raise RuntimeError("Postmark not initialized (missing POSTMARK_SERVER_API_TOKEN)")
    if not FROM_EMAIL:
        raise RuntimeError("FROM_EMAIL is not set")

def send_html(to: str, subject: str, html: str, text: Optional[str] = None) -> str:
    _ensure()
    res = _client.emails.send(
        From=FROM_EMAIL,
        To=to,
        Subject=subject,
        HtmlBody=html,
        TextBody=text,
        MessageStream=MESSAGE_STREAM,
    )
    return res["MessageID"]

def send_with_attachment(
    to: str,
    subject: str,
    html: str,
    text: Optional[str],
    attachments: List[Dict[str, str]],
) -> str:
    _ensure()
    res = _client.emails.send(
        From=FROM_EMAIL,
        To=to,
        Subject=subject,
        HtmlBody=html,
        TextBody=text,
        Attachments=attachments,
        MessageStream=MESSAGE_STREAM,
    )
    return res["MessageID"]

def read_file_as_attachment(path: str, name: Optional[str] = None, content_type: str = "application/octet-stream"):
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    return {"Name": name or os.path.basename(path), "Content": b64, "ContentType": content_type}
