import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import Index from './pages/Index';
import Auth from './pages/Auth';
import DataControl from './pages/DataControl';
import TableExplorer from './pages/TableExplorer';
import Tips from './pages/Tips';
import NotFound from './pages/NotFound';
import AuthCallback from '@/components/AuthCallback';
import { Loader2 } from 'lucide-react';
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
      <Router>
        <div className="App">
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="*" element={ 
              <ProtectedRoute>
                <NotFound />
              </ProtectedRoute>
            } />
            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/data-control" element={<ProtectedRoute><DataControl /></ProtectedRoute>} />
            <Route path="/table-explorer" element={<ProtectedRoute><TableExplorer /></ProtectedRoute>} />
            <Route path="/tips" element={<ProtectedRoute><Tips /></ProtectedRoute>} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
