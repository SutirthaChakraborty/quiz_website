/**
 * LexiQuest - Particle System
 * Creates beautiful particle effects for the background and celebrations
 */

const ParticleSystem = {
    canvas: null,
    ctx: null,
    particles: [],
    animationId: null,
    running: false,
    enabled: true,

    // Configuration
    config: {
        maxParticles: 50,
        particleSize: { min: 2, max: 6 },
        speed: { min: 0.2, max: 1 },
        colors: ['#6c5ce7', '#a29bfe', '#fd79a8', '#00cec9', '#74b9ff', '#ffeaa7'],
        fadeSpeed: 0.003,
        connectDistance: 100,
        connectLines: true
    },

    /**
     * Initialize particle system
     */
    init(canvasOrId = 'particleCanvas') {
        // Accept either canvas element or ID string
        if (typeof canvasOrId === 'string') {
            this.canvas = document.getElementById(canvasOrId);
        } else if (canvasOrId instanceof HTMLCanvasElement) {
            this.canvas = canvasOrId;
        } else {
            this.canvas = document.getElementById('particleCanvas');
        }
        
        if (!this.canvas) {
            console.warn('Particle canvas not found');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.resize();

        // Handle resize
        window.addEventListener('resize', () => this.resize());

        // Start animation
        this.start();

        console.log('ParticleSystem initialized');
    },

    /**
     * Create floating background particles
     */
    createFloatingParticles(count = 30) {
        if (!this.canvas) return;
        this.config.maxParticles = count;
        this.createParticles();
    },

    /**
     * Create firework effect (alias for burst)
     */
    createFirework(x, y, count = 30) {
        if (!this.enabled || !this.canvas) return;
        this.burst(x, y, count);
    },

    /**
     * Helper function for random numbers (fallback if Helpers not available)
     */
    randomBetween(min, max) {
        if (window.Helpers && Helpers.randomBetween) {
            return Helpers.randomBetween(min, max);
        }
        return Math.random() * (max - min) + min;
    },

    /**
     * Helper function for distance (fallback if Helpers not available)
     */
    getDistance(x1, y1, x2, y2) {
        if (window.Helpers && Helpers.distance) {
            return Helpers.distance(x1, y1, x2, y2);
        }
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },

    /**
     * Resize canvas to window size
     */
    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    /**
     * Create initial particles
     */
    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.config.maxParticles; i++) {
            this.particles.push(this.createParticle());
        }
    },

    /**
     * Create a single particle
     */
    createParticle(x = null, y = null) {
        const size = this.randomBetween(
            this.config.particleSize.min, 
            this.config.particleSize.max
        );

        return {
            x: x !== null ? x : Math.random() * this.canvas.width,
            y: y !== null ? y : Math.random() * this.canvas.height,
            size: size,
            speedX: (Math.random() - 0.5) * this.config.speed.max,
            speedY: (Math.random() - 0.5) * this.config.speed.max,
            color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
            opacity: Math.random() * 0.5 + 0.2,
            fadeDirection: Math.random() > 0.5 ? 1 : -1
        };
    },

    /**
     * Start animation loop
     */
    start() {
        if (this.running) return;
        this.running = true;
        this.animate();
    },

    /**
     * Stop animation
     */
    stop() {
        this.running = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    },

    /**
     * Animation loop
     */
    animate() {
        if (!this.running) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.updateParticles();
        this.drawParticles();
        
        if (this.config.connectLines) {
            this.drawConnections();
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    },

    /**
     * Update particle positions
     */
    updateParticles() {
        this.particles.forEach(particle => {
            // Move particle
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // Fade effect
            particle.opacity += this.config.fadeSpeed * particle.fadeDirection;
            if (particle.opacity >= 0.7 || particle.opacity <= 0.1) {
                particle.fadeDirection *= -1;
            }

            // Wrap around edges
            if (particle.x < -particle.size) particle.x = this.canvas.width + particle.size;
            if (particle.x > this.canvas.width + particle.size) particle.x = -particle.size;
            if (particle.y < -particle.size) particle.y = this.canvas.height + particle.size;
            if (particle.y > this.canvas.height + particle.size) particle.y = -particle.size;
        });
    },

    /**
     * Draw particles
     */
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = this.hexToRgba(particle.color, particle.opacity);
            this.ctx.fill();
        });
    },

    /**
     * Draw connections between nearby particles
     */
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                const distance = this.getDistance(p1.x, p1.y, p2.x, p2.y);

                if (distance < this.config.connectDistance) {
                    const opacity = 1 - (distance / this.config.connectDistance);
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.1})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }
    },

    /**
     * Convert hex color to rgba
     */
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    // ============ Special Effects ============

    /**
     * Create burst effect at position
     */
    burst(x, y, count = 20, colors = null) {
        if (!this.enabled || !this.canvas) return;
        const burstColors = colors || this.config.colors;
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = this.randomBetween(2, 5);
            
            this.particles.push({
                x: x,
                y: y,
                size: this.randomBetween(3, 8),
                speedX: Math.cos(angle) * speed,
                speedY: Math.sin(angle) * speed,
                color: burstColors[Math.floor(Math.random() * burstColors.length)],
                opacity: 1,
                fadeDirection: -1,
                lifetime: 60,
                isBurst: true
            });
        }
    },

    /**
     * Create celebration effect (confetti-like)
     */
    celebrate(x, y) {
        if (!this.enabled || !this.canvas) return;
        const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'];
        
        for (let i = 0; i < 100; i++) {
            const px = Math.random() * this.canvas.width;
            
            this.particles.push({
                x: px,
                y: -10,
                size: this.randomBetween(4, 10),
                speedX: (Math.random() - 0.5) * 3,
                speedY: this.randomBetween(2, 6),
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: 1,
                fadeDirection: -0.5,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                lifetime: 200,
                isConfetti: true
            });
        }
    },

    /**
     * Create sparkle at position
     */
    sparkle(x, y) {
        if (!this.enabled || !this.canvas) return;
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const speed = this.randomBetween(1, 3);
            
            this.particles.push({
                x: x,
                y: y,
                size: this.randomBetween(2, 4),
                speedX: Math.cos(angle) * speed,
                speedY: Math.sin(angle) * speed,
                color: '#ffeaa7',
                opacity: 1,
                fadeDirection: -1,
                lifetime: 30,
                isSparkle: true
            });
        }
    },

    /**
     * Create star trail
     */
    starTrail(x, y) {
        if (!this.enabled || !this.canvas) return;
        this.particles.push({
            x: x,
            y: y,
            size: this.randomBetween(2, 5),
            speedX: (Math.random() - 0.5) * 2,
            speedY: -this.randomBetween(1, 3),
            color: '#ffeaa7',
            opacity: 0.8,
            fadeDirection: -1,
            lifetime: 40,
            isTrail: true
        });
    },

    /**
     * Update method that handles special particle types
     */
    updateSpecialParticles() {
        this.particles = this.particles.filter(particle => {
            if (particle.isBurst || particle.isSparkle || particle.isTrail || particle.isConfetti) {
                particle.lifetime--;
                particle.opacity -= 0.02;
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                
                if (particle.isConfetti) {
                    particle.speedY += 0.1; // Gravity
                    particle.rotation += particle.rotationSpeed;
                }
                
                return particle.lifetime > 0 && particle.opacity > 0;
            }
            return true;
        });
    },

    /**
     * Set particle count (for performance)
     */
    setParticleCount(count) {
        this.config.maxParticles = count;
        this.createParticles();
    },

    /**
     * Toggle connection lines
     */
    toggleConnections(enabled) {
        this.config.connectLines = enabled;
    }
};

// Make available globally
window.ParticleSystem = ParticleSystem;
