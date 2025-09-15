import React from 'react';
import { SEOGeoChecker } from '@/modules/SEO/components/SEOGeoChecker';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Brain } from 'lucide-react';

const SEO: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-violet-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="p-3 bg-gradient-to-br from-pink-500 to-violet-600 rounded-2xl shadow-lg"
            >
              <Brain className="w-8 h-8 text-white" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg"
            >
              <Zap className="w-8 h-8 text-white" />
            </motion.div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-lg"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl sm:text-6xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-4 tracking-tight"
          >
            SEO & GAI Engine
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500/10 to-purple-500/10 backdrop-blur-sm border border-pink-200/20 dark:border-purple-400/20 rounded-full mb-6"
          >
            <Sparkles className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            <span className="text-lg font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Generative AI Engine Optimization
            </span>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Next-gen AI-powered SEO analysis with generative engine optimization insights. 
            <span className="font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Dominate search rankings with AI precision.
            </span>
          </motion.p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <SEOGeoChecker />
        </motion.div>
      </div>
    </div>
  );
};

export default SEO;
