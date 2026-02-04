import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/services/authService';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Car } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await authService.forgotPassword(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
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
                </div>

                <Card className="border-0 shadow-2xl">
                    <CardHeader>
                        <CardTitle>Mot de passe oublié</CardTitle>
                        <CardDescription>
                            {success
                                ? 'Vérifiez votre email'
                                : 'Entrez votre email pour réinitialiser votre mot de passe'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {success ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-center">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                                <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-800 dark:text-green-200">
                                        Un email de réinitialisation a été envoyé à <strong>{email}</strong>.
                                        Veuillez vérifier votre boîte de réception et suivre les instructions.
                                    </AlertDescription>
                                </Alert>
                                <Button
                                    onClick={() => navigate('/login')}
                                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                                >
                                    Retour à la connexion
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email">Adresse email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="votre@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Nous vous enverrons un lien pour réinitialiser votre mot de passe
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Envoi...' : 'Envoyer le lien'}
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => navigate('/login')}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Retour à la connexion
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>

                {!success && (
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                        Vous vous souvenez de votre mot de passe?{' '}
                        <Link
                            to="/login"
                            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            Se connecter
                        </Link>
                    </p>
                )}
            </motion.div>
        </div>
    );
};
