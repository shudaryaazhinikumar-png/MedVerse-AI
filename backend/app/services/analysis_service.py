
from pathlib import Path
import math

from app.ocr.image_reader import extract_text_from_image
from app.ocr.text_cleaner import clean_ocr_text
from app.ocr.report_parser import parse_cbc_report
from app.ai.gemini_service import analyze_medical_report


def _json_safe(value):
    """Convert values into JSON-safe Python values."""
    if isinstance(value, float) and not math.isfinite(value):
        return None

    if isinstance(value, dict):
        return {
            str(key): _json_safe(item)
            for key, item in value.items()
        }

    if isinstance(value, (list, tuple)):
        return [_json_safe(item) for item in value]

    return value


def _format_test(test: dict, language: str) -> str:
    name = str(test.get("name", "Unknown test"))
    result = test.get("result", test.get("value", "Not available"))
    unit = str(test.get("unit", "") or "")
    status = str(test.get("status", "unknown")).lower()
    reference = test.get("reference_range")

    if isinstance(reference, dict):
        if "low" in reference and "high" in reference:
            ref_text = f"{reference['low']} - {reference['high']}"
        elif "comparison" in reference and "limit" in reference:
            ref_text = f"{reference['comparison']} {reference['limit']}"
        else:
            ref_text = "Not available"
    else:
        ref_text = "Not available"

    if language == "Tamil":
        status_text = {
            "low": "குறைவு",
            "high": "அதிகம்",
            "normal": "குறிப்பிட்ட வரம்பிற்குள்",
            "unknown": "சரிபார்க்க வேண்டும்",
        }.get(status, "சரிபார்க்க வேண்டும்")

        return (
            f"- {name}: {result} {unit}; "
            f"குறிப்பு வரம்பு: {ref_text}; "
            f"நிலை: {status_text}"
        )

    status_text = {
        "low": "LOW",
        "high": "HIGH",
        "normal": "Within provided range",
        "unknown": "VERIFY",
    }.get(status, "VERIFY")

    return (
        f"- {name}: {result} {unit}; "
        f"reference: {ref_text}; status: {status_text}"
    )


def _build_parser_fallback(
    parsed_report: dict,
    language: str,
) -> str:
    """
    Create a parser-only summary when Gemini is unavailable.
    This is not a Gemini-generated medical interpretation.
    """
    tests = parsed_report.get("tests", [])

    abnormal = [
        test for test in tests
        if test.get("status") in {"low", "high"}
    ]
    normal = [
        test for test in tests
        if test.get("status") == "normal"
    ]
    unknown = [
        test for test in tests
        if test.get("status") == "unknown"
    ]

    if language == "Tamil":
        sections = [
            "AI நிலை: தற்காலிகமாக கிடைக்கவில்லை",
            "",
            "அறிக்கை செயலாக்க நிலை:",
            "OCR மூலம் பெறப்பட்ட மதிப்புகள் கீழே கொடுக்கப்பட்டுள்ளன. "
            "Gemini AI விளக்கம் கிடைக்காததால், இது parser-only சுருக்கம்.",
            "",
            "அசாதாரணமாகக் குறிக்கப்பட்ட மதிப்புகள்:",
            *(
                [_format_test(test, language) for test in abnormal]
                if abnormal else ["- Parser விதிகளின்படி குறைந்த/அதிகமான மதிப்புகள் கண்டறியப்படவில்லை."]
            ),
            "",
            "குறிப்பிட்ட வரம்பிற்குள் உள்ள மதிப்புகள்:",
            *(
                [_format_test(test, language) for test in normal]
                if normal else ["- உறுதிப்படுத்தப்பட்ட சாதாரண மதிப்புகள் இல்லை."]
            ),
            "",
            "சரிபார்க்க வேண்டிய மதிப்புகள்:",
            *(
                [_format_test(test, language) for test in unknown]
                if unknown else ["- Parser மூலம் கூடுதல் சரிபார்ப்பு தேவைப்படும் மதிப்புகள் இல்லை."]
            ),
            "",
            "எச்சரிக்கை:",
            "OCR பிழைகள் மற்றும் முழுமையற்ற reference ranges இருக்கலாம். "
            "மூல ஆய்வக அறிக்கையுடன் ஒப்பிட்டு சரிபார்க்கவும்.",
            "",
            "மருத்துவ மறுப்பு:",
            "இது மருத்துவ நோயறிதல் அல்ல. முடிவுகளை மருத்துவருடன் கலந்தாலோசிக்கவும்.",
        ]
    else:
        sections = [
            "AI STATUS: TEMPORARILY UNAVAILABLE",
            "",
            "Processing status:",
            "OCR extraction and rule-based parsing completed. "
            "Gemini interpretation was unavailable, so this is a parser-only summary.",
            "",
            "Values flagged outside their parsed reference ranges:",
            *(
                [_format_test(test, language) for test in abnormal]
                if abnormal else ["- No low/high values were classified by the parser."]
            ),
            "",
            "Values within the parsed reference ranges:",
            *(
                [_format_test(test, language) for test in normal]
                if normal else ["- No values were confirmed within a parsed reference range."]
            ),
            "",
            "Values requiring verification:",
            *(
                [_format_test(test, language) for test in unknown]
                if unknown else ["- No additional unknown-status values were returned by the parser."]
            ),
            "",
            "Warnings:",
            "OCR may misread values, units, or reference ranges. "
            "Verify all results against the original laboratory report.",
            "",
            "Medical disclaimer:",
            "This parser-only summary is not a diagnosis or a substitute for medical advice.",
        ]

    return "\n".join(sections)


def analyze_report(
    file_path: str,
    language: str = "English",
) -> dict:
    """
    OCR -> cleaning -> parsing -> Gemini interpretation.
    If Gemini is unavailable, return a clearly labelled parser-only summary.
    """

    language = str(language).strip().capitalize()

    if language not in {"English", "Tamil"}:
        language = "English"

    path = Path(file_path)

    if not path.exists() or not path.is_file():
        raise FileNotFoundError(f"Report file not found: {file_path}")

    print("\n========================================")
    print("MEDVERSE AI ANALYSIS PIPELINE")
    print("========================================")
    print(f"File     : {path.name}")
    print(f"Language : {language}")
    print("========================================")

    # 1. OCR
    print("\n[1/4] Extracting text using OCR...")
    raw_text = extract_text_from_image(str(path))

    if not raw_text or not raw_text.strip():
        raise ValueError("No text could be extracted from the report.")

    print(f"OCR completed. Extracted {len(raw_text)} characters.")

    # 2. Clean OCR text
    print("\n[2/4] Cleaning OCR text...")
    cleaned_text = clean_ocr_text(raw_text)

    if not cleaned_text or not cleaned_text.strip():
        raise ValueError("OCR text became empty after cleaning.")

    print(f"Cleaning completed: {len(cleaned_text)} characters.")

    # Avoid printing full patient reports and identifiers to the terminal.
    # Uncomment these lines temporarily if OCR debugging is necessary:
    # print("CLEANED OCR TEXT:")
    # print(cleaned_text)

    # 3. Parse results
    print("\n[3/4] Parsing medical report values...")
    parsed_report = parse_cbc_report(cleaned_text)
    parsed_report = _json_safe(parsed_report)

    tests = parsed_report.get("tests", [])

    print(f"Parsing completed. Detected {len(tests)} test value(s).")

    if not tests:
        print("WARNING: No structured values were extracted.")

    # 4. Gemini analysis, with a parser-only fallback
    print("\n[4/4] Sending report to Gemini AI...")
    print(f"Requested response language: {language}")

    gemini_report_data = {
        **parsed_report,
        "language": language,
    }

    ai_available = True

    try:
        ai_analysis = analyze_medical_report(gemini_report_data)

        if not isinstance(ai_analysis, str) or not ai_analysis.strip():
            raise RuntimeError("Gemini returned an empty analysis.")

        ai_analysis = ai_analysis.strip()
        print("Gemini analysis completed successfully.")

    except Exception as exc:
        ai_available = False

        # Log the failure, but don't print API keys or patient report text.
        print(
            "Gemini analysis unavailable. "
            f"Using parser-only fallback ({type(exc).__name__})."
        )

        ai_analysis = _build_parser_fallback(
            parsed_report,
            language,
        )

    print("\n========================================")
    print("MEDVERSE AI ANALYSIS FINISHED")
    print(f"AI interpretation available: {ai_available}")
    print("========================================")

    return {
        "filename": path.name,
        "raw_text": raw_text,
        "cleaned_text": cleaned_text,
        "parsed_report": parsed_report,
        "ai_analysis": ai_analysis,
        "language": language,
        "ai_available": ai_available,
    }