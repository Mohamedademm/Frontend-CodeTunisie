import { useState } from 'react';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Trash2, Eye, EyeOff, Copy, AlertCircle, CheckCircle2 } from 'lucide-react';
import ImageUploader from './ImageUploader';
import OptionEditor from './OptionEditor';
import QuestionPreview from './QuestionPreview';

export interface QuestionData {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    category: string;
    difficulty: string;
    image?: string | {
        url: string;
        filename: string;
        size: number;
    };
    id?: string;
}

interface QuestionCardProps {
    questionNumber: number;
    data: QuestionData;
    onChange: (data: QuestionData) => void;
    onDelete?: () => void;
    onDuplicate?: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    showPreview?: boolean;
}

const DIFFICULTY_CONFIG = {
    facile: { label: 'Facile', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
    moyen: { label: 'Moyen', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
    difficile: { label: 'Difficile', className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800' },
};

export default function QuestionCard({
    questionNumber,
    data,
    onChange,
    onDelete,
    onDuplicate,
    showPreview = false
}: QuestionCardProps) {
    const [isPreviewMode, setIsPreviewMode] = useState(showPreview);

    const handleChange = (field: keyof QuestionData, value: any) => {
        onChange({ ...data, [field]: value });
    };

    const filledOptions = Array.isArray(data.options) ? data.options.filter(opt => (opt || '').trim() !== '') : [];
    const isComplete =
        (data.question || '').trim() !== '' &&
        filledOptions.length >= 2 &&
        typeof data.correctAnswer === 'number' &&
        data.correctAnswer >= 0 &&
        data.correctAnswer < data.options.length &&
        (data.options[data.correctAnswer] || '').trim() !== '' &&
        (data.explanation || '').trim() !== '';

    const diffConfig = DIFFICULTY_CONFIG[data.difficulty as keyof typeof DIFFICULTY_CONFIG];

    return (
        <div className="rounded-2xl border-2 border-border bg-card shadow-sm overflow-hidden transition-all hover:shadow-md">
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-4 bg-muted/40 border-b">
                <div className="flex items-center gap-3">
                    {/* Question number badge */}
                    <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-base shadow-sm">
                        {questionNumber}
                    </div>
                    <div>
                        <h3 className="font-semibold text-base leading-tight">Question {questionNumber}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            {isComplete ? (
                                <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Complète
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                                    <AlertCircle className="w-3.5 h-3.5" /> Incomplète
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    {/* Preview toggle */}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                        className="gap-2 h-8 text-xs"
                    >
                        {isPreviewMode ? (
                            <><EyeOff className="w-3.5 h-3.5" /> Éditer</>
                        ) : (
                            <><Eye className="w-3.5 h-3.5" /> Aperçu</>
                        )}
                    </Button>

                    {onDuplicate && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onDuplicate}
                            title="Dupliquer"
                            className="h-8 w-8 p-0"
                        >
                            <Copy className="w-3.5 h-3.5" />
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onDelete}
                            title="Supprimer"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:border-destructive"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    )}
                </div>
            </div>

            {/* ── Content ── */}
            <div className="p-6">
                {isPreviewMode ? (
                    <QuestionPreview
                        question={data.question}
                        options={data.options}
                        correctAnswer={data.correctAnswer}
                        explanation={data.explanation}
                        image={typeof data.image === 'string' ? { url: data.image } : data.image}
                        category={data.category}
                        difficulty={data.difficulty}
                    />
                ) : (
                    <div className="space-y-6">

                        {/* ── Question Text ── */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold flex items-center gap-2">
                                <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</span>
                                Texte de la question *
                            </Label>
                            <Textarea
                                value={data.question}
                                onChange={(e) => handleChange('question', e.target.value)}
                                placeholder="Ex : Que signifie ce panneau de signalisation ?"
                                required
                                className="min-h-[110px] text-base leading-relaxed resize-none rounded-xl border-2 focus-visible:ring-1 focus-visible:ring-primary"
                            />
                            <div className="flex justify-between">
                                <p className="text-xs text-muted-foreground">Soyez précis et clair dans votre formulation.</p>
                                <p className="text-xs text-muted-foreground">{data.question.length} caractères</p>
                            </div>
                        </div>

                        {/* ── Category & Difficulty ── */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</span>
                                    Catégorie *
                                </Label>
                                <Select
                                    value={data.category}
                                    onValueChange={(v) => handleChange('category', v)}
                                >
                                    <SelectTrigger className="h-11 rounded-xl border-2">
                                        <SelectValue placeholder="Choisir une catégorie" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="signalisation">🚦 Signalisation</SelectItem>
                                        <SelectItem value="regles">📋 Règles de conduite</SelectItem>
                                        <SelectItem value="priorites">⚠️ Priorités</SelectItem>
                                        <SelectItem value="mecanique">🔧 Mécanique</SelectItem>
                                        <SelectItem value="securite">🦺 Sécurité</SelectItem>
                                        <SelectItem value="conduite">🚗 Conduite</SelectItem>
                                        <SelectItem value="infractions">🚫 Infractions</SelectItem>
                                        <SelectItem value="general">📚 Général</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</span>
                                    Difficulté *
                                </Label>
                                <Select
                                    value={data.difficulty}
                                    onValueChange={(v) => handleChange('difficulty', v)}
                                >
                                    <SelectTrigger className="h-11 rounded-xl border-2">
                                        <SelectValue placeholder="Niveau" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="facile">🟢 Facile</SelectItem>
                                        <SelectItem value="moyen">🟡 Moyen</SelectItem>
                                        <SelectItem value="difficile">🔴 Difficile</SelectItem>
                                    </SelectContent>
                                </Select>
                                {diffConfig && (
                                    <Badge variant="outline" className={`text-xs mt-1 ${diffConfig.className}`}>
                                        {diffConfig.label}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* ── Image Upload ── */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold flex items-center gap-2">
                                <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">4</span>
                                Image associée
                                <span className="text-xs font-normal text-muted-foreground">(optionnel)</span>
                            </Label>
                            <ImageUploader
                                currentImage={typeof data.image === 'string' ? { url: data.image, filename: '' } : data.image}
                                onImageUploaded={(imageData) => handleChange('image', imageData)}
                                onImageRemoved={() => handleChange('image', undefined)}
                            />
                        </div>

                        {/* ── Options ── */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold flex items-center gap-2">
                                <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">5</span>
                                Réponses *
                            </Label>
                            <div className="rounded-xl border-2 border-border bg-muted/20 p-4">
                                <OptionEditor
                                    options={data.options}
                                    correctAnswer={data.correctAnswer}
                                    onOptionsChange={(options) => handleChange('options', options)}
                                    onCorrectAnswerChange={(answer) => handleChange('correctAnswer', answer)}
                                />
                            </div>
                        </div>

                        {/* ── Explanation ── */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold flex items-center gap-2">
                                <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">6</span>
                                Explication de la réponse *
                            </Label>
                            <Textarea
                                value={data.explanation}
                                onChange={(e) => handleChange('explanation', e.target.value)}
                                placeholder="Expliquez pourquoi cette réponse est correcte. Cette explication sera affichée après que l'étudiant ait répondu."
                                required
                                className="min-h-[90px] text-sm leading-relaxed resize-none rounded-xl border-2 focus-visible:ring-1 focus-visible:ring-primary"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
