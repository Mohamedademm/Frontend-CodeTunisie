import { motion } from 'motion/react';
import { FileText, Clock, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Test } from '@/app/types';

interface TestCardProps {
  test: Test;
  onStart: () => void;
}

export function TestCard({ test, onStart }: TestCardProps) {
  const difficultyColors = {
    facile: 'bg-success-light text-success border-success/20',
    moyen: 'bg-warning-light text-warning border-warning/20',
    difficile: 'bg-destructive-light text-destructive border-destructive/20',
  };

  const getStatusBadge = () => {
    if (test.passed === true) {
      return (
        <Badge className="bg-success-light text-success border border-success/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          Réussi - {test.score}%
        </Badge>
      );
    }
    if (test.passed === false && test.score !== undefined) {
      return (
        <Badge className="bg-destructive-light text-destructive border border-destructive/20">
          <XCircle className="w-3 h-3 mr-1" />
          Échoué - {test.score}%
        </Badge>
      );
    }
    if (test.progress > 0) {
      return (
        <Badge className="bg-primary-light text-primary border border-primary/20">
          En cours - {test.progress}%
        </Badge>
      );
    }
    return (
      <Badge className="bg-muted text-muted-foreground border border-border">
        <Sparkles className="w-3 h-3 mr-1" />
        Non commencé
      </Badge>
    );
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
    >
      <Card className="h-full border-border hover:border-success/50 transition-all overflow-hidden group bg-card shadow-md hover:shadow-colored">
        <div className="h-1.5 bg-gradient-to-r from-success via-secondary to-accent group-hover:h-2 transition-all"></div>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <motion.div 
              className="p-3 bg-gradient-to-br from-success to-secondary rounded-xl shadow-colored"
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <FileText className="w-6 h-6 text-white" />
            </motion.div>
            <Badge className={`${difficultyColors[test.difficulty]} border`}>
              {test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1)}
            </Badge>
          </div>

          <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-success transition-colors">
            {test.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {test.description}
          </p>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-warning" />
                  <span>{test.duration} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4 text-secondary" />
                  <span>{test.questions} questions</span>
                </div>
              </div>
            </div>

            {getStatusBadge()}
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              className="w-full gap-2 shadow-md hover:shadow-lg transition-all" 
              onClick={onStart}
              variant={test.progress > 0 ? 'outline' : 'default'}
            >
              {test.progress > 0 ? 'Continuer' : 'Commencer'}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}