import re
from typing import Any


def parse_number(value: str):
    try:
        return float(value)
    except ValueError:
        return None


def parse_cbc_report(text: str) -> dict[str, Any]:

    report = {
        "report_type": "Complete Blood Count",
        "tests": [],
        "warnings": []
    }
    lines = text.splitlines()

    for line in lines:

        line = line.strip()

        if not line:
            continue

        # =====================================================
        # DIFFERENTIAL LEUCOCYTE COUNT
        # =====================================================

        match = re.search(
            r"^(Segmented Neutrophils|Lymphocytes|Monocytes|"
            r"Eosinophils|Basophits|Basophils)\s+"
            r"(\d+(?:\.\d+)?)\s+"
            r"[%*]\s+"
            r"(\d+(?:\.\d+)?)\s*[-–]\s*"
            r"(\d+(?:\.\d+)?)",
            line,
            re.IGNORECASE
        )

        if match:

            name = match.group(1)

            # Normalize OCR spelling
            if name.lower() == "basophits":
                name = "Basophils"

            result = parse_number(match.group(2))
            ref_low = parse_number(match.group(3))
            ref_high = parse_number(match.group(4))

            report["tests"].append({
                "name": name,
                "result": result,
                "unit": "%",
                "reference_range": {
                    "low": ref_low,
                    "high": ref_high
                },
                "confidence": "high",
                "raw_line": line
            })

            continue

        # =====================================================
        # ABSOLUTE LEUCOCYTE COUNT
        # =====================================================

        match = re.search(
            r"^(Neutrophils|Lymphocytes|Monocytes|"
            r"Eosinophils|Basophils)\s+"
            r"(\d+(?:\.\d+)?)\s+"
            r"(thou[/]?mm3|thoumm3|thouimm3)\s+"
            r"(\d+(?:\.\d+)?)\s*[-–]\s*"
            r"(\d+(?:\.\d+)?)",
            line,
            re.IGNORECASE
        )

        if match:

            name = match.group(1)

            result = parse_number(match.group(2))
            unit = match.group(3)

            ref_low = parse_number(match.group(4))
            ref_high = parse_number(match.group(5))

            report["tests"].append({
                "name": name,
                "result": result,
                "unit": "thou/mm3",
                "reference_range": {
                    "low": ref_low,
                    "high": ref_high
                },
                "confidence": "high",
                "raw_line": line
            })

            continue
    if not report["tests"]:
        report["warnings"].append(
            "No reliable medical test values were extracted."
        )

    report["warnings"].append(
        "OCR-derived values should be verified against the original report."
    )

    
    
    return report