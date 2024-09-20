const IS_DEV =
    process.env.APP_VARIANT === 'development' ||
    process.env.APP_VARIANT === 'preview';

const appVersion = '2.0.0';
const androidVersion = 2;

export default {
    expo: {
        name: IS_DEV ? 'ReadPage (Dev)' : 'ReadPage',
        slug: 'readpage',
        version: appVersion,
        orientation: 'portrait',
        icon: './assets/images/icon.png',
        scheme: 'readpage',
        userInterfaceStyle: 'dark',
        splash: {
            image: './assets/images/splash.png',
            resizeMode: 'contain',
            backgroundColor: '#0a4e3a',
        },
        ios: {
            supportsTablet: true,
            bundleIdentifier: IS_DEV
                ? 'com.leahvashevko.readpage-dev'
                : 'com.leahvashevko.readpage',
            config: {
                usesNonExemptEncryption: false,
            },
            infoPlist: {
                CFBundleAllowMixedLocalizations: true,
            },
            buildNumber: appVersion,
        },
        android: {
            package: IS_DEV
                ? 'com.leahvashevko.readpage-dev'
                : 'com.leahvashevko.readpage',
            adaptiveIcon: {
                foregroundImage: './assets/images/adaptive-icon.png',
                backgroundColor: '#0a4e3a',
            },
            permissions: [
                'android.permission.CAMERA',
                'android.permission.RECORD_AUDIO',
            ],
            versionCode: androidVersion,
        },
        plugins: [
            'expo-router',
            [
                'expo-camera',
                {
                    cameraPermission:
                        'Allow $(PRODUCT_NAME) to access your camera.',
                    microphonePermission:
                        'Allow $(PRODUCT_NAME) to access your microphone.',
                    recordAudioAndroid: true,
                },
            ],
            [
                'expo-secure-store',
                {
                    faceIDPermission:
                        'Allow $(PRODUCT_NAME) to access your Face ID biometric data.',
                },
            ],
            'expo-localization',
            './withAndroidLocalizedName',
        ],
        experiments: {
            typedRoutes: true,
        },
        extra: {
            router: {
                origin: false,
            },
            eas: {
                projectId: '616f17cb-d42b-45ee-8bb0-095e31cfebfe',
            },
        },
        locales: {
            ru: './locales/ru.json',
        },
    },
};
