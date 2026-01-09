/**
 * LexiQuest - Speech Manager
 * Handles text-to-speech for dyslexia-friendly reading support
 */

const SpeechManager = {
    synth: null,
    utterance: null,
    speaking: false,
    voices: [],
    preferredVoice: null,
    enabled: true,
    rate: 0.9,

    /**
     * Initialize speech synthesis
     */
    async init() {
        if (!('speechSynthesis' in window)) {
            console.warn('Speech synthesis not supported');
            return Promise.resolve(false);
        }

        this.synth = window.speechSynthesis;
        this.enabled = Storage.settings.load('speechEnabled', true);
        this.rate = Storage.settings.load('speechRate', 0.9);
        
        // Load voices
        this.loadVoices();
        
        // Voices might load asynchronously
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => this.loadVoices();
        }

        console.log('SpeechManager initialized');
        return Promise.resolve(true);
    },

    /**
     * Load available voices
     */
    loadVoices() {
        this.voices = this.synth ? this.synth.getVoices() : [];
        
        // Find preferred voice (English, preferably child-friendly)
        this.preferredVoice = this.voices.find(v => 
            v.lang.startsWith('en') && 
            (v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Daniel'))
        ) || this.voices.find(v => v.lang.startsWith('en-US')) 
          || this.voices.find(v => v.lang.startsWith('en'))
          || this.voices[0];
    },

    /**
     * Check if voice is enabled
     */
    isEnabled() {
        return this.enabled;
    },

    /**
     * Get reading speed from settings
     */
    getSpeed() {
        return this.rate || 0.8;
    },

    /**
     * Speak text
     */
    speak(text, options = {}) {
        if (!this.synth || !this.isEnabled()) return;

        // Cancel any current speech
        this.stop();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set properties
        utterance.voice = options.voice || this.preferredVoice;
        utterance.rate = options.rate || this.getSpeed();
        utterance.pitch = options.pitch || 1.1; // Slightly higher pitch for friendliness
        utterance.volume = options.volume || 1;
        utterance.lang = options.lang || 'en-US';

        // Event handlers
        utterance.onstart = () => {
            this.speaking = true;
            if (options.onStart) options.onStart();
        };

        utterance.onend = () => {
            this.speaking = false;
            if (options.onEnd) options.onEnd();
        };

        utterance.onerror = (event) => {
            console.error('Speech error:', event);
            this.speaking = false;
            if (options.onError) options.onError(event);
        };

        utterance.onpause = () => {
            if (options.onPause) options.onPause();
        };

        utterance.onresume = () => {
            if (options.onResume) options.onResume();
        };

        this.utterance = utterance;
        this.synth.speak(utterance);
    },

    /**
     * Speak with emphasis (slower, clearer)
     */
    speakClear(text, options = {}) {
        this.speak(text, {
            ...options,
            rate: (options.rate || this.getSpeed()) * 0.8,
            pitch: 1.0
        });
    },

    /**
     * Speak a letter with its sound
     */
    speakLetter(letter) {
        const letterSounds = {
            'A': 'A says ah',
            'B': 'B says buh',
            'C': 'C says kuh',
            'D': 'D says duh',
            'E': 'E says eh',
            'F': 'F says fff',
            'G': 'G says guh',
            'H': 'H says huh',
            'I': 'I says ih',
            'J': 'J says juh',
            'K': 'K says kuh',
            'L': 'L says lll',
            'M': 'M says mmm',
            'N': 'N says nnn',
            'O': 'O says oh',
            'P': 'P says puh',
            'Q': 'Q says kwuh',
            'R': 'R says rrr',
            'S': 'S says sss',
            'T': 'T says tuh',
            'U': 'U says uh',
            'V': 'V says vvv',
            'W': 'W says wuh',
            'X': 'X says ks',
            'Y': 'Y says yuh',
            'Z': 'Z says zzz'
        };

        const sound = letterSounds[letter.toUpperCase()] || letter;
        this.speak(sound, { rate: 0.7 });
    },

    /**
     * Speak a word with phonetic breakdown
     */
    speakWord(word) {
        // First say the whole word, then spell it
        this.speak(word, {
            rate: 0.6,
            onEnd: () => {
                setTimeout(() => {
                    const spelled = word.split('').join(', ');
                    this.speak(spelled, { rate: 0.5 });
                }, 500);
            }
        });
    },

    /**
     * Speak a number
     */
    speakNumber(number) {
        this.speak(number.toString(), { rate: 0.8 });
    },

    /**
     * Speak a color
     */
    speakColor(colorName) {
        this.speak(colorName, { rate: 0.8 });
    },

    /**
     * Speak encouragement
     */
    speakEncouragement() {
        const phrases = [
            'Great job!',
            'Wonderful!',
            'You did it!',
            'Amazing!',
            'Fantastic!',
            'Well done!',
            'Super!',
            'Excellent!',
            'Perfect!',
            'Awesome!'
        ];
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        this.speak(phrase, { rate: 1.0, pitch: 1.2 });
    },

    /**
     * Speak try again
     */
    speakTryAgain() {
        const phrases = [
            'Try again!',
            'Almost there!',
            'Keep trying!',
            'You can do it!',
            'One more time!'
        ];
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        this.speak(phrase, { rate: 0.9, pitch: 1.0 });
    },

    /**
     * Speak a hint
     */
    speakHint(hint) {
        this.speak(hint, { rate: 0.7, pitch: 1.0 });
    },

    /**
     * Speak level intro
     */
    speakLevelIntro(levelName, instructions) {
        this.speak(`${levelName}. ${instructions}`, {
            rate: 0.8,
            pitch: 1.0
        });
    },

    /**
     * Speak story text
     */
    speakStory(text, onComplete) {
        this.speak(text, {
            rate: 0.75,
            pitch: 1.0,
            onEnd: onComplete
        });
    },

    /**
     * Stop speaking
     */
    stop() {
        if (this.synth) {
            this.synth.cancel();
            this.speaking = false;
        }
    },

    /**
     * Pause speaking
     */
    pause() {
        if (this.synth && this.speaking) {
            this.synth.pause();
        }
    },

    /**
     * Resume speaking
     */
    resume() {
        if (this.synth) {
            this.synth.resume();
        }
    },

    /**
     * Check if currently speaking
     */
    isSpeaking() {
        return this.speaking || (this.synth && this.synth.speaking);
    },

    /**
     * Get available voices
     */
    getVoices() {
        return this.voices;
    },

    /**
     * Set preferred voice by name
     */
    setVoice(voiceName) {
        const voice = this.voices.find(v => v.name === voiceName);
        if (voice) {
            this.preferredVoice = voice;
        }
    },

    /**
     * Toggle voice on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        Storage.settings.save('speechEnabled', this.enabled);
        if (!this.enabled) {
            this.stop();
        }
        return this.enabled;
    },

    /**
     * Set reading speed
     */
    setSpeed(speed) {
        this.rate = speed;
        Storage.settings.save('speechRate', speed);
    }
};

// Make available globally
window.SpeechManager = SpeechManager;
