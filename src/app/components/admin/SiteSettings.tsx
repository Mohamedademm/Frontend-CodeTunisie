import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Switch } from '@/app/components/ui/switch';
import { adminService } from '@/services/adminService';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

export function SiteSettings() {
    const [settings, setSettings] = useState({
        siteName: '',
        contactEmail: '',
        maintenanceMode: false,
        registrationOpen: true,
        themeColor: '#3b82f6',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await adminService.getSettings();
            if (data) setSettings(data);
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors du chargement des paramètres");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await adminService.updateSettings(settings);
            toast.success("Paramètres enregistrés");
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'enregistrement");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSave}>
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Général</CardTitle>
                            <CardDescription>Configuration générale du site</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nom du site</Label>
                                <Input value={settings.siteName} onChange={e => setSettings({ ...settings, siteName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Email de contact</Label>
                                <Input value={settings.contactEmail} onChange={e => setSettings({ ...settings, contactEmail: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Couleur du thème</Label>
                                <div className="flex gap-2">
                                    <Input type="color" className="w-12 p-1" value={settings.themeColor} onChange={e => setSettings({ ...settings, themeColor: e.target.value })} />
                                    <Input value={settings.themeColor} onChange={e => setSettings({ ...settings, themeColor: e.target.value })} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Accès et Maintenance</CardTitle>
                            <CardDescription>Contrôler l'accès à la plateforme</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Mode Maintenance</Label>
                                    <p className="text-sm text-gray-500">Rendre le site inaccessible aux utilisateurs (sauf admins)</p>
                                </div>
                                <Switch checked={settings.maintenanceMode} onCheckedChange={c => setSettings({ ...settings, maintenanceMode: c })} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Inscriptions Ouvertes</Label>
                                    <p className="text-sm text-gray-500">Autoriser les nouveaux utilisateurs à s'inscrire</p>
                                </div>
                                <Switch checked={settings.registrationOpen} onCheckedChange={c => setSettings({ ...settings, registrationOpen: c })} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={loading} className="gap-2">
                            <Save className="w-4 h-4" />
                            Enregistrer les modifications
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
