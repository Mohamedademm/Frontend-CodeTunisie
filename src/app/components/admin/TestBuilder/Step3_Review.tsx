import { useState } from 'react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { Edit, CheckCircle2, AlertCircle, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { TestInfoData } from './Step1_TestInfo';
import { QuestionData } from './QuestionCard';
import QuestionPreview from './QuestionPreview';

interface Step3ReviewProps {
    testInfo: TestInfoData;
    questions: QuestionData[];
    onEditTestInfo: () => void;
    onEditQuestion: (index: number) => void;
    onUpdateQuestions: (questions: QuestionData[]) => void;
}

export default function Step3Review({
    testInfo,
    questions,
    onEditTestInfo,
    onEditQuestion,
    onUpdateQuestions
}: Step3ReviewProps) {
    // Bulk Edit State
    const [isBulkEditDialogOpen, setIsBulkEditDialogOpen] = useState(false);
    const [bulkCategory, setBulkCategory] = useState<string>('');
    const [bulkDifficulty, setBulkDifficulty] = useState<string>('');

    // Filter State
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const isQuestionComplete = (q: QuestionData) => {
        return q.question.trim() !== '' &&
            q.options.every(opt => opt.trim() !== '') &&
            q.correctAnswer >= 0 &&
            q.explanation.trim() !== '';
    };

    const completedCount = questions.filter(isQuestionComplete).length;
    const isAllComplete = completedCount === questions.length;

    const filteredQuestions = questions.filter(q => {
        if (filterCategory !== 'all' && q.category !== filterCategory) return false;
        if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false;
        if (filterStatus !== 'all') {
            const isComplete = isQuestionComplete(q);
            if (filterStatus === 'complete' && !isComplete) return false;
            if (filterStatus === 'incomplete' && isComplete) return false;
        }
        return true;
    });

    const handleBulkUpdate = () => {
        if (!bulkCategory && !bulkDifficulty) {
            toast.warning('Veuillez sélectionner au moins une modification');
            return;
        }

        const updatedQuestions = questions.map(q => ({
            ...q,
            ...(bulkCategory && { category: bulkCategory }),
            ...(bulkDifficulty && { difficulty: bulkDifficulty })
        }));

        onUpdateQuestions(updatedQuestions);
        setIsBulkEditDialogOpen(false);
        setBulkCategory('');
        setBulkDifficulty('');
        toast.success('Questions mises à jour avec succès');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold mb-2">Révision et Publication</h2>
                <p className="text-muted-foreground">
                    Vérifiez toutes les informations avant de publier le test
                </p>
            </div>

            {/* Completion status */}
            <Card className={isAllComplete ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'}>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        {isAllComplete ? (
                            <>
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                                <div>
                                    <p className="font-semibold text-green-900 dark:text-green-300">
                                        Test complet et prêt à publier !
                                    </p>
                                    <p className="text-sm text-green-700 dark:text-green-400">
                                        Toutes les {questions.length} questions sont complètes
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <AlertCircle className="w-6 h-6 text-amber-600" />
                                <div>
                                    <p className="font-semibold text-amber-900 dark:text-amber-300">
                                        {questions.length - completedCount} question{questions.length - completedCount > 1 ? 's' : ''} incomplète{questions.length - completedCount > 1 ? 's' : ''}
                                    </p>
                                    <p className="text-sm text-amber-700 dark:text-amber-400">
                                        Complétez toutes les questions avant de publier
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Test Info Summary */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <h3 className="text-lg font-semibold">Informations du Test</h3>
                    <Button variant="ghost" size="sm" onClick={onEditTestInfo}>
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                    </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div>
                        <p className="text-sm text-muted-foreground">Titre</p>
                        <p className="font-medium">{testInfo.title}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p className="text-sm">{testInfo.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Catégorie</p>
                            <Badge variant="outline">{testInfo.category}</Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Difficulté</p>
                            <Badge variant="secondary">{testInfo.difficulty}</Badge>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Durée</p>
                            <p className="font-medium">{testInfo.duration} minutes</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Seuil de réussite</p>
                            <p className="font-medium">{testInfo.passThreshold}%</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Questions List Header with Filters */}
            <div className="space-y-4">
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">
                            Questions ({completedCount}/{questions.length})
                        </h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsBulkEditDialogOpen(true)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <Layers className="w-4 h-4 mr-2" />
                            Modification en masse
                        </Button>
                    </div>

                    {/* Filters Toolbar */}
                    <div className="flex gap-2 p-2 bg-muted/30 rounded-lg overflow-x-auto">
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="w-[180px] h-8 text-xs">
                                <SelectValue placeholder="Catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes les catégories</SelectItem>
                                <SelectItem value="general">Général</SelectItem>
                                <SelectItem value="code_route">Code de la route</SelectItem>
                                <SelectItem value="mecanique">Mécanique</SelectItem>
                                <SelectItem value="premiers_secours">Premiers secours</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                            <SelectTrigger className="w-[150px] h-8 text-xs">
                                <SelectValue placeholder="Difficulté" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes difficultés</SelectItem>
                                <SelectItem value="facile">Facile</SelectItem>
                                <SelectItem value="moyen">Moyen</SelectItem>
                                <SelectItem value="difficile">Difficile</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-[150px] h-8 text-xs">
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les statuts</SelectItem>
                                <SelectItem value="complete">Complètes</SelectItem>
                                <SelectItem value="incomplete">Incomplètes</SelectItem>
                            </SelectContent>
                        </Select>

                        {(filterCategory !== 'all' || filterDifficulty !== 'all' || filterStatus !== 'all') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs px-2"
                                onClick={() => {
                                    setFilterCategory('all');
                                    setFilterDifficulty('all');
                                    setFilterStatus('all');
                                }}
                            >
                                Réinitialiser
                            </Button>
                        )}
                    </div>
                </div>

                {filteredQuestions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Aucune question ne correspond aux filtres sélectionnés.
                    </div>
                ) : (
                    filteredQuestions.map((question, _) => {
                        // Find original index
                        const originalIndex = questions.indexOf(question);
                        return (
                            <Card key={originalIndex} className={!isQuestionComplete(question) ? 'border-amber-500' : ''}>
                                <CardHeader className="flex flex-row items-center justify-between py-3">
                                    <div className="flex items-center gap-3">
                                        <Badge
                                            variant={isQuestionComplete(question) ? 'default' : 'secondary'}
                                            className="h-7 w-7 flex items-center justify-center rounded-full p-0"
                                        >
                                            {originalIndex + 1}
                                        </Badge>
                                        <span className="font-medium">
                                            {question.question || `Question ${originalIndex + 1}`}
                                        </span>
                                        {!isQuestionComplete(question) && (
                                            <Badge variant="destructive" className="text-xs">Incomplète</Badge>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEditQuestion(originalIndex)}
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Modifier
                                    </Button>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <QuestionPreview
                                        question={question.question}
                                        options={question.options}
                                        correctAnswer={question.correctAnswer}
                                        explanation={question.explanation}
                                        image={question.image}
                                        category={question.category}
                                        difficulty={question.difficulty}
                                    />
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Bulk Edit Dialog */}
            <Dialog open={isBulkEditDialogOpen} onOpenChange={setIsBulkEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modification en masse</DialogTitle>
                        <DialogDescription>
                            Appliquez des modifications à toutes les questions du test.
                            Laissez vide pour conserver les valeurs actuelles.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Catégorie</Label>
                            <Select value={bulkCategory} onValueChange={setBulkCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Ne pas changer" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="general">Général</SelectItem>
                                    <SelectItem value="code_route">Code de la route</SelectItem>
                                    <SelectItem value="mecanique">Mécanique</SelectItem>
                                    <SelectItem value="premiers_secours">Premiers secours</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Difficulté</Label>
                            <Select value={bulkDifficulty} onValueChange={setBulkDifficulty}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Ne pas changer" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="facile">Facile</SelectItem>
                                    <SelectItem value="moyen">Moyen</SelectItem>
                                    <SelectItem value="difficile">Difficile</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBulkEditDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleBulkUpdate}>
                            Appliquer à toutes les questions
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
