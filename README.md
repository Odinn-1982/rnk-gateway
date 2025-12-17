# RNK Gateway

> **Next Generation Virtual Lobby for Foundry VTT**

Transform your pre-session experience with RNK Gateway — a stunning, interactive virtual lobby that keeps players engaged while you prepare the world.

![Gateway Preview](assets/codex-0.jpg)

## Features

### Virtual Gateway
- **Full-screen immersive overlay** that completely blocks world access
- Players can interact with each other without seeing or affecting the game world
- Beautiful, modern UI with smooth animations and visual effects

### Real-Time Chat
- Live chat between all connected players and GM
- Messages persist across sessions
- GM can monitor and broadcast messages
- Beautiful message bubbles with user avatars

### Live Polls
- Create instant polls with multiple options
- Real-time vote counting and percentages
- Visual progress bars for each option
- Perfect for session decisions or just fun

### Countdown Timer
- Set a countdown for when the session begins
- Animated progress bar
- Auto-deactivate gateway when countdown completes
- Customizable countdown message

### Themes & Customization
- **7 Built-in Themes**: Nexus, Crimson Dawn, Midnight Vigil, Verdant Harbor, Emberfall, Arctic Aurora, Void Walker
- Adjustable overlay opacity and blur
- Custom background images
- Custom welcome messages

### Player Presence
- See who's online in the gateway
- Character cards with avatar display
- GM crown indicator

### GM Control Hub
- Central dashboard for all gateway controls
- Easy toggle on/off
- Manage themes, countdown, chat, and polls
- Monitor player activity

## Installation

### Method 1: Module Browser (Recommended)
1. Open Foundry VTT
2. Go to **Add-on Modules** tab
3. Click **Install Module**
4. Search for "RNK Gateway"
5. Click **Install**

### Method 2: Manual Installation
1. Download the latest release
2. Extract to `Data/modules/rnk-gateway`
3. Restart Foundry VTT
4. Enable the module in your world

## Quick Start

1. **Enable the Module** in your world's module settings
2. **Open the Control Hub** by clicking the gateway icon in the sidebar
3. **Activate the Gateway** using the big toggle button
4. Players will immediately see the gateway overlay
5. Use the control hub to manage chat, polls, countdown, and appearance

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `ESC` (GM) | Deactivate Gateway |
| `ESC` (Player) | Prompt to return to login |

## Themes

| Theme | Description |
|-------|-------------|
| **Nexus** | Default indigo/purple theme |
| **Crimson Dawn** | Warm red/orange tones |
| **Midnight Vigil** | Cool blue/cyan colors |
| **Verdant Harbor** | Fresh green/teal palette |
| **Emberfall** | Warm amber/red combination |
| **Arctic Aurora** | Cyan/purple northern lights |
| **Void Walker** | Mystical purple/pink |

## Folder Structure

```
rnk-gateway/
├── module.json
├── README.md
├── assets/
│   └── codex-*.jpg (background images)
├── lang/
│   └── en.json
├── scripts/
│   └── gateway.js
├── styles/
│   └── gateway.css
└── templates/
    └── control-hub.hbs
```

## API Reference

The module exposes a global `RNKGateway` object with the following methods:

```javascript
// Toggle gateway on/off
RNKGateway.toggle(true/false);

// Start countdown (minutes)
RNKGateway.startCountdown(10, "Session begins in");

// Stop countdown
RNKGateway.stopCountdown();

// Create a poll
RNKGateway.createPoll("What quest should we do?", ["Dragon Hunt", "Dungeon Crawl", "Roleplay Session"]);

// Close active poll
RNKGateway.closePoll();

// Clear chat
RNKGateway.clearChat();

// Open control hub
RNKGateway.openControlHub();
```

## Compatibility

- **Foundry VTT**: v12+ (verified on v13)
- **System Agnostic**: Works with any game system
- **Browser Support**: All modern browsers

## Changelog

### v1.0.0
- Initial release
- Complete rebuild from RNK Lobby V2
- New modern UI design
- 7 theme presets
- Real-time chat system
- Live polling system
- Countdown timer with auto-deactivate
- GM Control Hub
- Full socket-based synchronization

## License

MIT License - See [LICENSE](LICENSE) for details.

## Credits

- **Author**: RNK
- **Foundry VTT**: https://foundryvtt.com
- Background artwork from the RNK Codex series

## Issues & Support

Found a bug? Have a feature request?

- **GitHub Issues**: [Report an Issue](https://github.com/Odinn-1982/rnk-gateway/issues)
- **Discord**: Join our community for support

---

*Made for the Foundry VTT community*
