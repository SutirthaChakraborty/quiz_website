/**
 * LexiQuest - Base Game Class
 * Template for creating new games. Extend this class to create a new game.
 * 
 * CREATING A NEW GAME:
 * 
 * 1. Create a new file: js/games/YourGame.js
 * 2. Extend BaseGame:
 * 
 *    class YourGame extends BaseGame {
 *        constructor(options) {
 *            super(options);
 *            // Your initialization
 *        }
 *        
 *        init(config) {
 *            super.init(config);
 *            // Setup your game
 *        }
 *        
 *        // Override other methods as needed
 *    }
 * 
 * 3. Register your game at the end of the file:
 *    YourGame.register('your-game', {
 *        name: 'Your Game',
 *        description: 'Description of your game',
 *        icon: '🎮'
 *    });
 * 
 * 4. Add script tag in index.html:
 *    <script src="js/games/YourGame.js?v=12"></script>
 */

class BaseGame {
    /**
     * Constructor for all games
     * @param {Object} options - Configuration options
     * @param {HTMLElement} options.container - Main container for game items
     * @param {HTMLElement} options.dropZones - Container for drop zones (if applicable)
     * @param {Function} options.onComplete - Called when game is complete
     * @param {Function} options.onScoreChange - Called when score changes
     * @param {Function} options.onProgress - Called when progress changes
     */
    constructor(options = {}) {
        this.container = options.container || null;
        this.dropZones = options.dropZones || null;
        this.onComplete = options.onComplete || (() => {});
        this.onScoreChange = options.onScoreChange || (() => {});
        this.onProgress = options.onProgress || (() => {});
        
        // Game state
        this.isActive = false;
        this.isPaused = false;
        this.score = 0;
        this.progress = 0;
        this.totalItems = 0;
        this.completedItems = 0;
        this.attempts = 0;
        this.startTime = null;
        
        // Hand tracking state (optional)
        this.handTrackingEnabled = false;
        this.handDraggedItem = null;
        this.handDragGhost = null;
    }

    /**
     * Initialize the game with configuration
     * Override this in subclass
     * @param {Object|Array} config - Game configuration or pairs
     */
    init(config) {
        this.reset();
        this.isActive = true;
        this.startTime = Date.now();
        console.log(`[${this.constructor.name}] Initialized`);
    }

    /**
     * Start the game
     */
    start() {
        this.isActive = true;
        this.startTime = Date.now();
        this.setupHandTracking();
        console.log(`[${this.constructor.name}] Started`);
    }

    /**
     * Pause the game
     */
    pause() {
        this.isPaused = true;
        console.log(`[${this.constructor.name}] Paused`);
    }

    /**
     * Resume the game
     */
    resume() {
        this.isPaused = false;
        console.log(`[${this.constructor.name}] Resumed`);
    }

    /**
     * Reset the game state
     */
    reset() {
        this.score = 0;
        this.progress = 0;
        this.completedItems = 0;
        this.attempts = 0;
        this.isActive = false;
        this.isPaused = false;
        
        if (this.container) {
            this.container.innerHTML = '';
        }
        if (this.dropZones) {
            this.dropZones.innerHTML = '';
        }
        
        this.cleanupHandTracking();
        console.log(`[${this.constructor.name}] Reset`);
    }

    /**
     * Complete the game and trigger callback
     * @param {Object} result - Result data to pass to callback
     */
    complete(result = {}) {
        this.isActive = false;
        const gameResult = {
            score: this.score,
            totalItems: this.totalItems,
            completedItems: this.completedItems,
            attempts: this.attempts,
            time: Date.now() - this.startTime,
            accuracy: this.totalItems > 0 ? (this.completedItems / this.attempts * 100) : 100,
            ...result
        };
        
        console.log(`[${this.constructor.name}] Completed`, gameResult);
        this.cleanupHandTracking();
        this.onComplete(gameResult);
    }

    /**
     * Update score and trigger callback
     * @param {number} delta - Points to add
     */
    addScore(delta) {
        this.score += delta;
        this.onScoreChange(this.score, delta);
    }

    /**
     * Update progress and trigger callback
     */
    updateProgress() {
        this.progress = this.totalItems > 0 
            ? (this.completedItems / this.totalItems) 
            : 0;
        this.onProgress(this.completedItems, this.totalItems);
    }

    /**
     * Setup hand tracking for this game
     * Override in subclass for custom hand tracking behavior
     */
    setupHandTracking() {
        if (!window.HandTracking) return;
        
        this.handTrackingEnabled = true;
        
        HandTracking.callbacks.onPinchStart = (pos) => this.onHandPinchStart(pos);
        HandTracking.callbacks.onPinchEnd = (pos) => this.onHandPinchEnd(pos);
        HandTracking.callbacks.onHandMove = (pos, isPinching) => this.onHandMove(pos, isPinching);
    }

    /**
     * Cleanup hand tracking callbacks
     */
    cleanupHandTracking() {
        if (!window.HandTracking) return;
        
        this.handTrackingEnabled = false;
        HandTracking.callbacks.onPinchStart = null;
        HandTracking.callbacks.onPinchEnd = null;
        HandTracking.callbacks.onHandMove = null;
        
        this.removeHandDragGhost();
    }

    /**
     * Handle hand pinch start - override in subclass
     * @param {Object} position - { x, y } screen coordinates
     */
    onHandPinchStart(position) {
        // Override in subclass
    }

    /**
     * Handle hand pinch end - override in subclass
     * @param {Object} position - { x, y } screen coordinates
     */
    onHandPinchEnd(position) {
        // Override in subclass
    }

    /**
     * Handle hand movement - override in subclass
     * @param {Object} position - { x, y } screen coordinates
     * @param {boolean} isPinching - Whether currently pinching
     */
    onHandMove(position, isPinching) {
        // Override in subclass
    }

    /**
     * Create a ghost element for hand dragging
     * @param {HTMLElement} sourceElement - Element to create ghost from
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    createHandDragGhost(sourceElement, x, y) {
        this.removeHandDragGhost();
        
        const ghost = sourceElement.cloneNode(true);
        ghost.className = sourceElement.className + ' hand-drag-ghost';
        ghost.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            transform: translate(-50%, -50%) scale(1.1);
            pointer-events: none;
            z-index: 10000;
            opacity: 0.9;
            transition: transform 0.1s;
        `;
        
        document.body.appendChild(ghost);
        this.handDragGhost = ghost;
        
        return ghost;
    }

    /**
     * Update hand drag ghost position
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    updateHandDragGhost(x, y) {
        if (this.handDragGhost) {
            this.handDragGhost.style.left = `${x}px`;
            this.handDragGhost.style.top = `${y}px`;
        }
    }

    /**
     * Remove hand drag ghost element
     */
    removeHandDragGhost() {
        if (this.handDragGhost) {
            this.handDragGhost.remove();
            this.handDragGhost = null;
        }
        this.handDraggedItem = null;
    }

    /**
     * Find element at position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} selector - CSS selector to match
     * @returns {HTMLElement|null}
     */
    getElementAtPosition(x, y, selector) {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
            const rect = el.getBoundingClientRect();
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                return el;
            }
        }
        return null;
    }

    /**
     * Play a sound effect
     * @param {string} soundName - Name of the sound to play
     */
    playSound(soundName) {
        if (window.AudioManager) {
            AudioManager.play(soundName);
        }
    }

    /**
     * Speak text using speech synthesis
     * @param {string} text - Text to speak
     */
    speak(text) {
        if (window.SpeechManager) {
            SpeechManager.speak(text);
        }
    }

    /**
     * Static method to register this game with the GameRegistry
     * Call at the end of your game file
     * @param {string} gameType - Unique game type identifier
     * @param {Object} options - Registration options
     */
    static register(gameType, options = {}) {
        if (!window.GameRegistry) {
            console.error('GameRegistry not found! Make sure GameRegistry.js is loaded first.');
            return;
        }
        
        GameRegistry.register(gameType, this, options);
        
        // Also make available globally for backwards compatibility
        window[this.name] = this;
    }
}

// Make available globally
window.BaseGame = BaseGame;
