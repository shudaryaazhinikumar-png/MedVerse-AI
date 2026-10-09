from app.ai.gemini_service import analyze_medical_report


test_report = {
    "report_type": "Complete Blood Count",
    "tests": [
        {
            "name": "Lymphocytes",
            "result": 50.3,
            "unit": "%",
            "reference_range": {
                "low": 20.0,
                "high": 40.0
            },
            "confidence": "high"
        },
        {
            "name": "Segmented Neutrophils",
            "result": 39.6,
            "unit": "%",
            "reference_range": {
                "low": 40.0,
                "high": 80.0
            },
            "confidence": "high"
        }
    ],
    "warnings": [
        "OCR-derived values should be verified against the original report."
    ]
}


print("\n========== GEMINI ANALYSIS ==========\n")

result = analyze_medical_report(test_report)

print(result)

print("\n====================================")