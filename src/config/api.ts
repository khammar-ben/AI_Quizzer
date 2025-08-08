// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Authentication
  SIGNUP: `${API_BASE_URL}/signup`,
  LOGIN: `${API_BASE_URL}/token`,
  UPDATE_PROFILE: (username: string) => `${API_BASE_URL}/users/${username}`,
  
  // Email & Password Management
  FORGOT_PASSWORD: `${API_BASE_URL}/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/reset-password`,
  RESEND_VERIFICATION: `${API_BASE_URL}/resend-verification`,
  VERIFY_EMAIL: (token: string) => `${API_BASE_URL}/verify-email/${token}`,
  
  // Quiz Management
  CREATE_QUIZ: `${API_BASE_URL}/generate-quiz`,
  GET_QUIZ: (quizId: string) => `${API_BASE_URL}/quiz/${quizId}`,
  SUBMIT_QUIZ: (quizId: string) => `${API_BASE_URL}/quiz/${quizId}/submit`,
  GET_ALL_QUIZZES: `${API_BASE_URL}/quizzes`,
  GET_USER_QUIZZES: `${API_BASE_URL}/user-quizzes`,
  GET_USER_QUIZZES_COUNT: `${API_BASE_URL}/user-quizzes/count`,
  DELETE_QUIZ: (quizId: string) => `${API_BASE_URL}/quizzes/${quizId}`,
  
  // Quiz Attempts
  GET_QUIZ_ATTEMPT: (attemptId: string) => `${API_BASE_URL}/quiz-attempt/${attemptId}`,
  DELETE_QUIZ_ATTEMPT: (attemptId: string) => `${API_BASE_URL}/quiz-attempt/${attemptId}`,
  
  // User History
  GET_USER_HISTORY: (username: string) => `${API_BASE_URL}/users/${username}/history`,
};

export default API_BASE_URL; 