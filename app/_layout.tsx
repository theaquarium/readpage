import { AudioManagerProvider } from '@/contexts/AudioManagerContext';
import { OpenAIProvider } from '@/contexts/OpenAIContext';
import { Stack } from 'expo-router';

export default function RootLayout() {
    return (
        <OpenAIProvider>
            <AudioManagerProvider>
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
                            title: 'Settings',
                            headerStyle: {
                                backgroundColor: '#000',
                            },
                            headerTintColor: '#fff',
                            headerTitleStyle: {
                                fontWeight: 'bold',
                            },
                            headerBackTitle: 'Back',
                        }}
                    />
                </Stack>
            </AudioManagerProvider>
        </OpenAIProvider>
    );
}
