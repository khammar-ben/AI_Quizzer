import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, AlertCircle, Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isEmailValid = email === '' || validateEmail(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate email before submission
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.FORGOT_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send reset email');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white flex items-center justify-center p-4 transition-colors duration-300">
        <div className="bg-gray-800 rounded-xl p-8 shadow-xl w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Check Your Email</h2>
          <p className="text-gray-300 mb-6">
            We've sent a password reset link to <span className="text-blue-400">{email}</span>
          </p>
          <p className="text-gray-400 text-sm mb-8">
            If you don't see the email, check your spam folder. The link will expire in 1 hour.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/signin')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Sign In
            </button>
            <button
              onClick={() => {
                setSuccess(false);
                setEmail('');
              }}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Send Another Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-gray-800 rounded-xl p-8 shadow-xl w-full max-w-md">
        <div className="mb-6">
          <Link 
            to="/signin" 
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Sign In
          </Link>
          <h2 className="text-3xl font-bold text-white">Reset Password</h2>
          <p className="text-gray-400 mt-2">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-500 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="text-red-400" size={20} />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                id="email"
                className={`pl-10 pr-4 py-3 shadow appearance-none border rounded-lg w-full bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${
                  email && !isEmailValid ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                }`}
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {email && !isEmailValid && (
              <p className="text-red-400 text-sm mt-1">Please enter a valid email address</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading || !isEmailValid}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Sending Reset Link...</span>
              </>
            ) : (
              <span>Send Reset Link</span>
            )}
          </button>
        </form>
        
        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500 rounded-lg">
          <h3 className="text-blue-400 font-semibold mb-2">Need Help?</h3>
          <p className="text-gray-300 text-sm">
            If you're having trouble accessing your account, contact our support team at{' '}
            <a href="mailto:support@quizzer.com" className="text-blue-400 hover:underline">
              support@quizzer.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 