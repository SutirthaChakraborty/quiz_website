/**
 * LexiQuest - Painting & Coloring Game
 * Free painting canvas with guided coloring tasks
 * Supports touch, mouse, and hand gesture input
 */

class PaintingGame {
    constructor(options = {}) {
        this.options = options;
        this.container = options.container || document.getElementById('gameContainer');
        this.onComplete = options.onComplete || (() => {});
        this.onScoreChange = options.onScoreChange || (() => {});
        this.onProgress = options.onProgress || (() => {});
        
        console.log('PaintingGame constructor - container:', this.container);
        
        // Canvas elements
        this.canvas = null;
        this.ctx = null;
        this.templateCanvas = null;
        this.templateCtx = null;
        
        // Drawing state
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.currentColor = '#ff6b6b';
        this.brushSize = 10;
        this.tool = 'brush'; // brush, eraser, fill
        
        // Game state
        this.mode = options.mode || 'free'; // 'free', 'coloring', 'trace'
        this.currentTaskIndex = 0;
        this.tasks = [];
        this.score = 0;
        this.completedTasks = 0;
        
        // Color palette
        this.colors = [
            { name: 'Red', hex: '#ff6b6b', emoji: '🔴' },
            { name: 'Orange', hex: '#ffa502', emoji: '🟠' },
            { name: 'Yellow', hex: '#ffd93d', emoji: '🟡' },
            { name: 'Green', hex: '#6bcb77', emoji: '🟢' },
            { name: 'Blue', hex: '#4d96ff', emoji: '🔵' },
            { name: 'Purple', hex: '#9b59b6', emoji: '🟣' },
            { name: 'Pink', hex: '#ff9ff3', emoji: '💗' },
            { name: 'Brown', hex: '#cd853f', emoji: '🟤' },
            { name: 'Black', hex: '#2d3436', emoji: '⚫' },
            { name: 'White', hex: '#ffffff', emoji: '⚪' }
        ];
        
        // Coloring templates
        this.templates = [
            {
                name: 'Apple',
                emoji: '🍎',
                targetColor: '#ff6b6b',
                shape: 'apple',
                instruction: 'Color the apple RED!'
            },
            {
                name: 'Sun',
                emoji: '☀️',
                targetColor: '#ffd93d',
                shape: 'sun',
                instruction: 'Color the sun YELLOW!'
            },
            {
                name: 'Tree',
                emoji: '🌳',
                targetColor: '#6bcb77',
                shape: 'tree',
                instruction: 'Color the tree GREEN!'
            },
            {
                name: 'Sky',
                emoji: '🌤️',
                targetColor: '#4d96ff',
                shape: 'cloud',
                instruction: 'Color the cloud BLUE!'
            },
            {
                name: 'Grape',
                emoji: '🍇',
                targetColor: '#9b59b6',
                shape: 'grape',
                instruction: 'Color the grapes PURPLE!'
            },
            {
                name: 'Flower',
                emoji: '🌸',
                targetColor: '#ff9ff3',
                shape: 'flower',
                instruction: 'Color the flower PINK!'
            }
        ];
        
        // Brush sizes
        this.brushSizes = [
            { name: 'Small', size: 5, icon: '•' },
            { name: 'Medium', size: 15, icon: '●' },
            { name: 'Large', size: 30, icon: '⬤' }
        ];
    }
    
    /**
     * Initialize the game
     */
    async init() {
        console.log('PaintingGame: Initializing...');
        console.log('PaintingGame: Container is:', this.container);
        
        // Check for valid container
        if (!this.container) {
            console.error('PaintingGame: No container element found!');
            this.container = document.getElementById('gameContainer');
            if (!this.container) {
                console.error('PaintingGame: Could not find gameContainer either!');
                return false;
            }
        }
        
        // Setup tasks based on mode
        this.setupTasks();
        
        // Create game UI
        this.createGameUI();
        
        // Setup canvas
        this.setupCanvas();
        
        // Bind events
        this.bindEvents();
        
        return true;
    }
    
    /**
     * Setup tasks based on mode
     */
    setupTasks() {
        if (this.mode === 'coloring') {
            // Shuffle and select templates
            const shuffled = [...this.templates].sort(() => Math.random() - 0.5);
            this.tasks = shuffled.slice(0, this.options.taskCount || 3);
        } else if (this.mode === 'trace') {
            this.tasks = this.generateTraceTask();
        }
    }
    
    /**
     * Generate trace tasks (letters, shapes)
     */
    generateTraceTask() {
        const letters = ['A', 'B', 'C', 'D', 'E'];
        const shapes = ['circle', 'square', 'triangle', 'star', 'heart'];
        
        return letters.slice(0, 3).map(letter => ({
            name: letter,
            type: 'letter',
            instruction: `Trace the letter ${letter}!`
        }));
    }
    
    /**
     * Create game UI
     */
    createGameUI() {
        const isColoringMode = this.mode === 'coloring';
        const isFreeMode = this.mode === 'free';
        
        this.container.innerHTML = `
            <div class="painting-game">
                <div class="painting-toolbar">
                    <div class="tool-section colors">
                        <span class="section-label">Colors</span>
                        <div class="color-palette" id="colorPalette">
                            ${this.colors.map(c => `
                                <button class="color-btn ${c.hex === this.currentColor ? 'active' : ''}" 
                                        data-color="${c.hex}" 
                                        style="background: ${c.hex};"
                                        title="${c.name}">
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="tool-section brushes">
                        <span class="section-label">Size</span>
                        <div class="brush-sizes" id="brushSizes">
                            ${this.brushSizes.map(b => `
                                <button class="brush-btn ${b.size === this.brushSize ? 'active' : ''}" 
                                        data-size="${b.size}">
                                    ${b.icon}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="tool-section tools">
                        <span class="section-label">Tools</span>
                        <div class="tool-buttons">
                            <button class="tool-btn active" data-tool="brush" title="Brush">🖌️</button>
                            <button class="tool-btn" data-tool="eraser" title="Eraser">🧹</button>
                            <button class="tool-btn" data-tool="fill" title="Fill">🪣</button>
                        </div>
                    </div>
                    
                    <div class="tool-section actions">
                        <button class="action-btn" id="clearBtn" title="Clear All">🗑️ Clear</button>
                        <button class="action-btn" id="undoBtn" title="Undo">↩️ Undo</button>
                        ${isColoringMode ? `<button class="action-btn" id="nextBtn" title="Next">Next ➡️</button>` : ''}
                        ${isFreeMode ? `<button class="action-btn primary" id="doneBtn">✅ Done</button>` : ''}
                    </div>
                </div>
                
                ${isColoringMode ? `
                    <div class="coloring-instruction" id="coloringInstruction">
                        <span class="task-emoji">🎨</span>
                        <span class="task-text">Get ready to color!</span>
                        <span class="task-progress" id="taskProgress">1/${this.tasks.length}</span>
                    </div>
                ` : ''}
                
                <div class="canvas-container" id="canvasContainer">
                    <canvas id="templateCanvas" class="${isColoringMode ? 'active' : ''}"></canvas>
                    <canvas id="paintingCanvas"></canvas>
                </div>
                
                ${!isFreeMode ? `
                    <div class="game-stats painting-stats">
                        <div class="stat-item">
                            <span class="stat-label">Score</span>
                            <span class="stat-value" id="gameScore">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Tasks</span>
                            <span class="stat-value" id="tasksComplete">0/${this.tasks.length}</span>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Add styles
        this.addStyles();
    }
    
    /**
     * Add game-specific styles
     */
    addStyles() {
        if (document.getElementById('paintingGameStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'paintingGameStyles';
        styles.textContent = `
            .painting-game {
                display: flex;
                flex-direction: column;
                height: 100%;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                border-radius: 20px;
                overflow: hidden;
            }
            
            .painting-toolbar {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
                padding: 15px;
                background: white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                align-items: center;
                justify-content: center;
            }
            
            .tool-section {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }
            
            .section-label {
                font-size: 0.75rem;
                color: #666;
                text-transform: uppercase;
                font-weight: 600;
            }
            
            .color-palette {
                display: flex;
                gap: 5px;
                flex-wrap: wrap;
                max-width: 200px;
                justify-content: center;
            }
            
            .color-btn {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                border: 3px solid transparent;
                cursor: pointer;
                transition: transform 0.2s, border-color 0.2s;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }
            
            .color-btn:hover {
                transform: scale(1.15);
            }
            
            .color-btn.active {
                border-color: #2d3436;
                transform: scale(1.1);
            }
            
            .brush-sizes {
                display: flex;
                gap: 8px;
            }
            
            .brush-btn {
                width: 40px;
                height: 40px;
                border-radius: 10px;
                border: 2px solid #ddd;
                background: white;
                cursor: pointer;
                font-size: 1.2rem;
                transition: all 0.2s;
            }
            
            .brush-btn:hover {
                border-color: #667eea;
            }
            
            .brush-btn.active {
                background: #667eea;
                border-color: #667eea;
                color: white;
            }
            
            .tool-buttons {
                display: flex;
                gap: 8px;
            }
            
            .tool-btn {
                width: 45px;
                height: 45px;
                border-radius: 10px;
                border: 2px solid #ddd;
                background: white;
                cursor: pointer;
                font-size: 1.3rem;
                transition: all 0.2s;
            }
            
            .tool-btn:hover {
                border-color: #667eea;
                background: #f0f0ff;
            }
            
            .tool-btn.active {
                background: #667eea;
                border-color: #667eea;
            }
            
            .action-btn {
                padding: 10px 15px;
                border-radius: 10px;
                border: none;
                background: #e0e0e0;
                cursor: pointer;
                font-size: 0.9rem;
                font-weight: 600;
                transition: all 0.2s;
            }
            
            .action-btn:hover {
                background: #d0d0d0;
            }
            
            .action-btn.primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            
            .action-btn.primary:hover {
                transform: scale(1.05);
            }
            
            .coloring-instruction {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
                padding: 15px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                font-size: 1.2rem;
            }
            
            .task-emoji {
                font-size: 2rem;
                animation: bounce 1s infinite;
            }
            
            .task-text {
                font-weight: 600;
            }
            
            .task-progress {
                background: rgba(255,255,255,0.2);
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 0.9rem;
            }
            
            .canvas-container {
                flex: 1;
                position: relative;
                margin: 15px;
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 5px 20px rgba(0,0,0,0.15);
                background: white;
            }
            
            .canvas-container canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                cursor: crosshair;
            }
            
            #templateCanvas {
                opacity: 0;
                pointer-events: none;
            }
            
            #templateCanvas.active {
                opacity: 0.3;
            }
            
            .painting-stats {
                display: flex;
                justify-content: center;
                gap: 30px;
                padding: 15px;
                background: white;
            }
            
            .painting-stats .stat-item {
                text-align: center;
            }
            
            .painting-stats .stat-label {
                display: block;
                font-size: 0.8rem;
                color: #666;
            }
            
            .painting-stats .stat-value {
                display: block;
                font-size: 1.3rem;
                font-weight: bold;
                color: #667eea;
            }
            
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
            }
            
            /* Responsive */
            @media (max-width: 600px) {
                .painting-toolbar {
                    padding: 10px;
                    gap: 10px;
                }
                
                .color-btn {
                    width: 25px;
                    height: 25px;
                }
                
                .tool-btn, .brush-btn {
                    width: 35px;
                    height: 35px;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    /**
     * Setup canvas
     */
    setupCanvas() {
        this.canvas = document.getElementById('paintingCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.templateCanvas = document.getElementById('templateCanvas');
        this.templateCtx = this.templateCanvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        
        // History for undo
        this.history = [];
        this.saveState();
    }
    
    /**
     * Resize canvas to container
     */
    resizeCanvas() {
        const container = document.getElementById('canvasContainer');
        const rect = container.getBoundingClientRect();
        
        // Set actual size in memory
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        
        // Scale for high DPI
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        // Same for template canvas
        this.templateCanvas.width = rect.width * window.devicePixelRatio;
        this.templateCanvas.height = rect.height * window.devicePixelRatio;
        this.templateCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        // Store display size
        this.displayWidth = rect.width;
        this.displayHeight = rect.height;
        
        // Fill with white
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);
    }
    
    /**
     * Bind events
     */
    bindEvents() {
        // Canvas drawing events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.startDrawing(e));
        this.canvas.addEventListener('touchmove', (e) => this.draw(e));
        this.canvas.addEventListener('touchend', () => this.stopDrawing());
        
        // Hand tracking / gesture support
        this.setupHandTracking();
        
        // Color palette
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentColor = btn.dataset.color;
            });
        });
        
        // Brush sizes
        document.querySelectorAll('.brush-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.brush-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.brushSize = parseInt(btn.dataset.size);
            });
        });
        
        // Tools
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.tool = btn.dataset.tool;
            });
        });
        
        // Action buttons
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearCanvas());
        }
        
        const undoBtn = document.getElementById('undoBtn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.undo());
        }
        
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.checkAndNext());
        }
        
        const doneBtn = document.getElementById('doneBtn');
        if (doneBtn) {
            doneBtn.addEventListener('click', () => this.finishFreeMode());
        }
        
        // Window resize
        window.addEventListener('resize', () => {
            // Save current drawing
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            this.resizeCanvas();
            // Restore drawing (scaled)
            this.ctx.putImageData(imageData, 0, 0);
        });
    }
    
    /**
     * Setup hand tracking for gesture-based painting
     */
    setupHandTracking() {
        if (!window.HandTracking) {
            console.log('PaintingGame: HandTracking not available');
            return;
        }
        
        console.log('PaintingGame: Setting up hand tracking for gestures');
        
        // Store canvas rect for position calculations
        this.updateCanvasRect();
        
        // Track gesture state
        this.gestureDrawing = false;
        this.gestureLastX = 0;
        this.gestureLastY = 0;
        
        // Set up hand tracking callbacks
        HandTracking.on('onPinchStart', (position) => {
            this.onGesturePinchStart(position);
        });
        
        HandTracking.on('onPinchEnd', (position) => {
            this.onGesturePinchEnd(position);
        });
        
        HandTracking.on('onHandMove', (position, isPinching) => {
            this.onGestureHandMove(position, isPinching);
        });
        
        // Start hand tracking if not already started
        if (!HandTracking.enabled) {
            HandTracking.start().then(success => {
                if (success) {
                    console.log('PaintingGame: Hand tracking started for gesture painting');
                }
            });
        }
    }
    
    /**
     * Update canvas rect for position calculations
     */
    updateCanvasRect() {
        if (this.canvas) {
            this.canvasRect = this.canvas.getBoundingClientRect();
        }
    }
    
    /**
     * Handle pinch start gesture (start drawing)
     */
    onGesturePinchStart(position) {
        this.updateCanvasRect();
        
        // Check if hand is over the canvas
        if (!this.isPositionOverCanvas(position)) {
            return;
        }
        
        const canvasPos = this.screenToCanvasPosition(position);
        
        this.gestureDrawing = true;
        this.gestureLastX = canvasPos.x;
        this.gestureLastY = canvasPos.y;
        
        // Handle fill tool on pinch
        if (this.tool === 'fill') {
            this.floodFill(canvasPos.x, canvasPos.y, this.currentColor);
            this.gestureDrawing = false;
        }
        
        console.log('PaintingGame: Gesture drawing started at', canvasPos);
    }
    
    /**
     * Handle pinch end gesture (stop drawing)
     */
    onGesturePinchEnd(position) {
        if (this.gestureDrawing) {
            this.gestureDrawing = false;
            this.saveState();
            console.log('PaintingGame: Gesture drawing ended');
        }
    }
    
    /**
     * Handle hand move gesture (draw while pinching)
     */
    onGestureHandMove(position, isPinching) {
        if (!isPinching || !this.gestureDrawing) {
            return;
        }
        
        this.updateCanvasRect();
        
        // Check if hand is over the canvas
        if (!this.isPositionOverCanvas(position)) {
            return;
        }
        
        const canvasPos = this.screenToCanvasPosition(position);
        
        // Draw line from last position to current position
        this.ctx.beginPath();
        this.ctx.moveTo(this.gestureLastX, this.gestureLastY);
        this.ctx.lineTo(canvasPos.x, canvasPos.y);
        
        if (this.tool === 'eraser') {
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = this.brushSize * 2;
        } else {
            this.ctx.strokeStyle = this.currentColor;
            this.ctx.lineWidth = this.brushSize;
        }
        
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
        
        // Update last position
        this.gestureLastX = canvasPos.x;
        this.gestureLastY = canvasPos.y;
    }
    
    /**
     * Check if a screen position is over the canvas
     */
    isPositionOverCanvas(position) {
        if (!this.canvasRect) return false;
        
        return position.x >= this.canvasRect.left &&
               position.x <= this.canvasRect.right &&
               position.y >= this.canvasRect.top &&
               position.y <= this.canvasRect.bottom;
    }
    
    /**
     * Convert screen position to canvas position
     */
    screenToCanvasPosition(position) {
        return {
            x: position.x - this.canvasRect.left,
            y: position.y - this.canvasRect.top
        };
    }
    
    /**
     * Get position from event
     */
    getPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        let x, y;
        
        if (e.touches) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }
        
        return { x, y };
    }
    
    /**
     * Start drawing
     */
    startDrawing(e) {
        e.preventDefault();
        this.isDrawing = true;
        
        const pos = this.getPosition(e);
        this.lastX = pos.x;
        this.lastY = pos.y;
        
        if (this.tool === 'fill') {
            this.floodFill(pos.x, pos.y, this.currentColor);
            this.isDrawing = false;
        }
    }
    
    /**
     * Draw on canvas
     */
    draw(e) {
        if (!this.isDrawing) return;
        e.preventDefault();
        
        const pos = this.getPosition(e);
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(pos.x, pos.y);
        
        if (this.tool === 'eraser') {
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = this.brushSize * 2;
        } else {
            this.ctx.strokeStyle = this.currentColor;
            this.ctx.lineWidth = this.brushSize;
        }
        
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
        
        this.lastX = pos.x;
        this.lastY = pos.y;
    }
    
    /**
     * Stop drawing
     */
    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.saveState();
        }
    }
    
    /**
     * Save canvas state for undo
     */
    saveState() {
        if (this.history.length > 20) {
            this.history.shift();
        }
        this.history.push(this.canvas.toDataURL());
    }
    
    /**
     * Undo last action
     */
    undo() {
        if (this.history.length > 1) {
            this.history.pop(); // Remove current
            const previous = this.history[this.history.length - 1];
            
            const img = new Image();
            img.onload = () => {
                this.ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);
                this.ctx.drawImage(img, 0, 0, this.displayWidth, this.displayHeight);
            };
            img.src = previous;
        }
    }
    
    /**
     * Clear canvas
     */
    clearCanvas() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);
        this.saveState();
        
        if (window.AudioManager) {
            AudioManager.play('whoosh');
        }
    }
    
    /**
     * Flood fill algorithm
     */
    floodFill(startX, startY, fillColor) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        const startPos = (Math.floor(startY * window.devicePixelRatio) * this.canvas.width + 
                         Math.floor(startX * window.devicePixelRatio)) * 4;
        
        const startR = data[startPos];
        const startG = data[startPos + 1];
        const startB = data[startPos + 2];
        
        // Convert fill color to RGB
        const tempDiv = document.createElement('div');
        tempDiv.style.color = fillColor;
        document.body.appendChild(tempDiv);
        const rgbStr = getComputedStyle(tempDiv).color;
        document.body.removeChild(tempDiv);
        
        const rgbMatch = rgbStr.match(/\d+/g);
        const fillR = parseInt(rgbMatch[0]);
        const fillG = parseInt(rgbMatch[1]);
        const fillB = parseInt(rgbMatch[2]);
        
        // Don't fill if clicking on same color
        if (startR === fillR && startG === fillG && startB === fillB) {
            return;
        }
        
        const pixelStack = [[Math.floor(startX * window.devicePixelRatio), 
                            Math.floor(startY * window.devicePixelRatio)]];
        const width = this.canvas.width;
        const height = this.canvas.height;
        const visited = new Set();
        
        const tolerance = 30;
        
        const matchStartColor = (pos) => {
            return Math.abs(data[pos] - startR) <= tolerance &&
                   Math.abs(data[pos + 1] - startG) <= tolerance &&
                   Math.abs(data[pos + 2] - startB) <= tolerance;
        };
        
        while (pixelStack.length > 0 && pixelStack.length < 100000) {
            const [x, y] = pixelStack.pop();
            const key = `${x},${y}`;
            
            if (visited.has(key)) continue;
            if (x < 0 || x >= width || y < 0 || y >= height) continue;
            
            const pos = (y * width + x) * 4;
            
            if (!matchStartColor(pos)) continue;
            
            visited.add(key);
            
            data[pos] = fillR;
            data[pos + 1] = fillG;
            data[pos + 2] = fillB;
            data[pos + 3] = 255;
            
            pixelStack.push([x + 1, y]);
            pixelStack.push([x - 1, y]);
            pixelStack.push([x, y + 1]);
            pixelStack.push([x, y - 1]);
        }
        
        this.ctx.putImageData(imageData, 0, 0);
        this.saveState();
    }
    
    /**
     * Draw template shape for coloring mode
     */
    drawTemplate(template) {
        this.templateCtx.clearRect(0, 0, this.displayWidth, this.displayHeight);
        
        const centerX = this.displayWidth / 2;
        const centerY = this.displayHeight / 2;
        const size = Math.min(this.displayWidth, this.displayHeight) * 0.4;
        
        this.templateCtx.strokeStyle = '#333';
        this.templateCtx.lineWidth = 3;
        this.templateCtx.fillStyle = '#eee';
        
        switch (template.shape) {
            case 'apple':
                this.drawApple(centerX, centerY, size);
                break;
            case 'sun':
                this.drawSun(centerX, centerY, size);
                break;
            case 'tree':
                this.drawTree(centerX, centerY, size);
                break;
            case 'cloud':
                this.drawCloud(centerX, centerY, size);
                break;
            case 'grape':
                this.drawGrapes(centerX, centerY, size);
                break;
            case 'flower':
                this.drawFlower(centerX, centerY, size);
                break;
        }
    }
    
    /**
     * Draw apple shape
     */
    drawApple(cx, cy, size) {
        this.templateCtx.beginPath();
        this.templateCtx.arc(cx, cy, size, 0, Math.PI * 2);
        this.templateCtx.fill();
        this.templateCtx.stroke();
        
        // Stem
        this.templateCtx.beginPath();
        this.templateCtx.moveTo(cx, cy - size);
        this.templateCtx.quadraticCurveTo(cx + 10, cy - size - 20, cx + 5, cy - size - 30);
        this.templateCtx.stroke();
        
        // Leaf
        this.templateCtx.beginPath();
        this.templateCtx.ellipse(cx + 20, cy - size - 10, 15, 8, Math.PI / 4, 0, Math.PI * 2);
        this.templateCtx.fillStyle = '#ccc';
        this.templateCtx.fill();
        this.templateCtx.stroke();
    }
    
    /**
     * Draw sun shape
     */
    drawSun(cx, cy, size) {
        // Main circle
        this.templateCtx.beginPath();
        this.templateCtx.arc(cx, cy, size * 0.6, 0, Math.PI * 2);
        this.templateCtx.fill();
        this.templateCtx.stroke();
        
        // Rays
        for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI * 2) / 12;
            const x1 = cx + Math.cos(angle) * size * 0.7;
            const y1 = cy + Math.sin(angle) * size * 0.7;
            const x2 = cx + Math.cos(angle) * size;
            const y2 = cy + Math.sin(angle) * size;
            
            this.templateCtx.beginPath();
            this.templateCtx.moveTo(x1, y1);
            this.templateCtx.lineTo(x2, y2);
            this.templateCtx.stroke();
        }
    }
    
    /**
     * Draw tree shape
     */
    drawTree(cx, cy, size) {
        // Trunk
        this.templateCtx.fillRect(cx - size * 0.15, cy, size * 0.3, size * 0.8);
        this.templateCtx.strokeRect(cx - size * 0.15, cy, size * 0.3, size * 0.8);
        
        // Foliage (triangle)
        this.templateCtx.beginPath();
        this.templateCtx.moveTo(cx, cy - size);
        this.templateCtx.lineTo(cx - size * 0.8, cy + size * 0.1);
        this.templateCtx.lineTo(cx + size * 0.8, cy + size * 0.1);
        this.templateCtx.closePath();
        this.templateCtx.fill();
        this.templateCtx.stroke();
    }
    
    /**
     * Draw cloud shape
     */
    drawCloud(cx, cy, size) {
        this.templateCtx.beginPath();
        this.templateCtx.arc(cx - size * 0.4, cy, size * 0.4, 0, Math.PI * 2);
        this.templateCtx.arc(cx, cy - size * 0.2, size * 0.5, 0, Math.PI * 2);
        this.templateCtx.arc(cx + size * 0.4, cy, size * 0.4, 0, Math.PI * 2);
        this.templateCtx.arc(cx + size * 0.1, cy + size * 0.2, size * 0.35, 0, Math.PI * 2);
        this.templateCtx.arc(cx - size * 0.2, cy + size * 0.15, size * 0.3, 0, Math.PI * 2);
        this.templateCtx.fill();
        this.templateCtx.stroke();
    }
    
    /**
     * Draw grapes shape
     */
    drawGrapes(cx, cy, size) {
        const grapeSize = size * 0.2;
        const positions = [
            [0, -0.6], [-0.3, -0.3], [0.3, -0.3],
            [-0.45, 0], [0, 0], [0.45, 0],
            [-0.3, 0.3], [0.3, 0.3], [0, 0.6]
        ];
        
        positions.forEach(([ox, oy]) => {
            this.templateCtx.beginPath();
            this.templateCtx.arc(cx + ox * size, cy + oy * size, grapeSize, 0, Math.PI * 2);
            this.templateCtx.fill();
            this.templateCtx.stroke();
        });
    }
    
    /**
     * Draw flower shape
     */
    drawFlower(cx, cy, size) {
        // Petals
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6;
            const px = cx + Math.cos(angle) * size * 0.5;
            const py = cy + Math.sin(angle) * size * 0.5;
            
            this.templateCtx.beginPath();
            this.templateCtx.arc(px, py, size * 0.35, 0, Math.PI * 2);
            this.templateCtx.fill();
            this.templateCtx.stroke();
        }
        
        // Center
        this.templateCtx.beginPath();
        this.templateCtx.arc(cx, cy, size * 0.25, 0, Math.PI * 2);
        this.templateCtx.fillStyle = '#ffd93d';
        this.templateCtx.fill();
        this.templateCtx.stroke();
    }
    
    /**
     * Start the game
     */
    async start() {
        const success = await this.init();
        if (!success) {
            console.error('Failed to initialize PaintingGame');
            return;
        }
        
        if (this.mode === 'coloring' && this.tasks.length > 0) {
            this.loadTask(0);
        }
        
        // Speak instructions
        if (window.SpeechManager) {
            if (this.mode === 'free') {
                SpeechManager.speakClear('Let\'s paint! Pick a color and start drawing!');
            } else if (this.mode === 'coloring') {
                SpeechManager.speakClear('Let\'s color some pictures!');
            }
        }
    }
    
    /**
     * Load a coloring task
     */
    loadTask(index) {
        if (index >= this.tasks.length) {
            this.endGame();
            return;
        }
        
        this.currentTaskIndex = index;
        const task = this.tasks[index];
        
        // Clear canvas
        this.clearCanvas();
        
        // Draw template
        this.drawTemplate(task);
        
        // Update UI
        const emoji = document.querySelector('.task-emoji');
        const text = document.querySelector('.task-text');
        const progress = document.getElementById('taskProgress');
        
        if (emoji) emoji.textContent = task.emoji;
        if (text) text.textContent = task.instruction;
        if (progress) progress.textContent = `${index + 1}/${this.tasks.length}`;
        
        // Speak instruction
        if (window.SpeechManager) {
            SpeechManager.speakClear(task.instruction);
        }
        
        this.onProgress(index + 1, this.tasks.length);
    }
    
    /**
     * Check current task and move to next
     */
    checkAndNext() {
        // Award points for any coloring effort
        this.score += 50;
        this.completedTasks++;
        
        // Update UI
        const scoreEl = document.getElementById('gameScore');
        const tasksEl = document.getElementById('tasksComplete');
        
        if (scoreEl) scoreEl.textContent = this.score;
        if (tasksEl) tasksEl.textContent = `${this.completedTasks}/${this.tasks.length}`;
        
        this.onScoreChange(this.score, 50);
        
        if (window.AudioManager) {
            AudioManager.play('correct');
        }
        
        // Next task
        this.loadTask(this.currentTaskIndex + 1);
    }
    
    /**
     * Finish free painting mode
     */
    finishFreeMode() {
        this.onComplete({
            score: 100,
            stars: 3,
            mode: 'free'
        });
    }
    
    /**
     * End the game
     */
    endGame() {
        const stars = this.completedTasks === this.tasks.length ? 3 : 
                      this.completedTasks >= this.tasks.length * 0.7 ? 2 : 1;
        
        this.onComplete({
            score: this.score,
            stars: stars,
            completed: this.completedTasks,
            total: this.tasks.length
        });
    }
    
    /**
     * Cleanup
     */
    destroy() {
        // Remove event listeners if needed
    }
}

// Register with GameRegistry if available
if (window.GameRegistry) {
    GameRegistry.register('painting', PaintingGame, {
        name: 'Painting & Coloring',
        description: 'Free painting and coloring activities',
        icon: '🎨',
        supportedWorlds: ['art']
    });
}

// Make available globally
window.PaintingGame = PaintingGame;
