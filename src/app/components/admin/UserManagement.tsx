import { useEffect, useState, useMemo } from 'react';
import { Search, Edit, Trash2, MoreVertical, Loader2, ArrowUpDown, ChevronLeft, ChevronRight, Download, RefreshCw, Shield, User as UserIcon, Crown } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import { adminService } from '@/services/adminService';
import { User } from '@/app/types';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/app/components/ui/alert-dialog";

export function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Advanced Filters
    const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'premium' | 'free'>('all');

    // Sorting
    const [sortConfig, setSortConfig] = useState<{ key: keyof User | 'createdAt', direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Selection & Actions
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

    // Edit form state
    const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
    const [isPremium, setIsPremium] = useState(false);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Create form state
    const [createForm, setCreateForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user' as 'user' | 'admin',
        isPremium: false
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            // Fetch all users and filter client-side for better UX on small datasets
            const data = await adminService.getUsers();
            setUsers(data);
        } catch (error) {
            toast.error("Erreur lors du chargement des utilisateurs");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // ... processing data ...
    const filteredUsers = useMemo(() => {
        let result = [...users];

        // 1. Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(u =>
                u.name.toLowerCase().includes(lowerQuery) ||
                u.email.toLowerCase().includes(lowerQuery)
            );
        }

        // 2. Filter by Role
        if (roleFilter !== 'all') {
            result = result.filter(u => u.role === roleFilter);
        }

        // 3. Filter by Status
        if (statusFilter !== 'all') {
            result = result.filter(u =>
                statusFilter === 'premium' ? u.isPremium : !u.isPremium
            );
        }

        // 4. Sort
        result.sort((a, b) => {
            const aValue = a[sortConfig.key] ?? '';
            const bValue = b[sortConfig.key] ?? '';

            // Handle dates if needed
            if (sortConfig.key === 'createdAt') {
                return sortConfig.direction === 'asc'
                    ? new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
                    : new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [users, searchQuery, roleFilter, statusFilter, sortConfig]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSort = (key: keyof User | 'createdAt') => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleCreateUser = async () => {
        if (!createForm.name || !createForm.email || !createForm.password) {
            toast.error("Veuillez remplir tous les champs obligatoires");
            return;
        }

        try {
            await adminService.createUser(createForm);
            toast.success("Utilisateur créé avec succès");
            setIsCreateModalOpen(false);
            setCreateForm({
                name: '',
                email: '',
                password: '',
                role: 'user',
                isPremium: false
            });
            loadUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Erreur lors de la création");
        }
    };

    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setIsPremium(user.isPremium);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (user: User) => {
        setSelectedUser(user);
        setIsDeleteAlertOpen(true);
    }
    // ... update and delete logic ...
    const handleUpdateUser = async () => {
        if (!selectedUser) return;

        try {
            await adminService.updateUser(selectedUser.id, {
                role: newRole,
                isPremium: isPremium
            });
            toast.success("Utilisateur mis à jour avec succès");
            setIsEditModalOpen(false);
            loadUsers();
        } catch (error) {
            toast.error("Erreur lors de la mise à jour");
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedUser) return;

        try {
            await adminService.deleteUser(selectedUser.id);
            toast.success("Utilisateur supprimé");
            setIsDeleteAlertOpen(false);
            loadUsers();
        } catch (error) {
            toast.error("Erreur lors de la suppression");
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // ... stats ...
    const stats = useMemo(() => {
        return {
            total: users.length,
            premium: users.filter(u => u.isPremium).length,
            admins: users.filter(u => u.role === 'admin').length
        };
    }, [users]);

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in">
            {/* Stats Cards - kept same as before */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Total Utilisateurs</p>
                            <h3 className="text-3xl font-bold mt-2">{stats.total}</h3>
                        </div>
                        <div className="p-3 bg-white dark:bg-blue-900/50 rounded-full shadow-sm">
                            <UserIcon className="w-6 h-6 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-100 dark:border-yellow-800">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-amber-600 dark:text-amber-300">Membres Premium</p>
                            <h3 className="text-3xl font-bold mt-2">{stats.premium}</h3>
                        </div>
                        <div className="p-3 bg-white dark:bg-amber-900/50 rounded-full shadow-sm">
                            <Crown className="w-6 h-6 text-amber-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-100 dark:border-purple-800">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Administrateurs</p>
                            <h3 className="text-3xl font-bold mt-2">{stats.admins}</h3>
                        </div>
                        <div className="p-3 bg-white dark:bg-purple-900/50 rounded-full shadow-sm">
                            <Shield className="w-6 h-6 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-md border-muted">
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <CardTitle>Liste des utilisateurs</CardTitle>
                            <CardDescription>Gérez les comptes, rôles et abonnements.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary hover:bg-primary/90 text-white">
                                <UserIcon className="w-4 h-4 mr-2" />
                                Ajouter
                            </Button>
                            <Button variant="outline" size="sm" onClick={loadUsers} disabled={loading}>
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters Toolbar */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Rechercher un utilisateur..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={(val: any) => setRoleFilter(val)}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Rôle" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les rôles</SelectItem>
                                <SelectItem value="user">Utilisateur</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les statuts</SelectItem>
                                <SelectItem value="premium">Premium</SelectItem>
                                <SelectItem value="free">Gratuit</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Table */}
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-[300px] cursor-pointer hover:bg-muted" onClick={() => handleSort('name')}>
                                        <div className="flex items-center gap-2">
                                            Utilisateur
                                            <ArrowUpDown className="w-3 h-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:bg-muted" onClick={() => handleSort('role')}>
                                        <div className="flex items-center gap-2">
                                            Rôle
                                            <ArrowUpDown className="w-3 h-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:bg-muted" onClick={() => handleSort('isPremium')}>
                                        <div className="flex items-center gap-2">
                                            Statut
                                            <ArrowUpDown className="w-3 h-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:bg-muted" onClick={() => handleSort('createdAt')}>
                                        <div className="flex items-center gap-2">
                                            Inscription
                                            <ArrowUpDown className="w-3 h-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-48 text-center">
                                            <div className="flex flex-col justify-center items-center">
                                                <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
                                                <p className="text-muted-foreground">Chargement des données...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-48 text-center bg-gray-50/50 dark:bg-gray-900/10">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <Search className="w-10 h-10 mb-2 opacity-20" />
                                                <p>Aucun utilisateur trouvé</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedUsers.map((user) => (
                                        <TableRow key={user.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800 shadow-sm">
                                                        <AvatarImage src={user.avatar} />
                                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                            {getInitials(user.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
                                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {user.role === 'admin' ? (
                                                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800 gap-1">
                                                        <Shield className="w-3 h-3" /> Admin
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="gap-1">
                                                        <UserIcon className="w-3 h-3" /> User
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {user.isPremium ? (
                                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 gap-1">
                                                        <Crown className="w-3 h-3" /> Premium
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-gray-500">Gratuit</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleEditClick(user)}>
                                                            <Edit className="w-4 h-4 mr-2" /> Modifier
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/20" onClick={() => handleDeleteClick(user)}>
                                                            <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
                        <div className="text-sm text-muted-foreground text-center sm:text-left">
                            Affichage de <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> à <strong>{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</strong> sur <strong>{filteredUsers.length}</strong>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <div className="text-sm font-medium">
                                Page {currentPage} sur {Math.max(1, totalPages)}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Modifier l'utilisateur</DialogTitle>
                        <DialogDescription>
                            Modifiez les droits d'accès et le statut d'abonnement pour {selectedUser?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">Rôle</Label>
                            <Select value={newRole} onValueChange={(val: any) => setNewRole(val)}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user"><div className="flex items-center gap-2"><UserIcon className="w-4 h-4" /> Utilisateur</div></SelectItem>
                                    <SelectItem value="admin"><div className="flex items-center gap-2"><Shield className="w-4 h-4" /> Administrateur</div></SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">Abonnement</Label>
                            <Select value={isPremium ? 'true' : 'false'} onValueChange={(val) => setIsPremium(val === 'true')}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="false">Gratuit</SelectItem>
                                    <SelectItem value="true"><div className="flex items-center gap-2 text-amber-600"><Crown className="w-4 h-4" /> Premium</div></SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Annuler</Button>
                        <Button onClick={handleUpdateUser}>Enregistrer les modifications</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Cela supprimera définitivement le compte de <strong>{selectedUser?.name}</strong> et toutes ses données associées.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {/* Create User Dialog */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
                        <DialogDescription>
                            Créez un nouveau compte manuellement.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nom complet</Label>
                            <Input
                                placeholder="Nom Prénom"
                                value={createForm.name}
                                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                placeholder="exemple@email.com"
                                value={createForm.email}
                                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Mot de passe</Label>
                            <Input
                                type="password"
                                placeholder="********"
                                value={createForm.password}
                                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Rôle</Label>
                                <Select
                                    value={createForm.role}
                                    onValueChange={(val: 'user' | 'admin') => setCreateForm({ ...createForm, role: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">Utilisateur</SelectItem>
                                        <SelectItem value="admin">Administrateur</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Abonnement</Label>
                                <Select
                                    value={createForm.isPremium ? 'true' : 'false'}
                                    onValueChange={(val) => setCreateForm({ ...createForm, isPremium: val === 'true' })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="false">Gratuit</SelectItem>
                                        <SelectItem value="true">Premium</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Annuler</Button>
                        <Button onClick={handleCreateUser}>Créer le compte</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
