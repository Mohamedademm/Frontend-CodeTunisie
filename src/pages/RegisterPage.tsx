import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Checkbox } from '@/app/components/ui/checkbox';
import { motion } from 'motion/react';
import { Mail, Lock, User, Phone, Chrome, AlertCircle, Car, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '@/services/api';

export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
    });
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const passwordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;
        return strength;
    };

    const getStrengthColor = (strength: number) => {
        if (strength === 0) return 'bg-gray-200';
        if (strength === 1) return 'bg-red-500';
        if (strength === 2) return 'bg-orange-500';
        if (strength === 3) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStrengthText = (strength: number) => {
        if (strength === 0) return '';
        if (strength === 1) return 'Faible';
        if (strength === 2) return 'Moyen';
        if (strength === 3) return 'Bon';
        return 'Fort';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (formData.password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères');
            return;
        }

        if (!acceptTerms) {
            setError('Vous devez accepter les conditions d\'utilisation');
            return;
        }

        setIsLoading(true);

        try {
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone || undefined,
            });
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleRegister = () => {
        window.location.href = `${API_BASE_URL}/auth/google`;
    };

    const strength = passwordStrength(formData.password);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl mb-4 shadow-lg"
                    >
                        <Car className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                        CodeTunisiePro
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Créez votre compte et commencez à apprendre
                    </p>
                </div>

                <Card className="border-0 shadow-2xl">
                    <CardHeader>
                        <CardTitle>Inscription</CardTitle>
                        <CardDescription>
                            Remplissez le formulaire pour créer votre compte
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="name">Nom complet</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Mohamed Ali"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="votre@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Téléphone (optionnel)</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="+216 XX XXX XXX"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Mot de passe</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                                {formData.password && (
                                    <div className="space-y-1">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? getStrengthColor(strength) : 'bg-gray-200'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Force: {getStrengthText(strength)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="pl-10"
                                        required
                                    />
                                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                        <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="terms"
                                    checked={acceptTerms}
                                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                                />
                                <label
                                    htmlFor="terms"
                                    className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                                >
                                    J'accepte les{' '}
                                    <a href="#" className="text-blue-600 hover:underline">
                                        conditions d'utilisation
                                    </a>{' '}
                                    et la{' '}
                                    <a href="#" className="text-blue-600 hover:underline">
                                        politique de confidentialité
                                    </a>
                                </label>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Création...' : 'Créer mon compte'}
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        Ou s'inscrire avec
                                    </span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={handleGoogleRegister}
                            >
                                <Chrome className="mr-2 h-5 w-5" />
                                Google
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Vous avez déjà un compte?{' '}
                            <Link
                                to="/login"
                                className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                Se connecter
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
};
