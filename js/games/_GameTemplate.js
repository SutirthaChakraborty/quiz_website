/**
 * LexiQuest - Game Template
 * Copy this file to create a new game type.
 * 
 * INSTRUCTIONS:
 * 1. Copy this file and rename it (e.g., PuzzleGame.js)
 * 2. Rename the class (e.g., class PuzzleGame)
 * 3. Implement the required methods
 * 4. Update the registration at the bottom
 * 5. Add <script src="js/games/YourGame.js?v=12"></script> to index.html
 * 
 * That's it! Your game will automatically be available.
 */

class GameTemplate {
    constructor(options = {}) {
        // Container where game items will be rendered
        this.container = options.container || document.getElementById('itemsContainer');
        
        // Container for drop zones (optional - for drag-drop games)
        this.dropZones = options.dropZones || document.getElementById('dropZones');
        
        // Callbacks - these will be set by GameRegistry
        this.onComplete = options.onComplete || (() => {});
        this.onScoreChange = options.onScoreChange || (() => {});
        this.onProgress = options.onProgress || (() => {});
        
        // Game state
        this.isActive = false;
        this.isPaused = false;
        this.score = 0;
        this.startTime = null;
        this.totalItems = 0;
        this.completedItems = 0;
        
        // Hand tracking state (if you want gesture support)
        this.handTrackingEnabled = false;
        
        // Bind methods for event handlers
        this.onHandPinchStart = this.onHandPinchStart.bind(this);
        this.onHandPinchEnd = this.onHandPinchEnd.bind(this);
        this.onHandMove = this.onHandMove.bind(this);
    }

    /**
     * Initialize the game with configuration
     * This is called when a level starts
     * 
     * @param {Object|Array} config - Game configuration from the generator
     *   For matching/memory games: Array of pairs
     *   For custom games: Custom config object
     */
    init(config) {
        this.reset();
        this.isActive = true;
        this.startTime = Date.now();
        
        // Parse your config
        const items = Array.isArray(config) ? config : (config.pairs || []);
        this.totalItems = items.length;
        
        // Clear containers
        if (this.container) {
            this.container.innerHTML = '';
        }
        if (this.dropZones) {
            this.dropZones.innerHTML = '';
            // Show/hide drop zones based on your game type
            this.dropZones.style.display = 'none'; // or 'flex'
        }
        
        // Create your game UI here
        items.forEach((item, index) => {
            const element = this.createGameElement(item, index);
            this.container.appendChild(element);
        });
        
        // Setup hand tracking (optional)
        this.setupHandTracking();
        
        // Update initial progress
        this.onProgress(0, this.totalItems);
        
        console.log(`[${this.constructor.name}] Initialized with ${this.totalItems} items`);
    }

    /**
     * Create a game element
     * Customize this for your game type
     */
    createGameElement(item, index) {
        const element = document.createElement('div');
        element.className = 'game-item';
        element.dataset.id = item.id || index;
        
        // Add content based on item data
        if (item.emoji) {
            element.innerHTML = `<span class="item-emoji">${item.emoji}</span>`;
        } else if (item.display) {
            element.innerHTML = `<span class="item-text">${item.display}</span>`;
        }
        
        // Add click handler
        element.addEventListener('click', () => this.handleItemClick(element, item));
        
        return element;
    }

    /**
     * Handle item click
     * Implement your game logic here
     */
    handleItemClick(element, item) {
        if (!this.isActive || this.isPaused) return;
        
        // Example: Mark as completed
        element.classList.add('completed');
        this.completedItems++;
        
        // Update score
        this.score += 100;
        this.onScoreChange(this.score, 100);
        
        // Update progress
        this.onProgress(this.completedItems, this.totalItems);
        
        // Play sound
        if (window.AudioManager) {
            AudioManager.play('success');
        }
        
        // Speak feedback
        if (window.SpeechManager) {
            SpeechManager.speak('Great job!');
        }
        
        // Check if game is complete
        if (this.completedItems >= this.totalItems) {
            this.handleGameComplete();
        }
    }

    /**
     * Handle game completion
     * Called when all items are completed
     */
    handleGameComplete() {
        this.isActive = false;
        
        // Calculate time taken
        const elapsed = (Date.now() - this.startTime) / 1000;
        
        // Calculate stars (customize your scoring logic)
        let stars = 1;
        if (elapsed < 30) stars = 3;
        else if (elapsed < 60) stars = 2;
        
        // Celebration effects
        if (window.AudioManager) {
            AudioManager.play('levelComplete');
        }
        if (window.ParticleSystem) {
            ParticleSystem.createFirework(window.innerWidth / 2, window.innerHeight / 2);
        }
        
        // Cleanup
        this.cleanupHandTracking();
        
        // Call completion callback with results
        this.onComplete({
            score: this.score,
            stars: stars,
            time: elapsed,
            completedItems: this.completedItems,
            totalItems: this.totalItems
        });
    }

    /**
     * Reset game state
     */
    reset() {
        this.isActive = false;
        this.isPaused = false;
        this.score = 0;
        this.startTime = null;
        this.totalItems = 0;
        this.completedItems = 0;
        
        // Cleanup hand tracking
        this.cleanupHandTracking();
    }

    /**
     * Pause the game
     */
    pause() {
        this.isPaused = true;
    }

    /**
     * Resume the game
     */
    resume() {
        this.isPaused = false;
    }

    // ==========================================
    // HAND TRACKING SUPPORT (Optional)
    // Remove these methods if you don't need gesture support
    // ==========================================

    /**
     * Setup hand tracking callbacks
     */
    setupHandTracking() {
        if (!window.HandTracking) return;
        
        this.handTrackingEnabled = true;
        
        HandTracking.on('onPinchStart', this.onHandPinchStart);
        HandTracking.on('onPinchEnd', this.onHandPinchEnd);
        HandTracking.on('onHandMove', this.onHandMove);
        
        // Auto-start hand tracking
        if (!HandTracking.enabled) {
            HandTracking.start();
        }
    }

    /**
     * Cleanup hand tracking callbacks
     */
    cleanupHandTracking() {
        if (!window.HandTracking) return;
        
        this.handTrackingEnabled = false;
        
        HandTracking.on('onPinchStart', null);
        HandTracking.on('onPinchEnd', null);
        HandTracking.on('onHandMove', null);
    }

    /**
     * Handle hand pinch start gesture
     */
    onHandPinchStart(position) {
        if (!this.isActive || this.isPaused) return;
        
        // Find element under hand
        const element = document.elementFromPoint(position.x, position.y);
        const item = element?.closest('.game-item');
        
        if (item) {
            // Trigger click behavior
            item.click();
        }
    }

    /**
     * Handle hand pinch end gesture
     */
    onHandPinchEnd(position) {
        // Override if needed for drop behavior
    }

    /**
     * Handle hand movement
     */
    onHandMove(position, isPinching) {
        if (!this.isActive || this.isPaused) return;
        
        // Optional: Add hover effects
        const element = document.elementFromPoint(position.x, position.y);
        const item = element?.closest('.game-item');
        
        // Remove previous hover states
        this.container?.querySelectorAll('.hand-hover').forEach(el => {
            el.classList.remove('hand-hover');
        });
        
        // Add hover state to current item
        if (item) {
            item.classList.add('hand-hover');
        }
    }

    /**
     * Get hint for current state
     * Optional: Implement if your game supports hints
     */
    getHint() {
        // Find an incomplete item and highlight it
        const incompleteItem = this.container?.querySelector('.game-item:not(.completed)');
        
        if (incompleteItem) {
            incompleteItem.classList.add('hint-highlight');
            setTimeout(() => {
                incompleteItem.classList.remove('hint-highlight');
            }, 2000);
            
            return incompleteItem;
        }
        
        return null;
    }
}

// ==========================================
// GAME REGISTRATION
// Update these values for your game
// ==========================================

// Make available globally (for backwards compatibility)
window.GameTemplate = GameTemplate;

// Register with GameRegistry
if (window.GameRegistry) {
    GameRegistry.register('template', GameTemplate, {
        name: 'Game Template',           // Display name
        description: 'A template game',   // Description
        icon: '🎮',                       // Emoji icon
        supportedWorlds: [],              // e.g., ['letters', 'colors']
        version: '1.0.0'
    });
}
