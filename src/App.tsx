import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import { SchemaProvider } from './contexts/SchemaContext';
import { Loader2 } from 'lucide-react';
import { SEOHead } from './components/SEOHead';
import { SessionTimeoutProvider } from './components/SessionTimeoutProvider';
import { AccessibilityProvider } from './components/AccessibilityProvider';

// Eager load critical pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import AuthCallback from '@/components/AuthCallback';
import NotFound from './pages/NotFound';

// Lazy load all other pages for code splitting
const Index = lazy(() => import('./pages/Index'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const DataControl = lazy(() => import('./pages/DataControl'));
const TableExplorer = lazy(() => import('./pages/TableExplorer'));
const Tips = lazy(() => import('./pages/Tips'));
const Profile = lazy(() => import('./pages/Profile'));
const DUFAComingSoon = lazy(() => import('./pages/DUFAComingSoon'));
const MIAComingSoon = lazy(() => import('./pages/MIAComingSoon'));
const MIAPrivacy = lazy(() => import('./pages/MIAPrivacy'));
const MIADataDeletion = lazy(() => import('./pages/MIADataDeletion'));
const MIATerms = lazy(() => import('./pages/MIATerms'));
const AgentCategoryMap = lazy(() => import('./pages/AgentCategoryMap'));
const AllAgents = lazy(() => import('./pages/AllAgents'));

// Lazy load category pages
const VEECategory = lazy(() => import('./pages/categories/VEECategory'));
const MIACategory = lazy(() => import('./pages/categories/MIACategory'));
const RIZCategory = lazy(() => import('./pages/categories/RIZCategory'));
const AnalyticsCategory = lazy(() => import('./pages/categories/AnalyticsCategory'));
const GrowthCategory = lazy(() => import('./pages/categories/GrowthCategory'));
const OperationsCategory = lazy(() => import('./pages/categories/OperationsCategory'));

// Lazy load all agent pages for maximum code splitting
const BIZAgentPage = lazy(() => import('@/agents/biz/page'));
const SEOGeoAgentPage = lazy(() => import('@/agents/seo-geo/page'));
const RedditGeoAgentPage = lazy(() => import('@/agents/reddit-geo/page'));
const KeywordDiscoveryAgentPage = lazy(() => import('@/agents/keyword-discovery/page'));
const TrendAnalysisAgentPage = lazy(() => import('@/agents/trend-analysis/page'));
const MIACoreAgentPage = lazy(() => import('@/agents/mia-core/page'));
const CreativeLabsAgentPage = lazy(() => import('@/agents/creative-labs/page'));
const BrandLenzAgentPage = lazy(() => import('@/agents/brandlenz/page'));
const DUFAAgentPage = lazy(() => import('@/agents/dufa/page'));
const InventoryInsightAgentPage = lazy(() => import('@/agents/inventory-insight/page'));


// Loading fallback component
const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black">
    <div className="text-center space-y-4">
      <Loader2 className="w-12 h-12 animate-spin text-viz-accent mx-auto" />
      <p className="text-sm text-slate-600 dark:text-viz-text-secondary">Loading...</p>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <SessionTimeoutProvider>
        <SchemaProvider>
          <AccessibilityProvider>
            <div className="App">
              <SEOHead />
              <Suspense fallback={<PageLoader />}>
                <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* Public landing page */}
          <Route path="/" element={<Home />} />
          
          {/* NEW CANONICAL AGENT ROUTES - Modular Micro-SaaS Architecture */}
          <Route path="/agents/biz" element={<ProtectedRoute><BIZAgentPage /></ProtectedRoute>} />
          <Route path="/agents/seo-geo" element={<ProtectedRoute><SEOGeoAgentPage /></ProtectedRoute>} />
          <Route path="/agents/reddit-geo" element={<ProtectedRoute><RedditGeoAgentPage /></ProtectedRoute>} />
          <Route path="/agents/keyword-discovery" element={<ProtectedRoute><KeywordDiscoveryAgentPage /></ProtectedRoute>} />
          <Route path="/agents/trend-analysis" element={<ProtectedRoute><TrendAnalysisAgentPage /></ProtectedRoute>} />
          <Route path="/agents/mia-core" element={<ProtectedRoute><MIACoreAgentPage /></ProtectedRoute>} />
          <Route path="/agents/creative-labs" element={<ProtectedRoute><CreativeLabsAgentPage /></ProtectedRoute>} />
          <Route path="/agents/brandlenz" element={<ProtectedRoute><BrandLenzAgentPage /></ProtectedRoute>} />
          <Route path="/agents/dufa" element={<ProtectedRoute><DUFAAgentPage /></ProtectedRoute>} />
          <Route path="/agents/inventory-insight" element={<ProtectedRoute><InventoryInsightAgentPage /></ProtectedRoute>} />
          
          {/* Agent Category Map - Admin/Reference Page */}
          <Route path="/agent-category-map" element={<ProtectedRoute><AgentCategoryMap /></ProtectedRoute>} />
          
          {/* All Agents Page */}
          <Route path="/agents" element={<ProtectedRoute><AllAgents /></ProtectedRoute>} />
          
          {/* NEW TAXONOMY CATEGORY PAGES */}
          <Route path="/categories/analytics" element={<ProtectedRoute><AnalyticsCategory /></ProtectedRoute>} />
          <Route path="/categories/growth" element={<ProtectedRoute><GrowthCategory /></ProtectedRoute>} />
          <Route path="/categories/operations" element={<ProtectedRoute><OperationsCategory /></ProtectedRoute>} />
          
          {/* LEGACY ROUTES - Redirects to canonical paths for SEO preservation */}
<Route path="/biz" element={<Navigate to="/agents/biz" replace />} />
<Route path="/riz/dufa" element={<Navigate to="/agents/dufa" replace />} />
<Route path="/riz/inventory" element={<Navigate to="/agents/inventory-insight" replace />} />
          {/* Redirect Brandlenz to canonical path */}
          <Route path="/brandlenz" element={<Navigate to="/agents/brandlenz" replace />} />
{/* Legacy home for compatibility */}
<Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/data-control" element={<ProtectedRoute><DataControl /></ProtectedRoute>} />
          <Route path="/table-explorer" element={<ProtectedRoute><TableExplorer /></ProtectedRoute>} />
          <Route path="/seo" element={<Navigate to="/agents/seo-geo" replace />} />
          <Route path="/seo-geo-ai-tool" element={<Navigate to="/agents/seo-geo" replace />} />
          <Route path="/dufa" element={<Navigate to="/agents/dufa" replace />} />
          <Route path="/dufa-coming-soon" element={<ProtectedRoute><DUFAComingSoon /></ProtectedRoute>} />
          <Route path="/tips" element={<ProtectedRoute><Tips /></ProtectedRoute>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/reddit-geo-agent" element={<Navigate to="/agents/reddit-geo" replace />} />
          {/* Category Hub Pages */}
          <Route path="/vee" element={<ProtectedRoute><VEECategory /></ProtectedRoute>} />
          <Route path="/mia" element={<ProtectedRoute><MIACategory /></ProtectedRoute>} />
          <Route path="/riz" element={<ProtectedRoute><RIZCategory /></ProtectedRoute>} />
          
          {/* VEE routes - Legacy sub-routes redirect to agents */}
          <Route path="/vee/seo-geo" element={<Navigate to="/agents/seo-geo" replace />} />
          <Route path="/vee/reddit-copilot" element={<Navigate to="/agents/reddit-geo" replace />} />
          <Route path="/vee/keyword-agent" element={<Navigate to="/agents/keyword-discovery" replace />} />
          <Route path="/vee/trend-agent" element={<Navigate to="/agents/trend-analysis" replace />} />
          <Route path="/vee/keyword-trend" element={<Navigate to="/agents/keyword-discovery" replace />} />
          <Route path="/vee/privacy" element={<ProtectedRoute><MIAPrivacy /></ProtectedRoute>} />
          <Route path="/vee/data-deletion" element={<ProtectedRoute><MIADataDeletion /></ProtectedRoute>} />
          <Route path="/vee/terms" element={<ProtectedRoute><MIATerms /></ProtectedRoute>} />
          {/* MIA routes - Legacy sub-routes redirect to agents */}
          <Route path="/MIA" element={<Navigate to="/mia" replace />} />
          <Route path="/mia/creative" element={<Navigate to="/agents/creative-labs" replace />} />
          <Route path="/mia/brandlenz" element={<Navigate to="/agents/brandlenz" replace />} />
          <Route path="/mia/seo-geo" element={<Navigate to="/agents/seo-geo" replace />} />
          <Route path="/mia/reddit-copilot" element={<Navigate to="/agents/reddit-geo" replace />} />
          <Route path="/mia/keyword-trend" element={<Navigate to="/agents/keyword-discovery" replace />} />
          <Route path="/mia/privacy" element={<Navigate to="/vee/privacy" replace />} />
          <Route path="/mia/data-deletion" element={<Navigate to="/vee/data-deletion" replace />} />
          <Route path="/mia/terms" element={<Navigate to="/vee/terms" replace />} />
          {/* Legacy MIA routes for compatibility */}
          <Route path="/MIA-coming-soon" element={<ProtectedRoute><MIAComingSoon /></ProtectedRoute>} />
          {/* Redirect legacy uppercase policy routes to lowercase canonical URLs */}
          <Route path="/MIA/privacy" element={<Navigate to="/vee/privacy" replace />} />
          <Route path="/MIA/data-deletion" element={<Navigate to="/vee/data-deletion" replace />} />
          <Route path="/MIA/terms" element={<Navigate to="/vee/terms" replace />} />
          {/* RIZ-scoped policy routes for MIA */}
          <Route path="/riz/mia/privacy" element={<ProtectedRoute><MIAPrivacy /></ProtectedRoute>} />
          <Route path="/riz/mia/data-deletion" element={<ProtectedRoute><MIADataDeletion /></ProtectedRoute>} />
          <Route path="/riz/mia/terms" element={<ProtectedRoute><MIATerms /></ProtectedRoute>} />
          {/* Reddit CoPilot standalone routes (for deep linking) */}
          <Route path="/vee/reddit-copilot/client-setup" element={<Navigate to="/agents/reddit-geo" replace />} />
          <Route path="/vee/reddit-copilot/agent-control" element={<Navigate to="/agents/reddit-geo" replace />} />
          <Route path="/vee/reddit-copilot/settings" element={<Navigate to="/agents/reddit-geo" replace />} />
          <Route path="/mia/reddit-copilot/client-setup" element={<Navigate to="/agents/reddit-geo" replace />} />
          <Route path="/mia/reddit-copilot/agent-control" element={<Navigate to="/agents/reddit-geo" replace />} />
          <Route path="/mia/reddit-copilot/settings" element={<Navigate to="/agents/reddit-geo" replace />} />
          {/* 404 fallback - shown for all users */}
          <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <Toaster />
            </div>
          </AccessibilityProvider>
        </SchemaProvider>
      </SessionTimeoutProvider>
    </AuthProvider>
  );
}

export default App;
