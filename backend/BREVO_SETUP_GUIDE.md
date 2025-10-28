# Brevo Email API Setup Guide

## Overview
Your application has been successfully migrated from SMTP to **Brevo API** (formerly Sendinblue) for reliable email delivery in production environments.

## Why Brevo API?
✅ **No SMTP port blocking issues** in cloud deployments  
✅ **Better deliverability** and reputation management  
✅ **Detailed analytics** and tracking  
✅ **Reliable** in containerized environments like Render  
✅ **Free tier available** (300 emails/day)  

## Setup Instructions

### 1. Create Brevo Account
1. Go to [https://www.brevo.com/](https://www.brevo.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Get API Key
1. Login to your Brevo dashboard
2. Go to **Settings** → **API Keys** 
3. Click **Generate a new API key**
4. Copy the API key (keep it secure!)

### 3. Verify Sender Domain (Important!)
1. Go to **Settings** → **Senders & IP**
2. Add your domain (e.g., `yourdomain.com`)
3. Follow the DNS verification steps
4. Wait for verification (usually takes a few minutes)

### 4. Configure Environment Variables

#### For Local Development (.env file):
```bash
# Brevo API Configuration
BREVO_API_KEY=xkeysib-your-actual-api-key-here
BREVO_FROM_EMAIL=noreply@yourdomain.com
BREVO_FROM_NAME=Qhuube Tax System
```

#### For Production (Render Dashboard):
1. Go to your Render service dashboard
2. Navigate to **Environment** tab
3. Add these environment variables:
   - `BREVO_API_KEY`: Your actual Brevo API key
   - `BREVO_FROM_EMAIL`: Your verified sender email
   - `BREVO_FROM_NAME`: Display name for emails

### 5. Test Email Functionality

#### Test Endpoint (Optional)
Add this to your FastAPI app for testing:

```python
@app.get("/test-brevo-email")
async def test_brevo_email():
    from app.core.send_mail import send_email_via_brevo_api
    
    success = await send_email_via_brevo_api(
        to_email="test@example.com",
        subject="Test Email from Brevo API",
        html_content="<h1>Test successful!</h1><p>Brevo API is working correctly.</p>",
        text_content="Test successful! Brevo API is working correctly."
    )
    
    return {"success": success, "message": "Check logs for details"}
```

## Email Functions Updated

All email functions have been migrated to use Brevo API:

### 1. `send_manual_vat_email()`
- ✅ Converted to Brevo API
- ✅ Supports Excel attachments
- ✅ HTML formatted emails

### 2. `send_vat_report_email_safely()`
- ✅ Converted to Brevo API  
- ✅ Supports ZIP attachments
- ✅ Professional HTML formatting

### 3. `send_quarter_issues_email()`
- ✅ Converted to Brevo API
- ✅ Supports multiple attachments (Excel + original file)
- ✅ Detailed issue reporting

### 4. `send_email()` (Generic)
- ✅ Converted to Brevo API
- ✅ Simple text/HTML emails

## Brevo API Features Used

### Email Structure
```json
{
  "sender": {
    "email": "noreply@yourdomain.com",
    "name": "Qhuube Tax System"
  },
  "to": [{"email": "recipient@example.com"}],
  "subject": "Email Subject",
  "htmlContent": "<html>...</html>",
  "textContent": "Plain text version",
  "attachment": [
    {
      "content": "base64-encoded-file-content",
      "name": "filename.xlsx"
    }
  ]
}
```

### Response Codes
- **201**: Email sent successfully
- **400**: Bad request (check email format, API key)
- **401**: Unauthorized (invalid API key)
- **402**: Payment required (quota exceeded)

## Troubleshooting

### Common Issues

#### 1. "Brevo API key not configured"
**Solution**: Set `BREVO_API_KEY` environment variable

#### 2. "401 Unauthorized"
**Solutions**:
- Check if API key is correct
- Ensure no extra spaces in API key
- Regenerate API key if needed

#### 3. "400 Bad Request - Invalid sender"
**Solutions**:
- Verify your sender domain in Brevo dashboard
- Use verified sender email in `BREVO_FROM_EMAIL`
- Check DNS records for domain verification

#### 4. "402 Payment Required"
**Solutions**:
- Check your Brevo quota usage
- Upgrade to paid plan if needed
- Wait for quota reset (daily/monthly)

### Debug Logs
The application now provides detailed logging:
```
Attempting to send email via Brevo API to user@example.com
Brevo Configuration:
  API Key: ✓ Configured
  From Email: noreply@yourdomain.com
  From Name: Qhuube Tax System
✓ Email sent successfully via Brevo API to user@example.com
```

## Production Deployment Checklist

- [ ] Brevo account created and verified
- [ ] API key generated and secured
- [ ] Sender domain verified in Brevo
- [ ] Environment variables set in Render
- [ ] Test email sent successfully
- [ ] Monitor email delivery in Brevo dashboard

## Brevo Dashboard Features

### Analytics Available:
- Email delivery rates
- Open rates
- Click rates  
- Bounce rates
- Spam reports

### Monitoring:
- Real-time sending status
- Delivery logs
- Error tracking
- Quota usage

## Migration Benefits

### Before (SMTP):
❌ Network connectivity issues in production  
❌ Port blocking by cloud providers  
❌ Complex SMTP configuration  
❌ Limited error visibility  

### After (Brevo API):
✅ HTTP-based API (no port blocking)  
✅ Reliable delivery in any environment  
✅ Simple configuration  
✅ Detailed analytics and monitoring  
✅ Better error handling and logging  

## Support

- **Brevo Documentation**: [https://developers.brevo.com/](https://developers.brevo.com/)
- **Brevo Support**: Available in dashboard
- **API Status**: [https://status.brevo.com/](https://status.brevo.com/)

Your email system is now production-ready and will work reliably in any deployment environment! 🚀
