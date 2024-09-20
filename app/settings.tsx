import { OpenAIVoice, useOpenAI } from '@/contexts/OpenAIContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { PickerIOS } from '@react-native-picker/picker';
import { useLocalization } from '@/contexts/LocalizationContext';

export default function Settings() {
    const router = useRouter();
    const {
        setAPIKey: storeAPIKey,
        value: openai,
        voice: storedVoice,
        changeVoice,
    } = useOpenAI();
    const [apiKey, setAPIKey] = useState(openai?.apiKey);
    const [voice, setVoice] = useState(storedVoice);
    const { i18n } = useLocalization();

    return (
        <View style={styles.container}>
            <View style={styles.formField}>
                <Text style={styles.formLabel}>{i18n.t('apiKeyTitle')}</Text>
                <TextInput
                    style={styles.formInput}
                    placeholder="sk-svcacct-..."
                    onChangeText={(newKey) => setAPIKey(newKey)}
                    defaultValue={apiKey}
                ></TextInput>
            </View>

            <View style={styles.formField}>
                <Text style={styles.formLabel}>{i18n.t('voiceTitle')}</Text>
                <PickerIOS
                    style={styles.formInput}
                    selectedValue={voice}
                    onValueChange={(itemValue) =>
                        setVoice(itemValue as OpenAIVoice)
                    }
                    itemStyle={{
                        color: '#fff',
                    }}
                >
                    <PickerIOS.Item label="Alloy" value="alloy" />
                    <PickerIOS.Item label="Echo" value="echo" />
                    <PickerIOS.Item label="Fable" value="fable" />
                    <PickerIOS.Item label="Onyx" value="onyx" />
                    <PickerIOS.Item label="Nova" value="nova" />
                    <PickerIOS.Item label="Shimmer" value="shimmer" />
                </PickerIOS>
            </View>

            <Pressable
                onPress={async () => {
                    storeAPIKey(apiKey ?? '');
                    changeVoice(voice);
                    router.back();
                }}
                style={({ pressed }) => ({
                    ...styles.saveButton,
                    opacity: pressed ? 0.8 : 1,
                })}
            >
                <Text style={styles.saveButtonText}>{i18n.t('save')}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        verticalAlign: 'top',
        padding: 20,
        gap: 20,
        backgroundColor: '#000',
    },
    formField: {
        gap: 10,
    },
    formLabel: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
        paddingLeft: 21,
    },
    formInput: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 15,
        verticalAlign: 'top',
        borderWidth: 1,
        borderColor: '#333',
        color: '#fff',
        fontSize: 20,
    },
    saveButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 15,
        backgroundColor: '#ffffff',
    },
    saveButtonText: {
        fontSize: 20,
    },
});
