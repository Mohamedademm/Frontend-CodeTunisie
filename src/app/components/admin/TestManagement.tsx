import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { adminService } from '@/services/adminService';
import { Test, Question } from '@/app/types';
import { toast } from 'sonner';

export function TestManagement() {
    const [activeTab, setActiveTab] = useState('tests');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // Data states
    const [tests, setTests] = useState<Test[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);

    // Form states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'tests') {
                const data = await adminService.getTests();
                setTests(data);
            } else if (activeTab === 'questions') {
                const data = await adminService.getQuestions();
                setQuestions(data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors du chargement des données");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, type: 'test' | 'question') => {
        if (!confirm("Êtes-vous sûr ?")) return;
        try {
            if (type === 'test') await adminService.deleteTest(id);
            if (type === 'question') await adminService.deleteQuestion(id);
            toast.success("Suppression réussie");
            loadData();
        } catch (error) {
            toast.error("Erreur lors de la suppression");
        }
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };

    const TestForm = ({ onClose }: { onClose: () => void }) => {
        const [formData, setFormData] = useState({
            title: editingItem?.title || '',
            description: editingItem?.description || '',
            category: editingItem?.category || '',
            difficulty: editingItem?.difficulty || 'intermédiaire',
            duration: editingItem?.duration || 30,
            passThreshold: editingItem?.passThreshold || 70,
            questionsCount: (Array.isArray(editingItem?.questions) ? editingItem.questions.length : editingItem?.questions) || 0,
        });

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            try {
                if (editingItem) {
                    await adminService.updateTest(editingItem.id || editingItem._id, formData);
                    toast.success("Test mis à jour");
                } else {
                    await adminService.createTest(formData);
                    toast.success("Test créé");
                }
                onClose();
                loadData();
            } catch (error) {
                console.error(error);
                toast.error("Erreur lors de l'enregistrement");
            }
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label>Titre</Label>
                    <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div>
                    <Label>Description</Label>
                    <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Catégorie</Label>
                        <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                            <SelectTrigger><SelectValue placeholder="Catégorie" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Code de la route">Code de la route</SelectItem>
                                <SelectItem value="Conduite">Conduite</SelectItem>
                                <SelectItem value="Examens">Examens Blancs</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Difficulté</Label>
                        <Select value={formData.difficulty} onValueChange={v => setFormData({ ...formData, difficulty: v })}>
                            <SelectTrigger><SelectValue placeholder="Niveau" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="débutant">Débutant</SelectItem>
                                <SelectItem value="intermédiaire">Intermédiaire</SelectItem>
                                <SelectItem value="avancé">Avancé</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Durée (minutes)</Label>
                        <Input type="number" value={formData.duration} onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })} />
                    </div>
                    <div>
                        <Label>Seuil de réussite (%)</Label>
                        <Input type="number" value={formData.passThreshold} onChange={e => setFormData({ ...formData, passThreshold: Number(e.target.value) })} />
                    </div>
                </div>
                <Button type="submit" className="w-full">{editingItem ? 'Mettre à jour' : 'Créer'}</Button>
            </form>
        );
    };

    const QuestionForm = ({ onClose }: { onClose: () => void }) => {
        const [formData, setFormData] = useState({
            question: editingItem?.question || '',
            category: editingItem?.category || '',
            difficulty: editingItem?.difficulty || 'intermédiaire',
            correctAnswer: editingItem?.correctAnswer || '',
            explanation: editingItem?.explanation || '',
            options: editingItem?.options || ['', '', '', ''],
        });

        const handleOptionChange = (index: number, value: string) => {
            const newOptions = [...formData.options];
            newOptions[index] = value;
            setFormData({ ...formData, options: newOptions });
        };

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            try {
                if (editingItem) {
                    await adminService.updateQuestion(editingItem.id || editingItem._id, formData);
                    toast.success("Question mise à jour");
                } else {
                    await adminService.createQuestion(formData);
                    toast.success("Question ajoutée");
                }
                onClose();
                loadData();
            } catch (error) {
                console.error(error);
                toast.error("Erreur lors de l'enregistrement");
            }
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label>Question</Label>
                    <Textarea value={formData.question} onChange={e => setFormData({ ...formData, question: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Catégorie</Label>
                        <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                            <SelectTrigger><SelectValue placeholder="Catégorie" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Signalisation">Signalisation</SelectItem>
                                <SelectItem value="Priorité">Priorité</SelectItem>
                                <SelectItem value="Règles">Règles</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Difficulté</Label>
                        <Select value={formData.difficulty} onValueChange={v => setFormData({ ...formData, difficulty: v })}>
                            <SelectTrigger><SelectValue placeholder="Niveau" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="facile">Facile</SelectItem>
                                <SelectItem value="moyen">Moyen</SelectItem>
                                <SelectItem value="difficile">Difficile</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Options de réponse</Label>
                    {formData.options.map((opt: string, i: number) => (
                        <div key={i} className="flex gap-2">
                            <Input placeholder={`Option ${i + 1}`} value={opt} onChange={e => handleOptionChange(i, e.target.value)} required />
                            <input
                                type="radio"
                                name="correctAnswer"
                                checked={formData.correctAnswer === opt && opt !== ''}
                                onChange={() => setFormData({ ...formData, correctAnswer: opt })}
                                className="mt-3"
                            />
                        </div>
                    ))}
                    <p className="text-xs text-gray-500">Sélectionnez la bonne réponse en cochant le bouton radio.</p>
                </div>

                <div>
                    <Label>Explication</Label>
                    <Textarea value={formData.explanation} onChange={e => setFormData({ ...formData, explanation: e.target.value })} placeholder="Expliquez pourquoi c'est la bonne réponse..." />
                </div>

                <Button type="submit" className="w-full">{editingItem ? 'Mettre à jour' : 'Ajouter'}</Button>
            </form>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder={`Rechercher dans ${activeTab}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingItem(null); }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2" onClick={() => setEditingItem(null)}>
                            <Plus className="w-4 h-4" />
                            Nouveau {activeTab === 'tests' ? 'Test' : 'Question'}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Modifier' : 'Créer'} {activeTab === 'tests' ? 'un test' : 'une question'}</DialogTitle>
                        </DialogHeader>
                        {activeTab === 'tests' ? <TestForm onClose={() => setIsDialogOpen(false)} /> : <QuestionForm onClose={() => setIsDialogOpen(false)} />}
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="tests">Tests</TabsTrigger>
                    <TabsTrigger value="questions">Banque de Questions</TabsTrigger>
                </TabsList>

                <TabsContent value="tests">
                    <Card>
                        <CardHeader>
                            <CardTitle>Liste des Tests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Titre</TableHead>
                                        <TableHead>Catégorie</TableHead>
                                        <TableHead>Difficulté</TableHead>
                                        <TableHead>Questions</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tests.map(test => (
                                        <TableRow key={test.id || test._id}>
                                            <TableCell className="font-medium">{test.title}</TableCell>
                                            <TableCell><Badge variant="outline">{test.category}</Badge></TableCell>
                                            <TableCell>{test.difficulty}</TableCell>
                                            <TableCell>{(Array.isArray(test.questions) ? test.questions.length : test.questions) || 0}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(test)}><Edit className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(test.id || test._id || '', 'test')}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {tests.length === 0 && !loading && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">Aucun test trouvé</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="questions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Banque de Questions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[400px]">Question</TableHead>
                                        <TableHead>Catégorie</TableHead>
                                        <TableHead>Difficulté</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {questions.map(q => (
                                        <TableRow key={q.id || q._id}>
                                            <TableCell className="font-medium truncate max-w-[400px]" title={q.question}>{q.question}</TableCell>
                                            <TableCell><Badge variant="outline">{q.category}</Badge></TableCell>
                                            <TableCell>{q.difficulty}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(q)}><Edit className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(q.id || q._id || '', 'question')}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {questions.length === 0 && !loading && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-gray-500">Aucune question trouvée</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
