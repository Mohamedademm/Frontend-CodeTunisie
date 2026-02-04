import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, BookOpen, Star, Share2, CheckCircle, PlayCircle, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Separator } from '@/app/components/ui/separator';
import { courseService } from '@/services/courseService';
import { Course } from '@/app/types';
import { useTranslation } from 'react-i18next';

export function CourseDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchCourse(id);
        }
    }, [id]);

    const fetchCourse = async (courseId: string) => {
        try {
            setIsLoading(true);
            const data = await courseService.getCourseById(courseId);
            setCourse(data);
        } catch (err) {
            console.error('Error fetching course:', err);
            setError(t('courses.error_loading_details'));
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
                <h2 className="text-2xl font-bold mb-4">{error || t('courses.not_found')}</h2>
                <Button onClick={() => navigate('/courses')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('courses.back_to_list')}
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-12">
            {/* Hero Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-950 text-white py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 opacity-10 pattern-grid-lg"></div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto relative z-10"
                >
                    <Button
                        variant="ghost"
                        className="text-white mb-6 hover:bg-white/10 p-0 hover:text-white"
                        onClick={() => navigate('/courses')}
                    >
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        {t('courses.back_to_list')}
                    </Button>

                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                            {/* Icon placeholder or dynamic icon */}
                            <BookOpen className="w-12 h-12 text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <Badge className="bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 border-blue-400/30">
                                    {t(`categories.${course.category}`)}
                                </Badge>
                                {course.isPremium && (
                                    <Badge className="bg-yellow-500/20 text-yellow-100 border-yellow-400/30 gap-1">
                                        <Star className="w-3 h-3 fill-current" /> Premium
                                    </Badge>
                                )}
                                <div className="flex items-center text-sm text-blue-100">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {course.duration}
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{course.title}</h1>
                            <p className="text-lg text-blue-100 max-w-2xl">{course.description}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-2 space-y-8"
                    >
                        <div className="bg-card rounded-xl shadow-sm border border-border p-6 md:p-8">
                            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: course.content }}></div>

                            <Separator className="my-8" />

                            <div className="flex justify-between items-center">
                                <Button variant="outline" onClick={() => navigate('/courses')}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    {t('courses.back_to_list')}
                                </Button>
                                <Button onClick={() => navigate('/tests')}>
                                    {t('common.take_test')}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Progress Card */}
                        <div className="bg-card rounded-xl shadow-sm border border-border p-6 sticky top-24">
                            <h3 className="text-lg font-semibold mb-4">{t('courses.your_progress')}</h3>

                            <div className="mb-2 flex justify-between text-sm">
                                <span>{course.progress || 0}% {t('common.completed')}</span>
                            </div>
                            <Progress value={course.progress || 0} className="h-2 mb-6" />

                            <div className="space-y-4">
                                <Button className="w-full gap-2" size="lg">
                                    {course.progress && course.progress > 0 ? t('common.continue') : t('common.start')}
                                    <PlayCircle className="w-5 h-5" />
                                </Button>

                                {course.isPremium && !course.isUnlocked && ( // Assuming isUnlocked logic exists or handled by backend wrapper
                                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                        <div className="flex items-start gap-3">
                                            <Lock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                                            <div>
                                                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 text-sm mb-1">{t('premium.required_title')}</h4>
                                                <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">{t('premium.required_desc')}</p>
                                                <Button variant="outline" size="sm" className="w-full border-yellow-300 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-800" onClick={() => navigate('/premium')}>
                                                    {t('premium.upgrade_now')}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Separator className="my-6" />

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>{course.lessons || 1} {t('courses.lessons_count')}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <Share2 className="w-4 h-4" />
                                    <button className="hover:text-primary transition-colors">{t('common.share')}</button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
