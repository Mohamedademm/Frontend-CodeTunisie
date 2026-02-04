import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export function Confetti() {
    const [pieces, setPieces] = useState<Array<{ x: number; y: number; color: string; rotation: number; scale: number }>>([]);

    useEffect(() => {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        const newPieces = Array.from({ length: 50 }).map(() => ({
            x: Math.random() * 100, // percentage
            y: -10 - Math.random() * 20, // start above screen
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            scale: 0.5 + Math.random() * 0.5,
        }));
        setPieces(newPieces);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {pieces.map((piece, i) => (
                <motion.div
                    key={i}
                    initial={{ y: `${piece.y}vh`, x: `${piece.x}vw`, rotate: piece.rotation, opacity: 1 }}
                    animate={{
                        y: '120vh',
                        x: `${piece.x + (Math.random() - 0.5) * 10}vw`,
                        rotate: piece.rotation + 360 + Math.random() * 360
                    }}
                    transition={{
                        duration: 2.5 + Math.random() * 2,
                        ease: "linear",
                        repeat: Infinity,
                        delay: Math.random() * 2,
                        repeatDelay: Math.random() * 5
                    }}
                    style={{
                        position: 'absolute',
                        width: '10px',
                        height: '10px',
                        backgroundColor: piece.color,
                        borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                    }}
                />
            ))}
        </div>
    );
}
