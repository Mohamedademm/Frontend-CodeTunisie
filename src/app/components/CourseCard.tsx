import { motion } from 'motion/react';
import { Clock, BookOpen, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { Badge } from '@/app/components/ui/badge';
import { Course } from '@/app/types';
import * as LucideIcons from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onClick: () => void;
}

export function CourseCard({ course, onClick }: CourseCardProps) {
  const IconComponent = (LucideIcons as any)[
    course.icon.split('-').map((word: string) => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')
  ] || BookOpen;

  const difficultyColors = {
    facile: 'bg-success-light text-success border-success/20',
    moyen: 'bg-warning-light text-warning border-warning/20',
    difficile: 'bg-destructive-light text-destructive border-destructive/20',
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
    >
      <Card 
        className="h-full cursor-pointer border-border hover:border-primary/50 transition-all overflow-hidden group relative bg-card shadow-md hover:shadow-colored"
        onClick={onClick}
      >
        <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-secondary group-hover:h-2 transition-all"></div>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <motion.div 
              className="p-3 gradient-primary rounded-xl shadow-colored"
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <IconComponent className="w-6 h-6 text-white" />
            </motion.div>
            <Badge className={`${difficultyColors[course.difficulty]} border`}>
              {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
            </Badge>
          </div>

          <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {course.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-primary" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-secondary" />
              <span>{course.lessons} leçons</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progression</span>
              <motion.span 
                className="font-semibold text-primary"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
              >
                {course.progress}%
              </motion.span>
            </div>
            <Progress value={course.progress} className="h-2.5" />
          </div>
          
          {course.progress === 100 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-xs text-success font-medium flex items-center gap-1"
            >
              <TrendingUp className="w-3 h-3" />
              Cours terminé !
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}