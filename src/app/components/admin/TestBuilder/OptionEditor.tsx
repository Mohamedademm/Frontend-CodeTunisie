import { Input } from '@/app/components/ui/input';
import { cn } from '@/lib/utils';
import { Check, AlertTriangle } from 'lucide-react';

interface OptionEditorProps {
    options: string[];
    correctAnswer: number; // index
    onOptionsChange: (options: string[]) => void;
    onCorrectAnswerChange: (answerIndex: number) => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const OPTION_COLORS = [
    { base: 'border-blue-200 dark:border-blue-800', active: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
    { base: 'border-violet-200 dark:border-violet-800', active: 'border-violet-500 bg-violet-50 dark:bg-violet-950/30', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300' },
    { base: 'border-amber-200 dark:border-amber-800', active: 'border-amber-500 bg-amber-50 dark:bg-amber-950/30', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
    { base: 'border-rose-200 dark:border-rose-800', active: 'border-rose-500 bg-rose-50 dark:bg-rose-950/30', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300' },
];

export default function OptionEditor({ options, correctAnswer, onOptionsChange, onCorrectAnswerChange }: OptionEditorProps) {
    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        onOptionsChange(newOptions);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-base font-semibold">Options de réponse *</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Cliquez sur le badge de lettre pour sélectionner la bonne réponse
                    </p>
                </div>
                {correctAnswer >= 0 ? (
                    <div className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800">
                        <Check className="w-4 h-4" />
                        Réponse : Option {OPTION_LABELS[correctAnswer]}
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800">
                        <AlertTriangle className="w-4 h-4" />
                        Aucune réponse sélectionnée
                    </div>
                )}
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 gap-3">
                {(options || []).map((option, index) => {
                    const isCorrect = correctAnswer === index;
                    const color = OPTION_COLORS[index % OPTION_COLORS.length];

                    return (
                        <div
                            key={index}
                            className={cn(
                                'flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200',
                                isCorrect
                                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20 shadow-sm shadow-green-100 dark:shadow-green-900/20'
                                    : `${color.base} hover:${color.active} bg-background`
                            )}
                        >
                            {/* Letter Badge - Click to select correct answer */}
                            <button
                                type="button"
                                onClick={() => onCorrectAnswerChange(index)}
                                title={`Sélectionner comme bonne réponse`}
                                className={cn(
                                    'w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base transition-all duration-200 shrink-0 cursor-pointer',
                                    isCorrect
                                        ? 'bg-green-500 text-white shadow-md scale-110'
                                        : `${color.badge} hover:scale-105`
                                )}
                            >
                                {isCorrect ? <Check className="w-5 h-5" /> : OPTION_LABELS[index]}
                            </button>

                            {/* Input */}
                            <Input
                                placeholder={`Saisir l'option ${OPTION_LABELS[index]}...`}
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                required
                                className={cn(
                                    'flex-1 h-11 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 font-medium',
                                )}
                            />

                            {/* Correct indicator */}
                            {isCorrect && option !== '' && (
                                <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-md shrink-0">
                                    ✓ Correcte
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Helper text */}
            <p className="text-xs text-muted-foreground text-center">
                💡 Cliquez sur le badge coloré (A, B, C, D) pour marquer la réponse correcte
            </p>
        </div>
    );
}
