import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

export interface LocalizationContextType {
    languageCode: string;
    i18n: I18n;
}

const i18n = new I18n({
    en: {
        readingFile: 'reading-en.mp3',
        permission: 'Grant Permission',
        needPermission: 'We need your permission to show the camera.',
        settingsTitle: 'Settings',
        back: 'Back',
        apiKeyTitle: 'OpenAI API Key',
        voiceTitle: 'Voice',
        save: 'Save',
    },
    ru: {
        readingFile: 'reading-ru.mp3',
        permission: 'Дайте Разрешение',
        needPermission: 'Нам нужно ваше разрешение, чтобы показать камеру.',
        settingsTitle: 'Настройки',
        back: 'Вернуться',
        apiKeyTitle: 'Ключ API OpenAI',
        voiceTitle: 'Голос',
        save: 'Сохранить',
    },
});
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export const LocalizationContext = createContext<LocalizationContextType>({
    languageCode: 'en',
    i18n,
});

export function LocalizationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const languageCode = useLocales()[0].languageCode ?? 'en';

    console.log(useLocales());

    i18n.locale = languageCode;

    const localizationProp: LocalizationContextType = useMemo(
        () => ({
            languageCode,
            i18n,
        }),
        [],
    );

    return (
        <LocalizationContext.Provider value={localizationProp}>
            {children}
        </LocalizationContext.Provider>
    );
}

export function useLocalization() {
    return useContext(LocalizationContext);
}
