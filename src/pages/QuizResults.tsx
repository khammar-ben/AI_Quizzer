import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, History, Award, RotateCcw, Download, Share2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';

interface AnswerResult {
  question_id: string;
  is_correct: boolean;
  user_answer: string[];
  correct_answers: string[];
}

export interface QuizResultsData {
  quiz_id: string;
  attempt_id: string;
  results: AnswerResult[];
  score: number;
  total: number;
  correct_answers: number;
  time_taken_seconds?: number;
}

interface QuestionDetail {
  id: string;
  question: string;
  options: string[];
  correct_answers: string[];
}

interface QuizDetail {
  id: string;
  title: string;
  difficulty: string;
  num_questions: number;
  created_at: string;
}

interface QuizAttemptOverview {
  id: string;
  quiz_id: string;
  quiz_title: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  completed_at: string;
  difficulty: string;
}

const QuizResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { results: singleQuizResults } = location.state as { results: QuizResultsData } || {};
  const { token, user } = useAuth();

  const [quizDetails, setQuizDetails] = useState<QuizDetail | null>(null);
  const [questionsDetails, setQuestionsDetails] = useState<QuestionDetail[]>([]);
  const [allQuizAttempts, setAllQuizAttempts] = useState<QuizAttemptOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !user) {
        setError("Authentication token or user not found. Please sign in.");
        setLoading(false);
        navigate('/signin');
        return;
      }

      console.log("Fetching data for user:", user.username);
      console.log("Token available:", !!token);

      if (singleQuizResults && singleQuizResults.quiz_id) {
        console.log("Fetching single quiz results for quiz_id:", singleQuizResults.quiz_id);
        try {
          const response = await fetch(API_ENDPOINTS.GET_QUIZ(singleQuizResults.quiz_id), {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to fetch quiz details');
          }
          const data = await response.json();
          console.log("Single quiz data received:", data);
          setQuizDetails(data.quiz);
          setQuestionsDetails(data.questions);
        } catch (err) {
          console.error("Error fetching single quiz details:", err);
          setError(err instanceof Error ? err.message : "Failed to load quiz details.");
        }
      }

      // Always fetch history for global overview
      try {
        console.log("Fetching quiz history for user:", user.username);
        const response = await fetch(API_ENDPOINTS.GET_USER_HISTORY(user.username), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch quiz history');
        }
        const data = await response.json();
        console.log("Quiz history data received:", data);
        setAllQuizAttempts(data);
      } catch (err) {
        console.error("Error fetching quiz history:", err);
        setError(err instanceof Error ? err.message : "Failed to load quiz history.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [singleQuizResults, navigate, token, user]);

  const calculateGlobalScore = () => {
    console.log("Calculating global score from attempts:", allQuizAttempts);
    if (allQuizAttempts.length === 0) return { globalScore: 0, totalCorrect: 0, totalQuestions: 0 };

    let totalCorrect = 0;
    let totalQuestions = 0;

    allQuizAttempts.forEach(attempt => {
      totalCorrect += attempt.correct_answers;
      totalQuestions += attempt.total_questions;
    });

    const globalScore = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
    console.log("Calculated global score:", { globalScore, totalCorrect, totalQuestions });
    return { globalScore, totalCorrect, totalQuestions };
  };

  const { globalScore, totalCorrect, totalQuestions } = calculateGlobalScore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
          <p className="text-white text-xl">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-red-400">
        <XCircle size={48} className="mb-4" />
        <p className="text-lg">{error}</p>
        <button
          onClick={() => navigate('/create-quiz')}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Go to Create Quiz
        </button>
      </div>
    );
  }

  if (!singleQuizResults && allQuizAttempts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-gray-400">
        <AlertCircle size={48} className="mb-4" />
        <p className="text-lg">No quiz results or history found.</p>
        <button
          onClick={() => navigate('/create-quiz')}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Create Your First Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800 rounded-xl p-8 shadow-xl">
          {/* Global Score Overview */}
          <div className="mb-8 text-center bg-gray-700 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-white mb-4">Global Performance</h2>
            <p className="text-2xl text-gray-200 mb-2">Overall Score: <span className={`font-semibold ${getScoreColor(globalScore)}`}>{globalScore.toFixed(2)}%</span></p>
            <p className="text-xl text-gray-300">Total Correct: <span className="font-semibold text-green-400">{totalCorrect}</span> out of <span className="font-semibold text-white">{totalQuestions}</span> questions</p>
          </div>

          {singleQuizResults && (
            <>
              {/* Current Quiz Results Summary */}
              <div className="bg-gray-800 rounded-xl p-8 shadow-xl mb-8">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-white mb-2">Quiz Results</h1>
                  {quizDetails && <p className="text-xl text-gray-400 mb-4">Quiz: {quizDetails.title}</p>}
                  <div className="flex items-center justify-center space-x-8 mb-6">
                    <div className={`text-6xl font-bold ${getScoreColor(singleQuizResults.score)}`}>
                      {singleQuizResults.score.toFixed(0)}%
                    </div>
                    <div className="text-left">
                      <p className="text-gray-300">
                        <span className="text-white font-semibold">{singleQuizResults.correct_answers}</span> out of 
                        <span className="text-white font-semibold">{singleQuizResults.total}</span> correct
                      </p>
                      <p className="text-gray-400">Time spent: {formatTime(singleQuizResults.time_taken_seconds || 0)}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-4">
                    <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                      <RotateCcw size={16} />
                      <span>Retake Quiz</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                      <Download size={16} />
                      <span>Download Results</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                      <Share2 size={16} />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Question Review Section */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Question Review</h2>
                {questionsDetails.length > 0 ? (
                  <div className="space-y-8">
                    {questionsDetails.map((question, qIndex) => {
                      const userAnswer = singleQuizResults.results.find(res => res.question_id === question.id);
                      const isCorrect = userAnswer ? userAnswer.is_correct : false;

                      return (
                        <div key={question.id} className="bg-gray-700 p-6 rounded-lg">
                          <h3 className="text-xl font-semibold text-white mb-4">
                            {qIndex + 1}. {question.question}
                            <span className={`ml-3 text-sm font-normal ${(() => {
                              const correctOptionLetters = question.correct_answers;
                              const normalizedCorrectAnswers = correctOptionLetters.map(ca => {
                                if (ca.length === 1 && ca.charCodeAt(0) >= 65 && ca.charCodeAt(0) <= (65 + question.options.length - 1)) {
                                  return question.options[ca.charCodeAt(0) - 65];
                                }
                                return ca;
                              });
                              
                              const userSelectedAnswersFullText = userAnswer?.user_answer || [];
                              const userCorrectSelections = userSelectedAnswersFullText.filter(userAns => 
                                normalizedCorrectAnswers.includes(userAns)
                              ).length;

                              const totalCorrectOptions = normalizedCorrectAnswers.length;
                              const totalUserSelections = userSelectedAnswersFullText.length;

                              if (userCorrectSelections === totalCorrectOptions && totalUserSelections === totalCorrectOptions) {
                                return 'text-green-400';
                              } else if (userCorrectSelections > 0 && userCorrectSelections < totalCorrectOptions) {
                                return 'text-yellow-400';
                              } else if (userCorrectSelections === 0 && totalUserSelections > 0) {
                                return 'text-red-400';
                              } else if (totalUserSelections === 0 && totalCorrectOptions > 0) {
                                return 'text-red-400';
                              } else {
                                return 'text-red-400';
                              }
                            })()}`}>
                              ({(() => {
                                const correctOptionLetters = question.correct_answers;
                                const normalizedCorrectAnswers = correctOptionLetters.map(ca => {
                                  if (ca.length === 1 && ca.charCodeAt(0) >= 65 && ca.charCodeAt(0) <= (65 + question.options.length - 1)) {
                                    return question.options[ca.charCodeAt(0) - 65];
                                  }
                                  return ca;
                                });
                                
                                const userSelectedAnswersFullText = userAnswer?.user_answer || [];
                                const userCorrectSelections = userSelectedAnswersFullText.filter(userAns => 
                                  normalizedCorrectAnswers.includes(userAns)
                                ).length;

                                const totalCorrectOptions = normalizedCorrectAnswers.length;
                                const totalUserSelections = userSelectedAnswersFullText.length;

                                if (totalCorrectOptions === 0) {
                                  return 'N/A';
                                } else if (userCorrectSelections === totalCorrectOptions && totalUserSelections === totalCorrectOptions) {
                                  return 'Correct';
                                } else if (userCorrectSelections > 0 && userCorrectSelections < totalCorrectOptions) {
                                  return `${userCorrectSelections}/${totalCorrectOptions} Correct`;
                                } else if (totalUserSelections === 0 && totalCorrectOptions > 0) {
                                  return 'No Answer';
                                } else {
                                  return 'Incorrect';
                                }
                              })()})
                            </span>
                          </h3>
                          <div className="space-y-2 mb-4">
                            {question.options.map((option, oIndex) => {
                              const isUserSelected = userAnswer?.user_answer.includes(option);
                              const optionLetter = String.fromCharCode(65 + oIndex);
                              const isCorrectAnswerLetter = question.correct_answers.includes(optionLetter);

                              let bgColor = '';
                              const textColor = 'text-gray-200';
                              if (isUserSelected && !isCorrectAnswerLetter) {
                                bgColor = 'bg-red-900/40';
                              } else if (isCorrectAnswerLetter && isUserSelected) {
                                bgColor = 'bg-green-900/40';
                              } else if (isCorrectAnswerLetter && !isUserSelected) {
                                bgColor = 'bg-yellow-900/40';
                              }

                              return (
                                <div 
                                  key={oIndex} 
                                  className={`p-3 rounded-md flex items-center ${
                                    bgColor ? bgColor : 'hover:bg-gray-600'
                                  }`}
                                >
                                  <span className={`${textColor} mr-3`}>{optionLetter}.</span>
                                  <span className={`${textColor}`}>{option}</span>
                                  {isCorrectAnswerLetter && <CheckCircle size={18} className="ml-auto text-green-400" />}
                                  {isUserSelected && !isCorrectAnswerLetter && <XCircle size={18} className="ml-auto text-red-400" />}
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-4 border-t border-gray-600 pt-4">
                            <p className="text-lg text-gray-300">Your Answer: <span className={`${isCorrect ? 'text-green-400' : 'text-red-400'} font-semibold`}>
                              {userAnswer?.user_answer && userAnswer.user_answer.length > 0 ? userAnswer.user_answer.join(', ') : 'No answer'}
                            </span></p>
                            <p className="text-lg text-gray-300">Correct Answer(s): <span className="text-green-400 font-semibold">{question.correct_answers.join(', ')}</span></p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Loading question details...</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Recent Quiz History */}
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Recent Quiz History</h2>
            {allQuizAttempts.length > 0 ? (
              <div className="space-y-6">
                {allQuizAttempts.slice(0, 5).map((attempt) => (
                  <div
                    key={attempt.id}
                    className="bg-gray-700 p-6 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => navigate(`/quiz-attempt/${attempt.id}`)}
                  >
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{attempt.quiz_title}</h3>
                      <p className="text-gray-300">Difficulty: {attempt.difficulty}</p>
                      <p className="text-gray-300">Completed: {new Date(attempt.completed_at).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getScoreColor(attempt.score)}`}>{attempt.score.toFixed(2)}%</p>
                      <p className="text-gray-300">{attempt.correct_answers}/{attempt.total_questions} Correct</p>
                    </div>
                  </div>
                ))}
                <div className="mt-6 text-center">
                  <button
                    onClick={() => navigate('/quiz-history')}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg text-lg transition-colors"
                  >
                    View Full Quiz History
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="text-gray-500 mx-auto mb-4" size={64} />
                <p className="text-xl text-gray-400">No quiz attempts found yet. Take a quiz to see your history here!</p>
                <button
                  onClick={() => navigate('/create-quiz')}
                  className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  Create Your First Quiz
                </button>
              </div>
            )}
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={() => navigate('/create-quiz')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
            >
              Create New Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;