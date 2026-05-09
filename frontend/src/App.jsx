import "./style/App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import Axios from "axios";

// Компоненти
import Header from "./components/Header";
import Footer from "./components/Footer";

// Страници
import Login from "./pages/Login";
import SignUp from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import GuestPage from "./pages/GuestPage";

// OSINT Инструменти
import GitHubProfiler from "./pages/GitHubProfiler";
import CorporateRecon from "./pages/CorporateRecon";
import SocialRecon from "./pages/SocialRecon";
import SavedProfiles from "./pages/SavedProfiles";

// Админ Панел
import AdminUsers from "./pages/AdminUsers";
import AdminLogs from "./pages/AdminLogs";
import AdminFeedback from "./pages/AdminFeedback";

import { logout } from './redux/userSlice';

Axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

function App() {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isAuthenticated) return;

    // 30 минути сесия
    const sessionExpirationTime = 30 * 60 * 1000; 

    const timeoutId = setTimeout(() => {
      dispatch(logout());
      localStorage.removeItem("token");
      alert("Сесията е изтекла. Моля, влезте отново за сигурност.");
    }, sessionExpirationTime);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, dispatch]);

  // --- ХЕЛПЪР ЗА ДИНАМИЧНО ПРЕНАСОЧВАНЕ ---
  const getHomeRoute = () => {
    if (!isAuthenticated) return "/"; // Ако не е логнат, стои тук
    return user?.isAdmin ? "/admin/users" : "/tools/github";
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-900 text-white">
        <Header />
        
        <main className="flex-grow">
          <Routes>
            {/* Публични маршрути - тук ползваме интелигентното пренасочване */}
            <Route path="/" element={isAuthenticated ? <Navigate to={getHomeRoute()} replace /> : <GuestPage />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to={getHomeRoute()} replace /> : <Login />} />
            <Route path="/signup" element={isAuthenticated ? <Navigate to={getHomeRoute()} replace /> : <SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Защитени маршрути */}
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />} />
            
            {/* OSINT РУТОВЕ */}
            <Route 
               path="/tools/github" 
               element={isAuthenticated && !user?.isAdmin ? <GitHubProfiler /> : <Navigate to={getHomeRoute()} replace />} 
            />

            <Route 
              path="/tools/corporate" 
              element={isAuthenticated && !user?.isAdmin ? <CorporateRecon /> : <Navigate to={getHomeRoute()} replace />} 
            />

            <Route 
              path="/tools/social" 
              element={isAuthenticated && !user?.isAdmin ? <SocialRecon /> : <Navigate to={getHomeRoute()} replace />} 
            />

            <Route 
              path="/tools/saved-profiles" 
              element={isAuthenticated && !user?.isAdmin ? <SavedProfiles /> : <Navigate to={getHomeRoute()} replace />} 
            />

            {/* Админ маршрути (забранени за обикновени потребители) */}
            <Route 
              path="/admin/users" 
              element={isAuthenticated && user?.isAdmin ? <AdminUsers /> : <Navigate to={getHomeRoute()} replace />} 
            />
            <Route 
              path="/admin/logs" 
              element={isAuthenticated && user?.isAdmin ? <AdminLogs /> : <Navigate to={getHomeRoute()} replace />} 
            />
            <Route 
              path="/admin/feedback" 
              element={isAuthenticated && user?.isAdmin ? <AdminFeedback /> : <Navigate to={getHomeRoute()} replace />} 
            />

            {/* Fallback - ако потребителят напише глупости в URL */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;