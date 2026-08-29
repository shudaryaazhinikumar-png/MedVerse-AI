from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):

    APP_NAME: str = "MedVerse AI"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"

    # Database
    MONGODB_URL: str
    DATABASE_NAME: str

    # JWT Authentication
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Gemini AI
    GEMINI_API_KEY: str

    # Storage
    UPLOAD_DIR: str = "uploads"
    REPORT_DIR: str = "storage/reports"
    AUDIO_DIR: str = "storage/audio"

    # Language
    DEFAULT_LANGUAGE: str = "en"
    SUPPORTED_LANGUAGES: str = "en,ta,hi"

    # Brevo SMTP
    BREVO_SMTP_HOST: str
    BREVO_SMTP_PORT: int = 587
    BREVO_SMTP_LOGIN: str
    BREVO_SMTP_PASSWORD: str
    BREVO_SENDER_EMAIL: str
    BREVO_SENDER_NAME: str = "MedVerse-AI"

    # Frontend
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()