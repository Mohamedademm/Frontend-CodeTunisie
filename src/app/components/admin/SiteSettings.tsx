import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Switch } from '@/app/components/ui/switch';
import { adminService } from '@/services/adminService';
import { toast } from 'sonner';
import {
    Settings, Globe, Palette, Shield, Bell, AlertTriangle,
    Save, Loader2, Mail, Building2, Lock, UserPlus,
    Wrench, Eye, CheckCircle2, RefreshCw, Info, Lightbulb,
    HelpCircle, Sparkles, ChevronDown, ChevronUp, BookOpen
} from 'lucide-react';

export function SiteSettings() {
    const [settings, setSettings] = useState({
        siteName: '',
        contactEmail: '',
        maintenanceMode: false,
        registrationOpen: true,
        themeColor: '#3b82f6',
    });
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);
    const [originalSettings, setOriginalSettings] = useState(settings);

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        setHasChanges(JSON.stringify(settings) !== JSON.stringify(originalSettings));
    }, [settings, originalSettings]);

    const loadSettings = async () => {
        try {
            setInitialLoading(true);
            const data = await adminService.getSettings();
            if (data) {
                setSettings(data);
                setOriginalSettings(data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors du chargement des paramètres");
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await adminService.updateSettings(settings);
            setOriginalSettings(settings);
            setHasChanges(false);
            toast.success("Paramètres enregistrés avec succès !");
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'enregistrement");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSettings(originalSettings);
        toast.info("Modifications annulées");
    };

    const presetColors = [
        { name: 'Bleu', value: '#3b82f6' },
        { name: 'Indigo', value: '#6366f1' },
        { name: 'Violet', value: '#8b5cf6' },
        { name: 'Émeraude', value: '#10b981' },
        { name: 'Ambre', value: '#f59e0b' },
        { name: 'Rose', value: '#ec4899' },
        { name: 'Rouge', value: '#ef4444' },
        { name: 'Cyan', value: '#06b6d4' },
    ];

    if (initialLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-muted-foreground text-sm">Chargement des paramètres...</p>
            </div>
        );
    }

    // Help tip component
    const HelpTip = ({ children, variant = 'info' }: { children: React.ReactNode; variant?: 'info' | 'tip' | 'warning' }) => {
        const styles = {
            info: { bg: 'bg-blue-500/8', border: 'border-blue-500/15', icon: Info, iconColor: 'text-blue-400', textColor: 'text-blue-300/80' },
            tip: { bg: 'bg-emerald-500/8', border: 'border-emerald-500/15', icon: Lightbulb, iconColor: 'text-emerald-400', textColor: 'text-emerald-300/80' },
            warning: { bg: 'bg-amber-500/8', border: 'border-amber-500/15', icon: AlertTriangle, iconColor: 'text-amber-400', textColor: 'text-amber-300/80' },
        };
        const s = styles[variant];
        const TipIcon = s.icon;
        return (
            <div className={`flex items-start gap-2.5 p-3 rounded-lg ${s.bg} border ${s.border}`}>
                <TipIcon className={`w-4 h-4 ${s.iconColor} flex-shrink-0 mt-0.5`} />
                <p className={`text-xs leading-relaxed ${s.textColor}`}>{children}</p>
            </div>
        );
    };

    // Badge for coming soon features
    const ComingSoonBadge = () => (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Sparkles className="w-3 h-3" />
            Bientôt
        </span>
    );

    // Section wrapper component
    const SettingsSection = ({
        icon: Icon, title, description, gradient, delay, children, helpText
    }: {
        icon: any; title: string; description: string; gradient: string; delay: number; children: React.ReactNode; helpText?: string;
    }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <Card className="border-white/5 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 bg-gradient-to-br ${gradient} rounded-xl shadow-lg`}>
                            <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-lg text-white">{title}</CardTitle>
                            <CardDescription className="text-gray-500 text-sm">{description}</CardDescription>
                        </div>
                        {helpText && (
                            <div className="group relative">
                                <HelpCircle className="w-5 h-5 text-gray-600 hover:text-gray-400 cursor-help transition-colors" />
                                <div className="absolute right-0 top-8 w-72 p-3 rounded-xl bg-gray-900/95 border border-white/10 text-xs text-gray-300 leading-relaxed shadow-2xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    {helpText}
                                </div>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-5 pt-0">
                    {children}
                </CardContent>
            </Card>
        </motion.div>
    );

    // Individual setting row
    const SettingToggle = ({
        icon: Icon, label, description, checked, onChange, color = 'text-gray-400', comingSoon = false
    }: {
        icon: any; label: string; description: string; checked: boolean; onChange: (v: boolean) => void; color?: string; comingSoon?: boolean;
    }) => (
        <div className={`flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors ${comingSoon ? 'opacity-70' : ''}`}>
            <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${color}`} />
                <div>
                    <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium text-white cursor-pointer">{label}</Label>
                        {comingSoon && <ComingSoonBadge />}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                </div>
            </div>
            <Switch checked={checked} onCheckedChange={onChange} disabled={comingSoon} />
        </div>
    );

    return (
        <div className="space-y-8 max-w-4xl">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-gray-500 to-zinc-600 rounded-xl shadow-lg shadow-gray-500/20">
                        <Settings className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Paramètres
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Configurez et personnalisez votre plateforme
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Quick Start Guide */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
            >
                <Card className="border-indigo-500/10 bg-indigo-500/[0.04] backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-lg flex-shrink-0">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div className="space-y-3 flex-1">
                                <div>
                                    <h3 className="text-sm font-semibold text-white">Guide de configuration rapide</h3>
                                    <p className="text-xs text-gray-400 mt-1">Suivez ces étapes pour configurer votre plateforme correctement</p>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-2">
                                    {[
                                        { step: '1', text: 'Définissez le nom et l\'email de contact de votre site', done: !!settings.siteName },
                                        { step: '2', text: 'Choisissez une couleur de thème qui représente votre marque', done: settings.themeColor !== '#3b82f6' },
                                        { step: '3', text: 'Vérifiez que les inscriptions sont ouvertes ou fermées', done: true },
                                        { step: '4', text: 'Configurez les notifications selon vos besoins', done: false },
                                    ].map((item) => (
                                        <div key={item.step} className={`flex items-center gap-2.5 p-2.5 rounded-lg text-xs ${item.done ? 'bg-emerald-500/10 border border-emerald-500/15' : 'bg-white/[0.02] border border-white/5'
                                            }`}>
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${item.done
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-white/10 text-gray-400'
                                                }`}>
                                                {item.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : item.step}
                                            </div>
                                            <span className={item.done ? 'text-emerald-300/80' : 'text-gray-400'}>{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Unsaved Changes Banner */}
            {hasChanges && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm"
                >
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        <p className="text-sm text-amber-300 font-medium">
                            Vous avez des modifications non enregistrées
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleReset} className="text-gray-400 hover:text-white">
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Annuler
                        </Button>
                        <Button size="sm" onClick={(e: any) => handleSave(e)} disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-black gap-1">
                            <Save className="w-4 h-4" />
                            Enregistrer
                        </Button>
                    </div>
                </motion.div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
                {/* General Section */}
                <SettingsSection
                    icon={Globe}
                    title="Général"
                    description="Informations de base de votre plateforme"
                    gradient="from-blue-500 to-indigo-600"
                    delay={0.1}
                    helpText="Ces informations apparaissent dans l'en-tête du site, les emails envoyés aux utilisateurs, et les métadonnées SEO de la plateforme."
                >
                    <HelpTip variant="info">Le nom du site sera affiché dans la barre de navigation, le pied de page, et dans tous les emails automatiques envoyés aux utilisateurs.</HelpTip>
                    <div className="space-y-2">
                        <Label className="text-sm text-gray-300 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-400" />
                            Nom du site
                        </Label>
                        <Input
                            value={settings.siteName}
                            onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                            placeholder="CodeTunisiePro"
                            className="bg-white/[0.03] border-white/10 focus:border-indigo-500/50 h-11 text-white placeholder:text-gray-600"
                        />
                        <p className="text-[11px] text-gray-600">Ex: CodeTunisiePro, Mon Auto-École, Permis Express</p>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm text-gray-300 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-blue-400" />
                            Email de contact
                        </Label>
                        <Input
                            type="email"
                            value={settings.contactEmail}
                            onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
                            placeholder="contact@codetunisie.pro"
                            className="bg-white/[0.03] border-white/10 focus:border-indigo-500/50 h-11 text-white placeholder:text-gray-600"
                        />
                        <p className="text-[11px] text-gray-600">Cet email recevra les messages du formulaire de contact et les rapports système</p>
                    </div>
                </SettingsSection>

                {/* Appearance Section */}
                <SettingsSection
                    icon={Palette}
                    title="Apparence"
                    description="Personnalisez le thème visuel de la plateforme"
                    gradient="from-violet-500 to-purple-600"
                    delay={0.2}
                    helpText="La couleur principale est utilisée pour les boutons, les liens, les accents de navigation et les éléments interactifs de votre site."
                >
                    <HelpTip variant="tip">Choisissez une couleur qui correspond à votre identité visuelle. Les couleurs vives comme le bleu ou l'indigo sont recommandées pour une meilleure lisibilité.</HelpTip>
                    <div className="space-y-3">
                        <Label className="text-sm text-gray-300 flex items-center gap-2">
                            <Eye className="w-4 h-4 text-violet-400" />
                            Couleur principale
                        </Label>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <input
                                    type="color"
                                    value={settings.themeColor}
                                    onChange={e => setSettings({ ...settings, themeColor: e.target.value })}
                                    className="w-14 h-14 rounded-xl border-2 border-white/10 cursor-pointer bg-transparent"
                                />
                            </div>
                            <div className="space-y-1">
                                <Input
                                    value={settings.themeColor}
                                    onChange={e => setSettings({ ...settings, themeColor: e.target.value })}
                                    className="bg-white/[0.03] border-white/10 focus:border-violet-500/50 h-11 text-white font-mono w-32"
                                />
                                <p className="text-[11px] text-gray-600">Code hexadécimal (ex: #6366f1)</p>
                            </div>
                        </div>
                        {/* Live Preview */}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                            <span className="text-xs text-gray-500">Aperçu :</span>
                            <button type="button" className="px-4 py-1.5 rounded-lg text-white text-xs font-medium" style={{ backgroundColor: settings.themeColor }}>Bouton</button>
                            <span className="text-xs font-medium" style={{ color: settings.themeColor }}>Lien exemple</span>
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: settings.themeColor }} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm text-gray-300">Couleurs prédéfinies</Label>
                        <div className="flex flex-wrap gap-3">
                            {presetColors.map((color) => (
                                <button
                                    type="button"
                                    key={color.value}
                                    onClick={() => setSettings({ ...settings, themeColor: color.value })}
                                    className={`group relative w-10 h-10 rounded-xl transition-all duration-300 hover:scale-110 ${settings.themeColor === color.value
                                        ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-gray-900 scale-110'
                                        : 'hover:ring-1 hover:ring-white/20'
                                        }`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                >
                                    {settings.themeColor === color.value && (
                                        <CheckCircle2 className="w-5 h-5 text-white absolute inset-0 m-auto drop-shadow-lg" />
                                    )}
                                </button>
                            ))}
                        </div>
                        <p className="text-[11px] text-gray-600">Cliquez sur une couleur pour l'appliquer instantanément</p>
                    </div>
                </SettingsSection>

                {/* Security & Access Section */}
                <SettingsSection
                    icon={Shield}
                    title="Sécurité & Accès"
                    description="Contrôlez l'accès et la disponibilité de la plateforme"
                    gradient="from-emerald-500 to-teal-600"
                    delay={0.3}
                    helpText="Ces paramètres contrôlent qui peut accéder à votre plateforme et comment les utilisateurs se connectent."
                >
                    <HelpTip variant="warning">Désactiver les inscriptions empêchera tout nouvel utilisateur de créer un compte. Les comptes existants ne seront pas affectés.</HelpTip>
                    <SettingToggle
                        icon={UserPlus}
                        label="Inscriptions ouvertes"
                        description="Autoriser les nouveaux utilisateurs à créer un compte"
                        checked={settings.registrationOpen}
                        onChange={c => setSettings({ ...settings, registrationOpen: c })}
                        color="text-emerald-400"
                    />
                    {!settings.registrationOpen && (
                        <HelpTip variant="warning">Les inscriptions sont actuellement fermées. Aucun nouvel utilisateur ne peut s'inscrire.</HelpTip>
                    )}
                    <SettingToggle
                        icon={Lock}
                        label="Authentification à deux facteurs"
                        description="Demander un code de vérification lors de la connexion"
                        checked={false}
                        onChange={() => toast.info("Fonctionnalité à venir")}
                        color="text-emerald-400"
                        comingSoon
                    />
                </SettingsSection>

                {/* Notifications Section */}
                <SettingsSection
                    icon={Bell}
                    title="Notifications"
                    description="Gérez les alertes et les communications"
                    gradient="from-amber-500 to-orange-600"
                    delay={0.4}
                    helpText="Les notifications vous permettent de rester informé des inscriptions, paiements et activités importantes sur votre plateforme."
                >
                    <HelpTip variant="tip">Activez les notifications email pour être alerté quand un nouvel utilisateur s'inscrit, qu'un paiement est reçu, ou qu'un test est complété.</HelpTip>
                    <SettingToggle
                        icon={Mail}
                        label="Notifications par email"
                        description="Recevoir des alertes par email pour les événements importants"
                        checked={true}
                        onChange={() => toast.info("Fonctionnalité à venir")}
                        color="text-amber-400"
                        comingSoon
                    />
                    <SettingToggle
                        icon={Bell}
                        label="Notifications push"
                        description="Recevoir des notifications dans le navigateur"
                        checked={false}
                        onChange={() => toast.info("Fonctionnalité à venir")}
                        color="text-amber-400"
                        comingSoon
                    />
                </SettingsSection>

                {/* Danger Zone */}
                <SettingsSection
                    icon={AlertTriangle}
                    title="Zone de danger"
                    description="Actions sensibles nécessitant une attention particulière"
                    gradient="from-red-500 to-rose-600"
                    delay={0.5}
                    helpText="Ces options peuvent affecter l'accès de tous les utilisateurs à votre plateforme. Utilisez-les avec précaution."
                >
                    <HelpTip variant="warning">Le mode maintenance bloque l'accès à tous les utilisateurs sauf les administrateurs. Utilisez-le lors de mises à jour importantes ou de migrations.</HelpTip>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                        <div className="flex items-center gap-3">
                            <Wrench className="w-5 h-5 text-red-400" />
                            <div>
                                <Label className="text-sm font-medium text-white cursor-pointer">Mode Maintenance</Label>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Rendre le site inaccessible aux utilisateurs (sauf admins)
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.maintenanceMode}
                            onCheckedChange={c => setSettings({ ...settings, maintenanceMode: c })}
                        />
                    </div>

                    {settings.maintenanceMode && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-3"
                        >
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                <p className="text-xs text-red-300">
                                    ⚠️ Le mode maintenance est <strong>ACTIVÉ</strong>. Les utilisateurs non-administrateurs ne peuvent pas accéder au site.
                                </p>
                            </div>
                            <HelpTip variant="info">N'oubliez pas de désactiver le mode maintenance une fois vos modifications terminées pour permettre aux utilisateurs de revenir sur le site.</HelpTip>
                        </motion.div>
                    )}
                </SettingsSection>

                {/* Save Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center justify-between pt-4"
                >
                    <p className="text-xs text-gray-600">
                        Dernière modification : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <div className="flex items-center gap-3">
                        {hasChanges && (
                            <Button type="button" variant="outline" onClick={handleReset} className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5">
                                Annuler
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={loading || !hasChanges}
                            className={`gap-2 px-6 h-11 transition-all duration-300 ${hasChanges
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 text-white'
                                : 'bg-white/5 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </Button>
                    </div>
                </motion.div>
            </form>
        </div>
    );
}
