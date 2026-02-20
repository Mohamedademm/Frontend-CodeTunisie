import { motion, AnimatePresence } from "motion/react";
import {
    CheckCircle, XCircle, Trophy, ArrowRight, RotateCcw,
    LayoutGrid, Home, Star, Share2, Award, Zap, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Confetti } from "@/app/components/ui/Confetti";
import { TestSubmissionResponse } from "@/services/testService";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface TestResultsProps {
    results: TestSubmissionResponse;
    testTitle: string;
    totalQuestions: number;
}

export function TestResults({ results, testTitle, totalQuestions }: TestResultsProps) {
    const navigate = useNavigate();
    const [showReport, setShowReport] = useState(false);
    const [scoreAnimated, setScoreAnimated] = useState(0);

    // Animate score count up
    useEffect(() => {
        const duration = 1500;
        const steps = 60;
        const interval = duration / steps;
        const increment = results.score / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= results.score) {
                setScoreAnimated(results.score);
                clearInterval(timer);
            } else {
                setScoreAnimated(Math.round(current));
            }
        }, interval);

        return () => clearInterval(timer);
    }, [results.score]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${mins}m ${secs}s`;
    };

    const handleShare = () => {
        navigator.clipboard.writeText(`J'ai obtenu ${results.score}% au test "${testTitle}" sur CodeTunisiePro ! 🚗💨`);
        toast.success("Résultat copié dans le presse-papier !");
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 relative overflow-hidden">
            {/* Celebration Effects */}
            {(results.passed || results.leveledUp) && <Confetti />}

            <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                {/* 1. Header & Score Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="overflow-hidden border-none shadow-xl bg-white dark:bg-gray-800">
                        <div className={`h-3 w-full ${results.passed ? 'bg-green-500' : 'bg-red-500'}`} />
                        <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row">
                                {/* Score Circle Section */}
                                <div className="p-8 md:w-1/2 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900/50">
                                    <div className="relative mb-6">
                                        {/* SVG Circle */}
                                        <svg className="w-48 h-48 transform -rotate-90">
                                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100 dark:text-gray-700" />
                                            <motion.circle
                                                cx="96" cy="96" r="88"
                                                stroke="currentColor" strokeWidth="12"
                                                fill="transparent" strokeLinecap="round"
                                                className={results.passed ? 'text-green-500' : 'text-red-500'}
                                                initial={{ strokeDasharray: 553, strokeDashoffset: 553 }}
                                                animate={{ strokeDashoffset: 553 - (553 * results.score) / 100 }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-5xl font-extrabold dark:text-white">{scoreAnimated}%</span>
                                            <span className={`text-sm font-bold uppercase tracking-wider mt-1 ${results.passed ? 'text-green-600' : 'text-red-500'}`}>
                                                {results.passed ? 'Réussi' : 'Échoué'}
                                            </span>
                                        </div>
                                    </div>
                                    <h1 className="text-2xl font-bold text-center dark:text-white mb-2">{testTitle}</h1>
                                    <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
                                        Terminé en {results.testAttempt?.timeTaken ? formatTime(results.testAttempt.timeTaken) : 'un temps record'}
                                    </p>
                                </div>

                                {/* Stats & Gamification Section */}
                                <div className="p-8 md:w-1/2 space-y-6">
                                    {/* Quick Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                                            <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
                                            <span className="text-2xl font-bold text-blue-800 dark:text-blue-200">{results.correctCount}/{totalQuestions}</span>
                                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Réponses Correctes</span>
                                        </div>
                                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                                            <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-2" />
                                            <span className="text-2xl font-bold text-amber-800 dark:text-amber-200">+{results.xpEarned} XP</span>
                                            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Expérience Gagnée</span>
                                        </div>
                                    </div>

                                    {/* Level Progress */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span className="text-gray-600 dark:text-gray-300">Niveau {results.newLevel}</span>
                                            <span className="text-primary">{results.newLevelTitle}</span>
                                        </div>
                                        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-primary to-purple-500"
                                                initial={{ width: `${(results.oldXp % 1000) / 10}%` }} // Simplified percentage logic
                                                animate={{ width: `${(results.newTotalXp % 1000) / 10}%` }}
                                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                                            />
                                        </div>
                                        <p className="text-xs text-right text-gray-500 dark:text-gray-400">Total: {results.newTotalXp} XP</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-2">
                                        <Button variant="outline" className="flex-1" onClick={handleShare}>
                                            <Share2 className="w-4 h-4 mr-2" /> Partager
                                        </Button>
                                        <Button className="flex-1" onClick={() => navigate('/tests')}>
                                            <RotateCcw className="w-4 h-4 mr-2" /> Réessayer
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* 2. Gamification: Level Up & Badges */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Level Up Notification */}
                    <AnimatePresence>
                        {results.leveledUp && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="md:col-span-2"
                            >
                                <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-none shadow-lg overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Trophy className="w-64 h-64 -mr-12 -mt-12" />
                                    </div>
                                    <CardContent className="p-6 flex items-center gap-6 relative z-10">
                                        <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                                            <Star className="w-8 h-8 text-yellow-300 fill-yellow-300 animate-pulse" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold mb-1">Niveau Supérieur !</h3>
                                            <p className="text-purple-100 text-lg">
                                                Félicitations, vous êtes maintenant <span className="font-bold text-white">"{results.newLevelTitle}"</span> (Niveau {results.newLevel}).
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* New Badges */}
                    {results.newBadges && results.newBadges.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="md:col-span-2"
                        >
                            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2 text-amber-800 dark:text-amber-400">
                                        <Award className="w-5 h-5" /> Nouveaux Badges Débloqués
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {results.newBadges.map((badge, idx) => (
                                        <motion.div
                                            key={badge.id}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.5 + (idx * 0.1), type: "spring" }}
                                            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-amber-100 dark:border-amber-900 flex flex-col items-center text-center gap-2"
                                        >
                                            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600 dark:text-amber-400">
                                                <Trophy className="w-6 h-6" /> {/* Placeholder for dynamic icon */}
                                            </div>
                                            <span className="font-bold text-sm dark:text-white">{badge.name}</span>
                                        </motion.div>
                                    ))}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Next Recommendation */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="md:col-span-2"
                    >
                        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-none shadow-md">
                            <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300 border-none">
                                                Recommandé pour vous
                                            </Badge>
                                        </div>
                                        <h3 className="text-xl font-bold dark:text-white mb-2">
                                            {results.nextTest ? `Suivant: ${results.nextTest.title}` : "Continuer votre progression"}
                                        </h3>
                                        <p className="text-muted-foreground text-sm max-w-lg">
                                            {results.passed
                                                ? "Continuez sur votre lancée ! Ce prochain test est sélectionné pour renforcer vos acquis."
                                                : "Ne vous découragez pas. Révisez vos erreurs ci-dessous et réessayez ou passez à un sujet connexe."}
                                        </p>
                                    </div>
                                    <Button size="lg" className="shrink-0 shadow-lg hover:shadow-xl transition-all" onClick={() => results.nextTest ? navigate(`/tests/${results.nextTest.id}`) : navigate('/tests')}>
                                        {results.nextTest ? 'Commencer le test suivant' : 'Voir tous les tests'} <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* 3. Detailed Report */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card className="border shadow-sm overflow-hidden dark:bg-gray-800">
                        <div
                            className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            onClick={() => setShowReport(!showReport)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <LayoutGrid className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg dark:text-white">Rapport Détaillé</h3>
                                    <p className="text-sm text-muted-foreground">Voir vos réponses et les corrections</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon">
                                {showReport ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </Button>
                        </div>

                        <AnimatePresence>
                            {showReport && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-6 pt-0 space-y-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
                                        {/* Since TestSubmissionResponse returns full Attempt object, we might need to map it or use passed 'questions' prop if needed. 
                                            However, the backend response structure for 'testAttempt' creates a deeply nested 'answers' array with populated questions.
                                        */}
                                        {results.testAttempt.answers.map((ans: any, idx: number) => {
                                            const question = ans.question;
                                            const isCorrect = ans.isCorrect;

                                            // Handle case where question might be null if deleted
                                            if (!question) return null;

                                            return (
                                                <div key={idx} className={`p-4 rounded-xl border ${isCorrect ? 'bg-white border-green-200 dark:bg-gray-800 dark:border-green-900' : 'bg-white border-red-200 dark:bg-gray-800 dark:border-red-900'}`}>
                                                    <div className="flex gap-4">
                                                        <div className="shrink-0 mt-1">
                                                            {isCorrect
                                                                ? <CheckCircle className="w-5 h-5 text-green-500" />
                                                                : <XCircle className="w-5 h-5 text-red-500" />
                                                            }
                                                        </div>
                                                        <div className="flex-1 space-y-2">
                                                            <p className="font-semibold text-gray-900 dark:text-white">{question.question}</p>

                                                            <div className="grid md:grid-cols-2 gap-3 text-sm mt-3">
                                                                <div className={`p-3 rounded-lg ${isCorrect ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'}`}>
                                                                    <span className="block text-xs font-bold opacity-70 mb-1">VOTRE RÉPONSE</span>
                                                                    {question.options[ans.selectedAnswer]}
                                                                </div>
                                                                {!isCorrect && (
                                                                    <div className="p-3 rounded-lg bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                                                                        <span className="block text-xs font-bold opacity-70 mb-1">BONNE RÉPONSE</span>
                                                                        {question.options[question.correctAnswer]}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {question.explanation && (
                                                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 pl-2 border-l-2 border-primary/20">
                                                                    <span className="font-semibold text-primary">Explication:</span> {question.explanation}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>

                    <div className="flex justify-center mt-8 pb-8">
                        <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => navigate('/dashboard')}>
                            <Home className="w-4 h-4 mr-2" /> Retour au tableau de bord
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
