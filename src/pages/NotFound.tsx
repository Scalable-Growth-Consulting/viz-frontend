import React from 'react';
import { Link } from 'react-router-dom';
import { Ghost, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black text-center px-4">
      <div className="animate-bounce mb-6">
        <Ghost className="w-24 h-24 text-viz-accent dark:text-viz-accent-light mx-auto drop-shadow-lg" />
      </div>
      <h1 className="text-7xl sm:text-8xl font-extrabold text-viz-accent dark:text-viz-accent-light mb-2 animate-pulse">404</h1>
      <p className="text-2xl sm:text-3xl font-semibold text-viz-dark dark:text-white mb-4">Page Not Found</p>
      <p className="text-lg text-viz-text-secondary mb-8 max-w-xl mx-auto">
        Oops! The page you're looking for doesn't exist, has been moved, or you might not have permission to view it.<br />
        If you believe this is a mistake, please contact support.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-7 py-3 bg-viz-accent text-white rounded-lg shadow-lg hover:bg-viz-accent-light hover:scale-105 transition-all duration-200 font-medium text-lg focus:outline-none focus:ring-2 focus:ring-viz-accent-dark"
      >
        <ArrowLeft className="w-5 h-5" />
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;
