import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import Index from './pages/Index';
import Auth from './pages/Auth';
import DataControl from './pages/DataControl';
import TableExplorer from './pages/TableExplorer';
import Tips from './pages/Tips';
import NotFound from './pages/NotFound';
import AuthCallback from '@/components/AuthCallback';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/data-control" element={<DataControl />} />
            <Route path="/table-explorer" element={<TableExplorer />} />
            <Route path="/tips" element={<Tips />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
