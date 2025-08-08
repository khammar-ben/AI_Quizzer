import requests
import json

# Test the backend endpoints
BASE_URL = "http://localhost:8000"

def test_backend():
    print("Testing backend endpoints...")
    
    # Test 1: Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/docs")
        print(f"✓ Server is running (status: {response.status_code})")
    except Exception as e:
        print(f"✗ Server is not running: {e}")
        return
    
    # Test 2: Test signup
    try:
        signup_data = {
            "username": "testuser",
            "password": "testpass123"
        }
        response = requests.post(f"{BASE_URL}/signup", json=signup_data)
        if response.status_code == 200:
            print("✓ Signup endpoint working")
        else:
            print(f"✗ Signup failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"✗ Signup test failed: {e}")
    
    # Test 3: Test login
    try:
        login_data = {
            "username": "testuser",
            "password": "testpass123"
        }
        response = requests.post(
            f"{BASE_URL}/token",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        if response.status_code == 200:
            token_data = response.json()
            token = token_data["access_token"]
            print("✓ Login endpoint working")
            
            # Test 4: Test generate quiz with subject
            try:
                quiz_data = {
                    "subject": "Mathematics",
                    "num_questions": 5,
                    "difficulty": "medium"
                }
                response = requests.post(
                    f"{BASE_URL}/generate-quiz",
                    json=quiz_data,
                    headers={"Authorization": f"Bearer {token}"}
                )
                if response.status_code == 200:
                    print("✓ Generate quiz (subject) endpoint working")
                else:
                    print(f"✗ Generate quiz failed: {response.status_code} - {response.text}")
            except Exception as e:
                print(f"✗ Generate quiz test failed: {e}")
                
        else:
            print(f"✗ Login failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"✗ Login test failed: {e}")

if __name__ == "__main__":
    test_backend() 