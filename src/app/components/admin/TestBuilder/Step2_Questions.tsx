import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Trash2, Copy, AlertCircle, CheckCircle2 } from 'lucide-react';
import QuestionCard, { QuestionData } from './QuestionCard';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Step2QuestionsProps {
    questions: QuestionData[];
    onChange: (questions: QuestionData[]) => void;
    totalQuestions: number;
    enableImages: boolean;
}

export default function Step2Questions({
    questions,
    onChange,
    totalQuestions: _totalQuestions,
    enableImages: _enableImages
}: Step2QuestionsProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Initialize questions if empty
    if (questions.length === 0) {
        const initialQuestions: QuestionData[] = Array.from({ length: 1 }, () => ({
            question: '',
            options: ['', '', '', ''],
            correctAnswer: -1,
            explanation: '',
            category: 'signalisation',
            difficulty: 'moyen',
        }));
        setTimeout(() => onChange(initialQuestions), 0);
        return null;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const actualTotal = questions.length;

    const handleQuestionChange = (data: QuestionData) => {
        const newQuestions = [...questions];
        newQuestions[currentQuestionIndex] = data;
        onChange(newQuestions);
    };

    const handleAddQuestion = () => {
        const newQuestion: QuestionData = {
            question: '',
            options: ['', '', '', ''],
            correctAnswer: -1,
            explanation: '',
            category: 'signalisation',
            difficulty: 'moyen',
        };
        const newQuestions = [...questions, newQuestion];
        onChange(newQuestions);
        setCurrentQuestionIndex(newQuestions.length - 1);
    };

    const handleDuplicate = (e?: React.MouseEvent, index: number = currentQuestionIndex) => {
        e?.stopPropagation();
        const questionToDuplicate = questions[index];
        const { id, ...questionWithoutId } = questionToDuplicate as QuestionData & { id?: string };
        const newQuestion = { ...questionWithoutId };
        const newQuestions = [...questions];
        newQuestions.splice(index + 1, 0, newQuestion);
        onChange(newQuestions);
        setCurrentQuestionIndex(index + 1);
        toast.success('Question dupliquée');
    };

    const handleDelete = (e?: React.MouseEvent, index: number = currentQuestionIndex) => {
        e?.stopPropagation();
        if (questions.length <= 1) {
            toast.error('Le test doit contenir au moins une question');
            return;
        }

        const newQuestions = questions.filter((_, i) => i !== index);
        onChange(newQuestions);

        if (index === currentQuestionIndex) {
            setCurrentQuestionIndex(prev => Math.min(prev, newQuestions.length - 1));
        } else if (index < currentQuestionIndex) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
        toast.success('Question supprimée');
    };

    const isQuestionComplete = (q: QuestionData) => {
        if (!q) return false;
        const filled = Array.isArray(q.options) ? q.options.filter(opt => (opt || '').trim() !== '') : [];
        return (q.question || '').trim() !== '' &&
            filled.length >= 2 &&
            typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 &&
            q.correctAnswer < q.options.length &&
            (q.options[q.correctAnswer] || '').trim() !== '' &&
            (q.explanation || '').trim() !== '';
    };

    const completedCount = questions.filter(isQuestionComplete).length;
    const progressPct = actualTotal > 0 ? Math.round((completedCount / actualTotal) * 100) : 0;

    return (
        <div className="flex h-full min-h-[580px] rounded-2xl overflow-hidden border-2 border-border bg-background shadow-md">

            {/* ── Sidebar ── */}
            <div className="w-72 shrink-0 border-r-2 flex flex-col bg-muted/20">

                {/* Sidebar Header */}
                <div className="p-4 border-b bg-background/80 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="font-bold text-base">Liste des questions</h3>
                            <p className="text-xs text-muted-foreground">{completedCount}/{actualTotal} complètes</p>
                        </div>
                        <span className="text-sm font-bold text-primary">
                            {progressPct}%
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-muted rounded-full h-2 mb-3">
                        <div
                            className="h-2 rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>

                    <Button onClick={handleAddQuestion} className="w-full gap-2 h-9" size="sm">
                        <Plus className="w-4 h-4" /> Nouvelle question
                    </Button>
                </div>

                {/* Question List */}
                <ScrollArea className="flex-1">
                    <div className="p-3 space-y-2">
                        {questions.map((q, index) => {
                            const isValid = isQuestionComplete(q);
                            const isActive = currentQuestionIndex === index;

                            return (
                                <div
                                    key={index}
                                    onClick={() => setCurrentQuestionIndex(index)}
                                    className={cn(
                                        'group relative flex items-start gap-3 p-3 rounded-xl text-sm transition-all cursor-pointer border-2',
                                        isActive
                                            ? 'bg-primary/10 border-primary/40 shadow-sm'
                                            : 'hover:bg-muted/60 border-transparent hover:border-border bg-background'
                                    )}
                                >
                                    {/* Number badge */}
                                    <div className={cn(
                                        'w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold mt-0.5 shrink-0 transition-all',
                                        isActive
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'bg-muted text-muted-foreground'
                                    )}>
                                        {index + 1}
                                    </div>

                                    <div className="flex-1 overflow-hidden min-w-0">
                                        <p className={cn(
                                            'truncate font-medium leading-tight',
                                            isActive ? 'text-primary' : 'text-foreground'
                                        )}>
                                            {q.question || <span className="italic opacity-50 font-normal">Nouvelle question</span>}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            {isValid ? (
                                                <div className="flex items-center text-[11px] text-green-600 dark:text-green-400 gap-1 font-medium">
                                                    <CheckCircle2 className="w-3 h-3" /> Complète
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-[11px] text-amber-600 dark:text-amber-400 gap-1 font-medium">
                                                    <AlertCircle className="w-3 h-3" /> Incomplète
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quick action buttons */}
                                    <div className={cn(
                                        'flex flex-col gap-1 shrink-0 transition-opacity',
                                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                    )}>
                                        <button
                                            type="button"
                                            title="Dupliquer"
                                            onClick={(e) => handleDuplicate(e, index)}
                                            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40 text-muted-foreground hover:text-blue-600 transition-colors"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </button>
                                        <button
                                            type="button"
                                            title="Supprimer"
                                            onClick={(e) => handleDelete(e, index)}
                                            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 text-muted-foreground hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>

            {/* ── Main Editor ── */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Editor Top Bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-background/60 backdrop-blur-sm shrink-0">
                    <div>
                        <h2 className="text-lg font-bold">
                            Édition — Question {currentQuestionIndex + 1}
                            <span className="text-muted-foreground font-normal text-base"> / {actualTotal}</span>
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Remplissez tous les champs marqués d'un *
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-1"
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                        >
                            <ChevronLeft className="w-4 h-4" /> Précédente
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-1"
                            onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                            disabled={currentQuestionIndex === questions.length - 1}
                        >
                            Suivante <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Question Card Scroll Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    <QuestionCard
                        questionNumber={currentQuestionIndex + 1}
                        data={currentQuestion}
                        onChange={handleQuestionChange}
                        onDuplicate={() => handleDuplicate(undefined, currentQuestionIndex)}
                        onDelete={questions.length > 1 ? () => handleDelete(undefined, currentQuestionIndex) : undefined}
                    />
                </div>
            </div>
        </div>
    );
}
