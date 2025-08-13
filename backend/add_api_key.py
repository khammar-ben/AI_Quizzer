#!/usr/bin/env python3
"""
Script to add a specific API key to the database
This script adds the provided API key to the api_keys collection
"""

from pymongo import MongoClient, ASCENDING
from config import config
import sys
from datetime import datetime
from bson import ObjectId

def add_api_key():
    """Add the specified API key to the database"""
    try:
        # Connect to MongoDB
        client = MongoClient(config.MONGO_URI)
        database = client[config.DATABASE_NAME]
        
        print(f"Connected to database: {config.DATABASE_NAME}")
        
        # Ensure api_keys collection exists
        if "api_keys" not in database.list_collection_names():
            print("Creating api_keys collection...")
            database.create_collection("api_keys")
            
            # Create indexes for the api_keys collection
            api_keys_collection = database["api_keys"]
            api_keys_collection.create_index([("user_id", ASCENDING)])
            api_keys_collection.create_index([("api_key", ASCENDING)], unique=True)
            api_keys_collection.create_index([("is_active", ASCENDING)])
            print("Created api_keys collection with indexes")
        else:
            print("api_keys collection already exists")
        
        # Get API key from user input or use a placeholder
        print("\nEnter the API key to add (or press Enter to use a test key):")
        api_key_input = input("API Key: ").strip()
        
        if api_key_input:
            api_key_value = api_key_input
        else:
            # Use a placeholder for testing
            api_key_value = "sk-proj-TEST_KEY_PLACEHOLDER_REPLACE_WITH_REAL_KEY"
            print("Using test placeholder key. Please replace with real key later.")
        
        # Check if the API key already exists
        api_keys_collection = database["api_keys"]
        existing_key = api_keys_collection.find_one({"api_key": api_key_value})
        
        if existing_key:
            print(f"API key already exists in database")
            print(f"Key ID: {existing_key['_id']}")
            print(f"Name: {existing_key['name']}")
            print(f"User ID: {existing_key['user_id']}")
            print(f"Status: {'Active' if existing_key['is_active'] else 'Inactive'}")
            return
        
        # Get the first user from the database to assign this key to
        users_collection = database["users"]
        first_user = users_collection.find_one()
        
        if not first_user:
            print("No users found in database. Please create a user first.")
            return
        
        user_id = first_user["_id"]
        username = first_user["username"]
        
        print(f"Assigning API key to user: {username} (ID: {user_id})")
        
        # Create the API key document
        api_key_doc = {
            "user_id": user_id,
            "api_key": api_key_value,
            "name": "OpenAI API Key",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "last_used": None,
            "permissions": ["read", "write"]
        }
        
        # Insert the API key
        result = api_keys_collection.insert_one(api_key_doc)
        
        print(f"✅ API key added successfully!")
        print(f"Key ID: {result.inserted_id}")
        print(f"Name: {api_key_doc['name']}")
        print(f"User: {username}")
        print(f"Status: Active")
        print(f"Permissions: {api_key_doc['permissions']}")
        
        # Show all API keys for this user
        print(f"\nAll API keys for user '{username}':")
        user_keys = api_keys_collection.find({"user_id": user_id})
        for i, key in enumerate(user_keys, 1):
            print(f"  {i}. {key['name']} - {'Active' if key['is_active'] else 'Inactive'} - {key['api_key'][:20]}...")
            
    except Exception as e:
        print(f"Error adding API key: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        client.close()

if __name__ == "__main__":
    print("=" * 50)
    print("Adding API Key to Database")
    print("=" * 50)
    
    add_api_key()
    print("\nScript completed!")
