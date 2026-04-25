import { initReactI18next } from "react-i18next";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./en.json";
import ua from "./ua.json";
import de from "./de.json";

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            ua: { translation: ua },
            de: { translation: de },
        },
        fallbackLng: "ua",
        supportedLngs: ["en", "ua", "de"],

        detection: {
            order: ["cookie", "localStorage", "navigator"],
            caches: ["cookie", "localStorage"],
            cookieMinutes: 60 * 24 * 30,
            cookieOptions: {
                path: "/",
                sameSite: "strict",
            },
        },

        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;