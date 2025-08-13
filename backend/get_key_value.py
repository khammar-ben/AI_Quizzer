#!/usr/bin/env python3
"""
Simple script to get just the API key value
"""

from config import config

def get_key_value():
    """Get just the API key value"""
    api_key = config.get_openai_api_key()
    if api_key:
        print(api_key)
    else:
        print("No API key found")

if __name__ == "__main__":
    get_key_value()
