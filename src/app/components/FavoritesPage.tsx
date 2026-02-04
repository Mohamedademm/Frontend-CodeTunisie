import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Heart, Trash2 } from 'lucide-react';
import { mockQuestions } from '@/app/data/mockData';
import { Question } from '@/app/types';
import { Badge } from '@/app/components/ui/badge';

export function FavoritesPage() {
    // Simulate fetching favorites (in a real app, this would come from a context or API)
    const [favorites, setFavorites] = useState<Question[]>(mockQuestions.filter(q => q.isFavorite));

    const removeFavorite = (id: string) => {
        setFavorites(prev => prev.filter(q => q.id !== id));
        // Here you would also call an API to update the backend
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
                        <Heart className="w-6 h-6 text-red-600 dark:text-red-400 fill-current" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Questions Favorites</h1>
                        <p className="text-gray-600 dark:text-gray-400">Révisez vos questions sauvegardées</p>
                    </div>
                </div>

                {favorites.length === 0 ? (
                    <Card className="p-12 text-center border-dashed">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun favori</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                            Vous n'avez pas encore ajouté de questions à vos favoris. Utilisez l'icône cœur lors des tests pour sauvegarder des questions difficiles.
                        </p>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        <AnimatePresence>
                            {favorites.map((question) => (
                                <motion.div
                                    key={question.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Card className="overflow-hidden hover:shadow-md transition-shadow dark:bg-gray-800">
                                        <div className="p-6">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            {question.category || 'Général'}
                                                        </Badge>
                                                        {question.difficulty && (
                                                            <Badge variant={question.difficulty === 'difficile' ? 'destructive' : 'secondary'} className="text-xs">
                                                                {question.difficulty}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                                        {question.question}
                                                    </h3>

                                                    <div className="space-y-2 mb-4">
                                                        {question.options.map((option, idx) => (
                                                            <div
                                                                key={idx}
                                                                className={`p-3 rounded-lg text-sm border ${idx === (Number(question.correctAnswer) - 1) // Assuming 1-based index from mockData
                                                                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 text-green-800 dark:text-green-300'
                                                                    : 'bg-gray-50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                                                                    }`}
                                                            >
                                                                {option}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-300">
                                                        <strong>Explication :</strong> {question.explanation}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        onClick={() => removeFavorite(question.id)}
                                                        title="Retirer des favoris"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
