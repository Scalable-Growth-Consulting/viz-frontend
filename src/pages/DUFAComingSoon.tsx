import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { 
  TrendingUp, 
  Sparkles, 
  Brain, 
  Zap, 
  ArrowLeft,
  Mail,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';

const DUFAComingSoon: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleNotifyMe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Mock API call - in real implementation, this would save to database
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubscribed(true);
      toast({
        title: "You're on the list!",
        description: "We'll notify you as soon as DUFA is available.",
      });
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-viz-dark dark:via-slate-900 dark:to-black">
      <Header />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-128 bg-indigo-400/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-6xl">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 text-slate-600 dark:text-viz-text-secondary hover:text-viz-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="text-center mb-16">
          {/* Hero Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-viz-accent to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <TrendingUp className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="w-4 h-4 text-yellow-800" />
              </div>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-viz-accent via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 leading-tight">
            DUFA
          </h1>
          
          <h2 className="text-2xl md:text-4xl font-bold text-viz-dark dark:text-white mb-4">
            AI-Powered Demand Forecasting Agent
          </h2>
          
          <p className="text-xl md:text-2xl text-slate-600 dark:text-viz-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
            <span className="font-semibold text-viz-accent">Coming Soon!</span> Be the first to experience the next generation of intelligent forecasting. 
            Stay tuned for the launch.
          </p>
        </div>

        {/* Feature Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-white/80 dark:bg-viz-medium/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-viz-dark dark:text-white mb-3">
                Advanced AI Models
              </h3>
              <p className="text-slate-600 dark:text-viz-text-secondary">
                ARIMA, Prophet, XGBoost, and LSTM algorithms working together for unprecedented accuracy
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-viz-medium/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-viz-dark dark:text-white mb-3">
                Real-Time Insights
              </h3>
              <p className="text-slate-600 dark:text-viz-text-secondary">
                Interactive dashboards with anomaly detection and scenario analysis powered by AI
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-viz-medium/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-viz-dark dark:text-white mb-3">
                Smart Forecasting
              </h3>
              <p className="text-slate-600 dark:text-viz-text-secondary">
                Automated model selection and hyperparameter tuning for optimal forecast performance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Email Signup Section */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/90 dark:bg-viz-medium/90 backdrop-blur-sm border-0 shadow-2xl">
            <CardContent className="p-8">
              {!isSubscribed ? (
                <>
                  <div className="text-center mb-6">
                    <Mail className="w-12 h-12 text-viz-accent mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-viz-dark dark:text-white mb-2">
                      Get Early Access
                    </h3>
                    <p className="text-slate-600 dark:text-viz-text-secondary">
                      Be among the first to experience DUFA when it launches. We'll send you an exclusive invitation.
                    </p>
                  </div>
                  
                  <form onSubmit={handleNotifyMe} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 h-12 text-lg"
                        disabled={isSubmitting}
                      />
                      <Button
                        type="submit"
                        disabled={isSubmitting || !email}
                        className="h-12 px-8 bg-gradient-to-r from-viz-accent to-blue-600 hover:from-viz-accent/90 hover:to-blue-600/90 text-white font-semibold"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Subscribing...
                          </>
                        ) : (
                          'Notify Me'
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-viz-text-secondary text-center">
                      We respect your privacy. No spam, unsubscribe at any time.
                    </p>
                  </form>
                </>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-viz-dark dark:text-white mb-2">
                    You're All Set!
                  </h3>
                  <p className="text-slate-600 dark:text-viz-text-secondary mb-6">
                    We've added <span className="font-semibold text-viz-accent">{email}</span> to our early access list. 
                    You'll be among the first to know when DUFA is ready.
                  </p>
                  <Link to="/">
                    <Button variant="outline" className="mt-4">
                      Return to Dashboard
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-slate-500 dark:text-viz-text-secondary">
          <p className="text-sm">
            DUFA is currently in development. Expected launch: Q2 2024
          </p>
        </div>
      </div>
    </div>
  );
};

export default DUFAComingSoon;
