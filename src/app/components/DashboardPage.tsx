import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Award, BookOpen, FileText, Calendar, Flame, Target, Star, Trophy,
  Heart, RefreshCw, TrendingUp, CheckCircle, XCircle, Loader2, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { dashboardService, DashboardData } from '@/services/dashboardService';
import { toast } from 'sonner';
import { Award as AwardIcon, Trophy as TrophyIcon, Flame as FlameIcon, Crown, Timer, ShieldCheck } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  award: AwardIcon, trophy: TrophyIcon, flame: FlameIcon, crown: Crown,
  timer: Timer, 'shield-check': ShieldCheck, star: Star,
};

const LEVEL_TITLES: Record<number, string> = {
  1: 'Novice', 2: 'Apprenti', 3: 'Conducteur Prudent', 4: 'Expert',
  5: 'Maître du Code', 6: 'Légende de la Route',
};

const PIE_COLORS = ['#22c55e', '#3b82f6', '#e5e7eb'];

export function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await dashboardService.getDashboard();
      setData(result);
      // Notify new badges
      if (result.newBadges?.length > 0) {
        result.newBadges.forEach((b: any) => {
          toast.success(`🏅 Badge débloqué : ${b.name}!`, { duration: 5000 });
        });
      }
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les données. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement de votre progression...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <XCircle className="w-12 h-12 text-destructive mx-auto" />
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchDashboard} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" /> Réessayer
          </Button>
        </div>
      </div>
    );
  }

  const { user, stats, weeklyActivity, categoryProgress, recentAttempts } = data;
  const levelTitle = LEVEL_TITLES[user.level] || `Niveau ${user.level}`;

  const courseDistribution = [
    { name: 'Complétés', value: stats.coursesCompleted, color: PIE_COLORS[0] },
    { name: 'En cours', value: stats.coursesInProgress, color: PIE_COLORS[1] },
    { name: 'Non commencés', value: Math.max(0, stats.totalCourses - stats.coursesCompleted - stats.coursesInProgress), color: PIE_COLORS[2] },
  ].filter(d => d.value > 0);

  return (
    <div className="min-h-screen bg-background py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                alt={user.name}
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-primary/30 shadow-lg"
              />
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-foreground">
                  Bonjour, {user.name.split(' ')[0]} ! 👋
                </h1>
                <p className="text-muted-foreground">Voici votre progression en temps réel</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={fetchDashboard} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Actualiser
            </Button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
        >
          <button
            onClick={() => navigate('/revision')}
            className="group flex items-center gap-4 p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl hover:shadow-lg transition-all duration-300 text-left"
          >
            <div className="p-3 bg-amber-500/10 rounded-xl group-hover:bg-amber-500/20 transition-colors">
              <BookOpen className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Révision</h3>
              <p className="text-sm text-muted-foreground">Revoir les questions ratées</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-amber-600 transition-colors" />
          </button>

          <button
            onClick={() => navigate('/favorites')}
            className="group flex items-center gap-4 p-5 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/10 dark:to-pink-900/10 border border-rose-200 dark:border-rose-800 rounded-2xl hover:shadow-lg transition-all duration-300 text-left"
          >
            <div className="p-3 bg-rose-500/10 rounded-xl group-hover:bg-rose-500/20 transition-colors">
              <Heart className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Favoris</h3>
              <p className="text-sm text-muted-foreground">Vidéos sauvegardées</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-rose-600 transition-colors" />
          </button>
        </motion.div>

        {/* XP Card + Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* XP / Level Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2">
            <Card className="h-full bg-gradient-to-br from-primary to-accent text-primary-foreground border-none shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
              <CardContent className="p-6 relative z-10 flex items-center justify-between h-full">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
                      <Star className="w-3 h-3 mr-1 fill-current" /> Niveau {user.level}
                    </Badge>
                    <span className="text-primary-foreground/80 text-sm">{levelTitle}</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-1">{user.xp.toLocaleString()} XP</h3>
                  <p className="text-primary-foreground/70 text-sm mb-3">
                    {user.xpForNextLevel - user.xp} XP avant le niveau suivant
                  </p>
                  <div className="w-full bg-white/20 rounded-full h-2.5 mb-1 max-w-xs">
                    <div
                      className="bg-white rounded-full h-2.5 transition-all duration-700"
                      style={{ width: `${user.xpProgress}%` }}
                    />
                  </div>
                  <p className="text-primary-foreground/60 text-xs">{user.xpProgress}% vers le niveau {user.level + 1}</p>
                </div>
                <div className="hidden sm:flex flex-col items-center gap-2">
                  <div className="w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-sm">
                    <Trophy className="w-9 h-9 text-yellow-300 drop-shadow-lg" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tests réussis */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="h-full hover:shadow-lg transition-all dark:bg-card border shadow-sm group">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  {stats.totalTests > 0 && (
                    <span className="text-xs font-bold px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                      {Math.round((stats.passedTests / stats.totalTests) * 100)}%
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tests réussis</p>
                  <p className="text-3xl font-bold text-foreground">{stats.passedTests}</p>
                  <p className="text-xs text-muted-foreground mt-1">sur {stats.totalTests} tentatives</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Streak */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="h-full hover:shadow-lg transition-all dark:bg-card border shadow-sm group relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors" />
              <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl group-hover:scale-110 transition-transform">
                    <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400 animate-pulse" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Série actuelle</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-bold text-foreground">{user.streak}</p>
                    <span className="text-sm text-muted-foreground">jours</span>
                  </div>
                  {user.streak >= 7 && <p className="text-xs text-orange-500 mt-1 font-medium">🔥 En feu !</p>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">

            {/* Weekly Activity */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="dark:bg-card border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Calendar className="w-5 h-5 text-primary" />
                    Activité hebdomadaire
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {weeklyActivity.some(d => d.tests > 0) ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={weeklyActivity}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="day" className="text-xs fill-muted-foreground" tick={{ fill: 'var(--color-muted-foreground)' }} />
                        <YAxis allowDecimals={false} className="text-xs fill-muted-foreground" tick={{ fill: 'var(--color-muted-foreground)' }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'var(--color-card)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                          labelStyle={{ fontWeight: 600 }}
                          formatter={(v) => [`${v} test(s)`, 'Tests']}
                        />
                        <Bar dataKey="tests" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-48 flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <Calendar className="w-10 h-10 opacity-30" />
                      <p className="text-sm">Aucune activité cette semaine. <span className="text-primary cursor-pointer" onClick={() => navigate('/tests')}>Commencer un test</span></p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Progress by Category */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="dark:bg-card border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Target className="w-5 h-5 text-secondary" />
                    Progression par catégorie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryProgress.length > 0 ? (
                    <div className="space-y-4">
                      {categoryProgress.map((item, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground capitalize">{item.name}</span>
                            <span className="text-sm font-semibold text-primary">{item.value}%</span>
                          </div>
                          <Progress value={item.value} className="h-2.5" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-32 flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <Target className="w-8 h-8 opacity-30" />
                      <p className="text-sm">Faites des tests pour voir votre progression</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Test Attempts */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Card className="dark:bg-card border shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <FileText className="w-5 h-5 text-accent" />
                      Tentatives récentes
                    </CardTitle>
                    {recentAttempts.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => navigate('/revision')} className="gap-1 text-muted-foreground hover:text-foreground">
                        Réviser <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {recentAttempts.length > 0 ? (
                    <div className="space-y-3">
                      {recentAttempts.map((attempt: any, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className={`p-2 rounded-lg ${attempt.passed ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                            {attempt.passed
                              ? <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                              : <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            }
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground text-sm">{attempt.test?.title || 'Test'}</p>
                            <p className="text-xs text-muted-foreground">{new Date(attempt.completedAt || attempt.createdAt).toLocaleDateString('fr-FR')}</p>
                          </div>
                          <span className={`text-sm font-bold ${attempt.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {Math.round(attempt.score)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-32 flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <FileText className="w-8 h-8 opacity-30" />
                      <p className="text-sm">Aucun test effectué</p>
                      <Button size="sm" onClick={() => navigate('/tests')}>Commencer</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Badges */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="dark:bg-card border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Award className="w-5 h-5 text-yellow-500" />
                    Badges obtenus
                    {user.badges.length > 0 && (
                      <Badge className="ml-auto bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-0">
                        {user.badges.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user.badges.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {user.badges.map((badge, i) => {
                        const Icon = ICON_MAP[badge.icon] || AwardIcon;
                        return (
                          <motion.div
                            key={badge.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex flex-col items-center text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl"
                          >
                            <div className="p-2 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-md mb-2">
                              <Icon className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-semibold text-foreground leading-tight">{badge.name}</p>
                            <p className="text-[10px] text-orange-500 dark:text-orange-400 mt-1">
                              {new Date(badge.earnedDate).toLocaleDateString('fr-FR')}
                            </p>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground gap-2">
                      <Award className="w-10 h-10 opacity-20" />
                      <p className="text-sm">Pas encore de badges</p>
                      <p className="text-xs">Réussissez des tests pour en gagner !</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Course distribution */}
            {courseDistribution.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card className="dark:bg-card border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-foreground">Répartition des cours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={courseDistribution} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={(e) => `${e.value}`}>
                          {courseDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)', borderRadius: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-2">
                      {courseDistribution.map((item) => (
                        <div key={item.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-muted-foreground">{item.name}</span>
                          </div>
                          <span className="font-semibold text-foreground">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Stats Summary */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Card className="dark:bg-card border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Résumé
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: 'Score moyen', value: `${stats.averageScore}%`, icon: Target, color: 'text-primary' },
                      { label: 'Tests ratés', value: stats.failedTests, icon: XCircle, color: 'text-destructive' },
                      { label: 'Cours terminés', value: stats.coursesCompleted, icon: BookOpen, color: 'text-success' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <item.icon className={`w-4 h-4 ${item.color}`} />
                          <span className="text-sm text-muted-foreground">{item.label}</span>
                        </div>
                        <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
                      </div>
                    ))}
                    {stats.failedTests > 0 && (
                      <Button
                        className="w-full mt-2 gap-2"
                        variant="outline"
                        onClick={() => navigate('/revision')}
                      >
                        <BookOpen className="w-4 h-4" />
                        Réviser les {stats.failedTests} erreurs
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
