import { motion } from 'motion/react';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    FileText,
    CreditCard,
    BarChart3,
    Settings,
    Bell,
    ChevronLeft,
    ChevronRight,
    Video
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/components/ui/utils';

interface AdminSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

const menuItems = [
    { id: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: '/admin/users', label: 'Utilisateurs', icon: Users },
    { id: '/admin/courses', label: 'Cours & Vidéos', icon: BookOpen },
    { id: '/admin/tests', label: 'Tests', icon: FileText },
    { id: '/admin/payments', label: 'Paiements', icon: CreditCard },
    { id: '/admin/analytics', label: 'Analytiques', icon: BarChart3 },
    { id: '/admin/settings', label: 'Paramètres', icon: Settings },
    { id: '/admin/notifications', label: 'Notifications', icon: Bell },
];

export function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isOpen ? 256 : 80 }}
                className={cn(
                    "fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50",
                    "transition-all duration-300 overflow-hidden",
                    !isOpen && "max-lg:-translate-x-full"
                )}
            >
                {/* Logo Section */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
                    {isOpen ? (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg overflow-hidden">
                                <img
                                    src="/logo/CodeTunisie_Logo.jpg"
                                    alt="CodeTunisie"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
                                Admin
                            </span>
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-lg overflow-hidden mx-auto">
                            <img
                                src="/logo/CodeTunisie_Logo.jpg"
                                alt="CodeTunisie"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                </div>

                {/* Toggle Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggle}
                    className="absolute -right-3 top-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hidden lg:flex"
                >
                    {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>

                {/* Navigation Menu */}
                <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-4rem)]">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.id;

                        return (
                            <motion.div
                                key={item.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    variant={isActive ? 'default' : 'ghost'}
                                    onClick={() => navigate(item.id)}
                                    className={cn(
                                        "w-full justify-start gap-3 transition-all",
                                        !isOpen && "justify-center px-2",
                                        isActive && "bg-gradient-to-r from-blue-600 to-green-600 text-white"
                                    )}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    {isOpen && <span>{item.label}</span>}
                                </Button>
                            </motion.div>
                        );
                    })}

                    {/* Divider */}
                    <div className="my-4 border-t border-gray-200 dark:border-gray-700" />

                    {/* Back to Site */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="outline"
                            onClick={() => navigate('/')}
                            className={cn(
                                "w-full justify-start gap-3",
                                !isOpen && "justify-center px-2"
                            )}
                        >
                            <Video className="w-5 h-5 flex-shrink-0" />
                            {isOpen && <span>Voir le site</span>}
                        </Button>
                    </motion.div>
                </nav>
            </motion.aside>
        </>
    );
}
