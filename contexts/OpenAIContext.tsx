import { Buffer } from 'buffer';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import OpenAI from 'openai';
import { splitMaxLength } from '@/utils/utils';
import * as FileSystem from 'expo-file-system';

// const STOPWORD = '[Stop]';

export interface OpenAIContextType {
    value: OpenAI | null;
    setAPIKey: (key: string) => void;
    transcribePage: (photo: string) => Promise<string>;
    generateTTS: (text: string) => Promise<string[]>;
}

const OpenAIContext = createContext<OpenAIContextType>({
    value: null,
    setAPIKey: () => {},
    transcribePage: async () => '',
    generateTTS: async () => [],
});

export function OpenAIProvider({ children }: { children: React.ReactNode }) {
    const [openai, setOpenAI] = useState<OpenAI | null>(null);

    const setAPIKey = (key: string) => {
        setOpenAI(
            new OpenAI({
                apiKey: key,
            }),
        );
    };

    const transcribePage = async (photo: string): Promise<string> => {
        if (!openai) return 'No OpenAI context exists';

        const messages: OpenAI.ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content: [
                    {
                        type: 'text',
                        text: `You are a helpful system with the purpose of transcribing all the text on the page.`,
                    },
                ],
            },
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: `Transcribe all the text on the page. Ignore page numbers and book and chapter titles. Output no other text.`,
                    },
                    {
                        type: 'image_url',
                        image_url: {
                            url: `data:image/jpeg;base64,${photo}`,
                        },
                    },
                ],
            },
        ];
        // let shouldContinue = true;
        // let firstQuery = true;
        // let result = '';

        // while (shouldContinue) {
        //     firstQuery = false;

        //     const completion = await openai.chat.completions.create({
        //         model: 'gpt-4o-mini',
        //         max_tokens: 4096,
        //         messages,
        //     });

        //     const outputMessage = completion.choices[0].message;

        //     if (outputMessage.content === null) break;

        //     messages.push(outputMessage);

        //     if (firstQuery || outputMessage.content.length > 10) {
        //         result += outputMessage.content;
        //         messages.push({
        //             role: 'user',
        //             content: [
        //                 {
        //                     type: 'text',
        //                     text: `Continue if there is text remaining on the page. Otherwise, output the string "${STOPWORD}".`,
        //                 },
        //             ],
        //         });

        //         if (outputMessage.content.endsWith(STOPWORD)) {
        //             shouldContinue = false;
        //         }
        //     } else {
        //         shouldContinue = false;
        //     }
        // }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            max_tokens: 4096,
            messages,
        });

        return completion.choices[0].message.content ?? '';
    };

    const generateTTS = async (text: string) => {
        if (!openai) return [];

        const parts = splitMaxLength(text, 4000);

        const result: string[] = await Promise.all(
            parts.map(async (part, index) => {
                const response = await openai.audio.speech.create({
                    model: 'tts-1',
                    voice: 'onyx',
                    input: part,
                });

                const path =
                    FileSystem.documentDirectory + `speech${index}.mp3`;

                const buffer = Buffer.from(await response.arrayBuffer());

                return 'data:audio/mpeg;base64,' + buffer.toString('base64');
            }),
        );

        return result;
    };

    useEffect(() => {
        setAPIKey('');
    }, []);

    const openAIProp: OpenAIContextType = useMemo(
        () => ({
            value: openai,
            setAPIKey,
            transcribePage,
            generateTTS,
        }),
        [openai],
    );

    return (
        <OpenAIContext.Provider value={openAIProp}>
            {children}
        </OpenAIContext.Provider>
    );
}

export function useOpenAI() {
    return useContext(OpenAIContext);
}
