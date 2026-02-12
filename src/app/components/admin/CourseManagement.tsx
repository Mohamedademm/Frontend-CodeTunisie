import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, BookOpen, Video as VideoIcon, Crown, Filter, ArrowUpDown, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import { adminService } from '@/services/adminService';
import { Course, Video as VideoType } from '@/app/types';
import { toast } from 'sonner';

export function CourseManagement() {
    const [activeTab, setActiveTab] = useState('courses');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // Filter & Sort States
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [difficultyFilter, setDifficultyFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Data states
    const [courses, setCourses] = useState<Course[]>([]);
    const [videos, setVideos] = useState<VideoType[]>([]);

    // Form states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'courses') {
                const data = await adminService.getCourses();
                setCourses(data);
            } else if (activeTab === 'videos') {
                const data = await adminService.getVideos();
                setVideos(data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors du chargement des données");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, type: 'course' | 'video') => {
        if (!confirm("Êtes-vous sûr ?")) return;
        try {
            if (type === 'course') await adminService.deleteCourse(id);
            if (type === 'video') await adminService.deleteVideo(id);
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

    // --- Stats Calculation ---
    const stats = useMemo(() => {
        const totalCourses = courses.length;
        const totalVideos = videos.length; // Note: videos state might be empty if we are on courses tab initally, but let's assume we might want to fetch both for stats later. For now, it updates when tab switches.
        // To fix this, ideally we fetch basic stats separately or just rely on what's user sees. 
        // Let's stick to simple counts of what's loaded.

        const premiumCourses = courses.filter(c => c.isPremium).length;
        const premiumVideos = videos.filter(v => v.isPremium).length; // Only counts if videos loaded

        return {
            totalCourses,
            totalVideos, // This will be 0 if on courses tab initially if we don't load both.
            premiumContent: premiumCourses + premiumVideos
        };
    }, [courses, videos]);

    // --- Filtering & Sorting ---
    const filteredData = useMemo(() => {
        let result: any[] = activeTab === 'courses' ? [...courses] : [...videos];

        // 1. Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.title.toLowerCase().includes(lowerQuery) ||
                (item.description && item.description.toLowerCase().includes(lowerQuery))
            );
        }

        // 2. Filter Category
        if (categoryFilter !== 'all') {
            result = result.filter(item => item.category === categoryFilter);
        }

        // 3. Filter Difficulty (Courses only)
        if (activeTab === 'courses' && difficultyFilter !== 'all') {
            result = result.filter(item => item.difficulty === difficultyFilter);
        }

        // 4. Sort
        result.sort((a, b) => {
            const aValue = a[sortConfig.key] ?? '';
            const bValue = b[sortConfig.key] ?? '';

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [courses, videos, activeTab, searchQuery, categoryFilter, difficultyFilter, sortConfig]);

    // --- Pagination ---
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSort = (key: string) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const CourseForm = ({ onClose }: { onClose: () => void }) => {
        const [formData, setFormData] = useState({
            title: editingItem?.title || '',
            description: editingItem?.description || '',
            content: editingItem?.content || '', // Added content
            category: editingItem?.category || '',
            difficulty: editingItem?.difficulty || 'intermédiaire',
            duration: editingItem?.duration || '',
            lessons: editingItem?.lessons || 1, // Added lessons
            price: editingItem?.price || '0',
            isPremium: editingItem?.isPremium || false,
        });

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            try {
                if (editingItem) {
                    await adminService.updateCourse(editingItem.id || editingItem._id, formData);
                    toast.success("Cours mis à jour");
                } else {
                    await adminService.createCourse(formData);
                    toast.success("Cours créé");
                }
                onClose();
                loadData();
            } catch (error) {
                console.error(error);
                toast.error("Erreur lors de l'enregistrement");
            }
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <Label>Titre du cours</Label>
                        <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required placeholder="Ex: Permis Poids Lourd" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Catégorie</Label>
                        <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                            <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Code de la route">Code de la route</SelectItem>
                                <SelectItem value="Conduite">Conduite</SelectItem>
                                <SelectItem value="Mécanique">Mécanique</SelectItem>
                                <SelectItem value="Sécurité">Sécurité</SelectItem>
                                <SelectItem value="poids-lourd">Poids Lourd</SelectItem>
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
                                <SelectItem value="difficile">Difficile</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Durée estimée</Label>
                        <Input value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} placeholder="ex: 2h 30m" />
                    </div>
                    <div>
                        <Label>Nombre de leçons</Label>
                        <Input type="number" min="1" value={formData.lessons} onChange={e => setFormData({ ...formData, lessons: Number(e.target.value) })} />
                    </div>
                </div>

                <div>
                    <Label>Description courte</Label>
                    <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Bref résumé du cours..." />
                </div>

                <div>
                    <Label>Contenu (HTML supporté)</Label>
                    <Textarea
                        className="min-h-[150px] font-mono text-sm"
                        value={formData.content}
                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                        placeholder="<p>Contenu principal du cours...</p>"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Utilisez des balises HTML pour le formatage.</p>
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t">
                    <input type="checkbox" id="isPremium" checked={formData.isPremium} onChange={e => setFormData({ ...formData, isPremium: e.target.checked })} className="h-4 w-4 rounded border-gray-300" />
                    <Label htmlFor="isPremium">Contenu Premium</Label>
                </div>

                <Button type="submit" className="w-full">{editingItem ? 'Mettre à jour' : 'Créer le cours'}</Button>
            </form>
        );
    };

    const VideoForm = ({ onClose }: { onClose: () => void }) => {
        const [formData, setFormData] = useState({
            title: editingItem?.title || '',
            description: editingItem?.description || '',
            videoUrl: editingItem?.videoUrl || editingItem?.url || '',
            thumbnail: editingItem?.thumbnail || '',
            duration: editingItem?.duration || '',
            category: editingItem?.category || '',
            isPremium: editingItem?.isPremium || false,
        });
        const [videoSource, setVideoSource] = useState<'url' | 'upload'>(
            editingItem?.videoType === 'upload' ? 'upload' : 'url'
        );
        const [selectedFile, setSelectedFile] = useState<File | null>(null);
        const [isDragging, setIsDragging] = useState(false);
        const [uploading, setUploading] = useState(false);

        const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
        const ACCEPTED_FORMATS = '.mp4,.avi,.mov,.webm,.mkv,.mpeg,.ogg';
        const ACCEPTED_MIMES = ['video/mp4', 'video/avi', 'video/x-msvideo', 'video/quicktime', 'video/webm', 'video/x-matroska', 'video/mpeg', 'video/ogg'];

        const formatFileSize = (bytes: number) => {
            if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
            return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        };

        const handleFileSelect = (file: File) => {
            if (!ACCEPTED_MIMES.includes(file.type) && !file.name.match(/\.(mp4|avi|mov|webm|mkv|mpeg|ogg)$/i)) {
                toast.error(`Format non supporté: ${file.type || file.name.split('.').pop()}`);
                return;
            }
            if (file.size > MAX_FILE_SIZE) {
                toast.error(`Fichier trop volumineux (${formatFileSize(file.size)}). Maximum: 100 MB`);
                return;
            }
            setSelectedFile(file);
        };

        const handleDrop = (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFileSelect(file);
        };

        const handleDragOver = (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(true);
        };

        const handleDragLeave = () => setIsDragging(false);

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setUploading(true);
            try {
                if (videoSource === 'upload' && selectedFile) {
                    // Build FormData for file upload
                    const fd = new FormData();
                    fd.append('videoFile', selectedFile);
                    fd.append('title', formData.title);
                    fd.append('description', formData.description);
                    fd.append('category', formData.category);
                    fd.append('duration', formData.duration);
                    fd.append('isPremium', String(formData.isPremium));
                    if (formData.thumbnail) fd.append('thumbnail', formData.thumbnail);

                    if (editingItem) {
                        await adminService.updateVideo(editingItem.id || editingItem._id, fd);
                        toast.success("Vidéo mise à jour");
                    } else {
                        await adminService.createVideo(fd);
                        toast.success("Vidéo uploadée avec succès !");
                    }
                } else if (videoSource === 'url' && formData.videoUrl) {
                    // JSON for URL
                    if (editingItem) {
                        await adminService.updateVideo(editingItem.id || editingItem._id, formData);
                        toast.success("Vidéo mise à jour");
                    } else {
                        await adminService.createVideo(formData);
                        toast.success("Vidéo ajoutée");
                    }
                } else {
                    toast.error("Veuillez fournir une URL ou sélectionner un fichier");
                    setUploading(false);
                    return;
                }
                onClose();
                loadData();
            } catch (error: any) {
                console.error(error);
                const msg = error.response?.data?.message || "Erreur lors de l'enregistrement";
                toast.error(msg);
            } finally {
                setUploading(false);
            }
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <Label>Titre de la vidéo</Label>
                        <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                    </div>

                    {/* Source Toggle */}
                    <div>
                        <Label className="mb-2 block">Source de la vidéo</Label>
                        <div className="flex rounded-lg overflow-hidden border border-white/10">
                            <button
                                type="button"
                                onClick={() => setVideoSource('url')}
                                className={`flex-1 py-2.5 px-4 text-sm font-medium transition-all flex items-center justify-center gap-2 ${videoSource === 'url'
                                        ? 'bg-indigo-500/20 text-indigo-300 border-b-2 border-indigo-500'
                                        : 'bg-white/[0.02] text-gray-400 hover:bg-white/[0.05]'
                                    }`}
                            >
                                <VideoIcon className="w-4 h-4" />
                                Lien URL
                            </button>
                            <button
                                type="button"
                                onClick={() => setVideoSource('upload')}
                                className={`flex-1 py-2.5 px-4 text-sm font-medium transition-all flex items-center justify-center gap-2 ${videoSource === 'upload'
                                        ? 'bg-emerald-500/20 text-emerald-300 border-b-2 border-emerald-500'
                                        : 'bg-white/[0.02] text-gray-400 hover:bg-white/[0.05]'
                                    }`}
                            >
                                <Plus className="w-4 h-4" />
                                Fichier Local
                            </button>
                        </div>
                    </div>

                    {/* URL Input */}
                    {videoSource === 'url' && (
                        <div>
                            <Label>URL (YouTube / Vimeo / Dailymotion)</Label>
                            <Input
                                value={formData.videoUrl}
                                onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                                required={videoSource === 'url'}
                                placeholder="https://www.youtube.com/watch?v=..."
                            />
                            <p className="text-[11px] text-gray-500 mt-1">Collez l'URL complète de la vidéo</p>
                        </div>
                    )}

                    {/* File Upload */}
                    {videoSource === 'upload' && (
                        <div>
                            <Label>Fichier vidéo</Label>
                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                className={`mt-1 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${isDragging
                                        ? 'border-emerald-500 bg-emerald-500/10'
                                        : selectedFile
                                            ? 'border-emerald-500/30 bg-emerald-500/5'
                                            : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                                    }`}
                                onClick={() => document.getElementById('video-file-input')?.click()}
                            >
                                <input
                                    id="video-file-input"
                                    type="file"
                                    accept={ACCEPTED_FORMATS}
                                    className="hidden"
                                    onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileSelect(file);
                                    }}
                                />
                                {selectedFile ? (
                                    <div className="space-y-2">
                                        <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                            <VideoIcon className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white truncate max-w-[300px] mx-auto">{selectedFile.name}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{formatFileSize(selectedFile.size)} • {selectedFile.type || 'vidéo'}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                                            className="text-xs text-red-400 hover:text-red-300 underline"
                                        >
                                            Supprimer le fichier
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="w-12 h-12 mx-auto rounded-xl bg-white/5 flex items-center justify-center">
                                            <Plus className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-300">
                                                <span className="text-indigo-400 font-medium">Cliquez pour choisir</span> ou glissez-déposez
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">MP4, AVI, MOV, WebM, MKV • Max 100 MB</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Catégorie</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="signalisation">Signalisation</SelectItem>
                                <SelectItem value="regles">Règles de circulation</SelectItem>
                                <SelectItem value="priorites">Priorités</SelectItem>
                                <SelectItem value="infractions">Infractions & Amendes</SelectItem>
                                <SelectItem value="securite">Sécurité routière</SelectItem>
                                <SelectItem value="conseils">Conseils pratiques</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Durée</Label>
                        <Input value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} placeholder="ex: 15:00" />
                    </div>
                </div>

                <div>
                    <Label>Description</Label>
                    <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t">
                    <input type="checkbox" id="vidPremium" checked={formData.isPremium} onChange={e => setFormData({ ...formData, isPremium: e.target.checked })} className="h-4 w-4 rounded border-gray-300" />
                    <Label htmlFor="vidPremium">Vidéo Premium</Label>
                </div>

                <Button type="submit" className="w-full gap-2" disabled={uploading}>
                    {uploading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {videoSource === 'upload' ? 'Upload en cours...' : 'Enregistrement...'}
                        </>
                    ) : (
                        editingItem ? 'Mettre à jour' : (videoSource === 'upload' ? 'Uploader la vidéo' : 'Ajouter la vidéo')
                    )}
                </Button>
            </form>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Title & Actions */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestion des Cours</h2>
                    <p className="text-muted-foreground">Gérez le contenu éducatif et les vidéos.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingItem(null); }}>
                        <DialogTrigger asChild>
                            <Button className="gap-2" onClick={() => setEditingItem(null)}>
                                <Plus className="w-4 h-4" />
                                Nouveau {activeTab === 'courses' ? 'Cours' : 'Vidéo'}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>{editingItem ? 'Modifier' : 'Créer'} {activeTab === 'courses' ? 'un cours' : 'une vidéo'}</DialogTitle>
                                <DialogDescription>Remplissez les détails du contenu ci-dessous.</DialogDescription>
                            </DialogHeader>
                            {activeTab === 'courses' ? <CourseForm onClose={() => setIsDialogOpen(false)} /> : <VideoForm onClose={() => setIsDialogOpen(false)} />}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Dashboards Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-100 dark:border-indigo-800">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300">Total Cours</p>
                            <h3 className="text-3xl font-bold mt-2">{courses.length}</h3>
                        </div>
                        <div className="p-3 bg-white dark:bg-indigo-900/50 rounded-full shadow-sm">
                            <BookOpen className="w-6 h-6 text-indigo-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-100 dark:border-pink-800">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-pink-600 dark:text-pink-300">Total Vidéos</p>
                            <h3 className="text-3xl font-bold mt-2">{videos.length}</h3>
                        </div>
                        <div className="p-3 bg-white dark:bg-pink-900/50 rounded-full shadow-sm">
                            <VideoIcon className="w-6 h-6 text-pink-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-100 dark:border-amber-800">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-amber-600 dark:text-amber-300">Contenu Premium</p>
                            <h3 className="text-3xl font-bold mt-2">{stats.premiumContent}</h3>
                        </div>
                        <div className="p-3 bg-white dark:bg-amber-900/50 rounded-full shadow-sm">
                            <Crown className="w-6 h-6 text-amber-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-4 rounded-lg">
                    <TabsList>
                        <TabsTrigger value="courses" className="gap-2"><BookOpen className="w-4 h-4" /> Cours</TabsTrigger>
                        <TabsTrigger value="videos" className="gap-2"><VideoIcon className="w-4 h-4" /> Vidéos</TabsTrigger>
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
                        {/* Category Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setCategoryFilter('all')}>Toutes les catégories</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setCategoryFilter('Code de la route')}>Code de la route</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setCategoryFilter('Conduite')}>Conduite</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setCategoryFilter('Mécanique')}>Mécanique</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <Card className="border-muted">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                                        <div className="flex items-center gap-1">Titre <ArrowUpDown className="w-3 h-3" /></div>
                                    </TableHead>
                                    <TableHead>Catégorie</TableHead>
                                    <TableHead className="hidden md:table-cell">Difficulté / Durée</TableHead>
                                    <TableHead className="hidden md:table-cell cursor-pointer" onClick={() => handleSort('isPremium')}>
                                        <div className="flex items-center gap-1">Status <ArrowUpDown className="w-3 h-3" /></div>
                                    </TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.map((item) => (
                                    <TableRow key={item.id || item._id} className="hover:bg-muted/30">
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span>{item.title}</span>
                                                <span className="text-xs text-muted-foreground md:hidden">{item.category}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell><Badge variant="outline" className="bg-background">{item.category || 'Général'}</Badge></TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <div className="flex flex-col text-sm">
                                                <span>{activeTab === 'courses' ? item.difficulty : item.duration}</span>
                                                {activeTab === 'courses' && <span className="text-xs text-muted-foreground">{item.lessons || 1} leçons • {item.duration}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {item.isPremium ?
                                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">Premium</Badge> :
                                                <Badge variant="outline" className="text-green-600 border-green-200">Gratuit</Badge>
                                            }
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                                    <Edit className="w-4 h-4 text-blue-500" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete((item.id || item._id) as string, activeTab === 'courses' ? 'course' : 'video')}>
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredData.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                            Aucun contenu trouvé.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
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
        </div>
    );
}
