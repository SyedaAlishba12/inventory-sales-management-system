import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from common.config import get_settings

logger = logging.getLogger(__name__)

def send_password_reset_email(to_email: str, reset_token: str) -> None:
    """Send a password reset email to the user.
    
    If SMTP_HOST is not configured, this will fallback to logging the reset link
    at INFO level, ensuring local/dev workflows don't fail without real email infra.
    """
    settings = get_settings()
    
    # In a real app, this should be the frontend URL
    reset_link = f"{settings.cors_origins.split(',')[0]}/reset-password?token={reset_token}"
    
    if not settings.smtp_host:
        logger.info(f"SMTP not configured. Password reset link for {to_email}: {reset_link}")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Password Reset Request"
    msg["From"] = settings.smtp_from_address
    msg["To"] = to_email

    text = f"""\
You have requested a password reset.
Please click on the following link to reset your password:
{reset_link}

If you did not request this, please ignore this email.
"""
    
    html = f"""\
<html>
  <body>
    <p>You have requested a password reset.</p>
    <p>Please click on the following link to reset your password:</p>
    <p><a href="{reset_link}">{reset_link}</a></p>
    <p>If you did not request this, please ignore this email.</p>
  </body>
</html>
"""

    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")

    msg.attach(part1)
    msg.attach(part2)

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            if settings.smtp_user and settings.smtp_password:
                server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_from_address, to_email, msg.as_string())
            logger.info(f"Password reset email sent to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send password reset email to {to_email}: {e}")
        # Debug-level fallback so the link is still recoverable, but this log is
        # distinct from the intentional "SMTP not configured" INFO fallback above.
        logger.debug(f"[smtp-failure] reset link for {to_email}: {reset_link}")
