#!/usr/bin/env python3
"""
Startup script for Quizzer Genesis Forge Backend
"""
import uvicorn
from config import config

if __name__ == "__main__":
    print(f"🚀 Starting Quizzer Genesis Forge Backend...")
    print(f"📍 Environment: {config.__class__.__name__}")
    print(f"🌐 Host: {config.HOST}")
    print(f"🔌 Port: {config.PORT}")
    print(f"🗄️  Database: {config.DATABASE_NAME}")
    print(f"🔗 CORS Origins: {config.ALLOWED_ORIGINS}")
    
    uvicorn.run(
        "main:app",
        host=config.HOST,
        port=config.PORT,
        reload=True if config.__class__.__name__ == "DevelopmentConfig" else False,
        log_level="info"
    ) 