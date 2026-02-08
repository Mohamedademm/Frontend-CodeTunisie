import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { ChevronLeft, ChevronRight, Check, Loader2, Download, Upload, Keyboard } from 'lucide-react';
import { toast } from 'sonner';
import adminService from '@/services/adminService';
import Step1TestInfo, { TestInfoData } from './Step1_TestInfo';
import Step2Questions from './Step2_Questions';
import Step3Review from './Step3_Review';
import { QuestionData } from './QuestionCard';
import { Test } from '@/app/types';

interface TestBuilderWizardProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: Test;
    initialQuestions?: QuestionData[];
    mode?: 'create' | 'edit';
}

export default function TestBuilderWizard({
    open,
    onClose,
    onSuccess,
    initialData,
    initialQuestions,
    mode = 'create'
}: TestBuilderWizardProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);

    // Step 1 data
    const [testInfo, setTestInfo] = useState<TestInfoData>({
        title: '',
        description: '',
        category: 'general',
        difficulty: 'moyen',
        duration: 30,
        passThreshold: 70,
        questionCount: 10,
        enableImages: true,
    });

    // Step 2 data
    const [questions, setQuestions] = useState<QuestionData[]>([]);

    const steps = [
        { number: 1, title: 'Info Test', description: 'Paramètres de base' },
        { number: 2, title: 'Questions', description: 'Création des questions' },
        { number: 3, title: 'Révision', description: 'Vérification finale' },
    ];

    // Initialize data for Edit Mode
    useEffect(() => {
        if (open && mode === 'edit' && initialData) {
            setTestInfo({
                title: initialData.title,
                description: initialData.description,
                category: initialData.category || 'general',
                difficulty: initialData.difficulty || 'moyen',
                duration: initialData.duration,
                passThreshold: initialData.passThreshold || 70,
                questionCount: initialQuestions?.length || (Array.isArray(initialData.questions) ? initialData.questions.length : (typeof initialData.questions === 'number' ? initialData.questions : 10)),
                enableImages: true,
            });

            if (initialQuestions && initialQuestions.length > 0) {
                setQuestions(initialQuestions);
            }
        } else if (open && mode === 'create') {
            // Check for draft only in create mode
            const savedDraft = localStorage.getItem('testBuilderDraft');
            if (savedDraft) {
                try {
                    const draft = JSON.parse(savedDraft);
                    const draftAge = new Date().getTime() - new Date(draft.timestamp).getTime();
                    const oneHour = 60 * 60 * 1000;

                    if (draftAge < oneHour && draft.testInfo.title) {
                        setTestInfo(draft.testInfo);
                        setQuestions(draft.questions || []);
                        setCurrentStep(draft.currentStep || 1);
                        toast.info('Brouillon restauré', {
                            description: 'Votre travail précédent a été récupéré',
                        });
                    }
                } catch (error) {
                    console.error('Error restoring draft:', error);
                }
            }
        }
    }, [open, mode, initialData, initialQuestions]);

    // Auto-save to localStorage (only in create mode)
    useEffect(() => {
        if (mode === 'create' && open && (testInfo.title || questions.length > 0)) {
            const draft = {
                testInfo,
                questions,
                currentStep,
                timestamp: new Date().toISOString(),
            };
            localStorage.setItem('testBuilderDraft', JSON.stringify(draft));
        }
    }, [testInfo, questions, currentStep, open, mode]);


    const handleNext = () => {
        // Validation for step 1
        if (currentStep === 1) {
            if (!testInfo.title.trim()) {
                toast.error('Le titre est requis');
                return;
            }
            if (!testInfo.description.trim()) {
                toast.error('La description est requise');
                return;
            }
            if (testInfo.questionCount < 1) {
                toast.error('Au moins une question est requise');
                return;
            }
        }

        // Validation for step 2
        if (currentStep === 2) {
            const isQuestionComplete = (q: QuestionData) => {
                return q.question.trim() !== '' &&
                    Array.isArray(q.options) && q.options.every(opt => opt.trim() !== '') &&
                    q.correctAnswer >= 0 &&
                    q.explanation.trim() !== '';
            };

            const incompleteCount = questions.filter(q => !isQuestionComplete(q)).length;
            if (incompleteCount > 0) {
                toast.warning(`${incompleteCount} question(s) incomplète(s). Vous pouvez continuer mais il est recommandé de les compléter.`);
            }
        }

        setCurrentStep(currentStep + 1);
    };

    const handlePrevious = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleEditTestInfo = () => {
        setCurrentStep(1);
    };

    const handleEditQuestion = (_index: number) => {
        setCurrentStep(2);
    };

    const handleExport = () => {
        const data = {
            testInfo,
            questions,
            version: '1.0',
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `test-template-${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Test exporté avec succès');
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content);

                // Basic validation
                if (!data.testInfo || !Array.isArray(data.questions)) {
                    throw new Error('Format de fichier invalide');
                }

                setTestInfo(data.testInfo);
                setQuestions(data.questions);
                setCurrentStep(1);
                toast.success('Test importé avec succès');
            } catch (error) {
                console.error('Import error:', error);
                toast.error('Erreur lors de l\'importation du fichier');
            }
            event.target.value = '';
        };
        reader.readAsText(file);
    };

    const handlePublish = async () => {
        // Final validation
        const isQuestionComplete = (q: QuestionData) => {
            return q.question.trim() !== '' &&
                Array.isArray(q.options) && q.options.every(opt => opt.trim() !== '') &&
                q.correctAnswer >= 0 &&
                q.explanation.trim() !== '';
        };

        const incompleteQuestions = questions.filter(q => !isQuestionComplete(q));
        if (incompleteQuestions.length > 0) {
            toast.error(`Veuillez compléter toutes les questions avant de publier (${incompleteQuestions.length} incomplète(s))`);
            return;
        }

        setLoading(true);
        try {
            const finalQuestionIds: string[] = [];

            // Process questions: create new ones, update existing ones
            for (const question of questions) {
                const questionPayload = {
                    question: question.question,
                    options: question.options,
                    correctAnswer: question.correctAnswer,
                    explanation: question.explanation,
                    category: question.category,
                    difficulty: question.difficulty,
                    image: question.image?.url ?? '',
                };

                let savedQuestion;
                if (mode === 'edit' && question.id) {
                    // Update existing question
                    savedQuestion = await adminService.updateQuestion(question.id, questionPayload);
                } else {
                    // Create new question
                    savedQuestion = await adminService.createQuestion(questionPayload);
                }

                finalQuestionIds.push(savedQuestion.id ?? savedQuestion._id ?? '');
            }

            const testPayload = {
                title: testInfo.title,
                description: testInfo.description,
                category: testInfo.category,
                difficulty: testInfo.difficulty,
                duration: testInfo.duration,
                passThreshold: testInfo.passThreshold,
                questions: finalQuestionIds,
            };

            if (mode === 'edit' && initialData && (initialData.id || initialData._id)) {
                const testId = initialData.id || initialData._id;
                if (testId) {
                    await adminService.updateTest(testId, testPayload);
                    toast.success('Test mis à jour avec succès !');
                } else {
                    throw new Error("ID du test manquant");
                }
            } else {
                await adminService.createTest(testPayload);
                toast.success('Test créé avec succès !');
                localStorage.removeItem('testBuilderDraft');
            }

            onSuccess();
            handleClose();
        } catch (error: any) {
            console.error('Error saving test:', error);
            toast.error(error.message || 'Erreur lors de l\'enregistrement du test');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (mode === 'create' && (testInfo.title || questions.length > 0)) {
            const keepDraft = confirm('Voulez-vous sauvegarder votre brouillon pour continuer plus tard ?');
            if (!keepDraft) {
                localStorage.removeItem('testBuilderDraft');
            }
        }

        // Reset state
        setCurrentStep(1);
        setTestInfo({
            title: '',
            description: '',
            category: 'general',
            difficulty: 'moyen',
            duration: 30,
            passThreshold: 70,
            questionCount: 10,
            enableImages: true,
        });
        setQuestions([]);
        onClose();
    };

    // Keyboard Shortcuts
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
            return;
        }

        if (event.altKey) {
            switch (event.key) {
                case 'ArrowRight':
                    if (currentStep < 3) handleNext();
                    break;
                case 'ArrowLeft':
                    if (currentStep > 1) handlePrevious();
                    break;
                case 'h':
                    setShowShortcuts(prev => !prev);
                    break;
            }
        }

        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            if (mode === 'create') toast.success('Brouillon sauvegardé automatiquement');
        }
    }, [currentStep, mode]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="flex flex-row items-center justify-between">
                    <div>
                        <DialogTitle>{mode === 'edit' ? 'Modifier le Test' : 'Créer un Test Complet'}</DialogTitle>
                        <DialogDescription>
                            {mode === 'edit' ? 'Modifiez les informations et les questions du test.' : 'Créez un test professionnel en 3 étapes : informations, questions, et révision.'}
                        </DialogDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowShortcuts(true)}
                            title="Raccourcis clavier (Alt + H)"
                        >
                            <Keyboard className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExport}
                            title="Exporter en JSON"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Exporter
                        </Button>
                        {mode === 'create' && (
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".json"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleImport}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    title="Importer un JSON"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Importer
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogHeader>

                {/* Stepper */}
                <div className="flex items-center justify-between mb-8">
                    {steps.map((step, index) => (
                        <div key={step.number} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center font-semibold 
                                    transition-all duration-500 ease-in-out transform
                                    ${currentStep > step.number
                                        ? 'bg-green-500 text-white scale-110'
                                        : currentStep === step.number
                                            ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 scale-110 shadow-lg'
                                            : 'bg-muted text-muted-foreground scale-100'
                                    }
                                `}>
                                    {currentStep > step.number ? (
                                        <Check className="w-5 h-5 animate-in zoom-in-50 duration-300" />
                                    ) : (
                                        step.number
                                    )}
                                </div>
                                <div className="mt-2 text-center transition-all duration-300">
                                    <p className={`text-sm font-medium transition-colors duration-300 ${currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                                        }`}>
                                        {step.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`h-0.5 flex-1 mx-4 transition-all duration-500 ease-in-out ${currentStep > step.number ? 'bg-green-500 scale-x-100' : 'bg-muted scale-x-100'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="min-h-[400px]">
                    {currentStep === 1 && (
                        <div className="animate-in fade-in-0 slide-in-from-right-5 duration-300">
                            <Step1TestInfo data={testInfo} onChange={setTestInfo} />
                        </div>
                    )}
                    {currentStep === 2 && (
                        <div className="animate-in fade-in-0 slide-in-from-right-5 duration-300">
                            <Step2Questions
                                questions={questions}
                                onChange={setQuestions}
                                totalQuestions={testInfo.questionCount}
                                enableImages={testInfo.enableImages}
                            />
                        </div>
                    )}
                    {currentStep === 3 && (
                        <div className="animate-in fade-in-0 slide-in-from-right-5 duration-300">
                            <Step3Review
                                testInfo={testInfo}
                                questions={questions}
                                onEditTestInfo={handleEditTestInfo}
                                onEditQuestion={handleEditQuestion}
                                onUpdateQuestions={setQuestions}
                            />
                        </div>
                    )}
                </div>

                {/* Navigation Footer */}
                <div className="flex justify-between pt-6 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={currentStep === 1 ? handleClose : handlePrevious}
                    >
                        {currentStep === 1 ? (
                            'Annuler'
                        ) : (
                            <>
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Précédent
                            </>
                        )}
                    </Button>

                    {currentStep < 3 ? (
                        <Button onClick={handleNext} className="transition-all hover:scale-105">
                            Suivant
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handlePublish}
                            disabled={loading}
                            className="transition-all hover:scale-105 disabled:scale-100"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {mode === 'edit' ? 'Mettre à jour' : 'Publier le Test'}
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    {mode === 'edit' ? 'Mettre à jour' : 'Publier le Test'}
                                </>
                            )}
                        </Button>
                    )}
                </div>

                {/* Shortcuts Dialog */}
                <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Raccourcis Clavier</DialogTitle>
                            <DialogDescription>
                                Naviguez plus rapidement avec ces raccourcis
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-sm font-medium">Suivant</span>
                                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                    <span className="text-xs">Alt</span> + <span className="text-xs">→</span>
                                </kbd>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-sm font-medium">Précédent</span>
                                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                    <span className="text-xs">Alt</span> + <span className="text-xs">←</span>
                                </kbd>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-sm font-medium">Afficher l'aide</span>
                                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                    <span className="text-xs">Alt</span> + <span className="text-xs">H</span>
                                </kbd>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Sauvegarder</span>
                                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                    <span className="text-xs">Ctrl</span> + <span className="text-xs">S</span>
                                </kbd>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </DialogContent>
        </Dialog>
    );
}
