import { useLocation, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import SpeechTranslationPage from "@/pages/SpeechTranslationPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/register"  element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/speech"
          element={
            <ProtectedRoute>
              <SpeechTranslationPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}
