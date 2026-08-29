from app.ocr.image_reader import extract_text_from_image
from app.ocr.text_cleaner import clean_ocr_text
from app.ocr.report_parser import parse_cbc_report


file_path = r"D:\Projects\medical reports\blood.jpg"


# STEP 4
raw_text = extract_text_from_image(file_path)


print("\n========== RAW OCR TEXT ==========\n")
print(raw_text)


# STEP 5
cleaned_text = clean_ocr_text(raw_text)


print("\n========== CLEANED OCR TEXT ==========\n")
print(cleaned_text)


# STEP 6
parsed_report = parse_cbc_report(cleaned_text)


print("\n========== PARSED REPORT ==========\n")
print(parsed_report)


print("\n====================================")