import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Sparkles, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { CourseCard } from '@/app/components/CourseCard';
import { courseCategories } from '@/app/data/mockData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip';
import { courseService } from '@/services/courseService';
import { Course } from '@/app/types';

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, searchQuery]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await courseService.getCourses({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
      });
      setCourses(data);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(t('courses.error_loading'));
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
              <Sparkles className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">{t('courses.title')}</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              {t('courses.subtitle')}
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-effect rounded-xl shadow-md p-6 mb-8 border border-border"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder={t('courses.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-input-background border-border focus:border-primary transition-colors text-right-rtl"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SelectTrigger className="w-full md:w-64 bg-input-background border-border">
                      <Filter className="w-4 h-4 mr-2 text-primary" />
                      <SelectValue placeholder={t('courses.category_placeholder')} />
                    </SelectTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('courses.filter_tooltip')}</p>
                  </TooltipContent>
                </Tooltip>
                <SelectContent>
                  {courseCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}

          {/* Stats (calculated from fetched data) */}
          {!isLoading && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <motion.div
                whileHover={{ y: -3 }}
                className="glass-effect rounded-xl p-4 shadow-md border border-border"
              >
                <div className="text-2xl font-bold bg-clip-text text-transparent gradient-primary">{courses.length}</div>
                <div className="text-sm text-muted-foreground">{t('courses.stats.available')}</div>
              </motion.div>
              <motion.div
                whileHover={{ y: -3 }}
                className="glass-effect rounded-xl p-4 shadow-md border border-border"
              >
                <div className="text-2xl font-bold text-success">
                  {courses.filter(c => c.progress === 100).length}
                </div>
                <div className="text-sm text-muted-foreground">{t('courses.stats.completed')}</div>
              </motion.div>
              <motion.div
                whileHover={{ y: -3 }}
                className="glass-effect rounded-xl p-4 shadow-md border border-border"
              >
                <div className="text-2xl font-bold text-warning">
                  {courses.filter(c => (c.progress || 0) > 0 && (c.progress || 0) < 100).length}
                </div>
                <div className="text-sm text-muted-foreground">{t('courses.stats.in_progress')}</div>
              </motion.div>
              <motion.div
                whileHover={{ y: -3 }}
                className="glass-effect rounded-xl p-4 shadow-md border border-border"
              >
                <div className="text-2xl font-bold text-accent flex items-center gap-1">
                  <TrendingUp className="w-5 h-5" />
                  {courses.length > 0 ? Math.round(courses.reduce((acc, c) => acc + (c.progress || 0), 0) / courses.length) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">{t('courses.stats.global_progress')}</div>
              </motion.div>
            </motion.div>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : courses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CourseCard
                    course={course}
                    onClick={() => {
                      // Navigate to course detail
                      navigate(`/courses/${course.id}`);
                    }}
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
              <p className="text-muted-foreground text-lg">{t('courses.no_courses')}</p>
              <p className="text-sm text-muted-foreground mt-2">{t('courses.try_adjusting_filters')}</p>
            </motion.div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}