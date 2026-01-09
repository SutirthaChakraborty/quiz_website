/**
 * LexiQuest - Matching Game
 * Core matching game logic for drag-and-drop matching activities
 */

class MatchingGame {
    constructor(options = {}) {
        this.container = options.container || document.getElementById('itemsContainer');
        this.dropZones = options.dropZones || document.getElementById('dropZones');
        this.onComplete = options.onComplete || (() => {});
        this.onScoreChange = options.onScoreChange || (() => {});
        this.onProgress = options.onProgress || (() => {});
        
        this.items = [];
        this.zones = [];
        this.matchedCount = 0;
        this.totalPairs = 0;
        this.score = 0;
        this.mistakes = 0;
        this.startTime = null;
        this.isActive = false;
        this.currentDragging = null;
        
        // Hand tracking state
        this.handGrabbedItem = null;
        this.handDragGhost = null;
        
        // Visual feedback
        this.feedbackTimeout = null;
        
        // Bind methods
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.handleDragOver = this.handleDragOver.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        
        // Hand tracking callbacks
        this.onHandPinchStart = this.onHandPinchStart.bind(this);
        this.onHandPinchEnd = this.onHandPinchEnd.bind(this);
        this.onHandMove = this.onHandMove.bind(this);
    }

    /**
     * Setup hand tracking for this game
     */
    setupHandTracking() {
        if (!window.HandTracking) return;
        
        HandTracking.on('onPinchStart', this.onHandPinchStart);
        HandTracking.on('onPinchEnd', this.onHandPinchEnd);
        HandTracking.on('onHandMove', this.onHandMove);
        
        // Auto-start hand tracking for the game
        if (!HandTracking.enabled) {
            HandTracking.start();
        }
    }

    /**
     * Cleanup hand tracking
     */
    cleanupHandTracking() {
        if (!window.HandTracking) return;
        
        HandTracking.on('onPinchStart', null);
        HandTracking.on('onPinchEnd', null);
        HandTracking.on('onHandMove', null);
    }

    /**
     * Handle hand pinch start - grab item
     */
    onHandPinchStart(position) {
        if (!this.isActive) return;
        
        // Find item under hand
        const element = document.elementFromPoint(position.x, position.y);
        const item = element?.closest('.game-item');
        
        if (item && !item.classList.contains('matched') && this.items.includes(item)) {
            this.handGrabbedItem = item;
            item.classList.add('dragging', 'hand-grabbed');
            
            // Create ghost for visual feedback
            this.createHandDragGhost(item, position.x, position.y);
            
            AudioManager.play('pickup');
            if (item.dataset.audio) {
                SpeechManager.speak(item.dataset.audio);
            }
        }
    }

    /**
     * Handle hand pinch end - drop item
     */
    onHandPinchEnd(position) {
        if (!this.isActive || !this.handGrabbedItem) return;
        
        const item = this.handGrabbedItem;
        item.classList.remove('dragging', 'hand-grabbed');
        
        // Find zone under hand
        const element = document.elementFromPoint(position.x, position.y);
        const zone = element?.closest('.drop-zone');
        
        // Remove ghost
        this.removeHandDragGhost();
        
        // Clear drag-over states
        this.zones.forEach(z => z.classList.remove('drag-over'));
        
        if (zone && !zone.classList.contains('matched')) {
            this.checkMatch(item, zone);
        }
        
        this.handGrabbedItem = null;
    }

    /**
     * Handle hand movement while pinching
     */
    onHandMove(position, isPinching) {
        if (!this.isActive) return;
        
        if (isPinching && this.handGrabbedItem && this.handDragGhost) {
            // Move the ghost
            this.handDragGhost.style.left = `${position.x - 40}px`;
            this.handDragGhost.style.top = `${position.y - 40}px`;
            
            // Highlight zone under hand
            const element = document.elementFromPoint(position.x, position.y);
            const zone = element?.closest('.drop-zone');
            
            this.zones.forEach(z => z.classList.remove('drag-over'));
            if (zone && !zone.classList.contains('matched')) {
                zone.classList.add('drag-over');
            }
        }
    }

    /**
     * Create ghost element for hand dragging
     */
    createHandDragGhost(item, x, y) {
        this.removeHandDragGhost();
        
        this.handDragGhost = item.cloneNode(true);
        this.handDragGhost.className = 'game-item drag-ghost hand-drag-ghost';
        this.handDragGhost.style.cssText = `
            position: fixed;
            left: ${x - 40}px;
            top: ${y - 40}px;
            z-index: 1000;
            pointer-events: none;
            opacity: 0.9;
            transform: scale(1.15);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            transition: none;
        `;
        document.body.appendChild(this.handDragGhost);
    }

    /**
     * Remove hand drag ghost
     */
    removeHandDragGhost() {
        if (this.handDragGhost) {
            this.handDragGhost.remove();
            this.handDragGhost = null;
        }
    }

    /**
     * Initialize the game with pairs
     * @param {Array} pairs - Array of {item, target, display, audio} objects
     */
    init(pairs) {
        if (!pairs || !pairs.length) {
            console.error('MatchingGame.init: No pairs provided!');
            return;
        }
        
        if (!this.container) {
            console.error('MatchingGame.init: Container is null!');
            return;
        }
        
        this.reset();
        this.items = [];
        this.zones = [];
        this.totalPairs = pairs.length;
        this.startTime = Date.now();
        this.isActive = true;

        // Clear containers
        this.container.innerHTML = '';
        this.dropZones.innerHTML = '';

        // Create drop zones first
        const shuffledTargets = Helpers.shuffle([...pairs]);
        shuffledTargets.forEach((pair, index) => {
            const zone = this.createDropZone(pair, index);
            this.dropZones.appendChild(zone);
            this.zones.push(zone);
        });

        // Create draggable items
        const shuffledItems = Helpers.shuffle([...pairs]);
        shuffledItems.forEach((pair, index) => {
            const item = this.createDraggableItem(pair, index);
            this.container.appendChild(item);
            this.items.push(item);
        });

        // Setup hand tracking for gesture-based drag and drop
        this.setupHandTracking();

        // Update progress
        this.onProgress(0, this.totalPairs);
    }

    /**
     * Create a draggable item element
     */
    createDraggableItem(pair, index) {
        const item = document.createElement('div');
        item.className = 'game-item draggable';
        item.dataset.matchId = pair.id || pair.item;
        item.dataset.value = pair.item;
        item.dataset.audio = pair.audio || '';
        item.draggable = true;
        item.id = `item-${index}-${Helpers.generateId()}`;

        // Create content based on type
        if (pair.emoji) {
            item.innerHTML = `
                <span class="item-emoji">${pair.emoji}</span>
                ${pair.display ? `<span class="item-text">${pair.display}</span>` : ''}
            `;
        } else if (pair.image) {
            item.innerHTML = `
                <img src="${pair.image}" alt="${pair.display || pair.item}" class="item-image">
                ${pair.display ? `<span class="item-text">${pair.display}</span>` : ''}
            `;
        } else if (pair.color) {
            item.innerHTML = `
                <div class="color-swatch" style="background-color: ${pair.color}"></div>
                ${pair.display ? `<span class="item-text">${pair.display}</span>` : ''}
            `;
        } else {
            item.innerHTML = `<span class="item-text">${pair.display || pair.item}</span>`;
        }

        // Add event listeners
        item.addEventListener('dragstart', this.handleDragStart);
        item.addEventListener('dragend', this.handleDragEnd);
        item.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        item.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        item.addEventListener('touchend', this.handleTouchEnd);

        // Click to hear audio
        item.addEventListener('click', (e) => {
            if (!item.classList.contains('matched') && pair.audio) {
                SpeechManager.speak(pair.audio);
            }
        });

        return item;
    }

    /**
     * Create a drop zone element
     */
    createDropZone(pair, index) {
        const zone = document.createElement('div');
        zone.className = 'drop-zone';
        zone.dataset.matchId = pair.id || pair.item;
        zone.dataset.target = pair.target || pair.item;
        zone.id = `zone-${index}-${Helpers.generateId()}`;

        // Create label based on type
        if (pair.targetEmoji) {
            zone.innerHTML = `
                <span class="zone-emoji">${pair.targetEmoji}</span>
                ${pair.targetDisplay ? `<span class="zone-text">${pair.targetDisplay}</span>` : ''}
            `;
        } else if (pair.targetImage) {
            zone.innerHTML = `
                <img src="${pair.targetImage}" alt="${pair.targetDisplay || pair.target}" class="zone-image">
                ${pair.targetDisplay ? `<span class="zone-text">${pair.targetDisplay}</span>` : ''}
            `;
        } else if (pair.targetColor) {
            zone.innerHTML = `
                <div class="color-swatch" style="background-color: ${pair.targetColor}"></div>
                ${pair.targetDisplay ? `<span class="zone-text">${pair.targetDisplay}</span>` : ''}
            `;
        } else {
            zone.innerHTML = `<span class="zone-text">${pair.targetDisplay || pair.target}</span>`;
        }

        // Add hint for audio
        if (pair.targetAudio) {
            zone.dataset.audio = pair.targetAudio;
            zone.addEventListener('click', () => {
                if (!zone.classList.contains('matched')) {
                    SpeechManager.speak(pair.targetAudio);
                }
            });
        }

        // Add drag event listeners
        zone.addEventListener('dragover', this.handleDragOver);
        zone.addEventListener('drop', this.handleDrop);
        zone.addEventListener('dragenter', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });
        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });

        return zone;
    }

    /**
     * Handle drag start
     */
    handleDragStart(e) {
        if (!this.isActive) return;
        
        const item = e.target.closest('.game-item');
        if (!item || item.classList.contains('matched')) {
            e.preventDefault();
            return;
        }

        this.currentDragging = item;
        item.classList.add('dragging');
        
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item.dataset.matchId);

        // Play pickup sound
        AudioManager.play('pickup');
    }

    /**
     * Handle drag end
     */
    handleDragEnd(e) {
        const item = e.target.closest('.game-item');
        if (item) {
            item.classList.remove('dragging');
        }
        
        // Remove all drag-over states
        this.zones.forEach(zone => zone.classList.remove('drag-over'));
        this.currentDragging = null;
    }

    /**
     * Handle drag over zone
     */
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    /**
     * Handle drop on zone
     */
    handleDrop(e) {
        e.preventDefault();
        
        const zone = e.target.closest('.drop-zone');
        if (!zone || zone.classList.contains('matched')) return;
        
        zone.classList.remove('drag-over');
        
        const matchId = e.dataTransfer.getData('text/plain');
        const item = this.items.find(i => i.dataset.matchId === matchId && !i.classList.contains('matched'));
        
        if (!item) return;

        this.checkMatch(item, zone);
    }

    /**
     * Touch event handlers for mobile
     */
    handleTouchStart(e) {
        if (!this.isActive) return;
        
        const item = e.target.closest('.game-item');
        if (!item || item.classList.contains('matched')) return;

        e.preventDefault();
        this.currentDragging = item;
        item.classList.add('dragging');

        const touch = e.touches[0];
        this.touchOffset = {
            x: touch.clientX - item.getBoundingClientRect().left,
            y: touch.clientY - item.getBoundingClientRect().top
        };

        // Create ghost element for dragging
        this.createDragGhost(item, touch.clientX, touch.clientY);
        
        AudioManager.play('pickup');
    }

    handleTouchMove(e) {
        if (!this.currentDragging || !this.isActive) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        
        if (this.dragGhost) {
            this.dragGhost.style.left = `${touch.clientX - this.touchOffset.x}px`;
            this.dragGhost.style.top = `${touch.clientY - this.touchOffset.y}px`;
        }

        // Check which zone we're over
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        const zone = elementBelow?.closest('.drop-zone');
        
        // Update drag-over states
        this.zones.forEach(z => z.classList.remove('drag-over'));
        if (zone && !zone.classList.contains('matched')) {
            zone.classList.add('drag-over');
        }
    }

    handleTouchEnd(e) {
        if (!this.currentDragging || !this.isActive) return;

        const item = this.currentDragging;
        item.classList.remove('dragging');

        // Find zone under touch point
        const touch = e.changedTouches[0];
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        const zone = elementBelow?.closest('.drop-zone');

        // Remove ghost
        this.removeDragGhost();
        
        // Clear states
        this.zones.forEach(z => z.classList.remove('drag-over'));

        if (zone && !zone.classList.contains('matched')) {
            this.checkMatch(item, zone);
        }

        this.currentDragging = null;
    }

    /**
     * Create drag ghost for touch dragging
     */
    createDragGhost(item, x, y) {
        this.dragGhost = item.cloneNode(true);
        this.dragGhost.className = 'game-item drag-ghost';
        this.dragGhost.style.cssText = `
            position: fixed;
            left: ${x - this.touchOffset.x}px;
            top: ${y - this.touchOffset.y}px;
            z-index: 1000;
            pointer-events: none;
            opacity: 0.9;
            transform: scale(1.1);
            box-shadow: var(--shadow-xl);
        `;
        document.body.appendChild(this.dragGhost);
    }

    /**
     * Remove drag ghost
     */
    removeDragGhost() {
        if (this.dragGhost) {
            this.dragGhost.remove();
            this.dragGhost = null;
        }
    }

    /**
     * Check if a match is correct
     */
    checkMatch(item, zone) {
        const itemId = item.dataset.matchId;
        const zoneId = zone.dataset.matchId;
        
        if (itemId === zoneId) {
            // Correct match!
            this.handleCorrectMatch(item, zone);
        } else {
            // Wrong match
            this.handleWrongMatch(item, zone);
        }
    }

    /**
     * Handle correct match
     */
    handleCorrectMatch(item, zone) {
        // Mark as matched
        item.classList.add('matched', 'correct');
        zone.classList.add('matched', 'correct');
        
        this.matchedCount++;
        
        // Calculate points (faster = more points)
        const basePoints = 100;
        const points = basePoints;
        this.score += points;
        
        // Visual feedback
        item.classList.add('bounce-in');
        zone.classList.add('pulse');
        
        // Audio and visual celebration
        AudioManager.play('success');
        SpeechManager.speak('Great job!', { interrupt: false });
        
        // Create mini celebration
        const rect = zone.getBoundingClientRect();
        ParticleSystem.celebrate(rect.left + rect.width / 2, rect.top + rect.height / 2);
        
        // Update callbacks
        this.onScoreChange(this.score, points);
        this.onProgress(this.matchedCount, this.totalPairs);
        
        // Check if complete
        if (this.matchedCount >= this.totalPairs) {
            setTimeout(() => this.handleGameComplete(), 500);
        }
    }

    /**
     * Handle wrong match
     */
    handleWrongMatch(item, zone) {
        this.mistakes++;
        
        // Visual feedback
        item.classList.add('shake', 'wrong');
        zone.classList.add('shake', 'wrong');
        
        // Audio feedback
        AudioManager.play('error');
        
        // Deduct points (minimum 0)
        const penalty = 10;
        this.score = Math.max(0, this.score - penalty);
        this.onScoreChange(this.score, -penalty);
        
        // Remove wrong class after animation
        setTimeout(() => {
            item.classList.remove('shake', 'wrong');
            zone.classList.remove('shake', 'wrong');
        }, 500);
    }

    /**
     * Handle game completion
     */
    handleGameComplete() {
        this.isActive = false;
        
        // Calculate time bonus
        const elapsed = (Date.now() - this.startTime) / 1000;
        const timeBonus = Math.max(0, Math.floor(300 - elapsed) * 2);
        
        // Calculate stars based on performance
        const accuracy = 1 - (this.mistakes / (this.totalPairs + this.mistakes));
        let stars = 1;
        if (accuracy >= 0.9 && elapsed < 60) stars = 3;
        else if (accuracy >= 0.7 || elapsed < 90) stars = 2;
        
        // Final score
        const finalScore = this.score + timeBonus;
        
        // Big celebration
        AudioManager.play('levelComplete');
        ParticleSystem.createFirework(window.innerWidth / 2, window.innerHeight / 2);
        
        this.onComplete({
            score: finalScore,
            stars: stars,
            time: elapsed,
            accuracy: accuracy,
            mistakes: this.mistakes,
            timeBonus: timeBonus
        });
    }

    /**
     * Reset game state
     */
    reset() {
        this.matchedCount = 0;
        this.score = 0;
        this.mistakes = 0;
        this.startTime = null;
        this.isActive = false;
        this.currentDragging = null;
        this.removeDragGhost();
        this.removeHandDragGhost();
        this.handGrabbedItem = null;
        
        // Cleanup hand tracking
        this.cleanupHandTracking();
        
        // Clean up event listeners
        this.items.forEach(item => {
            item.removeEventListener('dragstart', this.handleDragStart);
            item.removeEventListener('dragend', this.handleDragEnd);
        });
        
        this.items = [];
        this.zones = [];
    }

    /**
     * Pause the game
     */
    pause() {
        this.isActive = false;
    }

    /**
     * Resume the game
     */
    resume() {
        this.isActive = true;
    }

    /**
     * Get hint for current state
     */
    getHint() {
        // Find an unmatched item
        const unmatchedItem = this.items.find(i => !i.classList.contains('matched'));
        if (!unmatchedItem) return null;
        
        const matchId = unmatchedItem.dataset.matchId;
        const matchingZone = this.zones.find(z => z.dataset.matchId === matchId && !z.classList.contains('matched'));
        
        if (matchingZone) {
            // Highlight both
            unmatchedItem.classList.add('hint-highlight');
            matchingZone.classList.add('hint-highlight');
            
            setTimeout(() => {
                unmatchedItem.classList.remove('hint-highlight');
                matchingZone.classList.remove('hint-highlight');
            }, 2000);
            
            return { item: unmatchedItem, zone: matchingZone };
        }
        
        return null;
    }
}

// Export for use
window.MatchingGame = MatchingGame;

// Register with GameRegistry
if (window.GameRegistry) {
    GameRegistry.register('matching', MatchingGame, {
        name: 'Matching Game',
        description: 'Drag and drop items to match with their pairs',
        icon: '🎯',
        supportedWorlds: ['letters', 'colors', 'words', 'numbers'],
        version: '1.0.0'
    });
}
