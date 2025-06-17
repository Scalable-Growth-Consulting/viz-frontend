import React from 'react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black text-center">
      <h1 className="text-6xl font-bold text-viz-accent dark:text-viz-accent-light mb-4">404</h1>
      <p className="text-2xl text-viz-dark dark:text-white mb-8">Page Not Found</p>
      <p className="text-viz-text-secondary">The page you're looking for doesn't exist or has been moved.</p>
      <a href="/" className="mt-8 px-6 py-3 bg-viz-accent text-white rounded-lg shadow-md hover:bg-viz-accent-light transition-colors">
        Go to Home
      </a>
    </div>
  );
};

export default NotFound;
