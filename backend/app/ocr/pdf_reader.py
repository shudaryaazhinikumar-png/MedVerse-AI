"""
MedVerse AI - PDF Medical Report Reader
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import fitz

from .image_reader import (
    extract_text_from_image_detailed,
)


# ============================================================
# PDF TEXT EXTRACTION
# ============================================================

def extract_text_from_pdf(
    pdf_path: str | Path,
) -> dict[str, Any]:

    path = Path(
        pdf_path
    )

    if not path.exists():

        raise FileNotFoundError(
            f"PDF not found: {path}"
        )

    document = fitz.open(
        str(path)
    )

    pages = []

    page_details = []

    warnings = []

    try:

        for page_index, page in enumerate(
            document
        ):

            # ------------------------------------------------
            # First try native PDF text
            # ------------------------------------------------

            native_text = page.get_text(
                "text"
            ).strip()

            if len(native_text) >= 80:

                pages.append(
                    native_text
                )

                page_details.append(
                    {
                        "page": page_index + 1,
                        "method": "native_pdf_text",
                        "ocr_confidence": 100.0,
                    }
                )

                continue

            # ------------------------------------------------
            # Scanned PDF
            # Render page and run OCR
            # ------------------------------------------------

            pixmap = page.get_pixmap(
                dpi=300,
                alpha=False,
            )

            temporary_image = path.with_name(
                f".medverse_ocr_page_{page_index + 1}.png"
            )

            pixmap.save(
                str(temporary_image)
            )

            try:

                result = (
                    extract_text_from_image_detailed(
                        temporary_image
                    )
                )

                pages.append(
                    result["text"]
                )

                page_details.append(
                    {
                        "page": page_index + 1,
                        "method": "tesseract_ocr",
                        "ocr_confidence": result[
                            "ocr_confidence"
                        ],
                        "variant": result[
                            "variant"
                        ],
                    }
                )

                warnings.extend(
                    result.get(
                        "warnings",
                        [],
                    )
                )

            finally:

                try:

                    temporary_image.unlink(
                        missing_ok=True
                    )

                except Exception:
                    pass

    finally:

        document.close()

    return {

        "text": "\n\n".join(
            pages
        ),

        "pages": page_details,

        "warnings": sorted(
            set(warnings)
        ),
    }


# ============================================================
# BACKWARD COMPATIBILITY
# ============================================================

def extract_text(
    pdf_path: str | Path,
) -> str:

    result = extract_text_from_pdf(
        pdf_path
    )

    return result["text"]