import { useState, useEffect } from 'react';
import { Search, Download } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { adminService } from '@/services/adminService';
import { Payment } from '@/services/adminService'; // Assuming exported or need to import from types
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function PaymentHistory() {
    const [payments, setPayments] = useState<any[]>([]); // Use any if type not strictly defined yet
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        setLoading(true);
        try {
            const data = await adminService.getPayments();
            setPayments(data);
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors du chargement des paiements");
        } finally {
            setLoading(false);
        }
    };

    const filteredPayments = payments.filter(p =>
        p.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p._id.includes(searchQuery)
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Rechercher un paiement..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Exporter CSV
                </Button>
            </div>

            <div className="border rounded-lg bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Montant</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPayments.map((payment) => (
                            <TableRow key={payment._id}>
                                <TableCell>
                                    <div className="font-medium">{payment.user?.name || 'Utilisateur supprimé'}</div>
                                    <div className="text-sm text-gray-500">{payment.user?.email}</div>
                                </TableCell>
                                <TableCell className="capitalize">{payment.plan} ({payment.duration} mois)</TableCell>
                                <TableCell>{payment.amount} DT</TableCell>
                                <TableCell>
                                    <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                                        {payment.status === 'completed' ? 'Payé' : payment.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {payment.createdAt ? format(new Date(payment.createdAt), 'dd MMM yyyy HH:mm', { locale: fr }) : '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredPayments.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">Aucun paiement trouvé</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
