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
        // Create a new question WITHOUT the id - so it's treated as a new question on save
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
        return (q.question || '').trim() !== '' &&
            Array.isArray(q.options) && q.options.every(opt => (opt || '').trim() !== '') &&
            typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 &&
            (q.explanation || '').trim() !== '';
    };

    const completedCount = questions.filter(isQuestionComplete).length;

    return (
        <div className="flex h-full min-h-[500px] border rounded-xl overflow-hidden bg-background shadow-lg">
            {/* Sidebar - Question List */}
            <div className="w-64 border-r flex flex-col bg-muted/10">
                <div className="p-4 border-b bg-background/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm">Questions</h3>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {completedCount}/{actualTotal}
                        </span>
                    </div>
                    <Button onClick={handleAddQuestion} className="w-full gap-2" size="sm">
                        <Plus className="w-4 h-4" /> Ajouter
                    </Button>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {questions.map((q, index) => {
                            const isValid = isQuestionComplete(q);
                            const isActive = currentQuestionIndex === index;

                            return (
                                <div
                                    key={index}
                                    onClick={() => setCurrentQuestionIndex(index)}
                                    className={cn(
                                        "group flex items-start gap-2 p-2 rounded-md text-sm transition-all cursor-pointer border",
                                        isActive
                                            ? "bg-primary/10 border-primary/20 text-primary"
                                            : "hover:bg-muted border-transparent hover:border-border text-muted-foreground"
                                    )}
                                >
                                    <div className={cn(
                                        "w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold mt-0.5 shrink-0 transition-colors",
                                        isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-background"
                                    )}>
                                        {index + 1}
                                    </div>

                                    <div className="flex-1 overflow-hidden">
                                        <p className="truncate font-medium">
                                            {q.question || <span className="italic opacity-50">Nouvelle question</span>}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {isValid ? (
                                                <div className="flex items-center text-[10px] text-green-600 gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> <span className="hidden group-hover:inline">Complet</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-[10px] text-amber-600 gap-1">
                                                    <AlertCircle className="w-3 h-3" /> <span className="hidden group-hover:inline">Incomplet</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quick Actions on Hover */}
                                    <div className={cn(
                                        "flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                                        isActive && "opacity-100"
                                    )}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 hover:text-blue-600"
                                            onClick={(e) => handleDuplicate(e, index)}
                                        >
                                            <Copy className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 hover:text-red-600"
                                            onClick={(e) => handleDelete(e, index)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Content - Editor */}
            <div className="flex-1 flex flex-col min-w-0 bg-background">
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold">Édition Question {currentQuestionIndex + 1}</h2>
                                <p className="text-sm text-muted-foreground">Remplissez les détails de la question ci-dessous.</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentQuestionIndex === 0}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                    disabled={currentQuestionIndex === questions.length - 1}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <QuestionCard
                            questionNumber={currentQuestionIndex + 1}
                            data={currentQuestion}
                            onChange={handleQuestionChange}
                            onDuplicate={() => handleDuplicate(undefined, currentQuestionIndex)}
                            onDelete={questions.length > 1 ? () => handleDelete(undefined, currentQuestionIndex) : undefined}
                        // Move buttons hidden in new layout as we have drag/drop or sidebar controls later, 
                        // but for now relying on sidebar index clicking. Status update: We removed explicit MoveUp/Down buttons in favour of sidebar navigation for simplicity for now, or we can keep them in card if needed.
                        // Let's keep card simple.
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
