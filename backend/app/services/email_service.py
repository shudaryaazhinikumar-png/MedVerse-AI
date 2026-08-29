import smtplib
from email.message import EmailMessage

from app.core.config import settings


def send_password_reset_email(
    recipient_email: str,
    reset_link: str
):

    message = EmailMessage()

    message["Subject"] = "MedVerse AI - Password Reset"
    message["From"] = settings.BREVO_SENDER_EMAIL
    message["To"] = recipient_email

    message.set_content(
        f"""
Hello,

We received a request to reset your MedVerse AI password.

Click the link below to reset your password:

{reset_link}

This link is valid for 15 minutes.

If you did not request a password reset, you can safely ignore this email.

Regards,
MedVerse AI Team
"""
    )

    with smtplib.SMTP(
        settings.BREVO_SMTP_HOST,
        settings.BREVO_SMTP_PORT
    ) as server:

        server.starttls()

        server.login(
            settings.BREVO_SMTP_LOGIN,
            settings.BREVO_SMTP_PASSWORD
        )

        server.send_message(message)