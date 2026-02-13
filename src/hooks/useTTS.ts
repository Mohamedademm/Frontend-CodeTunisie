import { useState, useCallback, useRef } from 'react';

interface UseTTSProps {
    language?: string; // e.g. 'ar-TN'
    rate?: number;     // Speed
    pitch?: number;    // Pitch
    volume?: number;   // Volume
}

export function useTTS({
    language = 'ar-TN',
    rate = 1,
    pitch = 1,
    volume = 1
}: UseTTSProps = {}) {
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Audio player for API-based TTS (Professional) & Google Fallback
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const playAudioBlob = (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.volume = volume;
        // HTML5 Audio doesn't support pitch/rate natively in the same way, 
        // but playbackRate exists
        audio.playbackRate = rate;

        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => {
            setIsSpeaking(false);
            URL.revokeObjectURL(url); // Cleanup
        };
        audio.onerror = (e) => {
            console.error("TTS Audio Error:", e);
            setIsSpeaking(false);
        };
        audio.play().catch(console.error);
    };

    const speak = useCallback(async (text: string) => {
        if (!text) return;

        // Stop previous
        if (typeof window !== 'undefined') window.speechSynthesis.cancel();
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setIsSpeaking(false);

        // STRATEGY 1: Professional API (Backend)
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const baseUrl = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;
            const endpoint = `${baseUrl.replace(/\/api\/api$/, '/api')}/tts/speak`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, voiceId: '21m00Tcm4TlvDq8ikWAM' }) // 'Rachel' default
            });

            if (response.ok) {
                const blob = await response.blob();
                playAudioBlob(blob);
                return; // Success!
            }
        } catch (err) {
            console.warn("TTS: API Connection failed, switching to fallback.");
        }

        // STRATEGY 2: Fallback to Web Speech / Online Google
        console.log("TTS: Using Fallback Strategy");

        try {
            // Google Translate TTS Fallback
            // Note: Google Translate TTS ignores rate/pitch params in the URL typically
            const encodedText = encodeURIComponent(text);
            // Use props language if valid, else default to 'ar'
            const targetLang = language.startsWith('ar') ? 'ar' : language;
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${targetLang}&q=${encodedText}`;

            const audio = new Audio(url);
            audioRef.current = audio;
            audio.volume = volume;
            audio.playbackRate = rate; // Try to apply rate here

            audio.onplay = () => setIsSpeaking(true);
            audio.onended = () => setIsSpeaking(false);
            audio.play().catch(e => {
                console.error("TTS Online Google Fallback failed:", e);
                // Final resort: Native SpeechSynthesis
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = language; // Use the prop
                    utterance.rate = rate;     // Use the prop
                    utterance.pitch = pitch;   // Use the prop
                    utterance.volume = volume; // Use the prop
                    window.speechSynthesis.speak(utterance);
                }
            });
        } catch (e) {
            console.error(e);
        }

    }, [volume, rate, pitch, language]);

    const cancel = useCallback(() => {
        if (typeof window !== 'undefined') window.speechSynthesis.cancel();
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setIsSpeaking(false);
    }, []);

    // Pause/Resume logic simplified for Audio/Speech mix
    const pause = useCallback(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
        }
        if (audioRef.current) audioRef.current.pause();
        setIsSpeaking(false);
    }, []);

    const resume = useCallback(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            setIsSpeaking(true);
        }
        if (audioRef.current && audioRef.current.paused) {
            audioRef.current.play();
            setIsSpeaking(true);
        }
    }, []);

    return {
        isSupported: true,
        isSpeaking,
        speak,
        cancel,
        pause,
        resume
    };
}
