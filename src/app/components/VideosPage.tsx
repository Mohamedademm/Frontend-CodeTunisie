import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from 'react-i18next';
import {
  Search,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Sparkles,
  Video as VideoIcon,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { VideoCard } from "@/app/components/VideoCard";
import {
  videoCategories,
} from "@/app/data/mockData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Video } from "@/app/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { videoService } from "@/services/videoService";

export function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("all");
  const [selectedVideo, setSelectedVideo] =
    useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchVideos();
  }, [selectedCategory, searchQuery]);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await videoService.getVideos({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
      });
      setVideos(data);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(t('videos.error_loading'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-2">
              <VideoIcon className="w-8 h-8 text-secondary" />
              <h1 className="text-4xl font-bold text-foreground">
                {t('videos.title')}
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              {t('videos.subtitle')}
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-effect rounded-xl shadow-md p-6 mb-6 border border-border"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={t('videos.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-input-background border-border focus:border-secondary transition-colors"
              />
            </div>
          </motion.div>

          {/* Category Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 mb-8"
          >
            {videoCategories.map((category) => (
              <Tooltip key={category}>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant={
                        selectedCategory === category
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        setSelectedCategory(category)
                      }
                      className="rounded-full transition-all"
                    >
                      {category}
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('videos.filter_tooltip')} {category}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </motion.div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}

          {/* Video Stats */}
          {!isLoading && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
            >
              <motion.div
                whileHover={{ y: -3 }}
                className="glass-effect rounded-xl p-4 shadow-md border border-border"
              >
                <div className="text-2xl font-bold bg-clip-text text-transparent gradient-secondary">
                  {videos.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('videos.stats.available')}
                </div>
              </motion.div>
              <motion.div
                whileHover={{ y: -3 }}
                className="glass-effect rounded-xl p-4 shadow-md border border-border"
              >
                <div className="text-2xl font-bold text-success">
                  {
                    videos.filter((v) => v.progress === 100)
                      .length
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('videos.stats.completed')}
                </div>
              </motion.div>
              <motion.div
                whileHover={{ y: -3 }}
                className="glass-effect rounded-xl p-4 shadow-md border border-border"
              >
                <div className="text-2xl font-bold text-accent">
                  {videos.length > 0
                    ? videos.reduce((acc, v) => acc + v.views, 0).toLocaleString()
                    : 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('videos.stats.total_views')}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Results count */}
          {searchQuery || selectedCategory !== "Tous" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 text-muted-foreground flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-secondary" />
              {videos.length} {t('videos.found_count', { count: videos.length })}
            </motion.div>
          ) : null}

          {/* Video Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-secondary" />
            </div>
          ) : videos.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <VideoCard
                    video={video}
                    onClick={() => setSelectedVideo(video)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 glass-effect rounded-xl border border-border"
            >
              <p className="text-muted-foreground text-lg">
                {t('videos.no_videos')}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {t('videos.try_adjusting_search')}
              </p>
            </motion.div>
          )}
        </div>

        {/* Video Player Modal */}
        <Dialog
          open={!!selectedVideo}
          onOpenChange={() => setSelectedVideo(null)}
        >
          <DialogContent className="max-w-4xl glass-effect border border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {selectedVideo?.title}
              </DialogTitle>
            </DialogHeader>

            {selectedVideo && (
              <div className="space-y-4">
                {/* Video Player Mockup */}
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                  {selectedVideo.url ? (
                    <iframe
                      src={selectedVideo.url.replace("watch?v=", "embed/")}
                      title={selectedVideo.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <>
                      <img
                        src={selectedVideo.thumbnail}
                        alt={selectedVideo.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl"
                        >
                          {isPlaying ? (
                            <Pause className="w-10 h-10 text-primary" />
                          ) : (
                            <Play className="w-10 h-10 text-primary ml-1" />
                          )}
                        </motion.button>
                      </div>
                    </>
                  )}
                  {/* ... (keeping player controls simplified or removed if iframe used) ... */}
                </div>

                {/* Video Info */}
                <div className="glass-effect rounded-xl p-4 border border-border">
                  <p className="text-muted-foreground mb-4">
                    {selectedVideo.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {selectedVideo.views.toLocaleString()}{" "}
                      {t('videos.views')}
                    </span>
                    <span>•</span>
                    <span>{selectedVideo.category}</span>
                    <span>•</span>
                    <span>{t('videos.duration')}: {selectedVideo.duration}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}