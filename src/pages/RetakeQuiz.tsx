import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const RetakeQuiz = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const handleRetake = () => {
    navigate(`/quiz/${quizId}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Retake Quiz</h1>
      <p className="mb-6">Are you sure you want to retake this quiz? Your new attempt will be recorded.</p>
      <button
        onClick={handleRetake}
        className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold text-white"
      >
        Start New Attempt
      </button>
    </div>
  );
};

export default RetakeQuiz; 