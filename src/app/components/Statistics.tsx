import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, Award, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface StatisticsProps {
    userStats?: {
        testsCompleted: number;
        averageScore: number;
        totalTimeSpent: number;
        coursesCompleted: number;
        progressData: Array<{ date: string; score: number }>;
        categoryPerformance: Array<{ category: string; score: number }>;
    };
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export function Statistics({ userStats }: StatisticsProps) {
    // Default data if no stats provided
    const defaultStats = {
        testsCompleted: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        coursesCompleted: 0,
        progressData: [],
        categoryPerformance: []
    };

    const stats = userStats || defaultStats;

    const statCards = [
        {
            title: 'Tests Complétés',
            value: stats.testsCompleted,
            icon: Target,
            color: 'from-blue-500 to-blue-600',
            description: 'Total des tests passés'
        },
        {
            title: 'Score Moyen',
            value: `${stats.averageScore}%`,
            icon: TrendingUp,
            color: 'from-green-500 to-green-600',
            description: 'Performance globale'
        },
        {
            title: 'Cours Terminés',
            value: stats.coursesCompleted,
            icon: Award,
            color: 'from-purple-500 to-purple-600',
            description: 'Modules complétés'
        },
        {
            title: 'Temps Total',
            value: `${Math.floor(stats.totalTimeSpent / 60)}h`,
            icon: Clock,
            color: 'from-orange-500 to-orange-600',
            description: "Heures d'apprentissage"
        }
    ];

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="relative overflow-hidden">
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </CardTitle>
                                    <Icon className={`h-5 w-5 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Progress Over Time */}
                <Card>
                    <CardHeader>
                        <CardTitle>Progression des Scores</CardTitle>
                        <CardDescription>Évolution de vos performances</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={stats.progressData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="date" className="text-xs" />
                                <YAxis className="text-xs" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    dot={{ fill: '#6366f1', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Category Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Performance par Catégorie</CardTitle>
                        <CardDescription>Vos points forts et faibles</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.categoryPerformance}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="category" className="text-xs" />
                                <YAxis className="text-xs" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                                    {stats.categoryPerformance.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Distribution Pie Chart */}
            {stats.categoryPerformance.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Répartition des Tests</CardTitle>
                        <CardDescription>Distribution par catégorie</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={stats.categoryPerformance}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="score"
                                >
                                    {stats.categoryPerformance.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
