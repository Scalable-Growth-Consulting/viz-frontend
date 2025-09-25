import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Search,
  Sparkles,
  Target,
  BarChart3,
  MessageSquare,
  Mail,
  CheckCircle,
  ArrowRight,
  Users,
  Clock,
  Star,
  Crown,
  Zap,
  TrendingUp,
  Globe,
  Shield,
  Rocket,
  Eye,
  Heart,
  Lightbulb,
  Database,
  Cpu,
  Network,
  Lock,
  Award,
  Infinity,
  ArrowLeft,
  Home,
} from 'lucide-react';
import Header from '@/components/Header';
import GlobalFooter from '@/components/GlobalFooter';

interface Props { showHeader?: boolean }

const MIAComingSoon: React.FC<Props> = ({ showHeader = true }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const agents = [
    {
      icon: <Brain className="w-8 h-8" />,
      name: 'MIA Core',
      title: 'Marketing Intelligence Agent',
      description: 'AI-powered marketing analytics with multi-platform integration, unified dashboards, and intelligent campaign optimization.',
      gradient: 'from-purple-500 to-violet-600',
      features: ['Multi-Platform Integration', 'Unified Analytics', 'AI-Powered Chat', 'Smart Optimization'],
      status: 'Available Now',
      statusColor: 'bg-green-500',
    },
    {
      icon: <Search className="w-8 h-8" />,
      name: 'SEO-GEO Agent',
      title: 'Search & Geographic Optimization',
      description: 'Advanced SEO analysis with cutting-edge generative engine optimization and geographic targeting intelligence.',
      gradient: 'from-violet-500 to-purple-600',
      features: ['Technical SEO Analysis', 'GEO Optimization', 'Content Intelligence', 'Rank Tracking'],
      status: 'Available Now',
      statusColor: 'bg-green-500',
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      name: 'Brandlenz',
      title: 'Social Listening & Brand Intelligence',
      description: 'Comprehensive brand monitoring across 11+ platforms with AI-powered sentiment analysis and competitive intelligence.',
      gradient: 'from-indigo-500 to-purple-600',
      features: ['Social Listening', 'Sentiment Analysis', 'Brand Health Scoring', 'Competitive Intelligence'],
      status: 'Available Now',
      statusColor: 'bg-green-500',
    },
    {
      icon: <Target className="w-8 h-8" />,
      name: 'Campaign Intelligence Agent',
      title: 'Advanced Campaign Optimization',
      description: 'Next-generation campaign management with predictive analytics, automated A/B testing, and cross-platform attribution.',
      gradient: 'from-blue-500 to-indigo-600',
      features: ['Predictive Analytics', 'Auto A/B Testing', 'Attribution Modeling', 'Budget Optimization'],
      status: 'Coming Q1 2025',
      statusColor: 'bg-amber-500',
    },
    {
      icon: <Eye className="w-8 h-8" />,
      name: 'Customer Journey Agent',
      title: 'Journey Mapping & Personalization',
      description: 'AI-driven customer journey analysis with personalization engines and conversion optimization recommendations.',
      gradient: 'from-cyan-500 to-blue-600',
      features: ['Journey Mapping', 'Personalization Engine', 'Conversion Optimization', 'Behavioral Analytics'],
      status: 'Coming Q2 2025',
      statusColor: 'bg-amber-500',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      name: 'Loyalty Intelligence Agent',
      title: 'Customer Retention & Loyalty',
      description: 'Advanced loyalty program optimization with churn prediction, lifetime value modeling, and retention strategies.',
      gradient: 'from-pink-500 to-rose-600',
      features: ['Churn Prediction', 'LTV Modeling', 'Loyalty Programs', 'Retention Strategies'],
      status: 'Coming Q3 2025',
      statusColor: 'bg-amber-500',
    },
  ];

  const premiumFeatures = [
    {
      icon: <Crown className="w-6 h-6" />,
      title: 'Premium Access',
      description: 'Unlock all MIA agents with advanced AI capabilities and priority support',
      gradient: 'from-yellow-400 to-orange-500',
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: 'Unlimited Data Processing',
      description: 'Process unlimited campaigns, mentions, and analytics data across all platforms',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: 'Advanced AI Models',
      description: 'Access to GPT-4, Claude, and proprietary AI models for superior insights',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: <Network className="w-6 h-6" />,
      title: 'Enterprise Integrations',
      description: 'Connect to 50+ marketing platforms, CRMs, and enterprise tools',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Enterprise Security',
      description: 'SOC2 compliance, SSO, advanced permissions, and audit logs',
      gradient: 'from-slate-500 to-gray-600',
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: 'Priority Support',
      description: '24/7 dedicated support, custom training, and implementation assistance',
      gradient: 'from-red-500 to-pink-500',
    },
  ];

  const stats = [
    { label: 'Enterprise Clients', value: '2,500+', icon: <Users className="w-5 h-5" /> },
    { label: 'Avg ROAS Improvement', value: '247%', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Time Saved Weekly', value: '25hrs', icon: <Clock className="w-5 h-5" /> },
    { label: 'Customer Satisfaction', value: '4.9/5', icon: <Star className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-viz-dark dark:via-gray-900 dark:to-black">
      {showHeader && <Header />}
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative container mx-auto px-6 py-12 max-w-7xl">
        {/* Back Button */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-8 mb-20">
          <div className="flex justify-center">
            <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 text-sm font-medium rounded-full shadow-lg">
              <Crown className="w-4 h-4 mr-2" />
              Premium Marketing Intelligence Suite
            </Badge>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
              MIA
            </h1>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Marketing Intelligence Agents
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              The world's most advanced AI-powered marketing intelligence platform. 
              Six specialized agents working together to revolutionize your marketing strategy.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-full p-8 backdrop-blur-sm border border-purple-200/30 dark:border-purple-400/30">
                <Brain className="w-20 h-20 text-purple-600 animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2">
                <Crown className="w-6 h-6 text-white" />
              </div>
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

        {/* MIA Agents Showcase */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Six Specialized AI Agents
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Each agent is designed to master a specific aspect of marketing intelligence, 
              working together to provide unprecedented insights and automation.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agents.map((agent, index) => (
              <Card key={index} className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${agent.gradient}`}></div>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* Agent Header */}
                    <div className="flex items-start justify-between">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${agent.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {agent.icon}
                      </div>
                      <Badge className={`${agent.statusColor} text-white px-3 py-1 text-xs font-medium`}>
                        {agent.status}
                      </Badge>
                    </div>
                    
                    {/* Agent Info */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                          {agent.name}
                        </h3>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {agent.title}
                        </p>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                        {agent.description}
                      </p>
                    </div>
                    
                    {/* Features List */}
                    <div className="space-y-2">
                      {agent.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${agent.gradient}`}></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Premium Features Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 text-sm font-medium rounded-full shadow-lg">
                <Crown className="w-4 h-4 mr-2" />
                Premium Features
              </Badge>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Enterprise-Grade Capabilities
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Unlock the full potential of MIA with premium features designed for 
              enterprise marketing teams and agencies.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {premiumFeatures.map((feature, index) => (
              <Card key={index} className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg w-fit group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {feature.title}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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

        {/* Contact Section */}
        <div className="text-center mt-16 space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Questions about MIA Premium? Contact our enterprise team at{' '}
            <a href="mailto:enterprise@sgconsultingtech.com" className="text-purple-600 hover:underline font-medium">
              enterprise@sgconsultingtech.com
            </a>
          </p>
        </div>
      </div>
      
      {/* Global Footer */}
      <GlobalFooter variant="mia" />
    </div>
  );
};

export default MIAComingSoon;
