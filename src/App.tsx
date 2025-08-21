import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import { SchemaProvider } from './contexts/SchemaContext';
import Index from './pages/Index';
import Home from './pages/Home';
import BIZ from './pages/BIZ';
import RIZ from './pages/RIZ';
import Auth from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import DataControl from './pages/DataControl';
import TableExplorer from './pages/TableExplorer';
import Tips from './pages/Tips';
import NotFound from './pages/NotFound';
import AuthCallback from '@/components/AuthCallback';
import { Loader2 } from 'lucide-react';
import Profile from './pages/Profile';
import DUFA from './pages/DUFA';
import DUFAComingSoon from './pages/DUFAComingSoon';
import DUFAAccessGuard from '@/components/dufa/DUFAAccessGuard';
import MIA from './pages/MIA';
import MIAComingSoon from './pages/MIAComingSoon';
import MIAAccessGuard from '@/components/mia/MIAAccessGuard';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black">
        <Loader2 className="w-8 h-8 animate-spin text-viz-accent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <SchemaProvider>
        <div className="App">
          <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
<Route path="/biz" element={<ProtectedRoute><BIZ /></ProtectedRoute>} />
<Route path="/riz" element={<ProtectedRoute><RIZ /></ProtectedRoute>} />
<Route path="/riz/dufa" element={<ProtectedRoute><RIZ /></ProtectedRoute>} />
<Route path="/riz/mia" element={<ProtectedRoute><RIZ /></ProtectedRoute>} />
{/* Legacy home for compatibility */}
<Route path="/home" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/data-control" element={<ProtectedRoute><DataControl /></ProtectedRoute>} />
          <Route path="/table-explorer" element={<ProtectedRoute><TableExplorer /></ProtectedRoute>} />
          <Route path="/dufa" element={<ProtectedRoute><DUFAAccessGuard><DUFA /></DUFAAccessGuard></ProtectedRoute>} />
          <Route path="/dufa-coming-soon" element={<ProtectedRoute><DUFAComingSoon /></ProtectedRoute>} />
          <Route path="/tips" element={<ProtectedRoute><Tips /></ProtectedRoute>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/MIA" element={<ProtectedRoute><MIAAccessGuard><MIA /></MIAAccessGuard></ProtectedRoute>} />
          <Route path="/MIA-coming-soon" element={<ProtectedRoute><MIAComingSoon /></ProtectedRoute>} />
          {/* 404 fallback - shown for all users */}
          <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </SchemaProvider>
    </AuthProvider>
  );
}

export default App;
