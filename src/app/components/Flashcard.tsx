import { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';

interface FlashcardProps {
    question: string;
    answer: string;
    category: string;
}

export function Flashcard({ question, answer, category }: FlashcardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className="perspective-1000 w-full max-w-md mx-auto h-64 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
            <motion.div
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                className="relative w-full h-full transform-style-3d"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front */}
                <Card className="absolute w-full h-full backface-hidden flex flex-col items-center justify-center p-6 text-center shadow-lg border-2 border-primary/10 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-4 px-2 py-1 bg-primary/10 rounded-full">
                        {category}
                    </span>
                    <p className="text-xl font-medium text-gray-800 dark:text-gray-100">{question}</p>
                    <p className="text-xs text-muted-foreground mt-8 animate-pulse">
                        Cliquez pour voir la réponse
                    </p>
                </Card>

                {/* Back */}
                <Card
                    className="absolute w-full h-full backface-hidden flex flex-col items-center justify-center p-6 text-center shadow-lg bg-primary text-primary-foreground transform rotate-y-180"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    <p className="text-lg font-medium">{answer}</p>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="mt-6 gap-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsFlipped(false);
                        }}
                    >
                        <RotateCw className="w-4 h-4" />
                        Retourner
                    </Button>
                </Card>
            </motion.div>
        </div>
    );
}
