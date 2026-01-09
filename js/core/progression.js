/**
 * LexiQuest - Progression System
 * Handles character growth, XP, levels, and unlocks
 */

const Progression = {
    // XP requirements for each level
    xpTable: [
        0,      // Level 1
        100,    // Level 2
        150,    // Level 3
        225,    // Level 4
        340,    // Level 5
        510,    // Level 6
        765,    // Level 7
        1150,   // Level 8
        1725,   // Level 9
        2590,   // Level 10
        3885    // Level 11+
    ],

    // Level titles
    titles: [
        { level: 1, title: 'Adventurer' },
        { level: 3, title: 'Explorer' },
        { level: 5, title: 'Scholar' },
        { level: 7, title: 'Champion' },
        { level: 10, title: 'Master' },
        { level: 15, title: 'Legend' },
        { level: 20, title: 'Hero' }
    ],

    // Unlockable accessories
    accessories: [
        { id: 'crown', emoji: '👑', requiredLevel: 5, cost: 200 },
        { id: 'wizard_hat', emoji: '🎩', requiredLevel: 3, cost: 100 },
        { id: 'star', emoji: '⭐', requiredLevel: 2, cost: 50 },
        { id: 'rainbow', emoji: '🌈', requiredLevel: 4, cost: 150 },
        { id: 'rocket', emoji: '🚀', requiredLevel: 6, cost: 250 },
        { id: 'crystal', emoji: '💎', requiredLevel: 8, cost: 400 },
        { id: 'fire', emoji: '🔥', requiredLevel: 10, cost: 500 }
    ],

    // Unlockable pets
    pets: [
        { id: 'cat', emoji: '🐱', unlocked: true, cost: 0 },
        { id: 'dog', emoji: '🐶', unlocked: true, cost: 0 },
        { id: 'rabbit', emoji: '🐰', unlocked: true, cost: 0 },
        { id: 'fox', emoji: '🦊', unlocked: true, cost: 0 },
        { id: 'dragon', emoji: '🐲', requiredLevel: 3, cost: 100 },
        { id: 'unicorn', emoji: '🦄', requiredLevel: 5, cost: 200 },
        { id: 'panda', emoji: '🐼', requiredLevel: 2, cost: 50 },
        { id: 'owl', emoji: '🦉', requiredLevel: 4, cost: 150 },
        { id: 'phoenix', emoji: '🐦‍🔥', requiredLevel: 10, cost: 500 }
    ],

    /**
     * Get XP required for a level
     */
    getXPForLevel(level) {
        if (level <= 0) return 0;
        if (level <= this.xpTable.length) {
            return this.xpTable[level - 1];
        }
        // For levels beyond the table, use formula
        return Math.floor(this.xpTable[this.xpTable.length - 1] * Math.pow(1.5, level - this.xpTable.length));
    },

    /**
     * Get XP required for next level
     */
    getXPToNextLevel(currentLevel) {
        return this.getXPForLevel(currentLevel + 1);
    },

    /**
     * Get title for a level
     */
    getTitleForLevel(level) {
        let title = this.titles[0].title;
        for (const t of this.titles) {
            if (level >= t.level) {
                title = t.title;
            }
        }
        return title;
    },

    /**
     * Calculate XP progress percentage
     */
    getXPProgress(currentXP, currentLevel) {
        const xpForCurrent = this.getXPForLevel(currentLevel);
        const xpForNext = this.getXPForLevel(currentLevel + 1);
        const xpInLevel = xpForNext - xpForCurrent;
        const progress = (currentXP / xpInLevel) * 100;
        return Math.min(progress, 100);
    },

    /**
     * Award XP and check for level up
     */
    awardXP(amount) {
        const player = Storage.player.load();
        if (!player) return { leveledUp: false };
        
        player.xp = (player.xp || 0) + amount;
        
        const xpNeeded = this.getXPToNextLevel(player.level || 1);
        let leveledUp = false;
        
        if (player.xp >= xpNeeded) {
            player.level = (player.level || 1) + 1;
            player.xp = player.xp - xpNeeded;
            leveledUp = true;
            this.grantLevelUpRewards(player.level);
        }
        
        Storage.player.save(player);
        
        return { leveledUp, player };
    },

    /**
     * Grant rewards for leveling up
     */
    grantLevelUpRewards(newLevel) {
        const player = Storage.player.load();
        if (!player) return { coinBonus: 0 };
        
        // Bonus coins
        const coinBonus = newLevel * 25;
        player.coins = (player.coins || 0) + coinBonus;

        // Bonus hints every 3 levels
        if (newLevel % 3 === 0) {
            player.hints = (player.hints || 0) + 2;
        }

        // Bonus freeze every 5 levels
        if (newLevel % 5 === 0) {
            player.freezes = (player.freezes || 0) + 1;
        }

        Storage.player.save(player);

        return { coinBonus };
    },

    /**
     * Get available accessories for purchase
     */
    getAvailableAccessories() {
        const player = Storage.player.load() || { level: 1 };
        return this.accessories.filter(acc => player.level >= acc.requiredLevel);
    },

    /**
     * Get available pets for purchase
     */
    getAvailablePets() {
        const player = Storage.player.load() || { level: 1 };
        return this.pets.filter(pet => pet.unlocked || player.level >= (pet.requiredLevel || 0));
    },

    /**
     * Purchase an item
     */
    purchaseItem(type, itemId) {
        const player = Storage.player.load();
        if (!player) return { success: false, message: 'No player data' };
        
        const items = type === 'accessory' ? this.accessories : this.pets;
        const item = items.find(i => i.id === itemId);

        if (!item) return { success: false, message: 'Item not found' };
        if (player.level < (item.requiredLevel || 0)) {
            return { success: false, message: 'Level too low' };
        }
        if ((player.coins || 0) < item.cost) {
            return { success: false, message: 'Not enough coins' };
        }

        // Deduct coins
        player.coins = (player.coins || 0) - item.cost;

        // Add to owned items
        if (!player.ownedItems) player.ownedItems = { accessories: [], pets: [] };
        if (type === 'accessory') {
            player.ownedItems.accessories.push(itemId);
        } else {
            player.ownedItems.pets.push(itemId);
        }

        Storage.player.save(player);
        return { success: true, item };
    },

    /**
     * Equip an item
     */
    equipItem(type, itemId) {
        const player = Storage.player.load();
        if (!player) return;
        
        if (type === 'accessory') {
            player.accessory = itemId;
        } else if (type === 'pet') {
            player.pet = this.pets.find(p => p.id === itemId)?.emoji || player.pet;
        }

        Storage.player.save(player);
    },

    /**
     * Get player stats summary
     */
    getStatsSummary() {
        const player = Storage.player.load() || { level: 1, xp: 0, coins: 0, gems: 0 };
        const progress = Storage.progress.load() || {};
        const achievements = Storage.achievements.load() || {};

        // Calculate total stars
        let totalStars = 0;
        Object.values(progress).forEach(world => {
            if (typeof world === 'object') {
                Object.values(world).forEach(level => {
                    if (level && level.stars) {
                        totalStars += level.stars;
                    }
                });
            }
        });

        // Calculate unlocked achievements
        const unlockedAchievements = Object.values(achievements).filter(a => a && a.unlocked).length;
        const totalAchievements = Object.keys(achievements).length || 1;

        return {
            level: player.level || 1,
            title: this.getTitleForLevel(player.level || 1),
            xp: player.xp || 0,
            xpToNext: this.getXPToNextLevel(player.level || 1),
            xpProgress: this.getXPProgress(player.xp || 0, player.level || 1),
            coins: player.coins || 0,
            gems: player.gems || 0,
            totalStars,
            gamesCompleted: player.gamesCompleted || 0,
            totalScore: player.totalScore || 0,
            achievements: `${unlockedAchievements}/${totalAchievements}`
        };
    },

    /**
     * Get daily rewards
     */
    getDailyReward() {
        const player = Storage.player.load() || {};
        const now = Date.now();
        const lastClaim = player.lastDailyClaim || 0;
        const daysSinceLastClaim = Math.floor((now - lastClaim) / (1000 * 60 * 60 * 24));

        if (daysSinceLastClaim < 1) {
            return { canClaim: false, nextClaimIn: 24 - Math.floor((now - lastClaim) / (1000 * 60 * 60)) };
        }

        // Calculate streak
        let streak = player.dailyStreak || 0;
        if (daysSinceLastClaim === 1) {
            streak++;
        } else {
            streak = 1;
        }

        // Calculate reward based on streak
        const baseCoins = 50;
        const streakBonus = Math.min(streak, 7) * 10;
        const coins = baseCoins + streakBonus;

        // Bonus items on certain streak days
        let bonusItems = [];
        if (streak === 3) bonusItems.push({ type: 'hint', amount: 1 });
        if (streak === 5) bonusItems.push({ type: 'freeze', amount: 1 });
        if (streak === 7) bonusItems.push({ type: 'gem', amount: 10 });

        return {
            canClaim: true,
            streak,
            coins,
            bonusItems
        };
    },

    /**
     * Claim daily reward
     */
    claimDailyReward() {
        const reward = this.getDailyReward();
        if (!reward.canClaim) return reward;

        const player = Storage.player.load() || {};
        
        // Add rewards
        player.coins = (player.coins || 0) + reward.coins;
        player.dailyStreak = reward.streak;
        player.lastDailyClaim = Date.now();

        // Add bonus items
        reward.bonusItems.forEach(bonus => {
            if (bonus.type === 'hint') player.hints = (player.hints || 0) + bonus.amount;
            if (bonus.type === 'freeze') player.freezes = (player.freezes || 0) + bonus.amount;
            if (bonus.type === 'gem') player.gems = (player.gems || 0) + bonus.amount;
        });

        Storage.player.save(player);

        return { ...reward, claimed: true };
    }
};

// Make available globally
window.Progression = Progression;
