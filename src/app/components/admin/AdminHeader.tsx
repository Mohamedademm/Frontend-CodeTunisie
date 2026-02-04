import { Search, Bell, Menu, LogOut, User } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';

interface AdminHeaderProps {
    onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
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
        <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30 transition-all duration-300">
            <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
                {/* Mobile Menu Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMenuClick}
                    className="lg:hidden"
                >
                    <Menu className="w-5 h-5" />
                </Button>

                {/* Search Bar */}
                <div className="flex-1 max-w-md hidden md:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Rechercher..."
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Notifications */}
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="w-5 h-5" />
                        <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500">
                            3
                        </Badge>
                    </Button>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="gap-2">
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={user?.avatar} alt={user?.name} />
                                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-green-600 text-white text-sm">
                                        {user?.name ? getInitials(user.name) : 'A'}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden md:inline-block font-medium">{user?.name}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">{user?.name}</p>
                                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                                    <Badge variant="outline" className="w-fit mt-1">Administrateur</Badge>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate('/profile')}>
                                <User className="mr-2 h-4 w-4" />
                                <span>Mon profil</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate('/')}>
                                <span>Voir le site</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Déconnexion</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
