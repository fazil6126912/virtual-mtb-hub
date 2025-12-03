import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/contexts/AppContext";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OTP from "./pages/OTP";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import UploadReview from "./pages/UploadReview";
import FilePreview from "./pages/FilePreview";
import CaseSummary from "./pages/CaseSummary";
import CasesList from "./pages/CasesList";
import CaseView from "./pages/CaseView";
import MTBsList from "./pages/MTBsList";
import MTBDetail from "./pages/MTBDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { state } = useApp();
  
  if (!state.loggedInUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Auth Route Component (redirect if already logged in)
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { state } = useApp();
  
  if (state.loggedInUser) {
    return <Navigate to="/home" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<AuthRoute><Landing /></AuthRoute>} />
      <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/signup" element={<AuthRoute><Signup /></AuthRoute>} />
      <Route path="/otp" element={<OTP />} />
      <Route path="/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />

      {/* Protected Routes */}
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
      <Route path="/upload/review" element={<ProtectedRoute><UploadReview /></ProtectedRoute>} />
      <Route path="/upload/preview/:fileIndex" element={<ProtectedRoute><FilePreview /></ProtectedRoute>} />
      <Route path="/case-summary" element={<ProtectedRoute><CaseSummary /></ProtectedRoute>} />
      <Route path="/cases" element={<ProtectedRoute><CasesList /></ProtectedRoute>} />
      <Route path="/cases/:id" element={<ProtectedRoute><CaseView /></ProtectedRoute>} />
      <Route path="/mtbs" element={<ProtectedRoute><MTBsList /></ProtectedRoute>} />
      <Route path="/mtbs/:id" element={<ProtectedRoute><MTBDetail /></ProtectedRoute>} />
      <Route path="/mtbs/:id/cases/:caseId" element={<ProtectedRoute><CaseView /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
