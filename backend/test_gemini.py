"""
Manual Gemini smoke test.

Run with:
    GEMINI_API_KEY=... python test_gemini.py
"""
import os

import google.generativeai as genai


def main() -> None:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise SystemExit("Set GEMINI_API_KEY before running this script.")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content("Say hello")
    print(response.text)


if __name__ == "__main__":
    main()
