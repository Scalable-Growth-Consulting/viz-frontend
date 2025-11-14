import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, MessageCircle, ArrowLeft } from 'lucide-react';

interface RedditCoPilotComingSoonProps {
  showHeader?: boolean;
}

const RedditCoPilotComingSoon: React.FC<RedditCoPilotComingSoonProps> = ({ showHeader = true }) => {
  return (
    <div className="min-h-full flex items-center justify-center bg-slate-50 dark:bg-viz-dark p-4">
      <Card className="w-full max-w-md text-center border-slate-200 dark:border-viz-light/20">
        <CardContent className="p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Reddit CoPilot
          </h2>

          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Exclusive access for premium members only.
          </p>

          <div className="space-y-4">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <MessageCircle className="w-4 h-4 inline mr-2" />
              Automate authentic Reddit engagement with your brand voice.
            </div>

            <div className="text-sm text-slate-500 dark:text-slate-400">
              <Crown className="w-4 h-4 inline mr-2" />
              Available to exclusive and premium members.
            </div>
          </div>

          <div className="mt-8">
            <Link to="/mia">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to MIA
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RedditCoPilotComingSoon;
