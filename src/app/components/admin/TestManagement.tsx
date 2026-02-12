import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, FileText, HelpCircle, CheckCircle, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import { adminService } from '@/services/adminService';
import { Test, Question } from '@/app/types';
import { toast } from 'sonner';
import TestBuilderWizard from './TestBuilder/TestBuilderWizard';

export function TestManagement() {
    const [activeTab, setActiveTab] = useState('tests');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // Filter & Sort States
    const [difficultyFilter, setDifficultyFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'title', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Data states
    const [tests, setTests] = useState<Test[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);

    // Form states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [wizardMode, setWizardMode] = useState<'create' | 'edit'>('create');
    const [editingTestQuestions, setEditingTestQuestions] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []); // Load once on mount, or when we explicitly call loadData via refresh actions

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch both for Stats and Test Builder
            const [testsData, questionsData] = await Promise.all([
                adminService.getTests(),
                adminService.getQuestions()
            ]);
            setTests(testsData);
            setQuestions(questionsData);
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

    const handleEdit = async (item: any) => {
        if (activeTab === 'tests') {
            try {
                // Fetch full test details to ensure we have all questions and correct data
                const fullTest = await adminService.getTestById(item.id || item._id);

                // Prepared data for Test Builder Wizard
                const testQuestions = Array.isArray(fullTest.questions) ? fullTest.questions : [];

                // Map question objects to full QuestionData objects
                const fullQuestionsData = testQuestions.map((q: any) => {
                    // Normalize question object (handle if it's just an ID - though getTestById should populate)
                    if (typeof q === 'string') return null; // Should be populated

                    return {
                        id: q._id || q.id,
                        question: q.question,
                        options: q.options,
                        correctAnswer: typeof q.correctAnswer === 'string' ? parseInt(q.correctAnswer) || 0 : q.correctAnswer,
                        explanation: q.explanation,
                        category: q.category || 'general',
                        difficulty: q.difficulty || 'moyen',
                        // Fix Image Mapping: preserve object or string, don't force stringification of objects
                        image: q.image
                    };
                }).filter(Boolean);

                setEditingItem(fullTest);
                setEditingTestQuestions(fullQuestionsData);
                setWizardMode('edit');
                setIsWizardOpen(true);
            } catch (error) {
                console.error("Error loading test details:", error);
                toast.error("Impossible de charger les détails du test");
            }
        } else {
            setEditingItem(item);
            setIsDialogOpen(true);
        }
    };

    // --- Stats Calculation ---
    const stats = useMemo(() => {
        const totalTests = tests.length;
        const totalQuestions = questions.length;
        // Basic approximation if we haven't loaded questions but are on tests tab
        // Ideally we'd have a backend stats endpoint.

        return {
            totalTests,
            totalQuestions,
            avgDuration: totalTests > 0 ? Math.round(tests.reduce((acc, t) => acc + (t.duration || 0), 0) / totalTests) : 0
        };
    }, [tests, questions]);

    // --- Filtering & Sorting ---
    const filteredData = useMemo(() => {
        let result: any[] = activeTab === 'tests' ? [...tests] : [...questions];

        // 1. Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(item =>
                (item.title && item.title.toLowerCase().includes(lowerQuery)) ||
                (item.question && item.question.toLowerCase().includes(lowerQuery))
            );
        }

        // 2. Filter Difficulty
        if (difficultyFilter !== 'all') {
            result = result.filter(item => item.difficulty === difficultyFilter);
        }

        // 3. Sort
        result.sort((a, b) => {
            const getKey = (item: any) => activeTab === 'tests' ? (item[sortConfig.key] || '') : (item[sortConfig.key === 'title' ? 'question' : sortConfig.key] || '');

            const aValue = getKey(a);
            const bValue = getKey(b);

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [tests, questions, activeTab, searchQuery, difficultyFilter, sortConfig]);

    // --- Pagination ---
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSort = (key: string) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const TestForm = ({ onClose }: { onClose: () => void }) => {
        const [formData, setFormData] = useState({
            title: editingItem?.title || '',
            description: editingItem?.description || '',
            category: editingItem?.category || 'general',
            difficulty: editingItem?.difficulty || 'moyen',
            duration: editingItem?.duration || 30,
            passThreshold: editingItem?.passThreshold || 70,
        });

        // State for selected questions
        const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>(
            editingItem?.questions ? (Array.isArray(editingItem.questions) ? editingItem.questions.map((q: any) => typeof q === 'string' ? q : q._id || q.id) : []) : []
        );
        const [isQuestionSelectorOpen, setIsQuestionSelectorOpen] = useState(false);
        const [questionSearch, setQuestionSearch] = useState('');

        // Filter available questions (exclude already selected)
        const availableQuestions = questions.filter(q =>
            !selectedQuestionIds.includes(q.id || q._id || '') &&
            (q.question?.toLowerCase().includes(questionSearch.toLowerCase()) || q.category?.toLowerCase().includes(questionSearch.toLowerCase()))
        );

        // Get full objects of selected questions for display
        const selectedQuestionsList = questions.filter(q => selectedQuestionIds.includes(q.id || q._id || ''));

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();

            if (selectedQuestionIds.length === 0) {
                toast.error("Veuillez sélectionner au moins une question pour le test.");
                return;
            }

            const payload = {
                ...formData,
                questions: selectedQuestionIds
            };

            try {
                if (editingItem) {
                    await adminService.updateTest(editingItem.id || editingItem._id, payload);
                    toast.success("Test mis à jour");
                } else {
                    await adminService.createTest(payload);
                    toast.success("Test créé");
                }
                onClose();
                loadData();
            } catch (error) {
                console.error(error);
                toast.error("Erreur lors de l'enregistrement");
            }
        };

        const toggleQuestion = (id: string) => {
            if (selectedQuestionIds.includes(id)) {
                setSelectedQuestionIds(prev => prev.filter(qId => qId !== id));
            } else {
                setSelectedQuestionIds(prev => [...prev, id]);
            }
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Titre du Test</Label>
                            <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required placeholder="Ex: Examen Blanc N°1" />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brève description..." className="h-24" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Durée (min)</Label>
                                <Input type="number" min="1" value={formData.duration} onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Seuil (%)</Label>
                                <Input type="number" min="1" max="100" value={formData.passThreshold} onChange={e => setFormData({ ...formData, passThreshold: Number(e.target.value) })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Catégorie</Label>
                                <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                                    <SelectTrigger><SelectValue placeholder="Catégorie" /></SelectTrigger>
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
                    </div>

                    {/* Question Builder Section */}
                    <div className="border rounded-md p-4 bg-muted/10 flex flex-col h-[500px]">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="font-semibold">Questions ({selectedQuestionIds.length})</h3>
                                <p className="text-xs text-muted-foreground">Gérez les questions du test</p>
                            </div>
                            <Dialog open={isQuestionSelectorOpen} onOpenChange={setIsQuestionSelectorOpen}>
                                <DialogTrigger asChild>
                                    <Button type="button" variant="outline" size="sm" className="gap-2">
                                        <Plus className="w-4 h-4" /> Ajouter
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
                                    <DialogHeader>
                                        <DialogTitle>Sélectionner des questions</DialogTitle>
                                        <DialogDescription>
                                            Recherchez et ajoutez des questions à votre test.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex items-center gap-2 py-4">
                                        <Search className="w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Rechercher par question ou catégorie..."
                                            value={questionSearch}
                                            onChange={(e) => setQuestionSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex-1 overflow-y-auto border rounded-md">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[50px]"></TableHead>
                                                    <TableHead>Question</TableHead>
                                                    <TableHead>Catégorie</TableHead>
                                                    <TableHead>Diff.</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {availableQuestions.map(q => (
                                                    <TableRow key={q.id || q._id} className="cursor-pointer hover:bg-muted/50" onClick={() => toggleQuestion(q.id || q._id || '')}>
                                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                                            <div className="flex items-center space-x-2">
                                                                <Button size="sm" variant="ghost" onClick={() => toggleQuestion(q.id || q._id || '')}>
                                                                    <Plus className="w-4 h-4 text-green-600" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            <div className="line-clamp-2" title={q.question}>{q.question}</div>
                                                        </TableCell>
                                                        <TableCell><Badge variant="outline">{q.category}</Badge></TableCell>
                                                        <TableCell>{q.difficulty}</TableCell>
                                                    </TableRow>
                                                ))}
                                                {availableQuestions.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                            Aucune question trouvée.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {selectedQuestionsList.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
                                    <HelpCircle className="w-8 h-8 mb-2 opacity-50" />
                                    <p className="text-sm text-center">Aucune question sélectionnée.</p>
                                    <Button type="button" variant="link" onClick={() => setIsQuestionSelectorOpen(true)}>
                                        Ouvrir le sélecteur
                                    </Button>
                                </div>
                            ) : (
                                selectedQuestionsList.map((q, index) => (
                                    <div key={q.id || q._id} className="group flex items-start justify-between p-3 bg-card border rounded-lg shadow-sm hover:shadow-md transition-all">
                                        <div className="flex gap-3 overflow-hidden">
                                            <Badge variant="secondary" className="h-6 w-6 flex items-center justify-center rounded-full p-0 flex-shrink-0">
                                                {index + 1}
                                            </Badge>
                                            <div>
                                                <p className="font-medium text-sm line-clamp-2" title={q.question}>{q.question}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <Badge variant="outline" className="text-[10px] px-1 py-0">{q.category}</Badge>
                                                    <span className="text-[10px] text-muted-foreground flex items-center bg-muted px-1 rounded">{q.difficulty}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => toggleQuestion(q.id || q._id || '')}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button type="button" variant="ghost" onClick={onClose} className="mr-2">Annuler</Button>
                    <Button type="submit" disabled={loading}>{editingItem ? 'Mettre à jour le Test' : 'Créer le Test'}</Button>
                </div>
            </form>
        );
    };

    const QuestionForm = ({ onClose }: { onClose: () => void }) => {
        const [formData, setFormData] = useState({
            question: editingItem?.question || '',
            category: editingItem?.category || 'signalisation',
            difficulty: editingItem?.difficulty || 'moyen',
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
                <div className="space-y-2">
                    <Label>Question</Label>
                    <Textarea value={formData.question} onChange={e => setFormData({ ...formData, question: e.target.value })} required placeholder="Votre question ici..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Catégorie</Label>
                        <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                            <SelectTrigger><SelectValue placeholder="Catégorie" /></SelectTrigger>
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

                <div className="space-y-3 border p-4 rounded-md bg-muted/20">
                    <Label className="text-base">Options de réponse</Label>
                    <p className="text-xs text-muted-foreground">Remplissez les options et cochez la bonne réponse.</p>

                    {formData.options.map((opt: string, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="flex h-6 items-center">
                                <input
                                    type="radio"
                                    name="correctAnswer"
                                    checked={formData.correctAnswer === opt && opt !== ''}
                                    onChange={() => setFormData({ ...formData, correctAnswer: opt })}
                                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                />
                            </div>
                            <div className="flex-1">
                                <Input
                                    placeholder={`Option ${i + 1}`}
                                    value={opt}
                                    onChange={e => handleOptionChange(i, e.target.value)}
                                    required
                                    className={formData.correctAnswer === opt && opt !== '' ? "border-green-500 ring-1 ring-green-500" : ""}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-2">
                    <Label>Explication (affichée après réponse)</Label>
                    <Textarea value={formData.explanation} onChange={e => setFormData({ ...formData, explanation: e.target.value })} placeholder="Pourquoi cette réponse est correcte..." />
                </div>

                <Button type="submit" className="w-full">{editingItem ? 'Mettre à jour' : 'Ajouter la question'}</Button>
            </form>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Title & Actions */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestion des Tests</h2>
                    <p className="text-muted-foreground">Créez des tests et gérez la banque de questions.</p>
                </div>
                <div className="flex items-center gap-2">
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
                                <DialogDescription>Remplissez les informations ci-dessous.</DialogDescription>
                            </DialogHeader>
                            {activeTab === 'tests' ? <TestForm onClose={() => setIsDialogOpen(false)} /> : <QuestionForm onClose={() => setIsDialogOpen(false)} />}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-100 dark:border-blue-800">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Total Tests</p>
                            <h3 className="text-3xl font-bold mt-2">{tests.length}</h3>
                        </div>
                        <div className="p-3 bg-white dark:bg-blue-900/50 rounded-full shadow-sm">
                            <FileText className="w-6 h-6 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border-teal-100 dark:border-teal-800">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-teal-600 dark:text-teal-300">Questions en Banque</p>
                            <h3 className="text-3xl font-bold mt-2">{questions.length}</h3>
                        </div>
                        <div className="p-3 bg-white dark:bg-teal-900/50 rounded-full shadow-sm">
                            <HelpCircle className="w-6 h-6 text-teal-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-violet-100 dark:border-violet-800">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-violet-600 dark:text-violet-300">Durée Moyenne</p>
                            <h3 className="text-3xl font-bold mt-2">{stats.avgDuration} min</h3>
                        </div>
                        <div className="p-3 bg-white dark:bg-violet-900/50 rounded-full shadow-sm">
                            <CheckCircle className="w-6 h-6 text-violet-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-4 rounded-lg">
                    <TabsList>
                        <TabsTrigger value="tests" className="gap-2"><FileText className="w-4 h-4" /> Tests</TabsTrigger>
                        <TabsTrigger value="questions" className="gap-2"><HelpCircle className="w-4 h-4" /> Questions</TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="pl-10"
                            />
                        </div>
                        {/* Difficulty Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setDifficultyFilter('all')}>Toutes difficultés</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDifficultyFilter(activeTab === 'tests' ? 'débutant' : 'facile')}>Facile / Débutant</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDifficultyFilter(activeTab === 'tests' ? 'intermédiaire' : 'moyen')}>Moyen / Interm.</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDifficultyFilter(activeTab === 'tests' ? 'avancé' : 'difficile')}>Difficile / Avancé</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {activeTab === 'tests' && (
                            <Button
                                onClick={() => setIsWizardOpen(true)}
                                variant="default"
                                className="gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Test Complet
                            </Button>
                        )}
                    </div>
                </div>

                <TabsContent value="tests">
                    <Card className="border-muted">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                                            <div className="flex items-center gap-1">Titre <ArrowUpDown className="w-3 h-3" /></div>
                                        </TableHead>
                                        <TableHead>Catégorie</TableHead>
                                        <TableHead>Difficulté</TableHead>
                                        <TableHead>Questions / Durée</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedData.map((test) => (
                                        <TableRow key={test.id || test._id} className="hover:bg-muted/30">
                                            <TableCell className="font-medium">{test.title}</TableCell>
                                            <TableCell><Badge variant="outline">{test.category}</Badge></TableCell>
                                            <TableCell>
                                                <Badge className={
                                                    test.difficulty === 'débutant' ? "bg-green-100 text-green-800" :
                                                        test.difficulty === 'avancé' ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                                                } variant="secondary">
                                                    {test.difficulty}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm">
                                                    <span className="font-medium">{(Array.isArray(test.questions) ? test.questions.length : test.questions) || 0} questions</span>
                                                    <span className="text-xs text-muted-foreground">{test.duration} min • Pass: {test.passThreshold}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(test)}>
                                                        <Edit className="w-4 h-4 text-blue-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(test.id || test._id || '', 'test')}>
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredData.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">Aucun test trouvé</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="questions">
                    <Card className="border-muted">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-[40%] cursor-pointer" onClick={() => handleSort('question')}>
                                            <div className="flex items-center gap-1">Question <ArrowUpDown className="w-3 h-3" /></div>
                                        </TableHead>
                                        <TableHead>Catégorie</TableHead>
                                        <TableHead>Difficulté</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedData.map((q) => (
                                        <TableRow key={q.id || q._id} className="hover:bg-muted/30">
                                            <TableCell className="font-medium align-top">
                                                <div className="line-clamp-2" title={q.question}>{q.question}</div>
                                                <div className="text-xs text-muted-foreground mt-1 line-clamp-1">✅ {q.correctAnswer}</div>
                                            </TableCell>
                                            <TableCell className="align-top"><Badge variant="outline">{q.category}</Badge></TableCell>
                                            <TableCell className="align-top">{q.difficulty}</TableCell>
                                            <TableCell className="text-right align-top">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(q)}>
                                                        <Edit className="w-4 h-4 text-blue-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(q.id || q._id || '', 'question')}>
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredData.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">Aucune question trouvée</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Pagination Controls */}
                {filteredData.length > itemsPerPage && (
                    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
                        <p className="text-sm text-muted-foreground text-center sm:text-left">
                            Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, filteredData.length)} sur {filteredData.length}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="text-sm font-medium">Page {currentPage} sur {totalPages}</span>
                            <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </Tabs>

            {/* Test Builder Wizard */}
            <TestBuilderWizard
                open={isWizardOpen}
                onClose={() => {
                    setIsWizardOpen(false);
                    setWizardMode('create');
                    setEditingItem(null);
                    setEditingTestQuestions([]);
                }}
                onSuccess={() => {
                    loadData();
                    setIsWizardOpen(false);
                    setWizardMode('create');
                    setEditingItem(null);
                }}
                mode={wizardMode}
                initialData={editingItem}
                initialQuestions={editingTestQuestions}
            />
        </div>
    );
}
