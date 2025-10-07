import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Filter, 
  Search, 
  ExternalLink, 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye,
  Calendar,
  MapPin,
  Verified,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { BrandMention, Platform, SentimentScore } from '../types';
import { useMentions } from '../hooks/useMentions';

interface BrandlenzMentionsProps {
  mentions: BrandMention[];
  loading: boolean;
}

const BrandlenzMentions: React.FC<BrandlenzMentionsProps> = ({ mentions: propMentions, loading: propLoading }) => {
  const { mentions, loading, hasMore, loadMore, filters, updateFilters } = useMentions();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Use hook data if available, otherwise use props
  const displayMentions = mentions.length > 0 ? mentions : propMentions || [];
  const isLoading = loading || propLoading;

  const getSentimentColor = (sentiment: SentimentScore) => {
    switch (sentiment) {
      case 'very_positive': return 'bg-green-600 text-white';
      case 'positive': return 'bg-green-500 text-white';
      case 'neutral': return 'bg-gray-500 text-white';
      case 'negative': return 'bg-red-500 text-white';
      case 'very_negative': return 'bg-red-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSentimentIcon = (sentiment: SentimentScore) => {
    switch (sentiment) {
      case 'very_positive':
      case 'positive':
        return <Heart className="w-3 h-3" />;
      case 'negative':
      case 'very_negative':
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getPlatformColor = (platform: Platform) => {
    const colors: Record<Platform, string> = {
      twitter: 'bg-blue-500',
      google_reviews: 'bg-red-500',
      trustpilot: 'bg-green-500',
      amazon: 'bg-orange-500',
      shopify: 'bg-green-600',
      wordpress: 'bg-blue-800',
      facebook: 'bg-blue-600',
      instagram: 'bg-pink-500',
      linkedin: 'bg-blue-700',
      youtube: 'bg-red-600',
      reddit: 'bg-orange-600',
    };
    return colors[platform] || 'bg-gray-500';
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  const filteredMentions = displayMentions.filter(mention => {
    if (searchQuery && !mention.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (isLoading && displayMentions.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Brand Mentions</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredMentions.length.toLocaleString()} mentions found
          </p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search mentions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex-shrink-0"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {(['twitter', 'google_reviews', 'trustpilot', 'amazon'] as Platform[]).map(platform => (
                    <Button
                      key={platform}
                      variant={filters.platforms.includes(platform) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newPlatforms = filters.platforms.includes(platform)
                          ? filters.platforms.filter(p => p !== platform)
                          : [...filters.platforms, platform];
                        updateFilters({ platforms: newPlatforms });
                      }}
                    >
                      {platform.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Sentiment</label>
                <div className="flex flex-wrap gap-2">
                  {(['very_positive', 'positive', 'neutral', 'negative', 'very_negative'] as SentimentScore[]).map(sentiment => (
                    <Button
                      key={sentiment}
                      variant={filters.sentiment.includes(sentiment) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newSentiment = filters.sentiment.includes(sentiment)
                          ? filters.sentiment.filter(s => s !== sentiment)
                          : [...filters.sentiment, sentiment];
                        updateFilters({ sentiment: newSentiment });
                      }}
                    >
                      {sentiment.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={filters.dateRange[0]}
                    onChange={(e) => updateFilters({ dateRange: [e.target.value, filters.dateRange[1]] })}
                  />
                  <Input
                    type="date"
                    value={filters.dateRange[1]}
                    onChange={(e) => updateFilters({ dateRange: [filters.dateRange[0], e.target.value] })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mentions List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {filteredMentions.map((mention) => (
            <Card key={mention.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Author Avatar */}
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={mention.author.profileImage} />
                    <AvatarFallback>
                      {mention.author.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    {/* Author Info */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {mention.author.displayName}
                      </span>
                      {mention.author.verifiedStatus && (
                        <Verified className="w-4 h-4 text-blue-500" />
                      )}
                      <span className="text-gray-500 text-sm">
                        @{mention.author.username}
                      </span>
                      <span className="text-gray-400 text-sm">•</span>
                      <span className="text-gray-500 text-sm">
                        {formatTimeAgo(mention.timestamp)}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="text-gray-900 dark:text-white mb-3 leading-relaxed">
                      {mention.content}
                    </p>

                    {/* Badges and Metadata */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge className={`${getPlatformColor(mention.platform)} text-white`}>
                        {mention.platform.replace('_', ' ')}
                      </Badge>
                      <Badge className={getSentimentColor(mention.sentiment.score)}>
                        {getSentimentIcon(mention.sentiment.score)}
                        <span className="ml-1">{mention.sentiment.score.replace('_', ' ')}</span>
                      </Badge>
                      {mention.sentiment.confidence && (
                        <Badge variant="outline">
                          {Math.round(mention.sentiment.confidence * 100)}% confidence
                        </Badge>
                      )}
                      {mention.location && (
                        <Badge variant="outline">
                          <MapPin className="w-3 h-3 mr-1" />
                          {mention.location.city || mention.location.country}
                        </Badge>
                      )}
                    </div>

                    {/* Topics and Products */}
                    {(mention.topics.length > 0 || mention.productMentions.length > 0) && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {mention.topics.map(topic => (
                          <Badge key={topic} variant="secondary" className="text-xs">
                            #{topic}
                          </Badge>
                        ))}
                        {mention.productMentions.map(product => (
                          <Badge key={product} variant="outline" className="text-xs">
                            {product}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Engagement Metrics */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-gray-500">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span className="text-sm">{mention.engagement.likes.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">{mention.engagement.comments.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Share2 className="w-4 h-4" />
                          <span className="text-sm">{mention.engagement.shares.toLocaleString()}</span>
                        </div>
                        {mention.engagement.views && (
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span className="text-sm">{mention.engagement.views.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      <Button variant="ghost" size="sm" asChild>
                        <a href={mention.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>

                    {/* AI Reasoning (expandable) */}
                    {mention.sentiment.reasoning && (
                      <details className="mt-3">
                        <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                          AI Analysis
                        </summary>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                          {mention.sentiment.reasoning}
                        </p>
                      </details>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center py-4">
              <Button onClick={loadMore} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Mentions'
                )}
              </Button>
            </div>
          )}

          {/* Empty State */}
          {filteredMentions.length === 0 && !isLoading && (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No mentions found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery || filters.platforms.length > 0 || filters.sentiment.length > 0
                    ? 'Try adjusting your filters or search query.'
                    : 'Connect your platforms to start monitoring brand mentions.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default BrandlenzMentions;
