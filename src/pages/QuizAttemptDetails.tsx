import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

interface QuestionAttemptDetail {
  id: string;
  question_text: string;
  options: string[];
  correct_answers: string[];
  user_selected_answers: string[];
  is_correct: boolean;
}

interface QuizAttemptDetailsData {
  attempt_id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  completed_at: string;
  quiz_title: string;
  quiz_difficulty: string;
  questions: QuestionAttemptDetail[];
}

const QuizAttemptDetails = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  // Determine where the user came from
  const cameFrom = location.state?.from || 'profile'; // Default to profile if no state

  const [attemptDetails, setAttemptDetails] = useState<QuizAttemptDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttemptDetails = async () => {
      if (!token) {
        setError("Authentication token not found. Please sign in.");
        setLoading(false);
        return;
      }

      if (!attemptId) {
        setError("Quiz attempt ID not provided.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.GET_QUIZ_ATTEMPT(attemptId), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch quiz attempt details');
        }

        const data: QuizAttemptDetailsData = await response.json();
        setAttemptDetails(data);
      } catch (err) {
        console.error("Error fetching quiz attempt details:", err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptDetails();
  }, [attemptId, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="text-white ml-3 text-lg">Loading quiz attempt details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-red-400">
        <AlertCircle size={48} className="mb-4" />
        <p className="text-lg">{error}</p>
        <button
          onClick={() => navigate(cameFrom === 'history' ? '/quiz-history' : '/profile')}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Back to {cameFrom === 'history' ? 'Quiz History' : 'Profile'}
        </button>
      </div>
    );
  }

  if (!attemptDetails) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-gray-400">
        <AlertCircle size={48} className="mb-4" />
        <p className="text-lg">Quiz attempt details not found.</p>
        <button
          onClick={() => navigate(cameFrom === 'history' ? '/quiz-history' : '/profile')}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Back to {cameFrom === 'history' ? 'Quiz History' : 'Profile'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800 rounded-xl p-8 shadow-xl">
          <h1 className="text-4xl font-bold text-white mb-6 text-center">Quiz Attempt Details</h1>

          <div className="mb-8 text-center">
            <p className="text-2xl text-gray-200 mb-2">Quiz: <span className="font-semibold text-blue-400">{attemptDetails.quiz_title}</span></p>
            <p className="text-xl text-gray-300 mb-2">Difficulty: {attemptDetails.quiz_difficulty}</p>
            <p className="text-xl text-gray-300">Score: <span className="font-semibold text-blue-400">{attemptDetails.score.toFixed(2)}%</span></p>
            <p className="text-lg text-gray-400">{attemptDetails.correct_answers} out of {attemptDetails.total_questions} correct</p>
            <p className="text-sm text-gray-500">Completed on: {new Date(attemptDetails.completed_at).toLocaleString()}</p>
          </div>

          <div className="space-y-8">
            {attemptDetails.questions.map((question, qIndex) => (
              <div key={question.id} className="bg-gray-700 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-white mb-4">
                  {qIndex + 1}. {question.question_text}
                  <span className={`ml-3 text-sm font-normal ${(() => {
                    // Determine color for the status text
                    const correctOptionLetters = question.correct_answers;
                    const normalizedCorrectAnswers = correctOptionLetters.map(ca => {
                      // Check if 'ca' is a single letter (A, B, C, D, etc.)
                      if (ca.length === 1 && ca.charCodeAt(0) >= 65 && ca.charCodeAt(0) <= (65 + question.options.length - 1)) {
                        // It's a letter, convert to full text
                        return question.options[ca.charCodeAt(0) - 65];
                      }
                      return ca; // Assume it's already full text or not a standard option letter
                    });
                    
                    const userSelectedAnswersFullText = question.user_selected_answers || [];
                    const userCorrectSelections = userSelectedAnswersFullText.filter(userAns => 
                      normalizedCorrectAnswers.includes(userAns)
                    ).length;

                    const totalCorrectOptions = normalizedCorrectAnswers.length;
                    const totalUserSelections = userSelectedAnswersFullText.length;

                    if (totalCorrectOptions === 0) {
                      return 'text-gray-400'; // No correct answers expected (e.g., unusual question type)
                    } else if (userCorrectSelections === totalCorrectOptions && totalUserSelections === totalCorrectOptions) {
                      return 'text-green-400'; // Fully correct
                    } else if (userCorrectSelections > 0 && userCorrectSelections < totalCorrectOptions) {
                      return 'text-yellow-400'; // Partially correct
                    } else if (userCorrectSelections === 0 && totalUserSelections > 0) {
                      return 'text-red-400'; // All selected answers are incorrect
                    } else if (totalUserSelections === 0 && totalCorrectOptions > 0) {
                       return 'text-red-400'; // No answer selected but there are correct answers
                    } else {
                       return 'text-red-400'; // Fallback for other incorrect scenarios
                    }
                  })()}`}>
                    ({(() => {
                      // Determine text for the status
                      const correctOptionLetters = question.correct_answers;
                      const normalizedCorrectAnswers = correctOptionLetters.map(ca => {
                        // Check if 'ca' is a single letter (A, B, C, D, etc.)
                        if (ca.length === 1 && ca.charCodeAt(0) >= 65 && ca.charCodeAt(0) <= (65 + question.options.length - 1)) {
                          return question.options[ca.charCodeAt(0) - 65];
                        }
                        return ca; // Assume it's already full text or not a standard option letter
                      });
                      
                      const userSelectedAnswersFullText = question.user_selected_answers || [];
                      const userCorrectSelections = userSelectedAnswersFullText.filter(userAns => 
                        normalizedCorrectAnswers.includes(userAns)
                      ).length;

                      const totalCorrectOptions = normalizedCorrectAnswers.length;
                      const totalUserSelections = userSelectedAnswersFullText.length;

                      if (totalCorrectOptions === 0) {
                        return 'N/A'; // Should not happen for standard quizzes
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
                </h2>
                <div className="space-y-2 mb-4">
                  {/* Normalize correct_answers to full text once per question */}
                  {(() => {
                    const normalizedCorrectAnswers = question.correct_answers.map(ca => {
                      // Check if 'ca' is a single letter (A, B, C, D, etc.)
                      if (ca.length === 1 && ca.charCodeAt(0) >= 65 && ca.charCodeAt(0) <= (65 + question.options.length - 1)) {
                        // It's a letter, convert to full text
                        return question.options[ca.charCodeAt(0) - 65];
                      }
                      return ca; // Assume it's already full text or not a standard option letter
                    });

                    return question.options.map((option, oIndex) => {
                      const isUserSelected = question.user_selected_answers.includes(option);
                      const optionLetter = String.fromCharCode(65 + oIndex);
                      const isCorrectAnswer = normalizedCorrectAnswers.includes(option);
                      
                      let bgColor = '';
                      const textColor = 'text-gray-200'; // Declared with const as it's not reassigned
                      if (isUserSelected && !isCorrectAnswer) {
                        bgColor = 'bg-red-900/40'; // User selected, but wrong
                      } else if (isCorrectAnswer && isUserSelected) {
                        bgColor = 'bg-green-900/40'; // User selected and correct
                      } else if (isCorrectAnswer && !isUserSelected) {
                        bgColor = 'bg-yellow-900/40'; // Correct but not selected by user
                      }

                      return (
                        <div 
                          key={oIndex} 
                          className={`p-3 rounded-md flex items-center ${
                            bgColor ? bgColor : ''
                          }`}
                        >
                          <span className={`${textColor} mr-3`}>{optionLetter}.</span>
                          <span className={`${textColor}`}>{option}</span>
                          {isCorrectAnswer && <CheckCircle size={18} className="ml-auto text-green-400" />}
                          {isUserSelected && !isCorrectAnswer && <XCircle size={18} className="ml-auto text-red-400" />}
                        </div>
                      );
                    });
                  })()}
                </div>
                <div className="mt-4 border-t border-gray-600 pt-4">
                  <p className="text-lg text-gray-300">Your Answer: 
                    <span className="font-semibold">
                      {question.user_selected_answers && question.user_selected_answers.length > 0 ? (
                        question.user_selected_answers.map((selectedOption, index) => {
                          const correctOptionLetters = question.correct_answers;
                          const normalizedCorrectAnswersForUserAnswer = correctOptionLetters.map(ca => {
                            if (ca.length === 1 && ca.charCodeAt(0) >= 65 && ca.charCodeAt(0) <= (65 + question.options.length - 1)) {
                              return question.options[ca.charCodeAt(0) - 65];
                            }
                            return ca;
                          });

                          const isSelectedOptionCorrect = normalizedCorrectAnswersForUserAnswer.includes(selectedOption);

                          return (
                            <span key={index} className={`${isSelectedOptionCorrect ? 'text-green-400' : 'text-red-400'}`}>
                              {selectedOption}
                              {index < question.user_selected_answers.length - 1 ? ', ' : ''}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-red-400">No answer</span>
                      )}
                    </span>
                  </p>
                  <p className="text-lg text-gray-300">Correct Answer(s): <span className="text-green-400 font-semibold">
                    {question.correct_answers.map(letter => question.options[letter.charCodeAt(0) - 65]).join(', ')}
                  </span></p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate(`/retake-quiz/${attemptDetails.quiz_id}`)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
              >
                Retake Quiz
              </button>
              <button
                onClick={() => navigate(cameFrom === 'history' ? '/quiz-history' : '/profile')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
              >
                Back to {cameFrom === 'history' ? 'Quiz History' : 'Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAttemptDetails; 