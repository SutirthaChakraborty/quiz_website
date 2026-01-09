/**
 * LexiQuest - Hand Tracking System
 * Uses MediaPipe Hands for gesture-based interaction
 */

const HandTracking = {
    initialized: false,
    enabled: false,
    hands: null,
    camera: null,
    videoElement: null,
    canvasElement: null,
    canvasCtx: null,
    
    // State
    handDetected: false,
    isPinching: false,
    wasPinching: false,
    handPosition: { x: 0, y: 0 },
    smoothPosition: { x: 0, y: 0 },
    
    // Configuration
    config: {
        smoothingFactor: 0.3,
        pinchThreshold: 0.08,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5
    },

    // Callbacks
    callbacks: {
        onPinchStart: null,
        onPinchEnd: null,
        onHandMove: null,
        onHandLost: null,
        onHandDetected: null
    },

    /**
     * Initialize hand tracking
     */
    async init() {
        console.log('HandTracking.init() called');
        
        if (this.initialized) {
            console.log('HandTracking already initialized');
            return true;
        }

        // Check if MediaPipe is available
        if (typeof Hands === 'undefined') {
            console.warn('MediaPipe Hands not loaded - typeof Hands:', typeof Hands);
            console.warn('Make sure MediaPipe Hands script is loaded from CDN');
            return false;
        }
        console.log('MediaPipe Hands is available');

        // Get elements
        this.videoElement = document.getElementById('cameraVideo');
        this.canvasElement = document.getElementById('cameraCanvas');
        
        console.log('Camera elements:', {
            video: this.videoElement ? 'found' : 'NOT FOUND',
            canvas: this.canvasElement ? 'found' : 'NOT FOUND'
        });
        
        if (!this.videoElement || !this.canvasElement) {
            console.warn('Camera elements not found');
            return false;
        }

        this.canvasCtx = this.canvasElement.getContext('2d');

        try {
            // Initialize MediaPipe Hands
            console.log('Initializing MediaPipe Hands...');
            this.hands = new Hands({
                locateFile: (file) => {
                    const url = `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                    console.log('Loading MediaPipe file:', url);
                    return url;
                }
            });

            this.hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: this.config.minDetectionConfidence,
                minTrackingConfidence: this.config.minTrackingConfidence
            });

            this.hands.onResults((results) => this.onResults(results));

            this.initialized = true;
            console.log('HandTracking initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing MediaPipe Hands:', error);
            return false;
        }
    },

    /**
     * Start hand tracking
     */
    async start() {
        console.log('HandTracking.start() called');
        
        // Check if we're in a secure context (required for camera access)
        if (!window.isSecureContext) {
            console.error('Camera requires HTTPS or localhost. Current context is not secure.');
            console.error('Current URL:', window.location.href);
            return false;
        }
        
        // Check if mediaDevices API is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('navigator.mediaDevices.getUserMedia is not available');
            console.error('This may be because you are not on HTTPS or localhost');
            return false;
        }
        
        if (!this.initialized) {
            console.log('HandTracking not initialized, calling init()...');
            const success = await this.init();
            if (!success) {
                console.warn('HandTracking.init() failed');
                return false;
            }
        }

        try {
            console.log('Requesting camera access...');
            console.log('Calling getUserMedia now - browser should show permission prompt');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 320 },
                    height: { ideal: 240 },
                    facingMode: 'user'
                }
            });
            console.log('Camera access granted');

            this.videoElement.srcObject = stream;
            
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    console.log('Video metadata loaded:', {
                        width: this.videoElement.videoWidth,
                        height: this.videoElement.videoHeight
                    });
                    this.canvasElement.width = this.videoElement.videoWidth;
                    this.canvasElement.height = this.videoElement.videoHeight;
                    resolve();
                };
            });

            await this.videoElement.play();
            console.log('Video playing');

            // Show camera container
            const cameraContainer = document.getElementById('floatingCamera');
            if (cameraContainer) {
                cameraContainer.classList.add('active');
                console.log('Camera container shown');
            } else {
                console.warn('floatingCamera element not found');
            }

            // Update camera status
            const statusDot = document.getElementById('cameraStatus');
            if (statusDot) {
                statusDot.classList.add('active');
            }

            this.enabled = true;
            this.detectLoop();
            
            console.log('Hand tracking started successfully');
            return true;

        } catch (error) {
            console.error('Error starting camera:', error);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            
            // Provide user-friendly feedback
            if (error.name === 'NotAllowedError') {
                console.warn('Camera permission was denied by user');
            } else if (error.name === 'NotFoundError') {
                console.warn('No camera found on this device');
            } else if (error.name === 'NotReadableError') {
                console.warn('Camera is already in use by another application');
            }
            
            return false;
        }
    },

    /**
     * Stop hand tracking
     */
    stop() {
        this.enabled = false;

        if (this.videoElement && this.videoElement.srcObject) {
            this.videoElement.srcObject.getTracks().forEach(track => track.stop());
            this.videoElement.srcObject = null;
        }

        // Hide camera container
        const cameraContainer = document.getElementById('floatingCamera');
        if (cameraContainer) {
            cameraContainer.classList.remove('active');
        }

        // Hide hand cursor
        this.hideHandCursor();

        console.log('Hand tracking stopped');
    },

    /**
     * Toggle hand tracking
     */
    toggle() {
        if (this.enabled) {
            this.stop();
        } else {
            this.start();
        }
        return this.enabled;
    },

    /**
     * Detection loop
     */
    async detectLoop() {
        if (!this.enabled) return;

        if (this.videoElement.readyState >= 2) {
            await this.hands.send({ image: this.videoElement });
        }

        requestAnimationFrame(() => this.detectLoop());
    },

    /**
     * Process MediaPipe results
     */
    onResults(results) {
        // Clear canvas
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];

            // Draw hand landmarks
            this.drawHand(landmarks);

            // Process hand position and gestures
            this.processHand(landmarks);

            if (!this.handDetected) {
                this.handDetected = true;
                if (this.callbacks.onHandDetected) {
                    this.callbacks.onHandDetected();
                }
            }
        } else {
            if (this.handDetected) {
                this.handDetected = false;
                this.hideHandCursor();
                if (this.callbacks.onHandLost) {
                    this.callbacks.onHandLost();
                }
            }
        }
    },

    /**
     * Draw hand landmarks on canvas
     */
    drawHand(landmarks) {
        // Draw connections
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],     // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8],     // Index
            [0, 9], [9, 10], [10, 11], [11, 12], // Middle
            [0, 13], [13, 14], [14, 15], [15, 16], // Ring
            [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
            [5, 9], [9, 13], [13, 17]             // Palm
        ];

        this.canvasCtx.strokeStyle = '#74b9ff';
        this.canvasCtx.lineWidth = 2;

        connections.forEach(([i, j]) => {
            const p1 = landmarks[i];
            const p2 = landmarks[j];
            this.canvasCtx.beginPath();
            this.canvasCtx.moveTo(p1.x * this.canvasElement.width, p1.y * this.canvasElement.height);
            this.canvasCtx.lineTo(p2.x * this.canvasElement.width, p2.y * this.canvasElement.height);
            this.canvasCtx.stroke();
        });

        // Draw landmarks
        landmarks.forEach(point => {
            this.canvasCtx.beginPath();
            this.canvasCtx.arc(
                point.x * this.canvasElement.width,
                point.y * this.canvasElement.height,
                4, 0, Math.PI * 2
            );
            this.canvasCtx.fillStyle = '#55efc4';
            this.canvasCtx.fill();
        });
    },

    /**
     * Process hand for interaction
     */
    processHand(landmarks) {
        // Get index finger tip position
        const indexTip = landmarks[8];
        const thumbTip = landmarks[4];

        // Calculate screen position (mirrored)
        const rawX = (1 - indexTip.x) * window.innerWidth;
        const rawY = indexTip.y * window.innerHeight;

        // Smooth the position
        this.smoothPosition.x += (rawX - this.smoothPosition.x) * this.config.smoothingFactor;
        this.smoothPosition.y += (rawY - this.smoothPosition.y) * this.config.smoothingFactor;

        this.handPosition = { ...this.smoothPosition };

        // Update hand cursor
        this.updateHandCursor();

        // Detect pinch gesture
        const pinchDistance = Math.sqrt(
            Math.pow(indexTip.x - thumbTip.x, 2) +
            Math.pow(indexTip.y - thumbTip.y, 2) +
            Math.pow((indexTip.z || 0) - (thumbTip.z || 0), 2)
        );

        this.wasPinching = this.isPinching;
        this.isPinching = pinchDistance < this.config.pinchThreshold;

        // Handle pinch state changes
        if (this.isPinching && !this.wasPinching) {
            this.onPinchStart();
        } else if (!this.isPinching && this.wasPinching) {
            this.onPinchEnd();
        }

        // Callback for hand movement
        if (this.callbacks.onHandMove) {
            this.callbacks.onHandMove(this.handPosition, this.isPinching);
        }
    },

    /**
     * Update hand cursor element
     */
    updateHandCursor() {
        const cursor = document.getElementById('handCursor');
        if (!cursor) return;

        cursor.classList.add('active');
        cursor.style.left = `${this.handPosition.x - 25}px`;
        cursor.style.top = `${this.handPosition.y - 25}px`;

        if (this.isPinching) {
            cursor.classList.add('pinching');
        } else {
            cursor.classList.remove('pinching');
        }
    },

    /**
     * Hide hand cursor
     */
    hideHandCursor() {
        const cursor = document.getElementById('handCursor');
        if (cursor) {
            cursor.classList.remove('active');
            cursor.classList.remove('pinching');
        }
    },

    /**
     * Pinch start handler
     */
    onPinchStart() {
        AudioManager.play('pickup');
        Helpers.vibrate(30);
        
        if (this.callbacks.onPinchStart) {
            this.callbacks.onPinchStart(this.handPosition);
        }
    },

    /**
     * Pinch end handler
     */
    onPinchEnd() {
        AudioManager.play('drop');
        
        if (this.callbacks.onPinchEnd) {
            this.callbacks.onPinchEnd(this.handPosition);
        }
    },

    /**
     * Get current hand position
     */
    getPosition() {
        return this.handPosition;
    },

    /**
     * Check if hand is detected
     */
    isHandDetected() {
        return this.handDetected;
    },

    /**
     * Check if pinching
     */
    isPinchActive() {
        return this.isPinching;
    },

    /**
     * Set callback
     */
    on(event, callback) {
        if (this.callbacks.hasOwnProperty(event)) {
            this.callbacks[event] = callback;
        }
    },

    /**
     * Get element at hand position
     */
    getElementAtHand() {
        return document.elementFromPoint(this.handPosition.x, this.handPosition.y);
    },

    /**
     * Get all elements at hand position
     */
    getElementsAtHand() {
        return document.elementsFromPoint(this.handPosition.x, this.handPosition.y);
    },

    /**
     * Check if hand is over an element
     */
    isOverElement(element) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return Helpers.elementContainsPoint(element, this.handPosition.x, this.handPosition.y);
    },

    /**
     * Set configuration options
     */
    setConfig(options) {
        this.config = { ...this.config, ...options };
    }
};

// Make available globally
window.HandTracking = HandTracking;
