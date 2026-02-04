import { motion } from 'motion/react';
import { Play, Clock, Eye } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { Badge } from '@/app/components/ui/badge';
import { Video } from '@/app/types';

interface VideoCardProps {
  video: Video;
  onClick: () => void;
}

export function VideoCard({ video, onClick }: VideoCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
    >
      <Card 
        className="h-full cursor-pointer border-border hover:border-secondary/50 transition-all overflow-hidden group bg-card shadow-md hover:shadow-colored"
        onClick={onClick}
      >
        <div className="relative overflow-hidden aspect-video bg-muted">
          <img 
            src={video.thumbnail} 
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/70 transition-all">
          </div>
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 1, opacity: 0.9 }}
            whileHover={{ scale: 1.15, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <div className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm">
              <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
            </div>
          </motion.div>
          <div className="absolute top-3 right-3">
            <Badge className="bg-black/70 text-white border-white/20 backdrop-blur-sm">
              <Clock className="w-3 h-3 mr-1" />
              {video.duration}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          <Badge className="mb-2 bg-secondary-light text-secondary border border-secondary/20">
            {video.category}
          </Badge>
          
          <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-secondary transition-colors line-clamp-2">
            {video.title}
          </h3>
          
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {video.description}
          </p>

          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4 text-secondary" />
              <span>{video.views.toLocaleString()} vues</span>
            </div>
          </div>

          {video.progress > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progression</span>
                <motion.span 
                  className="font-semibold text-secondary"
                  whileHover={{ scale: 1.1 }}
                >
                  {video.progress}%
                </motion.span>
              </div>
              <Progress value={video.progress} className="h-1.5" />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}