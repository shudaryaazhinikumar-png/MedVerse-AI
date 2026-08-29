import re


# Common OCR mistakes in medical test names.
# These corrections are only for labels,
# not for numerical medical values.

OCR_CORRECTIONS = {
    "CONPLETE": "COMPLETE",
    "BLOB CONT": "BLOOD COUNT",
    "Hemogiobin": "Hemoglobin",
    "Hemogiobin": "Hemoglobin",
    "Packed Celt": "Packed Cell",
    "Platetet": "Platelet",
    "Leukocyte Court": "Leukocyte Count",
    "Leucocyte Court": "Leucocyte Count",
    "pReccomt": "RBC Count",
    "Pecy": "MCV",
    "Pec few": "MCH",
    "PmcHe": "MCHC",
    "ROW": "RDW",
}


def clean_ocr_text(text: str) -> str:

    if not text:
        return ""

    # Normalize line endings
    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    # Remove excessive spaces while preserving lines
    lines = []

    for line in text.split("\n"):

        line = line.strip()

        if not line:
            continue

        # Apply known OCR corrections
        for wrong, correct in OCR_CORRECTIONS.items():
            line = line.replace(wrong, correct)

        # Replace repeated spaces with one space
        line = re.sub(r"[ \t]+", " ", line)

        lines.append(line)

    # Remove excessive blank lines
    cleaned_text = "\n".join(lines)

    return cleaned_text