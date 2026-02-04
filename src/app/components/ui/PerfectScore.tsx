import { motion } from 'motion/react';
import { Confetti } from './Confetti';

interface PerfectScoreProps {
    onContinue: () => void;
}

export function PerfectScore({ onContinue }: PerfectScoreProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <Confetti />
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border-4 border-yellow-400 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-yellow-400/10" />

                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                    className="w-32 h-32 mx-auto mb-6 relative"
                >
                    {/* Star Vector Animation */}
                    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-yellow-400 drop-shadow-lg">
                        <motion.path
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                            fill="currentColor"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                        />
                    </svg>
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1 }}
                    >
                        <span className="text-4xl font-bold text-white drop-shadow-md">100%</span>
                    </motion.div>
                </motion.div>

                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-500 mb-2"
                >
                    Parfait !
                </motion.h2>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-gray-600 dark:text-gray-300 mb-6"
                >
                    Vous avez maîtrisé ce test à la perfection. Continuez comme ça !
                </motion.p>

                <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    onClick={onContinue}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                >
                    Continuer
                </motion.button>
            </motion.div>
        </div>
    );
}
