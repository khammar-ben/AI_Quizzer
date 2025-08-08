import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Award, BookOpen, Loader2, History, AlertCircle, RotateCcw, Download, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';

interface QuizAttempt {
  id: string;
  quiz_id: string;
  quiz_title: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  completed_at: string;
  difficulty: string;
  time_taken_seconds?: number;
}

const QuizHistory = () => {
  const [history, setHistory] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const navigate = useNavigate();
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user || !token) {
        setError("User not authenticated. Please sign in.");
        setLoading(false);
        navigate('/signin');
        return;
      }

      try {
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
        setHistory(data);
      } catch (err) {
        console.error('Error fetching quiz history:', err);
        setError(err instanceof Error ? err.message : 'Failed to load quiz history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, token, navigate]);

  const calculateGlobalScore = () => {
    if (history.length === 0) return { globalScore: 0, totalCorrect: 0, totalQuestions: 0, totalIncorrect: 0, totalTime: 0 };

    let totalCorrect = 0;
    let totalQuestions = 0;
    let totalTime = 0;

    history.forEach(attempt => {
      totalCorrect += attempt.correct_answers;
      totalQuestions += attempt.total_questions;
      totalTime += attempt.time_taken_seconds || 0;
    });

    const globalScore = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
    const totalIncorrect = totalQuestions - totalCorrect;
    return { globalScore, totalCorrect, totalQuestions, totalIncorrect, totalTime };
  };

  const { globalScore, totalCorrect, totalQuestions, totalIncorrect, totalTime } = calculateGlobalScore();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Group attempts by quiz_id to show progression
  const groupAttemptsByQuiz = () => {
    const grouped = history.reduce((acc, attempt) => {
      if (!acc[attempt.quiz_id]) {
        acc[attempt.quiz_id] = {
          quiz_title: attempt.quiz_title,
          difficulty: attempt.difficulty,
          attempts: []
        };
      }
      acc[attempt.quiz_id].attempts.push(attempt);
      return acc;
    }, {} as Record<string, { quiz_title: string; difficulty: string; attempts: QuizAttempt[] }>);

    // Sort attempts within each group by completion date (newest first)
    Object.values(grouped).forEach(group => {
      group.attempts.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
    });

    return grouped;
  };

  const groupedAttempts = groupAttemptsByQuiz();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="text-white ml-3 text-lg">Loading quiz history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-red-400">
        <AlertCircle size={48} className="mb-4" />
        <p className="text-lg">{error}</p>
        <button
          onClick={() => navigate('/signin')}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white">Quiz History for {user?.username}</h1>
        </div>

        {/* Global Score Overview - Always visible on history page */}
        {history.length > 0 && (
          <div className="mb-8 text-center bg-gray-700 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-white mb-4">Your Overall Performance</h2>
            <div className="flex items-baseline justify-center mb-2">
              <p className="text-5xl font-bold mr-3">
                <span className={`font-semibold ${getScoreColor(globalScore)}`}>{globalScore.toFixed(2)}%</span>
              </p>
              <div className="text-left">
                <p className="text-xl text-gray-200">{totalCorrect} out of {totalQuestions} correct</p>
                <p className="text-md text-gray-400">Total time: {formatTime(totalTime)}</p>
              </div>
            </div>
            <p className="text-lg text-gray-400 mt-2">Across {history.length} quiz attempts.</p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <button 
                onClick={() => navigate('/create-quiz')}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
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
        )}

        {/* Performance Insights */}
        <div className="bg-gray-800 rounded-xl p-8 shadow-xl mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Performance Insights</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{totalCorrect}</div>
              <div className="text-gray-300">Correct Answers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400 mb-2">{totalIncorrect}</div>
              <div className="text-gray-300">Incorrect Answers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{formatTime(totalTime)}</div>
              <div className="text-gray-300">Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">{history.length}</div>
              <div className="text-gray-300">Quiz Attempts</div>
            </div>
          </div>
        </div>

        {/* Quiz Progression Tracking */}
        {Object.keys(groupedAttempts).length > 0 && (
          <div className="bg-gray-800 rounded-xl p-8 shadow-xl mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Quiz Progression Tracking</h2>
            <p className="text-gray-400 mb-6">Track your improvement across multiple attempts of the same quiz</p>
            
            <div className="space-y-6">
              {Object.entries(groupedAttempts).map(([quizId, quizData]) => (
                <div key={quizId} className="bg-gray-700 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{quizData.quiz_title}</h3>
                      <p className="text-gray-400">Difficulty: {quizData.difficulty}</p>
                      <p className="text-gray-400">{quizData.attempts.length} attempt{quizData.attempts.length > 1 ? 's' : ''}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/retake-quiz/${quizId}`)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Retake Quiz
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {quizData.attempts.map((attempt, index) => {
                      const isLatest = index === 0;
                      const isImprovement = index < quizData.attempts.length - 1 && 
                        attempt.score > quizData.attempts[index + 1].score;
                      const isDecline = index < quizData.attempts.length - 1 && 
                        attempt.score < quizData.attempts[index + 1].score;
                      
                      return (
                        <div 
                          key={attempt.id}
                          className={`p-4 rounded-lg border-l-4 cursor-pointer hover:bg-gray-600 transition-colors ${
                            isLatest ? 'bg-blue-900/20 border-blue-500' : 'bg-gray-600/50 border-gray-500'
                          }`}
                          onClick={() => navigate(`/quiz-attempt/${attempt.id}`, { state: { from: 'history' } })}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                <span className={`text-sm font-semibold ${
                                  isLatest ? 'text-blue-400' : 'text-gray-400'
                                }`}>
                                  Attempt #{quizData.attempts.length - index}
                                </span>
                                {isLatest && <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Latest</span>}
                                {isImprovement && <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">↑ Improved</span>}
                                {isDecline && <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">↓ Declined</span>}
                              </div>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-300">{formatDate(attempt.completed_at)}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-300">Time: {formatTime(attempt.time_taken_seconds || 0)}</span>
                            </div>
                            <div className="text-right">
                              <div className={`text-xl font-bold ${getScoreColor(attempt.score)}`}>
                                {attempt.score.toFixed(2)}%
                              </div>
                              <div className="text-sm text-gray-400">
                                {attempt.correct_answers}/{attempt.total_questions} correct
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Progress Summary */}
                  {quizData.attempts.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-gray-600">
                      <div className="flex justify-between items-center text-sm">
                        <div className="text-gray-400">
                          <span>Best Score: </span>
                          <span className={`font-semibold ${getScoreColor(Math.max(...quizData.attempts.map(a => a.score)))}`}>
                            {Math.max(...quizData.attempts.map(a => a.score)).toFixed(2)}%
                          </span>
                        </div>
                        <div className="text-gray-400">
                          <span>Average Score: </span>
                          <span className="font-semibold text-white">
                            {(quizData.attempts.reduce((sum, a) => sum + a.score, 0) / quizData.attempts.length).toFixed(2)}%
                          </span>
                        </div>
                        <div className="text-gray-400">
                          <span>Total Time: </span>
                          <span className="font-semibold text-white">
                            {formatTime(quizData.attempts.reduce((sum, a) => sum + (a.time_taken_seconds || 0), 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {history.length === 0 ? (
          <div className="text-center py-10">
            <History className="text-gray-500 mx-auto mb-4" size={64} />
            <p className="text-xl text-gray-400">No quiz attempts found yet.</p>
            <button
              onClick={() => navigate('/create-quiz')}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Create Your First Quiz
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {(showAllHistory ? history : history.slice(0, 5)).map((attempt) => (
              <div
                key={attempt.id}
                className="bg-gray-700 p-6 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-600 transition-colors"
                onClick={() => navigate(`/quiz-attempt/${attempt.id}`, { state: { from: 'history' } })}
              >
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">{attempt.quiz_title}</h2>
                  <p className="text-gray-300">Difficulty: {attempt.difficulty}</p>
                  <p className="text-gray-300">Completed: {formatDate(attempt.completed_at)}</p>
                  <p className="text-gray-300">Time: {formatTime(attempt.time_taken_seconds || 0)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${getScoreColor(attempt.score)}`}>{attempt.score.toFixed(2)}%</p>
                  <p className="text-gray-300"><span className={`${getScoreColor(attempt.score)}`}>{attempt.correct_answers}</span>/<span className="text-white">{attempt.total_questions}</span> Correct</p>
                </div>
              </div>
            ))}
            {!showAllHistory && history.length > 5 && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowAllHistory(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  See More ({history.length - 5} more)
                </button>
              </div>
            )}
            {showAllHistory && history.length > 5 && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowAllHistory(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  Show Less
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizHistory; 