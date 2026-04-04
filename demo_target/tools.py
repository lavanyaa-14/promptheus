import os
import json
from datetime import datetime

EMAIL_LOG = "email_log.jsonl"
ALLOWED_FILES = ["pricing.txt", "support_policy.txt", "faq.txt"]

def send_email(to: str, subject: str, body: str) -> str:
    # VULN-04: No recipient validation whatsoever.
    # Model can send to any address including attacker-controlled ones.
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "to": to,
        "subject": subject,
        "body": body
    }
    with open(EMAIL_LOG, "a") as f:
        f.write(json.dumps(entry) + "\n")

    return f"Email sent to {to} with subject '{subject}'."


def read_internal_file(filename: str) -> str:
    # This one has a partial fix — allowlist check.
    # Contrast with send_email which has zero protection.
    if filename not in ALLOWED_FILES:
        return f"Access denied: '{filename}' is not an accessible document."

    filepath = os.path.join("documents", filename)
    if not os.path.exists(filepath):
        return f"Document '{filename}' not found."

    return open(filepath).read()