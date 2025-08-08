import { useState, useEffect } from 'react';
import { User, Settings, Trophy, Clock, FileText, Trash2, Eye, RotateCcw, Download, Share2, TrendingUp, Award, Loader2, Mail, Bell, EyeOff, CheckCircle, XCircle, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import EmailVerificationStatus from '../components/EmailVerificationStatus';

interface QuizAttempt {
  id: string;
  quiz_id: string;
  quiz_title: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  completed_at: string;
  time_taken_seconds?: number;
  difficulty?: string;
}

interface CreatedQuiz {
  id: string;
  title: string;
  difficulty: string;
  num_questions: number;
  created_at: string;
  user_id?: string;
}

const Profile = () => {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [userQuizHistory, setUserQuizHistory] = useState<QuizAttempt[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [errorHistory, setErrorHistory] = useState<string | null>(null);
  const [totalCreatedQuizzes, setTotalCreatedQuizzes] = useState<number>(0);
  const [userCreatedQuizzes, setUserCreatedQuizzes] = useState<CreatedQuiz[]>([]);
  const [allAvailableQuizzes, setAllAvailableQuizzes] = useState<CreatedQuiz[]>([]);
  const [loadingCreatedQuizzes, setLoadingCreatedQuizzes] = useState(true);
  const [loadingAllQuizzes, setLoadingAllQuizzes] = useState(true);

  useEffect(() => {
    const fetchUserHistory = async () => {
      if (!user || !token) {
        setLoadingHistory(false);
        return;
      }

      try {
        const response = await fetch(API_ENDPOINTS.GET_USER_HISTORY(user.username), {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUserQuizHistory(data);
      } catch (error) {
        console.error("Error fetching quiz history:", error);
        setErrorHistory("Failed to load quiz history.");
      } finally {
        setLoadingHistory(false);
      }
    };

    const fetchTotalCreatedQuizzes = async () => {
      if (!user || !token) return;

      try {
        const response = await fetch(API_ENDPOINTS.GET_USER_QUIZZES_COUNT, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTotalCreatedQuizzes(data.total_created_quizzes);
      } catch (error) {
        console.error("Error fetching total created quizzes:", error);
      }
    };

    const fetchUserCreatedQuizzes = async () => {
      if (!user || !token) {
        setLoadingCreatedQuizzes(false);
        return;
      }
      try {
        const response = await fetch(API_ENDPOINTS.GET_USER_QUIZZES, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUserCreatedQuizzes(data);
      } catch (error) {
        console.error("Error fetching user created quizzes:", error);
      } finally {
        setLoadingCreatedQuizzes(false);
      }
    };

    const fetchAllAvailableQuizzes = async () => {
      if (!user || !token) {
        setLoadingAllQuizzes(false);
        return;
      }
      try {
        const response = await fetch(API_ENDPOINTS.GET_ALL_QUIZZES, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAllAvailableQuizzes(data);
      } catch (error) {
        console.error("Error fetching all available quizzes:", error);
      } finally {
        setLoadingAllQuizzes(false);
      }
    };

    fetchUserHistory();
    fetchTotalCreatedQuizzes();
    fetchUserCreatedQuizzes();
    fetchAllAvailableQuizzes();
  }, [user, token]);

  // Calculate comprehensive stats
  const calculateStats = () => {
    if (userQuizHistory.length === 0) {
      return {
        globalScore: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        totalIncorrect: 0,
        averageScore: 0,
        totalTime: 0,
        totalAttempts: 0,
        bestScore: 0,
        averageTime: 0
      };
    }

    let totalCorrect = 0;
    let totalQuestions = 0;
    let totalTime = 0;
    let bestScore = 0;

    userQuizHistory.forEach(attempt => {
      totalCorrect += attempt.correct_answers;
      totalQuestions += attempt.total_questions;
      totalTime += attempt.time_taken_seconds || 0;
      if (attempt.score > bestScore) bestScore = attempt.score;
    });

    const globalScore = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
    const totalIncorrect = totalQuestions - totalCorrect;
    const averageScore = userQuizHistory.reduce((sum, attempt) => sum + attempt.score, 0) / userQuizHistory.length;
    const averageTime = totalTime / userQuizHistory.length;

    return {
      globalScore,
      totalCorrect,
      totalQuestions,
      totalIncorrect,
      averageScore,
      totalTime,
      totalAttempts: userQuizHistory.length,
      bestScore,
      averageTime
    };
  };

  const stats = calculateStats();

  const handleDeleteAttempt = async (attemptId: string) => {
    if (!token || !window.confirm("Are you sure you want to delete this quiz attempt?")) {
      return;
    }
    try {
      const response = await fetch(API_ENDPOINTS.GET_QUIZ_ATTEMPT(attemptId), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete quiz attempt: ${response.statusText}`);
      }
      setUserQuizHistory(prevHistory => prevHistory.filter(attempt => attempt.id !== attemptId));
      alert("Quiz attempt deleted successfully!");
    } catch (error) {
      console.error("Error deleting quiz attempt:", error);
      alert("Error deleting quiz attempt.");
    }
  };

  const handleDeleteCreatedQuiz = async (quizId: string) => {
    if (!token || !window.confirm("Are you sure you want to delete this created quiz? All associated questions and attempts will also be deleted.")) {
      return;
    }
    try {
      const response = await fetch(API_ENDPOINTS.DELETE_QUIZ(quizId), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete created quiz: ${response.statusText}`);
      }
      setUserCreatedQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.id !== quizId));
      alert("Created quiz and associated data deleted successfully!");
    } catch (error) {
      console.error("Error deleting created quiz:", error);
      alert("Error deleting created quiz.");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Group attempts by quiz_id to show progression
  const groupAttemptsByQuiz = () => {
    const grouped = userQuizHistory.reduce((acc, attempt) => {
      if (!acc[attempt.quiz_id]) {
        acc[attempt.quiz_id] = {
          quiz_title: attempt.quiz_title,
          difficulty: attempt.difficulty || 'Unknown',
          attempts: []
        };
      }
      acc[attempt.quiz_id].attempts.push(attempt);
      return acc;
    }, {} as Record<string, { quiz_title: string; difficulty: string; attempts: QuizAttempt[] }>);

    Object.values(grouped).forEach(group => {
      group.attempts.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
    });

    return grouped;
  };

  const groupedAttempts = groupAttemptsByQuiz();

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // State and handlers for the Settings Tab
  const SettingsTab = () => {
    const [profileInfo, setProfileInfo] = useState({
      fullName: user?.username || '',
      email: user?.email || '',
    });
    const [preferences, setPreferences] = useState({
      notifications: user?.preferences?.notifications ?? true,
    });
    const [passwordInfo, setPasswordInfo] = useState({
      currentPassword: '', newPassword: '', confirmNewPassword: '',
    });
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordValidation, setPasswordValidation] = useState({
      length: false, uppercase: false, lowercase: false, number: false, special: false
    });

    // Email validation
    const validateEmail = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const isEmailValid = profileInfo.email === '' || validateEmail(profileInfo.email);

    const validatePassword = (password: string) => {
      setPasswordValidation({
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
      });
    };

    const isPasswordStrong = () => Object.values(passwordValidation).every(Boolean);
    const doPasswordsMatch = () => passwordInfo.newPassword && passwordInfo.newPassword === passwordInfo.confirmNewPassword;

    const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setPasswordInfo(prev => ({ ...prev, [name]: value }));
      if (name === 'newPassword') validatePassword(value);
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoadingProfile(true);
      setMessage(null);
      setError(null);

      // Validate email before submission
      if (!validateEmail(profileInfo.email)) {
        setError('Please enter a valid email address.');
        setLoadingProfile(false);
        return;
      }

      try {
        const response = await fetch(API_ENDPOINTS.UPDATE_PROFILE(user!.username), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            username: profileInfo.fullName,
            email: profileInfo.email,
            preferences: preferences
          }),
        });
        if (!response.ok) throw new Error((await response.json()).detail || 'Failed to update profile');
        const updatedUser = await response.json();
        updateUser(updatedUser);
        setMessage('Profile updated successfully!');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred.');
      } finally {
        setLoadingProfile(false);
      }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setMessage(null);
      if (!passwordInfo.currentPassword) return setError('Current password is required.');
      if (!isPasswordStrong()) return setError('New password is not strong enough.');
      if (!doPasswordsMatch()) return setError('New passwords do not match.');
      setLoadingPassword(true);
      try {
        const response = await fetch(API_ENDPOINTS.UPDATE_PROFILE(user!.username), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            current_password: passwordInfo.currentPassword,
            new_password: passwordInfo.newPassword,
          }),
        });
        if (!response.ok) throw new Error((await response.json()).detail || 'Failed to update password');
        setMessage('Password updated successfully!');
        setPasswordInfo({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred.');
      } finally {
        setLoadingPassword(false);
      }
    };

    return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>
        {error && <div className="bg-red-900/50 text-red-400 p-3 rounded-lg mb-6">{error}</div>}
        {message && <div className="bg-green-900/50 text-green-400 p-3 rounded-lg mb-6">{message}</div>}

        <form onSubmit={handleProfileUpdate} className="space-y-8">
          <div className="bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={profileInfo.fullName} 
                  onChange={e => setProfileInfo(p => ({ ...p, fullName: e.target.value }))} 
                  className="w-full bg-gray-600 rounded-lg p-2 text-white" 
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={profileInfo.email} 
                    onChange={e => setProfileInfo(p => ({ ...p, email: e.target.value }))} 
                    className={`w-full bg-gray-600 rounded-lg p-2 pr-10 text-white ${
                      profileInfo.email && !isEmailValid ? 'border border-red-500' : ''
                    }`}
                    placeholder="Enter your email address"
                  />
                  {profileInfo.email && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isEmailValid ? (
                        <CheckCircle className="text-green-400" size={20} />
                      ) : (
                        <XCircle className="text-red-400" size={20} />
                      )}
                    </div>
                  )}
                </div>
                {profileInfo.email && !isEmailValid && (
                  <p className="text-red-400 text-sm mt-1">Please enter a valid email address</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="notifications" 
                checked={preferences.notifications} 
                onChange={e => setPreferences(p => ({ ...p, notifications: e.target.checked }))} 
                className="h-4 w-4 rounded" 
              />
              <label htmlFor="notifications" className="ml-3 text-gray-300">
                Receive email notifications for quiz results
              </label>
            </div>
            <button 
              type="submit" 
              disabled={loadingProfile || !isEmailValid} 
              className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-3 rounded-lg flex justify-center mt-6 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {loadingProfile ? <Loader2 className="animate-spin" /> : 'Save Profile Changes'}
            </button>
          </div>
        </form>

        <form onSubmit={handlePasswordUpdate} className="bg-gray-700 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Current Password</label>
              <div className="relative">
                <input type={showCurrentPassword ? 'text' : 'password'} name="currentPassword" value={passwordInfo.currentPassword} onChange={handlePasswordInputChange} className="w-full bg-gray-600 rounded-lg p-2 pr-10 text-white" />
                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center">{showCurrentPassword ? <EyeOff /> : <Eye />}</button>
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">New Password</label>
              <div className="relative">
                <input type={showNewPassword ? 'text' : 'password'} name="newPassword" value={passwordInfo.newPassword} onChange={handlePasswordInputChange} className="w-full bg-gray-600 rounded-lg p-2 pr-10 text-white" />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center">{showNewPassword ? <EyeOff /> : <Eye />}</button>
              </div>
              {passwordInfo.newPassword && (
                <div className="mt-2 space-y-1 text-xs">
                  {Object.entries(passwordValidation).map(([key, value]) => (
                    <div key={key} className={`flex items-center ${value ? 'text-green-400' : 'text-red-400'}`}>
                      {value ? <CheckCircle size={14} /> : <XCircle size={14} />} <span className="ml-2">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Confirm New Password</label>
              <div className="relative">
                <input type={showConfirmPassword ? 'text' : 'password'} name="confirmNewPassword" value={passwordInfo.confirmNewPassword} onChange={handlePasswordInputChange} className="w-full bg-gray-600 rounded-lg p-2 pr-10 text-white" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center">{showConfirmPassword ? <EyeOff /> : <Eye />}</button>
              </div>
              {passwordInfo.confirmNewPassword && !doPasswordsMatch() && <p className="text-red-400 text-xs mt-1">Passwords do not match.</p>}
            </div>
            <button type="submit" disabled={loadingPassword || !passwordInfo.currentPassword || !isPasswordStrong() || !doPasswordsMatch()} className="w-full bg-gray-600 hover:bg-gray-500 font-bold py-2 rounded-lg flex justify-center disabled:opacity-50">{loadingPassword ? <Loader2 className="animate-spin" /> : 'Update Password'}</button>
          </div>
        </form>
      </div>
    );
  };

  // Show loading state while fetching data
  if (loadingHistory || loadingCreatedQuizzes || loadingAllQuizzes) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
          <p className="text-white text-xl">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <h1 className="text-3xl font-bold">Please log in to view your profile.</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-gray-800 rounded-xl p-8 shadow-xl mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="text-white" size={48} />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">{user.username}</h1>
              <div className="mb-2">
                <EmailVerificationStatus 
                  email={user.email || ''} 
                  isVerified={true} // TODO: Add actual verification status from backend
                  onResendVerification={async () => {
                    try {
                      const response = await fetch(API_ENDPOINTS.RESEND_VERIFICATION, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`,
                        },
                      });
                      
                      if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.detail || 'Failed to send verification email');
                      }
                      
                      // Show success message
                      alert('Verification email sent successfully!');
                    } catch (err) {
                      console.error('Error sending verification email:', err);
                      alert('Failed to send verification email. Please try again.');
                    }
                  }}
                />
              </div>
              <p className="text-gray-400">Member since {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-xl shadow-xl">
          <div className="border-b border-gray-700">
            <nav className="flex space-x-8 px-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Trophy size={16} className="mr-2" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'progress'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <TrendingUp size={16} className="mr-2" />
                <span>Progress</span>
              </button>
              <button
                onClick={() => setActiveTab('quizzes')}
                className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'quizzes'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <FileText size={16} className="mr-2" />
                <span>My Quizzes</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Settings size={16} className="mr-2" />
                <span>Settings</span>
              </button>
            </nav>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Performance Overview</h2>
                
                {/* Key Stats Grid */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gray-700 rounded-xl p-6 text-center">
                    <Award className="text-yellow-400 mx-auto mb-3" size={32} />
                    <div className="text-2xl font-bold text-white">{stats.totalAttempts}</div>
                    <div className="text-gray-400">Total Attempts</div>
                  </div>
                  <div className="bg-gray-700 rounded-xl p-6 text-center">
                    <Trophy className="text-blue-400 mx-auto mb-3" size={32} />
                    <div className={`text-2xl font-bold ${getScoreColor(stats.globalScore)}`}>
                      {stats.globalScore.toFixed(1)}%
                    </div>
                    <div className="text-gray-400">Overall Score</div>
                  </div>
                  <div className="bg-gray-700 rounded-xl p-6 text-center">
                    <Clock className="text-green-400 mx-auto mb-3" size={32} />
                    <div className="text-2xl font-bold text-white">{formatTime(stats.totalTime)}</div>
                    <div className="text-gray-400">Total Time</div>
                  </div>
                  <div className="bg-gray-700 rounded-xl p-6 text-center">
                    <FileText className="text-purple-400 mx-auto mb-3" size={32} />
                    <div className="text-2xl font-bold text-white">{totalCreatedQuizzes}</div>
                    <div className="text-gray-400">Quizzes Created</div>
                  </div>
                </div>

                {/* Detailed Performance */}
                {stats.totalAttempts > 0 && (
                  <div className="bg-gray-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Performance Breakdown</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-400 mb-2">{stats.totalCorrect}</div>
                        <div className="text-gray-300">Correct Answers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-400 mb-2">{stats.totalIncorrect}</div>
                        <div className="text-gray-300">Incorrect Answers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-400 mb-2">{formatTime(stats.averageTime)}</div>
                        <div className="text-gray-300">Average Time</div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-center">
                      <button 
                        onClick={() => {
                          if (userQuizHistory.length > 0) {
                            const mostRecentQuiz = userQuizHistory[0];
                            navigate(`/quiz/${mostRecentQuiz.quiz_id}`);
                          } else {
                            navigate('/create-quiz');
                          }
                        }}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                      >
                        <RotateCcw size={16} />
                        <span>Take a Quiz</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Progress Tab */}
            {activeTab === 'progress' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Quiz Progression</h2>
                {Object.keys(groupedAttempts).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(groupedAttempts).map(([quizId, quizData]) => (
                      <div key={quizId} className="bg-gray-700 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-white">{quizData.quiz_title}</h3>
                            <p className="text-gray-400">Difficulty: {quizData.difficulty} • {quizData.attempts.length} attempt{quizData.attempts.length > 1 ? 's' : ''}</p>
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
                                onClick={() => navigate(`/quiz-attempt/${attempt.id}`, { state: { from: 'profile' } })}
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
                        
                        {quizData.attempts.length > 1 && (
                          <div className="mt-4 pt-4 border-t border-gray-600">
                            <div className="flex justify-between items-center text-sm">
                              <div className="text-gray-400">
                                <span>Best: </span>
                                <span className={`font-semibold ${getScoreColor(Math.max(...quizData.attempts.map(a => a.score)))}`}>
                                  {Math.max(...quizData.attempts.map(a => a.score)).toFixed(2)}%
                                </span>
                              </div>
                              <div className="text-gray-400">
                                <span>Average: </span>
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
                ) : (
                  <div className="text-center py-10">
                    <Trophy className="text-gray-500 mx-auto mb-4" size={64} />
                    <p className="text-xl text-gray-400">No quiz attempts yet.</p>
                    <button
                      onClick={() => navigate('/create-quiz')}
                      className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                      Create Your First Quiz
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quizzes Tab */}
            {activeTab === 'quizzes' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">My Quiz History</h2>
                
                {loadingHistory && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-400 mt-2">Loading your quiz history...</p>
                  </div>
                )}
                
                {!loadingHistory && errorHistory && (
                  <div className="text-center py-8 bg-red-900/20 border border-red-500 rounded-lg">
                    <p className="text-red-400">{errorHistory}</p>
                  </div>
                )}
                
                {!loadingHistory && !errorHistory && userQuizHistory.length === 0 && (
                  <div className="text-center py-10 bg-gray-700 rounded-lg">
                    <Trophy className="text-gray-500 mx-auto mb-4" size={64} />
                    <p className="text-xl text-gray-400 mb-4">You haven't taken any quizzes yet.</p>
                    <button
                      onClick={() => navigate('/create-quiz')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                      Take Your First Quiz
                    </button>
                  </div>
                )}
                
                {!loadingHistory && !errorHistory && userQuizHistory.length > 0 && (
                  <div className="space-y-4">
                    {userQuizHistory.map((attempt) => (
                      <div key={attempt.id} className="bg-gray-700 rounded-lg p-6 flex items-center justify-between hover:bg-gray-600 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{attempt.quiz_title}</h3>
                            <span className={`text-xs px-2 py-1 rounded ${getScoreColor(attempt.score)}`}>
                              {attempt.score.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-gray-400">
                            <span>{attempt.total_questions} questions</span>
                            <span>•</span>
                            <span>{attempt.correct_answers} correct</span>
                            <span>•</span>
                            <span>Difficulty: {attempt.difficulty || 'Unknown'}</span>
                            <span>•</span>
                            <span>Completed: {new Date(attempt.completed_at).toLocaleDateString()}</span>
                            {attempt.time_taken_seconds && (
                              <>
                                <span>•</span>
                                <span>Time: {formatTime(attempt.time_taken_seconds)}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            className="p-2 text-gray-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-500"
                            onClick={() => navigate(`/quiz-attempt/${attempt.id}`, { state: { from: 'profile' } })}
                            title="View Details"
                          >
                            <Eye size={20} />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-green-400 transition-colors rounded-lg hover:bg-gray-500"
                            onClick={() => navigate(`/retake-quiz/${attempt.quiz_id}`)}
                            title="Retake Quiz"
                          >
                            <RotateCcw size={20} />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-gray-500"
                            onClick={() => handleDeleteAttempt(attempt.id)}
                            title="Delete Attempt"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Quick Actions */}
                <div className="mt-8 text-center">
                  <button
                    onClick={() => navigate('/create-quiz')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors mr-4"
                  >
                    Create New Quiz
                  </button>
                  <button
                    onClick={() => navigate('/quiz-history')}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    View Full History
                  </button>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 