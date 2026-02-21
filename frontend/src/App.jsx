import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import InterviewSession from './pages/InterviewSession';
import './App.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="mb-8">
        <img src="/square-logo.png" className="w-24 h-24" alt="preply logo" />
      </div>
      <h1 className="text-4xl font-bold mb-8 text-slate-800">Preply</h1>
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Sign Up
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className="px-8 py-3 bg-white border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/interview" element={<InterviewSession />} />
      </Routes>
    </Router>
  );
}

export default App;
