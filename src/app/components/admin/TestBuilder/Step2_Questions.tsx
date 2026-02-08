import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import QuestionCard, { QuestionData } from './QuestionCard';
import { Progress } from '@/app/components/ui/progress';
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
    totalQuestions,
    enableImages: _enableImages // Prefix with underscore to indicate intentionally unused
}: Step2QuestionsProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Initialize questions if needed using useEffect to avoid setState during render
    const [initialized, setInitialized] = useState(false);

    if (questions.length === 0 && !initialized) {
        const initialQuestions: QuestionData[] = Array.from({ length: totalQuestions }, () => ({
            question: '',
            options: ['', '', '', ''],
            correctAnswer: -1, // Changed to number
            explanation: '',
            category: 'signalisation',
            difficulty: 'moyen',
        }));
        setInitialized(true);
        setTimeout(() => onChange(initialQuestions), 0);
        return null;
    }

    if (questions.length === 0) {
        return null;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const actualTotal = questions.length; // Use actual length instead of initial total
    const progress = ((currentQuestionIndex + 1) / actualTotal) * 100;

    const handleQuestionChange = (data: QuestionData) => {
        const newQuestions = [...questions];
        newQuestions[currentQuestionIndex] = data;
        onChange(newQuestions);
    };

    const handleDuplicate = () => {
        const questionToDuplicate = questions[currentQuestionIndex];
        const newQuestion = { ...questionToDuplicate };
        // Insert after current question
        const newQuestions = [...questions];
        newQuestions.splice(currentQuestionIndex + 1, 0, newQuestion);
        onChange(newQuestions);
        // Move to the new duplicated question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        toast.success('Question dupliquée');
    };

    const handleDelete = () => {
        if (questions.length <= 1) {
            toast.error('Le test doit contenir au moins une question');
            return;
        }

        const newQuestions = questions.filter((_, index) => index !== currentQuestionIndex);
        onChange(newQuestions);

        // Adjust index if we deleted the last question
        if (currentQuestionIndex >= newQuestions.length) {
            setCurrentQuestionIndex(newQuestions.length - 1);
        }
        toast.success('Question supprimée');
    };

    const handleMoveUp = () => {
        if (currentQuestionIndex > 0) {
            const newQuestions = [...questions];
            [newQuestions[currentQuestionIndex - 1], newQuestions[currentQuestionIndex]] =
                [newQuestions[currentQuestionIndex], newQuestions[currentQuestionIndex - 1]];
            onChange(newQuestions);
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleMoveDown = () => {
        if (currentQuestionIndex < questions.length - 1) {
            const newQuestions = [...questions];
            [newQuestions[currentQuestionIndex], newQuestions[currentQuestionIndex + 1]] =
                [newQuestions[currentQuestionIndex + 1], newQuestions[currentQuestionIndex]];
            onChange(newQuestions);
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < actualTotal - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const isQuestionComplete = (q: QuestionData) => {
        return q.question.trim() !== '' &&
            Array.isArray(q.options) && q.options.every(opt => opt.trim() !== '') &&
            q.correctAnswer >= 0 &&
            q.explanation.trim() !== '';
    };

    const completedCount = questions.filter(isQuestionComplete).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold mb-2">Création des Questions</h2>
                <p className="text-muted-foreground">
                    Question {currentQuestionIndex + 1} sur {actualTotal} • {completedCount} complétée{completedCount > 1 ? 's' : ''}
                </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Progression</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            {/* Question navigation pills */}
            <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg">
                {questions.map((q, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`
                            w-10 h-10 rounded-full font-medium transition-all
                            ${index === currentQuestionIndex
                                ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                                : isQuestionComplete(q)
                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                            }
                        `}
                    >
                        {index + 1}
                    </button>
                ))}
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-10 h-10 border-dashed"
                    onClick={() => {
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
                    }}
                    title="Ajouter une question"
                >
                    +
                </Button>
            </div>

            {/* Current question card */}
            <QuestionCard
                questionNumber={currentQuestionIndex + 1}
                data={currentQuestion}
                onChange={handleQuestionChange}
                onDuplicate={handleDuplicate}
                onDelete={questions.length > 1 ? handleDelete : undefined}
                onMoveUp={currentQuestionIndex > 0 ? handleMoveUp : undefined}
                onMoveDown={currentQuestionIndex < questions.length - 1 ? handleMoveDown : undefined}
            />

            {/* Navigation buttons */}
            <div className="flex justify-between pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Précédent
                </Button>

                <Button
                    type="button"
                    onClick={handleNext}
                    disabled={currentQuestionIndex === actualTotal - 1}
                >
                    Suivant
                    <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </div>

            {/* Completion warning */}
            {completedCount < actualTotal && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-sm text-amber-800 dark:text-amber-400">
                        ⚠️ {actualTotal - completedCount} question{actualTotal - completedCount > 1 ? 's' : ''} incomplète{actualTotal - completedCount > 1 ? 's' : ''}.
                        Assurez-vous de remplir tous les champs avant de passer à l'étape suivante.
                    </p>
                </div>
            )}
        </div>
    );
}
