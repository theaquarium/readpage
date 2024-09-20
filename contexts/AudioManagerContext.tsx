import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import * as FileSystem from 'expo-file-system';

const MAXIMUM_FILES = 10;

export interface AudioManagerContextType {
    files: string[];
    saveAudios: (audios: string[]) => Promise<string[]>;
}

const AudioManagerContext = createContext<AudioManagerContextType>({
    files: [],
    saveAudios: async () => [],
});

export function AudioManagerProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [files, setFiles] = useState<string[]>([]);

    // EMPTY CACHE DIRECTORY
    useEffect(() => {
        const clearCache = async () => {
            console.log('clearing cache...');
            const cacheDir = FileSystem.cacheDirectory;
            if (!cacheDir) return;
            const files = await FileSystem.readDirectoryAsync(cacheDir);
            files.forEach((filename) => {
                if (filename.startsWith('speech-')) {
                    console.log('deleting', filename);

                    FileSystem.deleteAsync(cacheDir + filename);
                }
            });
        };

        clearCache();
    }, []);

    const saveAudios = async (audios: string[]) => {
        console.log(files);

        return await Promise.all(
            audios.map(async (audio) => {
                const path =
                    FileSystem.cacheDirectory + `speech-${uuidv4()}.mp3`;

                await FileSystem.writeAsStringAsync(path, audio, {
                    encoding: 'base64',
                });

                if (files.length >= MAXIMUM_FILES) {
                    FileSystem.deleteAsync(files[0]);
                    setFiles((oldFiles) => {
                        const added = oldFiles.concat([path]);
                        added.splice(0, 1);
                        return added;
                    });
                } else {
                    setFiles((oldFiles) => {
                        return oldFiles.concat([path]);
                    });
                }

                return path;
            }),
        );
    };

    const audioManagerProp: AudioManagerContextType = useMemo(
        () => ({
            files,
            saveAudios,
        }),
        [files],
    );

    return (
        <AudioManagerContext.Provider value={audioManagerProp}>
            {children}
        </AudioManagerContext.Provider>
    );
}

export function useAudioManager() {
    return useContext(AudioManagerContext);
}
