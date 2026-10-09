
import time
import random

from google import genai
from google.genai import types

from app.core.config import settings


# ============================================================
# GEMINI CLIENT
# ============================================================

client = genai.Client(
    api_key=settings.GEMINI_API_KEY,
    http_options=types.HttpOptions(
        timeout=20000,
    ),
)


# ============================================================
# ERROR CLASSIFICATION
# ============================================================

def _error_text(exc: Exception) -> str:
    return str(exc).lower()


def _is_quota_error(message: str) -> bool:
    return any(term in message for term in (
        "resource_exhausted",
        "quota exceeded",
        "quota",
        "billing",
    )) or (
        "429" in message
    )


def _is_temporary_error(message: str) -> bool:
    return any(term in message for term in (
        "503",
        "unavailable",
        "high demand",
        "temporarily",
        "500",
        "502",
        "504",
        "timeout",
        "timed out",
        "connection",
        "network",
        "internal server error",
        "empty response",
    ))


# ============================================================
# MEDICAL REPORT ANALYSIS
# ============================================================

def analyze_medical_report(report_data: dict) -> str:
    language = str(
        report_data.get("language", "English")
    ).strip().capitalize()

    if language not in {"English", "Tamil"}:
        language = "English"

    medical_report_data = dict(report_data)
    medical_report_data.pop("language", None)

    if language == "Tamil":
        language_instruction = """
Write the complete response in simple Tamil.

Medical test names and abbreviations such as Hb, PCV, RBC,
WBC, MCV, MCH, MCHC, RDW, Platelets, Neutrophils,
Lymphocytes, Monocytes, Eosinophils and Basophils may
remain in English.

Preserve numerical values, units and reference ranges.
All explanations, warnings and recommendations must be in Tamil.
"""
    else:
        language_instruction = """
Write the complete response in simple, clear English.
Preserve medical test names, numerical values, units and
reference ranges accurately.
"""

    prompt = f"""
You are MedVerse AI, a medical report interpretation assistant.

{language_instruction}

MEDICAL SAFETY RULES:

1. Use only the values supplied in the report data.
2. Never invent missing test values or reference ranges.
3. Do not diagnose a disease.
4. Identify values outside valid provided reference ranges.
5. Distinguish parser-detected results from uncertain OCR data.
6. Do not treat an unknown status as normal.
7. Do not prescribe medication or recommend changing medication.
8. Explain findings cautiously and in simple language.
9. Preserve numerical values and units.
10. Clearly state when a range or unit needs verification.
11. Do not invent symptoms or medical history.
12. Do not claim that AI interpretation is a doctor's diagnosis.

SELECTED LANGUAGE:
{language}

REPORT DATA:
{medical_report_data}

Return the interpretation using these sections:

Health Status:
Give a cautious overall interpretation. If data is incomplete,
state that a reliable overall status cannot be determined.

Abnormal Findings:
List values outside their supplied, reliable reference ranges.

Normal Findings:
List values within their supplied reference ranges.

Explanation:
Explain the findings generally without diagnosing a disease.

Recommendations:
Give general, non-prescriptive recommendations.

Warnings:
Mention OCR uncertainty, missing reference ranges, and values
that should be verified against the original report.

Medical Disclaimer:
State that this is educational information, not a diagnosis.

FINAL RULE:
Write the complete response in {language}.
Do not switch languages.
"""

    max_attempts = 3

    for attempt in range(max_attempts):
        try:
            print(
                f"Gemini request attempt "
                f"{attempt + 1}/{max_attempts}..."
            )

            response = client.models.generate_content(
                model="gemini-3.6-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    max_output_tokens=1500,
                    temperature=0.2,
                ),
            )

            output_text = getattr(response, "text", None)

            if not output_text or not output_text.strip():
                raise RuntimeError(
                    "Gemini returned an empty response."
                )

            print("Gemini analysis successful.")
            return output_text.strip()

        except Exception as exc:
            message = _error_text(exc)

            print(
                f"Gemini error on attempt "
                f"{attempt + 1}/{max_attempts}: "
                f"{type(exc).__name__}: {exc}"
            )

            # Quota errors generally won't improve with immediate retries.
            if _is_quota_error(message):
                raise RuntimeError(
                    "Gemini API quota or billing limit reached. "
                    "Check API quota and billing settings."
                ) from exc

            temporary = _is_temporary_error(message)

            # Don't retry errors that are unlikely to be temporary.
            if not temporary:
                raise RuntimeError(
                    "Gemini request failed. Check the model name, "
                    "API configuration, and request."
                ) from exc

            if attempt == max_attempts - 1:
                raise RuntimeError(
                    "Gemini is temporarily unavailable after "
                    "multiple attempts."
                ) from exc

            wait_time = (
                2 ** attempt
                + random.uniform(0.5, 1.5)
            )

            print(
                f"Temporary Gemini error. "
                f"Retrying in {wait_time:.1f} seconds..."
            )

            time.sleep(wait_time)

    raise RuntimeError("Gemini analysis failed unexpectedly.")