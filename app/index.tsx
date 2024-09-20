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
import TrackPlayer, {
    Capability,
    useIsPlaying,
    useProgress,
} from 'react-native-track-player';
import { useAudioManager } from '@/contexts/AudioManagerContext';
import { Audio } from 'expo-av';
import { useLocalization } from '@/contexts/LocalizationContext';

export default function Index() {
    const [permission, requestPermission] = useCameraPermissions();
    const [loading, setLoading] = useState(false);
    const [photo, setPhoto] = useState<string | undefined>(undefined);
    const cameraRef = useRef<CameraView>(null);
    const { transcribePage, generateTTS } = useOpenAI();
    const { saveAudios } = useAudioManager();
    const { i18n, languageCode } = useLocalization();

    const isPlaying = useIsPlaying();

    const playerProgress = useProgress(500);
    const trackProgressPercent = Math.floor(
        100 * (playerProgress.position / playerProgress.duration),
    );

    const [trackIndex, setTrackIndex] = useState(0);
    const [trackCount, setTrackCount] = useState(0);

    useEffect(() => {
        (async () => {
            const index = (await TrackPlayer.getActiveTrackIndex()) ?? 0;
            const length = (await TrackPlayer.getQueue()).length;

            if (trackIndex !== index) setTrackIndex(index);

            if (trackCount !== length) setTrackCount(length);
        })();
    });

    const setupPlayer = async () => {
        try {
            await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

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

    async function playReadingAudio() {
        console.log(languageCode);

        const readingFiles: Record<string, any> = {
            en: require(`@/assets/audios/reading-en.mp3`),
            ru: require(`@/assets/audios/reading-ru.mp3`),
        };

        const { sound } = await Audio.Sound.createAsync(
            readingFiles[languageCode],
        );

        await sound.playAsync();
    }

    useEffect(() => {
        setupPlayer();
    }, []);

    useEffect(() => {
        if (!photo) return;

        const getText = async (photo: string | undefined) => {
            if (!photo) return '';

            const result = await transcribePage(photo);
            console.log('transcribed', result);

            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setTimeout(() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setTimeout(() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }, 200);
            }, 200);

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
            const queue = await TrackPlayer.getQueue();

            TrackPlayer.skip(queue.length - files.length);

            TrackPlayer.play();

            if (queue.length > 10) {
            }

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
                <Text style={styles.message}>{i18n.t('needPermission')}</Text>
                <Pressable
                    onPress={requestPermission}
                    style={styles.permissionButton}
                >
                    <Text style={styles.permissionText}>
                        {i18n.t('permission')}
                    </Text>
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
                    playReadingAudio();

                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setTimeout(() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }, 100);

                    setLoading(true);
                    const photo = await cameraRef.current?.takePictureAsync({
                        base64: true,
                    });
                    setPhoto(photo?.base64);
                }}
                style={({ pressed }) => ({
                    ...styles.cameraButton,
                    opacity: pressed ? 0.8 : 1,
                })}
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
                    onPress={async () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

                        if (playerProgress.position - 10 < 0) {
                            const index =
                                (await TrackPlayer.getActiveTrackIndex()) ?? 0;
                            if (index === 0) {
                                TrackPlayer.seekTo(0);
                                return;
                            }

                            // go 10s back in last track
                            TrackPlayer.skipToPrevious();
                        } else {
                            TrackPlayer.seekBy(-10);
                        }
                    }}
                    style={({ pressed }) => ({
                        ...styles.playbackButton,
                        opacity: pressed ? 0.8 : 1,
                    })}
                >
                    <MaterialIcons name="replay-10" size={48} color="white" />
                </Pressable>
                <Pressable
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        if (isPlaying.bufferingDuringPlay) {
                            return;
                        }

                        if (isPlaying.playing) {
                            TrackPlayer.pause();
                        } else {
                            TrackPlayer.play();
                        }
                    }}
                    style={({ pressed }) => ({
                        ...styles.playbackButton,
                        opacity: pressed ? 0.8 : 1,
                    })}
                >
                    {isPlaying.bufferingDuringPlay || isPlaying.playing ? (
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

                        if (
                            playerProgress.position + 10 >
                            playerProgress.duration
                        ) {
                            TrackPlayer.skipToNext();
                        } else {
                            TrackPlayer.seekBy(10);
                        }
                    }}
                    style={({ pressed }) => ({
                        ...styles.playbackButton,
                        opacity: pressed ? 0.8 : 1,
                    })}
                >
                    <MaterialIcons name="forward-10" size={48} color="white" />
                </Pressable>
            </View>
            <View style={styles.progress}>
                <View style={styles.progressBar}>
                    <View
                        style={{
                            ...styles.progressBarInner,
                            width: `${trackProgressPercent}%`,
                        }}
                    ></View>
                </View>
                <Text style={styles.progressText}>
                    {trackIndex + 1}/{trackCount}
                </Text>
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
        color: '#fff',
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
        flex: 0.6,
        flexDirection: 'row',
    },
    progress: {
        flex: 0,
        alignSelf: 'stretch',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    progressBar: {
        borderRadius: 10,
        height: 8,
        flex: 1,
        backgroundColor: '#444',
        overflow: 'hidden',
    },
    progressBarInner: {
        borderRadius: 10,
        height: 8,
        backgroundColor: '#aaa',
    },
    progressText: {
        color: '#fff',
    },
});
