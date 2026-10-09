"""
MedVerse AI - Robust Medical Report Image OCR
"""

from __future__ import annotations

from pathlib import Path
from typing import Any
import re

import cv2
import numpy as np
import pytesseract


# ============================================================
# TESSERACT
# ============================================================

TESSERACT_PATH = r"D:\Tesseract-OCR\tesseract.exe"


def configure_tesseract() -> None:

    if Path(TESSERACT_PATH).exists():

        pytesseract.pytesseract.tesseract_cmd = (
            TESSERACT_PATH
        )

        return

    try:

        pytesseract.get_tesseract_version()

    except Exception as exc:

        raise RuntimeError(
            f"Tesseract not found at: {TESSERACT_PATH}"
        ) from exc


# ============================================================
# RESIZE
# ============================================================

def resize_for_ocr(
    image: np.ndarray,
) -> np.ndarray:

    height, width = image.shape[:2]

    target_width = 2400

    if width < target_width:

        scale = (
            target_width / width
        )

        image = cv2.resize(
            image,
            None,
            fx=scale,
            fy=scale,
            interpolation=cv2.INTER_CUBIC,
        )

    elif width > 3500:

        scale = (
            3500 / width
        )

        image = cv2.resize(
            image,
            None,
            fx=scale,
            fy=scale,
            interpolation=cv2.INTER_AREA,
        )

    return image


# ============================================================
# REMOVE TABLE LINES
# ============================================================

def remove_table_lines(
    image: np.ndarray,
) -> np.ndarray:
    """
    Remove horizontal and vertical table borders.

    This is important for medical reports because table
    lines can be interpreted as characters by Tesseract.
    """

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY,
    )

    # --------------------------------------------------------
    # Binary image
    # --------------------------------------------------------

    binary = cv2.threshold(
        gray,
        0,
        255,
        cv2.THRESH_BINARY_INV
        + cv2.THRESH_OTSU,
    )[1]

    # --------------------------------------------------------
    # Horizontal lines
    # --------------------------------------------------------

    horizontal_kernel = cv2.getStructuringElement(
        cv2.MORPH_RECT,
        (
            max(30, image.shape[1] // 25),
            1,
        ),
    )

    horizontal_lines = cv2.morphologyEx(
        binary,
        cv2.MORPH_OPEN,
        horizontal_kernel,
    )

    # --------------------------------------------------------
    # Vertical lines
    # --------------------------------------------------------

    vertical_kernel = cv2.getStructuringElement(
        cv2.MORPH_RECT,
        (
            1,
            max(30, image.shape[0] // 25),
        ),
    )

    vertical_lines = cv2.morphologyEx(
        binary,
        cv2.MORPH_OPEN,
        vertical_kernel,
    )

    # --------------------------------------------------------
    # Combine table lines
    # --------------------------------------------------------

    lines = cv2.bitwise_or(
        horizontal_lines,
        vertical_lines,
    )

    # --------------------------------------------------------
    # Remove lines
    # --------------------------------------------------------

    cleaned = cv2.bitwise_and(
        binary,
        cv2.bitwise_not(lines),
    )

    # Convert back to normal black text / white background
    cleaned = cv2.bitwise_not(
        cleaned
    )

    return cleaned


# ============================================================
# PREPROCESSING VARIANTS
# ============================================================

def create_preprocessing_variants(
    image: np.ndarray,
) -> list[tuple[str, np.ndarray]]:

    image = resize_for_ocr(
        image
    )

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY,
    )

    # --------------------------------------------------------
    # CLAHE
    # --------------------------------------------------------

    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8),
    )

    enhanced = clahe.apply(
        gray
    )

    # --------------------------------------------------------
    # Denoise
    # --------------------------------------------------------

    denoised = cv2.fastNlMeansDenoising(
        enhanced,
        None,
        10,
        7,
        21,
    )

    # --------------------------------------------------------
    # OTSU
    # --------------------------------------------------------

    otsu = cv2.threshold(
        denoised,
        0,
        255,
        cv2.THRESH_BINARY
        + cv2.THRESH_OTSU,
    )[1]

    # --------------------------------------------------------
    # Adaptive threshold
    # --------------------------------------------------------

    adaptive = cv2.adaptiveThreshold(
        denoised,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        11,
    )

    # --------------------------------------------------------
    # Table-line removal
    # --------------------------------------------------------

    line_removed = remove_table_lines(
        image
    )

    # --------------------------------------------------------
    # Mild morphological cleanup
    # --------------------------------------------------------

    kernel = np.ones(
        (2, 2),
        np.uint8,
    )

    cleaned = cv2.morphologyEx(
        line_removed,
        cv2.MORPH_CLOSE,
        kernel,
    )

    return [

        (
            "enhanced",
            denoised,
        ),

        (
            "otsu",
            otsu,
        ),

        (
            "adaptive",
            adaptive,
        ),

        (
            "table_removed",
            line_removed,
        ),

        (
            "table_removed_cleaned",
            cleaned,
        ),
    ]


# ============================================================
# MEDICAL TERMS
# ============================================================

MEDICAL_TERMS = {

    "hemoglobin",
    "haemoglobin",
    "hematocrit",
    "haematocrit",
    "platelet",
    "wbc",
    "rbc",
    "neutrophil",
    "lymphocyte",
    "monocyte",
    "eosinophil",
    "basophil",
    "glucose",
    "cholesterol",
    "triglyceride",
    "creatinine",
    "urea",
    "bilirubin",
    "albumin",
    "protein",
    "sodium",
    "potassium",
    "tsh",
    "vitamin",
    "reference",
    "range",
    "result",
    "mcv",
    "mch",
    "mchc",
    "rdw",
}


# ============================================================
# OCR SCORING
# ============================================================

def score_ocr_result(
    text: str,
    confidences: list[float],
) -> float:

    normalized = re.sub(
        r"\s+",
        " ",
        text.lower(),
    )

    medical_hits = sum(
        1
        for term in MEDICAL_TERMS
        if term in normalized
    )

    number_count = len(
        re.findall(
            r"\b\d+(?:\.\d+)?\b",
            normalized,
        )
    )

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    average_confidence = (

        sum(confidences)
        / len(confidences)

        if confidences

        else 0
    )

    score = (

        average_confidence * 0.55

        + min(
            medical_hits,
            20,
        ) * 3.0

        + min(
            number_count,
            50,
        ) * 0.4

        + min(
            len(lines),
            100,
        ) * 0.05
    )

    return score


# ============================================================
# OCR ONE VARIANT
# ============================================================

def run_ocr_variant(
    image: np.ndarray,
    psm: int,
) -> tuple[
    str,
    list[float],
    list[dict[str, Any]],
]:

    config = (
        f"--oem 3 --psm {psm}"
    )

    data = pytesseract.image_to_data(
        image,
        lang="eng",
        config=config,
        output_type=pytesseract.Output.DICT,
    )

    confidences = []

    tokens = []

    for i, raw_word in enumerate(
        data["text"]
    ):

        word = (
            raw_word or ""
        ).strip()

        if not word:
            continue

        try:

            confidence = float(
                data["conf"][i]
            )

        except (
            TypeError,
            ValueError,
        ):

            confidence = -1

        if confidence >= 0:

            confidences.append(
                confidence
            )

        tokens.append(
            {
                "text": word,

                "confidence": round(
                    max(
                        confidence,
                        0,
                    ),
                    2,
                ),

                "left": int(
                    data["left"][i]
                ),

                "top": int(
                    data["top"][i]
                ),

                "width": int(
                    data["width"][i]
                ),

                "height": int(
                    data["height"][i]
                ),

                "block_num": int(
                    data["block_num"][i]
                ),

                "par_num": int(
                    data["par_num"][i]
                ),

                "line_num": int(
                    data["line_num"][i]
                ),
            }
        )

    # --------------------------------------------------------
    # Reconstruct lines
    # --------------------------------------------------------

    grouped = {}

    for token in tokens:

        key = (
            token["block_num"],
            token["par_num"],
            token["line_num"],
        )

        grouped.setdefault(
            key,
            [],
        ).append(token)

    lines = []

    for items in grouped.values():

        items.sort(
            key=lambda item: item["left"]
        )

        line = " ".join(
            item["text"]
            for item in items
        )

        lines.append(
            line
        )

    text = "\n".join(
        lines
    )

    return (
        text,
        confidences,
        tokens,
    )


# ============================================================
# MAIN OCR
# ============================================================

def extract_text_from_image_detailed(
    image_path: str | Path,
) -> dict[str, Any]:

    configure_tesseract()

    path = Path(
        image_path
    )

    if not path.exists():

        raise FileNotFoundError(
            f"Image not found: {path}"
        )

    image = cv2.imread(
        str(path)
    )

    if image is None:

        raise ValueError(
            f"Unable to read image: {path}"
        )

    variants = create_preprocessing_variants(
        image
    )

    candidates = []

    # --------------------------------------------------------
    # Try multiple variants and PSM modes
    # --------------------------------------------------------

    for variant_name, processed_image in variants:

        for psm in (
            4,
            6,
            11,
        ):

            try:

                (
                    text,
                    confidences,
                    tokens,
                ) = run_ocr_variant(
                    processed_image,
                    psm,
                )

                score = score_ocr_result(
                    text,
                    confidences,
                )

                average_confidence = (

                    sum(confidences)
                    / len(confidences)

                    if confidences

                    else 0
                )

                candidates.append(
                    {
                        "text": text,

                        "variant": (
                            f"{variant_name}-psm{psm}"
                        ),

                        "tokens": tokens,

                        "confidence": round(
                            average_confidence,
                            2,
                        ),

                        "score": score,
                    }
                )

            except Exception as exc:

                print(
                    "OCR variant failed:",
                    exc,
                )

    if not candidates:

        raise RuntimeError(
            "Tesseract could not produce OCR output."
        )

    # --------------------------------------------------------
    # Best candidate
    # --------------------------------------------------------

    best = max(
        candidates,
        key=lambda item: item["score"],
    )

    warnings = []

    if best["confidence"] < 65:

        warnings.append(
            "OCR confidence is below 65%. "
            "Verify extracted values against "
            "the original report."
        )

    return {

        "text": best["text"],

        "ocr_confidence": best[
            "confidence"
        ],

        "variant": best[
            "variant"
        ],

        "tokens": best[
            "tokens"
        ],

        "warnings": warnings,
    }


# ============================================================
# BACKWARD COMPATIBILITY
# ============================================================

def extract_text_from_image(
    image_path: str | Path,
) -> str:

    result = extract_text_from_image_detailed(
        image_path
    )

    return result["text"]


def extract_text(
    image_path: str | Path,
) -> str:

    return extract_text_from_image(
        image_path
    )