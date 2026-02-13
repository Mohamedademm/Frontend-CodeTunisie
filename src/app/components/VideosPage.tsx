import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useTranslation } from 'react-i18next';
import {
  Search,
  Sparkles,
  Video as VideoIcon,
  AlertCircle,
  Heart,
  Share2,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { getYouTubeId } from "@/lib/utils";
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
  DialogDescription,
} from "@/app/components/ui/dialog";
import { Video } from "@/app/types";
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
  const [isMuted, setIsMuted] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const saved = localStorage.getItem('favoriteVideos');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation();
    const newFavorites = favorites.includes(videoId)
      ? favorites.filter(id => id !== videoId)
      : [...favorites, videoId];

    setFavorites(newFavorites);
    localStorage.setItem('favoriteVideos', JSON.stringify(newFavorites));
    toast.success(favorites.includes(videoId) ? "Retiré des favoris" : "Ajouté aux favoris");
  };

  const handleShare = () => {
    if (!selectedVideo) return;
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Lien copié !");
  };

  const relatedVideos = selectedVideo
    ? videos.filter(v => v.category === selectedVideo.category && v.id !== selectedVideo.id).slice(0, 3)
    : [];

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
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center space-y-4"
        >
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Bibliothèque Vidéo Premium</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
              {t('videos.title')}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('videos.subtitle')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary/50 to-primary/50 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative flex items-center bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-2 shadow-2xl">
              <Search className="w-6 h-6 text-muted-foreground ml-4" />
              <Input
                placeholder={t('videos.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-none bg-transparent shadow-none focus-visible:ring-0 text-lg placeholder:text-muted-foreground/50 h-12"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {videoCategories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-6 h-10 transition-all duration-300 ${selectedCategory === category
                ? "bg-secondary text-secondary-foreground shadow-lg shadow-secondary/25 scale-105"
                : "bg-background/50 backdrop-blur border-white/10 hover:bg-white/10 hover:border-white/20"
                }`}
            >
              {category}
            </Button>
          ))}
          <Button
            variant={selectedCategory === 'favorites' ? "default" : "outline"}
            onClick={() => setSelectedCategory('favorites')}
            className={`rounded-full px-6 h-10 transition-all duration-300 gap-2 ${selectedCategory === 'favorites'
              ? "bg-red-500 text-white shadow-lg shadow-red-500/25 scale-105"
              : "bg-background/50 backdrop-blur border-white/10 hover:bg-white/10 hover:border-white/20"
              }`}
          >
            <Heart className={`w-4 h-4 ${selectedCategory === 'favorites' ? 'fill-current' : ''}`} />
            Favoris
          </Button>
        </motion.div>

        {error && (
          <div className="mb-8 p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12 max-w-4xl mx-auto"
          >
            {[
              { label: t('videos.stats.available'), value: videos.length, icon: VideoIcon, color: "text-blue-400" },
              { label: t('videos.stats.completed'), value: videos.filter((v) => v.progress === 100).length, icon: Sparkles, color: "text-green-400" },
              { label: t('videos.stats.total_views'), value: videos.length > 0 ? videos.reduce((acc, v) => acc + (v.views || 0), 0).toLocaleString() : 0, icon: Loader2, color: "text-purple-400" }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5, scale: 1.02 }}
                className="relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <stat.icon className="w-16 h-16" />
                </div>
                <div className={`text-4xl font-bold mb-1 ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

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

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-secondary" />
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  isFavorite={favorites.includes(video.id || video._id || '')}
                  onToggleFavorite={(e) => toggleFavorite(e, video.id || video._id || '')}
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

      <Dialog
        open={!!selectedVideo}
        onOpenChange={() => setSelectedVideo(null)}
      >
        <DialogContent className="max-w-4xl glass-effect border border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {selectedVideo?.title}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {selectedVideo?.description || "Aperçu de la vidéo"}
            </DialogDescription>
          </DialogHeader>

          {selectedVideo && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                {selectedVideo.url ? (
                  <div className="w-full h-full">
                    {(selectedVideo.videoType === 'upload' || selectedVideo.url.startsWith('/uploads')) ? (
                      <video
                        controls
                        autoPlay
                        className="w-full h-full"
                        controlsList="nodownload"
                      >
                        <source
                          src={selectedVideo.url.startsWith('http')
                            ? selectedVideo.url
                            : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}${selectedVideo.url}`
                          }
                          type="video/mp4"
                        />
                        Votre navigateur ne supporte pas la lecture de vidéos.
                      </video>
                    ) : getYouTubeId(selectedVideo.url) ? (
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${getYouTubeId(selectedVideo.url)}?rel=0`}
                        title={selectedVideo.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      ></iframe>
                    ) : (
                      <div className="flex items-center justify-center h-full text-white bg-gray-900 flex-col gap-2">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                        <p>Format vidéo non supporté ou URL invalide</p>
                        <p className="text-xs text-gray-500">{selectedVideo.url}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <p>URL vidéo non disponible</p>
                  </div>
                )}
              </div>

              <div className="glass-effect rounded-xl p-4 border border-border">
                <p className="text-muted-foreground mb-4">
                  {selectedVideo.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    {(selectedVideo.views || 0).toLocaleString()} {t('videos.views')}
                  </span>
                  <span>•</span>
                  <span>{selectedVideo.category}</span>
                  <span>•</span>
                  <span>{t('videos.duration')}: {selectedVideo.duration}</span>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                  <Button variant="outline" size="sm" onClick={(e) => toggleFavorite(e, selectedVideo.id || selectedVideo._id || '')} className="gap-2">
                    <Heart className={`w-4 h-4 ${favorites.includes(selectedVideo.id || selectedVideo._id || '') ? 'fill-red-500 text-red-500' : ''}`} />
                    {favorites.includes(selectedVideo.id || selectedVideo._id || '') ? 'Retiré' : 'Favoris'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                    <Share2 className="w-4 h-4" />
                    Partager
                  </Button>
                </div>
              </div>

              {relatedVideos.length > 0 && (
                <div className="space-y-3 pt-4">
                  <h4 className="font-semibold text-lg">Vidéos similaires</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {relatedVideos.map(video => (
                      <div key={video.id} onClick={() => setSelectedVideo(video)} className="cursor-pointer group">
                        <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
                          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 rounded text-xs text-white">{video.duration}</div>
                        </div>
                        <h5 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">{video.title}</h5>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}