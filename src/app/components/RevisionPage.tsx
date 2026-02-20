import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    BookOpen, CheckCircle, XCircle, Loader2, RefreshCw,
    ChevronLeft, ChevronRight, RotateCcw, AlertCircle, Trophy
} from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { dashboardService } from '@/services/dashboardService';
import { useNavigate } from 'react-router-dom';

interface IncorrectQuestion {
    question: {
        _id: string;
        question: string;
        options: string[];
        correctAnswer: number;
        explanation?: string;
        image?: string;
        category?: string;
    };
    selectedAnswer: number;
    testTitle: string;
    testCategory: string;
    attemptDate: string;
}

type RevisionMode = 'list' | 'quiz';

export function RevisionPage() {
    const navigate = useNavigate();
    const [items, setItems] = useState<IncorrectQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<RevisionMode>('list');

    // Quiz state
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [quizResults, setQuizResults] = useState<boolean[]>([]);

    useEffect(() => { fetchIncorrectAnswers(); }, []);

    const fetchIncorrectAnswers = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const res = await dashboardService.getIncorrectAnswers();
            setItems(res.incorrectQuestions || []);
        } catch {
            setError('Impossible de charger les questions de révision.');
        } finally {
            setIsLoading(false);
        }
    };

    const startQuiz = () => {
        setCurrentIndex(0);
        setSelected(null);
        setShowAnswer(false);
        setQuizResults([]);
        setMode('quiz');
    };

    const handleSelect = (idx: number) => {
        if (showAnswer) return;
        setSelected(idx);
        setShowAnswer(true);
        const correct = idx === items[currentIndex].question.correctAnswer;
        setQuizResults(prev => [...prev, correct]);
    };

    const handleNext = () => {
        if (currentIndex < items.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelected(null);
            setShowAnswer(false);
        } else {
            setMode('list'); // finish
        }
    };

    const quizProgress = items.length > 0 ? Math.round(((currentIndex + (showAnswer ? 1 : 0)) / items.length) * 100) : 0;
    const correctCount = quizResults.filter(Boolean).length;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Chargement de vos questions...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                    <p className="text-muted-foreground">{error}</p>
                    <Button onClick={fetchIncorrectAnswers} variant="outline" className="gap-2">
                        <RefreshCw className="w-4 h-4" /> Réessayer
                    </Button>
                </div>
            </div>
        );
    }

    // Quiz mode
    if (mode === 'quiz' && items.length > 0) {
        const item = items[currentIndex];
        const q = item.question;
        const isLast = currentIndex === items.length - 1;
        const isCorrect = selected === q.correctAnswer;

        return (
            <div className="min-h-screen bg-background py-8">
                <div className="max-w-2xl mx-auto px-4">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <Button variant="ghost" size="icon" onClick={() => setMode('list')}>
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-muted-foreground">Question {currentIndex + 1} / {items.length}</span>
                                <span className="text-sm font-medium text-green-600">{correctCount} correctes</span>
                            </div>
                            <Progress value={quizProgress} className="h-2" />
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.25 }}
                        >
                            <Card className="border shadow-md">
                                <CardContent className="p-6 space-y-5">
                                    {q.image && (
                                        <img src={q.image} alt="question" className="w-full max-h-48 object-contain rounded-lg border" />
                                    )}
                                    <div className="flex items-start gap-2">
                                        <Badge variant="outline" className="text-xs shrink-0">{item.testCategory}</Badge>
                                        <p className="text-foreground font-medium leading-snug">{q.question}</p>
                                    </div>

                                    <div className="space-y-3">
                                        {q.options.map((option, idx) => {
                                            let cls = 'border rounded-xl p-4 cursor-pointer transition-all duration-200 text-sm font-medium text-left w-full ';
                                            if (!showAnswer) {
                                                cls += selected === idx
                                                    ? 'bg-primary/10 border-primary text-primary'
                                                    : 'border-border hover:bg-muted/60 hover:border-primary/40 text-foreground';
                                            } else {
                                                if (idx === q.correctAnswer) {
                                                    cls += 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300';
                                                } else if (idx === selected && selected !== q.correctAnswer) {
                                                    cls += 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300';
                                                } else {
                                                    cls += 'border-border text-muted-foreground opacity-60';
                                                }
                                            }
                                            return (
                                                <button key={idx} className={cls} onClick={() => handleSelect(idx)}>
                                                    <span className="flex items-center gap-3">
                                                        <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0">
                                                            {String.fromCharCode(65 + idx)}
                                                        </span>
                                                        {option}
                                                        {showAnswer && idx === q.correctAnswer && <CheckCircle className="w-4 h-4 text-green-500 ml-auto shrink-0" />}
                                                        {showAnswer && idx === selected && selected !== q.correctAnswer && <XCircle className="w-4 h-4 text-red-500 ml-auto shrink-0" />}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {showAnswer && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`p-4 rounded-xl border ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'}`}
                                        >
                                            {isCorrect
                                                ? <p className="text-green-700 dark:text-green-300 font-medium text-sm">✅ Bravo ! Bonne réponse.</p>
                                                : <p className="text-amber-700 dark:text-amber-300 font-medium text-sm">⚠️ La bonne réponse était : <strong>{q.options[q.correctAnswer]}</strong></p>
                                            }
                                            {q.explanation && (
                                                <p className="text-muted-foreground text-xs mt-2">{q.explanation}</p>
                                            )}
                                        </motion.div>
                                    )}

                                    {showAnswer && (
                                        <Button className="w-full gap-2" onClick={handleNext}>
                                            {isLast ? (
                                                <><Trophy className="w-4 h-4" /> Terminer la révision</>
                                            ) : (
                                                <>Question suivante <ChevronRight className="w-4 h-4" /></>
                                            )}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    // List mode
    return (
        <div className="min-h-screen bg-background py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">
                                Page de Révision
                            </h1>
                            <p className="text-muted-foreground">Revoyez les questions que vous avez ratées</p>
                        </div>
                    </div>
                </motion.div>

                {items.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 space-y-4">
                        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto">
                            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Félicitations !</h2>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            Vous n'avez aucune question à réviser. Continuez à faire des tests pour améliorer vos résultats.
                        </p>
                        <Button onClick={() => navigate('/tests')} className="gap-2">
                            <BookOpen className="w-4 h-4" /> Faire un test
                        </Button>
                    </motion.div>
                ) : (
                    <>
                        {/* Summary + Start Quiz */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10">
                                <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-xl">
                                            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">{items.length} question{items.length > 1 ? 's' : ''} à réviser</p>
                                            <p className="text-sm text-muted-foreground">Questions issues de vos tests précédents</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <Button variant="outline" size="sm" onClick={fetchIncorrectAnswers} className="gap-1">
                                            <RefreshCw className="w-4 h-4" /> Actualiser
                                        </Button>
                                        <Button onClick={startQuiz} className="gap-2 flex-1 sm:flex-none">
                                            <RotateCcw className="w-4 h-4" /> Lancer le quiz
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Question list */}
                        <div className="space-y-4">
                            {items.map((item, i) => {
                                const q = item.question;
                                return (
                                    <motion.div
                                        key={q._id || i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <Card className="border shadow-sm hover:shadow-md transition-all duration-200">
                                            <CardContent className="p-5 space-y-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-3 flex-1">
                                                        <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg shrink-0 mt-0.5">
                                                            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-foreground leading-snug">{q.question}</p>
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                <Badge variant="outline" className="text-xs">{item.testCategory}</Badge>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {new Date(item.attemptDate).toLocaleDateString('fr-FR')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {q.image && (
                                                    <img src={q.image} alt="question" className="w-full max-h-32 object-contain rounded-lg border" />
                                                )}

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {q.options?.map((opt, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`text-sm px-3 py-2 rounded-lg border ${idx === q.correctAnswer
                                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-400 text-green-700 dark:text-green-300 font-medium'
                                                                : idx === item.selectedAnswer
                                                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-300 text-red-600 dark:text-red-400 line-through opacity-70'
                                                                    : 'border-border text-muted-foreground'
                                                                }`}
                                                        >
                                                            <span className="font-bold mr-1">{String.fromCharCode(65 + idx)}.</span>
                                                            {opt}
                                                            {idx === q.correctAnswer && ' ✓'}
                                                        </div>
                                                    ))}
                                                </div>

                                                {q.explanation && (
                                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                                                        <p className="text-xs text-blue-700 dark:text-blue-300">
                                                            <strong>💡 Explication:</strong> {q.explanation}
                                                        </p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
