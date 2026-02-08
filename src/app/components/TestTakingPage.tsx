import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, CheckCircle, XCircle, RotateCcw, Clock, Save, Home, LayoutGrid } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { PerfectScore } from '@/app/components/ui/PerfectScore';
import { Confetti } from '@/app/components/ui/Confetti';
import { Test, Question } from '@/app/types';
import { testService } from '@/services/testService';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
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

    // View state
    const [view, setView] = useState<'intro' | 'quiz' | 'results'>('intro');
    const [score, setScore] = useState(0);
    const [isPassed, setIsPassed] = useState(false);
    const [showPerfectScore, setShowPerfectScore] = useState(false);
    const [showReport, setShowReport] = useState(false);

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
            // Calculate score locally for immediate feedback
            let correctCount = 0;
            questions.forEach((q, idx) => {
                const userAnswer = answers[idx];
                if (userAnswer !== null) {
                    const isCorrect = typeof q.correctAnswer === 'number'
                        ? userAnswer === q.correctAnswer
                        : q.options[userAnswer] === q.correctAnswer;
                    if (isCorrect) correctCount++;
                }
            });

            const calculatedScore = Math.round((correctCount / questions.length) * 100);
            const passed = calculatedScore >= (test?.passThreshold || 70);

            setScore(calculatedScore);
            setIsPassed(passed);

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

                const result = await testService.submitTest({
                    testId: test.id,
                    answers: formattedAnswers,
                    timeTaken: (test.duration || 0) * 60 - timeLeft
                });

                // Use backend calculated score/status
                setScore(Math.round(result.score));
                setIsPassed(result.passed);
                if (Math.round(result.score) === 100) {
                    setShowPerfectScore(true);
                }

                // Update questions with the full data returned from server
                if (result.testAttempt && result.testAttempt.answers) {
                    const fullQuestions = result.testAttempt.answers.map((ans: any) => {
                        return {
                            ...ans.question,
                        };
                    });

                    const enrichedQuestions = questions.map(originalQ => {
                        const enriched = fullQuestions.find((fq: any) => fq._id === originalQ._id);
                        return enriched || originalQ;
                    });

                    setQuestions(enrichedQuestions);
                }
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

                            <h2 dir="auto" className="text-2xl md:text-3xl font-bold dark:text-white leading-tight">
                                {question.question}
                            </h2>

                            {question.image && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700"
                                >
                                    <img
                                        src={question.image.startsWith('http')
                                            ? question.image
                                            : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${question.image.startsWith('/') ? '' : '/'}${question.image}`}
                                        alt="Question context"
                                        className="w-full h-auto max-h-64 object-cover"
                                    />
                                </motion.div>
                            )}

                            <div className="grid gap-4">
                                {question.options.map((option, idx) => {
                                    const isSelected = answers[currentQuestionIndex] === idx;
                                    return (
                                        <motion.button
                                            key={idx}
                                            whileHover={{ scale: 1.02, backgroundColor: isSelected ? undefined : "rgba(59, 130, 246, 0.05)" }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleAnswerSelect(idx)}
                                            className={`text-start p-6 rounded-xl border-2 transition-all duration-200 text-lg group flex items-start gap-4 w-full ${isSelected
                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 dark:text-white shadow-md'
                                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 hover:border-blue-300 dark:hover:border-blue-500'
                                                }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center transition-colors ${isSelected ? 'border-blue-600 bg-blue-600 dark:border-blue-400 dark:bg-blue-400' : 'border-gray-300 dark:border-gray-600'
                                                }`}>
                                                {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2.5 h-2.5 bg-white rounded-full" />}
                                            </div>
                                            <span dir="auto" className="w-full">{option}</span>
                                        </motion.button>
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

    if (view === 'results') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 relative overflow-hidden">
                {showPerfectScore && <PerfectScore onContinue={() => setShowPerfectScore(false)} />}
                {isPassed && score < 100 && <Confetti />}

                <div className="max-w-3xl mx-auto space-y-6 relative z-10">
                    {/* Hero Score Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700"
                    >
                        <div className={`h-2 w-full ${isPassed ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div className="p-8 text-center space-y-6">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="relative inline-block"
                            >
                                <svg className="w-40 h-40 transform -rotate-90">
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="transparent"
                                        className="text-gray-100 dark:text-gray-700"
                                    />
                                    <motion.circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="transparent"
                                        strokeLinecap="round"
                                        className={isPassed ? 'text-green-500' : 'text-red-500'}
                                        initial={{ strokeDasharray: 440, strokeDashoffset: 440 }}
                                        animate={{ strokeDashoffset: 440 - (440 * score) / 100 }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-4xl font-bold dark:text-white">{score}%</span>
                                    <span className={`text-sm font-medium ${isPassed ? 'text-green-600' : 'text-red-500'}`}>
                                        {isPassed ? t('tests.passed') : t('tests.failed')}
                                    </span>
                                </div>
                            </motion.div>

                            <div>
                                <h1 className="text-3xl font-bold mb-2 dark:text-white">
                                    {isPassed ? t('tests.passed_title') : t('tests.failed_title')}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {isPassed ? t('tests.passed_msg') : t('tests.failed_msg')}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Next Steps / Modern Scenario */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="grid md:grid-cols-2 gap-4"
                    >
                        {/* Recommendation Card */}
                        <Card className="border-none shadow-lg dark:bg-gray-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                            <CardContent className="p-6">
                                <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                                    {t('tests.next_steps')}
                                </Badge>
                                <h3 className="text-xl font-bold mb-2 dark:text-white">
                                    {isPassed ? t('tests.next_step_success') : t('tests.next_step_fail')}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                                    {isPassed
                                        ? "Continuez sur votre lancée avec un test plus avancé pour consolider vos acquis."
                                        : "Prenez le temps de revoir les points clés du cours avant de réessayer."}
                                </p>
                                <Button
                                    className="w-full gap-2 shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5"
                                    size="lg"
                                    onClick={() => isPassed ? navigate('/tests') : navigate('/courses')}
                                >
                                    {isPassed ? (
                                        <>
                                            {t('tests.start_next_test')} <ArrowRight className="w-4 h-4" />
                                        </>
                                    ) : (
                                        <>
                                            <RotateCcw className="w-4 h-4" /> {t('tests.review_course')}
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <div className="space-y-4">
                            <Card className="border-none shadow-md hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800" onClick={() => setShowReport(!showReport)}>
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-300">
                                            <LayoutGrid className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="font-bold dark:text-white">{showReport ? t('tests.hide_full_report') : t('tests.view_full_report')}</div>
                                            <div className="text-sm text-gray-500">{questions.length} questions</div>
                                        </div>
                                    </div>
                                    <div className={`transform transition-transform ${showReport ? 'rotate-180' : ''}`}>
                                        <ArrowRight className="w-5 h-5 text-gray-400 rotate-90" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-md hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800" onClick={() => navigate('/dashboard')}>
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-300">
                                            <Home className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="font-bold dark:text-white">{t('tests.back_to_dashboard')}</div>
                                            <div className="text-sm text-gray-500">{t('common.home')}</div>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-400" />
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>

                    {/* Detailed Report (Collapsible) */}
                    <AnimatePresence>
                        {showReport && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4 overflow-hidden"
                            >
                                <h3 className="text-xl font-bold dark:text-white px-2 pt-4">{t('tests.detailed_corrections')}</h3>
                                {questions.map((q, idx) => {
                                    const userAnswer = answers[idx];
                                    const isCorrect = userAnswer !== null && (
                                        typeof q.correctAnswer === 'number'
                                            ? userAnswer === q.correctAnswer
                                            : q.options[userAnswer] === q.correctAnswer
                                    );

                                    return (
                                        <Card key={idx} className={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'} dark:bg-gray-800`}>
                                            <CardContent className="p-6">
                                                <div className="flex gap-4">
                                                    <div className="flex-shrink-0 mt-1">
                                                        {isCorrect ? <CheckCircle className="w-6 h-6 text-green-500" /> : <XCircle className="w-6 h-6 text-red-500" />}
                                                    </div>
                                                    <div className="flex-1 space-y-3">
                                                        <h4 className="font-semibold text-lg dark:text-white">{q.question}</h4>

                                                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                                                            <div className={`p-3 rounded-lg border ${!isCorrect ? 'bg-red-50 border-red-200 dark:bg-red-900/20' : 'opacity-50'}`}>
                                                                <span className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('tests.your_answer')}</span>
                                                                <span className={!isCorrect ? 'font-medium text-red-700 dark:text-red-300' : ''}>
                                                                    {userAnswer !== null ? q.options[userAnswer] : t('tests.no_answer')}
                                                                </span>
                                                            </div>
                                                            <div className="p-3 rounded-lg border bg-green-50 border-green-200 dark:bg-green-900/20">
                                                                <span className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('tests.correct_answer')}</span>
                                                                <span className="font-medium text-green-700 dark:text-green-300">
                                                                    {typeof q.correctAnswer === 'number' ? q.options[q.correctAnswer] : q.correctAnswer}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                                                            <strong>{t('common.explanation')}:</strong> {q.explanation}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    return null;
}
