import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { motion } from 'motion/react';
import {
    BarChart3, TrendingUp, Users, Clock, DollarSign,
    BookOpen, Video, FileText, Award, Loader2, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { adminService, AdminStats } from '@/services/adminService';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
    RadialBarChart, RadialBar
} from 'recharts';

// --- Data for charts that the API doesn't provide ---
const categoryDistribution = [
    { name: 'Sécurité', value: 35, color: '#6366f1' },
    { name: 'Règles', value: 28, color: '#8b5cf6' },
    { name: 'Pratique', value: 22, color: '#a78bfa' },
    { name: 'Signalisation', value: 15, color: '#c4b5fd' },
];

const performanceData = [
    { name: 'Lun', visitors: 120, engagement: 85 },
    { name: 'Mar', visitors: 150, engagement: 92 },
    { name: 'Mer', visitors: 180, engagement: 78 },
    { name: 'Jeu', visitors: 140, engagement: 95 },
    { name: 'Ven', visitors: 200, engagement: 88 },
    { name: 'Sam', visitors: 90, engagement: 70 },
    { name: 'Dim', visitors: 60, engagement: 65 },
];

const platformUsage = [
    { name: 'Cours', value: 40, fill: '#6366f1' },
    { name: 'Vidéos', value: 30, fill: '#8b5cf6' },
    { name: 'Tests', value: 20, fill: '#a78bfa' },
    { name: 'Forum', value: 10, fill: '#c4b5fd' },
];

export function Analytics() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await adminService.getStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-muted-foreground text-sm">Chargement des analytiques...</p>
            </div>
        );
    }

    const kpiCards = [
        {
            label: 'Utilisateurs',
            value: stats?.totalUsers ?? 0,
            change: '+12%',
            trend: 'up' as const,
            icon: Users,
            gradient: 'from-blue-500 to-indigo-600',
            bgGlow: 'shadow-blue-500/20',
        },
        {
            label: 'Revenus',
            value: `${stats?.totalRevenue ?? 0} DT`,
            change: '+8.2%',
            trend: 'up' as const,
            icon: DollarSign,
            gradient: 'from-emerald-500 to-teal-600',
            bgGlow: 'shadow-emerald-500/20',
        },
        {
            label: 'Cours Actifs',
            value: stats?.totalCourses ?? 0,
            change: '+3',
            trend: 'up' as const,
            icon: BookOpen,
            gradient: 'from-violet-500 to-purple-600',
            bgGlow: 'shadow-violet-500/20',
        },
        {
            label: 'Tests Complétés',
            value: stats?.totalTests ?? 0,
            change: '+15%',
            trend: 'up' as const,
            icon: FileText,
            gradient: 'from-amber-500 to-orange-600',
            bgGlow: 'shadow-amber-500/20',
        },
    ];

    const secondaryStats = [
        { label: 'Utilisateurs Premium', value: stats?.premiumUsers ?? 0, icon: Award, color: 'text-yellow-400' },
        { label: 'Vidéos', value: stats?.totalVideos ?? 0, icon: Video, color: 'text-blue-400' },
        { label: 'Questions', value: stats?.totalQuestions ?? 0, icon: FileText, color: 'text-purple-400' },
        { label: 'Taux de Conversion', value: '3.2%', icon: TrendingUp, color: 'text-green-400' },
    ];

    const tooltipStyle = {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '12px',
        color: '#e2e8f0',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        padding: '12px 16px',
    };

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
                        <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Analytiques
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Vue d'ensemble de la performance de votre plateforme
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {kpiCards.map((kpi, index) => {
                    const Icon = kpi.icon;
                    return (
                        <motion.div
                            key={kpi.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                        >
                            <Card className={`relative overflow-hidden border-white/5 bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.06] transition-all duration-300 shadow-xl ${kpi.bgGlow}`}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 bg-gradient-to-br ${kpi.gradient} rounded-xl shadow-lg`}>
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${kpi.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                            }`}>
                                            {kpi.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                            {kpi.change}
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-white mb-1">{kpi.value}</div>
                                    <div className="text-sm text-gray-400 font-medium">{kpi.label}</div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Secondary Stats Row */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                {secondaryStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                            <Icon className={`w-5 h-5 ${stat.color}`} />
                            <div>
                                <div className="text-lg font-bold text-white">{stat.value}</div>
                                <div className="text-xs text-gray-500">{stat.label}</div>
                            </div>
                        </div>
                    );
                })}
            </motion.div>

            {/* Charts Row 1: User Growth + Revenue */}
            <div className="grid lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="border-white/5 bg-white/[0.03] backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
                                <TrendingUp className="w-5 h-5 text-blue-400" />
                                Croissance des Utilisateurs
                            </CardTitle>
                            <p className="text-xs text-gray-500">Évolution mensuelle</p>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats?.userGrowth || []}>
                                        <defs>
                                            <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#6366f1"
                                            strokeWidth={3}
                                            fill="url(#userGradient)"
                                            dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#1e1b4b' }}
                                            activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 2 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <Card className="border-white/5 bg-white/[0.03] backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
                                <DollarSign className="w-5 h-5 text-emerald-400" />
                                Revenus Mensuels
                            </CardTitle>
                            <p className="text-xs text-gray-500">Performance financière</p>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats?.revenueGrowth || []}>
                                        <defs>
                                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={1} />
                                                <stop offset="95%" stopColor="#059669" stopOpacity={0.8} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }} />
                                        <Bar
                                            dataKey="amount"
                                            fill="url(#revenueGradient)"
                                            radius={[8, 8, 0, 0]}
                                            barSize={32}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Charts Row 2: Performance + Category */}
            <div className="grid lg:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="lg:col-span-2">
                    <Card className="border-white/5 bg-white/[0.03] backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
                                <BarChart3 className="w-5 h-5 text-violet-400" />
                                Performance Hebdomadaire
                            </CardTitle>
                            <p className="text-xs text-gray-500">Visiteurs et engagement cette semaine</p>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={performanceData} barGap={4}>
                                        <defs>
                                            <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.7} />
                                            </linearGradient>
                                            <linearGradient id="engagementGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.7} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }} />
                                        <Bar dataKey="visitors" fill="url(#visitorsGrad)" radius={[6, 6, 0, 0]} barSize={18} name="Visiteurs" />
                                        <Bar dataKey="engagement" fill="url(#engagementGrad)" radius={[6, 6, 0, 0]} barSize={18} name="Engagement" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                    <Card className="border-white/5 bg-white/[0.03] backdrop-blur-sm h-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold text-white">
                                Distribution du Contenu
                            </CardTitle>
                            <p className="text-xs text-gray-500">Répartition par catégorie</p>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[220px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={85}
                                            paddingAngle={4}
                                            dataKey="value"
                                            strokeWidth={0}
                                        >
                                            {categoryDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={tooltipStyle} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {categoryDistribution.map((cat) => (
                                    <div key={cat.name} className="flex items-center gap-2 text-xs">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                        <span className="text-gray-400">{cat.name}</span>
                                        <span className="text-white font-medium ml-auto">{cat.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Platform Usage + Recent Activity */}
            <div className="grid lg:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                    <Card className="border-white/5 bg-white/[0.03] backdrop-blur-sm h-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold text-white">
                                Utilisation Plateforme
                            </CardTitle>
                            <p className="text-xs text-gray-500">Répartition de l'activité</p>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[220px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="25%"
                                        outerRadius="90%"
                                        data={platformUsage}
                                        startAngle={90}
                                        endAngle={-270}
                                    >
                                        <RadialBar
                                            background={{ fill: 'rgba(255,255,255,0.03)' }}
                                            dataKey="value"
                                            cornerRadius={8}
                                        />
                                        <Tooltip contentStyle={tooltipStyle} />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-2 mt-2">
                                {platformUsage.map((item) => (
                                    <div key={item.name} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                                            <span className="text-gray-400">{item.name}</span>
                                        </div>
                                        <span className="text-white font-medium">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="lg:col-span-2">
                    <Card className="border-white/5 bg-white/[0.03] backdrop-blur-sm h-full">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
                                <Clock className="w-5 h-5 text-amber-400" />
                                Activité Récente
                            </CardTitle>
                            <p className="text-xs text-gray-500">Derniers utilisateurs inscrits</p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {(stats?.recentUsers || []).slice(0, 5).map((user, idx) => (
                                    <motion.div
                                        key={user.id || idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.9 + idx * 0.05 }}
                                        className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-colors"
                                    >
                                        <div className="flex-shrink-0">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/30" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                                    {user.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${user.isPremium
                                                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                                }`}>
                                                {user.isPremium ? 'Premium' : 'Gratuit'}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                                {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                                    <p className="text-center text-sm text-gray-500 py-8">Aucun utilisateur récent</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
