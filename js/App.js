/**
 * LexiQuest - Main Application
 * Orchestrates all game modules and manages application state
 */

class LexiQuestApp {
    constructor() {
        // App state
        this.currentScreen = 'loading';
        this.player = null;
        this.currentWorld = null;
        this.currentLevel = null;
        this.currentGame = null;
        
        // Module references
        this.matchingGame = null;
        this.memoryGame = null;
        this.sentenceGame = null;

        // DOM references
        this.screens = {};
        this.elements = {};
        
        // Bind methods
        this.handleResize = this.handleResize.bind(this);
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('🎮 LexiQuest initializing...');
            
            // Cache DOM elements
            this.cacheElements();
            console.log('DOM elements cached');
            
            // Load player data
            this.loadPlayerData();
            console.log('Player data loaded:', this.player);
            
            // Initialize modules
            await this.initModules();
            console.log('Modules initialized');
            
            // Setup event listeners
            this.setupEventListeners();
            console.log('Event listeners set up');
            
            // Show appropriate screen
            await this.showInitialScreen();
            console.log('Initial screen shown');
            
            console.log('✅ LexiQuest ready!');
        } catch (error) {
            console.error('❌ LexiQuest initialization failed:', error);
            // Try to show welcome screen anyway
            this.showScreen('welcome');
        }
    }

    /**
     * Cache DOM elements for quick access
     */
    cacheElements() {
        // Screens (matching actual HTML IDs)
        this.screens = {
            loading: document.getElementById('loadingScreen'),
            welcome: document.getElementById('welcomeScreen'),
            hub: document.getElementById('hubScreen'),
            level: document.getElementById('levelScreen'),
            game: document.getElementById('gameScreen'),
            result: document.getElementById('resultScreen')
        };

        // UI Elements
        this.elements = {
            // Loading
            loadingProgress: document.getElementById('loadingProgress'),
            loadingStatus: document.getElementById('loadingText'),
            
            // Character creation
            characterNameInput: document.getElementById('characterName'),
            characterPreview: document.getElementById('characterPreview'),
            characterAvatar: document.getElementById('characterAvatar'),
            avatarOptions: document.querySelectorAll('.avatar-btn'),
            petOptions: document.querySelectorAll('.pet-btn'),
            characterNameDisplay: document.getElementById('characterNameDisplay'),
            
            // HUD (Hub screen)
            playerName: document.getElementById('hubPlayerName'),
            playerLevel: document.getElementById('hubPlayerLevel'),
            playerAvatar: document.getElementById('hubPlayerAvatar'),
            xpProgress: document.getElementById('xpProgress'),
            coinCount: document.getElementById('coinCount'),
            gemCount: document.getElementById('gemCount'),
            
            // Story
            storyBanner: document.getElementById('storyBanner'),
            storyText: document.getElementById('storyText'),
            storyClose: document.getElementById('storyClose'),
            
            // World Map
            worldMap: document.getElementById('worldMap'),
            
            // Level screen
            levelGrid: document.getElementById('levelGrid'),
            levelWorldName: document.getElementById('levelWorldName'),
            
            // Game screen
            gameTitle: document.getElementById('gameTitle'),
            gameContainer: document.getElementById('gameContainer'),
            gameItemsContainer: document.getElementById('itemsContainer'),
            dropZonesContainer: document.getElementById('dropZones'),
            gameScore: document.getElementById('gameScore'),
            gameProgress: document.getElementById('gameProgress'),
            gameTimer: document.getElementById('gameTimer'),
            
            // Result screen
            resultStars: document.getElementById('resultStars'),
            resultScore: document.getElementById('resultScore'),
            resultXP: document.getElementById('resultXP'),
            resultCoins: document.getElementById('resultCoins'),
            
            // Modals
            settingsModal: document.getElementById('settingsModal'),
            narratorModal: document.getElementById('narratorModal'),
            
            // Canvas
            particleCanvas: document.getElementById('particleCanvas')
        };
    }

    /**
     * Load player data from storage
     */
    loadPlayerData() {
        this.player = Storage.player.load();
    }

    /**
     * Initialize all modules
     */
    async initModules() {
        try {
            // Update loading progress
            this.updateLoadingProgress(10, 'Initializing particles...');
            console.log('Initializing particles...');
            
            // Initialize particle system
            if (window.ParticleSystem) {
                ParticleSystem.init(this.elements.particleCanvas);
                ParticleSystem.createFloatingParticles(30);
            }
            
            this.updateLoadingProgress(30, 'Loading audio...');
            console.log('Loading audio...');
            
            // Initialize audio
            if (window.AudioManager) {
                await AudioManager.init();
            }
            
            this.updateLoadingProgress(50, 'Setting up speech...');
            console.log('Setting up speech...');
            
            // Initialize speech
            if (window.SpeechManager) {
                await SpeechManager.init();
            }
            
            this.updateLoadingProgress(70, 'Preparing games...');
            console.log('Preparing games...');
            
            // Initialize game instances
            if (window.MatchingGame) {
                this.matchingGame = new MatchingGame({
                    container: this.elements.gameItemsContainer || document.getElementById('itemsContainer'),
                    dropZones: this.elements.dropZonesContainer || document.getElementById('dropZones'),
                    onComplete: (result) => this.handleLevelComplete(result),
                    onScoreChange: (score, delta) => this.updateGameScore(score, delta),
                    onProgress: (current, total) => this.updateGameProgress(current, total)
                });
            }
            
            if (window.MemoryGame) {
                this.memoryGame = new MemoryGame({
                    container: this.elements.gameItemsContainer || document.getElementById('itemsContainer'),
                    onComplete: (result) => this.handleLevelComplete(result),
                    onScoreChange: (score, delta) => this.updateGameScore(score, delta),
                    onProgress: (current, total) => this.updateGameProgress(current, total)
                });
            }

            if (window.SentenceGame) {
                this.sentenceGame = new SentenceGame({
                    container: this.elements.gameItemsContainer || document.getElementById('itemsContainer'),
                    dropZones: this.elements.dropZonesContainer || document.getElementById('dropZones'),
                    onComplete: (result) => this.handleLevelComplete(result),
                    onScoreChange: (score, delta) => this.updateGameScore(score, delta),
                    onProgress: (current, total) => this.updateGameProgress(current, total)
                });
            }

            this.updateLoadingProgress(90, 'Almost ready...');
            console.log('Almost ready...');
            
            // Initialize hand tracking (optional - don't block if unavailable)
            if (window.HandTracking) {
                try {
                    await HandTracking.init();
                } catch (e) {
                    console.log('Hand tracking not available');
                }
            }
            
            this.updateLoadingProgress(100, 'Ready!');
            console.log('Modules initialization complete!');
        } catch (error) {
            console.error('Error initializing modules:', error);
            // Continue anyway - don't block the app
            this.updateLoadingProgress(100, 'Ready!');
        }
    }

    /**
     * Update loading progress
     */
    updateLoadingProgress(percent, status) {
        console.log(`Loading: ${percent}% - ${status}`);
        const progressEl = this.elements.loadingProgress || document.getElementById('loadingProgress');
        const statusEl = this.elements.loadingStatus || document.getElementById('loadingText');
        
        if (progressEl) {
            progressEl.style.width = `${percent}%`;
        }
        if (statusEl) {
            statusEl.textContent = status;
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Window resize
        const debouncedResize = window.Helpers && Helpers.debounce 
            ? Helpers.debounce(this.handleResize, 250) 
            : this.handleResize;
        window.addEventListener('resize', debouncedResize);
        
        // Welcome screen - Start Adventure
        document.getElementById('startAdventureBtn')?.addEventListener('click', () => {
            this.createCharacter();
        });
        
        // Character name input live update
        this.elements.characterNameInput?.addEventListener('input', (e) => {
            const name = e.target.value.trim() || 'Hero';
            if (this.elements.characterNameDisplay) {
                this.elements.characterNameDisplay.textContent = name;
            }
        });
        
        // Avatar selection
        this.elements.avatarOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.selectAvatar(option);
            });
        });
        
        // Pet selection
        this.elements.petOptions?.forEach(option => {
            option.addEventListener('click', () => {
                this.selectPet(option);
            });
        });
        
        // World nodes click
        document.querySelectorAll('.world-node[data-unlocked="true"]').forEach(node => {
            node.addEventListener('click', () => {
                const worldId = node.dataset.world;
                this.selectWorld(worldId);
            });
        });
        
        // Story banner close
        this.elements.storyClose?.addEventListener('click', () => {
            this.elements.storyBanner.classList.add('hidden');
        });
        
        // Settings button
        document.getElementById('settingsBtn')?.addEventListener('click', () => {
            this.showSettings();
        });
        
        // Achievements button
        document.getElementById('achievementsBtn')?.addEventListener('click', () => {
            this.showAchievements();
        });
        
        // Back to hub from level screen
        document.getElementById('levelBackBtn')?.addEventListener('click', () => {
            this.showScreen('hub');
        });
        
        // Game screen - Back button
        document.getElementById('gameBackBtn')?.addEventListener('click', () => {
            this.exitGame();
        });
        
        // Game screen - Hint button
        document.getElementById('hintBtn')?.addEventListener('click', () => {
            this.showHint();
        });
        
        // Game screen - Settings button
        document.getElementById('gameSettingsBtn')?.addEventListener('click', () => {
            this.showSettings();
        });
        
        // Result screen - Next level
        document.getElementById('nextLevelBtn')?.addEventListener('click', () => {
            this.goToNextLevel();
        });
        
        // Result screen - Replay
        document.getElementById('replayBtn')?.addEventListener('click', () => {
            this.replayLevel();
        });
        
        // Result screen - Back to hub
        document.getElementById('backToHubFromResultBtn')?.addEventListener('click', () => {
            this.showScreen('hub');
            this.updateWorldMap();
        });
        
        // Settings modal close
        document.getElementById('closeSettingsBtn')?.addEventListener('click', () => {
            this.hideModal(this.elements.settingsModal);
        });
        
        // Settings toggles
        document.getElementById('soundToggle')?.addEventListener('change', (e) => {
            AudioManager.setEnabled(e.target.checked);
            Storage.settings.save('soundEnabled', e.target.checked);
        });
        
        document.getElementById('speechToggle')?.addEventListener('change', (e) => {
            SpeechManager.enabled = e.target.checked;
            Storage.settings.save('speechEnabled', e.target.checked);
        });
        
        document.getElementById('particleToggle')?.addEventListener('change', (e) => {
            ParticleSystem.enabled = e.target.checked;
            Storage.settings.save('particlesEnabled', e.target.checked);
        });
        
        // Prevent context menu on game elements
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.game-item') || e.target.closest('.drop-zone')) {
                e.preventDefault();
            }
        });

        // Floating camera toggle
        document.getElementById('cameraToggle')?.addEventListener('click', () => {
            if (window.HandTracking) {
                HandTracking.toggle();
                const settings = Storage.settings.load();
                Storage.settings.save('handTrackingEnabled', HandTracking.enabled);
                if (settings && settings.handTrackingEnabled !== HandTracking.enabled) {
                    // keep in sync
                }
            }
        });

        // Settings: wire reading speed slider to speech speed (slow/clear)
        document.getElementById('readingSpeed')?.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            if (window.SpeechManager) SpeechManager.setSpeed(speed);
        });

        // Hub bottom tabs: implement a simple Hero editor
        document.querySelectorAll('.bottom-nav .nav-btn')?.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                document.querySelectorAll('.bottom-nav .nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                if (tab === 'character') {
                    this.openCharacterEditor();
                }
            });
        });
    }

    /**
     * Open a simple character editor (name/avatar/pet) from the hub.
     */
    openCharacterEditor() {
        if (!this.player) this.player = Storage.player.load();
        if (!this.player) return;

        // If already open, don't duplicate
        if (document.getElementById('characterEditorModal')) {
            document.getElementById('characterEditorModal').classList.add('active');
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'characterEditorModal';
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content settings-content">
                <div class="modal-header">
                    <h2>👤 Your Hero</h2>
                    <button class="modal-close" id="characterEditorClose">✕</button>
                </div>
                <div class="modal-body">
                    <div class="setting-group">
                        <label>Name</label>
                        <input type="text" id="editHeroName" value="${this.player.name || 'Hero'}" maxlength="12" style="padding:12px 14px;border-radius:12px;background:rgba(255,255,255,0.1);color:inherit;" />
                    </div>

                    <div class="setting-group">
                        <label>Avatar</label>
                        <div style="display:flex;flex-wrap:wrap;gap:10px;">
                            ${['🧒','👧','👦','🧒🏽','👧🏿','👦🏻','🦸','🧚'].map(a => `<button class="icon-btn" data-edit-avatar="${a}" style="font-size:28px;width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,0.08);">${a}</button>`).join('')}
                        </div>
                    </div>

                    <div class="setting-group">
                        <label>Companion</label>
                        <div style="display:flex;flex-wrap:wrap;gap:10px;">
                            ${['🐱','🐶','🐰','🦊','🐲','🦄','🐼','🦉'].map(p => `<button class="icon-btn" data-edit-pet="${p}" style="font-size:28px;width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,0.08);">${p}</button>`).join('')}
                        </div>
                    </div>

                    <button class="btn btn-primary" id="saveHeroChanges">Save</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const close = () => modal.classList.remove('active');
        modal.querySelector('#characterEditorClose')?.addEventListener('click', close);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) close();
        });

        modal.querySelectorAll('[data-edit-avatar]')?.forEach(btn => {
            btn.addEventListener('click', () => {
                this.player.avatar = btn.dataset.editAvatar;
                this.updateHUD();
                Storage.player.save(this.player);
                SpeechManager.speakClear('Avatar changed');
            });
        });

        modal.querySelectorAll('[data-edit-pet]')?.forEach(btn => {
            btn.addEventListener('click', () => {
                this.player.pet = btn.dataset.editPet;
                Storage.player.save(this.player);
                SpeechManager.speakClear('Companion changed');
            });
        });

        modal.querySelector('#saveHeroChanges')?.addEventListener('click', () => {
            const newName = modal.querySelector('#editHeroName')?.value?.trim() || 'Hero';
            this.player.name = newName;
            Storage.player.save(this.player);
            this.updateHUD();
            SpeechManager.speakStory(`Okay, ${newName}. Your hero is ready.`, () => {});
            close();
        });
    }

    /**
     * Show initial screen based on player data
     */
    async showInitialScreen() {
        console.log('showInitialScreen called');
        
        // Short delay for loading effect
        await new Promise(resolve => setTimeout(resolve, 800));
        
        console.log('Delay complete, player:', this.player);
        
        if (this.player && this.player.name) {
            // Returning player - go directly to hub
            console.log('Returning player, showing hub');
            this.updateHUD();
            this.showScreen('hub');
            this.updateWorldMap();
            if (window.SpeechManager) {
                SpeechManager.speak(`Welcome back, ${this.player.name}!`);
            }
        } else {
            // New player - show welcome/character creation
            console.log('New player, showing welcome');
            this.showScreen('welcome');
        }
    }

    /**
     * Show a specific screen
     */
    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            if (screen) {
                screen.classList.remove('active');
            }
        });
        
        // Show target screen
        const targetScreen = this.screens[screenName];
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
        
        this.currentScreen = screenName;
        
        // Play transition sound
        AudioManager.play('click');
    }

    /**
     * Select avatar in character creation
     */
    selectAvatar(option) {
        // Remove selection from all
        this.elements.avatarOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Add selection to clicked
        option.classList.add('selected');
        
        // Update preview
        const emoji = option.dataset.avatar;
        const avatarBase = document.querySelector('.avatar-base');
        if (avatarBase) {
            avatarBase.textContent = emoji;
        }
        
        AudioManager.play('click');
    }

    /**
     * Select pet companion
     */
    selectPet(option) {
        // Remove selection from all
        this.elements.petOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Add selection to clicked
        option.classList.add('selected');
        
        // Update preview
        const emoji = option.dataset.pet;
        const avatarPet = document.getElementById('avatarPet');
        if (avatarPet) {
            avatarPet.textContent = emoji;
        }
        
        AudioManager.play('click');
    }

    /**
     * Create new character
     */
    createCharacter() {
        const name = this.elements.characterNameInput?.value.trim() || 'Hero';
        
        const selectedAvatar = document.querySelector('.avatar-btn.selected');
        const avatar = selectedAvatar?.dataset.avatar || '�';
        
        const selectedPet = document.querySelector('.pet-btn.selected');
        const pet = selectedPet?.dataset.pet || '🐱';
        
        // Create player
        this.player = {
            name: name,
            avatar: avatar,
            pet: pet,
            level: 1,
            xp: 0,
            coins: 0,
            gems: 0,
            createdAt: Date.now()
        };
        
        // Save to storage
        Storage.player.save(this.player);
        
        // Update UI
        this.updateHUD();
        this.updateWorldMap();
        
        // Show hub/world map
        this.showScreen('hub');
        
        // Welcome message
        SpeechManager.speak(`Welcome ${name}! Let's start your adventure!`);
        ParticleSystem.celebrate(window.innerWidth / 2, window.innerHeight / 2);
    }

    /**
     * Update HUD with player data
     */
    updateHUD() {
        if (!this.player) return;
        
        if (this.elements.playerName) {
            this.elements.playerName.textContent = this.player.name;
        }
        
        if (this.elements.playerLevel) {
            this.elements.playerLevel.textContent = this.player.level || 1;
        }
        
        if (this.elements.playerAvatar) {
            this.elements.playerAvatar.textContent = this.player.avatar || '🧒';
        }
        
        const xpForNextLevel = Progression.getXPToNextLevel(this.player.level || 1);
        const currentXP = this.player.xp || 0;
        const progress = Math.min((currentXP / xpForNextLevel) * 100, 100);
        
        if (this.elements.xpProgress) {
            this.elements.xpProgress.style.width = `${progress}%`;
        }
        
        if (this.elements.coinCount) {
            this.elements.coinCount.textContent = this.player.coins || 0;
        }
        
        if (this.elements.gemCount) {
            this.elements.gemCount.textContent = this.player.gems || 0;
        }
    }

    /**
     * Update world map with progress
     */
    updateWorldMap() {
        const worldNodes = document.querySelectorAll('.world-node');
        const playerProgress = Storage.progress.load();
        const worlds = WorldData.getAllWorlds();
        
        worldNodes.forEach((node, index) => {
            const worldId = node.dataset.world;
            const world = WorldData.getWorld(worldId);
            if (!world) return;
            
            const worldProgress = playerProgress[worldId] || {};
            const completedLevels = Object.values(worldProgress).filter(l => l.completed).length;
            
            // Update progress display
            const progressFill = node.querySelector('.progress-fill');
            const progressText = node.querySelector('.world-progress span');
            
            if (progressFill) {
                progressFill.style.width = `${(completedLevels / world.totalLevels) * 100}%`;
            }
            if (progressText) {
                progressText.textContent = `${completedLevels}/${world.totalLevels}`;
            }
            
            // All worlds are unlocked from the start
            const isUnlocked = true;
            node.dataset.unlocked = 'true';
            
            const statusEl = node.querySelector('.world-status');
            if (statusEl) {
                if (isUnlocked) {
                    statusEl.classList.add('unlocked');
                    statusEl.classList.remove('locked');
                    statusEl.innerHTML = '✨';
                } else {
                    statusEl.classList.add('locked');
                    statusEl.classList.remove('unlocked');
                    statusEl.innerHTML = '🔒';
                }
            }
        });
        
        // Re-bind click events for unlocked worlds
        document.querySelectorAll('.world-node[data-unlocked="true"]').forEach(node => {
            node.style.cursor = 'pointer';
            node.onclick = () => {
                const worldId = node.dataset.world;
                this.selectWorld(worldId);
            };
        });
    }

    /**
     * Check if a world is unlocked
     */
    isWorldUnlocked(worldId, progress) {
        // All worlds are unlocked from the start
        return true;
    }

    /**
     * Select a world and show its levels
     */
    selectWorld(worldId) {
        const world = WorldData.getWorld(worldId);
        if (!world) return;
        
        this.currentWorld = world;
        
        // Update story banner
        if (this.elements.storyText) {
            this.elements.storyText.textContent = world.storyIntro;
        }
        if (this.elements.storyBanner) {
            this.elements.storyBanner.classList.remove('hidden');
        }
        
        // Speak the story intro
        SpeechManager.speak(world.storyIntro);
        
        // Show level select
        this.showLevelSelect(world);
    }

    /**
     * Show level selection for a world
     */
    showLevelSelect(world) {
        // Update level screen title
        const worldTitle = document.getElementById('worldTitle');
        if (worldTitle) {
            const h2 = worldTitle.querySelector('h2');
            const icon = worldTitle.querySelector('.world-icon-small');
            if (h2) h2.textContent = world.name;
            if (icon) icon.textContent = world.icon;
        }
        
        // Update story text
        const worldStoryText = document.getElementById('worldStoryText');
        if (worldStoryText) {
            worldStoryText.textContent = world.storyIntro;
        }
        
        // Get level grid
        const levelGrid = document.getElementById('levelsGrid');
        if (!levelGrid) return;
        
        levelGrid.innerHTML = '';
        
        const playerProgress = Storage.progress.load();
        const worldProgress = playerProgress[world.id] || {};
        
        // Add levels
        world.levels.forEach((level, index) => {
            const levelProgress = worldProgress[level.number] || {};
            const isUnlocked = index === 0 || worldProgress[world.levels[index - 1]?.number]?.completed;
            
            const levelCard = document.createElement('div');
            levelCard.className = 'level-card';
            
            if (!isUnlocked) {
                levelCard.classList.add('locked');
            }
            
            if (levelProgress.completed) {
                levelCard.classList.add('completed');
            }
            
            // Stars display
            const stars = levelProgress.stars || 0;
            const starsHtml = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
            
            levelCard.innerHTML = `
                <div class="level-number">${level.number}</div>
                <div class="level-name">${level.name}</div>
                <div class="level-stars">${starsHtml}</div>
                ${!isUnlocked ? '<div class="lock-icon">🔒</div>' : ''}
            `;
            
            if (isUnlocked) {
                levelCard.style.cursor = 'pointer';
                levelCard.addEventListener('click', () => this.startLevel(world.id, level.number));
            }
            
            levelGrid.appendChild(levelCard);
        });
        
        // Show level screen
        this.showScreen('level');
    }

    /**
     * Show achievements panel
     */
    showAchievements() {
        // TODO: Implement achievements modal
        SpeechManager.speak('Achievements coming soon!');
    }

    /**
     * Start a level
     */
    startLevel(worldId, levelNumber) {
        const world = WorldData.getWorld(worldId);
        const level = WorldData.getLevel(worldId, levelNumber);
        
        if (!world || !level) return;
        
        this.currentWorld = world;
        this.currentLevel = level;
        
        // Update game title
        const gameTitle = document.getElementById('gameTitle');
        if (gameTitle) {
            gameTitle.textContent = `${world.name} - ${level.name}`;
        }
        
        // Reset score display
        this.updateGameScore(0, 0);
        this.updateGameProgress(0, 1);
        
        // Show game screen
        this.showScreen('game');
        
        // Show level intro
        SpeechManager.speak(level.description);
        
        // Start the level after a brief delay
        setTimeout(() => this.startCurrentLevel(), 500);
    }

    /**
     * Start the current level's game
     */
    startCurrentLevel() {
        const level = this.currentLevel;
        const world = this.currentWorld;

        if (!level || !world) return;

        // Always start hand tracking for gesture-based drag and drop
        if (window.HandTracking && !HandTracking.enabled) {
            HandTracking.start();
        }

        // Speak level narration slowly and clearly when present
        if (level.narration) {
            SpeechManager.speakStory(level.narration);
        } else if (level.description) {
            SpeechManager.speakClear(level.description);
        }

        // Get game configuration based on world type
        let gameConfig;

        switch (world.id) {
            case 'letters':
                gameConfig = LetterGames.getGameConfig(level);
                break;
            case 'colors':
                gameConfig = ColorGames.getGameConfig(level);
                break;
            case 'words':
                gameConfig = WordGames.getGameConfig(level);
                break;
            case 'numbers':
                gameConfig = NumberGames.getGameConfig(level);
                break;
            case 'stories':
                gameConfig = {
                    type: 'sentence',
                    gameType: 'word-order',
                    sentence: StoryGames.getSentenceForLevel(level),
                    level
                };
                break;
            default:
                gameConfig = LetterGames.getGameConfig(level);
        }

        // Get containers
        const itemsContainer = document.getElementById('itemsContainer');
        const dropZones = document.getElementById('dropZones');

        // Initialize appropriate game type
        if (world.id === 'stories') {
            this.currentGame = this.sentenceGame;
            this.sentenceGame.container = itemsContainer;
            this.sentenceGame.dropZones = dropZones;
            this.sentenceGame.init(gameConfig);
        } else if (level.type === 'memory') {
            if (dropZones) dropZones.style.display = 'none';
            this.currentGame = this.memoryGame;
            this.memoryGame.container = itemsContainer;
            this.memoryGame.init(gameConfig.pairs);
        } else {
            if (dropZones) dropZones.style.display = 'flex';
            this.currentGame = this.matchingGame;
            this.matchingGame.container = itemsContainer;
            this.matchingGame.dropZones = dropZones;
            this.matchingGame.init(gameConfig.pairs);
        }

        AudioManager.play('levelStart');
    }

    /**
     * Show narrator modal
     */
    showNarrator(emoji, text, onContinue) {
        if (!this.elements.narratorModal) return;
        
        this.elements.narratorEmoji.textContent = emoji;
        this.elements.narratorText.textContent = text;
        
        this.showModal(this.elements.narratorModal);
        
        // Store callback for continue button
        this.narratorCallback = onContinue;
    }

    /**
     * Show modal
     */
    showModal(modal) {
        if (!modal) return;
        modal.style.display = 'flex';
        requestAnimationFrame(() => modal.classList.add('active'));
    }

    /**
     * Hide modal
     */
    hideModal(modal) {
        if (!modal) return;
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
    }

    /**
     * Update game score display
     */
    updateGameScore(score, delta) {
        if (this.elements.gameScore) {
            this.elements.gameScore.textContent = score;
            
            if (delta > 0) {
                this.elements.gameScore.classList.add('score-up');
                setTimeout(() => this.elements.gameScore.classList.remove('score-up'), 300);
            } else if (delta < 0) {
                this.elements.gameScore.classList.add('score-down');
                setTimeout(() => this.elements.gameScore.classList.remove('score-down'), 300);
            }
        }
    }

    /**
     * Update game progress display
     */
    updateGameProgress(current, total) {
        if (this.elements.gameProgress) {
            this.elements.gameProgress.textContent = `${current}/${total}`;
        }
    }

    /**
     * Handle level completion
     */
    handleLevelComplete(result) {
        console.log('Level complete!', result);
        
        // Calculate XP
        const xpEarned = Math.floor(result.score / 10) + (result.stars * 50);
        const coinsEarned = Math.floor(result.score / 20);
        
        // Update player
        if (this.player) {
            this.player.xp = (this.player.xp || 0) + xpEarned;
            this.player.coins = (this.player.coins || 0) + coinsEarned;
            
            // Check for level up
            const xpNeeded = Progression.getXPToNextLevel(this.player.level || 1);
            if (this.player.xp >= xpNeeded) {
                const newLevel = (this.player.level || 1) + 1;
                this.player.level = newLevel;
                this.player.xp = this.player.xp - xpNeeded;
                
                // Level up celebration
                setTimeout(() => {
                    this.showLevelUpCelebration(newLevel);
                }, 1500);
            }
            
            Storage.player.save(this.player);
            this.updateHUD();
        }
        
        // Save level progress
        Storage.progress.saveLevel(this.currentWorld.id, this.currentLevel.number, {
            completed: true,
            score: result.score,
            stars: result.stars,
            time: result.time
        });
        
        // Show result screen
        this.showResultScreen(result, xpEarned, coinsEarned);
    }

    /**
     * Show result/completion screen
     */
    showResultScreen(result, xpEarned, coinsEarned) {
        // Update result screen elements
        const resultStars = document.getElementById('resultStars');
        if (resultStars) {
            resultStars.innerHTML = '';
            for (let i = 0; i < 3; i++) {
                const star = document.createElement('span');
                star.className = 'result-star' + (i < result.stars ? ' earned' : '');
                star.textContent = i < result.stars ? '⭐' : '☆';
                resultStars.appendChild(star);
            }
        }
        
        const resultScore = document.getElementById('resultScore');
        if (resultScore) {
            resultScore.textContent = result.score;
        }
        
        const resultXP = document.getElementById('resultXP');
        if (resultXP) {
            resultXP.textContent = `+${xpEarned} XP`;
        }
        
        const resultCoins = document.getElementById('resultCoins');
        if (resultCoins) {
            resultCoins.textContent = `+${coinsEarned}`;
        }
        
        this.showScreen('result');
        
        // Celebration
        AudioManager.play('levelComplete');
        ParticleSystem.createFirework(window.innerWidth / 2, 100);
        
        if (result.stars === 3) {
            SpeechManager.speak('Perfect! You got all three stars!');
        } else if (result.stars === 2) {
            SpeechManager.speak('Great job! You earned two stars!');
        } else {
            SpeechManager.speak('Level complete! Keep practicing for more stars!');
        }
    }

    /**
     * Show level up celebration
     */
    showLevelUpCelebration(newLevel) {
        // Create level up overlay
        const overlay = document.createElement('div');
        overlay.className = 'level-up-overlay';
        overlay.innerHTML = `
            <div class="level-up-content">
                <div class="level-up-text">LEVEL UP!</div>
                <div class="new-level">Level ${newLevel}</div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Celebration effects
        ParticleSystem.createFirework(window.innerWidth / 2, window.innerHeight / 2);
        AudioManager.play('levelUp');
        SpeechManager.speak(`Congratulations! You reached level ${newLevel}!`);
        
        // Remove after animation
        setTimeout(() => {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 500);
        }, 3000);
    }

    /**
     * Go to next level
     */
    goToNextLevel() {
        const currentLevelNum = this.currentLevel.number;
        const nextLevel = WorldData.getLevel(this.currentWorld.id, currentLevelNum + 1);
        
        if (nextLevel) {
            this.startLevel(this.currentWorld.id, nextLevel.number);
        } else {
            // World complete - go back to hub
            SpeechManager.speak(`Amazing! You completed ${this.currentWorld.name}!`);
            this.showScreen('hub');
            this.updateWorldMap();
        }
    }

    /**
     * Replay current level
     */
    replayLevel() {
        this.startLevel(this.currentWorld.id, this.currentLevel.number);
    }

    /**
     * Exit current game
     */
    exitGame() {
        if (this.currentGame) {
            this.currentGame.pause();
        }

        // Stop hand tracking when leaving game
        if (window.HandTracking && HandTracking.enabled) {
            HandTracking.stop();
        }

        if (this.currentWorld) {
            this.showLevelSelect(this.currentWorld);
        } else {
            this.showScreen('hub');
            this.updateWorldMap();
        }
    }

    /**
     * Show hint
     */
    showHint() {
        if (this.currentGame) {
            this.currentGame.getHint();
            AudioManager.play('hint');
        }
    }

    /**
     * Show settings
     */
    showSettings() {
        // Load current settings
        const settings = {
            soundEnabled: Storage.settings.load('soundEnabled', true),
            speechEnabled: Storage.settings.load('speechEnabled', true),
            particlesEnabled: Storage.settings.load('particlesEnabled', true)
        };
        
        // Update toggles
        const soundToggle = document.getElementById('soundToggle');
        const speechToggle = document.getElementById('speechToggle');
        const particleToggle = document.getElementById('particleToggle');
        
        if (soundToggle) soundToggle.checked = settings.soundEnabled;
        if (speechToggle) speechToggle.checked = settings.speechEnabled;
        if (particleToggle) particleToggle.checked = settings.particlesEnabled;
        
        this.showModal(this.elements.settingsModal);
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Update particle canvas
        if (ParticleSystem.resize) {
            ParticleSystem.resize();
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOMContentLoaded - Starting LexiQuest...');
    
    // Fallback: If app doesn't load in 5 seconds, force show welcome screen
    const fallbackTimeout = setTimeout(() => {
        console.warn('Timeout: Forcing welcome screen...');
        document.getElementById('loadingScreen')?.classList.remove('active');
        document.getElementById('welcomeScreen')?.classList.add('active');
    }, 5000);
    
    try {
        window.app = new LexiQuestApp();
        console.log('App instance created');
        window.app.init().then(() => {
            clearTimeout(fallbackTimeout);
        }).catch(err => {
            console.error('Failed to initialize LexiQuest:', err);
            clearTimeout(fallbackTimeout);
            // Force show welcome screen on error
            document.getElementById('loadingScreen')?.classList.remove('active');
            document.getElementById('welcomeScreen')?.classList.add('active');
        });
    } catch (err) {
        console.error('Error creating app:', err);
        clearTimeout(fallbackTimeout);
    }
});
