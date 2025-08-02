import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  Zap,
  TrendingUp,
  Target,
  BarChart3,
  MessageSquare,
  Sparkles,
  Mail,
  CheckCircle,
  ArrowRight,
  Users,
  Clock,
  Star,
} from 'lucide-react';
import Header from '@/components/Header';

const MIAComingSoon: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleWaitlistSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address to join the waitlist.',
        variant: 'destructive',
      });
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitted(true);
    toast({
      title: 'Welcome to the Waitlist!',
      description: 'You\'ll be notified when MIA becomes available.',
    });
  };

  const features = [
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Multi-Platform Integration',
      description: 'Connect Facebook Ads, Google Ads, LinkedIn, and TikTok in one dashboard',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Unified Analytics',
      description: 'Compare performance across platforms with advanced metrics and insights',
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'AI-Powered Chat',
      description: 'Ask natural language questions and get actionable marketing recommendations',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Smart Optimization',
      description: 'Automatic ad fatigue detection and budget reallocation suggestions',
    },
  ];

  const stats = [
    { label: 'Beta Users', value: '500+', icon: <Users className="w-5 h-5" /> },
    { label: 'Avg ROAS Improvement', value: '35%', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Time Saved', value: '10hrs/week', icon: <Clock className="w-5 h-5" /> },
    { label: 'User Rating', value: '4.9/5', icon: <Star className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-viz-dark dark:via-gray-900 dark:to-black">
      <Header />
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center space-y-8 mb-16">
          <div className="flex justify-center">
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              Coming Soon - Early Access
            </Badge>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Marketing Intelligence Agent
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              The AI-powered marketing analytics platform that unifies your ad campaigns, 
              provides intelligent insights, and optimizes performance across all channels.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-6 shadow-2xl">
              <Zap className="w-16 h-16 text-blue-600 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-center mb-3 text-blue-600">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-lg text-white">
                    {feature.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Waitlist Signup */}
        <Card className="max-w-2xl mx-auto bg-gradient-to-br from-white/90 to-blue-50/90 dark:from-gray-800/90 dark:to-gray-900/90 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {isSubmitted ? 'You\'re on the list!' : 'Join the Waitlist'}
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300">
              {isSubmitted 
                ? 'We\'ll notify you when MIA is ready for you to explore.'
                : 'Be among the first to experience the future of marketing analytics.'
              }
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {isSubmitted ? (
              <div className="text-center space-y-4">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Welcome to the MIA Waitlist!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    You'll receive an email when early access becomes available.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                  className="mt-4"
                >
                  Sign up another email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSignup} className="space-y-4">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12 bg-white/80 dark:bg-gray-700/80 border-gray-200 dark:border-gray-600"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                  >
                    Join Waitlist
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  No spam, ever. Unsubscribe at any time.
                </p>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-16 space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Questions about MIA? Contact us at{' '}
            <a href="mailto:support@creatorvision.com" className="text-blue-600 hover:underline">
              support@creatorvision.com
            </a>
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MIAComingSoon;
