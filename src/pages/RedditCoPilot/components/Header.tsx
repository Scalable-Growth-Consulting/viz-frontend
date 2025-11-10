import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-viz-light/20 bg-white/80 dark:bg-viz-dark/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/mia/reddit-copilot" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-viz-dark dark:text-white">
              Reddit <span className="text-orange-500">CoPilot</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/mia/reddit-copilot/settings">
            <Button variant="ghost" size="sm">
              <SettingsIcon className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
