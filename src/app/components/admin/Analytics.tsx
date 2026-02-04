import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';

export function Analytics() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Analytiques
                </h1>
                <p className="text-muted-foreground mt-1">
                    Analyses détaillées et statistiques de la plateforme
                </p>
            </motion.div>

            {/* Analytics Content */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
                        <Users className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">573</div>
                        <p className="text-xs text-muted-foreground">+12% ce mois</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Taux d'Engagement</CardTitle>
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">68%</div>
                        <p className="text-xs text-muted-foreground">+5% ce mois</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Temps Moyen</CardTitle>
                        <Clock className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">24min</div>
                        <p className="text-xs text-muted-foreground">+2min ce mois</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
                        <BarChart3 className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3.2%</div>
                        <p className="text-xs text-muted-foreground">+0.5% ce mois</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Graphiques Analytiques</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                        Graphiques détaillés à venir (intégration avec Recharts)
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
