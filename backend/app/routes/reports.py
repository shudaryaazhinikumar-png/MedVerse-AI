from fastapi import APIRouter, UploadFile, File, HTTPException

from app.services.upload_service import save_uploaded_file


router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


@router.post("/upload")
async def upload_report(
    file: UploadFile = File(...)
):

    # Check file was provided
    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file selected"
        )

    # Allowed file types
    allowed_extensions = {
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png"
    }

    filename = file.filename.lower()

    if not any(
        filename.endswith(extension)
        for extension in allowed_extensions
    ):

        raise HTTPException(
            status_code=400,
            detail="Only PDF, JPG, JPEG and PNG files are allowed"
        )

    # Save file
    saved_path = await save_uploaded_file(file)

    return {
        "message": "Report uploaded successfully",
        "filename": file.filename,
        "content_type": file.content_type,
        "saved_path": saved_path
    }