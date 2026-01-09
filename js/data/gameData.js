/**
 * LexiQuest - Game Data
 * Contains all game content for different game types
 */

const GameData = {
    // ============ Letter Kingdom Data ============
    letters: [
        { letter: 'A', upper: 'A', lower: 'a', sound: 'ah', word: 'Apple', emoji: '🍎' },
        { letter: 'B', upper: 'B', lower: 'b', sound: 'buh', word: 'Ball', emoji: '⚽' },
        { letter: 'C', upper: 'C', lower: 'c', sound: 'kuh', word: 'Cat', emoji: '🐱' },
        { letter: 'D', upper: 'D', lower: 'd', sound: 'duh', word: 'Dog', emoji: '🐕' },
        { letter: 'E', upper: 'E', lower: 'e', sound: 'eh', word: 'Egg', emoji: '🥚' },
        { letter: 'F', upper: 'F', lower: 'f', sound: 'fff', word: 'Fish', emoji: '🐟' },
        { letter: 'G', upper: 'G', lower: 'g', sound: 'guh', word: 'Goat', emoji: '🐐' },
        { letter: 'H', upper: 'H', lower: 'h', sound: 'huh', word: 'House', emoji: '🏠' },
        { letter: 'I', upper: 'I', lower: 'i', sound: 'ih', word: 'Ice cream', emoji: '🍦' },
        { letter: 'J', upper: 'J', lower: 'j', sound: 'juh', word: 'Jelly', emoji: '🍮' },
        { letter: 'K', upper: 'K', lower: 'k', sound: 'kuh', word: 'King', emoji: '🤴' },
        { letter: 'L', upper: 'L', lower: 'l', sound: 'lll', word: 'Lion', emoji: '🦁' },
        { letter: 'M', upper: 'M', lower: 'm', sound: 'mmm', word: 'Monkey', emoji: '🐵' },
        { letter: 'N', upper: 'N', lower: 'n', sound: 'nnn', word: 'Nest', emoji: '🪺' },
        { letter: 'O', upper: 'O', lower: 'o', sound: 'oh', word: 'Orange', emoji: '🍊' },
        { letter: 'P', upper: 'P', lower: 'p', sound: 'puh', word: 'Pig', emoji: '�' },
        { letter: 'Q', upper: 'Q', lower: 'q', sound: 'kwuh', word: 'Queen', emoji: '👸' },
        { letter: 'R', upper: 'R', lower: 'r', sound: 'rrr', word: 'Rabbit', emoji: '🐰' },
        { letter: 'S', upper: 'S', lower: 's', sound: 'sss', word: 'Sun', emoji: '☀️' },
        { letter: 'T', upper: 'T', lower: 't', sound: 'tuh', word: 'Tree', emoji: '🌳' },
        { letter: 'U', upper: 'U', lower: 'u', sound: 'uh', word: 'Umbrella', emoji: '☂️' },
        { letter: 'V', upper: 'V', lower: 'v', sound: 'vvv', word: 'Violin', emoji: '🎻' },
        { letter: 'W', upper: 'W', lower: 'w', sound: 'wuh', word: 'Water', emoji: '💧' },
        { letter: 'X', upper: 'X', lower: 'x', sound: 'ks', word: 'Fox', emoji: '🦊' },
        { letter: 'Y', upper: 'Y', lower: 'y', sound: 'yuh', word: 'Yellow', emoji: '💛' },
        { letter: 'Z', upper: 'Z', lower: 'z', sound: 'zzz', word: 'Zebra', emoji: '🦓' }
    ],

    // ============ Color Valley Data ============
    colors: {
        basic: [
            { name: 'Red', hex: '#e74c3c', emoji: '🔴', className: 'color-red' },
            { name: 'Blue', hex: '#3498db', emoji: '🔵', className: 'color-blue' },
            { name: 'Green', hex: '#2ecc71', emoji: '🟢', className: 'color-green' },
            { name: 'Yellow', hex: '#f1c40f', emoji: '🟡', className: 'color-yellow' },
            { name: 'Orange', hex: '#e67e22', emoji: '🟠', className: 'color-orange' },
            { name: 'Purple', hex: '#9b59b6', emoji: '🟣', className: 'color-purple' },
            { name: 'Pink', hex: '#e91e63', emoji: '💗', className: 'color-pink' },
            { name: 'Brown', hex: '#795548', emoji: '🟤', className: 'color-brown' }
        ],
        
        advanced: [
            { name: 'Cyan', hex: '#00bcd4', emoji: '🩵', className: 'color-cyan' },
            { name: 'Magenta', hex: '#e91e63', emoji: '💜', className: 'color-magenta' },
            { name: 'Lime', hex: '#cddc39', emoji: '🍋', className: 'color-lime' },
            { name: 'Teal', hex: '#009688', emoji: '🌊', className: 'color-teal' },
            { name: 'Navy', hex: '#001f3f', emoji: '🌌', className: 'color-navy' },
            { name: 'Gold', hex: '#ffd700', emoji: '🥇', className: 'color-gold' },
            { name: 'Silver', hex: '#c0c0c0', emoji: '🥈', className: 'color-silver' },
            { name: 'Black', hex: '#2c3e50', emoji: '⬛', className: 'color-black' },
            { name: 'White', hex: '#ecf0f1', emoji: '⬜', className: 'color-white' },
            { name: 'Gray', hex: '#95a5a6', emoji: '🩶', className: 'color-gray' }
        ],

        // Color objects (match color to object)
        colorObjects: [
            { color: 'Red', emoji: '🍎', name: 'Apple' },
            { color: 'Red', emoji: '🍓', name: 'Strawberry' },
            { color: 'Blue', emoji: '🐳', name: 'Whale' },
            { color: 'Blue', emoji: '💧', name: 'Water' },
            { color: 'Green', emoji: '🐸', name: 'Frog' },
            { color: 'Green', emoji: '🌲', name: 'Tree' },
            { color: 'Yellow', emoji: '🌻', name: 'Sunflower' },
            { color: 'Yellow', emoji: '⭐', name: 'Star' },
            { color: 'Orange', emoji: '🥕', name: 'Carrot' },
            { color: 'Orange', emoji: '🍊', name: 'Orange' },
            { color: 'Purple', emoji: '🍇', name: 'Grapes' },
            { color: 'Purple', emoji: '🔮', name: 'Crystal' },
            { color: 'Pink', emoji: '🌸', name: 'Flower' },
            { color: 'Pink', emoji: '🦩', name: 'Flamingo' },
            { color: 'Brown', emoji: '🐻', name: 'Bear' },
            { color: 'Brown', emoji: '🍫', name: 'Chocolate' }
        ]
    },

    // ============ Word Forest Data ============
    words: {
        simple: [
            { word: 'CAT', emoji: '🐱' },
            { word: 'DOG', emoji: '🐕' },
            { word: 'SUN', emoji: '☀️' },
            { word: 'STAR', emoji: '⭐' },
            { word: 'BEE', emoji: '🐝' },
            { word: 'ANT', emoji: '🐜' },
            { word: 'CAR', emoji: '🚗' },
            { word: 'BUS', emoji: '🚌' },
            { word: 'BAT', emoji: '🦇' },
            { word: 'PIG', emoji: '🐷' },
            { word: 'COW', emoji: '🐮' },
            { word: 'OWL', emoji: '🦉' }
        ],

        medium: [
            { word: 'TREE', emoji: '🌳' },
            { word: 'FISH', emoji: '🐟' },
            { word: 'BIRD', emoji: '🐦' },
            { word: 'MOON', emoji: '🌙' },
            { word: 'BEAR', emoji: '🐻' },
            { word: 'FROG', emoji: '🐸' },
            { word: 'DUCK', emoji: '🦆' },
            { word: 'LION', emoji: '🦁' },
            { word: 'CAKE', emoji: '🎂' },
            { word: 'BOOK', emoji: '📚' },
            { word: 'BALL', emoji: '⚽' },
            { word: 'BOAT', emoji: '⛵' }
        ],

        complex: [
            { word: 'APPLE', emoji: '🍎' },
            { word: 'HOUSE', emoji: '🏠' },
            { word: 'FLOWER', emoji: '🌸' },
            { word: 'ROCKET', emoji: '🚀' },
            { word: 'RAINBOW', emoji: '🌈' },
            { word: 'BUTTERFLY', emoji: '🦋' },
            { word: 'ELEPHANT', emoji: '🐘' },
            { word: 'PENGUIN', emoji: '🐧' },
            { word: 'OCTOPUS', emoji: '🐙' },
            { word: 'TURTLE', emoji: '🐢' },
            { word: 'MONKEY', emoji: '🐵' },
            { word: 'GIRAFFE', emoji: '🦒' }
        ],

        // Word families (rhyming words)
        wordFamilies: {
            'at': ['CAT', 'BAT', 'HAT', 'MAT', 'RAT', 'SAT', 'FAT', 'PAT'],
            'an': ['CAN', 'MAN', 'FAN', 'RAN', 'TAN', 'BAN', 'PAN', 'VAN'],
            'ig': ['BIG', 'DIG', 'FIG', 'PIG', 'WIG', 'JIG'],
            'op': ['HOP', 'MOP', 'POP', 'TOP', 'COP', 'STOP'],
            'ug': ['BUG', 'HUG', 'MUG', 'RUG', 'TUG', 'DUG']
        }
    },

    // ============ Number Mountain Data ============
    numbers: [
        { value: 1, word: 'One', emoji: '1️⃣', dots: '●' },
        { value: 2, word: 'Two', emoji: '2️⃣', dots: '●●' },
        { value: 3, word: 'Three', emoji: '3️⃣', dots: '●●●' },
        { value: 4, word: 'Four', emoji: '4️⃣', dots: '●●●●' },
        { value: 5, word: 'Five', emoji: '5️⃣', dots: '●●●●●' },
        { value: 6, word: 'Six', emoji: '6️⃣', dots: '●●●●●●' },
        { value: 7, word: 'Seven', emoji: '7️⃣', dots: '●●●●●●●' },
        { value: 8, word: 'Eight', emoji: '8️⃣', dots: '●●●●●●●●' },
        { value: 9, word: 'Nine', emoji: '9️⃣', dots: '●●●●●●●●●' },
        { value: 10, word: 'Ten', emoji: '🔟', dots: '●●●●●●●●●●' }
    ],

    // ============ Story Ocean Data ============
    stories: {
        sentences: [
            { words: ['The', 'cat', 'is', 'happy'], image: '😺' },
            { words: ['A', 'big', 'red', 'ball'], image: '🔴' },
            { words: ['I', 'see', 'a', 'bird'], image: '🐦' },
            { words: ['The', 'sun', 'is', 'hot'], image: '☀️' },
            { words: ['My', 'dog', 'can', 'run'], image: '🐕' }
        ]
    },

    // ============ Helper Methods ============

    /**
     * Get random items from an array
     */
    getRandomItems(array, count) {
        return Helpers.getRandomItems(array, count);
    },

    /**
     * Get items for a specific level difficulty
     */
    getItemsForLevel(dataArray, level) {
        // Determine count based on level
        let count;
        if (level <= 3) count = 4;
        else if (level <= 6) count = 6;
        else count = 8;

        // Get items based on level range
        const startIndex = Math.min((level - 1) * 2, dataArray.length - count);
        const endIndex = Math.min(startIndex + count + 2, dataArray.length);
        const availableItems = dataArray.slice(startIndex, endIndex);

        return this.getRandomItems(availableItems, count);
    }
};

// Make available globally
window.GameData = GameData;
