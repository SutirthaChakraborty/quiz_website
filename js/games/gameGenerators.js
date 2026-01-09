/**
 * LexiQuest - Letter Games
 * Specific game implementations for letter learning
 */

const LetterGames = {
    /**
     * Create letter-sound matching pairs
     */
    createLetterSoundPairs(letterRange = [0, 26], count = 6) {
        const letters = GameData.letters.slice(letterRange[0], letterRange[1]);
        const selected = Helpers.shuffle(letters).slice(0, count);
        
        return selected.map(letter => ({
            id: letter.letter,
            item: letter.letter,
            display: letter.upper,
            emoji: letter.emoji,
            audio: letter.letter,
            target: letter.sound,
            targetDisplay: letter.sound,
            targetAudio: `${letter.letter} says ${letter.sound}`
        }));
    },

    /**
     * Create uppercase-lowercase matching pairs
     */
    createUpperLowerPairs(letterRange = [0, 26], count = 6) {
        const letters = GameData.letters.slice(letterRange[0], letterRange[1]);
        const selected = Helpers.shuffle(letters).slice(0, count);
        
        return selected.map(letter => ({
            id: letter.letter,
            item: letter.upper,
            display: letter.upper,
            audio: `uppercase ${letter.letter}`,
            target: letter.lower,
            targetDisplay: letter.lower,
            targetAudio: `lowercase ${letter.letter}`
        }));
    },

    /**
     * Create letter-picture matching pairs
     */
    createLetterPicturePairs(letterRange = [0, 26], count = 6) {
        const letters = GameData.letters.slice(letterRange[0], letterRange[1]);
        const selected = Helpers.shuffle(letters).slice(0, count);
        
        return selected.map(letter => ({
            id: letter.letter,
            item: letter.letter,
            display: letter.upper,
            audio: letter.letter,
            target: letter.emoji,
            targetEmoji: letter.emoji,
            targetDisplay: letter.word,
            targetAudio: `${letter.word} starts with ${letter.letter}`
        }));
    },

    /**
     * Create letter memory pairs
     */
    createLetterMemoryPairs(letterRange = [0, 26], count = 6) {
        const letters = GameData.letters.slice(letterRange[0], letterRange[1]);
        const selected = Helpers.shuffle(letters).slice(0, count);
        
        return selected.map(letter => ({
            id: letter.letter,
            display: letter.upper,
            emoji: letter.emoji,
            audio: letter.letter
        }));
    },

    /**
     * Get game configuration based on level
     */
    getGameConfig(level) {
        const config = {
            type: level.type,
            gameType: level.gameType
        };

        switch (level.gameType) {
            case 'letter-sound':
                config.pairs = this.createLetterSoundPairs(
                    level.letterRange,
                    level.itemCount
                );
                break;
            case 'upper-lower':
                config.pairs = this.createUpperLowerPairs(
                    level.letterRange,
                    level.itemCount
                );
                break;
            case 'letter-picture':
                config.pairs = this.createLetterPicturePairs(
                    level.letterRange,
                    level.itemCount
                );
                break;
            case 'letter-memory':
                config.pairs = this.createLetterMemoryPairs(
                    level.letterRange,
                    level.pairCount
                );
                break;
            default:
                config.pairs = this.createLetterSoundPairs(
                    level.letterRange || [0, 8],
                    level.itemCount || 4
                );
        }

        return config;
    }
};

/**
 * Color Games
 */
const ColorGames = {
    /**
     * Create color-name matching pairs
     */
    createColorNamePairs(colorRange = [0, 8], count = 4, useAdvanced = false) {
        const colorData = useAdvanced ? GameData.colors.advanced : GameData.colors.basic;
        const colors = colorData.slice(colorRange[0], colorRange[1]);
        const selected = Helpers.shuffle(colors).slice(0, count);
        
        return selected.map(color => ({
            id: color.name,
            item: color.name,
            color: color.hex,
            display: '',
            audio: color.name,
            target: color.name,
            targetDisplay: color.name,
            targetAudio: `This is ${color.name}`
        }));
    },

    /**
     * Create color-object matching pairs
     */
    createColorObjectPairs(colorRange = [0, 8], count = 4) {
        const colors = GameData.colors.basic.slice(colorRange[0], colorRange[1]);
        const selected = Helpers.shuffle(colors).slice(0, count);
        
        return selected.map(color => ({
            id: color.name,
            item: color.name,
            color: color.hex,
            audio: color.name,
            target: color.emoji,
            targetEmoji: color.emoji,
            targetDisplay: color.name,
            targetAudio: `${color.name} like a ${color.emoji}`
        }));
    },

    /**
     * Create color memory pairs
     */
    createColorMemoryPairs(colorRange = [0, 8], count = 6) {
        const colors = GameData.colors.basic.slice(colorRange[0], colorRange[1]);
        const selected = Helpers.shuffle(colors).slice(0, count);
        
        return selected.map(color => ({
            id: color.name,
            display: color.name,
            color: color.hex,
            audio: color.name
        }));
    },

    /**
     * Get game configuration based on level
     */
    getGameConfig(level) {
        const config = {
            type: level.type,
            gameType: level.gameType
        };

        switch (level.gameType) {
            case 'color-name':
                config.pairs = this.createColorNamePairs(
                    level.colorRange,
                    level.itemCount,
                    level.useAdvanced
                );
                break;
            case 'color-object':
                config.pairs = this.createColorObjectPairs(
                    level.colorRange,
                    level.itemCount
                );
                break;
            case 'color-memory':
                config.pairs = this.createColorMemoryPairs(
                    level.colorRange,
                    level.pairCount
                );
                break;
            default:
                config.pairs = this.createColorNamePairs(
                    level.colorRange || [0, 8],
                    level.itemCount || 4
                );
        }

        return config;
    }
};

/**
 * Word Games
 */
const WordGames = {
    /**
     * Create word-picture matching pairs
     */
    createWordPicturePairs(wordType = 'simple', wordRange = [0, 12], count = 4) {
        const wordData = GameData.words[wordType] || GameData.words.simple;
        const words = wordData.slice(wordRange[0], wordRange[1]);
        const selected = Helpers.shuffle(words).slice(0, count);
        
        return selected.map(word => ({
            id: word.word,
            item: word.word,
            display: word.word,
            audio: word.word,
            target: word.emoji,
            targetEmoji: word.emoji,
            targetDisplay: '',
            targetAudio: word.word
        }));
    },

    /**
     * Create word memory pairs
     */
    createWordMemoryPairs(wordType = 'simple', count = 6) {
        const wordData = GameData.words[wordType] || GameData.words.simple;
        const selected = Helpers.shuffle([...wordData]).slice(0, count);
        
        return selected.map(word => ({
            id: word.word,
            display: word.word,
            emoji: word.emoji,
            audio: word.word
        }));
    },

    /**
     * Create rhyming word pairs
     */
    createRhymePairs(family = 'at', count = 4) {
        // Fix: rhymes live under GameData.words.wordFamilies
        const rhymeData = (GameData.words && GameData.words.wordFamilies && GameData.words.wordFamilies[family]) || [];
        const selected = Helpers.shuffle([...rhymeData]).slice(0, count);

        return selected.map(word => ({
            id: `${family}-${word}`,
            item: word,
            display: word,
            audio: word,
            targetDisplay: `-${family}`,
            targetAudio: `${word} rhymes with ${family}`
        }));
    },

    /**
     * Get game configuration based on level
     */
    getGameConfig(level) {
        const config = {
            type: level.type,
            gameType: level.gameType
        };

        switch (level.gameType) {
            case 'word-picture':
                config.pairs = this.createWordPicturePairs(
                    level.wordType,
                    level.wordRange,
                    level.itemCount
                );
                break;
            case 'word-memory':
                config.pairs = this.createWordMemoryPairs(
                    level.wordType,
                    level.pairCount
                );
                break;
            case 'rhyme-sort':
                config.pairs = this.createRhymePairs(
                    level.family,
                    level.itemCount
                );
                break;
            default:
                config.pairs = this.createWordPicturePairs(
                    level.wordType || 'simple',
                    level.wordRange || [0, 12],
                    level.itemCount || 4
                );
        }

        return config;
    }
};

/**
 * Story Games (Story Ocean)
 * Generates sentence-building content for levels.
 */
const StoryGames = {
    // Simple dyslexia-friendly sentence bank (short words, common patterns)
    sentenceBank: [
        { words: ['I', 'see'], image: '👀' },
        { words: ['I', 'run'], image: '🏃' },
        { words: ['We', 'play'], image: '🎲' },
        { words: ['The', 'cat', 'runs'], image: '🐱' },
        { words: ['The', 'dog', 'is', 'happy'], image: '🐶' },
        { words: ['My', 'pet', 'can', 'jump'], image: '🐾' },
        { words: ['The', 'sun', 'is', 'hot', 'today'], image: '☀️' },
        { words: ['The', 'big', 'red', 'ball', 'bounces'], image: '🔴' },
        { words: ['I', 'like', 'to', 'read', 'books'], image: '📚' },
        { words: ['We', 'walk', 'to', 'the', 'park', 'now'], image: '🌳' },
        { words: ['The', 'fish', 'swims', 'in', 'blue', 'water'], image: '🐟' },
        { words: ['Can', 'you', 'help', 'me', 'find', 'it'], image: '🧩' },
        { words: ['Where', 'is', 'my', 'small', 'toy', 'car'], image: '🚗' },
        { words: ['I', 'want', 'to', 'eat', 'an', 'apple'], image: '🍎' },
        { words: ['We', 'sing', 'and', 'dance', 'all', 'day'], image: '🎵' }
    ],

    /**
     * Get a sentence for a level (by target wordCount)
     */
    getSentenceForLevel(level) {
        const targetCount = level.wordCount || 4;
        
        // Pick the closest length sentence; if none, pad with simple words.
        const sorted = [...this.sentenceBank].sort((a, b) => Math.abs(a.words.length - targetCount) - Math.abs(b.words.length - targetCount));
        let chosen = sorted[0] || { words: ['I', 'see', 'a', 'cat'], image: '🐱' };

        let words = [...chosen.words];
        const fillers = ['now', 'today', 'here', 'outside'];

        while (words.length < targetCount) {
            words.push(fillers[(words.length + targetCount) % fillers.length]);
        }
        if (words.length > targetCount) {
            words = words.slice(0, targetCount);
        }

        // Add punctuation markers if requested (simple token)
        if (level.includePunctuation) {
            if (!words.includes('.')) words.push('.');
        }
        if (level.sentenceMode === 'question') {
            // Ensure question-like start if possible
            const starters = ['Who', 'What', 'Where', 'When', 'Why', 'How', 'Can'];
            if (!starters.includes(words[0])) {
                words[0] = 'Can';
            }
            if (!words.includes('?')) words.push('?');
        }

        return {
            image: chosen.image,
            words
        };
    }
};

/**
 * Number Games
 */
const NumberGames = {
    /**
     * Create number-dots matching pairs
     */
    createNumberDotsPairs(numberRange = [0, 10], count = 4) {
        const numbers = GameData.numbers.slice(numberRange[0], numberRange[1]);
        const selected = Helpers.shuffle(numbers).slice(0, count);

        return selected.map(num => ({
            id: String(num.value),
            item: String(num.value),
            display: String(num.value),
            audio: num.word,
            target: num.emoji,
            targetEmoji: num.dots || '●'.repeat(num.value),
            targetDisplay: '',
            targetAudio: `${num.word} dots`
        }));
    },

    /**
     * Create number-emoji matching pairs
     */
    createNumberEmojiPairs(numberRange = [0, 10], count = 4) {
        const numbers = GameData.numbers.slice(numberRange[0], numberRange[1]);
        const selected = Helpers.shuffle(numbers).slice(0, count);

        return selected.map(num => ({
            id: String(num.value),
            item: String(num.value),
            display: String(num.value),
            audio: num.word,
            target: num.emoji,
            targetEmoji: num.emoji,
            targetDisplay: '',
            targetAudio: `${num.word} ${num.emoji}`
        }));
    },

    /**
     * Create number-word matching pairs
     */
    createNumberWordPairs(numberRange = [0, 10], count = 4) {
        const numbers = GameData.numbers.slice(numberRange[0], numberRange[1]);
        const selected = Helpers.shuffle(numbers).slice(0, count);

        return selected.map(num => ({
            id: String(num.value),
            item: String(num.value),
            display: String(num.value),
            audio: num.word,
            target: num.word,
            targetDisplay: num.word,
            targetAudio: num.word
        }));
    },

    /**
     * Create number memory pairs
     */
    createNumberMemoryPairs(count = 6) {
        const numbers = GameData.numbers.slice(0, 10);
        const selected = Helpers.shuffle(numbers).slice(0, count);

        return selected.map(num => ({
            id: String(num.value),
            display: String(num.value),
            emoji: num.emoji,
            audio: num.word
        }));
    },

    /**
     * Create addition problems
     */
    createAdditionPairs(range = [0, 5], count = 4) {
        const problems = [];
        const usedAnswers = new Set();

        while (problems.length < count) {
            const a = Math.floor(Math.random() * (range[1] - range[0])) + range[0];
            const b = Math.floor(Math.random() * (range[1] - range[0])) + range[0];
            const answer = a + b;

            if (!usedAnswers.has(answer)) {
                usedAnswers.add(answer);
                problems.push({
                    id: `${a}+${b}`,
                    item: `${a} + ${b}`,
                    display: `${a} + ${b}`,
                    audio: `${a} plus ${b}`,
                    target: String(answer),
                    targetDisplay: String(answer),
                    targetAudio: `equals ${answer}`
                });
            }
        }

        return problems;
    },

    /**
     * Get game configuration based on level
     */
    getGameConfig(level) {
        const config = {
            type: level.type,
            gameType: level.gameType
        };

        switch (level.gameType) {
            case 'number-dots':
                config.pairs = this.createNumberDotsPairs(
                    level.numberRange,
                    level.itemCount
                );
                break;
            case 'number-emoji':
                config.pairs = this.createNumberEmojiPairs(
                    level.numberRange,
                    level.itemCount
                );
                break;
            case 'number-word':
                config.pairs = this.createNumberWordPairs(
                    level.numberRange,
                    level.itemCount
                );
                break;
            case 'number-memory':
                config.pairs = this.createNumberMemoryPairs(
                    level.pairCount
                );
                break;
            case 'addition':
                config.pairs = this.createAdditionPairs(
                    level.problemRange,
                    level.itemCount
                );
                break;
            default:
                config.pairs = this.createNumberEmojiPairs(
                    level.numberRange || [0, 10],
                    level.itemCount || 4
                );
        }

        return config;
    }
};

// Export all game generators
window.LetterGames = LetterGames;
window.ColorGames = ColorGames;
window.WordGames = WordGames;
window.NumberGames = NumberGames;
window.StoryGames = StoryGames;
