import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class GroqAdapter:
    def __init__(self, model: str = "llama-3.3-70b-versatile",
                 system_prompt: str = None):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = model
        self.system_prompt = system_prompt

    def send(self, prompt: str, endpoint: str = "/chat") -> str:
        messages = []
        if self.system_prompt:
            messages.append({"role": "system", "content": self.system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=500
        )
        return response.choices[0].message.content