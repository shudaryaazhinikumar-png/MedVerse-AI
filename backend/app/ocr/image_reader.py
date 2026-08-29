from pathlib import Path

import cv2
import pytesseract


# Tesseract installation
pytesseract.pytesseract.tesseract_cmd = (
    r"D:\Tesseract-OCR\tesseract.exe"
)


def extract_text_from_image(file_path: str) -> str:

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(
            f"File not found: {file_path}"
        )

    # -----------------------------------------
    # 1. Read image
    # -----------------------------------------

    image = cv2.imread(str(path))

    if image is None:
        raise ValueError(
            f"Unable to read image: {file_path}"
        )

    # -----------------------------------------
    # 2. Upscale image
    # -----------------------------------------
    # Medical reports contain small text.
    # Enlarging it helps Tesseract recognize
    # characters and numbers.

    image = cv2.resize(
        image,
        None,
        fx=2,
        fy=2,
        interpolation=cv2.INTER_CUBIC
    )

    # -----------------------------------------
    # 3. Convert to grayscale
    # -----------------------------------------

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    # -----------------------------------------
    # 4. Improve local contrast
    # -----------------------------------------

    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8)
    )

    enhanced = clahe.apply(gray)

    # -----------------------------------------
    # 5. Remove small noise
    # -----------------------------------------

    denoised = cv2.GaussianBlur(
        enhanced,
        (3, 3),
        0
    )

    # -----------------------------------------
    # 6. Adaptive threshold
    # -----------------------------------------
    # Useful when the document has slightly
    # different brightness across the page.

    threshold = cv2.adaptiveThreshold(
        denoised,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        11
    )

    # -----------------------------------------
    # 7. OCR
    # -----------------------------------------

    config = (
        "--oem 3 "
        "--psm 6 "
        "-c preserve_interword_spaces=1"
    )

    text = pytesseract.image_to_string(
        threshold,
        config=config
    )

    # -----------------------------------------
    # 8. Basic cleanup
    # -----------------------------------------

    lines = []

    for line in text.splitlines():

        line = line.strip()

        if line:
            lines.append(line)

    return "\n".join(lines)