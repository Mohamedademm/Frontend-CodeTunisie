import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import {
    ChevronLeft, ChevronRight, Check, Loader2,
    Download, Upload, ArrowLeft, FileText, HelpCircle, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import adminService from '@/services/adminService';
import Step1TestInfo, { TestInfoData } from './Step1_TestInfo';
import Step2Questions from './Step2_Questions';
import Step3Review from './Step3_Review';
import { QuestionData } from './QuestionCard';

// ─── Types ────────────────────────────────────────────────────────────────────
const STEPS = [
    { number: 1, title: 'Info Test', description: 'Paramètres de base', icon: FileText },
    { number: 2, title: 'Questions', description: 'Création des questions', icon: HelpCircle },
    { number: 3, title: 'Révision', description: 'Vérification finale', icon: CheckCircle2 },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function TestBuilderPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();
    const mode: 'create' | 'edit' = id ? 'edit' : 'create';

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(mode === 'edit');

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
    const [questions, setQuestions] = useState<QuestionData[]>([]);

    // ── Load existing test for edit mode ──────────────────────────────────────
    useEffect(() => {
        if (mode === 'edit' && id) {
            (async () => {
                try {
                    const fullTest = await adminService.getTestById(id);
                    setTestInfo({
                        title: fullTest.title,
                        description: fullTest.description,
                        category: fullTest.category || 'general',
                        difficulty: fullTest.difficulty || 'moyen',
                        duration: fullTest.duration,
                        passThreshold: fullTest.passThreshold || 70,
                        questionCount: Array.isArray(fullTest.questions) ? fullTest.questions.length : 10,
                        enableImages: true,
                    });

                    const qs: QuestionData[] = (Array.isArray(fullTest.questions) ? fullTest.questions : [])
                        .filter((q: any) => typeof q !== 'string')
                        .map((q: any) => {
                            let opts: string[] = Array.isArray(q.options) ? [...q.options] : [];
                            // Ensure exactly 4 options by padding or slicing
                            while (opts.length < 4) opts.push('');
                            if (opts.length > 4) opts = opts.slice(0, 4);

                            // Robust mapping: try to find the match ignoring whitespace and case
                            let correctIdx: number = -1;
                            if (typeof q.correctAnswer === 'number') {
                                correctIdx = q.correctAnswer;
                            } else if (typeof q.correctAnswer === 'string') {
                                const target = q.correctAnswer.trim().toLowerCase();
                                const idx = opts.findIndex(o => o.trim().toLowerCase() === target);
                                if (idx !== -1) {
                                    correctIdx = idx;
                                } else if (!isNaN(parseInt(q.correctAnswer, 10))) {
                                    const parsed = parseInt(q.correctAnswer, 10);
                                    if (parsed >= 0 && parsed < 4) correctIdx = parsed;
                                }
                            }

                            return {
                                id: q._id || q.id,
                                question: q.question || '',
                                options: opts,
                                correctAnswer: correctIdx,
                                explanation: q.explanation || '',
                                category: q.category || 'general',
                                difficulty: q.difficulty || 'moyen',
                                image: q.image,
                            };
                        });
                    setQuestions(qs);
                } catch {
                    toast.error('Impossible de charger le test');
                    navigate('/admin/tests');
                } finally {
                    setInitialLoading(false);
                }
            })();
        } else {
            // Draft restore for create mode
            const savedDraft = localStorage.getItem('testBuilderDraft');
            if (savedDraft) {
                try {
                    const draft = JSON.parse(savedDraft);
                    const age = Date.now() - new Date(draft.timestamp).getTime();
                    if (age < 3600000 && draft.testInfo?.title) {
                        setTestInfo(draft.testInfo);
                        setQuestions(draft.questions || []);
                        setCurrentStep(draft.currentStep || 1);
                        toast.info('Brouillon restauré', { description: 'Votre travail précédent a été récupéré' });
                    }
                } catch { /* ignore */ }
            }
        }
    }, [id, mode, navigate]);

    // ── Auto-save draft (create only) ─────────────────────────────────────────
    useEffect(() => {
        if (mode === 'create' && (testInfo.title || questions.length > 0)) {
            localStorage.setItem('testBuilderDraft', JSON.stringify({
                testInfo, questions, currentStep, timestamp: new Date().toISOString()
            }));
        }
    }, [testInfo, questions, currentStep, mode]);

    // ── Navigation ────────────────────────────────────────────────────────────
    const handleNext = () => {
        if (currentStep === 1) {
            if (!testInfo.title.trim()) { toast.error('Le titre est requis'); return; }
            if (!testInfo.description.trim()) { toast.error('La description est requise'); return; }
        }
        if (currentStep === 2) {
            const incomplete = questions.filter(q => {
                const filled = q.options.filter(o => o.trim());
                return !q.question.trim() ||
                    filled.length < 2 ||
                    q.correctAnswer < 0 ||
                    q.correctAnswer >= q.options.length ||
                    !q.options[q.correctAnswer]?.trim() ||
                    !q.explanation.trim();
            }).length;
            if (incomplete > 0) toast.warning(`${incomplete} question(s) incomplète(s). Vérifiez avant de publier.`);
        }
        setCurrentStep(s => Math.min(3, s + 1));
    };

    const handlePrevious = () => setCurrentStep(s => Math.max(1, s - 1));

    // ── Export / Import ───────────────────────────────────────────────────────
    const handleExport = () => {
        const blob = new Blob([JSON.stringify({ testInfo, questions, version: '1.0', exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
        const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `test-${Date.now()}.json` });
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        toast.success('Test exporté');
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target?.result as string);
                if (!data.testInfo || !Array.isArray(data.questions)) throw new Error();
                setTestInfo(data.testInfo); setQuestions(data.questions); setCurrentStep(1);
                toast.success('Test importé');
            } catch { toast.error('Format de fichier invalide'); }
            e.target.value = '';
        };
        reader.readAsText(file);
    };

    // ── Publish ───────────────────────────────────────────────────────────────
    const handlePublish = async () => {
        const incomplete = questions.filter(q => {
            const filled = q.options.filter(o => o.trim());
            return !q.question.trim() ||
                filled.length < 2 ||
                q.correctAnswer < 0 ||
                q.correctAnswer >= q.options.length ||
                !q.options[q.correctAnswer]?.trim() ||
                !q.explanation.trim();
        });
        if (incomplete.length) {
            toast.error(`${incomplete.length} question(s) incomplète(s). Complétez-les avant de publier.`);
            return;
        }

        setLoading(true);
        try {
            const finalIds: string[] = [];
            for (const q of questions) {
                // To maintain the correct index, we must find which non-empty option was selected
                const selectedText = q.options[q.correctAnswer] || '';
                const filledOptions = q.options.filter(o => o.trim());
                const finalCorrectIdx = filledOptions.indexOf(selectedText);

                const payload = {
                    question: q.question,
                    options: filledOptions,
                    correctAnswer: finalCorrectIdx !== -1 ? finalCorrectIdx : 0,
                    explanation: q.explanation,
                    category: q.category,
                    difficulty: q.difficulty,
                    image: typeof q.image === 'object' && q.image !== null ? q.image : (q.image ? { url: q.image } : { url: '' }),
                };
                const saved = mode === 'edit' && q.id
                    ? await adminService.updateQuestion(q.id, payload)
                    : await adminService.createQuestion(payload);
                finalIds.push(saved.id ?? saved._id ?? '');
            }

            const testPayload = {
                title: testInfo.title, description: testInfo.description,
                category: testInfo.category, difficulty: testInfo.difficulty,
                duration: testInfo.duration, passThreshold: testInfo.passThreshold,
                questions: finalIds,
            };

            if (mode === 'edit' && id) {
                await adminService.updateTest(id, testPayload);
                toast.success('Test mis à jour avec succès !');
            } else {
                await adminService.createTest(testPayload);
                toast.success('Test créé avec succès !');
                localStorage.removeItem('testBuilderDraft');
            }
            navigate('/admin/tests');
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de l\'enregistrement');
        } finally {
            setLoading(false);
        }
    };

    // ── Cancel ────────────────────────────────────────────────────────────────
    const handleCancel = () => {
        if (mode === 'create' && (testInfo.title || questions.length > 0)) {
            if (!confirm('Voulez-vous conserver le brouillon ?')) {
                localStorage.removeItem('testBuilderDraft');
            }
        }
        navigate('/admin/tests');
    };

    // ── Keyboard shortcuts ────────────────────────────────────────────────────
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        if (e.altKey && e.key === 'ArrowRight' && currentStep < 3) handleNext();
        if (e.altKey && e.key === 'ArrowLeft' && currentStep > 1) handlePrevious();
    }, [currentStep]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // ─── Loading skeleton ─────────────────────────────────────────────────────
    if (initialLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-base font-medium">Chargement du test...</p>
                </div>
            </div>
        );
    }

    // ─── Main render ──────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col min-h-full">

            {/* ── Top Bar ─────────────────────────────────────────────────── */}
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b shadow-sm">
                <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
                    {/* Back + Title */}
                    <div className="flex items-center gap-3 min-w-0">
                        <Button variant="ghost" size="sm" onClick={handleCancel} className="gap-2 shrink-0">
                            <ArrowLeft className="w-4 h-4" /> Retour
                        </Button>
                        <div className="w-px h-6 bg-border shrink-0" />
                        <div className="min-w-0">
                            <h1 className="text-lg font-bold leading-tight truncate">
                                {mode === 'edit' ? 'Modifier le Test' : 'Créer un Test Complet'}
                            </h1>
                            <p className="text-xs text-muted-foreground hidden sm:block">
                                {mode === 'edit'
                                    ? 'Modifiez les informations et les questions du test'
                                    : 'Créez un test professionnel en 3 étapes'}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 hidden sm:flex">
                            <Download className="w-4 h-4" /> Exporter
                        </Button>
                        {mode === 'create' && (
                            <div className="relative hidden sm:block">
                                <input type="file" accept=".json" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImport} />
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Upload className="w-4 h-4" /> Importer
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Stepper ─────────────────────────────────────────────────── */}
            <div className="bg-muted/30 border-b">
                <div className="max-w-screen-2xl mx-auto px-6 py-5">
                    <div className="flex items-center justify-center gap-0 max-w-2xl mx-auto">
                        {STEPS.map((step, index) => {
                            const Icon = step.icon;
                            const isDone = currentStep > step.number;
                            const isActive = currentStep === step.number;

                            return (
                                <div key={step.number} className="flex items-center flex-1">
                                    {/* Step indicator */}
                                    <div className="flex flex-col items-center flex-1 gap-2">
                                        <div className={`
                                            w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg
                                            transition-all duration-400 shadow-sm
                                            ${isDone
                                                ? 'bg-green-500 text-white scale-100 shadow-green-200 dark:shadow-green-900'
                                                : isActive
                                                    ? 'bg-primary text-primary-foreground scale-110 ring-4 ring-primary/20 shadow-primary/20'
                                                    : 'bg-muted text-muted-foreground scale-95'}
                                        `}>
                                            {isDone ? <Check className="w-7 h-7" /> : isActive ? <Icon className="w-7 h-7" /> : step.number}
                                        </div>
                                        <div className="text-center">
                                            <p className={`text-sm font-semibold transition-colors ${isActive || isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {step.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground hidden sm:block">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Connector */}
                                    {index < STEPS.length - 1 && (
                                        <div className={`h-1 flex-1 mx-3 rounded-full transition-all duration-500 ${isDone ? 'bg-green-500' : 'bg-muted'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Step Content ────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-screen-2xl mx-auto px-6 py-8">
                    {currentStep === 1 && (
                        <div className="animate-in fade-in-0 slide-in-from-right-4 duration-300 max-w-3xl mx-auto">
                            <Step1TestInfo data={testInfo} onChange={setTestInfo} />
                        </div>
                    )}
                    {currentStep === 2 && (
                        <div className="animate-in fade-in-0 slide-in-from-right-4 duration-300">
                            <Step2Questions
                                questions={questions}
                                onChange={setQuestions}
                                totalQuestions={testInfo.questionCount}
                                enableImages={testInfo.enableImages}
                            />
                        </div>
                    )}
                    {currentStep === 3 && (
                        <div className="animate-in fade-in-0 slide-in-from-right-4 duration-300 max-w-5xl mx-auto">
                            <Step3Review
                                testInfo={testInfo}
                                questions={questions}
                                onEditTestInfo={() => setCurrentStep(1)}
                                onEditQuestion={() => setCurrentStep(2)}
                                onUpdateQuestions={setQuestions}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* ── Navigation Footer ───────────────────────────────────────── */}
            <div className="sticky bottom-0 z-20 bg-background/95 backdrop-blur border-t shadow-lg">
                <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Left */}
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={currentStep === 1 ? handleCancel : handlePrevious}
                        className="gap-2 min-w-[140px]"
                    >
                        {currentStep === 1 ? (
                            <><ArrowLeft className="w-4 h-4" /> Annuler</>
                        ) : (
                            <><ChevronLeft className="w-4 h-4" /> Précédent</>
                        )}
                    </Button>

                    {/* Step counter */}
                    <div className="flex items-center gap-2">
                        {STEPS.map(s => (
                            <div key={s.number} className={`w-2 h-2 rounded-full transition-all duration-300 ${currentStep === s.number ? 'bg-primary scale-125' : currentStep > s.number ? 'bg-green-500' : 'bg-muted'}`} />
                        ))}
                    </div>

                    {/* Right */}
                    {currentStep < 3 ? (
                        <Button size="lg" onClick={handleNext} className="gap-2 min-w-[140px] transition-all hover:scale-[1.02]">
                            Suivant <ChevronRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button
                            size="lg"
                            onClick={handlePublish}
                            disabled={loading}
                            className="gap-2 min-w-[180px] transition-all hover:scale-[1.02] disabled:scale-100 bg-green-600 hover:bg-green-700"
                        >
                            {loading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</>
                            ) : (
                                <><Check className="w-4 h-4" /> {mode === 'edit' ? 'Mettre à jour' : 'Publier le Test'}</>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
