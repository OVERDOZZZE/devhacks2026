import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import NewInterview from './pages/NewInterview'
import Session from './pages/Session'
import Results from './pages/Results'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />      
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/interviews/new" element={<NewInterview />} />
        <Route path="/interviews/:id/session" element={<Session />} />
        <Route path="/interviews/:id/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  )
}