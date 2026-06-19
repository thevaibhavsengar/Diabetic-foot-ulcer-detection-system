from google import genai
from dotenv import load_dotenv
import os

load_dotenv()
client = genai.Client(os.getenv("LLM_API"))

response = client.models.generate_content(
    model="gemini-3.1-flash-lite",
    contents="Explain how AI works",
)

print(response.text)