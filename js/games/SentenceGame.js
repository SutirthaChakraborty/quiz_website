/**
 * LexiQuest - Sentence Game (Story Ocean)
 * Simple word-order builder using the existing drag/drop mechanics.
 */

class SentenceGame {
    constructor(options = {}) {
        this.container = options.container || document.getElementById('itemsContainer');
        this.dropZones = options.dropZones || document.getElementById('dropZones');
        this.onComplete = options.onComplete || (() => {});
        this.onScoreChange = options.onScoreChange || (() => {});
        this.onProgress = options.onProgress || (() => {});

        this.words = [];
        this.correctOrder = [];
        this.score = 0;
        this.mistakes = 0;
        this.startTime = null;
        this.isActive = false;

        // Hand tracking state
        this.handGrabbedItem = null;
        this.handDragGhost = null;
        this.lastHandItem = null;

        // Bind
        this.onWordClick = this.onWordClick.bind(this);
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
     * Handle hand pinch start - grab word
     */
    onHandPinchStart(position) {
        if (!this.isActive) return;
        
        // Find word item under hand
        const element = document.elementFromPoint(position.x, position.y);
        const item = element?.closest('.game-item');
        
        if (item && !item.classList.contains('matched') && this.container.contains(item)) {
            this.handGrabbedItem = item;
            item.classList.add('dragging', 'hand-grabbed');
            
            // Create ghost for visual feedback
            this.createHandDragGhost(item, position.x, position.y);
            
            AudioManager.play('pickup');
            const word = item.dataset.word;
            if (word) {
                SpeechManager.speakClear(word);
            }
        }
    }

    /**
     * Handle hand pinch end - drop word or tap behavior
     */
    onHandPinchEnd(position) {
        if (!this.isActive) return;
        
        if (this.handGrabbedItem) {
            const item = this.handGrabbedItem;
            item.classList.remove('dragging', 'hand-grabbed');
            
            // Find zone under hand
            const element = document.elementFromPoint(position.x, position.y);
            const zone = element?.closest('.drop-zone');
            
            // Remove ghost
            this.removeHandDragGhost();
            
            // Clear drag-over states
            const zones = this.dropZones.querySelectorAll('.drop-zone');
            zones.forEach(z => z.classList.remove('drag-over'));
            
            if (zone && !zone.classList.contains('correct')) {
                this.tryPlaceWord(item, zone);
            } else {
                // No valid drop zone - treat as tap (select word in order)
                this.handleTapWord(item);
            }
            
            this.handGrabbedItem = null;
        }
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
            
            const zones = this.dropZones.querySelectorAll('.drop-zone');
            zones.forEach(z => z.classList.remove('drag-over'));
            if (zone && !zone.classList.contains('correct')) {
                zone.classList.add('drag-over');
            }
        } else if (!isPinching) {
            // Highlight items under hand when not pinching
            const element = document.elementFromPoint(position.x, position.y);
            const item = element?.closest('.game-item');
            
            if (this.lastHandItem && this.lastHandItem !== item) {
                this.lastHandItem.classList.remove('hand-hover');
            }
            
            if (item && !item.classList.contains('matched') && this.container.contains(item)) {
                item.classList.add('hand-hover');
                this.lastHandItem = item;
            } else {
                this.lastHandItem = null;
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

    init(config) {
        // config: { sentence: {words: []}, level: {...} }
        this.reset();
        this.isActive = true;
        this.startTime = Date.now();
        this.score = 0;

        const sentence = config?.sentence || { words: ['I', 'see', 'a', 'cat'] };
        this.correctOrder = sentence.words.filter(w => w !== '.' && w !== '?');

        // Tap-in-order state
        this.nextIndex = 0;

        // Layout: dropZones shows the sentence slots, items are tappable words
        this.container.innerHTML = '';
        this.dropZones.innerHTML = '';
        this.dropZones.style.display = 'flex';

        const shuffled = Helpers.shuffle([...this.correctOrder]);

        // Create zones (slots)
        this.correctOrder.forEach((expected, i) => {
            const zone = document.createElement('div');
            zone.className = 'drop-zone';
            zone.dataset.index = String(i);
            zone.dataset.expected = expected;
            zone.innerHTML = `<span class="zone-text">${i + 1}</span>`;

            // Highlight the next zone
            if (i === 0) zone.classList.add('highlight');

            // Optional: allow drag-drop fallback too
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                const word = e.dataTransfer.getData('text/plain');
                const item = this.container.querySelector(`.game-item[data-word="${CSS.escape(word)}"]:not(.matched)`);
                if (item) this.tryPlaceWord(item, zone);
            });
            zone.addEventListener('dragenter', (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });
            zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));

            this.dropZones.appendChild(zone);
        });

        // Create tappable word tiles
        shuffled.forEach((word) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'game-item draggable';
            item.draggable = true; // keep for fallback
            item.dataset.word = word;
            item.dataset.value = word;
            item.innerHTML = `<span class="item-text">${word}</span>`;

            // Tap behavior: must tap the next correct word
            item.addEventListener('click', () => this.handleTapWord(item));

            // Drag fallback
            item.addEventListener('dragstart', (e) => {
                if (!this.isActive || item.classList.contains('matched')) {
                    e.preventDefault();
                    return;
                }
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', word);
                AudioManager.play('pickup');
                SpeechManager.speakClear(word);
            });
            item.addEventListener('dragend', () => item.classList.remove('dragging'));

            this.container.appendChild(item);
        });

        // Setup hand tracking for gesture-based word selection
        this.setupHandTracking();

        this.onProgress(0, this.correctOrder.length);

        // Speak the goal sentence slowly (word by word)
        const levelNarration = config?.level?.narration || config?.level?.description;
        if (levelNarration) SpeechManager.speakStory(levelNarration);

        // Then read the target sentence slowly
        setTimeout(() => {
            const toRead = this.correctOrder.join(' ');
            SpeechManager.speakClear(toRead);
            this.speakNextPrompt();
        }, 1200);
    }

    speakNextPrompt() {
        if (!this.isActive) return;
        const next = this.correctOrder[this.nextIndex];
        if (!next) return;
        // Short, clear instruction
        SpeechManager.speakClear(`Tap ${next}`);
    }

    handleTapWord(item) {
        if (!this.isActive) return;
        if (!item || item.classList.contains('matched')) return;

        const word = item.dataset.word;
        const expected = this.correctOrder[this.nextIndex];

        // Speak tapped word
        SpeechManager.speakClear(word);

        if (word === expected) {
            // Place into next zone
            const zone = this.dropZones.querySelector(`.drop-zone[data-index="${this.nextIndex}"]`);
            if (zone) {
                this.tryPlaceWord(item, zone);
            }
        } else {
            // Wrong tap feedback
            this.mistakes += 1;
            AudioManager.play('error');
            SpeechManager.speakTryAgain();

            item.classList.add('incorrect');
            setTimeout(() => item.classList.remove('incorrect'), 350);

            // Repeat prompt
            setTimeout(() => this.speakNextPrompt(), 450);
        }
    }

    tryPlaceWord(item, zone) {
        if (!this.isActive) return;
        if (zone.classList.contains('correct')) return;

        zone.classList.remove('drag-over');

        const word = item.dataset.word;
        const expected = zone.dataset.expected;

        if (word === expected) {
            zone.classList.add('correct');
            zone.classList.remove('highlight');
            zone.innerHTML = `<span class="zone-text">${word}</span>`;

            item.classList.add('matched');
            item.style.display = 'none';

            this.score += 50;
            this.onScoreChange(this.score, 50);
            AudioManager.play('success');
            SpeechManager.speakEncouragement();

            // advance next index if this was the current slot
            const idx = Number(zone.dataset.index);
            if (idx === this.nextIndex) {
                this.nextIndex += 1;

                // highlight next zone
                const nextZone = this.dropZones.querySelector(`.drop-zone[data-index="${this.nextIndex}"]`);
                if (nextZone) nextZone.classList.add('highlight');

                if (this.nextIndex < this.correctOrder.length) {
                    setTimeout(() => this.speakNextPrompt(), 350);
                }
            }

            const correctCount = this.dropZones.querySelectorAll('.drop-zone.correct').length;
            this.onProgress(correctCount, this.correctOrder.length);

            if (correctCount >= this.correctOrder.length) {
                setTimeout(() => this.complete(), 500);
            }
        } else {
            this.mistakes += 1;
            AudioManager.play('error');
            SpeechManager.speakTryAgain();

            zone.classList.add('incorrect');
            setTimeout(() => zone.classList.remove('incorrect'), 400);
        }
    }

    complete() {
        this.isActive = false;
        const elapsed = (Date.now() - this.startTime) / 1000;
        const accuracy = 1 - (this.mistakes / (this.correctOrder.length + this.mistakes));

        let stars = 1;
        if (accuracy >= 0.9 && elapsed < 70) stars = 3;
        else if (accuracy >= 0.7) stars = 2;

        const finalScore = this.score + Math.max(0, Math.floor(200 - elapsed));

        AudioManager.play('levelComplete');
        ParticleSystem.createFirework(window.innerWidth / 2, window.innerHeight / 2);

        this.onComplete({
            score: finalScore,
            stars,
            time: elapsed,
            accuracy,
            mistakes: this.mistakes
        });
    }

    reset() {
        this.words = [];
        this.correctOrder = [];
        this.score = 0;
        this.mistakes = 0;
        this.startTime = null;
        this.isActive = false;
        this.nextIndex = 0;
        this.handGrabbedItem = null;
        this.lastHandItem = null;
        this.removeHandDragGhost();
        
        // Cleanup hand tracking
        this.cleanupHandTracking();
    }

    pause() {
        this.isActive = false;
    }

    resume() {
        this.isActive = true;
    }

    cleanup() {
        // No-op
    }

    getTotalMatches() {
        return this.correctOrder.length;
    }
}

window.SentenceGame = SentenceGame;
