import requests

class WebAdapter:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()

    def send(self, prompt: str, endpoint: str = "/chat") -> str:
        url = f"{self.base_url}{endpoint}"

        try:
            response = self.session.post(
                url,
                json={"message": prompt},
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            response.raise_for_status()
            data = response.json()

            reply = data.get("reply", "")
            tool_calls = data.get("tool_calls", [])

            if tool_calls:
                tool_summary = " | ".join([
                    f"TOOL:{tc['tool']}({tc['args']})"
                    for tc in tool_calls
                ])
                reply = f"{reply}\n[TOOL_CALLS: {tool_summary}]"

            return reply

        except requests.exceptions.ConnectionError:
            return "ERROR: Could not connect to target. Is AriaCorp running?"
        except requests.exceptions.Timeout:
            return "ERROR: Request timed out."
        except Exception as e:
            return f"ERROR: {str(e)}"