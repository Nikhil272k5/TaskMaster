import os
import httpx
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


class LLMClient:
    def __init__(self):
        self.gemini_key = GEMINI_API_KEY
        self.groq_key = GROQ_API_KEY
        self.timeout = 30.0

    def call(self, system_prompt: str, user_prompt: str) -> str:
        """Try Gemini first, then Groq as fallback."""
        if self.gemini_key:
            try:
                return self._call_gemini(system_prompt, user_prompt)
            except Exception as e:
                print(f"[LLM] Gemini failed: {e}, trying Groq...")

        if self.groq_key:
            try:
                return self._call_groq(system_prompt, user_prompt)
            except Exception as e:
                print(f"[LLM] Groq failed: {e}")

        raise RuntimeError("Both Gemini and Groq API calls failed. Check your API keys.")

    def _call_gemini(self, system_prompt: str, user_prompt: str) -> str:
        full_prompt = f"{system_prompt}\n\n{user_prompt}"
        payload = {
            "contents": [{"parts": [{"text": full_prompt}]}],
            "generationConfig": {
                "maxOutputTokens": 1024,
                "temperature": 0.1
            }
        }
        with httpx.Client(timeout=self.timeout) as client:
            resp = client.post(
                f"{GEMINI_URL}?key={self.gemini_key}",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            resp.raise_for_status()
            data = resp.json()
            return data["candidates"][0]["content"]["parts"][0]["text"].strip()

    def _call_groq(self, system_prompt: str, user_prompt: str) -> str:
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": 1024,
            "temperature": 0.1
        }
        with httpx.Client(timeout=self.timeout) as client:
            resp = client.post(
                GROQ_URL,
                json=payload,
                headers={
                    "Authorization": f"Bearer {self.groq_key}",
                    "Content-Type": "application/json"
                }
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"].strip()


def test_connections():
    """Test both API connections."""
    client = LLMClient()
    results = {}

    if client.gemini_key:
        try:
            result = client._call_gemini("Say 'OK' and nothing else.", "Test")
            results["gemini"] = f"✅ Connected — Response: {result[:50]}"
        except Exception as e:
            results["gemini"] = f"❌ Failed: {e}"
    else:
        results["gemini"] = "❌ No API key set"

    if client.groq_key:
        try:
            result = client._call_groq("Say 'OK' and nothing else.", "Test")
            results["groq"] = f"✅ Connected — Response: {result[:50]}"
        except Exception as e:
            results["groq"] = f"❌ Failed: {e}"
    else:
        results["groq"] = "❌ No API key set"

    return results


if __name__ == "__main__":
    print("Testing LLM connections...")
    results = test_connections()
    for name, status in results.items():
        print(f"  {name}: {status}")
