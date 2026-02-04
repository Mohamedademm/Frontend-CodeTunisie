import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Clock,
  FileText,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  BookMarked,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Separator } from '@/app/components/ui/separator';
import { articleService, Article } from '@/services/articleService';

interface ArticleDetailProps {
  articleNumber: number;
}

export function ArticleDetail({ articleNumber }: ArticleDetailProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullText, setShowFullText] = useState(false);
  const [expandedDefs, setExpandedDefs] = useState<number[]>([]);

  useEffect(() => {
    fetchArticle();
  }, [articleNumber]);

  const fetchArticle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await articleService.getArticle(articleNumber);
      setArticle(data);
      setShowFullText(false);
      setExpandedDefs([]);
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('فشل في تحميل الفصل. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDefinition = (index: number) => {
    setExpandedDefs((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'intermediate':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      case 'advanced':
        return 'bg-red-500/10 text-red-600 dark:text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'مبتدئ';
      case 'intermediate':
        return 'متوسط';
      case 'advanced':
        return 'متقدم';
      default:
        return difficulty;
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardContent className="py-16">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">جاري تحميل الفصل...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !article) {
    return (
      <Card className="border-border">
        <CardContent className="py-16">
          <div className="text-center">
            <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4 text-lg">{error || 'الفصل غير موجود'}</p>
            <Button onClick={fetchArticle} variant="outline" size="lg">
              إعادة المحاولة
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      key={articleNumber}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      dir="rtl"
    >
      <Card className="border-border overflow-hidden">
        {/* Header */}
        <CardHeader className="bg-gradient-to-l from-primary/10 via-primary/5 to-transparent border-b border-border pb-6">
          <div className="space-y-4">
            {/* Top row - badges */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1">
                  الفصل {article.article_number}
                </Badge>
                <Badge className={`text-sm px-3 py-1 ${getDifficultyColor(article.learning_metadata?.difficulty_level)}`}>
                  {getDifficultyLabel(article.learning_metadata?.difficulty_level)}
                </Badge>
              </div>
              {article.metadata?.url && (
                <a
                  href={article.metadata.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  المصدر الرسمي
                </a>
              )}
            </div>

            {/* Title */}
            <CardTitle className="text-2xl md:text-3xl font-bold">{article.title}</CardTitle>
            <p className="text-muted-foreground">{article.document_name}</p>

            {/* Meta stats */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
              <span className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1">
                <Clock className="w-4 h-4" />
                {article.learning_metadata?.estimated_study_time_minutes} دقائق
              </span>
              <span className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1">
                <FileText className="w-4 h-4" />
                {article.content?.word_count} كلمة
              </span>
              {article.definition_count > 0 && (
                <span className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1">
                  <BookMarked className="w-4 h-4" />
                  {article.definition_count} تعريف
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          {/* Full Text Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold">نص الفصل</h3>
            </div>
            
            <div className="bg-muted/30 rounded-xl p-6 border border-border">
              <div className={`text-foreground text-lg leading-loose ${!showFullText && article.content?.full_text?.length > 500 ? 'line-clamp-6' : ''}`}>
                {article.content?.full_text}
              </div>
              
              {article.content?.full_text?.length > 500 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullText(!showFullText)}
                  className="w-full mt-4 text-primary hover:text-primary hover:bg-primary/10"
                >
                  {showFullText ? (
                    <>
                      <ChevronUp className="w-4 h-4 ml-2" />
                      عرض أقل
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 ml-2" />
                      عرض النص كاملاً
                    </>
                  )}
                </Button>
              )}
            </div>
          </section>

          {/* Definitions Section */}
          {article.definitions && article.definitions.length > 0 && (
            <section>
              <Separator className="mb-8" />
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <BookMarked className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="text-xl font-bold">التعريفات القانونية</h3>
                <Badge variant="secondary" className="mr-auto">
                  {article.definitions.length} تعريف
                </Badge>
              </div>

              <div className="grid gap-3">
                {article.definitions.map((def, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <button
                      onClick={() => toggleDefinition(index)}
                      className="w-full text-right"
                    >
                      <div
                        className={`rounded-xl border transition-all duration-200 ${
                          expandedDefs.includes(index)
                            ? 'bg-primary/5 border-primary/30 shadow-sm'
                            : 'bg-card border-border hover:border-primary/30 hover:bg-muted/30'
                        }`}
                      >
                        <div className="p-4 flex items-center justify-between gap-4">
                          <ChevronDown
                            className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${
                              expandedDefs.includes(index) ? 'rotate-180' : ''
                            }`}
                          />
                          <span className="font-bold text-primary text-lg">{def.term}</span>
                        </div>
                        
                        {expandedDefs.includes(index) && (
                          <div className="px-4 pb-4 pt-0">
                            <div className="bg-background/50 rounded-lg p-4 border-t border-border/50">
                              <p className="text-muted-foreground leading-relaxed text-base">
                                {def.definition}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Referenced Articles */}
          {article.structure?.referenced_articles && article.structure.referenced_articles.length > 0 && (
            <section>
              <Separator className="mb-8" />
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-xl font-bold">فصول مرتبطة</h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {article.structure.referenced_articles.map((ref) => (
                  <Badge
                    key={ref}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 hover:border-primary text-base px-4 py-2"
                  >
                    الفصل {ref}
                  </Badge>
                ))}
              </div>
            </section>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ArticleDetail;
