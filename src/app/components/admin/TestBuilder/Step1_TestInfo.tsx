import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';

export interface TestInfoData {
    title: string;
    description: string;
    category: string;
    difficulty: string;
    duration: number;
    passThreshold: number;
    questionCount: number;
    enableImages: boolean;
}

interface Step1TestInfoProps {
    data: TestInfoData;
    onChange: (data: TestInfoData) => void;
}

export default function Step1TestInfo({ data, onChange }: Step1TestInfoProps) {
    const handleChange = (field: keyof TestInfoData, value: any) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold mb-2">Informations du Test</h2>
                <p className="text-muted-foreground">
                    Définissez les paramètres de base de votre test
                </p>
            </div>

            <div className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                    <Label htmlFor="title">Titre du Test *</Label>
                    <Input
                        id="title"
                        value={data.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="Ex: Examen Blanc N°1"
                        required
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Décrivez brièvement le contenu du test..."
                        className="h-24"
                        required
                    />
                </div>

                {/* Category and Difficulty */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Catégorie *</Label>
                        <Select value={data.category} onValueChange={(v) => handleChange('category', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="general">Général / Examens</SelectItem>
                                <SelectItem value="conduite">Conduite</SelectItem>
                                <SelectItem value="regles">Règles (Code)</SelectItem>
                                <SelectItem value="signalisation">Signalisation</SelectItem>
                                <SelectItem value="priorites">Priorités</SelectItem>
                                <SelectItem value="infractions">Infractions</SelectItem>
                                <SelectItem value="securite">Sécurité</SelectItem>
                                <SelectItem value="mecanique">Mécanique</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Difficulté *</Label>
                        <Select value={data.difficulty} onValueChange={(v) => handleChange('difficulty', v)}>
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

                {/* Duration and Pass Threshold */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="duration">Durée (minutes) *</Label>
                        <Input
                            id="duration"
                            type="number"
                            min="1"
                            value={data.duration}
                            onChange={(e) => handleChange('duration', Number(e.target.value))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="passThreshold">Seuil de réussite (%) *</Label>
                        <Input
                            id="passThreshold"
                            type="number"
                            min="1"
                            max="100"
                            value={data.passThreshold}
                            onChange={(e) => handleChange('passThreshold', Number(e.target.value))}
                        />
                    </div>
                </div>

                {/* Question Count */}
                <div className="space-y-2">
                    <Label htmlFor="questionCount">Nombre de questions *</Label>
                    <Input
                        id="questionCount"
                        type="number"
                        min="1"
                        max="50"
                        value={data.questionCount}
                        onChange={(e) => handleChange('questionCount', Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                        Vous créerez {data.questionCount} question{data.questionCount > 1 ? 's' : ''} à l'étape suivante
                    </p>
                </div>

                {/* Enable Images */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                    <div className="space-y-0.5">
                        <Label htmlFor="enableImages" className="text-base">
                            Activer les images
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Permettre l'ajout d'images aux questions
                        </p>
                    </div>
                    <Switch
                        id="enableImages"
                        checked={data.enableImages}
                        onCheckedChange={(checked) => handleChange('enableImages', checked)}
                    />
                </div>
            </div>
        </div>
    );
}
