from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Depends,
    Form,
)
from pathlib import Path
import shutil
import uuid
import logging

from bson import ObjectId

from app.services.analysis_service import analyze_report
from app.dependencies.auth import get_current_user
from app.database.mongodb import get_database
from app.models.report import create_report_document


router = APIRouter(
    prefix="/analysis",
    tags=["Analysis"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


@router.post("/analyze")
async def analyze_uploaded_report(
    file: UploadFile = File(...),

    # ========================================================
    # PATIENT INFORMATION
    # ========================================================

    patient_type: str = Form("self"),
    patient_name: str = Form(""),
    patient_age: str = Form(""),
    report_type: str = Form("Other"),

    # ========================================================
    # LANGUAGE
    # ========================================================

    language: str = Form("English"),

    # ========================================================
    # FAMILY MEMBER
    # ========================================================

    family_member_id: str | None = Form(None),

    family_member_name: str = Form(""),
    family_member_relationship: str = Form(""),
    family_member_age: str = Form(""),

    # ========================================================
    # AUTHENTICATED USER
    # ========================================================

    current_user=Depends(get_current_user),
):
    # ========================================================
    # 1. VALIDATE FILE
    # ========================================================

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Please select a report file.",
        )

    allowed_types = {
        "application/pdf",
        "image/jpeg",
        "image/png",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Only PDF, JPG, JPEG and PNG "
                "files are allowed."
            ),
        )

    # ========================================================
    # 2. GET LOGGED-IN USER
    # ========================================================

    user_id = current_user.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid user token.",
        )

    # ========================================================
    # 3. VALIDATE PATIENT TYPE
    # ========================================================

    if patient_type not in {
        "self",
        "family",
    }:
        raise HTTPException(
            status_code=400,
            detail=(
                "patient_type must be "
                "'self' or 'family'."
            ),
        )

    # ========================================================
    # 4. VALIDATE LANGUAGE
    # ========================================================

    language = (
        language
        .strip()
        .capitalize()
    )

    if language not in {
        "English",
        "Tamil",
    }:
        language = "English"

    # ========================================================
    # 5. VALIDATE PATIENT INFORMATION
    # ========================================================

    if not patient_name.strip():
        raise HTTPException(
            status_code=400,
            detail="Patient name is required.",
        )

    try:
        age = int(patient_age)

        if not 1 <= age <= 130:
            raise ValueError

    except (
        ValueError,
        TypeError,
    ):
        raise HTTPException(
            status_code=400,
            detail="Please provide a valid patient age.",
        )

    # ========================================================
    # 6. PREPARE FAMILY INFORMATION
    # ========================================================

    saved_family_id = None
    saved_family_name = None
    saved_relationship = None
    saved_family_age = None

    if patient_type == "family":

        # ----------------------------------------------------
        # EXISTING FAMILY MEMBER
        # ----------------------------------------------------

        if family_member_id:

            if not ObjectId.is_valid(
                family_member_id
            ):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid family member ID.",
                )

            database = get_database()

            family_member = (
                await database.family_members.find_one(
                    {
                        "_id": ObjectId(
                            family_member_id
                        ),
                        "user_id": user_id,
                    }
                )
            )

            if not family_member:
                raise HTTPException(
                    status_code=404,
                    detail="Family member not found.",
                )

            saved_family_id = str(
                family_member["_id"]
            )

            saved_family_name = (
                family_member.get("name")
            )

            saved_relationship = (
                family_member.get(
                    "relationship"
                )
            )

            saved_family_age = (
                family_member.get("age")
            )

        # ----------------------------------------------------
        # NEW FAMILY MEMBER DETAILS
        # ----------------------------------------------------

        else:

            if not family_member_name.strip():
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Family member name "
                        "is required."
                    ),
                )

            if not family_member_relationship.strip():
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Family relationship "
                        "is required."
                    ),
                )

            try:

                saved_family_age = int(
                    family_member_age
                )

                if not 1 <= saved_family_age <= 130:
                    raise ValueError

            except (
                ValueError,
                TypeError,
            ):
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Please provide a valid "
                        "family member age."
                    ),
                )

            saved_family_name = (
                family_member_name.strip()
            )

            saved_relationship = (
                family_member_relationship.strip()
            )

        # ----------------------------------------------------
        # USE VERIFIED FAMILY DETAILS
        # ----------------------------------------------------

        patient_name = saved_family_name
        age = int(saved_family_age)

    # ========================================================
    # 7. CREATE TEMPORARY UPLOAD PATH
    # ========================================================

    extension = Path(
        file.filename
    ).suffix.lower()

    temp_filename = (
        f"{uuid.uuid4()}{extension}"
    )

    file_path = (
        UPLOAD_DIR / temp_filename
    )

    # ========================================================
    # 8. PROCESS REPORT
    # ========================================================

    try:

        # ----------------------------------------------------
        # SAVE TEMPORARY FILE
        # ----------------------------------------------------

        with open(
            file_path,
            "wb",
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer,
            )

        # ----------------------------------------------------
        # OCR + PARSER + GEMINI
        # ----------------------------------------------------

        print(
            "========================================"
        )

        print(
            "MEDVERSE AI ANALYSIS"
        )

        print(
            f"Language: {language}"
        )

        print(
            f"Patient type: {patient_type}"
        )

        print(
            f"File: {file.filename}"
        )

        print(
            "========================================"
        )

        result = analyze_report(
            str(file_path),
            language=language,
        )

        parsed_report = result.get(
            "parsed_report",
            {},
        )

        ai_analysis = result.get(
            "ai_analysis",
            "",
        )

        # ====================================================
        # 9. CREATE REPORT DOCUMENT
        # ====================================================

        report_document = create_report_document(
            user_id=user_id,
            filename=file.filename,
            parsed_report=parsed_report,
            ai_analysis=ai_analysis,
            patient_type=patient_type,
            family_member_id=saved_family_id,
            family_member_name=saved_family_name,
            family_member_relationship=saved_relationship,
            family_member_age=saved_family_age,
        )

        # ----------------------------------------------------
        # ADD PATIENT METADATA
        # ----------------------------------------------------

        report_document.update(
            {
                "patient_name":
                    patient_name.strip(),

                "patient_age":
                    age,

                "report_type":
                    report_type,

                "language":
                    language,
            }
        )

        # ====================================================
        # 10. SAVE TO MONGODB
        # ====================================================

        database = get_database()

        insert_result = (
            await database.reports.insert_one(
                report_document
            )
        )

        # ====================================================
        # 11. RETURN RESULT
        # ====================================================

        return {
            "message":
                "Medical report analyzed successfully",

            "filename":
                file.filename,

            "report_id":
                str(
                    insert_result.inserted_id
                ),

            "patient_type":
                patient_type,

            "patient_name":
                patient_name,

            "patient_age":
                age,

            "report_type":
                report_type,

            "language":
                language,

            "family_member_id":
                saved_family_id,

            "family_member_name":
                saved_family_name,

            "family_member_relationship":
                saved_relationship,

            "family_member_age":
                saved_family_age,

            "analysis":
                result,
        }

    # ========================================================
    # HTTP EXCEPTIONS
    # ========================================================

    except HTTPException:
        raise

    # ========================================================
    # INTERNAL ERROR
    # ========================================================

    except Exception:

        logging.exception(
            "Medical report analysis failed"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Report analysis failed. "
                "Check the backend terminal."
            ),
        )

    # ========================================================
    # CLEANUP
    # ========================================================

    finally:

        if file_path.exists():
            file_path.unlink()

        await file.close()