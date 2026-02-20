import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Users, BookOpen, FileText, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { StatsOverview } from './StatsOverview';

interface StatCardProps {
    title: string;
    value: string | number;
    change: number;
    icon: React.ElementType;
    trend: 'up' | 'down';
}

function StatCard({ title, value, change, icon: Icon, trend }: StatCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <Icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    {trend === 'up' ? (
                        <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : (
                        <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                    <span className={trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                        {change > 0 ? '+' : ''}{change}%
                    </span>
                    <span>vs mois dernier</span>
                </div>
            </CardContent>
        </Card>
    );
}

export function AdminDashboard() {
    // Mock data - will be replaced with real API calls
    const stats = [
        { title: 'Total Utilisateurs', value: '1,234', change: 12.5, icon: Users, trend: 'up' as const },
        { title: 'Cours Actifs', value: '45', change: 8.2, icon: BookOpen, trend: 'up' as const },
        { title: 'Tests Complétés', value: '892', change: -3.1, icon: FileText, trend: 'down' as const },
        { title: 'Revenus (TND)', value: '12,450', change: 15.3, icon: DollarSign, trend: 'up' as const },
    ];

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl sm:text-3xl font-bold  dark:text-white">
                    Tableau de bord
                </h1>
                <p className="text-muted-foreground mt-1">
                    Vue d'ensemble de votre plateforme
                </p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
            >
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                    >
                        <StatCard {...stat} />
                    </motion.div>
                ))}
            </motion.div>

            {/* Detailed Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <StatsOverview />
            </motion.div>

            {/* Recent Activity */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid gap-4 md:grid-cols-2"
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Activité Récente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { user: 'Mohamed Ali', action: 'a complété le cours "Code de la route"', time: 'Il y a 5 min' },
                                { user: 'Fatma Ben Salem', action: 's\'est inscrit', time: 'Il y a 12 min' },
                                { user: 'Ahmed Trabelsi', action: 'a réussi le test "Signalisation"', time: 'Il y a 23 min' },
                                { user: 'Leila Mansour', action: 'est passé Premium', time: 'Il y a 1h' },
                            ].map((activity, index) => (
                                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center text-white text-sm font-semibold">
                                        {activity.user.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm">
                                            <span className="font-medium">{activity.user}</span>{' '}
                                            <span className="text-muted-foreground">{activity.action}</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Actions Rapides</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2">
                            <button className="p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <div className="font-medium">Ajouter un cours</div>
                                <div className="text-sm text-muted-foreground">Créer un nouveau cours</div>
                            </button>
                            <button className="p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <div className="font-medium">Gérer les utilisateurs</div>
                                <div className="text-sm text-muted-foreground">Voir tous les utilisateurs</div>
                            </button>
                            <button className="p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <div className="font-medium">Créer un test</div>
                                <div className="text-sm text-muted-foreground">Ajouter un nouveau test</div>
                            </button>
                            <button className="p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <div className="font-medium">Voir les paiements</div>
                                <div className="text-sm text-muted-foreground">Historique des transactions</div>
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
