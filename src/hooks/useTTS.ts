import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTTSProps {
    language?: string; // Default 'ar-TN' for Tunisian Arabic
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
    const [isSupported, setIsSupported] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [activevoice, setActiveVoice] = useState<SpeechSynthesisVoice | null>(null);

    // Audio player for API-based TTS (Professional)
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Check browser support for fallback
    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            setIsSupported(true);
            const loadVoices = () => {
                const availableVoices = window.speechSynthesis.getVoices();
                setVoices(availableVoices);
            };
            loadVoices();
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = loadVoices;
            }
        }
    }, []);

    const playAudioBlob = (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.volume = volume;

        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => {
            setIsSpeaking(false);
            URL.revokeObjectURL(url); // Cleanup
        };
        audio.onerror = (e) => {
            console.error("TTS Audio Error:", e);
            setIsSpeaking(false);
            // Fallback to local if audio fails?
        };
        audio.play().catch(console.error);
    };

    const speak = useCallback(async (text: string) => {
        if (!text) return;

        // Stop previous
        if (typeof window !== 'undefined') window.speechSynthesis.cancel();
        if (audioRef.current) audioRef.current.pause();
        setIsSpeaking(false);

        // STRATEGY 1: Professional API (Backend)
        // We try to call our /api/tts/speak endpoint
        try {
            console.log("TTS: Attempting Professional API call...");
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            // Adjusted url construction to handle potential slash issues
            const baseUrl = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;
            const endpoint = `${baseUrl.replace(/\/api\/api$/, '/api')}/tts/speak`; // Safety check

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, voiceId: '21m00Tcm4TlvDq8ikWAM' }) // 'Rachel' default, replace with Arabic ID
            });

            if (response.ok) {
                const blob = await response.blob();
                console.log("TTS: Using Professional API Audio");
                playAudioBlob(blob);
                return; // Success!
            } else {
                console.warn("TTS: API Unavailable, switching to fallback.");
            }
        } catch (err) {
            console.warn("TTS: API Connection failed, switching to fallback.", err);
        }

        // STRATEGY 2: Fallback to Web Speech / Online Google
        console.log("TTS: Using Fallback Strategy");

        // Try Google Translate hack for Arabic
        try {
            const encodedText = encodeURIComponent(text);
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ar&q=${encodedText}`;
            const audio = new Audio(url);
            audioRef.current = audio;
            audio.volume = volume;
            audio.onplay = () => setIsSpeaking(true);
            audio.onended = () => setIsSpeaking(false);
            audio.play().catch(e => {
                console.error("TTS Online Google Fallback failed:", e);
                // Final resort: Native
                if (isSupported) {
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = 'ar';
                    window.speechSynthesis.speak(utterance);
                }
            });
        } catch (e) {
            console.error(e);
        }

    }, [volume, isSupported]);

    const cancel = useCallback(() => {
        if (typeof window !== 'undefined') window.speechSynthesis.cancel();
        if (audioRef.current) audioRef.current.pause();
        setIsSpeaking(false);
    }, []);

    return {
        isSupported: true, // Always true because of fallbacks
        isSpeaking,
        speak,
        cancel,
        pause: cancel, // Simple pause=cancel for now
        resume: () => { },
    };
}
