import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  BookOpen,
  Clock,
  Filter,
  ChevronRight,
  Loader2,
  AlertCircle,
  Scale,
  GraduationCap,
} from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { ArticleDetail } from '@/app/components/ArticleDetail';
import { AIAssistant } from '@/app/components/AIAssistant';
import { articleService, ArticleSummary } from '@/services/articleService';

export function LawArticlesPage() {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<ArticleSummary[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [searchQuery, difficultyFilter, articles]);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await articleService.getArticles();
      setArticles(data);
      setFilteredArticles(data);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('فشل في تحميل المقالات. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = [...articles];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.description?.toLowerCase().includes(query) ||
          article.article_number.toString().includes(query)
      );
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(
        (article) => article.difficulty_level === difficultyFilter
      );
    }

    setFilteredArticles(filtered);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-success/10 text-success border-success/20';
      case 'intermediate':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'advanced':
        return 'bg-destructive/10 text-destructive border-destructive/20';
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">جاري تحميل مجلة الطرقات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchArticles}>إعادة المحاولة</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Scale className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">مجلة الطرقات</h1>
              <p className="text-muted-foreground">قانون المرور التونسي</p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground mt-2">
            تصفح جميع فصول مجلة الطرقات واطرح أسئلتك على المساعد الذكي
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <Card className="glass-effect border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{articles.length}</p>
                  <p className="text-sm text-muted-foreground">فصل قانوني</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-secondary/10">
                  <GraduationCap className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {articles.reduce((sum, a) => sum + (a.definition_count || 0), 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">تعريف قانوني</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {Math.round(articles.reduce((sum, a) => sum + (a.estimated_study_time_minutes || 5), 0) / 60)}
                  </p>
                  <p className="text-sm text-muted-foreground">ساعات دراسة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Articles List - Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="glass-effect border-border sticky top-24">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="w-5 h-5 text-primary" />
                  قائمة الفصول
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Search and Filters */}
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="ابحث عن فصل..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10 text-right"
                    />
                  </div>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="w-full">
                      <Filter className="w-4 h-4 ml-2" />
                      <SelectValue placeholder="مستوى الصعوبة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المستويات</SelectItem>
                      <SelectItem value="beginner">مبتدئ</SelectItem>
                      <SelectItem value="intermediate">متوسط</SelectItem>
                      <SelectItem value="advanced">متقدم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Articles List */}
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2 pl-2">
                    <AnimatePresence mode="popLayout">
                      {filteredArticles.map((article, index) => (
                        <motion.div
                          key={article.article_number}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.02 }}
                        >
                          <button
                            onClick={() => setSelectedArticle(article.article_number)}
                            className={`w-full text-right p-3 rounded-lg transition-all duration-200 border ${
                              selectedArticle === article.article_number
                                ? 'bg-primary/10 border-primary shadow-sm'
                                : 'bg-card hover:bg-muted/50 border-border hover:border-primary/30'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <ChevronRight
                                className={`w-4 h-4 text-muted-foreground transition-transform ${
                                  selectedArticle === article.article_number ? 'rotate-90' : ''
                                }`}
                              />
                              <span className="font-semibold text-foreground">
                                {article.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 justify-end">
                              <Badge
                                variant="outline"
                                className={`text-xs ${getDifficultyColor(article.difficulty_level)}`}
                              >
                                {getDifficultyLabel(article.difficulty_level)}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {article.estimated_study_time_minutes} د
                              </span>
                            </div>
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>

                {filteredArticles.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>لم يتم العثور على نتائج</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Article Detail & AI Assistant - Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            {selectedArticle ? (
              <>
                <ArticleDetail articleNumber={selectedArticle} />
                <AIAssistant currentArticleNumber={selectedArticle} />
              </>
            ) : (
              <Card className="glass-effect border-border">
                <CardContent className="py-16">
                  <div className="text-center">
                    <BookOpen className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      اختر فصلاً للبدء
                    </h3>
                    <p className="text-muted-foreground">
                      اختر أحد الفصول من القائمة لعرض محتواه والتحدث مع المساعد الذكي
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default LawArticlesPage;
