import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Loader2, AlertCircle, ChevronLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { QuizResultsData } from './QuizResults'; // Import QuizResultsData
import { API_ENDPOINTS } from '../config/api';

interface Question {
  id: string; // Make id required and string type
  question: string;
  options: string[];
  correct_answers: string[];
}

interface QuizData {
  quiz: string; // The raw markdown quiz string
  quiz_id: string; // The ID of the quiz in the database - Changed to string
  parsed_questions: Question[]; // Structured quiz data
}

interface LocationState {
  quiz: string;
  quizId: string;
  parsed_questions: Question[];
  numQuestions: number;
  difficulty: string;
  file: string;
}

interface FetchedQuizData {
  quiz: {
    id: string;
    title: string;
    difficulty: string;
    num_questions: number;
    created_at: string;
  };
  questions: Question[];
}

const TakeQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizId: urlQuizId } = useParams<{ quizId: string }>();
  const { user, token } = useAuth();
  const { quiz, quizId, parsed_questions } = (location.state || {}) as LocationState;
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<QuizResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Time tracking states
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Format time for display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Start timer when quiz loads
  useEffect(() => {
    if (quizData && !startTime) {
      const now = new Date();
      setStartTime(now);
      
      // Start timer interval
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      
      setTimerInterval(interval);
    }

    // Cleanup timer on unmount
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [quizData, startTime]);

  useEffect(() => {
    if (!user || !token) {
      setError("User not authenticated. Please sign in.");
      navigate('/signin');
      return;
    }

    // Priority: URL parameter > location state > URL search params
    const finalQuizId = urlQuizId || quizId || new URLSearchParams(location.search).get('quizId');

    if (location.state && (location.state as LocationState).parsed_questions && (location.state as LocationState).quizId) {
      setQuizData({ 
        quiz: (location.state as LocationState).quiz,
        quiz_id: (location.state as LocationState).quizId,
        parsed_questions: (location.state as LocationState).parsed_questions
      });
      setLoading(false);
    } else if (finalQuizId) {
      // Fetch quiz from backend using the quiz ID
      const fetchQuiz = async () => {
        try {
          const response = await fetch(API_ENDPOINTS.GET_QUIZ(finalQuizId), {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to fetch quiz');
          }
          const data: FetchedQuizData = await response.json();
          setQuizData({
            quiz: "", // Raw quiz string is not returned by this endpoint
            quiz_id: data.quiz.id,
            parsed_questions: data.questions.map((q) => ({
              id: q.id,
              question: q.question,
              options: q.options,
              correct_answers: q.correct_answers,
            }))
          });
          setLoading(false);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load quiz');
          setLoading(false);
        }
      };
      fetchQuiz();
    } else {
      setError("No quiz data found. Please go back to Create Quiz.");
      setLoading(false);
    }
  }, [location.state, location.search, navigate, user, token, urlQuizId, quizId]);

  useEffect(() => {
    if (!urlQuizId) {
      navigate('/');
      return;
    }
  }, [urlQuizId, navigate]);

  useEffect(() => {
    // Only redirect if we have no quiz data and no way to fetch it
    const hasQuizData = quizData || location.state?.parsed_questions || urlQuizId || quizId;
    if (!hasQuizData && !loading) {
      navigate('/create-quiz', { replace: true });
    }
  }, [quizData, location.state, urlQuizId, quizId, loading, navigate]);

  const handleCheckboxChange = (questionId: string, option: string) => {
    setUserAnswers((prevAnswers) => {
      const currentAnswers = prevAnswers[questionId] || [];
      if (currentAnswers.includes(option)) {
        return {
          ...prevAnswers,
          [questionId]: currentAnswers.filter((item) => item !== option),
        };
      } else {
        return {
          ...prevAnswers,
          [questionId]: [...currentAnswers, option],
        };
      }
    });
  };

  const goToNextQuestion = () => {
    // Check if current question has been answered
    const currentQuestionId = quizData?.parsed_questions[currentQuestionIndex]?.id;
    const currentAnswers = userAnswers[currentQuestionId || ''] || [];
    
    if (currentAnswers.length === 0) {
      setError("Please select at least one answer before proceeding.");
      return;
    }
    
    // Clear any previous error
    setError(null);
    
    if (currentQuestionIndex < (quizData?.parsed_questions.length || 0) - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const goToPreviousQuestion = () => {
    // Clear any error when going back
    setError(null);
    
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quizData || !user || !token) {
      setError("Quiz data or user not available for submission.");
      return;
    }

    // Check if all questions have been answered
    const unansweredQuestions = quizData.parsed_questions.filter(q => {
      const answers = userAnswers[q.id] || [];
      return answers.length === 0;
    });

    if (unansweredQuestions.length > 0) {
      setError(`Please answer all questions before submitting. You have ${unansweredQuestions.length} unanswered question(s).`);
      return;
    }

    // Stop the timer
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    setLoading(true);
    setError(null);

    try {
      const answersToSend: Record<string, string[]> = {};
      quizData.parsed_questions.forEach(q => {
        if (q.id) {
          answersToSend[q.id] = userAnswers[q.id] || [];
        }
      });

      console.log("Answers to send:", answersToSend);
      console.log("Time taken:", elapsedTime, "seconds");

      const response = await fetch(API_ENDPOINTS.SUBMIT_QUIZ(quizData.quiz_id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers: answersToSend,
          start_time: startTime?.toISOString(),
          time_taken_seconds: elapsedTime
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit quiz');
      }

      const data = await response.json();
      setResults(data);
      setShowResults(true);
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // This function will be called once results are set
  useEffect(() => {
    if (showResults && results) {
      navigate('/quiz-results/${data.attempt_id}', { state: { results } });
    }
  }, [showResults, results, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl flex items-center space-x-2">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading quiz...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
        <button onClick={() => navigate('/create-quiz')} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
          Create New Quiz
        </button>
      </div>
    );
  }

  const currentQuestion = quizData?.parsed_questions[currentQuestionIndex];
  const totalQuestions = quizData?.parsed_questions.length || 0;

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400 text-xl">No questions available for this quiz.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800 rounded-xl p-8 shadow-xl relative">
          {loading && (
            <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center rounded-xl z-10">
              <Loader2 className="animate-spin text-blue-500" size={48} />
              <p className="text-white ml-3 text-lg">Submitting your answers...</p>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">Take Quiz</h1>
            <div className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
              <Clock size={20} />
              <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-900/50 border border-red-500 rounded-lg p-4 flex items-center space-x-3">
              <XCircle className="text-red-400" size={20} />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {!showResults && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <p className="text-lg text-gray-300">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
                <div className="flex space-x-2">
                  {quizData?.parsed_questions.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full ${
                        index === currentQuestionIndex
                          ? 'bg-blue-500'
                          : (userAnswers[quizData.parsed_questions[index]?.id || ''] || []).length > 0
                          ? 'bg-green-500'
                          : 'bg-gray-500'
                      }`}
                      title={
                        index === currentQuestionIndex
                          ? 'Current question'
                          : (userAnswers[quizData.parsed_questions[index]?.id || ''] || []).length > 0
                          ? 'Answered'
                          : 'Not answered'
                      }
                    />
                  ))}
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold text-white mb-6">{currentQuestion.question}</h2>
              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <label key={index} className="flex items-center text-gray-200 cursor-pointer p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                    <input
                      type="checkbox"
                      value={option}
                      checked={(userAnswers[currentQuestion.id || ''] || []).includes(option)}
                      onChange={() => handleCheckboxChange(currentQuestion.id || '', option)}
                      className="form-checkbox h-5 w-5 text-blue-500 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
                    />
                    <span className="ml-4 text-lg">{String.fromCharCode(65 + index)}. {option}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} />
                  <span>Previous</span>
                </button>
                
                <div className="flex items-center space-x-4">
                  <span className="text-gray-400 text-sm">
                    {currentQuestionIndex + 1} of {totalQuestions} questions
                  </span>
                  <button
                    onClick={goToNextQuestion}
                    disabled={(userAnswers[currentQuestion.id || ''] || []).length === 0}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    <span>{currentQuestionIndex === totalQuestions - 1 ? 'Submit Quiz' : 'Next Question'}</span>
                    {currentQuestionIndex === totalQuestions - 1 ? <CheckCircle size={20} /> : <ChevronLeft size={20} className="rotate-180" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz; 