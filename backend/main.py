import os
import re
import secrets

from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import traceback
from openai import OpenAI
import PyPDF2
import io
import json
from typing import List, Optional
from datetime import datetime, timedelta
from auth import get_password_hash, verify_password, create_access_token, decode_access_token
from pydantic import BaseModel, Field, BeforeValidator
from typing_extensions import Annotated
from pymongo import MongoClient
from bson import ObjectId
from config import config

# Configuration for JWT
SECRET_KEY = "your-super-secret-key-please-change-me" # WARNING: Hardcoded for user request. CHANGE THIS IN PRODUCTION!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 30 # 30 days

# MongoDB connection
client = MongoClient(config.MONGO_URI)
database = client[config.DATABASE_NAME]
users_collection = database["users"]
quizzes_collection = database["quizzes"]
questions_collection = database["questions"]
quiz_attempts_collection = database["quiz_attempts"]
user_answers_collection = database["user_answers"]

# Pydantic's ObjectId type for MongoDB
PyObjectId = Annotated[str, BeforeValidator(str)]

# Pydantic models for request/response
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    user_id: PyObjectId
    email: Optional[str] = None
    created_at: Optional[datetime] = None
    preferences: Optional[dict] = None

class UserResponse(BaseModel):
    id: PyObjectId = Field(alias="_id")
    username: str
    email: Optional[str] = None
    preferences: Optional[dict] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    class Config:
        arbitrary_types_allowed = True
        populate_by_name = True
        json_encoders = {ObjectId: str}

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    preferences: Optional[dict] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

# Placeholder for quiz and question models (will be updated for MongoDB)
class QuizModel(BaseModel):
    id: PyObjectId = Field(alias="_id")
    title: str
    source_file: str
    difficulty: str
    num_questions: int
    created_at: datetime
    class Config:
        arbitrary_types_allowed = True
        populate_by_name = True
        json_encoders = {ObjectId: str}

class QuestionModel(BaseModel):
    id: PyObjectId = Field(alias="_id")
    quiz_id: PyObjectId
    question_text: str
    options: List[str]
    correct_answers: List[str]
    order: int
    class Config:
        arbitrary_types_allowed = True
        populate_by_name = True
        json_encoders = {ObjectId: str}

class QuizAttemptModel(BaseModel):
    id: PyObjectId = Field(alias="_id")
    user_id: PyObjectId
    quiz_id: PyObjectId
    score: float
    total_questions: int
    correct_answers: int
    completed_at: datetime
    time_taken_seconds: Optional[float] = None
    class Config:
        arbitrary_types_allowed = True
        populate_by_name = True
        json_encoders = {ObjectId: str}

class UserAnswerModel(BaseModel):
    id: PyObjectId = Field(alias="_id")
    question_id: PyObjectId
    quiz_attempt_id: PyObjectId
    selected_answers: List[str]
    is_correct: bool
    created_at: datetime
    class Config:
        arbitrary_types_allowed = True
        populate_by_name = True
        json_encoders = {ObjectId: str}

class QuizSubmission(BaseModel):
    answers: dict
    start_time: Optional[str] = None
    time_taken_seconds: Optional[float] = None

app = FastAPI()

# OAuth2PasswordBearer for token extraction from requests
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

openai_client = OpenAI(api_key=config.get_openai_api_key())

# Dependency to get current user based on token (updated for MongoDB)
def get_current_user(token: str = Depends(oauth2_scheme)):
    username = decode_access_token(token, config.SECRET_KEY, config.ALGORITHM)
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_doc = users_collection.find_one({"username": username})
    if user_doc is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return UserResponse(**user_doc)

@app.post("/signup", response_model=UserResponse)
def signup(user: UserCreate):
    try:
        # Check if username or email already exists
        if users_collection.find_one({"username": user.username}):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")
        if users_collection.find_one({"email": user.email}):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        
        # Hash password and create user document
        hashed_password = get_password_hash(user.password)
        user_doc = {
            "username": user.username,
            "email": user.email,
            "hashed_password": hashed_password,
            "preferences": {"notifications": True}, # Default preferences
            "created_at": datetime.utcnow()
        }
        
        # Insert user into MongoDB
        result = users_collection.insert_one(user_doc)
        new_user = users_collection.find_one({"_id": result.inserted_id})
        
        return UserResponse(**new_user)
    except Exception as e:
        print(f"Error in signup: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        user_doc = users_collection.find_one({"username": form_data.username})
        if not user_doc or not verify_password(form_data.password, user_doc["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token_expires = timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_doc["username"]},
            expires_delta=access_token_expires,
            secret_key=config.SECRET_KEY,
            algorithm=config.ALGORITHM,
            access_token_expire_minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES
        )
        return {
            "access_token": access_token, 
            "token_type": "bearer", 
            "username": user_doc["username"], 
            "user_id": str(user_doc["_id"]),
            "email": user_doc.get("email"),
            "created_at": user_doc.get("created_at"),
            "preferences": user_doc.get("preferences", {})
        }
    except Exception as e:
        print(f"Error in login_for_access_token: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/users/{username}", response_model=UserResponse)
def update_user_profile(
    username: str,
    user_update: UserUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    if current_user.username != username:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this profile")

    user_doc = users_collection.find_one({"username": username})
    if not user_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    update_fields = {}

    if user_update.username is not None and user_update.username != user_doc.get("username"):
        if users_collection.find_one({"username": user_update.username}):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")
        update_fields["username"] = user_update.username
    
    if user_update.email is not None and user_update.email != user_doc.get("email"):
        if users_collection.find_one({"email": user_update.email}):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already taken")
        update_fields["email"] = user_update.email

    if user_update.preferences is not None:
        update_fields["preferences"] = user_update.preferences
    
    if user_update.new_password:
        if not user_update.current_password:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is required to change password")
        
        if not verify_password(user_update.current_password, user_doc["hashed_password"]):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect current password")
        
        # Add password strength validation here if desired (e.g., regex)
        
        update_fields["hashed_password"] = get_password_hash(user_update.new_password)
    
    if not update_fields:
        return UserResponse(**user_doc) # No changes, return current user info

    users_collection.update_one(
        {"_id": user_doc["_id"]},
        {"$set": update_fields}
    )

    updated_user_doc = users_collection.find_one({"_id": user_doc["_id"]})
    return UserResponse(**updated_user_doc)

def extract_text_from_pdf(pdf_content: bytes) -> str:
    try:
        # Create a BytesIO object from the PDF content
        pdf_file = io.BytesIO(pdf_content)
        
        # Create a PDF reader object
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        # Extract text from each page
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        
        if not text.strip():
            raise ValueError("No text could be extracted from the PDF")
            
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error processing PDF: {str(e)}")

def parse_quiz_response(quiz_text: str) -> list:
    """Parse the quiz response from OpenAI into structured data."""
    questions = []
    current_question = None
    current_options = []
    current_correct_answers = None
    
    for line in quiz_text.split('\n'):
        line = line.strip()
        if not line:
            continue
            
        # Check for question number
        if line[0].isdigit() and '. ' in line:
            if current_question:
                questions.append({
                    'question': current_question,
                    'options': current_options,
                    'correct_answers': current_correct_answers
                })
            current_question = line.split('. ', 1)[1]
            current_options = []
            current_correct_answers = None
        # Check for options
        elif line.startswith(('A.', 'B.', 'C.', 'D.')):
            option_text = line.split('. ', 1)[1]
            current_options.append(option_text)
        # Check for correct answers
        elif line.startswith('**Correct Answers:'):
            match = re.search(r'\b[A-D](?:, [A-D])*\b', line)
            if match:
                answers_str = match.group(0)
                current_correct_answers = [ans.strip() for ans in answers_str.split(',')]
            else:
                current_correct_answers = [] # Handle cases where no valid answers are found
    
    # Add the last question
    if current_question:
        questions.append({
            'question': current_question,
            'options': current_options,
            'correct_answers': current_correct_answers
        })
    
    return questions

@app.post("/generate-quiz")
async def generate_quiz(
    request: Request,
    current_user: UserResponse = Depends(get_current_user),
):
    try:
        content_type = request.headers.get("Content-Type", "")
        
        num_questions: int = 5 # Default values
        difficulty: str = "medium" # Default values
        
        file_content: Optional[bytes] = None
        file_name: Optional[str] = None
        subject: Optional[str] = None

        print(f"Content-Type: {content_type}")

        if "application/json" in content_type:
            data = await request.json()
            subject = data.get("subject")
            num_questions = data.get("num_questions", num_questions)
            difficulty = data.get("difficulty", difficulty)
            print(f"Received JSON request: subject={subject}, num_questions={num_questions}, difficulty={difficulty}")

            if not subject:
                raise HTTPException(status_code=400, detail="Subject is required for subject-based quiz generation")

        elif "multipart/form-data" in content_type:
            form = await request.form()
            print(f"Form data keys: {list(form.keys())}")
            
            file = form.get("file")
            print(f"File object type: {type(file)}")
            
            if file and hasattr(file, 'filename') and hasattr(file, 'read'):
                # It's an UploadFile object
                file_content = await file.read()
                file_name = file.filename
                num_questions = int(form.get("num_questions", num_questions))
                difficulty = form.get("difficulty", difficulty)
                print(f"Received file upload: filename={file_name}, num_questions={num_questions}, difficulty={difficulty}")

                if not file_content:
                    raise HTTPException(status_code=400, detail="Empty file uploaded")
            else:
                print(f"File not found in form data. Available keys: {list(form.keys())}")
                raise HTTPException(status_code=400, detail="File not provided in form data")
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported content type: {content_type}")

        prompt = ""
        source_identifier = ""
        
        if file_content and file_name:
            if file_name.lower().endswith('.pdf'):
                print(f"Processing PDF file: {file_name}")
                file_text = extract_text_from_pdf(file_content)
            else:
                print(f"Processing text file: {file_name}")
                try:
                    file_text = file_content.decode("utf-8")
                except UnicodeDecodeError:
                    raise HTTPException(status_code=400, detail="Invalid text file encoding. Please use UTF-8 encoding.")
            
            if not file_text.strip():
                raise HTTPException(status_code=400, detail="No text content could be extracted from the file")
                
            print(f"Extracted text length: {len(file_text)} characters")
            prompt = f"Generate {num_questions} multiple-select quiz questions (MSQ) with options and correct answers based on the following text: {file_text}\n\nDifficulty: {difficulty}.\n\nFor each question, provide the question, four options (A, B, C, D), and then list ALL correct answer labels (e.g., A, C) on a new line starting with **Correct Answers:**. Use Markdown format.\n\nExample:\n1. Which of the following are primary colors?\nA. Red\nB. Blue\nC. Green\nD. Yellow\n**Correct Answers:** A, B\n\n2. Which of these animals lay eggs?\nA. Chicken\nB. Cow\nC. Snake\nD. Dog\n**Correct Answers:** A, C"
            source_identifier = f"Quiz from {file_name}"
        elif subject:
            print(f"Generating quiz for subject: {subject}")
            prompt = f"Generate {num_questions} multiple-select quiz questions (MSQ) with options and correct answers about the subject: {subject}\n\nDifficulty: {difficulty}.\n\nFor each question, provide the question, four options (A, B, C, D), and then list ALL correct answer labels (e.g., A, C) on a new line starting with **Correct Answers:**. Use Markdown format.\n\nExample:\n1. Which of the following are primary colors?\nA. Red\nB. Blue\nC. Green\nD. Yellow\n**Correct Answers:** A, B\n\n2. Which of these animals lay eggs?\nA. Chicken\nB. Cow\nC. Snake\nD. Dog\n**Correct Answers:** A, C"
            source_identifier = f"Quiz on {subject}"
        else:
            raise HTTPException(status_code=400, detail="Either a file or a subject must be provided")

        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        quiz_text = response.choices[0].message.content
        
        parsed_questions = parse_quiz_response(quiz_text)
        
        # Save quiz to MongoDB
        quiz_doc = {
            "title": source_identifier,
            "source_file": file_name if file_name else "N/A",
            "difficulty": difficulty,
            "num_questions": num_questions,
            "created_at": datetime.utcnow()
        }
        result = quizzes_collection.insert_one(quiz_doc)
        quiz_id = result.inserted_id

        # Save questions to MongoDB
        questions_with_ids = []
        for i, question_data in enumerate(parsed_questions):
            question_doc = {
                "quiz_id": quiz_id,
                "question_text": question_data['question'],
                "options": question_data['options'],
                "correct_answers": question_data['correct_answers'],
                "order": i + 1
            }
            result = questions_collection.insert_one(question_doc)
            question_data['id'] = str(result.inserted_id) 
            questions_with_ids.append(question_data)
        
        return {
            "quiz": quiz_text,
            "quiz_id": str(quiz_id),
            "parsed_questions": questions_with_ids # Return questions with IDs
        }
    except Exception as e:
        print(f"Error in generate_quiz: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/quiz/{quiz_id}/submit")
def submit_quiz(
    quiz_id: str,
    submission: QuizSubmission,
    current_user: UserResponse = Depends(get_current_user),
):
    print(f"Received answers for quiz {quiz_id}: {submission.answers}")
    print(f"Time taken: {submission.time_taken_seconds} seconds")
    try:
        quiz_obj_id = ObjectId(quiz_id)
        quiz_doc = quizzes_collection.find_one({"_id": quiz_obj_id})
        if not quiz_doc:
            raise HTTPException(status_code=404, detail="Quiz not found")
        
        question_docs = list(questions_collection.find({"quiz_id": quiz_obj_id}))
        
        # Calculate time taken
        completed_at = datetime.utcnow()
        
        # Use provided time data or calculate from start_time
        if submission.time_taken_seconds is not None:
            time_taken = submission.time_taken_seconds
        elif submission.start_time:
            try:
                start_time = datetime.fromisoformat(submission.start_time.replace('Z', '+00:00'))
                time_taken = (completed_at - start_time).total_seconds()
            except:
                time_taken = 0.0
        else:
            time_taken = 0.0

        # Create quiz attempt
        quiz_attempt_doc = {
            "user_id": ObjectId(current_user.id), # Ensure user_id is stored as ObjectId
            "quiz_id": quiz_obj_id,
            "total_questions": len(question_docs),
            "correct_answers": 0,
            "score": 0.0,
            "completed_at": completed_at,
            "time_taken_seconds": time_taken # Store time taken
        }
        result = quiz_attempts_collection.insert_one(quiz_attempt_doc)
        attempt_id = result.inserted_id
        
        results = []
        correct_count = 0
        
        for question_doc in question_docs:
            question_id_str = str(question_doc["_id"])
            user_answer = submission.answers.get(question_id_str, [])

            # Map options letters (A, B, C, D) to their full text content
            option_map = {chr(65 + i): option_text for i, option_text in enumerate(question_doc["options"])}
            
            # Convert correct_answers (e.g., ['A', 'C']) to their text content (e.g., ["Red", "Green"])
            correct_answer_texts = [option_map[key] for key in question_doc["correct_answers"]]
            
            # Compare user's selected answers (text content) with correct answer texts
            is_correct = set(user_answer) == set(correct_answer_texts)
            
            if is_correct:
                correct_count += 1
            
            # Save user answer
            user_answer_doc = {
                "question_id": question_doc["_id"],
                "quiz_attempt_id": attempt_id,
                "selected_answers": user_answer,
                "is_correct": is_correct,
                "created_at": datetime.utcnow()
            }
            user_answers_collection.insert_one(user_answer_doc)
            
            results.append({
                "question_id": question_id_str,
                "is_correct": is_correct,
                "user_answer": user_answer,
                "correct_answers": correct_answer_texts # Return text content for correct answers
            })
        
        # Update quiz attempt with final score
        score = (correct_count / len(question_docs)) * 100 if len(question_docs) > 0 else 0.0
        quiz_attempts_collection.update_one(
            {"_id": attempt_id},
            {"$set": {"correct_answers": correct_count, "score": score}}
        )
        
        return {
            "quiz_id": quiz_id,
            "attempt_id": str(attempt_id),
            "results": results,
            "score": score,
            "total": len(results),
            "correct_answers": correct_count,
            "time_taken_seconds": time_taken
        }
    except Exception as e:
        print(f"Error in submit_quiz: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/quiz/{quiz_id}")
def get_quiz(
    quiz_id: str, # Changed to str for ObjectId
    current_user: UserResponse = Depends(get_current_user),
):
    try:
        quiz_obj_id = ObjectId(quiz_id)
        quiz_doc = quizzes_collection.find_one({"_id": quiz_obj_id})
        if not quiz_doc:
            raise HTTPException(status_code=404, detail="Quiz not found")
        
        # For now, we allow any authenticated user to view any quiz if they have the ID

        question_docs = list(questions_collection.find({"quiz_id": quiz_obj_id}).sort("order", 1))
        
        questions_data = [
            {
                "id": str(q["_id"]),
                "question": q["question_text"],
                "options": q["options"],
                "correct_answers": q["correct_answers"]
            }
            for q in question_docs
        ]
        
        return {
            "quiz": {
                "id": str(quiz_doc["_id"]),
                "title": quiz_doc["title"],
                "difficulty": quiz_doc["difficulty"],
                "num_questions": quiz_doc["num_questions"],
                "created_at": quiz_doc["created_at"]
            },
            "questions": questions_data
        }
    except Exception as e:
        print(f"Error in get_quiz: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/quiz-attempt/{attempt_id}")
def get_quiz_attempt_details(
    attempt_id: str, # Changed to str for ObjectId
    current_user: UserResponse = Depends(get_current_user),
):
    try:
        attempt_obj_id = ObjectId(attempt_id)
        attempt_doc = quiz_attempts_collection.find_one({"_id": attempt_obj_id})
        if not attempt_doc:
            raise HTTPException(status_code=404, detail="Quiz attempt not found")
            
        # Ensure the current user owns this quiz attempt
        if attempt_doc["user_id"] != ObjectId(current_user.id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this quiz attempt")
        
        quiz_doc = quizzes_collection.find_one({"_id": attempt_doc["quiz_id"]})
        if not quiz_doc:
            raise HTTPException(status_code=404, detail="Associated quiz not found")
            
        questions_data = []
        for question_doc in list(questions_collection.find({"quiz_id": attempt_doc["quiz_id"]}).sort("order", 1)):
            user_answer_doc = user_answers_collection.find_one({
                "question_id": question_doc["_id"],
                "quiz_attempt_id": attempt_obj_id
            })
            
            questions_data.append({
                "id": str(question_doc["_id"]),
                "question_text": question_doc["question_text"],
                "options": question_doc["options"],
                "correct_answers": question_doc["correct_answers"],
                "user_selected_answers": user_answer_doc["selected_answers"] if user_answer_doc else [],
                "is_correct": user_answer_doc["is_correct"] if user_answer_doc else False
            })
            
        return {
            "attempt_id": str(attempt_doc["_id"]),
            "user_id": str(attempt_doc["user_id"]),
            "quiz_id": str(attempt_doc["quiz_id"]),
            "score": attempt_doc["score"],
            "total_questions": attempt_doc["total_questions"],
            "correct_answers": attempt_doc["correct_answers"],
            "completed_at": attempt_doc["completed_at"],
            "quiz_title": quiz_doc["title"],
            "quiz_difficulty": quiz_doc["difficulty"],
            "questions": questions_data
        }
    except Exception as e:
        print(f"Error in get_quiz_attempt_details: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/quiz-attempt/{attempt_id}")
def delete_quiz_attempt(
    attempt_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    try:
        attempt_obj_id = ObjectId(attempt_id)
        
        # Find the quiz attempt to ensure it exists and belongs to the current user
        attempt_doc = quiz_attempts_collection.find_one({"_id": attempt_obj_id})
        if not attempt_doc:
            raise HTTPException(status_code=404, detail="Quiz attempt not found.")
        
        if attempt_doc["user_id"] != ObjectId(current_user.id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this quiz attempt.")
        
        # Delete associated user answers first
        user_answers_collection.delete_many({"quiz_attempt_id": attempt_obj_id})
        
        # Delete the quiz attempt itself
        delete_result = quiz_attempts_collection.delete_one({"_id": attempt_obj_id})
        
        if delete_result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Quiz attempt not found or already deleted.")
        
        return {"message": "Quiz attempt and associated answers deleted successfully."}
    except Exception as e:
        print(f"Error in delete_quiz_attempt: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/users/{username}/history")
def get_user_history(
    username: str,
    current_user: UserResponse = Depends(get_current_user),
):
    try:
        # Ensure the requested username matches the authenticated user
        if username != current_user.username:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this user's history")

        user_doc = users_collection.find_one({"username": username})
        if not user_doc:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Ensure user_id is an ObjectId for the query
        user_obj_id = ObjectId(current_user.id)
        
        attempts_cursor = quiz_attempts_collection.find({"user_id": user_obj_id}).sort("completed_at", -1)
        
        history = []
        for attempt in attempts_cursor:
            quiz_doc = quizzes_collection.find_one({"_id": attempt["quiz_id"]})
            if quiz_doc:
                history.append({
                    "id": str(attempt["_id"]),
                    "quiz_id": str(attempt["quiz_id"]),
                    "quiz_title": quiz_doc["title"],
                    "score": attempt["score"],
                    "total_questions": attempt["total_questions"],
                    "correct_answers": attempt["correct_answers"],
                    "completed_at": attempt["completed_at"],
                    "difficulty": quiz_doc["difficulty"],
                    "time_taken_seconds": attempt.get("time_taken_seconds")
                })
        print(f"Returning history: {history}")
        return history
    except Exception as e:
        print(f"Error in get_user_history: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user-quizzes/count")
def get_user_created_quizzes_count(current_user: UserResponse = Depends(get_current_user)):
    try:
        user_obj_id = ObjectId(current_user.id)
        count = quizzes_collection.count_documents({"user_id": user_obj_id})
        return {"total_created_quizzes": count}
    except Exception as e:
        print(f"Error in get_user_created_quizzes_count: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user-quizzes")
def get_user_created_quizzes(
    current_user: UserResponse = Depends(get_current_user),
):
    try:
        user_obj_id = ObjectId(current_user.id)
        quizzes_cursor = quizzes_collection.find({"user_id": user_obj_id}).sort("created_at", -1)
        
        created_quizzes = []
        for quiz in quizzes_cursor:
            created_quizzes.append({
                "id": str(quiz["_id"]),
                "title": quiz["title"],
                "difficulty": quiz["difficulty"],
                "num_questions": quiz["num_questions"],
                "created_at": quiz["created_at"],
                "user_id": str(quiz["user_id"])
            })
        
        return created_quizzes
    except Exception as e:
        print(f"Error in get_user_created_quizzes: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/quizzes")
def get_all_available_quizzes(
    current_user: UserResponse = Depends(get_current_user),
):
    try:
        # Get all quizzes
        quizzes = list(quizzes_collection.find())
        return quizzes
    except Exception as e:
        print(f"Error in get_all_available_quizzes: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# Email-related endpoints
class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

@app.post("/forgot-password")
def forgot_password(reset_request: PasswordResetRequest):
    """Request a password reset email"""
    try:
        # Check if user exists with this email
        user_doc = users_collection.find_one({"email": reset_request.email})
        if not user_doc:
            # Don't reveal if email exists or not for security
            return {"message": "If an account with that email exists, a password reset link has been sent."}
        
        # TODO: Generate reset token and send email
        # For now, just return success message
        print(f"Password reset requested for email: {reset_request.email}")
        
        return {"message": "If an account with that email exists, a password reset link has been sent."}
    except Exception as e:
        print(f"Error in forgot_password: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/reset-password")
def reset_password(reset_confirm: PasswordResetConfirm):
    """Reset password using token"""
    try:
        # TODO: Verify token and update password
        # For now, just return success message
        print(f"Password reset confirmed with token: {reset_confirm.token}")
        
        return {"message": "Password has been reset successfully."}
    except Exception as e:
        print(f"Error in reset_password: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/resend-verification")
def resend_verification_email(
    current_user: UserResponse = Depends(get_current_user)
):
    """Resend email verification"""
    try:
        # TODO: Send verification email
        print(f"Verification email requested for user: {current_user.username}")
        
        return {"message": "Verification email sent successfully."}
    except Exception as e:
        print(f"Error in resend_verification_email: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/verify-email/{token}")
def verify_email(token: str):
    """Verify email using token"""
    try:
        # TODO: Verify token and mark email as verified
        print(f"Email verification requested with token: {token}")
        
        return {"message": "Email verified successfully."}
    except Exception as e:
        print(f"Error in verify_email: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)