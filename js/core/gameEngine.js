/**
 * LexiQuest - Game Engine
 * Core game loop and mechanics manager
 */

const GameEngine = {
    // State
    currentGame: null,
    isPaused: false,
    isGameActive: false,
    
    // Game data
    currentWorld: null,
    currentLevel: null,
    score: 0,
    timer: 0,
    timerInterval: null,
    matchesCompleted: 0,
    totalMatches: 0,
    attempts: 0,
    startTime: null,
    
    // Drag & Drop state
    draggedItem: null,
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    
    // Callbacks
    onGameComplete: null,
    onScoreUpdate: null,
    onProgressUpdate: null,

    /**
     * Initialize game engine
     */
    init() {
        this.setupEventListeners();
        console.log('GameEngine initialized');
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Pause button
        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pause());
        }

        // Resume button
        const resumeBtn = document.getElementById('resumeBtn');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => this.resume());
        }

        // Restart button
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restart());
        }

        // Quit button
        const quitBtn = document.getElementById('quitBtn');
        if (quitBtn) {
            quitBtn.addEventListener('click', () => this.quit());
        }

        // Power-up buttons
        const hintBtn = document.getElementById('hintBtn');
        if (hintBtn) {
            hintBtn.addEventListener('click', () => this.useHint());
        }

        const freezeBtn = document.getElementById('freezeBtn');
        if (freezeBtn) {
            freezeBtn.addEventListener('click', () => this.useFreeze());
        }

        const skipBtn = document.getElementById('skipBtn');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.useSkip());
        }

        // Hand tracking callbacks
        if (typeof HandTracking !== 'undefined') {
            HandTracking.on('onPinchStart', (pos) => this.handlePinchStart(pos));
            HandTracking.on('onPinchEnd', (pos) => this.handlePinchEnd(pos));
            HandTracking.on('onHandMove', (pos, pinching) => this.handleHandMove(pos, pinching));
        }
    },

    /**
     * Start a new game
     */
    startGame(world, level, gameInstance) {
        this.currentWorld = world;
        this.currentLevel = level;
        this.currentGame = gameInstance;
        
        // Reset state
        this.score = 0;
        this.timer = 0;
        this.matchesCompleted = 0;
        this.attempts = 0;
        this.isPaused = false;
        this.isGameActive = true;
        this.startTime = Date.now();
        
        // Update UI
        this.updateScore();
        this.updateTimer();
        this.updateProgress(0);
        this.updatePowerUpCounts();
        
        // Start timer
        this.startTimer();
        
        // Initialize the game
        if (this.currentGame) {
            this.currentGame.init();
            this.totalMatches = this.currentGame.getTotalMatches();
        }

        // Start hand tracking if enabled
        const settings = Storage.settings.load();
        if (settings && settings.handTrackingEnabled && typeof HandTracking !== 'undefined') {
            HandTracking.start();
        }

        console.log(`Game started: ${world} - Level ${level}`);
    },

    /**
     * Pause the game
     */
    pause() {
        if (!this.isGameActive || this.isPaused) return;
        
        this.isPaused = true;
        this.stopTimer();
        
        // Hide pause modal
        const pauseModal = document.getElementById('pauseModal');
        if (pauseModal) {
            pauseModal.classList.add('active');
        }

        AudioManager.play('click');
    },

    /**
     * Resume the game
     */
    resume() {
        if (!this.isPaused) return;
        
        this.isPaused = false;
        this.startTimer();
        
        // Hide pause modal
        const pauseModal = document.getElementById('pauseModal');
        if (pauseModal) {
            pauseModal.classList.remove('active');
        }

        AudioManager.play('click');
    },

    /**
     * Restart the current level
     */
    restart() {
        this.endGame();
        
        // Hide pause modal
        const pauseModal = document.getElementById('pauseModal');
        if (pauseModal) {
            pauseModal.classList.remove('active');
        }

        // Restart the game
        if (this.currentGame) {
            this.startGame(this.currentWorld, this.currentLevel, this.currentGame);
        }

        AudioManager.play('click');
    },

    /**
     * Quit to level selection
     */
    quit() {
        this.endGame();
        
        // Hide pause modal
        const pauseModal = document.getElementById('pauseModal');
        if (pauseModal) {
            pauseModal.classList.remove('active');
        }

        // Go back to level screen
        if (typeof ScreenManager !== 'undefined') {
            ScreenManager.showScreen('level');
        }
        
        AudioManager.play('click');
    },

    /**
     * End the current game
     */
    endGame() {
        this.isGameActive = false;
        this.stopTimer();
        
        // Stop hand tracking
        if (typeof HandTracking !== 'undefined') {
            HandTracking.stop();
        }

        if (this.currentGame) {
            this.currentGame.cleanup();
        }
    },

    /**
     * Complete the game successfully
     */
    completeGame() {
        this.isGameActive = false;
        this.stopTimer();

        const timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const accuracy = this.attempts > 0 ? Math.round((this.matchesCompleted / this.attempts) * 100) : 100;
        
        // Calculate stars (1-3 based on performance)
        const stars = this.calculateStars(accuracy, timeElapsed);
        
        // Calculate rewards
        const baseCoins = 10;
        const bonusCoins = stars * 15 + Math.floor(this.score / 10);
        const totalCoins = baseCoins + bonusCoins;
        const xpEarned = 20 + (stars * 10);

        // Save progress
        const result = Storage.progress.saveLevel(this.currentWorld, this.currentLevel, {
            completed: true,
            stars: stars,
            score: this.score
        });
        
        // Add rewards to player
        const player = Storage.player.load() || {};
        player.coins = (player.coins || 0) + totalCoins;
        player.xp = (player.xp || 0) + xpEarned;
        
        // Check for level up
        const xpNeeded = Progression.getXPToNextLevel(player.level || 1);
        let leveledUp = false;
        if (player.xp >= xpNeeded) {
            player.level = (player.level || 1) + 1;
            player.xp = player.xp - xpNeeded;
            leveledUp = true;
        }
        Storage.player.save(player);

        // Check achievements
        const newAchievements = [];

        // Play celebration
        AudioManager.play('levelComplete');
        ParticleSystem.celebrate();

        // Show result screen
        this.showResults({
            stars,
            score: this.score,
            time: timeElapsed,
            accuracy,
            coins: totalCoins,
            xp: xpEarned,
            leveledUp,
            newLevel: player.level,
            achievements: newAchievements
        });
    },

    /**
     * Calculate stars based on performance
     */
    calculateStars(accuracy, time) {
        let stars = 1;
        
        if (accuracy >= 90 && time < 60) {
            stars = 3;
        } else if (accuracy >= 70 && time < 90) {
            stars = 2;
        }
        
        return stars;
    },

    /**
     * Show results screen
     */
    showResults(results) {
        // Update result screen elements
        const resultTitle = document.getElementById('resultTitle');
        const resultSubtitle = document.getElementById('resultSubtitle');
        const resultScore = document.getElementById('resultScore');
        const resultTime = document.getElementById('resultTime');
        const resultAccuracy = document.getElementById('resultAccuracy');
        const rewardCoins = document.getElementById('rewardCoins');
        const rewardXP = document.getElementById('rewardXP');

        if (resultTitle) {
            const titles = {
                3: 'Perfect! ⭐⭐⭐',
                2: 'Great Job! ⭐⭐',
                1: 'Good Work! ⭐'
            };
            resultTitle.textContent = titles[results.stars];
        }

        if (resultSubtitle) {
            resultSubtitle.textContent = 'You completed the level!';
        }

        if (resultScore) resultScore.textContent = results.score;
        if (resultTime) resultTime.textContent = Helpers.formatTime(results.time);
        if (resultAccuracy) resultAccuracy.textContent = `${results.accuracy}%`;
        if (rewardCoins) rewardCoins.textContent = results.coins;
        if (rewardXP) rewardXP.textContent = results.xp;

        // Animate stars
        document.querySelectorAll('.result-stars .star').forEach((star, index) => {
            star.classList.remove('earned');
            if (index < results.stars) {
                setTimeout(() => {
                    star.classList.add('earned');
                    AudioManager.play('star');
                }, (index + 1) * 400);
            }
        });

        // Create confetti
        const confettiContainer = document.getElementById('confettiContainer');
        if (confettiContainer) {
            Helpers.createConfetti(confettiContainer, 80);
        }

        // Show result screen
        ScreenManager.showScreen('result');

        // Handle level up
        if (results.leveledUp) {
            setTimeout(() => this.showLevelUp(results.newLevel), 2000);
        }

        // Show achievements
        if (results.achievements && results.achievements.length > 0) {
            results.achievements.forEach((achievement, index) => {
                setTimeout(() => this.showAchievement(achievement), 3000 + index * 2000);
            });
        }
    },

    /**
     * Show level up popup
     */
    showLevelUp(newLevel) {
        const popup = document.getElementById('levelUpPopup');
        const levelDisplay = document.getElementById('newLevel');
        
        if (popup && levelDisplay) {
            levelDisplay.textContent = newLevel;
            popup.classList.add('active');
            AudioManager.play('levelUp');

            setTimeout(() => {
                popup.classList.remove('active');
            }, 3000);
        }
    },

    /**
     * Show achievement popup
     */
    showAchievement(achievement) {
        const popup = document.getElementById('achievementPopup');
        const nameDisplay = document.getElementById('achievementName');
        
        if (popup && nameDisplay) {
            nameDisplay.textContent = achievement.name;
            popup.classList.add('active');
            AudioManager.play('achievement');

            setTimeout(() => {
                popup.classList.remove('active');
            }, 3000);
        }
    },

    // ============ Timer ============

    /**
     * Start the game timer
     */
    startTimer() {
        this.timerInterval = setInterval(() => {
            if (!this.isPaused) {
                this.timer++;
                this.updateTimer();
            }
        }, 1000);
    },

    /**
     * Stop the timer
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },

    /**
     * Update timer display
     */
    updateTimer() {
        const timerDisplay = document.getElementById('gameTimer');
        if (timerDisplay) {
            timerDisplay.textContent = Helpers.formatTime(this.timer);
        }
    },

    // ============ Score & Progress ============

    /**
     * Add to score
     */
    addScore(points) {
        this.score += points;
        this.updateScore();
        
        // Animate score
        const scoreDisplay = document.getElementById('gameScore');
        if (scoreDisplay) {
            scoreDisplay.classList.add('animate-pop-in');
            setTimeout(() => scoreDisplay.classList.remove('animate-pop-in'), 400);
        }
    },

    /**
     * Update score display
     */
    updateScore() {
        const scoreDisplay = document.getElementById('gameScore');
        if (scoreDisplay) {
            scoreDisplay.textContent = this.score;
        }
    },

    /**
     * Update progress bar
     */
    updateProgress(percent) {
        const progressBar = document.getElementById('gameProgress');
        if (progressBar) {
            progressBar.style.width = `${percent}%`;
        }
    },

    /**
     * Record a match
     */
    recordMatch(correct) {
        this.attempts++;
        
        if (correct) {
            this.matchesCompleted++;
            this.addScore(10);
            AudioManager.play('success');
            SpeechManager.speakEncouragement();
            
            // Update progress
            const progress = (this.matchesCompleted / this.totalMatches) * 100;
            this.updateProgress(progress);
            
            // Check if game complete
            if (this.matchesCompleted >= this.totalMatches) {
                setTimeout(() => this.completeGame(), 1000);
            }
        } else {
            AudioManager.play('error');
            SpeechManager.speakTryAgain();
            Helpers.vibrate([50, 30, 50]);
        }
    },

    // ============ Power-ups ============

    /**
     * Update power-up button counts
     */
    updatePowerUpCounts() {
        const player = Storage.player.load() || {};
        
        const hintCount = document.getElementById('hintCount');
        const freezeCount = document.getElementById('freezeCount');
        const skipCount = document.getElementById('skipCount');

        if (hintCount) hintCount.textContent = player.hints || 0;
        if (freezeCount) freezeCount.textContent = player.freezes || 0;
        if (skipCount) skipCount.textContent = player.skips || 0;

        // Disable buttons if no uses left
        const hintBtn = document.getElementById('hintBtn');
        const freezeBtn = document.getElementById('freezeBtn');
        const skipBtn = document.getElementById('skipBtn');

        if (hintBtn) hintBtn.disabled = (player.hints || 0) <= 0;
        if (freezeBtn) freezeBtn.disabled = (player.freezes || 0) <= 0;
        if (skipBtn) skipBtn.disabled = (player.skips || 0) <= 0;
    },

    /**
     * Use hint power-up
     */
    useHint() {
        if (!this.isGameActive || this.isPaused) return;
        
        const player = Storage.player.load() || {};
        if ((player.hints || 0) > 0) {
            player.hints = (player.hints || 0) - 1;
            Storage.player.save(player);
            this.updatePowerUpCounts();
            
            if (this.currentGame && this.currentGame.showHint) {
                this.currentGame.showHint();
            }
            
            AudioManager.play('hint');
        }
    },

    /**
     * Use freeze power-up
     */
    useFreeze() {
        if (!this.isGameActive || this.isPaused) return;
        
        const player = Storage.player.load() || {};
        if ((player.freezes || 0) > 0) {
            player.freezes = (player.freezes || 0) - 1;
            Storage.player.save(player);
            this.updatePowerUpCounts();
            
            // Pause timer for 10 seconds
            this.isPaused = true;
            setTimeout(() => {
                this.isPaused = false;
            }, 10000);
            
            AudioManager.play('freeze');
        }
    },

    /**
     * Use skip power-up
     */
    useSkip() {
        if (!this.isGameActive || this.isPaused) return;
        
        const player = Storage.player.load() || {};
        if ((player.skips || 0) > 0) {
            player.skips = (player.skips || 0) - 1;
            Storage.player.save(player);
            this.updatePowerUpCounts();
            
            if (this.currentGame && this.currentGame.skipCurrent) {
                this.currentGame.skipCurrent();
            }
            
            AudioManager.play('whoosh');
        }
    },

    // ============ Drag & Drop Handling ============

    /**
     * Handle pinch start from hand tracking
     */
    handlePinchStart(position) {
        if (!this.isGameActive || this.isPaused) return;
        
        const elements = document.elementsFromPoint(position.x, position.y);
        const draggable = elements.find(el => 
            el.classList.contains('game-item') && 
            !el.classList.contains('matched')
        );

        if (draggable) {
            this.startDrag(draggable, position);
        }
    },

    /**
     * Handle pinch end from hand tracking
     */
    handlePinchEnd(position) {
        if (this.isDragging) {
            this.endDrag(position);
        }
    },

    /**
     * Handle hand movement
     */
    handleHandMove(position, isPinching) {
        if (this.isDragging && this.draggedItem) {
            this.updateDragPosition(position);
            this.highlightDropZones(position);
        }
    },

    /**
     * Start dragging an item
     */
    startDrag(element, position) {
        this.isDragging = true;
        this.draggedItem = element;
        
        const rect = element.getBoundingClientRect();
        this.dragOffset = {
            x: position.x - rect.left - rect.width / 2,
            y: position.y - rect.top - rect.height / 2
        };

        element.classList.add('dragging');
        
        // Speak the item value
        const value = element.dataset.value || element.textContent;
        SpeechManager.speak(value);
    },

    /**
     * Update position during drag
     */
    updateDragPosition(position) {
        if (!this.draggedItem) return;
        
        const rect = this.draggedItem.getBoundingClientRect();
        this.draggedItem.style.position = 'fixed';
        this.draggedItem.style.left = `${position.x - rect.width / 2}px`;
        this.draggedItem.style.top = `${position.y - rect.height / 2}px`;
        this.draggedItem.style.zIndex = '1000';
    },

    /**
     * Highlight drop zones
     */
    highlightDropZones(position) {
        const elements = document.elementsFromPoint(position.x, position.y);
        
        // Remove all highlights
        document.querySelectorAll('.drop-zone.highlight').forEach(zone => {
            zone.classList.remove('highlight');
        });

        // Add highlight to current zone
        const dropZone = elements.find(el => 
            el.classList.contains('drop-zone') && 
            !el.classList.contains('correct')
        );

        if (dropZone) {
            dropZone.classList.add('highlight');
        }
    },

    /**
     * End dragging
     */
    endDrag(position) {
        if (!this.draggedItem) return;

        const elements = document.elementsFromPoint(position.x, position.y);
        const dropZone = elements.find(el => 
            el.classList.contains('drop-zone') && 
            !el.classList.contains('correct')
        );

        // Remove highlights
        document.querySelectorAll('.drop-zone.highlight').forEach(zone => {
            zone.classList.remove('highlight');
        });

        if (dropZone) {
            // Check match
            const dragMatch = this.draggedItem.dataset.match;
            const dropMatch = dropZone.dataset.match;

            if (dragMatch === dropMatch) {
                this.handleCorrectDrop(dropZone);
            } else {
                this.handleIncorrectDrop(dropZone);
            }
        } else {
            // Reset item position
            this.resetDraggedItem();
        }

        this.isDragging = false;
        this.draggedItem = null;
    },

    /**
     * Handle correct drop
     */
    handleCorrectDrop(dropZone) {
        dropZone.classList.add('correct');
        dropZone.innerHTML = this.draggedItem.innerHTML;
        
        this.draggedItem.classList.add('matched');
        this.draggedItem.classList.remove('dragging');
        this.draggedItem.style.display = 'none';

        this.recordMatch(true);
        
        // Sparkle effect
        const rect = dropZone.getBoundingClientRect();
        ParticleSystem.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
    },

    /**
     * Handle incorrect drop
     */
    handleIncorrectDrop(dropZone) {
        dropZone.classList.add('incorrect');
        
        setTimeout(() => {
            dropZone.classList.remove('incorrect');
        }, 500);

        this.resetDraggedItem();
        this.recordMatch(false);
    },

    /**
     * Reset dragged item to original position
     */
    resetDraggedItem() {
        if (!this.draggedItem) return;
        
        this.draggedItem.classList.remove('dragging');
        this.draggedItem.style.position = '';
        this.draggedItem.style.left = '';
        this.draggedItem.style.top = '';
        this.draggedItem.style.zIndex = '';
    },

    /**
     * Setup mouse/touch drag for an element
     */
    setupDragEvents(element) {
        // Mouse events
        element.addEventListener('mousedown', (e) => this.onMouseDown(e));
        
        // Touch events
        element.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
    },

    /**
     * Mouse down handler
     */
    onMouseDown(e) {
        if (!this.isGameActive || this.isPaused) return;
        if (e.target.classList.contains('matched')) return;

        e.preventDefault();
        AudioManager.init();

        this.startDrag(e.target, { x: e.clientX, y: e.clientY });

        const onMouseMove = (e) => {
            this.updateDragPosition({ x: e.clientX, y: e.clientY });
            this.highlightDropZones({ x: e.clientX, y: e.clientY });
        };

        const onMouseUp = (e) => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            this.endDrag({ x: e.clientX, y: e.clientY });
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    },

    /**
     * Touch start handler
     */
    onTouchStart(e) {
        if (!this.isGameActive || this.isPaused) return;
        if (e.target.classList.contains('matched')) return;

        e.preventDefault();
        AudioManager.init();

        const touch = e.touches[0];
        this.startDrag(e.target, { x: touch.clientX, y: touch.clientY });

        const onTouchMove = (e) => {
            const touch = e.touches[0];
            this.updateDragPosition({ x: touch.clientX, y: touch.clientY });
            this.highlightDropZones({ x: touch.clientX, y: touch.clientY });
        };

        const onTouchEnd = (e) => {
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
            const touch = e.changedTouches[0];
            this.endDrag({ x: touch.clientX, y: touch.clientY });
        };

        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);
    }
};

// Make available globally
window.GameEngine = GameEngine;
