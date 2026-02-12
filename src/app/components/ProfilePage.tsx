import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService, DashboardData } from '@/services/userService';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Progress } from '@/app/components/ui/progress';
import { Switch } from '@/app/components/ui/switch';
import { Separator } from '@/app/components/ui/separator';
import {
    Loader2, BookOpen, Trophy, Clock, Target, Calendar, Edit2, Upload,
    Lock, Bell, Crown, Award, TrendingUp, CheckCircle2, Star, Zap, Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { motion } from 'motion/react';

import { useTranslation } from 'react-i18next';

export function ProfilePage() {
    const { t } = useTranslation();
    const { user, updateUser } = useAuth();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Edit form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Notification settings
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        testReminders: true,
        progressUpdates: false,
        marketingEmails: false
    });

    useEffect(() => {
        fetchDashboard();
    }, []);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name,
                email: user.email,
                phone: (user as any).phone || ''
            }));
        }
    }, [user]);

    const fetchDashboard = async () => {
        try {
            setIsLoading(true);
            const data = await userService.getProfile();
            setDashboardData(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error(t('profile_page.toasts.load_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const updatedUser = await userService.updateProfile({
                name: formData.name,
                phone: formData.phone
            });
            updateUser({
                ...user!,
                name: updatedUser.name,
            });
            setIsEditing(false);
            toast.success(t('profile_page.toasts.update_success'));
            fetchDashboard();
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(t('profile_page.toasts.update_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error(t('profile_page.toasts.password_mismatch'));
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error(t('profile_page.toasts.password_length'));
            return;
        }

        try {
            setIsLoading(true);
            await userService.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setIsChangingPassword(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            toast.success(t('profile_page.toasts.password_success'));
        } catch (error: any) {
            console.error('Error changing password:', error);
            toast.error(error.response?.data?.message || t('profile_page.toasts.password_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const { user: updatedUser } = await userService.uploadAvatar(file);
            updateUser({
                ...user!,
                avatar: updatedUser.avatar
            });
            toast.success(t('profile_page.toasts.avatar_success'));
            fetchDashboard();
        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast.error(t('profile_page.toasts.avatar_error'));
        }
    };

    if (isLoading && !dashboardData) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!dashboardData) return null;

    const { user: profile, stats, recentAttempts } = dashboardData;

    // Calculate achievements
    // Calculate achievements
    const achievements = [
        {
            id: 'first_step',
            icon: Target,
            unlocked: stats.totalTests > 0,
            color: 'text-blue-500'
        },
        {
            id: 'perfectionist',
            icon: Star,
            unlocked: recentAttempts.some(a => a.score === 100),
            color: 'text-yellow-500'
        },
        {
            id: 'diligent',
            icon: Zap,
            unlocked: stats.totalTests >= 10,
            color: 'text-purple-500'
        },
        {
            id: 'expert',
            icon: Trophy,
            unlocked: stats.passedTests >= 20,
            color: 'text-green-500'
        },
        {
            id: 'champion',
            icon: Crown,
            unlocked: stats.totalTests > 0 && (stats.passedTests / stats.totalTests) >= 0.8,
            color: 'text-amber-500'
        },
        {
            id: 'determined',
            icon: BookOpen,
            unlocked: stats.coursesCompleted >= 5,
            color: 'text-indigo-500'
        },
    ];

    const unlockedAchievements = achievements.filter(a => a.unlocked);
    const successRate = stats.totalTests > 0 ? Math.round((stats.passedTests / stats.totalTests) * 100) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="mb-8 overflow-hidden border-0 shadow-xl">
                        <div className="h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
                            <div className="absolute inset-0 bg-black/10"></div>
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
                        </div>
                        <CardContent className="relative pt-0">
                            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-20 sm:ml-8 mb-6 gap-6">
                                <div className="relative group">
                                    <Avatar className="w-40 h-40 border-4 border-white dark:border-gray-800 shadow-2xl ring-4 ring-blue-100 dark:ring-blue-900">
                                        <AvatarImage
                                            src={profile.avatar?.startsWith('/uploads')
                                                ? `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${profile.avatar}`
                                                : profile.avatar
                                            }
                                            alt={profile.name}
                                        />
                                        <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                            {profile.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <label className="absolute bottom-2 right-2 p-3 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 transition-all shadow-lg hover:scale-110" title="Changer la photo">
                                        <Upload className="w-5 h-5" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                    </label>
                                </div>

                                <div className="flex-1 text-center sm:text-left mb-4">
                                    <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">{profile.name}</h1>
                                    <p className="text-gray-600 dark:text-gray-400 mb-3">{profile.email}</p>
                                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                                        <Badge variant={profile.role === 'admin' ? 'destructive' : 'secondary'} className="text-sm px-3 py-1">
                                            {profile.role === 'admin' ? `👑 ${t('profile_page.personal_info.role_admin')}` : `👤 ${t('profile_page.personal_info.role_user')}`}
                                        </Badge>
                                        {profile.isPremium && (
                                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm px-3 py-1">
                                                <Crown className="w-3 h-3 mr-1" />
                                                Premium
                                            </Badge>
                                        )}
                                        <Badge variant="outline" className="text-sm px-3 py-1">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {t('profile_page.personal_info.member_since')} {format(new Date(profile.createdAt), 'MMMM yyyy', { locale: fr })}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex gap-2 mb-4 sm:mb-2">
                                    <Dialog open={isEditing} onOpenChange={setIsEditing}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="gap-2">
                                                <Edit2 className="w-4 h-4" />
                                                {t('profile_page.actions.edit')}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>{t('profile_page.forms.edit_profile_title')}</DialogTitle>
                                                <DialogDescription>
                                                    {t('profile_page.forms.edit_profile_desc')}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleUpdateProfile} className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">{t('profile_page.forms.name')}</Label>
                                                    <Input
                                                        id="name"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone">{t('profile_page.forms.phone')}</Label>
                                                    <Input
                                                        id="phone"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        placeholder="+216 00 000 000"
                                                    />
                                                </div>
                                                <DialogFooter>
                                                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>{t('profile_page.actions.cancel')}</Button>
                                                    <Button type="submit" disabled={isLoading}>
                                                        {isLoading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                                                        {t('profile_page.actions.save')}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>

                                    <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="gap-2">
                                                <Lock className="w-4 h-4" />
                                                {t('profile_page.actions.change_password')}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>{t('profile_page.forms.change_password_title')}</DialogTitle>
                                                <DialogDescription>
                                                    {t('profile_page.forms.change_password_desc')}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleChangePassword} className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="currentPassword">{t('profile_page.forms.current_password')}</Label>
                                                    <Input
                                                        id="currentPassword"
                                                        type="password"
                                                        value={passwordData.currentPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                                                    <Input
                                                        id="newPassword"
                                                        type="password"
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                        required
                                                        minLength={6}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                                                    <Input
                                                        id="confirmPassword"
                                                        type="password"
                                                        value={passwordData.confirmPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                        required
                                                        minLength={6}
                                                    />
                                                </div>
                                                <DialogFooter>
                                                    <Button type="button" variant="outline" onClick={() => setIsChangingPassword(false)}>{t('profile_page.actions.cancel')}</Button>
                                                    <Button type="submit" disabled={isLoading}>
                                                        {isLoading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                                                        {t('profile_page.actions.save')}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
                        <TabsTrigger value="overview">{t('profile_page.tabs.overview')}</TabsTrigger>
                        <TabsTrigger value="achievements">{t('profile_page.tabs.achievements')}</TabsTrigger>
                        <TabsTrigger value="history">{t('profile_page.tabs.history')}</TabsTrigger>
                        <TabsTrigger value="settings">{t('profile_page.tabs.settings')}</TabsTrigger>
                        {profile.isPremium && <TabsTrigger value="premium">{t('profile_page.tabs.premium')}</TabsTrigger>}
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* Stats Grid */}
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{t('profile_page.stats.courses_completed')}</CardTitle>
                                    <BookOpen className="h-5 w-5 text-blue-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-blue-600">{stats.coursesCompleted}</div>
                                    <p className="text-xs text-muted-foreground mt-1">{t('profile_page.stats.lessons_completed')}</p>
                                    <Progress value={(stats.coursesCompleted / 10) * 100} className="mt-3" />
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{t('profile_page.stats.tests_taken')}</CardTitle>
                                    <Target className="h-5 w-5 text-purple-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-purple-600">{stats.totalTests}</div>
                                    <p className="text-xs text-muted-foreground mt-1">{t('profile_page.stats.total_attempts')}</p>
                                    <Progress value={Math.min((stats.totalTests / 50) * 100, 100)} className="mt-3" />
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{t('profile_page.stats.tests_passed')}</CardTitle>
                                    <Trophy className="h-5 w-5 text-green-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-600">{stats.passedTests}</div>
                                    <p className="text-xs text-muted-foreground mt-1">{t('profile_page.stats.rate')}: {successRate}%</p>
                                    <Progress value={successRate} className="mt-3" />
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{t('profile_page.stats.avg_score')}</CardTitle>
                                    <TrendingUp className="h-5 w-5 text-amber-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-amber-600">{Number(stats.averageScore).toFixed(1)}%</div>
                                    <p className="text-xs text-muted-foreground mt-1">{t('profile_page.stats.on_all_tests')}</p>
                                    <Progress value={Number(stats.averageScore)} className="mt-3" />
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow md:col-span-2 lg:col-span-4">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Temps d'apprentissage</CardTitle>
                                    <Clock className="h-5 w-5 text-indigo-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4">
                                        <div className="text-3xl font-bold text-indigo-600">12h 45m</div>
                                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                                            +2h cette semaine
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Total passé sur les cours et les tests</p>
                                    <div className="mt-4 grid grid-cols-7 gap-1 h-12 items-end">
                                        {[30, 45, 20, 60, 40, 80, 50].map((h, i) => (
                                            <div key={i} className="bg-indigo-200 rounded-t-sm hover:bg-indigo-400 transition-colors" style={{ height: `${h}%` }} title={`${h} mins`}></div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Recent Activity */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        {t('profile_page.recent_activity.title')}
                                    </CardTitle>
                                    <CardDescription>{t('profile_page.recent_activity.subtitle')}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {recentAttempts.length > 0 ? (
                                        <div className="space-y-4">
                                            {recentAttempts.slice(0, 5).map((attempt, index) => (
                                                <motion.div
                                                    key={attempt._id || index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-all hover:shadow-md"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-3 rounded-full ${attempt.passed ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                                                            {attempt.passed ? <Trophy className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold">{attempt.test?.title || t('profile_page.recent_activity.test_deleted')}</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                {attempt.test?.category || t('profile_page.recent_activity.general')} • {format(new Date(attempt.createdAt), 'dd MMMM yyyy HH:mm', { locale: fr })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`text-2xl font-bold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                                                            {attempt.score}%
                                                        </div>
                                                        <Badge variant={attempt.passed ? 'default' : 'destructive'} className="mt-1">
                                                            {attempt.passed ? t('profile_page.recent_activity.passed') : t('profile_page.recent_activity.failed')}
                                                        </Badge>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-muted-foreground">
                                            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>{t('profile_page.recent_activity.no_activity')}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>

                    {/* Achievements Tab */}
                    <TabsContent value="achievements" className="space-y-6">
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="w-5 h-5" />
                                    {t('profile_page.achievements.title')}
                                </CardTitle>
                                <CardDescription>
                                    {unlockedAchievements.length} sur {achievements.length} {t('profile_page.achievements.unlocked')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {achievements.map((achievement, index) => {
                                        const Icon = achievement.icon;
                                        return (
                                            <motion.div
                                                key={achievement.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.1 }}
                                                className={`p-6 rounded-lg border-2 transition-all ${achievement.unlocked
                                                    ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-primary shadow-lg hover:shadow-xl'
                                                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-60'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-3 rounded-full ${achievement.unlocked ? 'bg-primary/10' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                                        <Icon className={`w-6 h-6 ${achievement.unlocked ? achievement.color : 'text-gray-400'}`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold mb-1">{t(`profile_page.achievements.list.${achievement.id}.name`)}</h3>
                                                        <p className="text-sm text-muted-foreground">{t(`profile_page.achievements.list.${achievement.id}.desc`)}</p>
                                                        {achievement.unlocked && (
                                                            <Badge variant="default" className="mt-2">
                                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                {t('profile_page.achievements.status_unlocked')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history">
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle>Historique complet</CardTitle>
                                <CardDescription>Tous vos résultats d'examen</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recentAttempts.length > 0 ? (
                                    <div className="space-y-2">
                                        {recentAttempts.map((attempt, index) => (
                                            <div key={attempt._id || index} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-accent/50 transition-colors rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg">
                                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                            {format(new Date(attempt.createdAt), 'dd', { locale: fr })}
                                                        </span>
                                                        <span className="text-xs text-gray-500 uppercase">
                                                            {format(new Date(attempt.createdAt), 'MMM', { locale: fr })}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white">{attempt.test?.title || 'Test inconnu'}</h4>
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <Clock className="w-3 h-3" />
                                                            {format(new Date(attempt.createdAt), 'HH:mm')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className={`text-2xl font-bold ${attempt.passed ? 'text-green-600' : 'text-red-500'}`}>
                                                        {attempt.score}%
                                                    </span>
                                                    {attempt.passed && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>Aucun historique disponible.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="space-y-6">
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="w-5 h-5" />
                                    {t('profile_page.settings.notifications_title')}
                                </CardTitle>
                                <CardDescription>{t('profile_page.settings.notifications_desc')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">{t('profile_page.settings.email.label')}</Label>
                                        <p className="text-sm text-muted-foreground">{t('profile_page.settings.email.desc')}</p>
                                    </div>
                                    <Switch
                                        checked={notifications.emailNotifications}
                                        onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">{t('profile_page.settings.reminders.label')}</Label>
                                        <p className="text-sm text-muted-foreground">{t('profile_page.settings.reminders.desc')}</p>
                                    </div>
                                    <Switch
                                        checked={notifications.testReminders}
                                        onCheckedChange={(checked) => setNotifications({ ...notifications, testReminders: checked })}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">{t('profile_page.settings.progress.label')}</Label>
                                        <p className="text-sm text-muted-foreground">{t('profile_page.settings.progress.desc')}</p>
                                    </div>
                                    <Switch
                                        checked={notifications.progressUpdates}
                                        onCheckedChange={(checked) => setNotifications({ ...notifications, progressUpdates: checked })}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">{t('profile_page.settings.marketing.label')}</Label>
                                        <p className="text-sm text-muted-foreground">{t('profile_page.settings.marketing.desc')}</p>
                                    </div>
                                    <Switch
                                        checked={notifications.marketingEmails}
                                        onCheckedChange={(checked) => setNotifications({ ...notifications, marketingEmails: checked })}
                                    />
                                </div>
                                <div className="pt-4">
                                    <Button className="w-full">
                                        {t('profile_page.actions.save_preferences')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Premium Tab */}
                    {profile.isPremium && (
                        <TabsContent value="premium" className="space-y-6">
                            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                        <Crown className="w-6 h-6" />
                                        {t('profile_page.premium.title')}
                                    </CardTitle>
                                    <CardDescription>{t('profile_page.premium.subtitle')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg">
                                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-semibold">{t('profile_page.premium.features.unlimited.title')}</h4>
                                                <p className="text-sm text-muted-foreground">{t('profile_page.premium.features.unlimited.desc')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg">
                                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-semibold">{t('profile_page.premium.features.no_ads.title')}</h4>
                                                <p className="text-sm text-muted-foreground">{t('profile_page.premium.features.no_ads.desc')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg">
                                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-semibold">{t('profile_page.premium.features.priority_support.title')}</h4>
                                                <p className="text-sm text-muted-foreground">{t('profile_page.premium.features.priority_support.desc')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg">
                                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-semibold">{t('profile_page.premium.features.advanced_stats.title')}</h4>
                                                <p className="text-sm text-muted-foreground">{t('profile_page.premium.features.advanced_stats.desc')}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-amber-200 dark:border-amber-800">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-semibold">{t('profile_page.premium.active_subscription.title')}</h4>
                                                <p className="text-sm text-muted-foreground">{t('profile_page.premium.active_subscription.desc')}</p>
                                            </div>
                                            <Shield className="w-8 h-8 text-amber-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    );
}
