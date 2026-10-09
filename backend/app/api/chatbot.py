import asyncio
import re

from fastapi import APIRouter
from pydantic import BaseModel

from app.ai.gemini_service import client


router = APIRouter(
    prefix="/chatbot",
    tags=["Chatbot"]
)


# ============================================================
# REQUEST / RESPONSE MODELS
# ============================================================

class ChatRequest(BaseModel):
    question: str
    report: dict | None = None
    language: str = "English"


class ChatResponse(BaseModel):
    success: bool
    answer: str
    language: str


# ============================================================
# GEMINI
# ============================================================

async def generate_gemini_response(prompt: str) -> str:

    last_error = None

    for attempt in range(3):

        try:

            print(
                f"Gemini chatbot request attempt "
                f"{attempt + 1}/3..."
            )

            interaction = await asyncio.wait_for(
                asyncio.to_thread(
                    client.interactions.create,
                    model="gemini-3.6-flash",
                    input=prompt
                ),
                timeout=30
            )

            answer = interaction.output_text

            if answer and answer.strip():

                print("Gemini chatbot response successful.")

                return answer.strip()

        except Exception as e:

            last_error = e

            print(
                f"Gemini chatbot attempt "
                f"{attempt + 1} failed:"
            )

            print(e)

            if attempt < 2:

                await asyncio.sleep(
                    2 * (attempt + 1)
                )

    raise last_error or Exception(
        "Gemini did not return a response."
    )


# ============================================================
# NORMALIZE TEXT
# ============================================================

def normalize_text(text: str) -> str:

    text = str(text).lower().strip()

    text = text.replace(
        "haemoglobin",
        "hemoglobin"
    )

    text = text.replace(
        "haematocrit",
        "hematocrit"
    )

    return text


# ============================================================
# GET TEST DATA
# ============================================================

def get_tests(report: dict) -> list:

    analysis = report.get(
        "analysis",
        {}
    )

    parsed_report = analysis.get(
        "parsed_report",
        {}
    )

    tests = parsed_report.get(
        "tests",
        []
    )

    if not tests:

        tests = analysis.get(
            "tests",
            []
        )

    return tests or []


# ============================================================
# FORMAT REFERENCE RANGE
# ============================================================

def format_reference(test: dict) -> str:

    reference = test.get(
        "reference_range"
    )

    if not reference:

        return "Not available"

    low = reference.get("low")
    high = reference.get("high")

    if low is not None and high is not None:

        return f"{low} - {high}"

    if high is not None:

        return f"< {high}"

    if low is not None:

        return f"> {low}"

    return "Not available"


# ============================================================
# FIND TEST
# ============================================================

def find_test(
    question: str,
    tests: list
):

    q = normalize_text(question)

    aliases = {

        "hemoglobin": [
            "hemoglobin",
            "haemoglobin",
            "hb"
        ],

        "hematocrit": [
            "hematocrit",
            "haematocrit",
            "pcv",
            "packed cell volume"
        ],

        "rbc": [
            "rbc",
            "red blood cell",
            "red blood cells"
        ],

        "mcv": [
            "mcv",
            "mean corpuscular volume"
        ],

        "mch": [
            "mch",
            "mean corpuscular hemoglobin"
        ],

        "mchc": [
            "mchc",
            "mean corpuscular hemoglobin concentration"
        ],

        "rdw": [
            "rdw",
            "red cell distribution width"
        ],

        "wbc": [
            "wbc",
            "white blood cell",
            "white blood cells"
        ],

        "platelets": [
            "platelet",
            "platelets"
        ],

        "neutrophils": [
            "neutrophil",
            "neutrophils",
            "segmented neutrophils"
        ],

        "lymphocytes": [
            "lymphocyte",
            "lymphocytes"
        ],

        "monocytes": [
            "monocyte",
            "monocytes"
        ],

        "eosinophils": [
            "eosinophil",
            "eosinophils"
        ],

        "basophils": [
            "basophil",
            "basophils"
        ]
    }

    for test in tests:

        name = normalize_text(
            str(test.get("name", ""))
        )

        for alias_list in aliases.values():

            for alias in alias_list:

                if alias in q and (
                    alias in name
                    or name in alias
                    or alias_list[0] in name
                ):

                    return test

    # Generic matching
    for test in tests:

        name = normalize_text(
            str(test.get("name", ""))
        )

        if name and name in q:

            return test

    return None


# ============================================================
# GET STATUS
# ============================================================

def get_status(test: dict) -> str:

    status = str(
        test.get(
            "status",
            "unknown"
        )
    ).lower()

    if status in [
        "low",
        "high",
        "normal"
    ]:

        return status

    return "unknown"


# ============================================================
# INSTANT TEST ANSWER
# ============================================================

def instant_test_answer(
    test: dict,
    question: str,
    language: str
):

    name = test.get(
        "name",
        "Test"
    )

    result = test.get(
        "result",
        "Unknown"
    )

    unit = test.get(
        "unit",
        ""
    )

    status = get_status(test)

    reference = format_reference(test)

    q = normalize_text(question)


    # ========================================================
    # TAMIL
    # ========================================================

    if language == "Tamil":

        # WHY LOW
        if (
            "ஏன்" in question
            and (
                "குறை" in question
                or "low" in q
            )
        ):

            if status == "low":

                return f"""
**{name}** உங்கள் அறிக்கையில் **{result} {unit}** ஆக உள்ளது.

Reference range **{reference}**.

இந்த மதிப்பு குறைவாக இருப்பதற்கு பல பொதுவான காரணங்கள் இருக்கலாம். உணவு தொடர்பான காரணங்கள், சில சத்துக்கள் குறைவாக இருப்பது அல்லது பிற மருத்துவ காரணிகள் இருக்கலாம்.

இந்த ஒரு test முடிவை மட்டும் வைத்து சரியான காரணத்தை உறுதியாகக் கூற முடியாது.

உங்கள் மருத்துவர் மற்ற test results, அறிகுறிகள் மற்றும் உங்கள் உடல்நிலை தகவல்களுடன் சேர்த்து மதிப்பிட வேண்டும்.

தேவையான follow-up பரிசோதனைகள் பற்றி மருத்துவரிடம் கேட்பது நல்லது.
"""

            return f"""
**{name}** உங்கள் அறிக்கையில் **{result} {unit}** ஆக உள்ளது.

இந்த report-ன் அடிப்படையில் இது **{status}** என்று குறிப்பிடப்பட்டுள்ளது.

இந்த ஒரு test result மட்டும் வைத்து ஒரு நோயை கண்டறிய முடியாது.

தேவையானால் உங்கள் மருத்துவரிடம் இதை follow-up செய்யுங்கள்.
"""

        # WHY HIGH
        if (
            "ஏன்" in question
            and (
                "அதிக" in question
                or "high" in q
            )
        ):

            if status == "high":

                return f"""
**{name}** உங்கள் அறிக்கையில் **{result} {unit}** ஆக உள்ளது.

Reference range **{reference}**.

இந்த மதிப்பு அதிகமாக இருப்பதற்கு பல பொதுவான காரணங்கள் இருக்கலாம்.

ஒரு test result மட்டும் வைத்து குறிப்பிட்ட காரணத்தை அல்லது நோயை உறுதியாகக் கூற முடியாது.

உங்கள் மருத்துவர் இந்த முடிவை மற்ற பரிசோதனை முடிவுகள் மற்றும் உங்கள் உடல்நிலை தகவல்களுடன் சேர்த்து மதிப்பிட வேண்டும்.
"""

            return f"""
**{name}** உங்கள் அறிக்கையில் **{result} {unit}** ஆக உள்ளது.

இந்த report-ன் அடிப்படையில் இது **{status}** என்று குறிப்பிடப்பட்டுள்ளது.

இந்த ஒரு test result மட்டும் வைத்து ஒரு நோயை கண்டறிய முடியாது.

தேவையானால் மருத்துவரிடம் follow-up செய்யுங்கள்.
"""

        # WHAT DOES TEST MEAN
        if (
            "என்ன" in question
            or "விளக்க" in question
            or "mean" in q
            or "what" in q
        ):

            return f"""
### {name}

உங்கள் முடிவு: **{result} {unit}**

Reference range: **{reference}**

Status: **{status.upper()}**

இந்த test பொதுவாக இரத்தத்தில் உள்ள **{name}** அளவை அல்லது அதன் தொடர்புடைய அளவீட்டை மதிப்பிட உதவுகிறது.

உங்கள் report-ல் உள்ள இந்த முடிவை தனியாக வைத்து diagnosis செய்ய முடியாது.

மற்ற test results மற்றும் மருத்துவரின் clinical assessment முக்கியம்.
"""


    # ========================================================
    # ENGLISH
    # ========================================================

    # WHY LOW
    if (
        "why" in q
        and (
            "low" in q
            or "lower" in q
        )
    ):

        if status == "low":

            return f"""
**{name}** is **{result} {unit}** in your report.

The reference range shown is **{reference}**.

There can be several general reasons why this value may be low. Depending on the test, possibilities can include nutritional factors, changes in blood production, or other medical factors.

A single laboratory result cannot determine the exact cause or diagnose a condition.

Your doctor should interpret this result together with your other test results, symptoms, and medical history.
"""

        return f"""
Your **{name}** result is **{result} {unit}**.

Based on the uploaded report, it is marked as **{status}**.

A single laboratory value cannot establish a diagnosis.

Please discuss the result with your healthcare professional if you have concerns.
"""


    # WHY HIGH
    if (
        "why" in q
        and (
            "high" in q
            or "higher" in q
        )
    ):

        if status == "high":

            return f"""
**{name}** is **{result} {unit}** in your report.

The reference range shown is **{reference}**.

There can be several possible reasons for an elevated result.

The exact reason cannot be determined from this value alone.

Your doctor should interpret it together with your other results, symptoms, and medical history.
"""

        return f"""
Your **{name}** result is **{result} {unit}**.

Based on the uploaded report, it is marked as **{status}**.

A single laboratory value cannot establish a diagnosis.

Please discuss the result with your healthcare professional if you have concerns.
"""


    # WHAT DOES IT MEAN
    if (
        "what" in q
        or "explain" in q
        or "mean" in q
        or "meaning" in q
    ):

        return f"""
### {name}

Your result: **{result} {unit}**

Reference range: **{reference}**

Status: **{status.upper()}**

This test generally helps assess the level or characteristic represented by **{name}** in your blood report.

This result should not be interpreted as a diagnosis by itself.

Other laboratory results and your healthcare professional's assessment are important.
"""

    return None


# ============================================================
# INSTANT ABNORMAL RESULTS
# ============================================================

def abnormal_results_answer(
    tests: list,
    language: str
):

    abnormal = []

    for test in tests:

        status = get_status(test)

        if status in [
            "low",
            "high"
        ]:

            abnormal.append(test)


    if language == "Tamil":

        if not abnormal:

            return """
உங்கள் report-ல் தற்போது **low அல்லது high** என்று குறிப்பிடப்பட்ட abnormal values எதுவும் இல்லை.
"""

        lines = []

        for test in abnormal:

            name = test.get(
                "name",
                "Unknown"
            )

            result = test.get(
                "result",
                "Unknown"
            )

            unit = test.get(
                "unit",
                ""
            )

            status = get_status(test)

            lines.append(
                f"- **{name}**: {result} {unit} — **{status.upper()}**"
            )

        return (
            "உங்கள் report-ல் abnormal என்று குறிப்பிடப்பட்ட மதிப்புகள்:\n\n"
            + "\n".join(lines)
            + """

இந்த முடிவுகளை மட்டும் வைத்து நோயை உறுதியாக கண்டறிய முடியாது.

மருத்துவரின் clinical assessment முக்கியம்.
"""
        )


    if not abnormal:

        return """
No values in the uploaded report are currently marked as low or high.
"""

    lines = []

    for test in abnormal:

        name = test.get(
            "name",
            "Unknown"
        )

        result = test.get(
            "result",
            "Unknown"
        )

        unit = test.get(
            "unit",
            ""
        )

        status = get_status(test)

        lines.append(
            f"- **{name}**: {result} {unit} — **{status.upper()}**"
        )

    return (
        "The values marked as abnormal in your report are:\n\n"
        + "\n".join(lines)
        + """

These results alone cannot establish a diagnosis.

A healthcare professional should interpret them together with your clinical information.
"""
    )


# ============================================================
# REPORT SUMMARY
# ============================================================

def report_summary_answer(
    tests: list,
    patient_name: str,
    language: str
):

    abnormal = []
    normal = []
    unknown = []

    for test in tests:

        status = get_status(test)

        if status in [
            "low",
            "high"
        ]:

            abnormal.append(test)

        elif status == "normal":

            normal.append(test)

        else:

            unknown.append(test)


    if language == "Tamil":

        response = f"""
### {patient_name} அவர்களின் அறிக்கை சுருக்கம்

மொத்தமாக **{len(tests)}** test values உள்ளன.

**Abnormal values: {len(abnormal)}**

"""

        for test in abnormal:

            response += (
                f"- **{test.get('name', 'Unknown')}**: "
                f"{test.get('result', 'Unknown')} "
                f"{test.get('unit', '')} — "
                f"{get_status(test).upper()}\n"
            )

        response += f"""

**Normal values: {len(normal)}**

**Verification தேவைப்படும் values: {len(unknown)}**

இந்த summary ஒரு diagnosis அல்ல.

உங்கள் மருத்துவர் முழு report-ஐ clinical information-உடன் மதிப்பிட வேண்டும்.
"""

        return response


    response = f"""
### {patient_name}'s Report Summary

There are **{len(tests)}** test values in the uploaded report.

**Abnormal values: {len(abnormal)}**

"""

    for test in abnormal:

        response += (
            f"- **{test.get('name', 'Unknown')}**: "
            f"{test.get('result', 'Unknown')} "
            f"{test.get('unit', '')} — "
            f"{get_status(test).upper()}\n"
        )

    response += f"""

**Normal values: {len(normal)}**

**Values requiring verification: {len(unknown)}**

This summary is not a diagnosis.

Your healthcare professional should interpret the complete report together with your clinical information.
"""

    return response


# ============================================================
# SIMPLE REPORT FALLBACK
# ============================================================

def useful_fallback(
    tests: list,
    patient_name: str,
    question: str,
    language: str
):

    abnormal = [
        test
        for test in tests
        if get_status(test) in ["low", "high"]
    ]

    if language == "Tamil":

        response = f"""
உங்கள் கேள்விக்கு report-ஐ அடிப்படையாக வைத்து பதிலளிக்கிறேன்.

**{patient_name}** அவர்களின் report-ல் மொத்தம் **{len(tests)}** test values உள்ளன.

"""

        if abnormal:

            response += (
                f"தற்போது **{len(abnormal)}** values low அல்லது high என்று குறிப்பிடப்பட்டுள்ளன:\n\n"
            )

            for test in abnormal:

                name = test.get(
                    "name",
                    "Unknown"
                )

                result = test.get(
                    "result",
                    "Unknown"
                )

                unit = test.get(
                    "unit",
                    ""
                )

                status = get_status(test)

                response += (
                    f"- **{name}**: "
                    f"{result} {unit} — "
                    f"**{status.upper()}**\n"
                )

            response += """

இந்த values ஒன்றாகப் பார்க்கும்போது மருத்துவரின் clinical assessment முக்கியம். இந்த report மட்டும் வைத்து diagnosis செய்ய முடியாது.

நீங்கள் கேட்ட கேள்வியை இன்னும் குறிப்பாக கேட்டால், report-ல் உள்ள values-ஐ வைத்து விளக்க முடியும்.
"""

        else:

            response += """
இந்த report-ல் low அல்லது high என்று குறிப்பிடப்பட்ட values தற்போது இல்லை.

இந்த report மட்டும் வைத்து diagnosis செய்ய முடியாது. உங்கள் கேள்வியை இன்னும் குறிப்பாக கேட்டால் report-ஐ வைத்து விளக்க முடியும்.
"""

        return response


    response = f"""
I can answer your question using **{patient_name}'s uploaded report**.

The report contains **{len(tests)}** test values.

"""

    if abnormal:

        response += (
            f"Currently, **{len(abnormal)}** values are marked as low or high:\n\n"
        )

        for test in abnormal:

            name = test.get(
                "name",
                "Unknown"
            )

            result = test.get(
                "result",
                "Unknown"
            )

            unit = test.get(
                "unit",
                ""
            )

            status = get_status(test)

            response += (
                f"- **{name}**: "
                f"{result} {unit} — "
                f"**{status.upper()}**\n"
            )

        response += """

These results should be interpreted together with your symptoms and medical history. The report alone cannot establish a diagnosis.

You can ask your question again with more detail and I can relate it to the values in your report.
"""

    else:

        response += """
No values are currently marked as low or high.

The report alone cannot establish a diagnosis. You can ask a more specific question and I can explain it using your report.
"""

    return response


# ============================================================
# BUILD COMPLETE REPORT FOR GEMINI
# ============================================================

def build_report_context(
    report: dict,
    tests: list
) -> str:

    patient_name = report.get(
        "patientName",
        "Patient"
    )

    report_type = report.get(
        "reportType",
        "Medical Report"
    )

    age = report.get(
        "patientAge",
        report.get(
            "age",
            "Not provided"
        )
    )

    relationship = report.get(
        "relationship",
        ""
    )

    report_data = ""

    for test_item in tests:

        name = test_item.get(
            "name",
            "Unknown"
        )

        result = test_item.get(
            "result",
            "Unknown"
        )

        unit = test_item.get(
            "unit",
            ""
        )

        status = test_item.get(
            "status",
            "unknown"
        )

        reference = format_reference(
            test_item
        )

        report_data += (
            f"- {name}: "
            f"{result} {unit} | "
            f"Reference: {reference} | "
            f"Status: {status}\n"
        )

    warnings = (
        report
        .get("analysis", {})
        .get("parsed_report", {})
        .get("warnings", [])
    )

    warning_data = "\n".join(
        f"- {warning}"
        for warning in warnings
    )

    return f"""
Patient name: {patient_name}
Age: {age}
Relationship: {relationship}
Report type: {report_type}

LABORATORY RESULTS:
{report_data}

REPORT WARNINGS:
{warning_data if warning_data else "None provided"}
"""


# ============================================================
# MAIN CHAT ENDPOINT
# ============================================================

@router.post(
    "/chat",
    response_model=ChatResponse
)
async def chat_with_medical_report(
    request: ChatRequest
):

    report = request.report or {}

    language = request.language.strip()

    if language not in [
        "English",
        "Tamil"
    ]:

        language = "English"

    question = request.question.strip()

    tests = get_tests(report)

    patient_name = report.get(
        "patientName",
        "Patient"
    )

    q = normalize_text(question)


    # ========================================================
    # 1. INSTANT: ABNORMAL VALUES
    # ========================================================

    abnormal_keywords = [

        "which values are abnormal",
        "what values are abnormal",
        "abnormal values",
        "abnormal results",
        "which tests are abnormal",

        "எந்த மதிப்புகள் abnormal",
        "எந்த values abnormal",
        "abnormal"
    ]

    if any(
        keyword in q
        for keyword in abnormal_keywords
    ):

        answer = abnormal_results_answer(
            tests,
            language
        )

        return ChatResponse(
            success=True,
            answer=answer,
            language=language
        )


    # ========================================================
    # 2. INSTANT: REPORT SUMMARY
    # ========================================================

    summary_keywords = [

        "explain my report",
        "explain the report",
        "summarize my report",
        "summary of my report",
        "explain my whole report",
        "report summary",

        "முழு அறிக்கை",
        "அறிக்கையை விளக்குங்கள்",
        "எனது அறிக்கையை எளிமையாக விளக்குங்கள்"
    ]

    if any(
        keyword in q
        for keyword in summary_keywords
    ):

        answer = report_summary_answer(
            tests,
            patient_name,
            language
        )

        return ChatResponse(
            success=True,
            answer=answer,
            language=language
        )


    # ========================================================
    # 3. INSTANT: SPECIFIC TEST
    # ========================================================

    test = find_test(
        question,
        tests
    )

    if test:

        answer = instant_test_answer(
            test,
            question,
            language
        )

        if answer:

            return ChatResponse(
                success=True,
                answer=answer,
                language=language
            )


    # ========================================================
    # 4. GENERATIVE GEMINI
    # ========================================================

    report_context = build_report_context(
        report,
        tests
    )

    if language == "Tamil":

        language_instruction = """
Respond entirely in simple, natural Tamil.

You may keep medical test names and standard abbreviations such as:
MCV, Hemoglobin, RBC, WBC, MCH, MCHC, RDW, Platelets, Hematocrit.

Do not unnecessarily translate medical test names.

If the user asks in Tamil, answer naturally in Tamil.
"""

    else:

        language_instruction = """
Respond entirely in clear, natural English.
"""


    prompt = f"""
You are MedVerse AI, a medical report explanation assistant.

You are having a conversation with a patient about their uploaded laboratory report.

IMPORTANT:
The user is allowed to ask questions in their own words.

Do NOT require the question to match a predefined keyword.

Understand the user's actual intent and answer naturally.

============================================================
PATIENT REPORT
============================================================

{report_context}

============================================================
USER QUESTION
============================================================

{question}

============================================================
LANGUAGE
============================================================

{language_instruction}

============================================================
HOW TO ANSWER
============================================================

1. Use the uploaded report as the primary source.

2. If the question refers to a specific value, use that exact value.

3. If the question refers to multiple abnormal or low/high values, consider them together.

4. If the user asks why something may be abnormal, explain reasonable general possibilities but do not claim a diagnosis.

5. If the user asks what they should do, give safe general next steps such as discussing the findings with a healthcare professional, appropriate follow-up, nutrition/lifestyle considerations when relevant, and seeking medical attention when symptoms are concerning.

6. If the user asks whether something is concerning, explain the pattern in the report without creating unnecessary fear.

7. If the user asks about relationships between test results, explain possible relationships carefully and clearly distinguish possibilities from confirmed causes.

8. If the user's question is not directly answered by the uploaded report, say what can and cannot be concluded from the report.

9. Never invent laboratory values.

10. Never change a laboratory value.

11. Never diagnose a disease from the report alone.

12. Never prescribe medication.

13. Never tell the user to start, stop, or change medication.

14. Do not pretend to know symptoms, medical history, or other information that is not provided.

15. Keep the answer conversational and easy to understand.

16. Do not simply repeat the entire report unless the user asks for a complete summary.

17. Answer the user's actual question first.

18. When useful, mention the relevant test name and value from the report.

19. If the question is broad, organize the answer with short headings or bullet points.

20. Do not say that you are unable to answer merely because the question is phrased differently from predefined examples.

============================================================
SAFETY
============================================================

This is educational report explanation, not diagnosis.

If the report contains abnormal results, explain them carefully.

If the user describes severe or urgent symptoms, recommend appropriate urgent medical evaluation.

Now answer the user's question.
"""


    try:

        answer = await generate_gemini_response(
            prompt
        )

        return ChatResponse(
            success=True,
            answer=answer,
            language=language
        )


    except Exception as e:

        print(
            "Gemini unavailable for generative question:",
            e
        )

        # ====================================================
        # USEFUL FALLBACK
        # ====================================================

        answer = useful_fallback(
            tests,
            patient_name,
            question,
            language
        )

        return ChatResponse(
            success=True,
            answer=answer,
            language=language
        )