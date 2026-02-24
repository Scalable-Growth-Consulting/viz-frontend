import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { updateMetaTags, getSEOForRoute } from '@/utils/seo';

/**
 * SEOHead Component
 * Automatically updates meta tags based on current route
 * Enhances SEO and GEO (Generative Engine Optimization)
 */
export const SEOHead: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const seoData = getSEOForRoute(location.pathname);
    updateMetaTags(seoData);
  }, [location.pathname]);

  return null;
};
