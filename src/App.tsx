import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { ThemeProvider } from "@/components/providers/theme-provider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AuthErrorBoundary from "@/components/auth/AuthErrorBoundary";

// Pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import CompleteProfile from "@/pages/CompleteProfile";
import Dashboard from "@/pages/Dashboard";
import TasksPage from "@/pages/TasksPage";
import BudgetPage from "@/pages/BudgetPage";
import RiskManagementPage from "@/pages/RiskManagementPage";
import DocumentsPage from "@/pages/DocumentsPage";
import ContactsPage from "@/pages/ContactsPage";
import ProfilePage from "@/pages/ProfilePage";
import UsersPage from "@/pages/UsersPage";
import CalendarPage from "@/pages/CalendarPage";
import MeetingsPage from "@/pages/MeetingsPage";
import ForumPage from "@/pages/ForumPage";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";

// Create a utility function to clear auth data
const clearAuthData = () => {
  try {
    if (typeof window !== 'undefined') {
      // Clear all Supabase related items from localStorage
      const keysToRemove = [
        'supabase.auth.token',
        'supabase.auth.refreshToken',
        'supabase.auth.expires_at',
        'supabase.auth.provider_token',
        'supabase.auth.provider_refresh_token'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Also try to clear any items that start with 'supabase.auth.'
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('supabase.auth.')) {
          localStorage.removeItem(key);
        }
      }
    }
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

// Try to clear any invalid tokens before the app starts
clearAuthData();

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <AuthErrorBoundary>
        <AuthProvider>
          <NotificationsProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/auth/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="/fix-auth" element={
                    <Navigate to="/public/fix-auth.html" replace />
                  } />
                  
                  {/* Complete profile route (authenticated but not fully onboarded) */}
                  <Route path="/complete-profile" element={
                    <ProtectedRoute skipProfileCheck>
                      <CompleteProfile />
                    </ProtectedRoute>
                  } />
                  
                  {/* Root redirect to dashboard */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* Protected routes */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="tasks" element={<TasksPage />} />
                    <Route path="calendar" element={<CalendarPage />} />
                    <Route path="meetings" element={<MeetingsPage />} />
                    <Route path="budget" element={<BudgetPage />} />
                    <Route path="risks" element={<RiskManagementPage />} />
                    <Route path="documents" element={<DocumentsPage />} />
                    <Route path="contacts" element={<ContactsPage />} />
                    <Route path="forum" element={<ForumPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="users" element={
                      <ProtectedRoute requiresAdmin>
                        <UsersPage />
                      </ProtectedRoute>
                    } />
                  </Route>
                  
                  {/* 404 route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </NotificationsProvider>
        </AuthProvider>
      </AuthErrorBoundary>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
