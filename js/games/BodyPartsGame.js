/**
 * LexiQuest - Body Parts Learning Game
 * Uses MediaPipe Pose to teach body parts interactively
 * Children learn by touching/moving their own body parts
 */

class BodyPartsGame {
    constructor(options = {}) {
        this.options = options;
        this.container = options.container || document.getElementById('gameContainer');
        this.onComplete = options.onComplete || (() => {});
        this.onScoreChange = options.onScoreChange || (() => {});
        this.onProgress = options.onProgress || (() => {});
        
        console.log('BodyPartsGame constructor - container:', this.container);
        
        // Pose detection
        this.pose = null;
        this.camera = null;
        this.videoElement = null;
        this.canvasElement = null;
        this.canvasCtx = null;
        this.initialized = false;
        this.enabled = false;
        
        // Game state
        this.currentBodyPart = null;
        this.currentIndex = 0;
        this.score = 0;
        this.totalParts = 0;
        this.correctAnswers = 0;
        this.isWaitingForPose = false;
        this.detectionTimeout = null;
        this.successHoldTime = 0;
        this.requiredHoldTime = 1500; // Hold for 1.5 seconds
        
        // Body parts data with landmark indices
        this.bodyParts = [
            { name: 'head', displayName: 'Head', landmarks: [0], emoji: '🧠', instruction: 'Touch your head!' },
            { name: 'nose', displayName: 'Nose', landmarks: [0], emoji: '👃', instruction: 'Touch your nose!' },
            { name: 'left_eye', displayName: 'Left Eye', landmarks: [2], emoji: '👁️', instruction: 'Point to your left eye!' },
            { name: 'right_eye', displayName: 'Right Eye', landmarks: [5], emoji: '👁️', instruction: 'Point to your right eye!' },
            { name: 'left_ear', displayName: 'Left Ear', landmarks: [7], emoji: '👂', instruction: 'Touch your left ear!' },
            { name: 'right_ear', displayName: 'Right Ear', landmarks: [8], emoji: '👂', instruction: 'Touch your right ear!' },
            { name: 'left_shoulder', displayName: 'Left Shoulder', landmarks: [11], emoji: '💪', instruction: 'Touch your left shoulder!' },
            { name: 'right_shoulder', displayName: 'Right Shoulder', landmarks: [12], emoji: '💪', instruction: 'Touch your right shoulder!' },
            { name: 'left_elbow', displayName: 'Left Elbow', landmarks: [13], emoji: '🦾', instruction: 'Touch your left elbow!' },
            { name: 'right_elbow', displayName: 'Right Elbow', landmarks: [14], emoji: '🦾', instruction: 'Touch your right elbow!' },
            { name: 'left_wrist', displayName: 'Left Wrist', landmarks: [15], emoji: '⌚', instruction: 'Show your left wrist!' },
            { name: 'right_wrist', displayName: 'Right Wrist', landmarks: [16], emoji: '⌚', instruction: 'Show your right wrist!' },
            { name: 'left_hip', displayName: 'Left Hip', landmarks: [23], emoji: '🦵', instruction: 'Touch your left hip!' },
            { name: 'right_hip', displayName: 'Right Hip', landmarks: [24], emoji: '🦵', instruction: 'Touch your right hip!' },
            { name: 'left_knee', displayName: 'Left Knee', landmarks: [25], emoji: '🦵', instruction: 'Touch your left knee!' },
            { name: 'right_knee', displayName: 'Right Knee', landmarks: [26], emoji: '🦵', instruction: 'Touch your right knee!' },
        ];
        
        // Shuffle and select subset for game
        this.gameParts = [];
        this.difficulty = options.difficulty || 'easy';
    }
    
    /**
     * Initialize the game
     */
    async init() {
        console.log('BodyPartsGame: Initializing...');
        console.log('BodyPartsGame: Container is:', this.container);
        
        // Check for valid container
        if (!this.container) {
            console.error('BodyPartsGame: No container element found!');
            this.container = document.getElementById('gameContainer');
            if (!this.container) {
                console.error('BodyPartsGame: Could not find gameContainer either!');
                return false;
            }
        }
        
        // Check for secure context
        if (!window.isSecureContext) {
            this.showError('Camera requires HTTPS or localhost');
            return false;
        }
        
        // Check if MediaPipe Pose is available
        if (typeof Pose === 'undefined') {
            console.warn('MediaPipe Pose not loaded, loading now...');
            await this.loadPoseScript();
        }
        
        // Setup game parts based on difficulty
        this.setupGameParts();
        
        // Create game UI
        this.createGameUI();
        
        // Initialize pose detection
        const success = await this.initPoseDetection();
        if (!success) {
            this.showError('Could not start camera for pose detection');
            return false;
        }
        
        this.initialized = true;
        return true;
    }
    
    /**
     * Load MediaPipe Pose script dynamically
     */
    async loadPoseScript() {
        return new Promise((resolve, reject) => {
            if (typeof Pose !== 'undefined') {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js';
            script.crossOrigin = 'anonymous';
            script.onload = () => {
                console.log('MediaPipe Pose loaded');
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    /**
     * Setup game parts based on difficulty
     */
    setupGameParts() {
        let partCount;
        let availableParts;
        
        switch (this.difficulty) {
            case 'easy':
                // Simple body parts for young kids
                availableParts = this.bodyParts.filter(p => 
                    ['head', 'nose', 'left_shoulder', 'right_shoulder', 'left_knee', 'right_knee'].includes(p.name)
                );
                partCount = 4;
                break;
            case 'medium':
                availableParts = this.bodyParts.filter(p => 
                    !p.name.includes('hip')
                );
                partCount = 6;
                break;
            case 'hard':
                availableParts = [...this.bodyParts];
                partCount = 8;
                break;
            default:
                availableParts = this.bodyParts.slice(0, 6);
                partCount = 4;
        }
        
        // Shuffle and select
        this.gameParts = this.shuffleArray(availableParts).slice(0, partCount);
        this.totalParts = this.gameParts.length;
    }
    
    /**
     * Shuffle array
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    /**
     * Create game UI
     */
    createGameUI() {
        this.container.innerHTML = `
            <div class="body-parts-game">
                <div class="pose-camera-container">
                    <video id="poseVideo" autoplay playsinline muted></video>
                    <canvas id="poseCanvas"></canvas>
                    <div class="pose-overlay">
                        <div class="target-indicator" id="targetIndicator"></div>
                    </div>
                </div>
                
                <div class="game-instruction-panel">
                    <div class="body-part-display">
                        <span class="body-part-emoji" id="bodyPartEmoji">🧠</span>
                        <h2 class="body-part-name" id="bodyPartName">Get Ready!</h2>
                    </div>
                    <p class="instruction-text" id="instructionText">Stand in front of the camera so I can see you!</p>
                    <div class="progress-bar-container">
                        <div class="progress-bar" id="holdProgress" style="width: 0%"></div>
                    </div>
                    <p class="hint-text" id="hintText">Hold the pose for a moment...</p>
                </div>
                
                <div class="game-stats">
                    <div class="stat-item">
                        <span class="stat-label">Score</span>
                        <span class="stat-value" id="gameScore">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Progress</span>
                        <span class="stat-value" id="gameProgress">0/${this.totalParts}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles
        this.addStyles();
        
        // Get references
        this.videoElement = document.getElementById('poseVideo');
        this.canvasElement = document.getElementById('poseCanvas');
        this.canvasCtx = this.canvasElement.getContext('2d');
    }
    
    /**
     * Add game-specific styles
     */
    addStyles() {
        if (document.getElementById('bodyPartsGameStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'bodyPartsGameStyles';
        styles.textContent = `
            .body-parts-game {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
                padding: 20px;
                height: 100%;
            }
            
            .pose-camera-container {
                position: relative;
                width: 100%;
                max-width: 640px;
                aspect-ratio: 4/3;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                background: #000;
            }
            
            .pose-camera-container video,
            .pose-camera-container canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                transform: scaleX(-1);
            }
            
            .pose-camera-container canvas {
                pointer-events: none;
            }
            
            .pose-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
            }
            
            .target-indicator {
                position: absolute;
                width: 80px;
                height: 80px;
                border: 4px solid #55efc4;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                opacity: 0;
                transition: opacity 0.3s;
                box-shadow: 0 0 20px rgba(85, 239, 196, 0.5);
                animation: pulse-ring 1.5s infinite;
            }
            
            .target-indicator.active {
                opacity: 1;
            }
            
            .target-indicator.success {
                border-color: #00b894;
                background: rgba(0, 184, 148, 0.3);
            }
            
            @keyframes pulse-ring {
                0% { transform: translate(-50%, -50%) scale(1); }
                50% { transform: translate(-50%, -50%) scale(1.1); }
                100% { transform: translate(-50%, -50%) scale(1); }
            }
            
            .game-instruction-panel {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 30px;
                border-radius: 20px;
                text-align: center;
                color: white;
                width: 100%;
                max-width: 500px;
                box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
            }
            
            .body-part-display {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
                margin-bottom: 15px;
            }
            
            .body-part-emoji {
                font-size: 3rem;
                animation: bounce 1s infinite;
            }
            
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            
            .body-part-name {
                font-size: 2rem;
                margin: 0;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
            }
            
            .instruction-text {
                font-size: 1.3rem;
                margin: 10px 0;
                opacity: 0.9;
            }
            
            .progress-bar-container {
                background: rgba(255,255,255,0.3);
                border-radius: 10px;
                height: 15px;
                overflow: hidden;
                margin: 15px 0;
            }
            
            .progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #55efc4, #00b894);
                border-radius: 10px;
                transition: width 0.1s linear;
            }
            
            .hint-text {
                font-size: 0.9rem;
                opacity: 0.7;
                margin: 0;
            }
            
            .game-stats {
                display: flex;
                gap: 30px;
            }
            
            .stat-item {
                background: white;
                padding: 15px 25px;
                border-radius: 15px;
                text-align: center;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            
            .stat-label {
                display: block;
                font-size: 0.9rem;
                color: #666;
                margin-bottom: 5px;
            }
            
            .stat-value {
                display: block;
                font-size: 1.5rem;
                font-weight: bold;
                color: #667eea;
            }
            
            .error-message {
                background: #ff7675;
                color: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
            }
        `;
        document.head.appendChild(styles);
    }
    
    /**
     * Initialize pose detection
     */
    async initPoseDetection() {
        try {
            // Request camera access
            console.log('Requesting camera for pose detection...');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });
            
            this.videoElement.srcObject = stream;
            
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    this.canvasElement.width = this.videoElement.videoWidth;
                    this.canvasElement.height = this.videoElement.videoHeight;
                    resolve();
                };
            });
            
            await this.videoElement.play();
            
            // Initialize MediaPipe Pose
            this.pose = new Pose({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
                }
            });
            
            this.pose.setOptions({
                modelComplexity: 1,
                smoothLandmarks: true,
                enableSegmentation: false,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });
            
            this.pose.onResults((results) => this.onPoseResults(results));
            
            this.enabled = true;
            this.detectLoop();
            
            console.log('Pose detection initialized successfully');
            return true;
            
        } catch (error) {
            console.error('Error initializing pose detection:', error);
            return false;
        }
    }
    
    /**
     * Detection loop
     */
    async detectLoop() {
        if (!this.enabled) return;
        
        if (this.videoElement.readyState >= 2) {
            await this.pose.send({ image: this.videoElement });
        }
        
        requestAnimationFrame(() => this.detectLoop());
    }
    
    /**
     * Handle pose detection results
     */
    onPoseResults(results) {
        // Clear canvas
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        
        if (results.poseLandmarks) {
            // Draw pose skeleton
            this.drawPoseSkeleton(results.poseLandmarks);
            
            // Check if current body part is being touched/shown
            if (this.isWaitingForPose && this.currentBodyPart) {
                this.checkBodyPartPose(results.poseLandmarks);
            }
        }
    }
    
    /**
     * Draw pose skeleton on canvas
     */
    drawPoseSkeleton(landmarks) {
        const connections = [
            // Face
            [0, 1], [1, 2], [2, 3], [3, 7],
            [0, 4], [4, 5], [5, 6], [6, 8],
            // Torso
            [11, 12], [11, 23], [12, 24], [23, 24],
            // Left arm
            [11, 13], [13, 15],
            // Right arm
            [12, 14], [14, 16],
            // Left leg
            [23, 25], [25, 27],
            // Right leg
            [24, 26], [26, 28]
        ];
        
        // Draw connections
        this.canvasCtx.strokeStyle = '#74b9ff';
        this.canvasCtx.lineWidth = 3;
        
        connections.forEach(([i, j]) => {
            const p1 = landmarks[i];
            const p2 = landmarks[j];
            if (p1.visibility > 0.5 && p2.visibility > 0.5) {
                this.canvasCtx.beginPath();
                this.canvasCtx.moveTo(p1.x * this.canvasElement.width, p1.y * this.canvasElement.height);
                this.canvasCtx.lineTo(p2.x * this.canvasElement.width, p2.y * this.canvasElement.height);
                this.canvasCtx.stroke();
            }
        });
        
        // Draw landmarks
        landmarks.forEach((landmark, index) => {
            if (landmark.visibility > 0.5) {
                // Highlight current target body part
                const isTarget = this.currentBodyPart && 
                    this.currentBodyPart.landmarks.includes(index);
                
                this.canvasCtx.beginPath();
                this.canvasCtx.arc(
                    landmark.x * this.canvasElement.width,
                    landmark.y * this.canvasElement.height,
                    isTarget ? 12 : 6,
                    0, Math.PI * 2
                );
                this.canvasCtx.fillStyle = isTarget ? '#55efc4' : '#dfe6e9';
                this.canvasCtx.fill();
                
                if (isTarget) {
                    this.canvasCtx.strokeStyle = '#00b894';
                    this.canvasCtx.lineWidth = 3;
                    this.canvasCtx.stroke();
                }
            }
        });
    }
    
    /**
     * Check if user is touching/showing the target body part
     */
    checkBodyPartPose(landmarks) {
        const targetLandmarkIndex = this.currentBodyPart.landmarks[0];
        const targetLandmark = landmarks[targetLandmarkIndex];
        
        if (!targetLandmark || targetLandmark.visibility < 0.5) {
            this.resetHoldProgress();
            return;
        }
        
        // Get hand positions (wrists)
        const leftWrist = landmarks[15];
        const rightWrist = landmarks[16];
        
        // Calculate distance from hands to target
        const distanceThreshold = 0.15; // Normalized distance threshold
        
        let isTouching = false;
        
        // Check if either hand is near the target body part
        if (leftWrist && leftWrist.visibility > 0.5) {
            const dist = this.calculateDistance(leftWrist, targetLandmark);
            if (dist < distanceThreshold) {
                isTouching = true;
            }
        }
        
        if (rightWrist && rightWrist.visibility > 0.5) {
            const dist = this.calculateDistance(rightWrist, targetLandmark);
            if (dist < distanceThreshold) {
                isTouching = true;
            }
        }
        
        // For head/face parts, check if hands are raised to head level
        if (['head', 'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear'].includes(this.currentBodyPart.name)) {
            const nose = landmarks[0];
            if (nose && nose.visibility > 0.5) {
                if ((leftWrist && leftWrist.y < nose.y + 0.1) || 
                    (rightWrist && rightWrist.y < nose.y + 0.1)) {
                    const handNearHead = this.calculateDistance(leftWrist || rightWrist, targetLandmark);
                    if (handNearHead < 0.2) {
                        isTouching = true;
                    }
                }
            }
        }
        
        if (isTouching) {
            this.updateHoldProgress();
        } else {
            this.resetHoldProgress();
        }
    }
    
    /**
     * Calculate distance between two landmarks
     */
    calculateDistance(p1, p2) {
        if (!p1 || !p2) return Infinity;
        return Math.sqrt(
            Math.pow(p1.x - p2.x, 2) + 
            Math.pow(p1.y - p2.y, 2)
        );
    }
    
    /**
     * Update hold progress
     */
    updateHoldProgress() {
        this.successHoldTime += 50; // Approximate frame time
        
        const progress = Math.min(100, (this.successHoldTime / this.requiredHoldTime) * 100);
        const progressBar = document.getElementById('holdProgress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        const hintText = document.getElementById('hintText');
        if (hintText) {
            hintText.textContent = 'Great! Keep holding...';
        }
        
        if (this.successHoldTime >= this.requiredHoldTime) {
            this.onCorrectAnswer();
        }
    }
    
    /**
     * Reset hold progress
     */
    resetHoldProgress() {
        this.successHoldTime = 0;
        const progressBar = document.getElementById('holdProgress');
        if (progressBar) {
            progressBar.style.width = '0%';
        }
        
        const hintText = document.getElementById('hintText');
        if (hintText) {
            hintText.textContent = 'Hold the pose for a moment...';
        }
    }
    
    /**
     * Start the game
     */
    async start() {
        const success = await this.init();
        if (!success) {
            console.error('Failed to initialize BodyPartsGame');
            return;
        }
        
        // Wait a moment for user to get ready
        setTimeout(() => {
            this.nextBodyPart();
        }, 2000);
    }
    
    /**
     * Show next body part to identify
     */
    nextBodyPart() {
        if (this.currentIndex >= this.gameParts.length) {
            this.endGame();
            return;
        }
        
        this.currentBodyPart = this.gameParts[this.currentIndex];
        this.isWaitingForPose = true;
        this.successHoldTime = 0;
        
        // Update UI
        const emoji = document.getElementById('bodyPartEmoji');
        const name = document.getElementById('bodyPartName');
        const instruction = document.getElementById('instructionText');
        const progress = document.getElementById('gameProgress');
        
        if (emoji) emoji.textContent = this.currentBodyPart.emoji;
        if (name) name.textContent = this.currentBodyPart.displayName;
        if (instruction) instruction.textContent = this.currentBodyPart.instruction;
        if (progress) progress.textContent = `${this.currentIndex + 1}/${this.totalParts}`;
        
        // Speak the instruction
        if (window.SpeechManager) {
            SpeechManager.speakClear(this.currentBodyPart.instruction);
        }
        
        this.onProgress(this.currentIndex + 1, this.totalParts);
    }
    
    /**
     * Handle correct answer
     */
    onCorrectAnswer() {
        this.isWaitingForPose = false;
        this.correctAnswers++;
        this.score += 100;
        this.currentIndex++;
        
        // Update score display
        const scoreEl = document.getElementById('gameScore');
        if (scoreEl) {
            scoreEl.textContent = this.score;
        }
        
        // Play success feedback
        if (window.AudioManager) {
            AudioManager.play('correct');
        }
        
        // Show success message
        const instruction = document.getElementById('instructionText');
        if (instruction) {
            instruction.textContent = '🎉 Excellent! You found your ' + this.currentBodyPart.displayName + '!';
        }
        
        if (window.SpeechManager) {
            SpeechManager.speakClear('Great job! That\'s your ' + this.currentBodyPart.displayName);
        }
        
        this.onScoreChange(this.score, 100);
        
        // Move to next body part after delay
        setTimeout(() => {
            this.nextBodyPart();
        }, 2000);
    }
    
    /**
     * End the game
     */
    endGame() {
        this.enabled = false;
        this.isWaitingForPose = false;
        
        // Stop camera
        if (this.videoElement && this.videoElement.srcObject) {
            this.videoElement.srcObject.getTracks().forEach(track => track.stop());
        }
        
        const stars = this.correctAnswers === this.totalParts ? 3 : 
                      this.correctAnswers >= this.totalParts * 0.7 ? 2 : 1;
        
        this.onComplete({
            score: this.score,
            stars: stars,
            correct: this.correctAnswers,
            total: this.totalParts
        });
    }
    
    /**
     * Show error message
     */
    showError(message) {
        this.container.innerHTML = `
            <div class="error-message">
                <h2>😔 Oops!</h2>
                <p>${message}</p>
                <p>Please make sure you're using a device with a camera.</p>
            </div>
        `;
    }
    
    /**
     * Cleanup
     */
    destroy() {
        this.enabled = false;
        
        if (this.videoElement && this.videoElement.srcObject) {
            this.videoElement.srcObject.getTracks().forEach(track => track.stop());
        }
        
        if (this.pose) {
            this.pose.close();
        }
    }
}

// Register with GameRegistry if available
if (window.GameRegistry) {
    GameRegistry.register('bodyparts', BodyPartsGame, {
        name: 'Body Parts',
        description: 'Learn body parts using your camera!',
        icon: '🧍',
        supportedWorlds: ['bodyparts']
    });
}

// Make available globally
window.BodyPartsGame = BodyPartsGame;
