from pathlib import Path
from fastapi import UploadFile

from app.core.config import settings


async def save_uploaded_file(file: UploadFile) -> str:

    # Create upload directory if it doesn't exist
    upload_dir = Path(settings.UPLOAD_DIR)

    upload_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    # Create file path
    file_path = upload_dir / file.filename

    # Save uploaded file
    with open(file_path, "wb") as buffer:

        while chunk := await file.read(1024 * 1024):

            buffer.write(chunk)

    # Close uploaded file
    await file.close()

    return str(file_path)