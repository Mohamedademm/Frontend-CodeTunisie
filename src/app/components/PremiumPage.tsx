import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Crown, CreditCard, Smartphone, Shield, Star, Info } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Label } from '@/app/components/ui/label';
import { PRICING_PLANS, PAYMENT_METHODS } from '@/app/constants'; // Ensure path is correct
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

export function PremiumPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState(PRICING_PLANS[1]);
    const [paymentMethod, setPaymentMethod] = useState('d17');
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async () => {
        setIsProcessing(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        toast.success(t('premium_page.redirecting'));

        // In a real app, this would redirect to payment URL
        // For now, valid simulation
        setTimeout(() => {
            setIsProcessing(false);
            toast.success(t('premium_page.payment_success'));
            navigate('/dashboard');
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
                            {t('premium_page.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600">{t('premium_page.title_highlight')}</span>
                        </h1>
                        <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400">
                            {t('premium_page.subtitle')}
                        </p>
                    </motion.div>
                </div>

                {/* Benefits Section */}
                <div className="mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <motion.div
                            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all"
                            whileHover={{ y: -5 }}
                        >
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2 dark:text-white">{t('premium_page.benefits.guarantee_title')}</h3>
                            <p className="text-gray-500 dark:text-gray-400">{t('premium_page.benefits.guarantee_desc')}</p>
                        </motion.div>
                        <motion.div
                            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all"
                            whileHover={{ y: -5 }}
                        >
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Star className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2 dark:text-white">{t('premium_page.benefits.content_title')}</h3>
                            <p className="text-gray-500 dark:text-gray-400">{t('premium_page.benefits.content_desc')}</p>
                        </motion.div>
                        <motion.div
                            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all"
                            whileHover={{ y: -5 }}
                        >
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2 dark:text-white">{t('premium_page.benefits.no_ads_title')}</h3>
                            <p className="text-gray-500 dark:text-gray-400">{t('premium_page.benefits.no_ads_desc')}</p>
                        </motion.div>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {PRICING_PLANS.map((plan, index) => {
                        const isSelected = selectedPlan.id === plan.id;
                        const isPopular = plan.badge === 'pricing.quarterly.badge' || plan.badge === 'pricing.annual.badge';

                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative rounded-2xl ${isSelected ? 'ring-4 ring-primary ring-opacity-50 z-10 scale-105' : 'border border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 shadow-xl flex flex-col transition-all`}
                                onClick={() => setSelectedPlan(plan)}
                            >
                                {isPopular && (
                                    <div className="absolute top-0 right-0 -mr-1 -mt-1 w-32 h-32 overflow-hidden z-20">
                                        <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 rotate-45 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold py-1 w-full text-center shadow-md mt-8 mr-[-50px]">
                                            {t(plan.badge)}
                                        </div>
                                    </div>
                                )}

                                <div className="p-8 flex-1">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t(plan.title)}</h3>
                                    <p className="mt-4 flex items-baseline text-gray-900 dark:text-white">
                                        <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                                        <span className="ml-1 text-xl font-semibold">{plan.currency}</span>
                                        <span className="ml-1 text-gray-500 dark:text-gray-400">/ {t(plan.duration)}</span>
                                    </p>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t(plan.description)}</p>

                                    <ul className="mt-8 space-y-4">
                                        {plan.features.map((feature, featureIndex) => (
                                            <li key={featureIndex} className="flex items-start">
                                                <div className="flex-shrink-0">
                                                    <Check className="h-5 w-5 text-green-500" />
                                                </div>
                                                <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">{t(feature)}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-8 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl border-t border-gray-100 dark:border-gray-700">
                                    <Button
                                        onClick={() => setSelectedPlan(plan)}
                                        className={`w-full ${isSelected ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700' : ''}`}
                                        variant={isSelected ? 'default' : 'outline'}
                                    >
                                        {t('premium_page.select')}
                                    </Button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Payment Method Section */}
                <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all">
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('premium_page.order_summary')}</h2>

                        <div className="flex justify-between items-center py-4 border-b border-gray-100 dark:border-gray-700">
                            <div>
                                <h3 className="font-semibold text-lg dark:text-white">{t(selectedPlan.title)}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('premium_page.subscription_of')} {t(selectedPlan.duration)}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-xl dark:text-white">{selectedPlan.price} {selectedPlan.currency}</p>
                            </div>
                        </div>

                        <div className="py-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('premium_page.payment_method')}</h3>
                            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {PAYMENT_METHODS.map((method) => (
                                    <div key={method.id}>
                                        <RadioGroupItem value={method.id} id={method.id} className="peer sr-only" />
                                        <Label
                                            htmlFor={method.id}
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-gray-50 dark:bg-gray-700/50 p-4 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary dark:peer-data-[state=checked]:border-primary dark:text-gray-200 cursor-pointer transition-all"
                                        >
                                            {method.id === 'd17' ? (
                                                <Smartphone className="mb-3 h-6 w-6" />
                                            ) : (
                                                <CreditCard className="mb-3 h-6 w-6" />
                                            )}
                                            <span className="font-semibold">{t(method.name)}</span>
                                            <span className="text-xs text-center mt-1 text-muted-foreground dark:text-gray-400">{t(method.description)}</span>
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        <div className="mt-4">
                            <div className="flex items-start p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-6">
                                <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    {t('premium_page.payment_info')}
                                </p>
                            </div>

                            <Button
                                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
                                onClick={handlePayment}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>{t('premium_page.processing')}</>
                                ) : (
                                    <>{t('premium_page.pay_button')} {selectedPlan.price} {selectedPlan.currency}</>
                                )}
                            </Button>
                            <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                                <Shield className="w-3 h-3" /> {t('premium_page.secure_payment')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
