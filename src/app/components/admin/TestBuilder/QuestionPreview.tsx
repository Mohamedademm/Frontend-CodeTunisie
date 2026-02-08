import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent } from '@/app/components/ui/card';
import { Check } from 'lucide-react';

interface QuestionPreviewProps {
    question: string;
    options: string[];
    correctAnswer: number; // Changed to number (index)
    explanation?: string;
    image?: { url: string };
    category?: string;
    difficulty?: string;
}

export default function QuestionPreview({
    question,
    options,
    correctAnswer,
    explanation,
    image,
    category,
    difficulty
}: QuestionPreviewProps) {
    return (
        <Card className="overflow-hidden">
            <CardContent className="p-6 space-y-4">
                {/* Header with badges */}
                {(category || difficulty) && (
                    <div className="flex gap-2 flex-wrap">
                        {category && (
                            <Badge variant="outline" className="text-xs">
                                {category}
                            </Badge>
                        )}
                        {difficulty && (
                            <Badge
                                variant="secondary"
                                className={`text-xs ${difficulty === 'facile'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                                    : difficulty === 'difficile'
                                        ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                                    }`}
                            >
                                {difficulty}
                            </Badge>
                        )}
                    </div>
                )}

                {/* Question text */}
                <div>
                    <h3 className="font-semibold text-lg mb-2">{question || 'Votre question ici...'}</h3>
                </div>

                {/* Image if present */}
                {image?.url && (
                    <div className="rounded-lg overflow-hidden border">
                        <img
                            src={image.url.startsWith('http') ? image.url : `http://localhost:5000${image.url}`}
                            alt="Question"
                            className="w-full h-48 object-contain bg-muted"
                            onError={(e) => {
                                // Fallback if image fails to load
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                )}

                {/* Options */}
                <div className="space-y-2">
                    {options.map((option, index) => {
                        const isCorrect = index === correctAnswer; // Changed to index comparison
                        return (
                            <div
                                key={index}
                                className={`p-3 rounded-lg border-2 transition-all ${isCorrect
                                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                                    : 'border-border bg-muted/30'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${isCorrect
                                        ? 'border-green-500 bg-green-500 text-white'
                                        : 'border-muted-foreground/30'
                                        }`}>
                                        {isCorrect ? (
                                            <Check className="w-4 h-4" />
                                        ) : (
                                            <span className="text-xs">{String.fromCharCode(65 + index)}</span>
                                        )}
                                    </div>
                                    <span className={isCorrect ? 'font-medium' : ''}>
                                        {option || `Option ${index + 1}`}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Explanation */}
                {explanation && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                            💡 Explication
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-400">
                            {explanation}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
