import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, User, Building, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import redditCopilotAPI, { ClientProfile } from '@/services/redditCopilotApi';

const industryOptions = [
  'SaaS',
  'F&B',
  'Finance', 
  'Healthcare',
  'E-commerce',
  'Education',
  'Real Estate',
  'Marketing',
  'Technology',
  'Fashion',
  'Travel',
  'Fitness',
  'Consulting',
  'Legal',
  'Insurance',
  'Automotive',
  'Other'
];

const ClientSetup: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [profile, setProfile] = useState<ClientProfile>({
    usp: '',
    industry: '',
    keywords: []
  });

  // Load existing profile from API on mount
  useEffect(() => {
    loadExistingProfile();
  }, []);

  const loadExistingProfile = async () => {
    try {
      const existingProfile = await redditCopilotAPI.getClientProfile();
      if (existingProfile) {
        setProfile(existingProfile);
      }
    } catch (error) {
      console.error('Failed to load existing profile:', error);
      // Don't show error toast - profile might not exist yet
    }
  };

  const handleSaveProfile = async () => {
    if (!profile.usp.trim() || !profile.industry || profile.keywords.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before saving your profile.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call Lambda API to save profile
      await redditCopilotAPI.saveClientProfile(profile);

      toast({
        title: "Profile Saved Successfully!",
        description: "Your client profile has been saved. You can now run the Reddit agent.",
      });

      // Navigate back to main dashboard
      navigate('/mia/reddit-copilot');
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addKeyword = () => {
    const keyword = keywordInput.trim();
    if (keyword && !profile.keywords.includes(keyword)) {
      setProfile(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keywordToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-viz-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-viz-dark/80 backdrop-blur-md border-b border-slate-200/50 dark:border-viz-light/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/mia/reddit-copilot')}
              className="mr-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Client Setup
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Configure Your Brand Profile
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Set up your USP, industry, and keywords to personalize Reddit engagement
            </p>
          </div>

          {/* USP Card */}
          <Card className="border-slate-200 dark:border-viz-light/20 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                Unique Selling Proposition (USP)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label htmlFor="usp" className="text-slate-700 dark:text-slate-300">
                Describe what makes your brand unique and valuable to customers
              </Label>
              <Textarea
                id="usp"
                value={profile.usp}
                onChange={(e) => setProfile(prev => ({ ...prev, usp: e.target.value }))}
                placeholder="e.g., We provide AI-powered analytics that help SaaS companies increase conversion rates by 40% through predictive customer insights..."
                className="min-h-[120px] resize-none"
                maxLength={500}
              />
              <div className="text-xs text-slate-500 text-right">
                {profile.usp.length}/500 characters
              </div>
            </CardContent>
          </Card>

          {/* Industry Card */}
          <Card className="border-slate-200 dark:border-viz-light/20 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-green-500" />
                Industry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label className="text-slate-700 dark:text-slate-300">
                Select your primary industry to help the agent find relevant conversations
              </Label>
              <Select
                value={profile.industry}
                onValueChange={(value) => setProfile(prev => ({ ...prev, industry: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry..." />
                </SelectTrigger>
                <SelectContent>
                  {industryOptions.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Keywords Card */}
          <Card className="border-slate-200 dark:border-viz-light/20 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-500" />
                Top Keywords
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label className="text-slate-700 dark:text-slate-300">
                Add keywords related to your products, services, or topics you want to engage with
              </Label>
              
              <div className="flex gap-2">
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., data analytics, customer insights, AI, SaaS"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addKeyword}
                  disabled={!keywordInput.trim()}
                >
                  Add
                </Button>
              </div>

              {profile.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.keywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="secondary"
                      className="flex items-center gap-1 px-3 py-1"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <p className="text-xs text-slate-500">
                These keywords help the agent identify relevant Reddit posts and conversations to engage with.
              </p>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveProfile}
              disabled={isLoading}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientSetup;
