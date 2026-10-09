"""
MedVerse AI - OCR Text Cleaner
"""

from __future__ import annotations

import re


# ============================================================
# CLEAN OCR TEXT
# ============================================================

def clean_ocr_text(text: str) -> str:
    """
    Clean OCR text while preserving:
    - decimal points
    - medical values
    - units
    - reference ranges
    """

    if not text:
        return ""

    # --------------------------------------------------------
    # Basic character normalization
    # --------------------------------------------------------

    text = text.replace(
        "\x0c",
        " ",
    )

    text = text.replace(
        "\u2013",
        "-",
    )

    text = text.replace(
        "\u2014",
        "-",
    )

    text = text.replace(
        "\u2212",
        "-",
    )

    text = text.replace(
        "\u00a0",
        " ",
    )

    # --------------------------------------------------------
    # OCR decimal cleanup
    # --------------------------------------------------------

    text = text.replace(
        ",",
        ".",
    )

    # --------------------------------------------------------
    # Medical units
    # --------------------------------------------------------

    replacements = {

        r"(?i)\bthou\s*/\s*mm\s*3\b":
            "thou/mm3",

        r"(?i)\bthou\s*mm\s*3\b":
            "thou/mm3",

        r"(?i)\bthou\s*/\s*mm3\b":
            "thou/mm3",

        r"(?i)\bthoufmm3\b":
            "thou/mm3",

        r"(?i)\bthoumm3\b":
            "thou/mm3",

        r"(?i)\bmg\s*/\s*dl\b":
            "mg/dL",

        r"(?i)\bg\s*/\s*dl\b":
            "g/dL",

        r"(?i)\bmmol\s*/\s*l\b":
            "mmol/L",

        r"(?i)\bmiu\s*/\s*l\b":
            "mIU/L",

        r"(?i)\biu\s*/\s*l\b":
            "IU/L",
    }

    for pattern, replacement in replacements.items():

        text = re.sub(
            pattern,
            replacement,
            text,
        )

    # --------------------------------------------------------
    # Spaces
    # --------------------------------------------------------

    text = re.sub(
        r"[ \t]+",
        " ",
        text,
    )

    text = re.sub(
        r"\s*-\s*",
        " - ",
        text,
    )

    # --------------------------------------------------------
    # Remove repeated dots ONLY
    # Do NOT remove decimal points
    # --------------------------------------------------------

    text = re.sub(
        r"\.{3,}",
        ".",
        text,
    )

    # --------------------------------------------------------
    # Clean individual lines
    # --------------------------------------------------------

    lines = []

    for line in text.splitlines():

        line = line.strip()

        if line:
            lines.append(line)

    return "\n".join(lines)


# ============================================================
# NORMALIZE LABEL
# ============================================================

def normalize_label(
    label: str,
) -> str:
    """
    Normalize a medical test label.

    IMPORTANT:
    Decimal points are preserved because OCR values
    such as 39.60, 0.34 and 12.00 must remain intact.
    """

    label = label.lower().strip()

    # Keep:
    # letters
    # numbers
    # decimal points
    # %
    # parentheses
    # slash
    # plus
    # minus

    label = re.sub(
        r"[^a-z0-9.%()/+\- ]+",
        " ",
        label,
    )

    label = re.sub(
        r"\s+",
        " ",
        label,
    )

    return label.strip()