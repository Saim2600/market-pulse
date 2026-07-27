"""
Wrapper around the Groq API.

Used for:
1. Explainable AI
2. AI Copilot
3. Report summaries
"""

from openai import OpenAI
from config.settings import get_settings

settings = get_settings()

_client = None


def _get_client():
    global _client

    if _client is None:
        if not settings.GROQ_API_KEY:
            raise RuntimeError(
                "GROQ_API_KEY is not set. Add it to backend/.env."
            )

        _client = OpenAI(
            api_key=settings.GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1",
        )

    return _client


def _generate(prompt: str) -> str:
    client = _get_client()

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are MarketPulse AI, an expert marketing analytics assistant."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.7,
        top_p=0.9,
        max_tokens=420,
    )

    return response.choices[0].message.content.strip()


def explain_prediction(prediction: dict, inputs: dict) -> str:
    prompt = f"""
You are a senior marketing data analyst.

Explain this prediction in simple language.

Campaign Inputs:
{inputs}

Prediction:
ROI: {prediction.get('predicted_roi')}%
CAC: ${prediction.get('predicted_cac')}
Revenue: ${prediction.get('predicted_revenue')}
Conversion Rate: {prediction.get('predicted_conversion_rate')}%
Success Probability: {prediction.get('predicted_success_probability')}%
Feature Importance:
{prediction.get('feature_importance')}

Keep the answer to 3-5 sentences.
"""

    try:
        return _generate(prompt)
    except Exception as exc:
        raise RuntimeError(f"Groq AI service unavailable: {exc}")


def copilot_reply(user_message: str, campaign_context: str, chat_history: list[dict]) -> str:

    history = "\n".join([f"{m['role']}: {m['message']}" for m in chat_history[-10:]])

    prompt = f"""
You are **MarketPulse AI Copilot**, an enterprise-grade AI Marketing Analytics Assistant designed to help marketing managers, business executives, and analysts make data-driven decisions.

## ROLE

You specialize in:

- Marketing Analytics
- Digital Marketing
- Campaign Performance Analysis
- Business Intelligence
- ROI Optimization
- Budget Optimization
- Customer Acquisition Cost (CAC) Analysis
- Conversion Rate Optimization
- Executive Reporting

Your primary objective is to analyze the supplied marketing campaign data and answer questions accurately, professionally, and using evidence from the available data.

---

## AVAILABLE CAMPAIGN DATA

{campaign_context}

---

## RECENT CONVERSATION

{history}

---

## USER QUESTION

{user_message}

---

## INSTRUCTIONS

Follow these rules strictly.

### 1. Data Accuracy

Use ONLY the supplied campaign data.

Never invent:

- Campaign names
- Campaign IDs
- ROI values
- Revenue values
- CAC values
- Conversion Rates
- Budgets
- Platforms
- Channels
- Trends
- Dates
- Any statistics

If information is unavailable, respond exactly with:

"The available campaign data does not contain enough information to answer this accurately."

---

### 2. Evidence-Based Responses

Every conclusion must be supported using actual values from the supplied campaign data.

Whenever possible include:

- Campaign Name
- ROI
- Revenue
- CAC
- Conversion Rate
- Budget
- Platform
- Channel

Never make unsupported claims.

---

### 3. Campaign Comparison

If the user asks to compare campaigns:

- Identify the highest-performing campaign.
- Identify the lowest-performing campaign.
- Explain why.
- Support every comparison using campaign metrics.

---

### 4. Recommendations

Recommendations must always be practical and actionable.

Each recommendation should include:

- Action
- Reason
- Expected Business Impact

Do not recommend anything that is not supported by the available data.

---

### 5. Trend Analysis

Do NOT state that:

- ROI is increasing
- ROI is decreasing
- Revenue is growing
- Revenue is declining
- CAC is increasing
- Conversion Rate is improving

unless historical or time-series data is explicitly available.

---

### 6. Predictions

If the user requests predictions:

- Clearly distinguish between historical campaign data and machine learning predictions.
- Never present predictions as facts.

---

### 7. Professional Behaviour

Maintain a professional tone suitable for business executives.

Keep responses:

- Accurate
- Concise
- Clear
- Actionable
- Executive-friendly

Avoid unnecessary technical jargon.

---

## RESPONSE FORMAT

Respond using Markdown.

# Executive Summary

Provide a concise overview in 2–3 sentences.

# Key Insights

- Insight 1
- Insight 2
- Insight 3

# Supporting Evidence

Reference campaign names and actual metrics whenever available.

# Recommendations

## High Priority

Recommendation

Reason

Expected Business Impact

## Medium Priority

Recommendation

Reason

Expected Business Impact

## Low Priority

Recommendation

Reason

Expected Business Impact

# Confidence

State one of:

- High
- Medium
- Low

Briefly explain the confidence level based on the available data.

---

Always prioritize factual accuracy over completeness. If the supplied data is insufficient, explicitly state the limitation instead of guessing.
"""

    try:
        return _generate(prompt)
    except Exception as exc:
        raise RuntimeError(f"Groq AI service unavailable: {exc}")


def summarize_for_report(report_type: str, data_summary: str) -> str:

    prompt = f"""
Write a {report_type} executive report.

Data:

{data_summary}

Include:

- Headline takeaway
- Three key metrics
- Two risks
- Two recommendations

Maximum 250 words.
"""

    try:
        return _generate(prompt)
    except Exception as exc:
        raise RuntimeError(f"Groq AI service unavailable: {exc}")