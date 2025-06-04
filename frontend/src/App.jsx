// src/App.jsx
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import SettingPage from './pages/SettingPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ProfilePage from './pages/ProfilePage';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthstore';
import { Loader } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useThemeStore } from './store/useThemeStore';

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore(); // Fix: Use 'theme' (lowercase)

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Remove or comment out to reduce noise
  // console.log({ authUser, isCheckingAuth });

  useEffect(() => {
    console.log('Applying theme to document:', theme); 
    document.documentElement.setAttribute('data-theme', theme); 
  }, [theme]);

  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div data-theme={theme}> {/* Fix: Use 'theme' (lowercase) */}
      <Navbar />
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/setting" element={ <SettingPage /> }/>
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;