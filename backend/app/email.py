"""Email sending via AWS SES — used for OTP codes and notifications."""

import boto3
from botocore.exceptions import ClientError
from app.config import get_settings


def send_otp_code(to_email: str, code: str) -> bool:
    """Send a 4-digit OTP code to the given email address via AWS SES.

    Returns True if sent successfully, False otherwise.
    """
    settings = get_settings()

    try:
        client = boto3.client(
            "ses",
            region_name="us-east-1",
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
        )

        response = client.send_email(
            Source="david@thoughtfire.studio",
            Destination={"ToAddresses": [to_email]},
            Message={
                "Subject": {
                    "Data": "Your Sleepy Joezzz login code",
                    "Charset": "UTF-8",
                },
                "Body": {
                    "Html": {
                        "Data": f"""<!DOCTYPE html>
<html>
<body style="font-family:Inter, Arial, sans-serif; background:#F6F3EC; padding:32px 16px;">
  <div style="max-width:400px; margin:0 auto; background:#FFFFFF; border-radius:24px; padding:32px; box-shadow:0 10px 28px rgba(26,26,24,0.07);">
    <div style="text-align:center; font-size:48px; margin-bottom:16px;">🏈</div>
    <h1 style="font-family:Sora, sans-serif; font-size:20px; font-weight:700; text-align:center; color:#1A1A18; margin:0 0 8px;">
      Sleepy Joezzz
    </h1>
    <p style="font-size:14px; color:#57544C; text-align:center; margin:0 0 24px;">
      Your 4-digit login code
    </p>
    <div style="background:#F4C43D; border-radius:16px; padding:24px; text-align:center;">
      <span style="font-family:Sora, sans-serif; font-size:48px; font-weight:800; letter-spacing:8px; color:#1A1A18;">
        {code}
      </span>
    </div>
    <p style="font-size:12px; color:#9C988E; text-align:center; margin:24px 0 0;">
      This code expires in 10 minutes. If you didn't request this, you can ignore this email.
    </p>
  </div>
</body>
</html>""",
                        "Charset": "UTF-8",
                    },
                    "Text": {
                        "Data": f"Your Sleepy Joezzz login code is: {code}. It expires in 10 minutes.",
                        "Charset": "UTF-8",
                    },
                },
            },
        )

        print(f"[email] Sent OTP to {to_email}, message_id={response['MessageId']}")
        return True

    except ClientError as e:
        print(f"[email] Failed to send OTP to {to_email}: {e}")
        return False
    except Exception as e:
        print(f"[email] Unexpected error sending OTP: {e}")
        return False
