import React from 'react';
import TopNav from '@/components/TopNav';
import GlobalFooter from '@/components/GlobalFooter';
import CreativeLabs from '@/modules/MIA/components/CreativeLabs';
import { useAuth } from '@/contexts/AuthContext';

const CreativeLabsAgentPage: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black flex flex-col">
      <TopNav zone="mia" showData={false} />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#3E1E68] via-[#9B287B] to-[#F06199] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg">
              Design Intelligence
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-viz-dark dark:text-white">
              Creative Labs
            </h1>
            <p className="text-lg text-slate-600 dark:text-viz-text-secondary max-w-3xl">
              Automated creative prototyping that blends generative artistry with performance insights.
            </p>
          </div>
          {user && <CreativeLabs userId={user.id} />}
        </div>
      </main>
      <GlobalFooter />
    </div>
  );
};

export default CreativeLabsAgentPage;
