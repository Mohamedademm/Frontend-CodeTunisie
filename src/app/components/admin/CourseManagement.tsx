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
import { Course, Video as VideoType } from '@/app/types';
import { toast } from 'sonner';

export function CourseManagement() {
    const [activeTab, setActiveTab] = useState('courses');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

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

    const CourseForm = ({ onClose }: { onClose: () => void }) => {
        const [formData, setFormData] = useState({
            title: editingItem?.title || '',
            description: editingItem?.description || '',
            category: editingItem?.category || '',
            difficulty: editingItem?.difficulty || 'intermédiaire',
            duration: editingItem?.duration || '',
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
                                <SelectItem value="Mécanique">Mécanique</SelectItem>
                                <SelectItem value="Sécurité">Sécurité</SelectItem>
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
                        <Label>Durée (ex: 2h)</Label>
                        <Input value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
                    </div>
                    <div className="flex items-center space-x-2 pt-8">
                        <input type="checkbox" id="isPremium" checked={formData.isPremium} onChange={e => setFormData({ ...formData, isPremium: e.target.checked })} className="h-4 w-4" />
                        <Label htmlFor="isPremium">Premium seulement</Label>
                    </div>
                </div>
                <Button type="submit" className="w-full">{editingItem ? 'Mettre à jour' : 'Créer'}</Button>
            </form>
        );
    };

    const VideoForm = ({ onClose }: { onClose: () => void }) => {
        const [formData, setFormData] = useState({
            title: editingItem?.title || '',
            description: editingItem?.description || '',
            url: editingItem?.url || '',
            thumbnail: editingItem?.thumbnail || '',
            duration: editingItem?.duration || '',
            category: editingItem?.category || '',
            isPremium: editingItem?.isPremium || false,
        });

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            try {
                if (editingItem) {
                    await adminService.updateVideo(editingItem.id || editingItem._id, formData);
                    toast.success("Vidéo mise à jour");
                } else {
                    await adminService.createVideo(formData);
                    toast.success("Vidéo ajoutée");
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
                    <Label>URL (YouTube/Vimeo)</Label>
                    <Input value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Catégorie</Label>
                        <Input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                    </div>
                    <div>
                        <Label>Durée</Label>
                        <Input value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <input type="checkbox" id="vidPremium" checked={formData.isPremium} onChange={e => setFormData({ ...formData, isPremium: e.target.checked })} className="h-4 w-4" />
                    <Label htmlFor="vidPremium">Premium seulement</Label>
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
                            Nouveau {activeTab === 'courses' ? 'Cours' : activeTab === 'videos' ? 'Vidéo' : 'Test'}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Modifier' : 'Créer'} {activeTab === 'courses' ? 'un cours' : 'une vidéo'}</DialogTitle>
                        </DialogHeader>
                        {activeTab === 'courses' ? <CourseForm onClose={() => setIsDialogOpen(false)} /> : <VideoForm onClose={() => setIsDialogOpen(false)} />}
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="courses">Cours</TabsTrigger>
                    <TabsTrigger value="videos">Vidéos</TabsTrigger>
                </TabsList>

                <TabsContent value="courses">
                    <Card>
                        <CardHeader>
                            <CardTitle>Liste des Cours</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Titre</TableHead>
                                        <TableHead>Catégorie</TableHead>
                                        <TableHead>Difficulté</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {courses.map(course => (
                                        <TableRow key={course.id || course._id}>
                                            <TableCell className="font-medium">{course.title}</TableCell>
                                            <TableCell><Badge variant="outline">{course.category}</Badge></TableCell>
                                            <TableCell>{course.difficulty}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(course)}><Edit className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete((course.id || course._id) as string, 'course')}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {courses.length === 0 && !loading && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-gray-500">Aucun cours trouvé</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="videos">
                    <Card>
                        <CardHeader>
                            <CardTitle>Liste des Vidéos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Titre</TableHead>
                                        <TableHead>Catégorie</TableHead>
                                        <TableHead>Durée</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {videos.map(video => (
                                        <TableRow key={video.id || video._id}>
                                            <TableCell className="font-medium">{video.title}</TableCell>
                                            <TableCell><Badge variant="outline">{video.category}</Badge></TableCell>
                                            <TableCell>{video.duration}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(video)}><Edit className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete((video.id || video._id) as string, 'video')}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {videos.length === 0 && !loading && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-gray-500">Aucune vidéo trouvée</TableCell>
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
