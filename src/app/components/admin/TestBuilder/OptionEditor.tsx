import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Check } from 'lucide-react';

interface OptionEditorProps {
    options: string[];
    correctAnswer: number; // Changed to number (index)
    onOptionsChange: (options: string[]) => void;
    onCorrectAnswerChange: (answerIndex: number) => void;
}

export default function OptionEditor({ options, correctAnswer, onOptionsChange, onCorrectAnswerChange }: OptionEditorProps) {
    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        onOptionsChange(newOptions);
    };

    return (
        <div className="space-y-3 border rounded-md p-4 bg-muted/20">
            <div className="flex items-center justify-between">
                <Label className="text-base">Options de réponse</Label>
                <span className="text-xs text-muted-foreground">
                    Sélectionnez la bonne réponse
                </span>
            </div>

            <RadioGroup value={(correctAnswer ?? -1).toString()} onValueChange={(v) => onCorrectAnswerChange(Number(v))}>
                {(options || []).map((option, index) => (
                    <div key={index} className="flex items-center gap-3 group">
                        <div className="flex items-center">
                            <RadioGroupItem
                                value={index.toString()}
                                id={`option-${index}`}
                                className="peer"
                            />
                            <div className="ml-2 peer-data-[state=checked]:text-green-600">
                                {correctAnswer === index && <Check className="w-4 h-4" />}
                            </div>
                        </div>
                        <div className="flex-1">
                            <Input
                                placeholder={`Option ${index + 1}`}
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                required
                                className={`transition-all ${correctAnswer === index && option !== ''
                                    ? 'border-green-500 ring-1 ring-green-500 bg-green-50 dark:bg-green-950/20'
                                    : ''
                                    }`}
                            />
                        </div>
                    </div>
                ))}
            </RadioGroup>

            {correctAnswer === -1 && (
                <p className="text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1">
                    ⚠️ Veuillez sélectionner la réponse correcte
                </p>
            )}
        </div>
    );
}
