from app.services.analysis_service import analyze_report


file_path = r"D:\Projects\medical reports\blood.jpg"


print("\n========== STARTING MEDICAL ANALYSIS ==========\n")

result = analyze_report(file_path)


print("\n========== PARSED REPORT ==========\n")

print(result["parsed_report"])


print("\n========== AI ANALYSIS ==========\n")

print(result["ai_analysis"])


print("\n===============================================\n")