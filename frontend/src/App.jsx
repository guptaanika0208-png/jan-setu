import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { VoiceAssistantProvider } from "./context/VoiceAssistantContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OTPVerification from "./pages/OTPVerification";
import Home from "./pages/Home";
import Services from "./pages/Services";
import GovernmentSchemes from "./pages/GovernmentSchemes";
import SchemeDetail from "./pages/SchemeDetail";
import MyProfile from "./pages/MyProfile";
import EligibleSchemes from "./pages/EligibleSchemes";
import MyDocuments from "./pages/MyDocuments";
import Notifications from "./pages/Notifications";
import VoiceAssistant from "./pages/VoiceAssistant";
import ApplicationProgress from "./pages/ApplicationProgress";
import Settings from "./pages/Settings";
import Help from "./pages/Help";

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <VoiceAssistantProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Splash />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/otp-verification" element={<OTPVerification />} />

              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
              <Route path="/schemes" element={<ProtectedRoute><GovernmentSchemes /></ProtectedRoute>} />
              <Route path="/schemes/:id" element={<ProtectedRoute><SchemeDetail /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
              <Route path="/eligible-schemes" element={<ProtectedRoute><EligibleSchemes /></ProtectedRoute>} />
              <Route path="/documents" element={<ProtectedRoute><MyDocuments /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/voice-assistant" element={<ProtectedRoute><VoiceAssistant /></ProtectedRoute>} />
              <Route path="/application-progress" element={<ProtectedRoute><ApplicationProgress /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
            </Routes>
          </BrowserRouter>
        </VoiceAssistantProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
