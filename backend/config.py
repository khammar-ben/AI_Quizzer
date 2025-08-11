import os
from typing import Optional

# Environment Configuration
class Config:
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-please-change-me")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    
    # Database
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "quizzer_db")
    
    # OpenAI
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "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")
    
    # CORS
    ALLOWED_ORIGINS: list = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    
    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

# Production Configuration
class ProductionConfig(Config):
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    MONGO_URI: str = os.getenv("MONGO_URI")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    ALLOWED_ORIGINS: list = os.getenv("ALLOWED_ORIGINS", "").split(",") if os.getenv("ALLOWED_ORIGINS") else []

# Development Configuration
class DevelopmentConfig(Config):
    pass

# Get current configuration based on environment
def get_config():
    env = os.getenv("ENVIRONMENT", "development")
    if env == "production":
        return ProductionConfig()
    return DevelopmentConfig()

# Export configuration
config = get_config() 
