import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Trash2, Eye, EyeOff, Copy, ArrowUp, ArrowDown } from 'lucide-react';
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

export default function QuestionCard({
    questionNumber,
    data,
    onChange,
    onDelete,
    onDuplicate,
    onMoveUp,
    onMoveDown,
    showPreview = false
}: QuestionCardProps) {
    const [isPreviewMode, setIsPreviewMode] = useState(showPreview);

    const handleChange = (field: keyof QuestionData, value: any) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50 py-3 px-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="h-7 w-7 flex items-center justify-center rounded-full p-0">
                            {questionNumber}
                        </Badge>
                        <h3 className="font-semibold">
                            Question {questionNumber}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {onMoveUp && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onMoveUp}
                                title="Monter la question"
                            >
                                <ArrowUp className="w-4 h-4" />
                            </Button>
                        )}
                        {onMoveDown && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onMoveDown}
                                title="Descendre la question"
                            >
                                <ArrowDown className="w-4 h-4" />
                            </Button>
                        )}
                        <div className="w-px h-4 bg-border mx-1" />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsPreviewMode(!isPreviewMode)}
                        >
                            {isPreviewMode ? (
                                <>
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    Éditer
                                </>
                            ) : (
                                <>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Aperçu
                                </>
                            )}
                        </Button>
                        {onDuplicate && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onDuplicate}
                                title="Dupliquer la question"
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onDelete}
                                className="text-destructive hover:text-destructive"
                                title="Supprimer la question"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4">
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
                    <div className="space-y-4">
                        {/* Question text */}
                        <div className="space-y-2">
                            <Label>Question *</Label>
                            <Textarea
                                value={data.question}
                                onChange={(e) => handleChange('question', e.target.value)}
                                placeholder="Entrez votre question ici..."
                                required
                                className="min-h-[80px]"
                            />
                            <p className="text-xs text-muted-foreground">
                                {data.question.length} caractères
                            </p>
                        </div>

                        {/* Image upload */}
                        <ImageUploader
                            currentImage={typeof data.image === 'string' ? { url: data.image, filename: '' } : data.image}
                            onImageUploaded={(imageData) => handleChange('image', imageData)}
                            onImageRemoved={() => handleChange('image', undefined)}
                        />

                        {/* Options editor */}
                        <OptionEditor
                            options={data.options}
                            correctAnswer={data.correctAnswer}
                            onOptionsChange={(options) => handleChange('options', options)}
                            onCorrectAnswerChange={(answer) => handleChange('correctAnswer', answer)}
                        />

                        {/* Category and Difficulty */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Catégorie *</Label>
                                <Select
                                    value={data.category}
                                    onValueChange={(v) => handleChange('category', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Catégorie" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="signalisation">Signalisation</SelectItem>
                                        <SelectItem value="regles">Règles</SelectItem>
                                        <SelectItem value="priorites">Priorités</SelectItem>
                                        <SelectItem value="mecanique">Mécanique</SelectItem>
                                        <SelectItem value="securite">Sécurité</SelectItem>
                                        <SelectItem value="conduite">Conduite</SelectItem>
                                        <SelectItem value="infractions">Infractions</SelectItem>
                                        <SelectItem value="general">Général</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Difficulté *</Label>
                                <Select
                                    value={data.difficulty}
                                    onValueChange={(v) => handleChange('difficulty', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Niveau" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="facile">Facile</SelectItem>
                                        <SelectItem value="moyen">Moyen</SelectItem>
                                        <SelectItem value="difficile">Difficile</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Explanation */}
                        <div className="space-y-2">
                            <Label>Explication *</Label>
                            <Textarea
                                value={data.explanation}
                                onChange={(e) => handleChange('explanation', e.target.value)}
                                placeholder="Expliquez pourquoi cette réponse est correcte..."
                                required
                                className="min-h-[60px]"
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
