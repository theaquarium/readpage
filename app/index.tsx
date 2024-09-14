import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useOpenAI } from '@/contexts/OpenAIContext';
import TrackPlayer, { Capability } from 'react-native-track-player';
import { useAudioManager } from '@/contexts/AudioManagerContext';

export default function Index() {
    const [permission, requestPermission] = useCameraPermissions();
    const [loading, setLoading] = useState(false);
    const [playing, setPlaying] = useState(true);
    const [photo, setPhoto] = useState<string | undefined>(undefined);
    const cameraRef = useRef<CameraView>(null);
    const { transcribePage, generateTTS } = useOpenAI();
    const { saveAudios } = useAudioManager();

    const setupPlayer = async () => {
        try {
            await TrackPlayer.setupPlayer();
            await TrackPlayer.updateOptions({
                capabilities: [
                    Capability.Play,
                    Capability.Pause,
                    Capability.SkipToNext,
                    Capability.SkipToPrevious,
                ],
            });
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        setupPlayer();
    }, []);

    useEffect(() => {
        if (!photo) return;

        const getText = async (photo: string | undefined) => {
            if (!photo) return '';

            const result = await transcribePage(photo);
            console.log('transcribed', result);
            const audios = await generateTTS(result);
            console.log('generated', audios.length);
            const files = await saveAudios(audios);
            console.log('saved', files);

            TrackPlayer.add(
                files.map((file) => ({
                    url: file,
                })),
            );
            console.log('added');
            TrackPlayer.play();

            console.log('playing');

            setLoading(false);
            return result;
        };

        getText(photo).catch(console.error);
    }, [photo]);

    if (!permission) {
        // Camera permissions are still loading.
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.container}>
                <Text style={styles.message}>
                    We need your permission to show the camera
                </Text>
                <Pressable
                    onPress={requestPermission}
                    style={styles.permissionButton}
                >
                    <Text style={styles.permissionText}>Grant Permission</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <CameraView style={styles.camera} facing="back" ref={cameraRef}>
                <Link href="/settings" asChild>
                    <Pressable
                        onPress={requestPermission}
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 54,
                            height: 54,
                            borderRadius: 15,
                            elevation: 3,
                            backgroundColor: '#0004',
                            position: 'absolute',
                            top: 10,
                            right: 10,
                        }}
                    >
                        <MaterialIcons
                            name="settings"
                            size={36}
                            color="#fffa"
                        />
                    </Pressable>
                </Link>
            </CameraView>
            <Pressable
                onPress={async () => {
                    Haptics.impactAsync();

                    setLoading(true);
                    const photo = await cameraRef.current?.takePictureAsync({
                        base64: true,
                    });
                    setPhoto(photo?.base64);
                }}
                style={styles.cameraButton}
            >
                {!loading ? (
                    <MaterialCommunityIcons
                        name="camera"
                        size={72}
                        color="#222"
                    />
                ) : (
                    <ActivityIndicator size="large" color="#222" />
                )}
            </Pressable>
            <View style={styles.playbackControls}>
                <Pressable
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={styles.playbackButton}
                >
                    <MaterialIcons name="replay-10" size={48} color="white" />
                </Pressable>
                <Pressable
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setPlaying(!playing);
                    }}
                    style={styles.playbackButton}
                >
                    {playing ? (
                        <MaterialCommunityIcons
                            name="pause"
                            size={72}
                            color="white"
                        />
                    ) : (
                        <MaterialCommunityIcons
                            name="play"
                            size={72}
                            color="white"
                        />
                    )}
                </Pressable>
                <Pressable
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={styles.playbackButton}
                >
                    <MaterialIcons name="forward-10" size={48} color="white" />
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        gap: 20,
        backgroundColor: '#000',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 3.5,
        borderRadius: 15,
        overflow: 'hidden',
    },
    permissionButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 15,
        elevation: 3,
        backgroundColor: '#ffffff',
    },
    permissionText: {
        fontSize: 25,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: '#000000',
    },
    playbackButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        color: '#000',
    },
    cameraButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ccc',
        borderRadius: 15,
        color: '#000',
    },
    playbackControls: {
        flex: 1,
        flexDirection: 'row',
    },
});