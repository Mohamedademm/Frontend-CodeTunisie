import { BookOpen, Video, FileText, LayoutDashboard, Settings, Menu, X, LogOut, User, Crown, Scale, Heart } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const navItems = [
    { id: '/', label: t('common.courses') === 'Cours & Vidéos' ? 'Accueil' : (t('common.courses') === 'الدروس والفيديوهات' ? 'الرئيسية' : 'Home'), icon: LayoutDashboard, requireAuth: false },
    { id: '/courses', label: t('common.courses'), icon: BookOpen, requireAuth: true },
    { id: '/law', label: t('common.courses') === 'Cours & Vidéos' ? 'Loi' : (t('common.courses') === 'الدروس والفيديوهات' ? 'مجلة الطرقات' : 'Law'), icon: Scale, requireAuth: true },
    { id: '/videos', label: 'Vidéos', icon: Video, requireAuth: true },
    { id: '/tests', label: t('common.tests'), icon: FileText, requireAuth: true },
    { id: '/dashboard', label: t('common.dashboard'), icon: LayoutDashboard, requireAuth: true },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

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
    <TooltipProvider>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => handleNavigate('/')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              role="button"
              tabIndex={0}
              aria-label="CodeTunisiePro Accueil"
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleNavigate('/')}
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-colored group-hover:shadow-lg transition-all">
                <img
                  src="/logo/CodeTunisie_Logo1.png"
                  alt="CodeTunisie Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<span class="text-white font-bold text-xl gradient-primary rounded-xl w-full h-full flex items-center justify-center">CT</span>';
                  }}
                />
              </div>
              <span className="text-xl bg-clip-text hidden sm:inline">
                CodeTunisiePro
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                if (item.requireAuth && !isAuthenticated) return null;

                const Icon = item.icon;
                const isActive = location.pathname === item.id;
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActive ? 'default' : 'ghost'}
                        onClick={() => handleNavigate(item.id)}
                        className="gap-2 transition-all rtl:flex-row-reverse"
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('common.view_site')} {item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            {/* User Actions */}
            <div className="hidden md:flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />

              {isAuthenticated ? (
                <>
                  {/* Premium Badge */}
                  {user?.isPremium && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                    >
                      <Crown className="w-4 h-4 text-white" />
                      <span className="text-xs font-semibold text-white">Premium</span>
                    </motion.div>
                  )}

                  {/* Admin Button */}
                  {user?.role === 'admin' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" onClick={() => handleNavigate('/admin/dashboard')} aria-label={t('common.admin')}>
                          <Settings className="w-4 h-4 me-2 rtl:ms-2" />
                          {t('common.admin')}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Espace administrateur</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="cursor-pointer"
                        role="button"
                        tabIndex={0}
                        aria-label="Menu utilisateur"
                      >
                        <Avatar className="w-10 h-10 border-2 border-primary">
                          <AvatarImage src={user?.avatar} alt={user?.name} />
                          <AvatarFallback className="gradient-primary text-white font-semibold">
                            {user?.name ? getInitials(user.name) : 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium text-start">{user?.name}</p>
                          <p className="text-xs text-muted-foreground text-start">{user?.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleNavigate('/profile')} className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Mon profil</span>
                      </DropdownMenuItem>
                      {!user?.isPremium && (
                        <DropdownMenuItem onClick={() => handleNavigate('/premium')} className="flex items-center gap-2">
                          <Crown className="w-4 h-4" />
                          <span>Passer à Premium</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600 flex items-center gap-2">
                        <LogOut className="w-4 h-4" />
                        <span>{t('common.logout')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => handleNavigate('/login')}>
                    Connexion
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                    onClick={() => handleNavigate('/register')}
                  >
                    Inscription
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu principal"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-card"
            >
              <div className="px-4 py-3 space-y-1">
                {navItems.map((item) => {
                  if (item.requireAuth && !isAuthenticated) return null;

                  const Icon = item.icon;
                  const isActive = location.pathname === item.id;
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? 'default' : 'ghost'}
                      onClick={() => handleNavigate(item.id)}
                      className="w-full justify-start gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  );
                })}

                {isAuthenticated ? (
                  <>
                    {user?.role === 'admin' && (
                      <Button
                        variant="outline"
                        onClick={() => handleNavigate('/admin/dashboard')}
                        className="w-full justify-start gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        {t('common.admin')}
                      </Button>
                    )}
                    {!user?.isPremium && (
                      <Button
                        variant="outline"
                        onClick={() => handleNavigate('/premium')}
                        className="w-full justify-start gap-2"
                      >
                        <Crown className="w-4 h-4" />
                        Passer à Premium
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full justify-start gap-2 text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('common.logout')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => handleNavigate('/login')}
                      className="w-full justify-start"
                    >
                      Connexion
                    </Button>
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-green-600"
                      onClick={() => handleNavigate('/register')}
                    >
                      Inscription
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </TooltipProvider>
  );
}