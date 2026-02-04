import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/app/components/ui/button';
import { Flashcard } from '@/app/components/Flashcard';
import { ChevronLeft, ChevronRight, GraduationCap, RefreshCw } from 'lucide-react';
import { Progress } from '@/app/components/ui/progress';

const mockFlashcards = [
    {
        id: 1,
        category: 'Signalisation',
        question: 'Que signifie un panneau triangulaire à bordure rouge ?',
        answer: 'C\'est un panneau de DANGER. Il vous avertit d\'un risque proche.'
    },
    {
        id: 2,
        category: 'Priorité',
        question: 'Dans un rond-point sans signalisation, qui a la priorité ?',
        answer: 'La priorité est à DROITE, donc aux véhicules entrants. (Attention : la plupart des ronds-points ont des panneaux "Cédez le passage", donnant la priorité à gauche).'
    },
    {
        id: 3,
        category: 'Vitesse',
        question: 'Quelle est la limitation de vitesse sur autoroute par temps de pluie ?',
        answer: '110 km/h (au lieu de 130 km/h par temps sec).'
    },
    {
        id: 4,
        category: 'Alcool',
        question: 'Quel est le taux d\'alcoolémie maximal autorisé pour un jeune conducteur ?',
        answer: '0,2 g/l de sang (tolérance quasi nulle).'
    },
    {
        id: 5,
        category: 'Sécurité',
        question: 'Quelle est la distance de sécurité minimale à respecter à 90 km/h ?',
        answer: 'Environ 50 mètres (2 traits de la bande d\'arrêt d\'urgence).'
    }
];

export function FlashcardsPage() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const nextCard = () => {
        if (currentIndex < mockFlashcards.length - 1) {
            setDirection(1);
            setCurrentIndex(prev => prev + 1);
        }
    };

    const prevCard = () => {
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex(prev => prev - 1);
        }
    };

    const resetCards = () => {
        setDirection(-1);
        setCurrentIndex(0);
    };

    const currentCard = mockFlashcards[currentIndex];
    const progress = ((currentIndex + 1) / mockFlashcards.length) * 100;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-lg"
                    >
                        <GraduationCap className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Révision Rapide</h1>
                    <p className="text-gray-600 dark:text-gray-400">Testez vos connaissances avec nos flashcards interactives</p>
                </div>

                <div className="mb-8 max-w-md mx-auto">
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                        <span>Progression</span>
                        <span>{currentIndex + 1} / {mockFlashcards.length}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                <div className="relative h-[400px] flex flex-col items-center justify-center">
                    <AnimatePresence mode='wait' initial={false} custom={direction}>
                        <motion.div
                            key={currentIndex}
                            custom={direction}
                            initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
                            transition={{ duration: 0.3 }}
                            className="absolute w-full flex justify-center"
                        >
                            <Flashcard
                                question={currentCard.question}
                                answer={currentCard.answer}
                                category={currentCard.category}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="flex justify-center items-center gap-4 mt-8">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={prevCard}
                        disabled={currentIndex === 0}
                        className="rounded-full w-12 h-12 p-0"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={resetCards}
                        className="rounded-full gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Réinitialiser
                    </Button>

                    <Button
                        variant="default"
                        size="lg"
                        onClick={nextCard}
                        disabled={currentIndex === mockFlashcards.length - 1}
                        className="rounded-full w-12 h-12 p-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
