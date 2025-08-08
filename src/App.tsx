import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from './components/Layout';
import FloatingHomeButton from './components/FloatingHomeButton';
import Home from './pages/Home';
import CreateQuiz from './pages/CreateQuiz';
import TakeQuiz from './pages/TakeQuiz';
import QuizResults from './pages/QuizResults';
import QuizHistory from './pages/QuizHistory';
import QuizAttemptDetails from './pages/QuizAttemptDetails';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import About from './pages/About';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import RetakeQuiz from './pages/RetakeQuiz';

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/create-quiz" element={<CreateQuiz />} />
                  <Route path="/quiz/:quizId" element={<TakeQuiz />} />
                  <Route path="/quiz-history" element={<QuizHistory />} />
                  <Route path="/quiz-results/:attemptId" element={<QuizResults />} />
                  <Route path="/quiz-attempt/:attemptId" element={<QuizAttemptDetails />} />
                  <Route path="/retake-quiz/:quizId" element={<RetakeQuiz />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
            <FloatingHomeButton />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
