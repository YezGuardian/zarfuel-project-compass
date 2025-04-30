
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import TasksPage from "@/pages/TasksPage";
import BudgetPage from "@/pages/BudgetPage";
import RiskManagementPage from "@/pages/RiskManagementPage";
import DocumentsPage from "@/pages/DocumentsPage";
import ContactsPage from "@/pages/ContactsPage";
import ProfilePage from "@/pages/ProfilePage";
import UsersPage from "@/pages/UsersPage";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="budget" element={<BudgetPage />} />
              <Route path="risks" element={<RiskManagementPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="contacts" element={<ContactsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="users" element={<UsersPage />} />
            </Route>
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
