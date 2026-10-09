"""
MedVerse AI
Longitudinal Medical Report Progress API

Provides chronological comparison of medical reports
for the same patient.

Also provides Gemini-powered longitudinal summaries
in English and Tamil.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from app.ai.gemini_service import client
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.database.mongodb import get_database
from app.dependencies.auth import get_current_user


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/reports",
    tags=["Report Progress"],
)


# ============================================================
# HELPERS
# ============================================================

def serialize_datetime(value: Any) -> str | None:
    """
    Convert MongoDB datetime values to ISO strings.
    """

    if isinstance(value, datetime):
        return value.isoformat()

    if value is None:
        return None

    return str(value)


def get_report_date(report: dict[str, Any]) -> datetime:
    """
    Safely get report creation date.
    """

    value = report.get("created_at")

    if isinstance(value, datetime):
        return value

    if isinstance(value, str):
        try:
            return datetime.fromisoformat(
                value.replace("Z", "+00:00")
            )
        except ValueError:
            pass

    return datetime.min


def calculate_change(
    previous: float,
    latest: float,
) -> dict[str, Any]:
    """
    Calculate absolute and percentage change.
    """

    change = latest - previous

    if previous == 0:
        percentage_change = None
    else:
        percentage_change = (
            (change / abs(previous)) * 100
        )

    if change > 0:
        direction = "increased"
    elif change < 0:
        direction = "decreased"
    else:
        direction = "unchanged"

    return {
        "change": round(change, 4),
        "percentage_change": (
            round(
                percentage_change,
                2,
            )
            if percentage_change is not None
            else None
        ),
        "direction": direction,
    }


def normalize_test_name(name: str) -> str:
    """
    Normalize test names so equivalent tests
    can be matched across reports.
    """

    value = (
        name
        .strip()
        .lower()
    )

    replacements = {
        "haemoglobin": "hemoglobin",
        "pcv": "hematocrit",
        "packed cell volume": "hematocrit",
        "total leukocyte count": "wbc",
        "total leucocyte count": "wbc",
        "tlc": "wbc",
        "platelet count": "platelets",
        "platelet": "platelets",
        "segmented neutrophils (%)": "segmented neutrophils",
        "neutrophils (%)": "neutrophils percentage",
        "lymphocytes (%)": "lymphocytes percentage",
        "monocytes (%)": "monocytes percentage",
        "eosinophils (%)": "eosinophils percentage",
        "basophils (%)": "basophils percentage",
    }

    return replacements.get(
        value,
        value,
    )


def build_test_key(
    test: dict[str, Any],
) -> str:
    """
    Build a stable key using normalized test name
    and unit.

    Unit is included so percentage values and
    absolute values are not accidentally compared.
    """

    name = normalize_test_name(
        str(
            test.get(
                "name",
                "",
            )
        )
    )

    unit = (
        str(
            test.get(
                "unit",
                "",
            )
        )
        .strip()
        .lower()
    )

    return f"{name}|{unit}"


# ============================================================
# PATIENT FILTER
# ============================================================

def build_patient_filter(
    user_id: str,
    patient_type: str,
    family_member_id: str | None,
) -> dict[str, Any]:

    query: dict[str, Any] = {
        "user_id": user_id,
    }

    # --------------------------------------------------------
    # SELF
    # --------------------------------------------------------

    if patient_type == "self":

        query["patient_type"] = "self"

    # --------------------------------------------------------
    # FAMILY
    # --------------------------------------------------------

    elif patient_type == "family":

        if not family_member_id:
            raise HTTPException(
                status_code=400,
                detail=(
                    "family_member_id is required "
                    "for family reports."
                ),
            )

        try:
            family_object_id = ObjectId(
                family_member_id
            )

        except Exception:
            raise HTTPException(
                status_code=400,
                detail="Invalid family_member_id.",
            )

        query["patient_type"] = "family"

        query["family_member_id"] = (
            family_object_id
        )

    # --------------------------------------------------------
    # INVALID
    # --------------------------------------------------------

    else:

        raise HTTPException(
            status_code=400,
            detail=(
                "patient_type must be "
                "'self' or 'family'."
            ),
        )

    return query


# ============================================================
# GET LONGITUDINAL PROGRESS
# ============================================================

@router.get("/progress")
async def get_report_progress(
    patient_type: str = Query(
        "self",
        description="Patient type: self or family",
    ),

    family_member_id: str | None = Query(
        None,
        description="MongoDB family member ID",
    ),

    current_user: dict[str, Any] = Depends(
        get_current_user
    ),
):
    """
    Return longitudinal report comparison
    for one patient.
    """

    database = get_database()

    # --------------------------------------------------------
    # CURRENT USER
    # --------------------------------------------------------

    user_id = str(
        current_user.get(
            "user_id"
        )
    )

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid authenticated user.",
        )

    # --------------------------------------------------------
    # PATIENT FILTER
    # --------------------------------------------------------

    query = build_patient_filter(
        user_id=user_id,
        patient_type=patient_type,
        family_member_id=family_member_id,
    )

    # --------------------------------------------------------
    # FETCH REPORTS
    # --------------------------------------------------------

    cursor = (
        database.reports
        .find(query)
        .sort(
            "created_at",
            1,
        )
    )

    reports = await cursor.to_list(
        length=None
    )

    # --------------------------------------------------------
    # NO REPORTS
    # --------------------------------------------------------

    if not reports:
        return {
            "patient_type": patient_type,
            "family_member_id": family_member_id,
            "report_count": 0,
            "reports": [],
            "trends": [],
            "message": "No reports found for this patient.",
        }

    # --------------------------------------------------------
    # REPORT SUMMARY
    # --------------------------------------------------------

    report_summaries = []

    for report in reports:

        report_summaries.append(
            {
                "report_id": str(
                    report.get("_id")
                ),

                "filename": report.get(
                    "filename"
                ),

                "report_type": (
                    report.get(
                        "report_type"
                    )
                    or report.get(
                        "parsed_report",
                        {},
                    ).get(
                        "report_type"
                    )
                ),

                "created_at": serialize_datetime(
                    report.get(
                        "created_at"
                    )
                ),

                "patient_name": report.get(
                    "patient_name"
                ),

                "patient_type": report.get(
                    "patient_type"
                ),

                "family_member_id": (
                    str(
                        report.get(
                            "family_member_id"
                        )
                    )
                    if report.get(
                        "family_member_id"
                    )
                    else None
                ),
            }
        )

    # --------------------------------------------------------
    # COLLECT TEST VALUES
    # --------------------------------------------------------

    grouped_tests: dict[
        str,
        dict[str, Any],
    ] = {}

    for report in reports:

        report_id = str(
            report.get("_id")
        )

        created_at = serialize_datetime(
            report.get(
                "created_at"
            )
        )

        parsed_report = report.get(
            "parsed_report",
            {},
        )

        tests = parsed_report.get(
            "tests",
            [],
        )

        if not isinstance(
            tests,
            list,
        ):
            continue

        for test in tests:

            if not isinstance(
                test,
                dict,
            ):
                continue

            result = test.get(
                "result"
            )

            if not isinstance(
                result,
                (int, float),
            ):
                continue

            key = build_test_key(
                test
            )

            if key not in grouped_tests:

                grouped_tests[key] = {
                    "name": test.get(
                        "name"
                    ),

                    "unit": test.get(
                        "unit",
                        "",
                    ),

                    "measurements": [],
                }

            grouped_tests[key][
                "measurements"
            ].append(
                {
                    "report_id": report_id,

                    "date": created_at,

                    "value": float(
                        result
                    ),

                    "status": test.get(
                        "status"
                    ),

                    "reference_range": test.get(
                        "reference_range"
                    ),

                    "filename": report.get(
                        "filename"
                    ),
                }
            )

    # --------------------------------------------------------
    # BUILD TRENDS
    # --------------------------------------------------------

    trends = []

    for key, trend_data in grouped_tests.items():

        measurements = trend_data[
            "measurements"
        ]

        measurements.sort(
            key=lambda item: (
                item["date"] or ""
            )
        )

        # At least two measurements
        # are required for a trend.

        if len(measurements) < 2:
            continue

        first = measurements[0]

        latest = measurements[-1]

        change_data = calculate_change(
            previous=float(
                first["value"]
            ),

            latest=float(
                latest["value"]
            ),
        )

        trends.append(
            {
                "test_name": trend_data[
                    "name"
                ],

                "unit": trend_data[
                    "unit"
                ],

                "measurements": measurements,

                "first_value": first[
                    "value"
                ],

                "latest_value": latest[
                    "value"
                ],

                "first_date": first[
                    "date"
                ],

                "latest_date": latest[
                    "date"
                ],

                "previous_value": (
                    measurements[-2][
                        "value"
                    ]
                    if len(
                        measurements
                    ) >= 2
                    else None
                ),

                "change": change_data[
                    "change"
                ],

                "percentage_change": change_data[
                    "percentage_change"
                ],

                "direction": change_data[
                    "direction"
                ],
            }
        )

    # --------------------------------------------------------
    # SORT TRENDS
    # --------------------------------------------------------

    trends.sort(
        key=lambda item:
            item["test_name"]
    )

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {
        "patient_type": patient_type,

        "family_member_id": family_member_id,

        "report_count": len(
            reports
        ),

        "reports": report_summaries,

        "trends": trends,

        "message": (
            "Longitudinal comparison "
            "generated successfully."
        ),
    }


# ============================================================
# GEMINI SUMMARY REQUEST MODEL
# ============================================================

class ProgressSummaryRequest(BaseModel):

    patient_type: str

    family_member_id: str | None = None

    language: str = "English"


# ============================================================
# GEMINI LONGITUDINAL SUMMARY
# ============================================================

@router.post("/progress/summary")
async def generate_progress_summary(
    request: ProgressSummaryRequest,

    current_user: dict[str, Any] = Depends(
        get_current_user
    ),
):
    """
    Generate an AI summary of longitudinal
    medical report trends.

    Supports English and Tamil.
    """

    # --------------------------------------------------------
    # CURRENT USER
    # --------------------------------------------------------

    user_id = str(
        current_user.get(
            "user_id"
        )
    )

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid authenticated user.",
        )

    database = get_database()

    # --------------------------------------------------------
    # VALIDATE PATIENT TYPE
    # --------------------------------------------------------

    if request.patient_type not in [
        "self",
        "family",
    ]:

        raise HTTPException(
            status_code=400,
            detail=(
                "patient_type must be "
                "'self' or 'family'."
            ),
        )

    # --------------------------------------------------------
    # FAMILY MEMBER VALIDATION
    # --------------------------------------------------------

    family_object_id = None

    if request.patient_type == "family":

        if not request.family_member_id:

            raise HTTPException(
                status_code=400,
                detail=(
                    "family_member_id is required "
                    "for family reports."
                ),
            )

        try:

            family_object_id = ObjectId(
                request.family_member_id
            )

        except Exception:

            raise HTTPException(
                status_code=400,
                detail="Invalid family_member_id.",
            )

    # --------------------------------------------------------
    # BUILD QUERY
    # --------------------------------------------------------

    query = {
        "user_id": user_id,

        "patient_type":
            request.patient_type,
    }

    if request.patient_type == "family":

        query["family_member_id"] = (
            family_object_id
        )

    # --------------------------------------------------------
    # FETCH REPORTS
    # --------------------------------------------------------

    reports = await (
        database.reports
        .find(query)
        .sort(
            "created_at",
            1,
        )
        .to_list(
            length=100
        )
    )

    if not reports:

        raise HTTPException(
            status_code=404,
            detail=(
                "No medical reports found "
                "for this patient."
            ),
        )

    # --------------------------------------------------------
    # BUILD LONGITUDINAL DATA
    # --------------------------------------------------------

    longitudinal_data = []

    for report in reports:

        parsed_report = report.get(
            "parsed_report",
            {},
        )

        tests = parsed_report.get(
            "tests",
            [],
        )

        # Fallback for reports where tests
        # are stored directly.

        if not tests:

            tests = report.get(
                "tests",
                [],
            )

        report_date = report.get(
            "created_at"
        )

        if hasattr(
            report_date,
            "strftime",
        ):

            report_date = (
                report_date.strftime(
                    "%Y-%m-%d"
                )
            )

        else:

            report_date = str(
                report_date
            )

        report_data = {
            "date": report_date,

            "report": report.get(
                "filename",
                "Medical Report",
            ),

            "tests": [],
        }

        for test in tests:

            if not isinstance(
                test,
                dict,
            ):
                continue

            report_data[
                "tests"
            ].append(
                {
                    "name": test.get(
                        "name"
                    ),

                    "value": test.get(
                        "result"
                    ),

                    "unit": test.get(
                        "unit"
                    ),

                    "status": test.get(
                        "status"
                    ),

                    "reference_range": test.get(
                        "reference_range"
                    ),
                }
            )

        longitudinal_data.append(
            report_data
        )

    # --------------------------------------------------------
    # LANGUAGE
    # --------------------------------------------------------

    if (
        request.language
        and request.language.lower()
        == "tamil"
    ):

        language = "Tamil"

    else:

        language = "English"

    # --------------------------------------------------------
    # MEDICAL LONGITUDINAL PROMPT
    # --------------------------------------------------------

    prompt = f"""
You are MedVerse AI, a medical
report explanation assistant.

Analyze the longitudinal laboratory
data below.

IMPORTANT SAFETY RULES:

- This is an informational summary,
  not a medical diagnosis.

- Do not prescribe medication.

- Do not tell the patient to start
  or stop treatment.

- Do not invent missing values.

- Mention trends only when supported
  by the supplied data.

- Clearly mention whether values are
  stable, increasing, decreasing,
  or fluctuating.

- If all values are unchanged,
  explicitly state that the values
  remained stable.

- Use simple language that a normal
  patient can understand.

- Encourage consultation with a
  qualified healthcare professional
  for medical interpretation.

Patient type:
{request.patient_type}

Number of reports:
{len(longitudinal_data)}

Longitudinal laboratory data:

{longitudinal_data}

Generate the summary in:

{language}

Use this structure:

1. Overall Trend

2. Important Changes

3. Stable Results

4. What This Means

5. Medical Disclaimer

Keep the response concise but useful.

Do not provide a diagnosis.
"""

    # --------------------------------------------------------
    # GENERATE GEMINI RESPONSE
    # --------------------------------------------------------

    try:

        interaction = client.interactions.create(
            model="gemini-3.6-flash",
            input=prompt
        )

        summary = (
            interaction.output_text.strip()
            if interaction.output_text
            else ""
        )

        if not summary:

            raise ValueError(
                "Gemini returned an empty response."
            )

    except Exception as e:

        print(
            "Gemini longitudinal summary error:",
            e,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to generate "
                "AI progress summary."
            ),
        )

    # --------------------------------------------------------
    # FINAL RESPONSE
    # --------------------------------------------------------

    return {
        "success": True,

        "language": language,

        "summary": summary,

        "report_count": len(
            longitudinal_data
        ),
    }