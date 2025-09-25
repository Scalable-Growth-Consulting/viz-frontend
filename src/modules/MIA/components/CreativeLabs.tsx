import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import {
  Palette,
  Image as ImageIcon,
  Video,
  Wand2,
  Sparkles,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Settings,
  Zap,
  Brain,
  Camera,
  Film,
  Layers,
  Type,
  Shapes,
  Music,
  Star,
  Heart,
  ThumbsUp,
  Clock,
  TrendingUp,
  Award,
  Lightbulb,
  Target,
  Filter,
  Crop,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Move,
  ZoomIn,
  ZoomOut,
  Copy,
  Trash2,
  Save,
  Share2,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Star as StarIcon,
  Diamond,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  RotateCcw,
  RotateCw as RotateCwIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreativeLabsProps {
  userId: string;
}

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  timestamp: Date;
  likes: number;
  shares: number;
}

interface GeneratedVideo {
  id: string;
  url: string;
  thumbnail: string;
  prompt: string;
  duration: number;
  timestamp: Date;
  views: number;
}

const CreativeLabs: React.FC<CreativeLabsProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<'images' | 'videos' | 'studio'>('images');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<GeneratedVideo | null>(null);

  // Image generation state
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageStyle, setImageStyle] = useState('photorealistic');
  const [imageSize, setImageSize] = useState('1024x1024');
  const [imageQuality, setImageQuality] = useState([85]);
  const [imageCount, setImageCount] = useState([1]);

  // Video generation state
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoStyle, setVideoStyle] = useState('cinematic');
  const [videoDuration, setVideoDuration] = useState([15]);
  const [videoAspectRatio, setVideoAspectRatio] = useState('16:9');
  const [videoMood, setVideoMood] = useState('dynamic');

  // Studio state
  const [studioMode, setStudioMode] = useState<'design' | 'edit' | 'animate'>('design');
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [canvasZoom, setCanvasZoom] = useState(100);
  const [showLayers, setShowLayers] = useState(true);
  const [showTimeline, setShowTimeline] = useState(true);

  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);

  const imageStyles = [
    { value: 'photorealistic', label: 'Photorealistic', icon: Camera },
    { value: 'digital-art', label: 'Digital Art', icon: Palette },
    { value: 'anime', label: 'Anime', icon: Sparkles },
    { value: 'oil-painting', label: 'Oil Painting', icon: Palette },
    { value: 'watercolor', label: 'Watercolor', icon: Palette },
    { value: 'sketch', label: 'Sketch', icon: Shapes },
    { value: 'minimalist', label: 'Minimalist', icon: Square },
    { value: 'vintage', label: 'Vintage', icon: Clock },
  ];

  const videoStyles = [
    { value: 'cinematic', label: 'Cinematic', icon: Film },
    { value: 'documentary', label: 'Documentary', icon: Camera },
    { value: 'commercial', label: 'Commercial', icon: Target },
    { value: 'music-video', label: 'Music Video', icon: Music },
    { value: 'tutorial', label: 'Tutorial', icon: Lightbulb },
    { value: 'animation', label: 'Animation', icon: Sparkles },
  ];

  const studioTools = [
    { id: 'select', label: 'Select', icon: Move, shortcut: 'V' },
    { id: 'text', label: 'Text', icon: Type, shortcut: 'T' },
    { id: 'shapes', label: 'Shapes', icon: Shapes, shortcut: 'U' },
    { id: 'brush', label: 'Brush', icon: Palette, shortcut: 'B' },
    { id: 'crop', label: 'Crop', icon: Crop, shortcut: 'C' },
    { id: 'filter', label: 'Filter', icon: Filter, shortcut: 'F' },
  ];

  const generateImage = useCallback(async () => {
    if (!imagePrompt.trim()) {
      toast({
        title: 'Prompt Required',
        description: 'Please enter a prompt to generate an image.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate generation progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));

      const newImages: GeneratedImage[] = Array.from({ length: imageCount[0] }, (_, i) => ({
        id: `img_${Date.now()}_${i}`,
        url: `https://picsum.photos/1024/1024?random=${Date.now() + i}`,
        prompt: imagePrompt,
        style: imageStyle,
        timestamp: new Date(),
        likes: Math.floor(Math.random() * 100),
        shares: Math.floor(Math.random() * 50),
      }));

      setGeneratedImages(prev => [...newImages, ...prev]);
      setGenerationProgress(100);

      toast({
        title: 'Images Generated!',
        description: `${imageCount[0]} image${imageCount[0] > 1 ? 's' : ''} created successfully.`,
      });

      // Reset progress after showing completion
      setTimeout(() => {
        setGenerationProgress(0);
        setIsGenerating(false);
      }, 1000);

    } catch (error) {
      clearInterval(progressInterval);
      setGenerationProgress(0);
      setIsGenerating(false);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate images. Please try again.',
        variant: 'destructive',
      });
    }
  }, [imagePrompt, imageStyle, imageCount, toast]);

  const generateVideo = useCallback(async () => {
    if (!videoPrompt.trim()) {
      toast({
        title: 'Prompt Required',
        description: 'Please enter a prompt to generate a video.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 10;
      });
    }, 300);

    try {
      await new Promise(resolve => setTimeout(resolve, 5000));

      const newVideo: GeneratedVideo = {
        id: `vid_${Date.now()}`,
        url: '#', // Would be actual video URL
        thumbnail: `https://picsum.photos/640/360?random=${Date.now()}`,
        prompt: videoPrompt,
        duration: videoDuration[0],
        timestamp: new Date(),
        views: Math.floor(Math.random() * 1000),
      };

      setGeneratedVideos(prev => [newVideo, ...prev]);
      setGenerationProgress(100);

      toast({
        title: 'Video Generated!',
        description: `Video created successfully (${videoDuration[0]} seconds).`,
      });

      setTimeout(() => {
        setGenerationProgress(0);
        setIsGenerating(false);
      }, 1000);

    } catch (error) {
      clearInterval(progressInterval);
      setGenerationProgress(0);
      setIsGenerating(false);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate video. Please try again.',
        variant: 'destructive',
      });
    }
  }, [videoPrompt, videoDuration, toast]);

  const ImageGenerator: React.FC = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10 border-emerald-200/50 dark:border-emerald-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <ImageIcon className="w-5 h-5" />
            AI Image Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Textarea
              placeholder="Describe the image you want to create..."
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              className="min-h-[100px] resize-none"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Style</label>
                <Select value={imageStyle} onValueChange={setImageStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {imageStyles.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        <div className="flex items-center gap-2">
                          <style.icon className="w-4 h-4" />
                          {style.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Size</label>
                <Select value={imageSize} onValueChange={setImageSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="512x512">512 x 512</SelectItem>
                    <SelectItem value="768x768">768 x 768</SelectItem>
                    <SelectItem value="1024x1024">1024 x 1024</SelectItem>
                    <SelectItem value="1024x768">1024 x 768</SelectItem>
                    <SelectItem value="768x1024">768 x 1024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Quality</label>
                  <span className="text-sm text-muted-foreground">{imageQuality[0]}%</span>
                </div>
                <Slider
                  value={imageQuality}
                  onValueChange={setImageQuality}
                  max={100}
                  min={50}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Count</label>
                  <span className="text-sm text-muted-foreground">{imageCount[0]}</span>
                </div>
                <Slider
                  value={imageCount}
                  onValueChange={setImageCount}
                  max={4}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={generateImage}
            disabled={isGenerating || !imagePrompt.trim()}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            size="lg"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Images
              </>
            )}
          </Button>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Generating your images...</span>
                <span>{Math.round(generationProgress)}%</span>
              </div>
              <Progress value={generationProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {generatedImages.length > 0 && (
        <Card className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-200/50 dark:border-blue-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Sparkles className="w-5 h-5" />
              Generated Images ({generatedImages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {generatedImages.map((image) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/50"
                >
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-white text-sm line-clamp-2">{image.prompt}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {image.style}
                      </Badge>
                      <div className="flex items-center gap-3 text-white/80 text-xs">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {image.likes}
                        </div>
                        <div className="flex items-center gap-1">
                          <Share2 className="w-3 h-3" />
                          {image.shares}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );

  const VideoGenerator: React.FC = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 border-purple-200/50 dark:border-purple-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <Video className="w-5 h-5" />
            AI Video Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Textarea
              placeholder="Describe the video you want to create..."
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
              className="min-h-[100px] resize-none"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Style</label>
                <Select value={videoStyle} onValueChange={setVideoStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {videoStyles.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        <div className="flex items-center gap-2">
                          <style.icon className="w-4 h-4" />
                          {style.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Aspect Ratio</label>
                <Select value={videoAspectRatio} onValueChange={setVideoAspectRatio}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                    <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                    <SelectItem value="21:9">21:9 (Ultrawide)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Duration</label>
                  <span className="text-sm text-muted-foreground">{videoDuration[0]}s</span>
                </div>
                <Slider
                  value={videoDuration}
                  onValueChange={setVideoDuration}
                  max={60}
                  min={5}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mood</label>
                <Select value={videoMood} onValueChange={setVideoMood}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dynamic">Dynamic</SelectItem>
                    <SelectItem value="calm">Calm</SelectItem>
                    <SelectItem value="energetic">Energetic</SelectItem>
                    <SelectItem value="dramatic">Dramatic</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button
            onClick={generateVideo}
            disabled={isGenerating || !videoPrompt.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            size="lg"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Film className="w-4 h-4 mr-2" />
                Generate Video
              </>
            )}
          </Button>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Generating your video...</span>
                <span>{Math.round(generationProgress)}%</span>
              </div>
              <Progress value={generationProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {generatedVideos.length > 0 && (
        <Card className="bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-900/10 dark:to-red-900/10 border-orange-200/50 dark:border-orange-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <Play className="w-5 h-5" />
              Generated Videos ({generatedVideos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedVideos.map((video) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  className="group relative aspect-video rounded-lg overflow-hidden border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/50"
                >
                  <img
                    src={video.thumbnail}
                    alt={video.prompt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <Button size="lg" className="rounded-full">
                      <Play className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-white text-sm line-clamp-2">{video.prompt}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {video.duration}s
                      </Badge>
                      <div className="flex items-center gap-1 text-white/80 text-xs">
                        <Eye className="w-3 h-3" />
                        {video.views}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );

  const CreativeStudio: React.FC = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="bg-gradient-to-br from-violet-50/50 to-indigo-50/50 dark:from-violet-900/10 dark:to-indigo-900/10 border-violet-200/50 dark:border-violet-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
            <Layers className="w-5 h-5" />
            Creative Studio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
            {/* Tools Panel */}
            <div className="lg:col-span-1 space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Tools</h3>
                <div className="grid grid-cols-2 gap-2">
                  {studioTools.map((tool) => (
                    <Button
                      key={tool.id}
                      variant={selectedTool === tool.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTool(tool.id)}
                      className="h-auto p-3 flex flex-col items-center gap-1"
                    >
                      <tool.icon className="w-4 h-4" />
                      <span className="text-xs">{tool.label}</span>
                      <span className="text-[10px] text-muted-foreground">{tool.shortcut}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Canvas</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCanvasZoom(Math.max(25, canvasZoom - 25))}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm min-w-[50px] text-center">{canvasZoom}%</span>
                  <Button variant="outline" size="sm" onClick={() => setCanvasZoom(Math.min(300, canvasZoom + 25))}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="lg:col-span-3 relative">
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 h-full overflow-hidden">
                <div className="h-12 bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowLayers(!showLayers)}>
                      <Layers className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowTimeline(!showTimeline)}>
                      <Clock className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 relative overflow-hidden">
                  <div
                    ref={canvasRef}
                    className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 relative"
                    style={{
                      transform: `scale(${canvasZoom / 100})`,
                      transformOrigin: 'center center'
                    }}
                  >
                    {/* Canvas content would go here */}
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-slate-500">
                      <div className="text-center">
                        <Palette className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Canvas Area</p>
                        <p className="text-xs">Select a tool to start creating</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-violet-900/20 dark:via-purple-900/20 dark:to-pink-900/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)] p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow">
                  <Sparkles className="w-3.5 h-3.5" />
                  World-Class Creative AI
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Creative Labs
                </h1>
                <p className="text-base md:text-lg text-slate-600 dark:text-slate-300">
                  Professional AI-powered image and video creation studio with advanced editing tools.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge className="bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20">
                    <ImageIcon className="w-3 h-3 mr-1" />
                    AI Images
                  </Badge>
                  <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                    <Video className="w-3 h-3 mr-1" />
                    AI Videos
                  </Badge>
                  <Badge className="bg-pink-500/10 text-pink-700 dark:text-pink-300 border border-pink-500/20">
                    <Layers className="w-3 h-3 mr-1" />
                    Studio
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow hover:shadow-lg hover:brightness-105 transition-all"
                  size="lg"
                >
                  <Wand2 className="w-4 h-4" />
                  Quick Generate
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
                  size="lg"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-6">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-1 shadow-sm">
            <TabsList className="grid w-full grid-cols-3 bg-slate-50/70 dark:bg-slate-700/40 rounded-xl p-1 h-auto">
              <TabsTrigger
                value="images"
                className="flex items-center justify-center gap-2 text-sm font-semibold py-4 px-6 rounded-xl data-[state=active]:bg-white data-[state=active]:text-violet-600 data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 data-[state=active]:dark:bg-slate-800 data-[state=active]:dark:text-violet-400 transition-all duration-200 hover:text-violet-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
              >
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">AI Images</span>
              </TabsTrigger>
              <TabsTrigger
                value="videos"
                className="flex items-center justify-center gap-2 text-sm font-semibold py-4 px-6 rounded-xl data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 data-[state=active]:dark:bg-slate-800 data-[state=active]:dark:text-purple-400 transition-all duration-200 hover:text-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40"
              >
                <Video className="w-4 h-4" />
                <span className="hidden sm:inline">AI Videos</span>
              </TabsTrigger>
              <TabsTrigger
                value="studio"
                className="flex items-center justify-center gap-2 text-sm font-semibold py-4 px-6 rounded-xl data-[state=active]:bg-white data-[state=active]:text-pink-600 data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 data-[state=active]:dark:bg-slate-800 data-[state=active]:dark:text-pink-400 transition-all duration-200 hover:text-pink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/40"
              >
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Studio</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="images" className="mt-6">
                <ImageGenerator />
              </TabsContent>
              <TabsContent value="videos" className="mt-6">
                <VideoGenerator />
              </TabsContent>
              <TabsContent value="studio" className="mt-6">
                <CreativeStudio />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
};

export default CreativeLabs;
