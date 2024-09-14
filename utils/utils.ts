export function splitMaxLength(text: string, length: number): string[] {
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
