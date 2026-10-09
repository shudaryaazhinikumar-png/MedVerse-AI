from datetime import datetime, timezone


def create_report_document(

    user_id,

    filename,

    parsed_report,

    ai_analysis,

    patient_type="self",

    family_member_id=None,

    family_member_name=None,

    family_member_relationship=None,

    family_member_age=None

):

    return {

        "user_id":
            user_id,

        "filename":
            filename,

        "report_type":
            parsed_report.get(
                "report_type",
                "Unknown"
            ),

        "parsed_report":
            parsed_report,

        "ai_analysis":
            ai_analysis,

        "created_at":
            datetime.now(
                timezone.utc
            ),

        # -----------------------------------------
        # PATIENT INFORMATION
        # -----------------------------------------

        "patient_type":
            patient_type,

        "family_member_id":
            family_member_id,

        "family_member_name":
            family_member_name,

        "family_member_relationship":
            family_member_relationship,

        "family_member_age":
            family_member_age

    }