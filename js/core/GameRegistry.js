/**
 * LexiQuest - Game Registry
 * Central registry for all game types. Games self-register when loaded.
 * 
 * HOW TO ADD A NEW GAME:
 * 1. Create a new file in js/games/ (e.g., PuzzleGame.js)
 * 2. Extend BaseGame or implement the game interface
 * 3. At the end of your file, register: GameRegistry.register('puzzle', PuzzleGame, { ... });
 * 4. Add <script src="js/games/PuzzleGame.js"> in index.html
 * 5. Done! The game will automatically be available.
 */

const GameRegistry = {
    // Registered game classes
    games: {},
    
    // Registered content generators (LetterGames, ColorGames, etc.)
    generators: {},
    
    // Game instances cache
    instances: {},
    
    // Default callbacks for game instances
    defaultCallbacks: {
        onComplete: null,
        onScoreChange: null,
        onProgress: null
    },

    /**
     * Register a game type
     * @param {string} gameType - Unique identifier for the game (e.g., 'matching', 'memory', 'sentence')
     * @param {Class} GameClass - The game class constructor
     * @param {Object} options - Additional options
     * @param {string} options.name - Display name of the game
     * @param {string} options.description - Description of the game
     * @param {string} options.icon - Emoji icon for the game
     * @param {Array<string>} options.supportedWorlds - World IDs this game supports (optional)
     */
    register(gameType, GameClass, options = {}) {
        if (this.games[gameType]) {
            console.warn(`Game type "${gameType}" is already registered. Overwriting.`);
        }
        
        this.games[gameType] = {
            GameClass,
            name: options.name || gameType,
            description: options.description || '',
            icon: options.icon || '🎮',
            supportedWorlds: options.supportedWorlds || [],
            version: options.version || '1.0.0'
        };
        
        console.log(`✅ Game registered: ${gameType} (${options.name || gameType})`);
    },

    /**
     * Register a content generator (e.g., LetterGames, ColorGames)
     * @param {string} worldId - World ID this generator handles
     * @param {Object} generator - Generator object with getGameConfig method
     */
    registerGenerator(worldId, generator) {
        if (this.generators[worldId]) {
            console.warn(`Generator for "${worldId}" is already registered. Overwriting.`);
        }
        
        this.generators[worldId] = generator;
        console.log(`✅ Generator registered: ${worldId}`);
    },

    /**
     * Get a game instance
     * @param {string} gameType - The game type identifier
     * @param {Object} options - Options to pass to the game constructor
     * @returns {Object} Game instance
     */
    getInstance(gameType, options = {}) {
        const gameInfo = this.games[gameType];
        
        if (!gameInfo) {
            console.error(`Game type "${gameType}" not found. Available games:`, Object.keys(this.games));
            return null;
        }
        
        // Create new instance with merged callbacks
        const mergedOptions = {
            ...this.defaultCallbacks,
            ...options
        };
        
        try {
            return new gameInfo.GameClass(mergedOptions);
        } catch (error) {
            console.error(`Error creating ${gameType} game instance:`, error);
            return null;
        }
    },

    /**
     * Get or create a cached game instance
     * @param {string} gameType - The game type identifier
     * @param {Object} options - Options for the game
     * @returns {Object} Game instance
     */
    getOrCreateInstance(gameType, options = {}) {
        if (!this.instances[gameType]) {
            this.instances[gameType] = this.getInstance(gameType, options);
        } else {
            // Update callbacks if provided
            const instance = this.instances[gameType];
            if (options.onComplete) instance.onComplete = options.onComplete;
            if (options.onScoreChange) instance.onScoreChange = options.onScoreChange;
            if (options.onProgress) instance.onProgress = options.onProgress;
            if (options.container) instance.container = options.container;
            if (options.dropZones) instance.dropZones = options.dropZones;
        }
        return this.instances[gameType];
    },

    /**
     * Get game configuration for a level
     * @param {Object} world - World data
     * @param {Object} level - Level data
     * @returns {Object} Game configuration
     */
    getGameConfig(world, level) {
        const generator = this.generators[world.id];
        
        if (generator && typeof generator.getGameConfig === 'function') {
            return generator.getGameConfig(level);
        }
        
        // Fallback: try to find a generator that supports this world
        for (const [worldId, gen] of Object.entries(this.generators)) {
            if (gen.supportedWorlds && gen.supportedWorlds.includes(world.id)) {
                return gen.getGameConfig(level);
            }
        }
        
        console.warn(`No generator found for world "${world.id}". Using level data directly.`);
        return { type: level.type || 'matching', level, pairs: level.pairs || [] };
    },

    /**
     * Determine which game type to use for a level
     * @param {Object} world - World data
     * @param {Object} level - Level data
     * @returns {string} Game type identifier
     */
    getGameTypeForLevel(world, level) {
        // Check level type first (matching, memory, sentence are game types)
        if (level.type) {
            // Map level types to game types
            const typeMap = {
                'memory': 'memory',
                'matching': 'matching',
                'sentence': 'sentence',
                'word-order': 'sentence',
                'drag-drop': 'matching',
                'quiz': 'quiz',
                'puzzle': 'puzzle'
            };
            
            if (typeMap[level.type]) {
                return typeMap[level.type];
            }
        }
        
        // World-specific defaults
        if (world.id === 'stories') {
            return 'sentence';
        }
        
        // Default to matching game
        return 'matching';
    },

    /**
     * Start a game for a specific level
     * @param {Object} world - World data
     * @param {Object} level - Level data
     * @param {Object} containers - { itemsContainer, dropZones }
     * @param {Object} callbacks - { onComplete, onScoreChange, onProgress }
     * @returns {Object} The game instance that was started
     */
    startGame(world, level, containers, callbacks) {
        const gameType = this.getGameTypeForLevel(world, level);
        const gameConfig = this.getGameConfig(world, level);
        
        console.log(`Starting ${gameType} game for ${world.id}/${level.name}`);
        
        const game = this.getOrCreateInstance(gameType, {
            container: containers.itemsContainer,
            dropZones: containers.dropZones,
            ...callbacks
        });
        
        if (!game) {
            console.error(`Failed to get game instance for type: ${gameType}`);
            return null;
        }
        
        // Configure container visibility based on game type
        if (containers.dropZones) {
            containers.dropZones.style.display = 
                (gameType === 'memory') ? 'none' : 'flex';
        }
        
        // Initialize the game with config
        if (gameType === 'sentence') {
            game.init(gameConfig);
        } else {
            game.init(gameConfig.pairs || gameConfig);
        }
        
        return game;
    },

    /**
     * Get list of all registered games
     * @returns {Array} Array of game info objects
     */
    listGames() {
        return Object.entries(this.games).map(([type, info]) => ({
            type,
            name: info.name,
            description: info.description,
            icon: info.icon,
            supportedWorlds: info.supportedWorlds
        }));
    },

    /**
     * Check if a game type is registered
     * @param {string} gameType - Game type to check
     * @returns {boolean}
     */
    hasGame(gameType) {
        return !!this.games[gameType];
    },

    /**
     * Check if a generator is registered for a world
     * @param {string} worldId - World ID to check
     * @returns {boolean}
     */
    hasGenerator(worldId) {
        return !!this.generators[worldId];
    },

    /**
     * Set default callbacks for all game instances
     * @param {Object} callbacks - Default callbacks
     */
    setDefaultCallbacks(callbacks) {
        this.defaultCallbacks = { ...this.defaultCallbacks, ...callbacks };
    },

    /**
     * Clear cached game instances
     */
    clearInstances() {
        this.instances = {};
    },

    /**
     * Debug: Log all registered games and generators
     */
    debug() {
        console.log('=== GameRegistry Debug ===');
        console.log('Registered Games:', Object.keys(this.games));
        console.log('Registered Generators:', Object.keys(this.generators));
        console.log('Cached Instances:', Object.keys(this.instances));
    }
};

// Make available globally
window.GameRegistry = GameRegistry;
