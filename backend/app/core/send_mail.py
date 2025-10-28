from typing import Dict, List, Optional
import httpx
import base64
import os
from app.core.helper import generate_manual_review_summary
from dotenv import load_dotenv

load_dotenv()

# Change mail api from Send Grid to Brevo for cost saving
async def send_email_via_brevo_api(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None,
    attachments: Optional[List[Dict]] = None,
    from_email: Optional[str] = None,
    from_name: Optional[str] = None
) -> bool:
    """Send email using Brevo (formerly Sendinblue) API"""
    try:
        # Get Brevo configuration
        brevo_api_key = os.getenv("BREVO_API_KEY")
        default_from_email = os.getenv("BREVO_FROM_EMAIL", "noreply@yourdomain.com")
        default_from_name = os.getenv("BREVO_FROM_NAME", "Qhuube Tax System")
        
        if not brevo_api_key:
            print("✗ Brevo API key not configured. Please set BREVO_API_KEY in environment variables.")
            return False
        
        print(f"Attempting to send email via Brevo API to {to_email}")
        print(f"Brevo Configuration:")
        print(f"  API Key: {'✓ Configured' if brevo_api_key else '✗ Missing'}")
        print(f"  From Email: {from_email or default_from_email}")
        print(f"  From Name: {from_name or default_from_name}")
        
        # Prepare email data for Brevo API
        email_data = {
            "sender": {
                "email": from_email or default_from_email,
                "name": from_name or default_from_name
            },
            "to": [
                {
                    "email": to_email
                }
            ],
            "subject": subject,
            "htmlContent": html_content
        }
        
        # Add text content if provided
        if text_content:
            email_data["textContent"] = text_content
        
        # Add attachments if provided
        if attachments:
            email_data["attachment"] = attachments
        
        # Set up headers for Brevo API
        headers = {
            "accept": "application/json",
            "api-key": brevo_api_key,
            "content-type": "application/json"
        }
        
        # Send email via Brevo API
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.brevo.com/v3/smtp/email",
                json=email_data,
                headers=headers
            )
            
            if response.status_code == 201:
                print(f"✓ Email sent successfully via Brevo API to {to_email}")
                return True
            else:
                print(f"✗ Brevo API failed: {response.status_code} - {response.text}")
                return False
                
    except Exception as e:
        print(f"✗ Brevo API error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def send_manual_vat_email(to_email: str, user_email: str, attachment: bytes, manual_review_rows: List[Dict]):
    """Send manual VAT processing email using Brevo API"""
    try:
        print(f"Attempting to send manual VAT email to {to_email} via Brevo API")
        
        summary_text = generate_manual_review_summary(manual_review_rows)
        
        # Create HTML content
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
        
        # Create text content
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
        
        # Prepare attachment for Brevo API
        attachment_b64 = base64.b64encode(attachment).decode()
        attachments = [
            {
                "content": attachment_b64,
                "name": "manual_vat_review.xlsx"
            }
        ]
        
        # Send email via Brevo API
        success = await send_email_via_brevo_api(
            to_email=to_email,
            subject="Manual VAT Processing Required",
            html_content=html_content,
            text_content=text_content,
            attachments=attachments,
            from_email="anand.pande@xtechon.com",
            from_name="Qhuube Tax System"
        )
        
        if success:
            print(f"✓ Manual VAT email sent successfully to {to_email}")
        else:
            print(f"✗ Failed to send manual VAT email to {to_email}")
        
    except Exception as e:
        print(f"✗ Failed to send manual VAT email to {to_email}: {e}")
        import traceback
        traceback.print_exc()



async def send_vat_report_email_safely(to_email: str, file_name: str, file_content: bytes, original_filename: str):
    """Send VAT report email safely using Brevo API"""
    try:
        await send_vat_report_email_internal(
            to_email,
            file_name,
            file_content,
            original_filename
        )
        print(f"Successfully sent VAT report email to {to_email}")
    except Exception as e:
        # Log the error but don't raise
        import traceback
        print(f"Failed to send VAT report email to {to_email}: {e}")
        traceback.print_exc()


async def send_vat_report_email_internal(to_email: str, file_name: str, file_content: bytes, original_filename: str):
    """Send VAT report email using Brevo API"""
    try:
        print(f"Attempting to send VAT report email to {to_email} via Brevo API")
        
        # Create HTML content
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
        
        # Create text content
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
        
        # Prepare attachment for Brevo API
        attachment_b64 = base64.b64encode(file_content).decode()
        attachments = [
            {
                "content": attachment_b64,
                "name": file_name
            }
        ]
        
        # Send email via Brevo API
        success = await send_email_via_brevo_api(
            to_email=to_email,
            subject="Your Processed VAT Report",
            html_content=html_content,
            text_content=text_content,
            attachments=attachments,
            from_email="anand.pande@xtechon.com",
            from_name="Team Qhuube"
        )
        
        if success:
            print(f"✓ VAT report email sent successfully to {to_email}")
        else:
            print(f"✗ Failed to send VAT report email to {to_email}")
            raise Exception("Failed to send VAT report email via Brevo API")
        
    except Exception as e:
        print(f"✗ Failed to send VAT report email to {to_email}: {e}")
        import traceback
        traceback.print_exc()
        raise  # Re-raise to maintain existing error handling


async def send_email(to_email: str, subject: str, body: str):
    """Send simple email using Brevo API"""
    try:
        print(f"Attempting to send email to {to_email} via Brevo API")
        
        # Create HTML content from plain text
        html_content = f"""
        <html>
        <body>
            <pre>{body}</pre>
            <p>Best regards,<br>
            Qhuube Tax System</p>
        </body>
        </html>
        """
        
        # Send email via Brevo API
        success = await send_email_via_brevo_api(
            to_email=to_email,
            subject=subject,
            html_content=html_content,
            text_content=body
        )
        
        if success:
            print(f"✓ Email sent successfully to {to_email}")
        else:
            print(f"✗ Failed to send email to {to_email}")
            
    except Exception as e:
        print(f"✗ Unexpected error in send_email: {e}")
        import traceback
        traceback.print_exc()
        return


async def send_quarter_issues_email(to_email: str, subject: str, body: str, attachment: bytes, filename: str, original_file: bytes = None, original_filename: str = None):
    """Send quarter issues email with attachments using Brevo API"""
    try:
        print(f"Attempting to send quarter issues email to {to_email} via Brevo API")
        
        # Create HTML content from plain text body
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
        
        # Prepare attachments for Brevo API
        attachments = []
        
        # Add Excel attachment with issue details
        if attachment:
            attachment_b64 = base64.b64encode(attachment).decode()
            attachments.append({
                "content": attachment_b64,
                "name": filename
            })
        
        # Add original file attachment if provided
        if original_file and original_filename:
            original_file_b64 = base64.b64encode(original_file).decode()
            attachments.append({
                "content": original_file_b64,
                "name": f"ORIGINAL_{original_filename}"
            })
        
        # Send email via Brevo API
        success = await send_email_via_brevo_api(
            to_email=to_email,
            subject=subject,
            html_content=html_content,
            text_content=body,
            attachments=attachments,
            from_email="anand.pande@xtechon.com",
            from_name="Qhuube Tax System"
        )
        
        if success:
            attachments_info = f"Excel: {filename}"
            if original_file and original_filename:
                attachments_info += f", Original: ORIGINAL_{original_filename}"
            print(f"✓ Quarter issues email sent successfully to {to_email} with attachments: {attachments_info}")
        else:
            print(f"✗ Failed to send quarter issues email to {to_email}")
            
    except Exception as e:
        print(f"✗ Failed to send quarter issues email to {to_email}: {e}")
        print("Please check your Brevo API configuration")
        import traceback
        traceback.print_exc()
        # Don't raise the error to prevent the API from failing
        return