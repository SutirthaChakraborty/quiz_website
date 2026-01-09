# 🎮 LexiQuest Games

This folder contains all game types for LexiQuest. The architecture is designed to be **modular** - you can add new games without modifying any existing files!

## 📁 File Structure

```
js/games/
├── README.md           # This file
├── _GameTemplate.js    # Template for creating new games
├── MatchingGame.js     # Drag-and-drop matching game
├── MemoryGame.js       # Card flip memory game
├── SentenceGame.js     # Word ordering game
└── gameGenerators.js   # Content generators for each world
```

---

## 🚀 Adding a New Game (3 Steps!)

### Step 1: Copy the Template
```bash
cp js/games/_GameTemplate.js js/games/YourGame.js
```

### Step 2: Customize Your Game

Edit `YourGame.js`:

```javascript
// 1. Rename the class
class YourGame {
    constructor(options = {}) {
        // Keep the standard options
        this.container = options.container;
        this.dropZones = options.dropZones;
        this.onComplete = options.onComplete || (() => {});
        this.onScoreChange = options.onScoreChange || (() => {});
        this.onProgress = options.onProgress || (() => {});
        
        // Add your custom state
        this.yourCustomState = null;
    }

    // 2. Implement init() - called when level starts
    init(config) {
        // Create your game UI
        // config contains pairs/items from the generator
    }

    // 3. Implement your game logic
    handleGameComplete() {
        this.onComplete({
            score: this.score,
            stars: 3,
            time: elapsed
        });
    }

    // 4. Implement reset(), pause(), resume()
}

// 5. Update registration at the bottom
window.YourGame = YourGame;

if (window.GameRegistry) {
    GameRegistry.register('your-game', YourGame, {
        name: 'Your Game Name',
        description: 'What your game does',
        icon: '🎯',
        supportedWorlds: ['letters', 'colors'],  // Which worlds can use this game
        version: '1.0.0'
    });
}
```

### Step 3: Add to index.html

Add a single script tag (order doesn't matter for games!):

```html
<!-- In index.html, add before </body> -->
<script src="js/games/YourGame.js?v=12"></script>
```

**That's it!** Your game is now available. 🎉

---

## 🔧 How the Registry Works

### GameRegistry (`js/core/GameRegistry.js`)

The GameRegistry is the central hub that:
- Stores all registered game classes
- Creates game instances on demand
- Routes levels to the correct game type
- Manages content generators for each world

```javascript
// Games register themselves when loaded
GameRegistry.register('matching', MatchingGame, { ... });

// App uses the registry to start games
GameRegistry.startGame(world, level, containers, callbacks);
```

### Automatic Game Selection

When a level starts, GameRegistry determines which game to use:

1. **Level specifies `gameType`** → Uses that game type
2. **Level specifies `type`** → Maps to game type (e.g., 'memory' → MemoryGame)
3. **World has default** → Uses world's default game (e.g., 'stories' → SentenceGame)
4. **Fallback** → Uses MatchingGame

---

## 📝 Game Interface

All games should implement these methods:

```javascript
class MyGame {
    // REQUIRED
    constructor(options)      // Initialize with containers and callbacks
    init(config)              // Start game with level config
    reset()                   // Reset game state
    pause()                   // Pause game
    resume()                  // Resume game
    
    // OPTIONAL
    getHint()                 // Return hint for current state
    setupHandTracking()       // Setup gesture controls
    cleanupHandTracking()     // Cleanup gesture controls
}
```

### Constructor Options

```javascript
{
    container: HTMLElement,    // Main game container
    dropZones: HTMLElement,    // Drop zone container (for drag-drop)
    onComplete: Function,      // Called when game ends
    onScoreChange: Function,   // Called when score changes
    onProgress: Function       // Called when progress updates
}
```

### Config Object (passed to init)

For matching/memory games:
```javascript
{
    type: 'matching',
    gameType: 'letter-sound',
    pairs: [
        { id: 'a', item: 'A', display: 'A', emoji: '🍎', audio: 'A', ... },
        // ...
    ]
}
```

For custom games, define your own config structure.

---

## 🎨 Adding Hand Tracking (Gesture Support)

To support hand gestures (pinch to interact):

```javascript
class MyGame {
    setupHandTracking() {
        if (!window.HandTracking) return;
        
        HandTracking.on('onPinchStart', this.onHandPinchStart.bind(this));
        HandTracking.on('onPinchEnd', this.onHandPinchEnd.bind(this));
        HandTracking.on('onHandMove', this.onHandMove.bind(this));
    }
    
    onHandPinchStart(position) {
        // Find element at position.x, position.y
        const element = document.elementFromPoint(position.x, position.y);
        // Handle the pinch (grab, click, etc.)
    }
    
    onHandMove(position, isPinching) {
        // Update visual feedback
    }
}
```

---

## 🏭 Content Generators

Generators create game content for each world. They're in `gameGenerators.js`:

```javascript
const YourWorldGames = {
    createPairs(level) {
        // Generate pairs based on level config
        return [
            { id: 'item1', item: '...', target: '...' },
            // ...
        ];
    },
    
    getGameConfig(level) {
        return {
            type: level.type,
            gameType: level.gameType,
            pairs: this.createPairs(level)
        };
    }
};

// Register the generator
GameRegistry.registerGenerator('your-world', YourWorldGames);
```

---

## 🧪 Testing Your Game

1. Open browser console
2. Check if your game registered:
   ```javascript
   GameRegistry.debug();  // Lists all registered games
   ```
3. Test manually:
   ```javascript
   const game = GameRegistry.getInstance('your-game', {
       container: document.getElementById('itemsContainer'),
       onComplete: (result) => console.log('Done!', result)
   });
   game.init([{ id: '1', display: 'Test' }]);
   ```

---

## 📚 Existing Games Reference

### MatchingGame
- **Type:** `matching`
- **Worlds:** letters, colors, words, numbers
- **Mechanic:** Drag items to matching drop zones

### MemoryGame
- **Type:** `memory`
- **Worlds:** letters, colors, words, numbers
- **Mechanic:** Flip cards to find pairs

### SentenceGame
- **Type:** `sentence`
- **Worlds:** stories
- **Mechanic:** Tap/drag words in correct order

---

## 💡 Tips

1. **Keep it Simple:** Dyslexia-friendly games should have clear, large elements
2. **Audio Feedback:** Always play sounds and speak text
3. **Visual Feedback:** Use animations for correct/wrong answers
4. **Hand Tracking:** Consider gesture support for accessibility
5. **CSS Classes:** Use existing classes like `.game-item`, `.drop-zone` for consistent styling

---

## 🐛 Troubleshooting

### Game not appearing?
- Check browser console for errors
- Verify script tag is in index.html
- Confirm `GameRegistry.register()` is called

### Game not starting?
- Check `GameRegistry.debug()` output
- Verify generator is registered for the world
- Check level's `gameType` matches your registration

### Hand tracking not working?
- Ensure `setupHandTracking()` is called in `init()`
- Check `HandTracking.enabled` is true
- Verify camera permissions are granted
