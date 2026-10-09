from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.services.upload_service import save_uploaded_file
from app.dependencies.auth import get_current_user
from app.database.mongodb import get_database

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post("/upload")
async def upload_report(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected"
        )

    allowed_extensions = {".pdf", ".jpg", ".jpeg", ".png"}

    filename = file.filename.lower()

    if not any(
        filename.endswith(extension)
        for extension in allowed_extensions
    ):
        raise HTTPException(
            status_code=400,
            detail="Only PDF, JPG, JPEG and PNG files are allowed"
        )

    saved_path = await save_uploaded_file(file)

    return {
        "message": "Report uploaded successfully",
        "filename": file.filename,
        "content_type": file.content_type,
        "saved_path": saved_path
    }


# GET MY REPORTS
@router.get("/my-reports")
async def get_my_reports(
    current_user=Depends(get_current_user)
):
    database = get_database()

    user_id = current_user.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid user information"
        )

    reports = await database.reports.find(
        {"user_id": user_id}
    ).sort(
        "created_at",
        -1
    ).to_list(length=100)

    for report in reports:
        report["_id"] = str(report["_id"])

    return {
        "reports": reports
    }