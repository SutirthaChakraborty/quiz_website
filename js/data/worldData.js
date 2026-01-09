/**
 * LexiQuest - World Data
 * Contains world configuration, level definitions, and story content
 */

const WorldData = {
    // World configurations
    worlds: {
        letters: {
            id: 'letters',
            name: 'Letter Kingdom',
            icon: '🏰',
            color: '#6c5ce7',
            gradient: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
            description: 'Learn letters and their sounds',
            totalLevels: 10,
            storyIntro: 'The evil Confusion Wizard has scattered all the letters! Help the villagers find them!',
            narrator: '🧙‍♂️',
            levels: [
                { 
                    number: 1, 
                    name: 'First Letters', 
                    type: 'matching', 
                    gameType: 'letter-sound',
                    description: 'Match letters A-D to their sounds',
                    letterRange: [0, 4],
                    itemCount: 4
                },
                { 
                    number: 2, 
                    name: 'More Letters', 
                    type: 'matching', 
                    gameType: 'letter-sound',
                    description: 'Match letters E-H to their sounds',
                    letterRange: [4, 8],
                    itemCount: 4
                },
                { 
                    number: 3, 
                    name: 'Growing Strong', 
                    type: 'matching', 
                    gameType: 'letter-sound',
                    description: 'Match letters I-L',
                    letterRange: [8, 12],
                    itemCount: 4
                },
                { 
                    number: 4, 
                    name: 'Halfway There', 
                    type: 'matching', 
                    gameType: 'letter-sound',
                    description: 'Match letters M-P',
                    letterRange: [12, 16],
                    itemCount: 4
                },
                { 
                    number: 5, 
                    name: 'Letter Quest', 
                    type: 'matching', 
                    gameType: 'letter-sound',
                    description: 'Match letters Q-T',
                    letterRange: [16, 20],
                    itemCount: 4
                },
                { 
                    number: 6, 
                    name: 'Almost Done', 
                    type: 'matching', 
                    gameType: 'letter-sound',
                    description: 'Match letters U-Z',
                    letterRange: [20, 26],
                    itemCount: 6
                },
                { 
                    number: 7, 
                    name: 'Big and Small', 
                    type: 'matching', 
                    gameType: 'upper-lower',
                    description: 'Match uppercase to lowercase letters',
                    letterRange: [0, 8],
                    itemCount: 6
                },
                { 
                    number: 8, 
                    name: 'Letter Mix', 
                    type: 'matching', 
                    gameType: 'letter-picture',
                    description: 'Match letters to pictures',
                    letterRange: [0, 12],
                    itemCount: 6
                },
                { 
                    number: 9, 
                    name: 'Memory Master', 
                    type: 'memory', 
                    gameType: 'letter-memory',
                    description: 'Find matching letter pairs',
                    letterRange: [0, 8],
                    pairCount: 6
                },
                { 
                    number: 10, 
                    name: 'Letter Champion', 
                    type: 'matching', 
                    gameType: 'letter-sound',
                    description: 'Match all the letters you learned!',
                    letterRange: [0, 26],
                    itemCount: 8
                }
            ]
        },

        colors: {
            id: 'colors',
            name: 'Color Valley',
            icon: '🌈',
            color: '#00cec9',
            gradient: 'linear-gradient(135deg, #00cec9 0%, #81ecec 100%)',
            description: 'Explore the world of colors',
            totalLevels: 10,
            storyIntro: 'The Rainbow Dragon lost all its colors! Help find them scattered across the valley!',
            narrator: '🐉',
            levels: [
                {
                    number: 1,
                    name: 'Primary Colors',
                    type: 'matching',
                    gameType: 'color-name',
                    description: 'Match basic colors to their names',
                    colorRange: [0, 4],
                    itemCount: 4
                },
                {
                    number: 2,
                    name: 'More Colors',
                    type: 'matching',
                    gameType: 'color-name',
                    description: 'Learn more color names',
                    colorRange: [4, 8],
                    itemCount: 4
                },
                {
                    number: 3,
                    name: 'Color Objects',
                    type: 'matching',
                    gameType: 'color-object',
                    description: 'Match colors to colorful objects',
                    colorRange: [0, 8],
                    itemCount: 4
                },
                {
                    number: 4,
                    name: 'Rainbow Mix',
                    type: 'matching',
                    gameType: 'color-name',
                    description: 'All the basic colors!',
                    colorRange: [0, 8],
                    itemCount: 6
                },
                {
                    number: 5,
                    name: 'Color Memory',
                    type: 'memory',
                    gameType: 'color-memory',
                    description: 'Find matching color pairs',
                    colorRange: [0, 6],
                    pairCount: 6
                },
                {
                    number: 6,
                    name: 'Advanced Colors',
                    type: 'matching',
                    gameType: 'color-name',
                    description: 'Learn advanced color names',
                    useAdvanced: true,
                    colorRange: [0, 6],
                    itemCount: 6
                },
                {
                    number: 7,
                    name: 'Color Sorting',
                    type: 'sorting',
                    gameType: 'color-sort',
                    description: 'Sort objects by their color',
                    colorRange: [0, 4],
                    itemCount: 8
                },
                {
                    number: 8,
                    name: 'All Colors',
                    type: 'matching',
                    gameType: 'color-name',
                    description: 'Match all the colors!',
                    colorRange: [0, 8],
                    itemCount: 8
                },
                {
                    number: 9,
                    name: 'Color Quest',
                    type: 'matching',
                    gameType: 'color-object',
                    description: 'Big color matching challenge',
                    colorRange: [0, 16],
                    itemCount: 8
                },
                {
                    number: 10,
                    name: 'Rainbow Master',
                    type: 'memory',
                    gameType: 'color-memory',
                    description: 'Ultimate color memory challenge',
                    colorRange: [0, 8],
                    pairCount: 8
                }
            ]
        },

        words: {
            id: 'words',
            name: 'Word Forest',
            icon: '🌲',
            color: '#00b894',
            gradient: 'linear-gradient(135deg, #00b894 0%, #55efc4 100%)',
            description: 'Discover words and reading',
            totalLevels: 10,
            storyIntro: 'The wise owl has lost all the words from the magic book! Help collect them from the forest!',
            narrator: '🦉',
            levels: [
                {
                    number: 1,
                    name: 'Simple Words',
                    type: 'matching',
                    gameType: 'word-picture',
                    description: 'Match simple words to pictures',
                    wordType: 'simple',
                    wordRange: [0, 6],
                    itemCount: 4
                },
                {
                    number: 2,
                    name: 'More Words',
                    type: 'matching',
                    gameType: 'word-picture',
                    description: 'Learn more simple words',
                    wordType: 'simple',
                    wordRange: [6, 12],
                    itemCount: 4
                },
                {
                    number: 3,
                    name: 'Word Sounds',
                    type: 'matching',
                    gameType: 'word-picture',
                    description: 'Match words you hear',
                    wordType: 'simple',
                    wordRange: [0, 12],
                    itemCount: 6
                },
                {
                    number: 4,
                    name: 'Medium Words',
                    type: 'matching',
                    gameType: 'word-picture',
                    description: 'Try longer words',
                    wordType: 'medium',
                    wordRange: [0, 6],
                    itemCount: 4
                },
                {
                    number: 5,
                    name: 'Word Memory',
                    type: 'memory',
                    gameType: 'word-memory',
                    description: 'Find matching word pairs',
                    wordType: 'simple',
                    pairCount: 6
                },
                {
                    number: 6,
                    name: 'Growing Words',
                    type: 'matching',
                    gameType: 'word-picture',
                    description: 'More medium words',
                    wordType: 'medium',
                    wordRange: [6, 12],
                    itemCount: 6
                },
                {
                    number: 7,
                    name: 'Word Families',
                    type: 'sorting',
                    gameType: 'rhyme-sort',
                    description: 'Find rhyming words',
                    family: 'at',
                    itemCount: 6
                },
                {
                    number: 8,
                    name: 'Big Words',
                    type: 'matching',
                    gameType: 'word-picture',
                    description: 'Try complex words',
                    wordType: 'complex',
                    wordRange: [0, 8],
                    itemCount: 6
                },
                {
                    number: 9,
                    name: 'Spelling Bee',
                    type: 'spelling',
                    gameType: 'word-spell',
                    description: 'Spell the words',
                    wordType: 'simple',
                    wordCount: 5
                },
                {
                    number: 10,
                    name: 'Word Champion',
                    type: 'matching',
                    gameType: 'word-picture',
                    description: 'Ultimate word challenge',
                    wordType: 'complex',
                    wordRange: [0, 12],
                    itemCount: 8
                }
            ]
        },

        numbers: {
            id: 'numbers',
            name: 'Number Mountain',
            icon: '🏔️',
            color: '#fdcb6e',
            gradient: 'linear-gradient(135deg, #fdcb6e 0%, #ffeaa7 100%)',
            description: 'Master numbers and counting',
            totalLevels: 10,
            storyIntro: 'The number crystals have been stolen! Climb the mountain to recover them!',
            narrator: '🧝',
            levels: [
                {
                    number: 1,
                    name: 'Numbers 1-3',
                    type: 'matching',
                    gameType: 'number-dots',
                    description: 'Count 1, 2, and 3',
                    numberRange: [0, 3],
                    itemCount: 3
                },
                {
                    number: 2,
                    name: 'Numbers 4-6',
                    type: 'matching',
                    gameType: 'number-dots',
                    description: 'Count 4, 5, and 6',
                    numberRange: [3, 6],
                    itemCount: 3
                },
                {
                    number: 3,
                    name: 'Numbers 7-10',
                    type: 'matching',
                    gameType: 'number-dots',
                    description: 'Count up to 10',
                    numberRange: [6, 10],
                    itemCount: 4
                },
                {
                    number: 4,
                    name: 'Count Everything',
                    type: 'matching',
                    gameType: 'number-emoji',
                    description: 'Count objects',
                    numberRange: [0, 6],
                    itemCount: 4
                },
                {
                    number: 5,
                    name: 'Number Words',
                    type: 'matching',
                    gameType: 'number-word',
                    description: 'Match numbers to words',
                    numberRange: [0, 6],
                    itemCount: 4
                },
                {
                    number: 6,
                    name: 'Big Numbers',
                    type: 'matching',
                    gameType: 'number-word',
                    description: 'Numbers up to 10',
                    numberRange: [0, 10],
                    itemCount: 6
                },
                {
                    number: 7,
                    name: 'Number Memory',
                    type: 'memory',
                    gameType: 'number-memory',
                    description: 'Match number pairs',
                    pairCount: 6
                },
                {
                    number: 8,
                    name: 'Simple Adding',
                    type: 'matching',
                    gameType: 'addition',
                    description: 'Learn to add',
                    problemRange: [0, 5],
                    itemCount: 4
                },
                {
                    number: 9,
                    name: 'More Adding',
                    type: 'matching',
                    gameType: 'addition',
                    description: 'More addition practice',
                    problemRange: [0, 9],
                    itemCount: 6
                },
                {
                    number: 10,
                    name: 'Number Master',
                    type: 'matching',
                    gameType: 'number-emoji',
                    description: 'Count up to 10',
                    numberRange: [0, 10],
                    itemCount: 8
                }
            ]
        },

        stories: {
            id: 'stories',
            name: 'Story Ocean',
            icon: '🌊',
            color: '#0984e3',
            gradient: 'linear-gradient(135deg, #0984e3 0%, #74b9ff 100%)',
            description: 'Build sentences and read stories',
            totalLevels: 10,
            storyIntro: 'The story scrolls have washed ashore in pieces! Help put them back together!',
            narrator: '🧜‍♀️',
            levels: [
                {
                    number: 1,
                    name: 'Two Words',
                    type: 'sentence',
                    gameType: 'word-order',
                    description: 'Put two words in order',
                    wordCount: 2,
                    narration: 'Let\'s start small. Put two words in the right order to make a tiny sentence.'
                },
                {
                    number: 2,
                    name: 'Three Words',
                    type: 'sentence',
                    gameType: 'word-order',
                    description: 'Build a three-word sentence',
                    wordCount: 3,
                    narration: 'Now we\'ll use three words. Take your time. Read each word slowly.'
                },
                {
                    number: 3,
                    name: 'Simple Sentences',
                    type: 'sentence',
                    gameType: 'word-order',
                    description: 'Build a simple sentence',
                    wordCount: 4,
                    narration: 'Great. Now make a four word sentence. Start with who or what. Then add what happens.'
                },
                {
                    number: 4,
                    name: 'Five Word Story',
                    type: 'sentence',
                    gameType: 'word-order',
                    description: 'Make a five-word sentence',
                    wordCount: 5,
                    narration: 'We\'re making a longer sentence. Five words. One step at a time.'
                },
                {
                    number: 5,
                    name: 'Six Word Story',
                    type: 'sentence',
                    gameType: 'word-order',
                    description: 'Make a six-word sentence',
                    wordCount: 6,
                    narration: 'Six words. Look for a word that feels like the beginning. Then build forward.'
                },
                {
                    number: 6,
                    name: 'Sentence Builder',
                    type: 'sentence',
                    gameType: 'word-order',
                    description: 'Build a sentence with punctuation',
                    wordCount: 6,
                    includePunctuation: true,
                    narration: 'Let\'s add punctuation. A sentence should end with a full stop.'
                },
                {
                    number: 7,
                    name: 'Question Time',
                    type: 'sentence',
                    gameType: 'word-order',
                    description: 'Build a question sentence',
                    wordCount: 6,
                    sentenceMode: 'question',
                    narration: 'Now we will make a question. Questions often start with who, what, where, when, why, or how.'
                },
                {
                    number: 8,
                    name: 'Connect the Idea',
                    type: 'sentence',
                    gameType: 'word-order',
                    description: 'Use connecting words like and/but',
                    wordCount: 7,
                    includeConnectors: true,
                    narration: 'We can connect ideas with words like and or but. Read slowly and listen.'
                },
                {
                    number: 9,
                    name: 'Mini Story',
                    type: 'sentence',
                    gameType: 'word-order',
                    description: 'Build a longer mini story sentence',
                    wordCount: 8,
                    narration: 'This is a mini story in one sentence. Take your time. You are doing great.'
                },
                {
                    number: 10,
                    name: 'Story Ocean Champion',
                    type: 'sentence',
                    gameType: 'word-order',
                    description: 'Build your longest sentence',
                    wordCount: 9,
                    narration: 'Champion level. Build the longest sentence. Slow and steady wins.'
                }
            ]
        }
    },

    /**
     * Get world by ID
     */
    getWorld(worldId) {
        return this.worlds[worldId] || null;
    },

    /**
     * Get level data
     */
    getLevel(worldId, levelNumber) {
        const world = this.worlds[worldId];
        if (!world) return null;
        return world.levels.find(l => l.number === levelNumber) || null;
    },

    /**
     * Get all worlds as array
     */
    getAllWorlds() {
        return Object.values(this.worlds);
    },

    /**
     * Get story text for a world
     */
    getStoryText(worldId) {
        const world = this.worlds[worldId];
        if (!world) return '';
        return world.storyIntro;
    },

    /**
     * Get narrator for a world
     */
    getNarrator(worldId) {
        const world = this.worlds[worldId];
        if (!world) return '🧙‍♂️';
        return world.narrator;
    }
};

// Make available globally
window.WorldData = WorldData;
