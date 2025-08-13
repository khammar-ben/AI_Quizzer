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
    
    # OpenAI - Will be loaded from database or environment
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # CORS
    ALLOWED_ORIGINS: list = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    
    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    def get_openai_api_key(self) -> str:
        """Get OpenAI API key from database or environment"""
        # First try environment variable
        if self.OPENAI_API_KEY:
            return self.OPENAI_API_KEY
        
        # If not in environment, try to get from database
        try:
            from pymongo import MongoClient
            client = MongoClient(self.MONGO_URI)
            database = client[self.DATABASE_NAME]
            
            if "api_keys" in database.list_collection_names():
                api_keys_collection = database["api_keys"]
                # Look for an active OpenAI API key
                api_key_doc = api_keys_collection.find_one({
                    "is_active": True,
                    "api_key": {"$regex": "^sk-proj-"}
                })
                
                if api_key_doc:
                    client.close()
                    return api_key_doc["api_key"]
            
            client.close()
        except Exception:
            pass
        
        # Return empty string if no key found
        return ""

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
