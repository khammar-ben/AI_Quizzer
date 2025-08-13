#!/usr/bin/env python3
"""
Simple test script to verify dynamic API key loading
"""

from config import config

def test_dynamic_api_key():
    """Test the dynamic API key loading"""
    print("=" * 50)
    print("Testing Dynamic API Key Loading")
    print("=" * 50)
    
    # Test getting the API key
    api_key = config.get_openai_api_key()
    
    if api_key:
        print(f"✅ API Key loaded successfully!")
        print(f"🔑 Key: {api_key[:30]}...")
        print(f"📏 Length: {len(api_key)} characters")
        print(f"📝 Type: {'OpenAI' if api_key.startswith('sk-proj-') else 'Other'}")
        
        # Test if it's a valid OpenAI key format
        if api_key.startswith("sk-proj-") and len(api_key) > 50:
            print("✅ Key appears to be a valid OpenAI API key!")
        else:
            print("⚠️  Key format may not be valid OpenAI API key")
            
    else:
        print("❌ Failed to load API key")
    
    print("\n" + "=" * 50)

if __name__ == "__main__":
    test_dynamic_api_key()
