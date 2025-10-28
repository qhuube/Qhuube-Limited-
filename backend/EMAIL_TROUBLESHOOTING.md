# Email Sending Issues in Production - Troubleshooting Guide

## Problem Summary
- **Local Environment**: Emails work perfectly ✅
- **Production (Render)**: Emails fail with `errno[1011] network is unreachable` ❌
- **API Response**: Returns 200 (success) but emails don't arrive

## Root Cause Analysis

The error `errno[1011] network is unreachable` indicates that your Render deployment cannot establish network connections to SMTP servers. This is a common issue in containerized/cloud environments.

### Possible Causes:
1. **Network Restrictions**: Render may block outbound SMTP connections
2. **Missing Environment Variables**: SMTP configuration not set in production
3. **Port Blocking**: SMTP ports (25, 587, 465) might be blocked
4. **DNS Resolution Issues**: Cannot resolve SMTP server hostnames
5. **Firewall Rules**: Outbound connections restricted

## Solutions Implemented

### 1. Enhanced Error Logging ✅
- Added detailed SMTP configuration checks
- Implemented network connectivity testing
- Added fallback mechanisms (aiosmtplib → smtplib)
- Better error reporting with specific error types

### 2. Network Connectivity Testing ✅
- Added `test_network_connectivity()` function
- Tests multiple SMTP servers and ports
- Provides detailed connection diagnostics

### 3. Improved Email Functions ✅
- Enhanced all email sending functions with better error handling
- Added timeout configurations (30 seconds)
- Implemented dual-approach sending (async + sync fallback)

## Immediate Actions Required

### 1. Check Environment Variables in Render
Ensure these environment variables are set in your Render dashboard:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

### 2. Alternative SMTP Providers
If Gmail is blocked, try these alternatives:

#### SendGrid (Recommended for Production)
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=your-verified-sender@yourdomain.com
```

#### Mailgun
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
SMTP_FROM=your-verified-sender@yourdomain.com
```

#### AWS SES
```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-username
SMTP_PASS=your-ses-password
SMTP_FROM=your-verified-sender@yourdomain.com
```

### 3. Render-Specific Configuration

#### Option A: Use Render Add-ons
- Consider using Render's email add-ons or integrations
- These are pre-configured to work within Render's network

#### Option B: Contact Render Support
- Ask about SMTP port restrictions
- Request whitelisting for your SMTP provider
- Inquire about network policies

### 4. Alternative Solutions

#### Use HTTP-based Email APIs
Instead of SMTP, use HTTP APIs which are less likely to be blocked:

```python
# Example with SendGrid API
import httpx

async def send_email_via_api(to_email: str, subject: str, body: str):
    api_key = os.getenv("SENDGRID_API_KEY")
    
    data = {
        "personalizations": [{"to": [{"email": to_email}]}],
        "from": {"email": "noreply@yourdomain.com"},
        "subject": subject,
        "content": [{"type": "text/plain", "value": body}]
    }
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.sendgrid.com/v3/mail/send",
            json=data,
            headers=headers
        )
        return response.status_code == 202
```

## Testing Steps

### 1. Check Logs in Render
Look for the enhanced logging output:
```
=== Network Connectivity Test ===
Testing connection to smtp.gmail.com:587...
✗ Socket connection to smtp.gmail.com:587 failed (error 1011)
```

### 2. Test Different SMTP Providers
Try multiple providers to identify which ones work:
- Gmail (smtp.gmail.com:587)
- SendGrid (smtp.sendgrid.net:587)
- Mailgun (smtp.mailgun.org:587)
- AWS SES (email-smtp.region.amazonaws.com:587)

### 3. Verify Environment Variables
Add this endpoint to test configuration:

```python
@router.get("/test-email-config")
async def test_email_config():
    config = {
        "smtp_host": os.getenv("SMTP_HOST"),
        "smtp_port": os.getenv("SMTP_PORT"),
        "smtp_user": os.getenv("SMTP_USER"),
        "smtp_from": os.getenv("SMTP_FROM"),
        "has_password": bool(os.getenv("SMTP_PASS"))
    }
    
    # Test network connectivity
    await test_network_connectivity()
    
    return {"config": config, "status": "check_logs_for_connectivity_results"}
```

## Recommended Production Setup

### 1. Use SendGrid (Most Reliable)
1. Sign up for SendGrid account
2. Verify your domain
3. Get API key
4. Set environment variables in Render
5. Test with both SMTP and HTTP API

### 2. Implement Graceful Degradation
```python
async def send_email_with_fallback(to_email: str, subject: str, body: str):
    # Try SMTP first
    try:
        await send_email_smtp(to_email, subject, body)
        return True
    except Exception as e:
        print(f"SMTP failed: {e}")
        
        # Fallback to HTTP API
        try:
            return await send_email_via_api(to_email, subject, body)
        except Exception as e2:
            print(f"HTTP API also failed: {e2}")
            return False
```

### 3. Monitor Email Delivery
- Implement email delivery tracking
- Log all email attempts
- Set up alerts for email failures

## Next Steps

1. **Immediate**: Set up SendGrid account and configure in Render
2. **Short-term**: Implement HTTP API fallback
3. **Long-term**: Set up proper email monitoring and alerting

## Support Contacts

- **Render Support**: For network/infrastructure issues
- **SendGrid Support**: For email delivery issues
- **Your Domain Provider**: For DNS/domain verification issues
