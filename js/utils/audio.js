/**
 * LexiQuest - Audio Manager
 * Handles all game sounds and music using Howler.js and Web Audio API
 */

const AudioManager = {
    initialized: false,
    enabled: true,
    sounds: {},
    music: null,
    audioContext: null,

    /**
     * Initialize audio system
     */
    async init() {
        if (this.initialized) return Promise.resolve();

        try {
            // Create Web Audio context for procedural sounds
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Load enabled state from storage
            this.enabled = Storage.settings.load('soundEnabled', true);
            
            // Pre-generate common sounds
            this.generateSounds();
            
            this.initialized = true;
            console.log('AudioManager initialized');
        } catch (e) {
            console.warn('AudioManager initialization failed:', e);
        }
        
        return Promise.resolve();
    },

    /**
     * Set enabled state
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    },

    /**
     * Resume audio context (needed after user interaction)
     */
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    },

    /**
     * Generate procedural sounds
     */
    generateSounds() {
        // We'll use the Web Audio API to create sounds on the fly
        // This avoids loading external audio files
    },

    /**
     * Check if sound is enabled
     */
    isSoundEnabled() {
        return this.enabled;
    },

    /**
     * Check if music is enabled
     */
    isMusicEnabled() {
        return Storage.settings.load('musicEnabled', true);
    },

    /**
     * Play a tone using Web Audio API
     */
    playTone(frequency, duration = 0.2, type = 'sine', volume = 0.3) {
        if (!this.isSoundEnabled() || !this.audioContext) return;
        
        this.resume();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    },

    /**
     * Play a chord
     */
    playChord(frequencies, duration = 0.3, type = 'sine') {
        frequencies.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, duration, type, 0.2), i * 50);
        });
    },

    // ============ Game Sound Effects ============

    /**
     * Button click sound
     */
    playClick() {
        this.playTone(600, 0.1, 'sine', 0.2);
    },

    /**
     * Item pickup sound
     */
    playPickup() {
        this.playTone(400, 0.1, 'sine', 0.25);
        setTimeout(() => this.playTone(600, 0.1, 'sine', 0.2), 50);
    },

    /**
     * Item drop sound
     */
    playDrop() {
        this.playTone(300, 0.15, 'sine', 0.2);
    },

    /**
     * Correct answer sound - happy ascending melody
     */
    playCorrect() {
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((note, i) => {
            setTimeout(() => this.playTone(note, 0.15, 'sine', 0.3), i * 100);
        });
    },

    /**
     * Wrong answer sound - descending tone
     */
    playWrong() {
        this.playTone(200, 0.3, 'square', 0.2);
    },

    /**
     * Level complete celebration
     */
    playLevelComplete() {
        const melody = [
            { freq: 523.25, delay: 0 },     // C5
            { freq: 587.33, delay: 100 },   // D5
            { freq: 659.25, delay: 200 },   // E5
            { freq: 783.99, delay: 300 },   // G5
            { freq: 1046.50, delay: 500 }   // C6
        ];
        
        melody.forEach(note => {
            setTimeout(() => this.playTone(note.freq, 0.2, 'sine', 0.3), note.delay);
        });
    },

    /**
     * Achievement unlocked sound
     */
    playAchievement() {
        const notes = [392, 523.25, 659.25, 783.99, 1046.50]; // G4, C5, E5, G5, C6
        notes.forEach((note, i) => {
            setTimeout(() => this.playTone(note, 0.2, 'sine', 0.25), i * 80);
        });
    },

    /**
     * Level up sound
     */
    playLevelUp() {
        const arpeggio = [261.63, 329.63, 392, 523.25, 659.25, 783.99];
        arpeggio.forEach((note, i) => {
            setTimeout(() => this.playTone(note, 0.15, 'sine', 0.3), i * 60);
        });
    },

    /**
     * Coin collect sound
     */
    playCoin() {
        this.playTone(1318.51, 0.1, 'sine', 0.2); // E6
        setTimeout(() => this.playTone(1567.98, 0.15, 'sine', 0.2), 80); // G6
    },

    /**
     * Star earned sound
     */
    playStar() {
        this.playChord([783.99, 987.77, 1174.66], 0.3); // G5, B5, D6
    },

    /**
     * Hint used sound
     */
    playHint() {
        this.playTone(880, 0.1, 'triangle', 0.2);
        setTimeout(() => this.playTone(1108.73, 0.15, 'triangle', 0.2), 100);
    },

    /**
     * Timer warning sound
     */
    playTimerWarning() {
        this.playTone(440, 0.1, 'square', 0.15);
    },

    /**
     * Navigation sound
     */
    playNav() {
        this.playTone(500, 0.08, 'sine', 0.15);
    },

    /**
     * Error/invalid action sound
     */
    playError() {
        this.playTone(150, 0.2, 'sawtooth', 0.15);
    },

    /**
     * Hover sound (subtle)
     */
    playHover() {
        this.playTone(800, 0.05, 'sine', 0.1);
    },

    /**
     * Pop sound for animations
     */
    playPop() {
        this.playTone(1000, 0.08, 'sine', 0.2);
    },

    /**
     * Whoosh sound for transitions
     */
    playWhoosh() {
        const startFreq = 400;
        const endFreq = 800;
        const duration = 0.2;
        
        if (!this.isSoundEnabled() || !this.audioContext) return;
        this.resume();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration);

        filter.type = 'lowpass';
        filter.frequency.value = 2000;

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    },

    // ============ Background Music ============

    /**
     * Play background music
     * Note: For a real implementation, you'd load actual music files
     * This creates a simple ambient background
     */
    startBackgroundMusic() {
        if (!this.isMusicEnabled() || !this.audioContext) return;
        
        // For this demo, we won't implement full background music
        // In production, you'd use Howler.js with actual audio files
        console.log('Background music would start here');
    },

    /**
     * Stop background music
     */
    stopBackgroundMusic() {
        if (this.music) {
            this.music.stop();
        }
    },

    /**
     * Toggle background music
     */
    toggleMusic() {
        const enabled = Storage.toggleSetting('musicEnabled');
        if (enabled) {
            this.startBackgroundMusic();
        } else {
            this.stopBackgroundMusic();
        }
        return enabled;
    },

    /**
     * Toggle sound effects
     */
    toggleSound() {
        return Storage.toggleSetting('soundEnabled');
    },

    /**
     * Set master volume
     */
    setVolume(volume) {
        if (this.audioContext) {
            // Would set gain on a master gain node
        }
        if (this.music) {
            this.music.volume(volume);
        }
    },

    /**
     * Play a note by name
     */
    playNote(noteName) {
        const notes = {
            'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
            'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
            'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46,
            'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
            'C6': 1046.50
        };
        
        if (notes[noteName]) {
            this.playTone(notes[noteName], 0.3, 'sine', 0.3);
        }
    },

    /**
     * Generic play method - routes to specific sound methods
     */
    play(soundName) {
        if (!this.isSoundEnabled()) return;
        
        const soundMap = {
            'click': () => this.playClick(),
            'pickup': () => this.playPickup(),
            'drop': () => this.playDrop(),
            'correct': () => this.playCorrect(),
            'success': () => this.playCorrect(),
            'wrong': () => this.playWrong(),
            'error': () => this.playError(),
            'levelComplete': () => this.playLevelComplete(),
            'levelStart': () => this.playNav(),
            'achievement': () => this.playAchievement(),
            'levelUp': () => this.playLevelUp(),
            'coin': () => this.playCoin(),
            'star': () => this.playStar(),
            'hint': () => this.playHint(),
            'timer': () => this.playTimerWarning(),
            'nav': () => this.playNav(),
            'hover': () => this.playHover(),
            'pop': () => this.playPop(),
            'whoosh': () => this.playWhoosh()
        };
        
        const playFn = soundMap[soundName];
        if (playFn) {
            try {
                playFn();
            } catch (e) {
                console.warn('Audio play error:', e);
            }
        }
    }
};

// Make available globally
window.AudioManager = AudioManager;
