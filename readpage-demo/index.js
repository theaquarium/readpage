import OpenAI from 'openai';
import path from 'path';
import fs from 'fs/promises';

// const STOPWORD = '[Stop]';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

function splitMaxLength(text, length) {
    const result = [];
    let nextPart = '';
    const split = text.split(' ');

    split.forEach((word) => {
        if (nextPart.length + word.length > length && word.length <= length) {
            result.push(nextPart.substring(0, nextPart.length - 1));
            nextPart = '';
        }
        nextPart += word + ' ';
    });

    result.push(nextPart.substring(0, nextPart.length - 1));
    return result;
}

const messages = [
    {
        role: 'user',
        content: [
            {
                type: 'text',
                text: 'Transcribe all the text on the page. Ignore page numbers and book and chapter titles. Output no other text.',
            },

            {
                type: 'image_url',
                image_url: {
                    url: `data:image/jpeg;base64,${await fs.readFile(
                        'hpbook2.jpg',
                        { encoding: 'base64' },
                    )}`,
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

//     console.log(completion);

//     const outputMessage = completion.choices[0].message;

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
//     } else {
//         shouldContinue = false;
//     }
// }

// result.replace(STOPWORD, '');

const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 4096,
    messages,
});

const result = completion.choices[0].message.content;

console.log(result);

const parts = splitMaxLength(result, 4000);

parts.forEach(async (part, index) => {
    const speechFile = path.resolve(`./results/speech${index}.mp3`);

    const response = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'onyx',
        input: part,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(speechFile, buffer);
});
