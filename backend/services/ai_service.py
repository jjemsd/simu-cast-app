import anthropic
import os
from dotenv import load_dotenv

load_dotenv()
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are SimuCast AI, a friendly statistics and data analysis assistant 
embedded in the SimuCast platform. You help users understand their data, interpret 
statistical results, and guide them through predictive modeling and what-if analysis.

Keep responses concise (3-5 sentences max unless asked for more).
Use simple language — avoid heavy jargon unless the user asks for technical detail.
Always be encouraging and guide the user to the next step."""

async def get_ai_response(message: str, context: str = "", step: str = "") -> str:
    full_message = message
    if context:
        full_message = f"[Context: {context}]\n\nUser: {message}"
    if step:
        full_message = f"[Current step: {step}]\n{full_message}"

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": full_message}]
    )
    return response.content[0].text

async def get_contextual_hint(step: str, session: dict) -> str:
    hints = {
        "upload": "Your dataset has been loaded. Check the column types and look for any missing values before proceeding to Data Cleaning.",
        "cleaning": "Review each column for missing values. You can impute with mean/median for numeric columns, or drop rows if missing data is minimal.",
        "stats": "Descriptive statistics give you a snapshot of your data. Pay attention to skewness — values above 1 or below -1 suggest your data may not be normally distributed.",
        "normality": "Normality tests determine which statistical methods are appropriate. If p-value > 0.05, your data is likely normal. If not, consider non-parametric alternatives.",
        "modeling": "Select your target column (what you want to predict), then let SimuCast recommend the best model based on your data characteristics.",
        "simulation": "Adjust input variables to see how your predictions change. This is your what-if analysis — try different scenarios to support decision-making."
    }
    return hints.get(step, "Follow the steps on the left panel to complete your analysis.")
