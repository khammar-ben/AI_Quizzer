import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Zap, Target, Clock, BookOpen, History, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const { user, loading } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // Simulate page loading for better UX
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading || pageLoading) {
    return <LoadingSpinner message="Loading Quizzer AI..." size="lg" fullScreen />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-color)', display: 'flex', flexDirection: 'column', transition: 'background 0.3s, color 0.3s' }}>
      {/* Hero Section */}
      <div style={{ background: 'linear-gradient(135deg, var(--bg-color) 0%, var(--accent-blue) 100%)', padding: '6rem 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 style={{ color: 'var(--text-color)' }} className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 animate-fade-in-up">
            Welcome to <span style={{ color: 'var(--accent-blue)' }} className="drop-shadow-lg">Quizzer AI</span>
          </h1>
          <p style={{ color: 'var(--text-color)' }} className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto animate-fade-in-up delay-200">
            Transform your documents into interactive quizzes instantly. Leverage cutting-edge AI to create engaging questions tailored to your content.
          </p>
          {!user && (
            <Link
              to="/signup"
              className="inline-flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-xl animate-fade-in-up delay-400"
            >
              <span>Get Started - It's Free!</span>
              <Zap size={24} />
            </Link>
          )}
        </div>
      </div>

      {user && (
        <div style={{ background: 'var(--bg-color)', padding: '6rem 0' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white text-center mb-10">Quick Actions</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Link to="/create-quiz" className="bg-gray-700 p-8 rounded-xl text-center hover:bg-gray-600 transition-all duration-200 transform hover:-translate-y-1 shadow-lg flex flex-col items-center justify-center">
                <PlusCircle className="text-green-400 mb-4" size={40} />
                <h3 className="text-xl font-bold text-white mb-2">Create New Quiz</h3>
                <p className="text-gray-300">Generate a quiz from your documents.</p>
              </Link>
              <Link to="/take-quiz" className="bg-gray-700 p-8 rounded-xl text-center hover:bg-gray-600 transition-all duration-200 transform hover:-translate-y-1 shadow-lg flex flex-col items-center justify-center">
                <BookOpen className="text-purple-400 mb-4" size={40} />
                <h3 className="text-xl font-bold text-white mb-2">Take a Quiz</h3>
                <p className="text-gray-300">Practice with existing quizzes.</p>
              </Link>
              <Link to="/quiz-history" className="bg-gray-700 p-8 rounded-xl text-center hover:bg-gray-600 transition-all duration-200 transform hover:-translate-y-1 shadow-lg flex flex-col items-center justify-center">
                <History className="text-orange-400 mb-4" size={40} />
                <h3 className="text-xl font-bold text-white mb-2">View Quiz History</h3>
                <p className="text-gray-300">Review your past attempts.</p>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div style={{ background: 'var(--bg-color)', padding: '6rem 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose Quizzer AI?</h2>
            <p className="text-xl text-gray-400">Powerful features that make learning effective and fun.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-8 rounded-xl text-center shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <Zap className="text-white" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Instant Generation</h3>
              <p className="text-gray-300">Upload your document and get a comprehensive quiz in seconds using advanced AI technology.</p>
            </div>
            
            <div className="bg-gray-800 p-8 rounded-xl text-center shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <Target className="text-white" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Accurate Questions</h3>
              <p className="text-gray-300">Our AI analyzes your content to create relevant, challenging questions that test real understanding.</p>
            </div>
            
            <div className="bg-gray-800 p-8 rounded-xl text-center shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <Clock className="text-white" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Save Time</h3>
              <p className="text-gray-300">No more hours spent creating quizzes manually. Focus on learning, not preparation.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{ background: 'var(--bg-color)', padding: '6rem 0' }}>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-400 mb-8">Join thousands of learners who are already using Quizzer AI to enhance their studies.</p>
          {!user && (
            <Link
              to="/signup"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors shadow-lg"
            >
              <span>Sign Up Today!</span>
            </Link>
          )}
          {user && (
             <Link
             to="/create-quiz"
             className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors shadow-lg"
           >
             <span>Generate Your First Quiz!</span>
           </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: 'var(--bg-color)', color: 'var(--text-color)', padding: '6rem 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} Quizzer AI. All rights reserved.</p>
          <p className="mt-2 text-sm">
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link> | 
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
