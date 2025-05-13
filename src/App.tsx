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

// Pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
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

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
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
                <Route path="/unauthorized" element={<Unauthorized />} />
                
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
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
