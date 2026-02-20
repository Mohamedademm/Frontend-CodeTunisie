import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, Clock, Save, LayoutGrid, AlertCircle, Volume2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Test, Question } from '@/app/types';
import { testService } from '@/services/testService';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { TestResults } from './TestResults';
import { TestSubmissionResponse } from '@/services/testService';
import { useTTS } from '@/hooks/useTTS';
import { Switch } from '@/app/components/ui/switch';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/app/components/ui/sheet";

export function TestTakingPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [test, setTest] = useState<Test | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>([]); // Array of selected indices
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Timer state
    const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    const [view, setView] = useState<'intro' | 'quiz' | 'results'>('intro');
    const [submissionResult, setSubmissionResult] = useState<TestSubmissionResponse | null>(null);

    // TTS State
    const [autoRead, setAutoRead] = useState(true); // Default to Auto-read ON
    const { speak, cancel, isSpeaking, isSupported } = useTTS({ language: 'ar-TN' });

    // Auto-read effect
    useEffect(() => {
        if (view === 'quiz' && autoRead && questions[currentQuestionIndex]) {
            const q = questions[currentQuestionIndex];

            // Construct text with natural Arabic pauses/flow
            // "السؤال: [Question]. الإجابات: [Option 1]. [Option 2]..."
            // Using slightly longer pauses (commas/periods) for TTS engine
            const textToRead = `السؤال: ${q.question}.  الإجابات:  ${q.options.join('.  ')}`;

            // Small delay to allow transition animation to finish before speaking
            const timer = setTimeout(() => speak(textToRead), 700);
            return () => clearTimeout(timer);
        } else if (!autoRead) {
            cancel();
        }
    }, [currentQuestionIndex, autoRead, view, questions]);

    // Stop speaking when leaving quiz view
    useEffect(() => {
        if (view !== 'quiz') cancel();
    }, [view]);

    useEffect(() => {
        if (id) {
            fetchTestDetails(id);
        }
    }, [id]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleFinishTest(); // Auto submit
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timeLeft]);

    const fetchTestDetails = async (testId: string) => {
        try {
            setIsLoading(true);
            const data = await testService.getTestById(testId);
            setTest(data);
            if (data.questions && Array.isArray(data.questions)) {
                setQuestions(data.questions as Question[]);
                setAnswers(new Array(data.questions.length).fill(null));
                // Initialize timer (minutes to seconds)
                setTimeLeft((data.duration || 30) * 60);
            }
        } catch (error) {
            console.error('Error loading test:', error);
            toast.error(t('tests.error_loading'));
            navigate('/tests');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStart = () => {
        setView('quiz');
        setIsTimerRunning(true);
    };

    const handleAnswerSelect = (optionIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = optionIndex;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleFinishTest = async () => {
        setIsTimerRunning(false);
        setIsSubmitting(true);

        try {
            // Submit to backend
            if (test) {
                // Fix: Map answers to the format expected by the backend [{ questionId, selectedAnswer }]
                const formattedAnswers = questions.map((q, idx) => {
                    const ans = answers[idx];
                    if (ans !== null && ans !== undefined) {
                        return {
                            questionId: q._id as string,
                            selectedAnswer: ans
                        };
                    }
                    return null;
                }).filter(a => a !== null);

                // Use backend calculated score/status
                const response = await testService.submitTest({
                    testId: test.id,
                    answers: formattedAnswers,
                    timeTaken: (test.duration || 0) * 60 - timeLeft
                });

                setSubmissionResult(response);
            }

            setView('results');
        } catch (error) {
            console.error('Error submitting test:', error);
            toast.error(t('courses.error_loading') || "Erreur lors de l'envoi des résultats");
            setView('results');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (isLoading || !test) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // INTRO VIEW
    if (view === 'intro') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <Card className="border-none shadow-xl dark:bg-gray-800">
                        <CardContent className="p-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
                                <Clock className="w-10 h-10" />
                            </div>

                            <h1 className="text-3xl font-bold dark:text-white">{test.title}</h1>
                            <p className="text-gray-600 dark:text-gray-300 text-lg">{test.description}</p>

                            <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-100 dark:border-gray-700">
                                <div>
                                    <div className="text-sm text-gray-500">{t('common.duration')}</div>
                                    <div className="font-bold text-lg dark:text-white">{test.duration} min</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">{t('common.questions')}</div>
                                    <div className="font-bold text-lg dark:text-white">{questions.length}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">{t('tests.pass_score')}</div>
                                    <div className="font-bold text-lg dark:text-white">{test.passThreshold}%</div>
                                </div>
                            </div>

                            <div className="flex gap-4 justify-center">
                                <Button variant="outline" onClick={() => navigate('/tests')}>
                                    {t('common.cancel')}
                                </Button>
                                <Button onClick={handleStart} className="px-8 text-lg h-12">
                                    {t('common.start')}
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mt-4">
                                {t('tests.timer_warning')}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // QUIZ VIEW
    if (view === 'quiz') {
        const question = questions[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
                {/* Top Bar with Timer */}
                <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 transition-colors duration-300">
                    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="font-bold text-lg truncate max-w-[150px] md:max-w-[300px] dark:text-white transition-colors">{test.title}</div>

                            {/* TTS Controls */}
                            {isSupported && (
                                <div className="hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full shadow-sm">
                                    <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-primary animate-pulse' : 'text-gray-500'}`} />

                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium whitespace-nowrap hidden md:inline-block">Lecture auto</span>
                                            <Switch
                                                checked={autoRead}
                                                onCheckedChange={setAutoRead}
                                                className="scale-75 data-[state=checked]:bg-primary"
                                            />
                                        </div>

                                        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-xs hover:bg-white dark:hover:bg-gray-600 rounded-full"
                                            onClick={() => {
                                                const q = questions[currentQuestionIndex];
                                                const textToRead = `السؤال: ${q.question}.  الإجابات:  ${q.options.join('.  ')}`;
                                                speak(textToRead);
                                            }}
                                            title="Tout relire"
                                        >
                                            Relire tout
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Question Navigator */}
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm" className="hidden md:flex gap-2">
                                        <LayoutGrid className="w-4 h-4" />
                                        {t('tests.overview')}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left">
                                    <SheetHeader>
                                        <SheetTitle>{t('tests.overview_title')}</SheetTitle>
                                        <SheetDescription>
                                            {t('tests.overview_desc')}
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="grid grid-cols-5 gap-2 mt-6">
                                        {questions.map((_, idx) => (
                                            <Button
                                                key={idx}
                                                variant={currentQuestionIndex === idx ? "default" : (answers[idx] !== null ? "secondary" : "outline")}
                                                className={`h-10 w-full ${answers[idx] !== null ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200' : ''}`}
                                                onClick={() => {
                                                    setCurrentQuestionIndex(idx);
                                                }}
                                            >
                                                {idx + 1}
                                            </Button>
                                        ))}
                                    </div>
                                    <div className="mt-8 space-y-2 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded bg-primary"></div>
                                            <span>Question actuelle</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></div>
                                            <span>Répondue</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded border border-input"></div>
                                            <span>Non répondue</span>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>

                        <motion.div
                            key={timeLeft < 60 ? 'urgent' : 'normal'}
                            animate={timeLeft < 60 ? { scale: [1, 1.1, 1], color: ['#ef4444', '#dc2626', '#ef4444'] } : {}}
                            transition={timeLeft < 60 ? { repeat: Infinity, duration: 1 } : {}}
                            className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-1 rounded-md ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-200'}`}
                        >
                            <Clock className="w-5 h-5" />
                            {formatTime(timeLeft)}
                        </motion.div>

                        <AlertDialog>
                            <AlertDialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                {t('common.quit')}
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('tests.confirm_quit')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t('tests.confirm_quit_msg')}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => navigate('/tests')} className="bg-red-600 hover:bg-red-700">
                                        {t('common.quit')}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    <Progress value={progress} className="h-1 rounded-none transition-all duration-500" />
                </div>

                {/* Question Area */}
                <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="space-y-8"
                        >
                            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                <span>Question {currentQuestionIndex + 1} / {questions.length}</span>
                                <Badge variant="outline" className="capitalize">{questions[currentQuestionIndex].category}</Badge>
                            </div>

                            <h2 dir="auto" className="text-2xl md:text-3xl font-bold dark:text-white leading-tight flex gap-3 items-start">
                                <span className="flex-1">{question.question}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => speak(question.question)}
                                    className="shrink-0 text-primary hover:bg-primary/10 rounded-full"
                                    title="Écouter la question"
                                >
                                    <Volume2 className="w-6 h-6" />
                                </Button>
                            </h2>

                            {(() => {
                                const img = question.image;
                                if (!img) return null;

                                // Robust handling for potential string 'undefined' or '[object Object]' or null/empty
                                const rawUrl = typeof img === 'string' ? img : img.url;

                                // If URL is empty, no image was uploaded - just hide
                                if (!rawUrl || rawUrl.trim() === '' || rawUrl === 'undefined') {
                                    return null;
                                }

                                // If URL is corrupted ([object Object]), show error to prompt re-upload
                                if (rawUrl === '[object Object]') {
                                    return (
                                        <div className="rounded-xl p-8 border-2 border-dashed border-red-300 bg-red-50 dark:bg-red-900/10 flex flex-col items-center justify-center text-red-500 gap-2">
                                            <AlertCircle className="w-8 h-8" />
                                            <p className="font-semibold">Image non valide</p>
                                            <p className="text-xs">Veuillez ré-uploader l'image dans l'éditeur</p>
                                        </div>
                                    );
                                }

                                let finalUrl = rawUrl;
                                if (!rawUrl.startsWith('http') && !rawUrl.startsWith('data:') && !rawUrl.startsWith('blob:')) {
                                    // Extract origin from API_BASE_URL (remove /api if present)
                                    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
                                    let baseUrl = apiBase;
                                    try {
                                        baseUrl = new URL(apiBase).origin;
                                    } catch (e) {
                                        baseUrl = apiBase.replace(/\/api\/?$/, '');
                                    }
                                    finalUrl = `${baseUrl}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
                                }

                                return (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700"
                                    >
                                        <img
                                            src={finalUrl}
                                            alt="Question context"
                                            className="w-full h-auto max-h-64 object-cover"
                                            onError={(e) => {
                                                console.error('❌ Image Load Error:', e.currentTarget.src);
                                                // Show fallback on error
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement?.classList.add('bg-gray-100', 'flex', 'items-center', 'justify-center', 'h-48');
                                                if (e.currentTarget.parentElement) {
                                                    e.currentTarget.parentElement.innerHTML = '<div class="text-center text-gray-400"><svg class="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Image non disponible</div>';
                                                }
                                            }}
                                        />
                                    </motion.div>
                                );
                            })()}

                            <div className="grid gap-4">
                                {question.options.map((option, idx) => {
                                    const isSelected = answers[currentQuestionIndex] === idx;
                                    return (
                                        <motion.div
                                            key={idx}
                                            whileHover={{ scale: 1.02, backgroundColor: isSelected ? undefined : "rgba(59, 130, 246, 0.05)" }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleAnswerSelect(idx)}
                                            className={`text-start p-6 rounded-xl border-2 transition-all duration-200 text-lg group flex items-start gap-4 w-full cursor-pointer ${isSelected
                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 dark:text-white shadow-md'
                                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 hover:border-blue-300 dark:hover:border-blue-500'
                                                }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center transition-colors ${isSelected ? 'border-blue-600 bg-blue-600 dark:border-blue-400 dark:bg-blue-400' : 'border-gray-300 dark:border-gray-600'
                                                }`}>
                                                {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2.5 h-2.5 bg-white rounded-full" />}
                                            </div>
                                            <div className="flex flex-1 items-center gap-3">
                                                <span dir="auto" className="flex-1 text-lg leading-relaxed">{option}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        speak(option);
                                                    }}
                                                    className="w-8 h-8 rounded-full opacity-50 hover:opacity-100 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 transition-all shrink-0"
                                                    title="Écouter l'option"
                                                >
                                                    <Volume2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Bottom Bar */}
                <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4 sticky bottom-0 z-10">
                    <div className="max-w-4xl mx-auto flex justify-between">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0}
                            className="px-6 transition-all hover:-translate-x-1"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> {t('common.previous')}
                        </Button>

                        {currentQuestionIndex === questions.length - 1 ? (
                            <AlertDialog>
                                <AlertDialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-9 px-8 shadow hover:scale-105">
                                    {isSubmitting ? t('common.loading') : t('common.finish')} <Save className="w-4 h-4 ml-2" />
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t('tests.confirm_submit_title')}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t('tests.confirm_submit_msg')}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleFinishTest} className="bg-green-600 hover:bg-green-700">
                                            {t('common.finish')}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        ) : (
                            <Button onClick={handleNext} className="px-8 transition-all hover:translate-x-1">
                                {t('common.next')} <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // RESULTS VIEW


    if (view === 'results' && submissionResult && test) {
        return (
            <TestResults
                results={submissionResult}
                testTitle={test.title}
                totalQuestions={questions.length}
            />
        );
    }

    return null;
}


