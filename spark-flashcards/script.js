export async function loadTextData(paths, filterWords) {
    let allWords = [];
    let wordSet = new Set();

    const normalizeWord = (word) => {
        return word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
    };

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };

    for (const path of paths) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
            }
            const scriptText = await response.text();

            // Dynamically evaluate the script text to get the textData object
            let textData;
            eval(scriptText.replace('export const textData', 'textData'));

            const words = textData.words
                .filter(wordObj => {
                    const normalizedWord = normalizeWord(wordObj.word);
                    return !filterWords.includes(normalizedWord) && !wordSet.has(normalizedWord);
                })
                .map(wordObj => {
                    const normalizedWord = normalizeWord(wordObj.word);
                    wordSet.add(normalizedWord);
                    return {
                        word: wordObj.word,
                        translation: wordObj.translation,
                        note: wordObj.note || null // Include the note field if present
                    };
                });
            allWords = allWords.concat(words);
        } catch (error) {
            console.error(`Error processing ${path}:`, error);
        }
    }

    // Shuffle the words array before returning it
    shuffleArray(allWords);

    return allWords;
}
