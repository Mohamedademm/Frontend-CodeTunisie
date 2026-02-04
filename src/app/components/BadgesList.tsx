import { Badge } from '@/app/types';
import { availableBadges } from '@/app/data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { motion } from 'motion/react';
import { Award, Lock, Trophy, Flame, Crown, Timer, ShieldCheck, Compass, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip';

interface BadgesListProps {
    earnedBadges: Badge[];
}

const iconMap: Record<string, any> = {
    'award': Award,
    'trophy': Trophy,
    'flame': Flame,
    'crown': Crown,
    'timer': Timer,
    'shield-check': ShieldCheck,
    'compass': Compass,
    'users': Users,
    'traffic-cone': Award // Fallback icon
};

export function BadgesList({ earnedBadges }: BadgesListProps) {
    const earnedIds = new Set(earnedBadges.map(b => b.id));

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {availableBadges.map((badge, index) => {
                const isEarned = earnedIds.has(badge.id);
                const earnedDetails = earnedBadges.find(b => b.id === badge.id);
                const Icon = iconMap[badge.icon] || Award;

                return (
                    <TooltipProvider key={badge.id}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={cn(
                                        "relative p-4 rounded-xl border transition-all duration-300 group cursor-default",
                                        isEarned
                                            ? "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border-yellow-200 dark:border-yellow-900/30 hover:shadow-md hover:border-yellow-300"
                                            : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60 grayscale hover:opacity-80 hover:grayscale-0"
                                    )}
                                >
                                    <div className="flex flex-col items-center text-center gap-3">
                                        <div className={cn(
                                            "p-3 rounded-full transition-all duration-300",
                                            isEarned
                                                ? "bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg text-white"
                                                : "bg-gray-200 dark:bg-gray-700 text-gray-400 group-hover:bg-gray-300 dark:group-hover:bg-gray-600"
                                        )}>
                                            {isEarned ? <Icon className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                                        </div>

                                        <div>
                                            <h4 className={cn(
                                                "font-semibold text-sm mb-1",
                                                isEarned ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                                            )}>
                                                {badge.name}
                                            </h4>
                                            {isEarned && (
                                                <p className="text-[10px] text-orange-600 dark:text-orange-400 font-medium">
                                                    Obtenu le {new Date(earnedDetails!.earnedDate!).toLocaleDateString('fr-FR')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[200px] text-center">
                                <p className="font-semibold mb-1">{badge.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{badge.description}</p>
                                {!isEarned && (
                                    <p className="text-xs text-blue-500 mt-2 font-medium">Verrouillé</p>
                                )}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            })}
        </div>
    );
}
