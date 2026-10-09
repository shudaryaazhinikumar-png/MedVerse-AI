
"""
MedVerse AI - Medical Report Parser
Supports English/Tamil OCR text, multiline CBC reports,
reference ranges, and explicit low/high flags.

Backward-compatible:
    from app.ocr.report_parser import parse_cbc_report
"""

from __future__ import annotations

import re
import math
from typing import Any


NUMBER_PATTERN = r"[-+]?\d+(?:\.\d+)?"


# ---------------------------------------------------------
# TEST LABELS
# Longest matching label wins: MCHC before MCH.
# ---------------------------------------------------------

TESTS = [
    (("mean cell haemoglobin concentration",
      "mean cell hemoglobin concentration",
      "mean corpuscular haemoglobin concentration",
      "mean corpuscular hemoglobin concentration",
      "mchc"), "MCHC", "g/dL"),

    (("mean cell haemoglobin", "mean cell hemoglobin",
      "mean corpuscular haemoglobin", "mean corpuscular hemoglobin",
      "mch"), "MCH", "pg"),

    (("mean corpuscular volume", "mcv"), "MCV", "fL"),

    (("hemoglobin", "haemoglobin"), "Hemoglobin", "g/dL"),

    (("total leukocyte count", "total leucocyte count",
      "total white blood cell count", "white blood cell count",
      "wbc count", "tlc"), "WBC", "cells/cumm"),

    (("total red blood cell count", "total rbc count",
      "red blood cell count", "rbc count", "rbc"),
     "RBC", "million/cumm"),

    (("hematocrit value", "packed cell volume",
      "hematocrit", "haematocrit", "pcv", "hct"),
     "Hematocrit", "%"),

    (("platelet count", "platelets"), "Platelets", "lakhs/cumm"),

    (("red cell distribution width", "rdw"), "RDW", "%"),

    (("segmented neutrophils",), "Segmented Neutrophils (%)", "%"),
    (("neutrophils", "neutrophil"), "Neutrophils (%)", "%"),
    (("lymphocytes", "lymphocyte"), "Lymphocytes (%)", "%"),
    (("monocytes", "monocyte"), "Monocytes (%)", "%"),
    (("eosinophils", "eosinophil"), "Eosinophils (%)", "%"),
    (("basophils", "basophil"), "Basophils (%)", "%"),

    (("hdl cholesterol", "hdl"), "HDL Cholesterol", "mg/dL"),
    (("ldl cholesterol", "ldl"), "LDL Cholesterol", "mg/dL"),
    (("total cholesterol", "cholesterol"), "Total Cholesterol", "mg/dL"),
    (("triglycerides", "triglyceride"), "Triglycerides", "mg/dL"),
    (("fasting blood sugar", "fasting glucose"), "Fasting Glucose", "mg/dL"),
    (("random blood sugar", "blood glucose", "glucose"), "Glucose", "mg/dL"),
    (("hba1c", "hemoglobin a1c", "haemoglobin a1c"), "HbA1c", "%"),
    (("thyroid stimulating hormone", "tsh"), "TSH", "µIU/mL"),
    (("serum creatinine", "creatinine"), "Creatinine", "mg/dL"),
    (("blood urea", "urea"), "Urea", "mg/dL"),
    (("total bilirubin", "bilirubin"), "Bilirubin", "mg/dL"),
    (("sgot", "ast"), "AST (SGOT)", "U/L"),
    (("sgpt", "alt"), "ALT (SGPT)", "U/L"),
]


# Common Tamil test-name aliases.
TAMIL_TESTS = [
    (("ஹீமோகுளோபின்",), "Hemoglobin", "g/dL"),
    (("வெள்ளை இரத்த அணுக்களின் எண்ணிக்கை",
      "வெள்ளை இரத்த அணுக்கள்"), "WBC", "cells/cumm"),
    (("சிவப்பு இரத்த அணுக்களின் எண்ணிக்கை",
      "சிவப்பு இரத்த அணுக்கள்"), "RBC", "million/cumm"),
    (("தட்டணுக்கள்", "பிளேட்லெட் எண்ணிக்கை"),
     "Platelets", "lakhs/cumm"),
    (("லிம்போசைட்டுகள்", "லிம்போசைட்"), "Lymphocytes (%)", "%"),
    (("மோனோசைட்டுகள்", "மோனோசைட்"), "Monocytes (%)", "%"),
    (("நியூட்ரோபில்கள்", "நியூட்ரோபில்"), "Neutrophils (%)", "%"),
    (("ஈசினோபில்கள்", "ஈசினோபில்"), "Eosinophils (%)", "%"),
    (("பேசோபில்கள்", "பேசோபில்"), "Basophils (%)", "%"),
]


# ---------------------------------------------------------
# NORMALIZATION
# ---------------------------------------------------------

def normalize_label(text: str) -> str:
    text = text.lower()
    text = text.replace("haemoglobin", "hemoglobin")
    text = text.replace("haematocrit", "hematocrit")
    text = text.replace("–", "-").replace("—", "-").replace("−", "-")
    text = text.replace("ﬁ", "fi").replace("ﬂ", "fl")

    text = re.sub(
        r"[^a-z0-9%()/.,<>+\-\s\u0B80-\u0BFF]",
        " ",
        text,
    )

    return re.sub(r"\s+", " ", text).strip()


def extract_numbers(text: str) -> list[float]:
    return [
        float(number)
        for number in re.findall(NUMBER_PATTERN, text)
    ]


# ---------------------------------------------------------
# REFERENCE RANGES
#
# IMPORTANT:
# Do not use infinity (-inf / inf). JSON cannot serialize
# infinite floating-point values.
#
# Examples:
# 20-40 -> {"low": 20, "high": 40}
# <2    -> {"comparison": "<", "limit": 2}
# >5    -> {"comparison": ">", "limit": 5}
# ---------------------------------------------------------

def parse_reference_range(text: str) -> dict[str, Any] | None:
    text = normalize_label(text)

    match = re.search(
        r"(?<![\d.])(\d+(?:\.\d+)?)\s*(?:-|to)\s*"
        r"(\d+(?:\.\d+)?)(?![\d.])",
        text,
    )

    if match:
        low = float(match.group(1))
        high = float(match.group(2))

        if low <= high:
            return {"low": low, "high": high}

    match = re.search(
        r"(?<![\w.])<\s*(\d+(?:\.\d+)?)",
        text,
    )

    if match:
        return {
            "comparison": "<",
            "limit": float(match.group(1)),
        }

    match = re.search(
        r"(?<![\w.])>\s*(\d+(?:\.\d+)?)",
        text,
    )

    if match:
        return {
            "comparison": ">",
            "limit": float(match.group(1)),
        }

    return None


def get_status(
    value: float,
    reference: dict[str, Any] | None,
) -> str:
    if reference is None:
        return "unknown"

    if "comparison" in reference:
        comparison = reference["comparison"]
        limit = reference["limit"]

        if comparison == "<":
            return "normal" if value < limit else "high"

        if comparison == ">":
            return "normal" if value > limit else "low"

        return "unknown"

    low = reference["low"]
    high = reference["high"]

    if value < low:
        return "low"

    if value > high:
        return "high"

    return "normal"


# ---------------------------------------------------------
# REPORT TYPE DETECTION
# ---------------------------------------------------------

def detect_report_type(text: str) -> str:
    lower = text.lower()

    if (
        any(term in lower for term in (
            "complete blood count",
            "cbc",
            "hemoglobin",
            "leukocyte count",
            "leucocyte count",
            "mchc",
            "mcv",
        ))
        or any(term in text for term in (
            "ஹீமோகுளோபின்",
            "லிம்போசைட்டுகள்",
        ))
    ):
        return "CBC"

    if "lipid profile" in lower or "cholesterol" in lower:
        return "Lipid Profile"

    if "thyroid" in lower or re.search(r"\btsh\b", lower):
        return "Thyroid"

    if any(term in lower for term in (
        "liver function", "bilirubin", "sgot", "sgpt",
    )):
        return "Liver Function"

    if any(term in lower for term in (
        "kidney function", "creatinine", "blood urea",
    )):
        return "Kidney Function"

    if "glucose" in lower or "hba1c" in lower:
        return "Diabetes"

    return "Unknown"


# ---------------------------------------------------------
# TEST LABEL MATCHING
# ---------------------------------------------------------

def _find_test_label(line: str):
    normalized = normalize_label(line)
    candidates = []

    for aliases, canonical, unit in TESTS + TAMIL_TESTS:
        for alias in aliases:
            alias_normalized = normalize_label(alias)

            is_tamil = any(
                "\u0B80" <= char <= "\u0BFF"
                for char in alias_normalized
            )

            if is_tamil:
                position = normalized.find(alias_normalized)

                if position >= 0:
                    candidates.append((
                        len(alias_normalized),
                        position,
                        position + len(alias_normalized),
                        alias_normalized,
                        canonical,
                        unit,
                    ))

            else:
                pattern = (
                    r"(?<![a-z0-9])"
                    + re.escape(alias_normalized)
                    + r"(?![a-z0-9])"
                )

                match = re.search(pattern, normalized)

                if match:
                    candidates.append((
                        len(alias_normalized),
                        match.start(),
                        match.end(),
                        alias_normalized,
                        canonical,
                        unit,
                    ))

    if not candidates:
        return None

    # Longest alias wins, preventing MCH from matching MCHC.
    candidates.sort(key=lambda item: (-item[0], item[1]))

    _, start, end, alias, canonical, unit = candidates[0]

    return alias, canonical, unit, start, end


def _extract_unit(text: str) -> str:
    patterns = [
        (r"^\s*(?:g\s*/\s*d[l1]|gdl)\b", "g/dL"),
        (r"^\s*pg\b", "pg"),
        (r"^\s*f[l1]\b", "fL"),
        (r"^\s*%", "%"),
        (r"^\s*mg\s*/\s*d[l1]\b", "mg/dL"),
        (r"^\s*(?:u|iu)\s*/\s*l\b", "U/L"),
        (r"^\s*lakhs?\s*/?\s*cumm\b", "lakhs/cumm"),
        (r"^\s*million\s*/?\s*cumm\b", "million/cumm"),
        (r"^\s*(?:cells?\s*/?\s*cumm|cumm)\b", "cells/cumm"),
        (r"^\s*thou\s*/?\s*mm3\b", "thou/mm3"),
    ]

    for pattern, unit in patterns:
        if re.match(pattern, text, re.I):
            return unit

    return ""


# ---------------------------------------------------------
# VALUE EXTRACTION
# ---------------------------------------------------------

def _is_standalone_flag(line: str) -> bool:
    return bool(re.fullmatch(r"[lh]", line.strip(), re.I))


def _is_reference_line(line: str) -> bool:
    return parse_reference_range(line) is not None


def _parse_test_block(
    label_line: str,
    following_lines: list[str],
    label_info: tuple,
) -> dict[str, Any] | None:
    """
    Parse a test label and the lines following it, until the
    next recognised test label.

    Example:
        LYMPHOCYTE
        L
        18
        %
        20-40
    """

    alias, canonical, default_unit, start, end = label_info

    normalized_label = normalize_label(label_line)
    label_tail = normalized_label[end:].strip(" ,:")

    lines = [label_tail] + [
        normalize_label(line)
        for line in following_lines
    ]

    lines = [line for line in lines if line]

    explicit_flag = None
    result = None
    result_line_index = None
    unit = ""

    for index, line in enumerate(lines):
        # A standalone L/H flag may precede the result.
        if _is_standalone_flag(line):
            explicit_flag = line.lower()
            continue

        found_unit = _extract_unit(line)

        if found_unit:
            unit = found_unit
            continue

        # A range line is not the test result.
        if _is_reference_line(line):
            continue

        # Match a result by itself or a line such as "H 35.7".
        inline = re.match(
            r"^\s*(?:([lh])\s*)?("
            + NUMBER_PATTERN
            + r")(?:\s+(.*))?$",
            line,
            re.I,
        )

        if inline:
            if inline.group(1):
                explicit_flag = inline.group(1).lower()

            result = float(inline.group(2))
            result_line_index = index

            trailing_text = inline.group(3) or ""
            detected_unit = _extract_unit(trailing_text)

            if detected_unit:
                unit = detected_unit

            break

        # Ignore prose and section headings.
        # The parser does not guess values from arbitrary text.
        continue

    if result is None:
        return None

    reference = None

    # Search for the reference range in the remaining block.
    for index, line in enumerate(lines):
        if index == result_line_index:
            # Check whether the result line also contains a range.
            tail = re.sub(
                r"^\s*[lh]?\s*" + NUMBER_PATTERN,
                "",
                line,
                count=1,
                flags=re.I,
            )

            reference = parse_reference_range(tail)

            if reference is not None:
                break

            continue

        candidate = parse_reference_range(line)

        if candidate is not None:
            reference = candidate
            break

    warnings = []

    # Do not silently reinterpret suspicious OCR ranges.
    if (
        canonical == "Platelets"
        and reference == {"low": 15.0, "high": 41.0}
    ):
        reference = None
        warnings.append(
            "Platelet reference range may have lost decimal points. "
            "Verify against the original report."
        )

    if (
        canonical == "RBC"
        and reference == {"low": 45.0, "high": 55.0}
    ):
        reference = None
        warnings.append(
            "RBC reference range may have lost decimal points. "
            "Verify against the original report."
        )

    if canonical == "MCV" and reference is None:
        warnings.append(
            "MCV reference range was not reliably extracted."
        )

    status = get_status(result, reference)

    # Preserve explicit laboratory flags when a range is unavailable.
    if status == "unknown" and explicit_flag == "l":
        status = "low"
    elif status == "unknown" and explicit_flag == "h":
        status = "high"

    return {
        "name": canonical,
        "result": result,
        "value": result,
        "unit": unit or default_unit,
        "reference_range": reference,
        "status": status,
        "confidence": (
            "high" if reference is not None else "medium"
        ),
        "raw_line": " | ".join(
            [label_line] + following_lines
        ),
        "warnings": warnings,
    }


# ---------------------------------------------------------
# MAIN PARSER
# ---------------------------------------------------------

def parse_report_text(text: str) -> dict[str, Any]:
    if not text or not text.strip():
        return {
            "report_type": "Unknown",
            "tests": [],
            "warnings": [
                "No OCR text was provided. "
                "Health status cannot be determined."
            ],
            "raw_text": text or "",
        }

    report_type = detect_report_type(text)
    source_lines = [
        line.strip()
        for line in text.splitlines()
    ]

    blocks = []

    current_label = None
    current_info = None
    current_following = []

    for line in source_lines:
        if not line:
            continue

        normalized = normalize_label(line)

        if normalized in {
            "test",
            "value",
            "reference",
            "differential leukocyte count",
            "differential leucocyte count",
            "complete blood count",
            "haematology",
            "hematology",
        }:
            continue

        info = _find_test_label(line)

        if info is not None:
            if current_label is not None:
                blocks.append((
                    current_label,
                    current_info,
                    current_following,
                ))

            current_label = line
            current_info = info
            current_following = []

        elif current_label is not None:
            current_following.append(line)

    if current_label is not None:
        blocks.append((
            current_label,
            current_info,
            current_following,
        ))

    tests = []

    for label_line, info, following_lines in blocks:
        parsed = _parse_test_block(
            label_line,
            following_lines,
            info,
        )

        if parsed is not None:
            tests.append(parsed)

    # Deduplicate repeated OCR detections.
    unique_tests = []
    seen = set()

    for test in tests:
        key = (
            test["name"],
            test["result"],
            test["unit"],
        )

        if key not in seen:
            seen.add(key)
            unique_tests.append(test)

    tests = unique_tests
    warnings = []

    if not tests:
        warnings.append(
            "No structured medical test values could be extracted. "
            "Health status cannot be determined."
        )

    if any(test["status"] == "unknown" for test in tests):
        warnings.append(
            "Some values have no reliably parsed reference range "
            "and could not be classified."
        )

    for test in tests:
        warnings.extend(test.get("warnings", []))

    warnings.append(
        "OCR-derived values should be verified against the "
        "original medical report."
    )

    # Final safety check: do not return NaN or infinity anywhere.
    # These values are not valid JSON numbers.
    for test in tests:
        result = test.get("result")

        if isinstance(result, float) and not math.isfinite(result):
            test["result"] = None
            test["value"] = None
            test["status"] = "unknown"
            test["reference_range"] = None
            warnings.append(
                f"{test['name']} contained a non-finite value "
                "and requires verification."
            )

    return {
        "report_type": report_type,
        "tests": tests,
        "warnings": list(dict.fromkeys(warnings)),
        "raw_text": text,
    }


# ---------------------------------------------------------
# PUBLIC / BACKWARD-COMPATIBLE FUNCTIONS
# ---------------------------------------------------------

def parse_report(text: str) -> dict[str, Any]:
    return parse_report_text(text)


def parse_cbc_report(text: str) -> dict[str, Any]:
    """Backward-compatible entry point used by analysis_service.py."""
    return parse_report_text(text)