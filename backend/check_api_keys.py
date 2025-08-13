#!/usr/bin/env python3
"""
Script to check and display all API keys in the database
"""

from pymongo import MongoClient
from config import config
from datetime import datetime

def check_api_keys():
    """Check and display all API keys in the database"""
    try:
        # Connect to MongoDB
        client = MongoClient(config.MONGO_URI)
        database = client[config.DATABASE_NAME]
        
        print(f"Connected to database: {config.DATABASE_NAME}")
        
        # Check if api_keys collection exists
        if "api_keys" not in database.list_collection_names():
            print("No api_keys collection found in database")
            return
        
        api_keys_collection = database["api_keys"]
        users_collection = database["users"]
        
        # Get all API keys
        all_keys = list(api_keys_collection.find())
        
        if not all_keys:
            print("No API keys found in database")
            return
        
        print(f"\nFound {len(all_keys)} API key(s) in database:")
        print("=" * 80)
        
        # Check for OpenAI keys (without hardcoding specific values)
        found_openai_keys = False
        
        for i, key in enumerate(all_keys, 1):
            # Get user info
            user = users_collection.find_one({"_id": key["user_id"]})
            username = user["username"] if user else "Unknown User"
            
            print(f"\n{i}. API Key Details:")
            print(f"   ID: {key['_id']}")
            print(f"   Name: {key.get('name', 'N/A')}")
            print(f"   User: {username}")
            print(f"   Status: {'Active' if key.get('is_active', True) else 'Inactive'}")
            print(f"   Created: {key.get('created_at', 'N/A')}")
            print(f"   Last Used: {key.get('last_used', 'Never')}")
            print(f"   Permissions: {key.get('permissions', ['N/A'])}")
            print(f"   API Key: {key['api_key'][:30]}...")
            
            # Check if this is an OpenAI key
            if key['api_key'].startswith("sk-proj-"):
                print(f"   🔑 This is an OpenAI API key")
                found_openai_keys = True
            
        print("\n" + "=" * 80)
        
        if found_openai_keys:
            print(f"\n✅ OpenAI API keys found in database!")
        else:
            print(f"\n❌ No OpenAI API keys found in database.")
        
    except Exception as e:
        print(f"Error checking API keys: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()

if __name__ == "__main__":
    print("=" * 50)
    print("Checking API Keys in Database")
    print("=" * 50)
    
    check_api_keys()
    print("\nScript completed!")
