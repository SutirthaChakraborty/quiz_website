/**
 * LexiQuest - Storage Manager
 * Handles persistent data storage using localStorage
 */

const Storage = {
    KEYS: {
        PLAYER: 'lexiquest_player',
        SETTINGS: 'lexiquest_settings',
        PROGRESS: 'lexiquest_progress',
        ACHIEVEMENTS: 'lexiquest_achievements'
    },

    /**
     * Default player data
     */
    defaultPlayer: {
        name: 'Hero',
        avatar: '🧒',
        pet: '🐱',
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        coins: 0,
        gems: 0,
        hints: 3,
        freezes: 1,
        skips: 1,
        createdAt: null,
        lastPlayedAt: null,
        totalPlayTime: 0,
        gamesCompleted: 0,
        totalScore: 0
    },

    /**
     * Default settings
     */
    defaultSettings: {
        soundEnabled: true,
        musicEnabled: true,
        voiceEnabled: true,
        handTrackingEnabled: true,
        dyslexiaFontEnabled: true,
        readingSpeed: 0.8,
        vibrationEnabled: true,
        highContrastMode: false
    },

    /**
     * Default progress data
     */
    defaultProgress: {
        worlds: {
            letters: { unlocked: true, stars: 0, levels: {} },
            colors: { unlocked: false, stars: 0, levels: {} },
            words: { unlocked: false, stars: 0, levels: {} },
            numbers: { unlocked: false, stars: 0, levels: {} },
            stories: { unlocked: false, stars: 0, levels: {} }
        },
        currentWorld: 'letters',
        currentLevel: 1
    },

    /**
     * Default achievements
     */
    defaultAchievements: {
        firstSteps: { unlocked: false, name: 'First Steps', description: 'Complete your first level' },
        starCollector: { unlocked: false, name: 'Star Collector', description: 'Earn 10 stars' },
        perfectScore: { unlocked: false, name: 'Perfect!', description: 'Get 3 stars on any level' },
        speedster: { unlocked: false, name: 'Speedster', description: 'Complete a level in under 30 seconds' },
        persistent: { unlocked: false, name: 'Persistent', description: 'Play for 10 minutes' },
        explorer: { unlocked: false, name: 'Explorer', description: 'Unlock a new world' },
        coinCollector: { unlocked: false, name: 'Coin Collector', description: 'Collect 500 coins' },
        letterMaster: { unlocked: false, name: 'Letter Master', description: 'Complete Letter Kingdom' },
        colorMaster: { unlocked: false, name: 'Color Master', description: 'Complete Color Valley' },
        wordMaster: { unlocked: false, name: 'Word Master', description: 'Complete Word Forest' }
    },

    /**
     * Save data to localStorage
     */
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Storage save error:', e);
            return false;
        }
    },

    /**
     * Load data from localStorage
     */
    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Storage load error:', e);
            return defaultValue;
        }
    },

    /**
     * Remove data from localStorage
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    },

    /**
     * Clear all game data
     */
    clearAll() {
        Object.values(this.KEYS).forEach(key => this.remove(key));
    },

    // ============ Player Data ============

    /**
     * Get player data
     */
    getPlayer() {
        const player = this.load(this.KEYS.PLAYER, null);
        if (!player) {
            return { ...this.defaultPlayer, createdAt: Date.now() };
        }
        return { ...this.defaultPlayer, ...player };
    },

    /**
     * Save player data
     */
    savePlayer(playerData) {
        const current = this.getPlayer();
        const updated = { 
            ...current, 
            ...playerData, 
            lastPlayedAt: Date.now() 
        };
        return this.save(this.KEYS.PLAYER, updated);
    },

    /**
     * Update player XP and handle level ups
     */
    addXP(amount) {
        const player = this.getPlayer();
        player.xp += amount;
        
        let leveledUp = false;
        while (player.xp >= player.xpToNextLevel) {
            player.xp -= player.xpToNextLevel;
            player.level++;
            player.xpToNextLevel = Math.floor(player.xpToNextLevel * 1.5);
            player.coins += 100; // Bonus coins on level up
            player.hints++; // Bonus hint on level up
            leveledUp = true;
        }
        
        this.savePlayer(player);
        return { player, leveledUp };
    },

    /**
     * Add coins to player
     */
    addCoins(amount) {
        const player = this.getPlayer();
        player.coins += amount;
        this.savePlayer(player);
        return player.coins;
    },

    /**
     * Add gems to player
     */
    addGems(amount) {
        const player = this.getPlayer();
        player.gems += amount;
        this.savePlayer(player);
        return player.gems;
    },

    /**
     * Use a power-up
     */
    usePowerUp(type) {
        const player = this.getPlayer();
        if (player[type] > 0) {
            player[type]--;
            this.savePlayer(player);
            return true;
        }
        return false;
    },

    // ============ Settings ============

    /**
     * Get settings
     */
    getSettings() {
        const settings = this.load(this.KEYS.SETTINGS, null);
        return { ...this.defaultSettings, ...settings };
    },

    /**
     * Save settings
     */
    saveSettings(settingsData) {
        const current = this.getSettings();
        return this.save(this.KEYS.SETTINGS, { ...current, ...settingsData });
    },

    /**
     * Toggle a setting
     */
    toggleSetting(key) {
        const settings = this.getSettings();
        settings[key] = !settings[key];
        this.saveSettings(settings);
        return settings[key];
    },

    // ============ Progress ============

    /**
     * Get progress data
     */
    getProgress() {
        const progress = this.load(this.KEYS.PROGRESS, null);
        if (!progress) {
            return { ...this.defaultProgress };
        }
        // Merge with defaults to ensure new worlds are included
        return {
            ...this.defaultProgress,
            ...progress,
            worlds: { ...this.defaultProgress.worlds, ...progress.worlds }
        };
    },

    /**
     * Save progress
     */
    saveProgress(progressData) {
        const current = this.getProgress();
        return this.save(this.KEYS.PROGRESS, { ...current, ...progressData });
    },

    /**
     * Complete a level
     */
    completeLevel(worldId, levelNumber, stars, score) {
        const progress = this.getProgress();
        const world = progress.worlds[worldId];
        
        if (!world) return null;

        // Update level data
        const existingStars = world.levels[levelNumber]?.stars || 0;
        const newStars = Math.max(existingStars, stars);
        
        world.levels[levelNumber] = {
            completed: true,
            stars: newStars,
            bestScore: Math.max(world.levels[levelNumber]?.bestScore || 0, score),
            completedAt: Date.now()
        };

        // Recalculate world stars
        world.stars = Object.values(world.levels).reduce((sum, level) => sum + (level.stars || 0), 0);

        // Check if next world should be unlocked
        const worldOrder = ['letters', 'colors', 'words', 'numbers', 'stories'];
        const currentIndex = worldOrder.indexOf(worldId);
        
        if (currentIndex < worldOrder.length - 1) {
            const completedLevels = Object.keys(world.levels).length;
            if (completedLevels >= 5) { // Unlock next world after 5 levels
                const nextWorld = worldOrder[currentIndex + 1];
                if (!progress.worlds[nextWorld].unlocked) {
                    progress.worlds[nextWorld].unlocked = true;
                }
            }
        }

        this.saveProgress(progress);
        
        // Update player stats
        const player = this.getPlayer();
        player.gamesCompleted++;
        player.totalScore += score;
        this.savePlayer(player);

        return {
            starsEarned: newStars - existingStars,
            totalWorldStars: world.stars,
            worldUnlocked: null // TODO: return newly unlocked world if any
        };
    },

    /**
     * Get level data
     */
    getLevelData(worldId, levelNumber) {
        const progress = this.getProgress();
        return progress.worlds[worldId]?.levels[levelNumber] || null;
    },

    /**
     * Check if level is unlocked
     */
    isLevelUnlocked(worldId, levelNumber) {
        if (levelNumber === 1) return true;
        
        const progress = this.getProgress();
        const world = progress.worlds[worldId];
        
        if (!world || !world.unlocked) return false;
        
        // Level is unlocked if previous level is completed
        return world.levels[levelNumber - 1]?.completed || false;
    },

    // ============ Achievements ============

    /**
     * Get achievements
     */
    getAchievements() {
        const achievements = this.load(this.KEYS.ACHIEVEMENTS, null);
        return { ...this.defaultAchievements, ...achievements };
    },

    /**
     * Unlock an achievement
     */
    unlockAchievement(achievementId) {
        const achievements = this.getAchievements();
        
        if (achievements[achievementId] && !achievements[achievementId].unlocked) {
            achievements[achievementId].unlocked = true;
            achievements[achievementId].unlockedAt = Date.now();
            this.save(this.KEYS.ACHIEVEMENTS, achievements);
            return achievements[achievementId];
        }
        
        return null;
    },

    /**
     * Check and unlock achievements based on current state
     */
    checkAchievements() {
        const player = this.getPlayer();
        const progress = this.getProgress();
        const unlockedAchievements = [];

        // First Steps
        if (player.gamesCompleted >= 1) {
            const result = this.unlockAchievement('firstSteps');
            if (result) unlockedAchievements.push(result);
        }

        // Star Collector
        const totalStars = Object.values(progress.worlds).reduce((sum, w) => sum + w.stars, 0);
        if (totalStars >= 10) {
            const result = this.unlockAchievement('starCollector');
            if (result) unlockedAchievements.push(result);
        }

        // Coin Collector
        if (player.coins >= 500) {
            const result = this.unlockAchievement('coinCollector');
            if (result) unlockedAchievements.push(result);
        }

        // Explorer - unlocked a new world
        const unlockedWorlds = Object.values(progress.worlds).filter(w => w.unlocked).length;
        if (unlockedWorlds >= 2) {
            const result = this.unlockAchievement('explorer');
            if (result) unlockedAchievements.push(result);
        }

        return unlockedAchievements;
    },

    /**
     * Check if this is a new player
     */
    isNewPlayer() {
        return !this.load(this.KEYS.PLAYER);
    },

    /**
     * Export all data (for backup)
     */
    exportData() {
        return {
            player: this.getPlayer(),
            settings: this.getSettings(),
            progress: this.getProgress(),
            achievements: this.getAchievements(),
            exportedAt: Date.now()
        };
    },

    /**
     * Import data (for restore)
     */
    importData(data) {
        if (data.player) this.save(this.KEYS.PLAYER, data.player);
        if (data.settings) this.save(this.KEYS.SETTINGS, data.settings);
        if (data.progress) this.save(this.KEYS.PROGRESS, data.progress);
        if (data.achievements) this.save(this.KEYS.ACHIEVEMENTS, data.achievements);
        return true;
    },

    // ============ Namespace Helpers ============
    // These provide an alternative API: Storage.player.load(), etc.

    /**
     * Player namespace
     */
    player: {
        load: () => Storage.getPlayer(),
        save: (data) => Storage.savePlayer(data)
    },

    /**
     * Settings namespace
     */
    settings: {
        load: (key, defaultValue) => {
            const settings = Storage.getSettings();
            if (key) {
                return settings[key] !== undefined ? settings[key] : defaultValue;
            }
            return settings;
        },
        save: (key, value) => {
            const settings = Storage.getSettings();
            settings[key] = value;
            return Storage.saveSettings(settings);
        }
    },

    /**
     * Progress namespace
     */
    progress: {
        load: () => Storage.getProgress(),
        save: (data) => Storage.save(Storage.KEYS.PROGRESS, data),
        saveLevel: (worldId, levelNum, data) => Storage.completeLevel(worldId, levelNum, data.stars || 0, data.score || 0)
    },

    /**
     * Achievements namespace
     */
    achievements: {
        load: () => Storage.getAchievements(),
        unlock: (id) => Storage.unlockAchievement(id)
    }
};

// Make available globally
window.Storage = Storage;
