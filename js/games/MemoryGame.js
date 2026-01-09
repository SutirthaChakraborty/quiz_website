/**
 * LexiQuest - Memory Game
 * Card matching memory game for learning
 */

class MemoryGame {
    constructor(options = {}) {
        this.container = options.container || document.getElementById('game-items-container');
        this.onComplete = options.onComplete || (() => {});
        this.onScoreChange = options.onScoreChange || (() => {});
        this.onProgress = options.onProgress || (() => {});
        
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.score = 0;
        this.moves = 0;
        this.startTime = null;
        this.isActive = false;
        this.isLocked = false; // Prevent clicking during animations
        
        // Hand tracking state
        this.lastHandCard = null;
        
        this.handleCardClick = this.handleCardClick.bind(this);
        this.onHandPinchStart = this.onHandPinchStart.bind(this);
        this.onHandMove = this.onHandMove.bind(this);
    }

    /**
     * Setup hand tracking for this game
     */
    setupHandTracking() {
        if (!window.HandTracking) return;
        
        HandTracking.on('onPinchStart', this.onHandPinchStart);
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
        HandTracking.on('onHandMove', null);
    }

    /**
     * Handle hand pinch - flip card
     */
    onHandPinchStart(position) {
        if (!this.isActive || this.isLocked) return;
        
        // Find card under hand
        const element = document.elementFromPoint(position.x, position.y);
        const card = element?.closest('.memory-card');
        
        if (card && !card.classList.contains('flipped') && !card.classList.contains('matched')) {
            // Find the card data
            const cardIndex = this.cards.indexOf(card);
            if (cardIndex !== -1) {
                const data = this.cardDataMap?.get(card);
                if (data) {
                    this.flipCard(card, data);
                } else {
                    // Fallback: trigger click
                    card.click();
                }
            }
        }
    }

    /**
     * Handle hand movement - highlight cards under hand
     */
    onHandMove(position, isPinching) {
        if (!this.isActive || this.isLocked) return;
        
        // Find card under hand
        const element = document.elementFromPoint(position.x, position.y);
        const card = element?.closest('.memory-card');
        
        // Remove highlight from previous card
        if (this.lastHandCard && this.lastHandCard !== card) {
            this.lastHandCard.classList.remove('hand-hover');
        }
        
        // Add highlight to current card
        if (card && !card.classList.contains('flipped') && !card.classList.contains('matched')) {
            card.classList.add('hand-hover');
            this.lastHandCard = card;
        } else {
            this.lastHandCard = null;
        }
    }

    /**
     * Initialize game with pairs
     * @param {Array} pairs - Array of {id, display, emoji, audio} objects
     */
    init(pairs) {
        this.reset();
        this.totalPairs = pairs.length;
        this.startTime = Date.now();
        this.isActive = true;
        
        // Store card data for hand tracking
        this.cardDataMap = new Map();

        // Clear container
        this.container.innerHTML = '';
        this.container.className = 'memory-game-grid';

        // Create two of each card
        const allCards = [];
        pairs.forEach((pair, index) => {
            // First card of pair
            allCards.push({
                ...pair,
                pairId: pair.id || `pair-${index}`,
                cardIndex: allCards.length
            });
            // Second card of pair
            allCards.push({
                ...pair,
                pairId: pair.id || `pair-${index}`,
                cardIndex: allCards.length
            });
        });

        // Shuffle cards
        const shuffledCards = Helpers.shuffle(allCards);

        // Create card elements
        shuffledCards.forEach((cardData, index) => {
            const card = this.createCard(cardData, index);
            this.container.appendChild(card);
            this.cards.push(card);
            
            // Store card data mapping for hand tracking
            this.cardDataMap.set(card, cardData);
        });

        // Update grid layout based on number of cards
        this.updateGridLayout();
        
        // Setup hand tracking for gesture-based card flipping
        this.setupHandTracking();
        
        // Update progress
        this.onProgress(0, this.totalPairs);
    }

    /**
     * Create a card element
     */
    createCard(data, index) {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.pairId = data.pairId;
        card.dataset.audio = data.audio || '';
        card.id = `card-${index}`;

        // Card inner (for flip animation)
        const inner = document.createElement('div');
        inner.className = 'memory-card-inner';

        // Card front (hidden side - shows question mark)
        const front = document.createElement('div');
        front.className = 'memory-card-front';
        front.innerHTML = '<span class="card-back-icon">❓</span>';

        // Card back (content side)
        const back = document.createElement('div');
        back.className = 'memory-card-back';
        
        if (data.emoji) {
            back.innerHTML = `<span class="card-emoji">${data.emoji}</span>`;
        } else if (data.color) {
            back.innerHTML = `<div class="color-swatch large" style="background-color: ${data.color}"></div>`;
        } else if (data.image) {
            back.innerHTML = `<img src="${data.image}" alt="" class="card-image">`;
        } else {
            back.innerHTML = `<span class="card-text">${data.display || data.id}</span>`;
        }
        
        if (data.display && !data.emoji && !data.color && !data.image) {
            // Already handled above
        } else if (data.display) {
            back.innerHTML += `<span class="card-label">${data.display}</span>`;
        }

        inner.appendChild(front);
        inner.appendChild(back);
        card.appendChild(inner);

        // Add click listener
        card.addEventListener('click', () => this.handleCardClick(card, data));

        return card;
    }

    /**
     * Update grid layout based on card count
     */
    updateGridLayout() {
        const count = this.cards.length;
        let columns = 4;
        
        if (count <= 6) columns = 3;
        else if (count <= 12) columns = 4;
        else if (count <= 20) columns = 5;
        else columns = 6;

        this.container.style.setProperty('--memory-columns', columns);
    }

    /**
     * Handle card click
     */
    handleCardClick(card, data) {
        // Ignore if game not active, card already flipped, or locked
        if (!this.isActive || this.isLocked || 
            card.classList.contains('flipped') || 
            card.classList.contains('matched')) {
            return;
        }

        // Flip card
        this.flipCard(card, data);
    }

    /**
     * Flip a card
     */
    flipCard(card, data) {
        card.classList.add('flipped');
        this.flippedCards.push({ card, data });
        
        // Play audio if available
        if (data.audio) {
            SpeechManager.speak(data.audio);
        }
        
        AudioManager.play('click');

        // Check for match when two cards are flipped
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.isLocked = true;
            
            setTimeout(() => this.checkMatch(), 800);
        }
    }

    /**
     * Check if flipped cards match
     */
    checkMatch() {
        const [first, second] = this.flippedCards;
        
        if (first.data.pairId === second.data.pairId) {
            // Match found!
            this.handleMatch(first.card, second.card);
        } else {
            // No match
            this.handleNoMatch(first.card, second.card);
        }
    }

    /**
     * Handle matching pair
     */
    handleMatch(card1, card2) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        this.matchedPairs++;
        
        // Calculate points
        const points = 100;
        this.score += points;
        
        // Visual feedback
        AudioManager.play('success');
        
        // Mini celebration
        const rect1 = card1.getBoundingClientRect();
        ParticleSystem.celebrate(rect1.left + rect1.width / 2, rect1.top);
        
        // Callbacks
        this.onScoreChange(this.score, points);
        this.onProgress(this.matchedPairs, this.totalPairs);
        
        // Reset state
        this.flippedCards = [];
        this.isLocked = false;
        
        // Check for completion
        if (this.matchedPairs >= this.totalPairs) {
            setTimeout(() => this.handleGameComplete(), 500);
        }
    }

    /**
     * Handle non-matching pair
     */
    handleNoMatch(card1, card2) {
        // Show wrong state briefly
        card1.classList.add('wrong');
        card2.classList.add('wrong');
        
        AudioManager.play('error');
        
        // Deduct points
        const penalty = 5;
        this.score = Math.max(0, this.score - penalty);
        this.onScoreChange(this.score, -penalty);
        
        // Flip cards back
        setTimeout(() => {
            card1.classList.remove('flipped', 'wrong');
            card2.classList.remove('flipped', 'wrong');
            this.flippedCards = [];
            this.isLocked = false;
        }, 500);
    }

    /**
     * Handle game completion
     */
    handleGameComplete() {
        this.isActive = false;
        
        // Calculate time
        const elapsed = (Date.now() - this.startTime) / 1000;
        
        // Calculate efficiency (fewer moves = better)
        const perfectMoves = this.totalPairs;
        const efficiency = perfectMoves / this.moves;
        
        // Time bonus
        const timeBonus = Math.max(0, Math.floor(300 - elapsed) * 2);
        
        // Stars based on performance
        let stars = 1;
        if (efficiency >= 0.8 && elapsed < 60) stars = 3;
        else if (efficiency >= 0.5 || elapsed < 90) stars = 2;
        
        // Final score
        const finalScore = this.score + timeBonus + Math.floor(efficiency * 100);
        
        // Celebration
        AudioManager.play('levelComplete');
        ParticleSystem.createFirework(window.innerWidth / 2, window.innerHeight / 2);
        
        this.onComplete({
            score: finalScore,
            stars: stars,
            time: elapsed,
            moves: this.moves,
            efficiency: efficiency,
            timeBonus: timeBonus
        });
    }

    /**
     * Reset game
     */
    reset() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.score = 0;
        this.moves = 0;
        this.startTime = null;
        this.isActive = false;
        this.isLocked = false;
        this.lastHandCard = null;
        this.cardDataMap = null;
        
        // Cleanup hand tracking
        this.cleanupHandTracking();
    }

    /**
     * Pause game
     */
    pause() {
        this.isActive = false;
    }

    /**
     * Resume game
     */
    resume() {
        this.isActive = true;
    }

    /**
     * Show all cards briefly (for learning)
     */
    showAllCards(duration = 2000) {
        this.isLocked = true;
        
        // Flip all cards
        this.cards.forEach(card => card.classList.add('flipped'));
        
        // Hide after duration
        setTimeout(() => {
            this.cards.forEach(card => {
                if (!card.classList.contains('matched')) {
                    card.classList.remove('flipped');
                }
            });
            this.isLocked = false;
        }, duration);
    }

    /**
     * Get hint - briefly show unmatched cards
     */
    getHint() {
        const unmatched = this.cards.filter(c => !c.classList.contains('matched'));
        if (unmatched.length < 2) return;
        
        // Find a matching pair
        const pairIds = [...new Set(unmatched.map(c => c.dataset.pairId))];
        if (pairIds.length === 0) return;
        
        const targetPairId = pairIds[0];
        const pairCards = unmatched.filter(c => c.dataset.pairId === targetPairId);
        
        if (pairCards.length >= 2) {
            // Briefly highlight the pair
            pairCards.forEach(card => {
                card.classList.add('hint-highlight');
                setTimeout(() => card.classList.remove('hint-highlight'), 1500);
            });
            
            AudioManager.play('hint');
        }
    }
}

// Export
window.MemoryGame = MemoryGame;
