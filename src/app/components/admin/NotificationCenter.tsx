
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { motion } from 'motion/react';
import { Bell } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

export function NotificationCenter() {
    const notifications = [
        { id: '1', title: 'Nouvel utilisateur inscrit', message: 'Mohamed Ali vient de s\'inscrire', time: 'Il y a 5 min', read: false },
        { id: '2', title: 'Paiement reçu', message: 'Nouveau paiement de 99 TND', time: 'Il y a 12 min', read: false },
        { id: '3', title: 'Cours complété', message: 'Ahmed a terminé le cours "Code de la route"', time: 'Il y a 1h', read: true },
        { id: '4', title: 'Test réussi', message: 'Fatma a réussi le test avec 95%', time: 'Il y a 2h', read: true },
    ];

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Notifications
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Centre de notifications et alertes système
                    </p>
                </div>
                <Button>Marquer tout comme lu</Button>
            </motion.div>

            {/* Notifications List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Notifications Récentes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 rounded-lg border ${!notification.read ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' : 'border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold">{notification.title}</h3>
                                            {!notification.read && <Badge variant="default" className="text-xs">Nouveau</Badge>}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                                        <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                                    </div>
                                    {!notification.read && (
                                        <Button variant="ghost" size="sm">Marquer comme lu</Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Send Notification */}
            <Card>
                <CardHeader>
                    <CardTitle>Envoyer une Notification</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        Fonctionnalité d'envoi de notifications en masse à venir
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
