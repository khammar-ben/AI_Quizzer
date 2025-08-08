import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // We'll create this soon
import { Loader2, AlertCircle, User, Mail, Lock, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isEmailValid = email === '' || validateEmail(email);

  // Password validation
  const validatePassword = (password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const passwordValidation = validatePassword(password);
  const isPasswordStrong = Object.values(passwordValidation).every(Boolean);
  const doPasswordsMatch = password && confirmPassword && password === confirmPassword;

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

    // Validate password strength
    if (!isPasswordStrong) {
      setError('Password is not strong enough. Please ensure it meets all requirements.');
      setLoading(false);
      return;
    }

    // Validate password confirmation
    if (!doPasswordsMatch) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await signup(username, email, password);
      navigate('/create-quiz'); // Redirect to create quiz page after successful signup
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-gray-800 rounded-xl p-8 shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-white text-center mb-8">Create an Account</h2>

        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-500 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="text-red-400" size={20} />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-gray-300 text-sm font-bold mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                id="username"
                className="pl-10 pr-4 py-3 shadow appearance-none border rounded-lg w-full bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline border-gray-600 focus:border-blue-500"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                id="email"
                className={`pl-10 pr-10 py-3 shadow appearance-none border rounded-lg w-full bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${
                  email && !isEmailValid ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                }`}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {email && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isEmailValid ? (
                    <CheckCircle className="text-green-400" size={20} />
                  ) : (
                    <XCircle className="text-red-400" size={20} />
                  )}
                </div>
              )}
            </div>
            {email && !isEmailValid && (
              <p className="text-red-400 text-sm mt-1">Please enter a valid email address</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-300 text-sm font-bold mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="pl-10 pr-10 py-3 shadow appearance-none border rounded-lg w-full bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline border-gray-600 focus:border-blue-500"
                placeholder="Choose a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {password && (
              <div className="mt-2 space-y-1 text-xs">
                {Object.entries(passwordValidation).map(([key, value]) => (
                  <div key={key} className={`flex items-center ${value ? 'text-green-400' : 'text-red-400'}`}>
                    {value ? <CheckCircle size={14} /> : <XCircle size={14} />} 
                    <span className="ml-2">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-gray-300 text-sm font-bold mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                className={`pl-10 pr-10 py-3 shadow appearance-none border rounded-lg w-full bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${
                  confirmPassword && !doPasswordsMatch ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                }`}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {confirmPassword && !doPasswordsMatch && (
              <p className="text-red-400 text-sm mt-1">Passwords do not match</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !isEmailValid || !isPasswordStrong || !doPasswordsMatch}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Sign Up</span>
            )}
          </button>
        </form>
        <p className="text-center text-gray-400 mt-6">
          Already have an account? <Link to="/signin" className="text-blue-500 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp; 