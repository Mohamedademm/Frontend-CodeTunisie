import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'fr',
        supportedLngs: ['fr', 'ar'], // French and Arabic

        // Translation resources are loaded via Backend from /public/locales/{{lng}}/{{ns}}.json
        // But for simplicity during development, we can also preload them or embed if needed.
        // Here we'll rely on the public folder structure which is standard.

        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },

        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },

        backend: {
            loadPath: '/locales/{{lng}}/translation.json',
        },
    });

i18n.on('languageChanged', (lng) => {
    document.documentElement.dir = i18n.dir(lng);
    document.documentElement.lang = lng;
});

export default i18n;
