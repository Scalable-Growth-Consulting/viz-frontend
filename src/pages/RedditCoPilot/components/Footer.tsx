import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur">
      <div className="container mx-auto px-4 py-4">
        <div className="text-center text-sm text-slate-500 dark:text-viz-text-secondary">
          <p>Reddit CoPilot • Powered by AI • Secure & Encrypted</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
