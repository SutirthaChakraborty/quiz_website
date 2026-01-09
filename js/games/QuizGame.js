/**
 * LexiQuest - Quiz Game
 * A simple multiple choice quiz game
 * 
 * EXAMPLE: This shows how to create a new game type.
 * To use this game, just add the script to index.html and it auto-registers!
 */

class QuizGame {
    constructor(options = {}) {
        this.container = options.container || document.getElementById('itemsContainer');
        this.dropZones = options.dropZones || document.getElementById('dropZones');
        this.onComplete = options.onComplete || (() => {});
        this.onScoreChange = options.onScoreChange || (() => {});
        this.onProgress = options.onProgress || (() => {});
        
        // Game state
        this.questions = [];
        this.currentIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.startTime = null;
        this.isActive = false;
        
        // Hand tracking
        this.lastHandOption = null;
        
        // Bind methods
        this.onHandPinchStart = this.onHandPinchStart.bind(this);
        this.onHandMove = this.onHandMove.bind(this);
    }

    /**
     * Initialize with quiz questions
     * @param {Array|Object} config - Array of questions or config object
     * 
     * Question format:
     * {
     *   question: "What letter is this?",
     *   display: "A",
     *   emoji: "🍎",
     *   options: ["A", "B", "C", "D"],
     *   correct: 0,  // Index of correct answer
     *   audio: "This is the letter A"
     * }
     */
    init(config) {
        this.reset();
        this.isActive = true;
        this.startTime = Date.now();
        
        // Parse config
        if (Array.isArray(config)) {
            this.questions = config;
        } else if (config.questions) {
            this.questions = config.questions;
        } else if (config.pairs) {
            // Convert pairs to quiz questions
            this.questions = this.pairsToQuestions(config.pairs);
        }
        
        if (this.questions.length === 0) {
            console.warn('[QuizGame] No questions provided');
            return;
        }
        
        // Hide drop zones (not needed for quiz)
        if (this.dropZones) {
            this.dropZones.style.display = 'none';
        }
        
        // Setup hand tracking
        this.setupHandTracking();
        
        // Show first question
        this.showQuestion(0);
        
        // Update progress
        this.onProgress(0, this.questions.length);
    }

    /**
     * Convert matching pairs to quiz questions
     */
    pairsToQuestions(pairs) {
        return pairs.map((pair, index) => {
            // Create wrong options from other pairs
            const wrongOptions = pairs
                .filter((_, i) => i !== index)
                .slice(0, 3)
                .map(p => p.display || p.item);
            
            const correctAnswer = pair.display || pair.item;
            const options = Helpers.shuffle([correctAnswer, ...wrongOptions]);
            
            return {
                question: pair.targetDisplay || pair.target || 'Match this:',
                display: pair.targetEmoji || pair.emoji || pair.target,
                emoji: pair.emoji,
                options: options,
                correct: options.indexOf(correctAnswer),
                audio: pair.audio || correctAnswer
            };
        });
    }

    /**
     * Show a question
     */
    showQuestion(index) {
        if (index >= this.questions.length) {
            this.handleGameComplete();
            return;
        }
        
        this.currentIndex = index;
        const question = this.questions[index];
        
        // Clear container
        this.container.innerHTML = '';
        this.container.className = 'quiz-game-container';
        
        // Question display
        const questionDiv = document.createElement('div');
        questionDiv.className = 'quiz-question';
        
        // Show emoji/image if available
        if (question.emoji) {
            questionDiv.innerHTML = `
                <div class="quiz-emoji">${question.emoji}</div>
                <div class="quiz-text">${question.question}</div>
            `;
        } else if (question.display) {
            questionDiv.innerHTML = `
                <div class="quiz-display">${question.display}</div>
                <div class="quiz-text">${question.question}</div>
            `;
        } else {
            questionDiv.innerHTML = `<div class="quiz-text">${question.question}</div>`;
        }
        
        this.container.appendChild(questionDiv);
        
        // Options grid
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'quiz-options';
        
        question.options.forEach((option, i) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option game-item';
            btn.dataset.index = i;
            btn.innerHTML = `<span class="option-text">${option}</span>`;
            
            btn.addEventListener('click', () => this.selectOption(i));
            
            optionsDiv.appendChild(btn);
        });
        
        this.container.appendChild(optionsDiv);
        
        // Speak the question
        if (window.SpeechManager) {
            SpeechManager.speakClear(question.question);
        }
    }

    /**
     * Handle option selection
     */
    selectOption(index) {
        if (!this.isActive) return;
        
        const question = this.questions[this.currentIndex];
        const options = this.container.querySelectorAll('.quiz-option');
        const selected = options[index];
        
        // Disable all options
        options.forEach(opt => opt.disabled = true);
        
        if (index === question.correct) {
            // Correct!
            selected.classList.add('correct');
            this.correctAnswers++;
            this.score += 100;
            
            this.onScoreChange(this.score, 100);
            
            if (window.AudioManager) {
                AudioManager.play('success');
            }
            if (window.SpeechManager) {
                SpeechManager.speak('Correct!');
            }
            if (window.ParticleSystem) {
                const rect = selected.getBoundingClientRect();
                ParticleSystem.celebrate(rect.left + rect.width/2, rect.top);
            }
        } else {
            // Wrong
            selected.classList.add('wrong');
            options[question.correct].classList.add('correct', 'show-correct');
            
            if (window.AudioManager) {
                AudioManager.play('error');
            }
            if (window.SpeechManager) {
                SpeechManager.speak('Try again next time!');
            }
        }
        
        // Update progress
        this.onProgress(this.currentIndex + 1, this.questions.length);
        
        // Next question after delay
        setTimeout(() => {
            if (this.currentIndex + 1 < this.questions.length) {
                this.showQuestion(this.currentIndex + 1);
            } else {
                this.handleGameComplete();
            }
        }, 1500);
    }

    /**
     * Handle game completion
     */
    handleGameComplete() {
        this.isActive = false;
        
        const elapsed = (Date.now() - this.startTime) / 1000;
        const accuracy = this.correctAnswers / this.questions.length;
        
        let stars = 1;
        if (accuracy >= 0.9) stars = 3;
        else if (accuracy >= 0.7) stars = 2;
        
        if (window.AudioManager) {
            AudioManager.play('levelComplete');
        }
        if (window.ParticleSystem) {
            ParticleSystem.createFirework(window.innerWidth / 2, window.innerHeight / 2);
        }
        
        this.cleanupHandTracking();
        
        this.onComplete({
            score: this.score,
            stars: stars,
            time: elapsed,
            accuracy: accuracy,
            correctAnswers: this.correctAnswers,
            totalQuestions: this.questions.length
        });
    }

    /**
     * Reset game
     */
    reset() {
        this.questions = [];
        this.currentIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.startTime = null;
        this.isActive = false;
        this.lastHandOption = null;
        
        this.cleanupHandTracking();
    }

    pause() {
        this.isActive = false;
    }

    resume() {
        this.isActive = true;
    }

    // Hand tracking support
    setupHandTracking() {
        if (!window.HandTracking) return;
        
        HandTracking.on('onPinchStart', this.onHandPinchStart);
        HandTracking.on('onHandMove', this.onHandMove);
        
        if (!HandTracking.enabled) {
            HandTracking.start();
        }
    }

    cleanupHandTracking() {
        if (!window.HandTracking) return;
        
        HandTracking.on('onPinchStart', null);
        HandTracking.on('onHandMove', null);
    }

    onHandPinchStart(position) {
        if (!this.isActive) return;
        
        const element = document.elementFromPoint(position.x, position.y);
        const option = element?.closest('.quiz-option');
        
        if (option && !option.disabled) {
            const index = parseInt(option.dataset.index);
            this.selectOption(index);
        }
    }

    onHandMove(position, isPinching) {
        if (!this.isActive) return;
        
        const element = document.elementFromPoint(position.x, position.y);
        const option = element?.closest('.quiz-option');
        
        // Remove previous hover
        if (this.lastHandOption && this.lastHandOption !== option) {
            this.lastHandOption.classList.remove('hand-hover');
        }
        
        // Add hover to current
        if (option && !option.disabled) {
            option.classList.add('hand-hover');
            this.lastHandOption = option;
        } else {
            this.lastHandOption = null;
        }
    }

    /**
     * Get hint - highlight correct answer briefly
     */
    getHint() {
        const question = this.questions[this.currentIndex];
        const options = this.container.querySelectorAll('.quiz-option');
        const correct = options[question.correct];
        
        if (correct) {
            correct.classList.add('hint-highlight');
            setTimeout(() => correct.classList.remove('hint-highlight'), 1500);
            
            if (window.AudioManager) {
                AudioManager.play('hint');
            }
        }
    }
}

// Export globally
window.QuizGame = QuizGame;

// Register with GameRegistry
if (window.GameRegistry) {
    GameRegistry.register('quiz', QuizGame, {
        name: 'Quiz Game',
        description: 'Multiple choice questions',
        icon: '❓',
        supportedWorlds: ['letters', 'colors', 'words', 'numbers'],
        version: '1.0.0'
    });
}
