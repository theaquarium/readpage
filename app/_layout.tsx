import { AudioManagerProvider } from '@/contexts/AudioManagerContext';
import {
    LocalizationProvider,
    LocalizationContext,
} from '@/contexts/LocalizationContext';
import { OpenAIProvider } from '@/contexts/OpenAIContext';
import { Stack } from 'expo-router';

export default function RootLayout() {
    return (
        <OpenAIProvider>
            <AudioManagerProvider>
                <LocalizationProvider>
                    <LocalizationContext.Consumer>
                        {({ i18n }) => {
                            return (
                                <Stack>
                                    <Stack.Screen
                                        name="index"
                                        options={{
                                            headerShown: false,
                                        }}
                                    />
                                    <Stack.Screen
                                        name="settings"
                                        options={{
                                            title: i18n.t('settingsTitle'),
                                            headerStyle: {
                                                backgroundColor: '#000',
                                            },
                                            headerTintColor: '#fff',
                                            headerTitleStyle: {
                                                fontWeight: 'bold',
                                            },
                                            headerBackTitle: i18n.t('back'),
                                        }}
                                    />
                                </Stack>
                            );
                        }}
                    </LocalizationContext.Consumer>
                </LocalizationProvider>
            </AudioManagerProvider>
        </OpenAIProvider>
    );
}
