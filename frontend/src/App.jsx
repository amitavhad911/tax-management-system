import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import UserFormPage from "./pages/UserFormPage";
import TaxComputePage from "./pages/TaxComputePage";
import TaxHistoryPage from "./pages/TaxHistoryPage";
import ReportsPage from "./pages/ReportsPage";
import BackupPage from "./pages/BackupPage";
import AiAssistantPage from "./pages/AiAssistantPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";

import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import { useKeyboardShortcut } from "./hooks/useKeyboardShortcut";

// --------------------------------------------------
// Animated Routes
// --------------------------------------------------

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>

          {/* Dashboard */}
          <Route path="/" element={<DashboardPage />} />

          {/* Users */}
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/add" element={<UserFormPage />} />
          <Route path="/users/edit/:id" element={<UserFormPage />} />

          {/* Tax */}
          <Route path="/tax/compute" element={<TaxComputePage />} />
          <Route
            path="/tax/history/:userId"
            element={<TaxHistoryPage />}
          />

          {/* Reports */}
          <Route path="/reports" element={<ReportsPage />} />

          {/* Backup */}
          <Route path="/backup" element={<BackupPage />} />

          {/* AI Assistant */}
          <Route
            path="/ai-assistant"
            element={<AiAssistantPage />}
          />

          {/* Profile */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />

        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </AnimatePresence>
  );
}

// --------------------------------------------------
// Keyboard Shortcuts
// --------------------------------------------------

function AppWithShortcuts() {
  const navigate = useNavigate();

  // Dashboard
  useKeyboardShortcut("d", () => navigate("/"));

  // Users
  useKeyboardShortcut("u", () => navigate("/users"));

  // Tax Computation
  useKeyboardShortcut("t", () => navigate("/tax/compute"));

  // Reports
  useKeyboardShortcut("r", () => navigate("/reports"));

  // AI Assistant
  useKeyboardShortcut("a", () => navigate("/ai-assistant"));

  return <AnimatedRoutes />;
}

// --------------------------------------------------
// Main App
// --------------------------------------------------

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
            }}
          />

          <AppWithShortcuts />

        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

// --------------------------------------------------
// Default Export
// --------------------------------------------------

export default App;