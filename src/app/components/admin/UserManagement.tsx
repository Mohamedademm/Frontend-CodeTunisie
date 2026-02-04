import { useEffect, useState } from 'react';
import { Search, Edit, Trash2, CheckCircle, XCircle, MoreVertical, Shield } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import { adminService } from '@/services/adminService';
import { User } from '@/app/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

export function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Edit form state
    const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
    const [isPremium, setIsPremium] = useState(false);

    useEffect(() => {
        loadUsers();
    }, [searchQuery]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await adminService.getUsers({ search: searchQuery });
            setUsers(data);
        } catch (error) {
            toast.error("Erreur lors du chargement des utilisateurs");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setIsPremium(user.isPremium);
        setIsEditModalOpen(true);
    };

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

    const handleDeleteUser = async (user: User) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer ${user.name} ?`)) return;

        try {
            await adminService.deleteUser(user.id);
            toast.success("Utilisateur supprimé");
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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Rechercher par nom ou email..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="pl-10"
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Gestion des Utilisateurs</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Utilisateur</TableHead>
                                <TableHead>Rôle</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Inscription</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <div className="flex justify-center items-center">
                                            <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                            Chargement...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        Aucun utilisateur trouvé
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={user.avatar} />
                                                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {user.role === 'admin' ? (
                                                    <Badge variant="default" className="bg-purple-600 hover:bg-purple-700">Admin</Badge>
                                                ) : (
                                                    <Badge variant="secondary">User</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.isPremium ? (
                                                <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20">
                                                    Premium
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-gray-500">
                                                    Gratuit
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-gray-500 text-sm">
                                            {/* Need to handle date formatting safely */}
                                            {new Date().toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEditClick(user)}>
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Modifier
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user)}>
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Supprimer
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Edit User Dialog */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier l'utilisateur</DialogTitle>
                        <DialogDescription>
                            Modifier les permissions et le statut de {selectedUser?.name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Rôle</Label>
                            <Select
                                value={newRole}
                                onValueChange={(val: 'user' | 'admin') => setNewRole(val)}
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
                            <Label>Statut Premium</Label>
                            <Select
                                value={isPremium ? 'true' : 'false'}
                                onValueChange={(val) => setIsPremium(val === 'true')}
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

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Annuler</Button>
                        <Button onClick={handleUpdateUser}>Enregistrer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
