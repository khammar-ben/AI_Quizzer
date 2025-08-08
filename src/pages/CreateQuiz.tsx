import React, { useState } from 'react';
import { Upload, FileText, Loader2, AlertCircle, BookOpen, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';

interface Question {
  question: string;
  options: string[];
  correct_answers: string[];
}

interface Quiz {
  quiz: string;
  quiz_id: string;
  parsed_questions: Question[];
}

type QuizMode = 'file' | 'subject';

const CreateQuiz = () => {
  const [mode, setMode] = useState<QuizMode>('file');
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { user, token } = useAuth();

  const subjects = [
    'Mathematics',
    'Science',
    'History',
    'Geography',
    'Literature',
    'Biology',
    'Chemistry',
    'Physics',
    'Computer Science',
    'Economics',
    'Psychology',
    'Philosophy',
    'Art History',
    'Music Theory',
    'Custom Subject'
  ];

  const validateFile = (file: File): boolean => {
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return false;
    }

    // Check file type
    if (!['application/pdf', 'text/plain'].includes(file.type)) {
      setError("Only PDF and TXT files are supported");
      return false;
    }

    setError(null);
    return true;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleGenerateQuiz = async () => {
    setError(null);

    if (!user || !token) {
      setError("User not authenticated. Please sign in.");
      navigate('/signin');
      return;
    }

    if (mode === 'file') {
      if (!file) {
        setError("Please select a file first.");
        return;
      }
    } else { // mode === 'subject'
      if (!selectedSubject && !customSubject) {
        setError("Please select a subject or enter a custom one.");
        return;
      }
      if (selectedSubject === 'Custom Subject' && !customSubject) {
        setError("Please enter your custom subject.");
        return;
      }
    }

    try {
      setIsGenerating(true);
      const apiUrl = API_ENDPOINTS.CREATE_QUIZ;

      let body;
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
      };

      if (mode === 'file') {
        const formData = new FormData();
        formData.append('file', file!);
        formData.append('num_questions', String(numQuestions));
        formData.append('difficulty', difficulty);
        body = formData;
      } else { // mode === 'subject'
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
          subject: selectedSubject === 'Custom Subject' ? customSubject : selectedSubject,
          num_questions: numQuestions,
          difficulty: difficulty,
        });
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || response.statusText);
      }

      const data: Quiz = await response.json();
      navigate(`/quiz/${data.quiz_id}`);
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = mode === 'file' ? file : (selectedSubject || customSubject);

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Create Your Quiz</h1>
          <p className="text-xl text-gray-400">Upload a file or choose a subject to generate questions automatically</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-8 shadow-xl">
          {error && (
            <div className="mb-6 bg-red-900/50 border border-red-500 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="text-red-400" size={20} />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Mode Selection */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={() => { setMode('file'); setError(null); setFile(null); setSelectedSubject(''); setCustomSubject(''); }}
              className={`flex-1 flex items-center justify-center space-x-2 p-4 rounded-lg font-semibold transition-all ${
                mode === 'file'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Upload size={20} />
              <span>Upload File</span>
            </button>
            <button
              onClick={() => { setMode('subject'); setError(null); setFile(null); setSelectedSubject(''); setCustomSubject(''); }}
              className={`flex-1 flex items-center justify-center space-x-2 p-4 rounded-lg font-semibold transition-all ${
                mode === 'subject'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <GraduationCap size={20} />
              <span>Choose Subject</span>
            </button>
          </div>

          {/* File Upload Mode */}
          {mode === 'file' && (
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                dragActive
                  ? 'border-blue-400 bg-blue-900/20'
                  : file
                  ? 'border-green-400 bg-green-900/20'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center space-y-4">
                {file ? (
                  <>
                    <FileText className="text-green-400" size={64} />
                    <div>
                      <p className="text-xl font-semibold text-white">{file.name}</p>
                      <p className="text-gray-400">File ready for quiz generation</p>
                    </div>
                    <button
                      onClick={() => {
                        setFile(null);
                        setError(null);
                      }}
                      className="text-gray-400 hover:text-white underline"
                    >
                      Choose different file
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="text-gray-400" size={64} />
                    <div>
                      <p className="text-xl font-semibold text-white mb-2">
                        Drop your file here or click to browse
                      </p>
                      <p className="text-gray-400">Supported formats: PDF, TXT (Max 10MB)</p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg cursor-pointer transition-colors"
                    >
                      Browse Files
                    </label>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Subject Selection Mode */}
          {mode === 'subject' && (
            <div className="space-y-6">
              <div className="text-center">
                <BookOpen className="text-blue-400 mx-auto mb-4" size={64} />
                <h3 className="text-xl font-semibold text-white mb-2">Choose a Subject</h3>
                <p className="text-gray-400">Select from popular subjects or enter your own</p>
              </div>
              
              <div>
                <label htmlFor="subject-select" className="block text-gray-300 mb-2 font-medium">Subject</label>
                <select 
                  id="subject-select"
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    if (e.target.value !== 'Custom Subject') {
                      setCustomSubject('');
                    }
                  }}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-400 focus:outline-none"
                >
                  <option value="">Select a subject...</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              {selectedSubject === 'Custom Subject' && (
                <div>
                  <label htmlFor="custom-subject" className="block text-gray-300 mb-2 font-medium">Custom Subject</label>
                  <input
                    type="text"
                    id="custom-subject"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Enter your custom subject..."
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-400 focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* Quiz Settings */}
          {canGenerate && (
            <div className="mt-8">
              <div className="bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quiz Settings</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 mb-2">Number of Questions</label>
                    <select 
                      className="w-full bg-gray-600 text-white rounded-lg px-3 py-2 border border-gray-500 focus:border-blue-400 focus:outline-none"
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(Number(e.target.value))}
                    >
                      <option value="5">5 Questions</option>
                      <option value="10">10 Questions</option>
                      <option value="20">20 Questions</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Difficulty Level</label>
                    <select 
                      className="w-full bg-gray-600 text-white rounded-lg px-3 py-2 border border-gray-500 focus:border-blue-400 focus:outline-none"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={handleGenerateQuiz}
                  disabled={isGenerating}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors flex items-center space-x-2 mx-auto"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Generating Quiz...</span>
                    </>
                  ) : (
                    <span>Generate Quiz</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/quiz-history')}
            className="text-gray-400 hover:text-white underline"
          >
            View Quiz History
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;
