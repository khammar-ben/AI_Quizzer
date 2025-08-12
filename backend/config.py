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
