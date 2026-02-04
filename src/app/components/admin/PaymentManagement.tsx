import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { motion } from 'motion/react';
import { CreditCard, Download, Filter } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';

export function PaymentManagement() {
    // Mock payment data
    const payments = [
        { id: '1', user: 'Mohamed Ali', amount: '99 TND', date: '2026-01-28', status: 'completed', method: 'Carte' },
        { id: '2', user: 'Fatma Ben Salem', amount: '99 TND', date: '2026-01-27', status: 'completed', method: 'PayPal' },
        { id: '3', user: 'Ahmed Trabelsi', amount: '99 TND', date: '2026-01-26', status: 'pending', method: 'Carte' },
        { id: '4', user: 'Leila Mansour', amount: '99 TND', date: '2026-01-25', status: 'completed', method: 'Carte' },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Paiements
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gérez les transactions et l'historique des paiements
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Filter className="w-4 h-4" />
                        Filtrer
                    </Button>
                    <Button className="gap-2">
                        <Download className="w-4 h-4" />
                        Exporter
                    </Button>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Revenus Totaux</CardTitle>
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12,450 TND</div>
                        <p className="text-xs text-muted-foreground">Ce mois</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">126</div>
                        <p className="text-xs text-muted-foreground">Ce mois</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">En Attente</CardTitle>
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">À traiter</p>
                    </CardContent>
                </Card>
            </div>

            {/* Payments Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Historique des Paiements</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Utilisateur</TableHead>
                                <TableHead>Montant</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Méthode</TableHead>
                                <TableHead>Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                                    <TableCell>{payment.user}</TableCell>
                                    <TableCell className="font-semibold">{payment.amount}</TableCell>
                                    <TableCell>{payment.date}</TableCell>
                                    <TableCell>{payment.method}</TableCell>
                                    <TableCell>
                                        <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                                            {payment.status === 'completed' ? 'Complété' : 'En attente'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
