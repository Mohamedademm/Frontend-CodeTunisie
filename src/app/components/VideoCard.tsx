import { motion } from 'motion/react';
import { Play, Eye, Heart } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Video } from '@/app/types';
import { getYouTubeId } from '@/lib/utils';

interface VideoCardProps {
  video: Video;
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

export function VideoCard({ video, onClick, isFavorite, onToggleFavorite }: VideoCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
    >
      <div
        className="h-full relative overflow-hidden rounded-xl bg-card border border-white/5 hover:border-white/10 shadow-lg hover:shadow-2xl transition-all duration-500 group"
        onClick={onClick}
      >
        <div className="relative aspect-video overflow-hidden">
          {video.thumbnail || getYouTubeId(video.url) ? (
            <img
              src={video.thumbnail || `https://img.youtube.com/vi/${getYouTubeId(video.url)}/mqdefault.jpg`}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
              <Play className="w-12 h-12 text-white/20" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl">
              <Play className="w-7 h-7 text-white fill-current" />
            </div>
          </div>

          <div className="absolute top-3 right-3 flex gap-2">
            {onToggleFavorite && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onToggleFavorite}
                className={`p-2 rounded-full backdrop-blur-md border border-white/10 transition-colors ${isFavorite
                  ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/20'
                  : 'bg-black/40 text-white hover:bg-white/10'
                  }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </motion.button>
            )}
            <Badge className="bg-black/60 backdrop-blur-md text-white border-white/10 h-8 px-3 font-medium">
              {video.duration}
            </Badge>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-semibold text-lg leading-tight text-white group-hover:text-primary transition-colors line-clamp-2">
              {video.title}
            </h3>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-400">
            <Badge variant="outline" className="text-xs px-2 py-0.5 h-6 bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20">
              {video.category}
            </Badge>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {(video.views || 0).toLocaleString()}
            </span>
          </div>

          {(video.progress || 0) > 0 && (
            <div className="mt-2 space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progression</span>
                <span className="text-secondary font-medium">{video.progress}%</span>
              </div>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary transition-all duration-500"
                  style={{ width: `${video.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}