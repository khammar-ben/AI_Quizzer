#!/usr/bin/env python3
"""
Database initialization script for Quizzer Genesis Forge
This script sets up the database collections and indexes
"""

from pymongo import MongoClient, ASCENDING, DESCENDING
from config import config
import sys

def init_database():
    """Initialize the database with collections and indexes"""
    try:
        # Connect to MongoDB
        client = MongoClient(config.MONGO_URI)
        database = client[config.DATABASE_NAME]
        
        print(f"Connected to database: {config.DATABASE_NAME}")
        
        # Create collections if they don't exist
        collections = [
            "users",
            "quizzes", 
            "questions",
            "quiz_attempts",
            "user_answers",
            "api_keys"
        ]
        
        for collection_name in collections:
            if collection_name not in database.list_collection_names():
                database.create_collection(collection_name)
                print(f"Created collection: {collection_name}")
            else:
                print(f"Collection already exists: {collection_name}")
        
        # Create indexes for better performance
        
        # Users collection indexes
        users_collection = database["users"]
        users_collection.create_index([("username", ASCENDING)], unique=True)
        users_collection.create_index([("email", ASCENDING)], unique=True)
        print("Created indexes for users collection")
        
        # Quizzes collection indexes
        quizzes_collection = database["quizzes"]
        quizzes_collection.create_index([("user_id", ASCENDING)])
        quizzes_collection.create_index([("created_at", DESCENDING)])
        print("Created indexes for quizzes collection")
        
        # Questions collection indexes
        questions_collection = database["questions"]
        questions_collection.create_index([("quiz_id", ASCENDING)])
        questions_collection.create_index([("order", ASCENDING)])
        print("Created indexes for questions collection")
        
        # Quiz attempts collection indexes
        quiz_attempts_collection = database["quiz_attempts"]
        quiz_attempts_collection.create_index([("user_id", ASCENDING)])
        quiz_attempts_collection.create_index([("quiz_id", ASCENDING)])
        quiz_attempts_collection.create_index([("completed_at", DESCENDING)])
        print("Created indexes for quiz_attempts collection")
        
        # User answers collection indexes
        user_answers_collection = database["user_answers"]
        user_answers_collection.create_index([("quiz_attempt_id", ASCENDING)])
        user_answers_collection.create_index([("question_id", ASCENDING)])
        print("Created indexes for user_answers collection")
        
        # API keys collection indexes
        api_keys_collection = database["api_keys"]
        api_keys_collection.create_index([("user_id", ASCENDING)])
        api_keys_collection.create_index([("api_key", ASCENDING)], unique=True)
        api_keys_collection.create_index([("is_active", ASCENDING)])
        print("Created indexes for api_keys collection")
        
        print("\nDatabase initialization completed successfully!")
        
        # Show collection stats
        print("\nCollection statistics:")
        for collection_name in collections:
            count = database[collection_name].count_documents({})
            print(f"  {collection_name}: {count} documents")
            
    except Exception as e:
        print(f"Error initializing database: {str(e)}")
        sys.exit(1)
    finally:
        client.close()

if __name__ == "__main__":
    init_database()
