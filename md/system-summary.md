# RNK Lobby - System Summary

## Technical Overview

RNK Lobby is a comprehensive maintenance mode system designed for Foundry Virtual Tabletop. It provides GMs with a flexible, full-screen overlay mechanism to prevent player access while maintaining backend server state and allowing GM-side management operations.

## Architecture

### Core Components

```
RNKLobby (Main Controller)
â”œâ”€â”€ Overlay System (Visual Representation)
â”œâ”€â”€ Settings Manager (Configuration Storage)
â”œâ”€â”€ Socket Manager (Real-time Synchronization)
â”œâ”€â”€ State Manager (Current Status Tracking)
â”œâ”€â”€ UI Applications
â”‚   â”œâ”€â”€ RNKLobbyHub (Main Dashboard)
â”‚   â”œâ”€â”€ RNKLobbyToggleWindow (Quick Toggle)
â”‚   â”œâ”€â”€ RNKLobbyAppearanceForm (Customization)
â”‚   â”œâ”€â”€ RNKLobbyCountdownForm (Timer Control)
â”‚   â”œâ”€â”€ RNKLobbyChatMonitor (Chat Tracking)
â”‚   â”œâ”€â”€ RNKLobbyHelpDialog (Documentation)
â”‚   â”œâ”€â”€ RNKLobbyPresetsManager (Configuration Management)
â”‚   â”œâ”€â”€ RNKLobbyPollManager (Player Surveys)
â”‚   â””â”€â”€ RNKLobbyAnalyticsPanel (Usage Statistics)
â””â”€â”€ Integration Layer (Sidebar, Hooks, Events)
```

### Data Flow

1. **Activation**
   - GM toggles lobby via button or settings
   - `RNKLobby.handleLobbyToggle()` is called
   - State is saved to `game.settings`
   - Socket broadcast to all clients with new state
   - Overlay is rendered on player clients

2. **Real-time Synchronization**
   - All state changes broadcast via Foundry's socket system
   - Players receive updates through socket listeners
   - Visual UI updates trigger animations
   - State persists across page reloads

3. **Deactivation**
   - Overlay fades out with CSS animations
   - Player interaction is re-enabled
   - Client-side overlay DOM is removed
   - Final state is broadcast to all clients

## Settings Management

### World-Level Settings (Shared by All Users)
- `lobbyActive` - Boolean, main lobby state
- `customMessage` - String, player-facing message
- `customImage` - String, background image path
- `appearanceSettings` - Object, visual customization
- `countdownSettings` - Object, countdown timer state
- `presets` - Array, saved appearance configurations
- `analytics` - Object, usage statistics

### Client-Level Settings (Per-User)
- `gmPreview` - Boolean, enable GM overlay viewing
- `enableSound` - Boolean, audio notifications
- `selectedPreset` - String, active preset name

## Feature Breakdown

### 1. Overlay System
**Files:** `styles/lobby.css`, `scripts/main.js`
**Key Functions:**
- `showLobbyOverlay()` - Creates and displays overlay DOM
- `hideLobbyOverlay()` - Removes overlay with animation
- `disableWorldInteraction()` - Prevents player actions
- `enableWorldInteraction()` - Re-enables player controls

**CSS Components:**
- `#rnk-lobby-overlay` - Main container
- `.rnk-lobby-content` - Content card with glassmorphism
- `.rnk-lobby-title` - Animated gradient title
- `.rnk-lobby-message` - Status message text
- `.rnk-lobby-dots` - Animated loading dots

**Animations:**
- `slideIn` - Content entrance animation
- `fadeInUp` - Element fade and rise
- `pulse` - Title brightness pulsing
- `bounce` - Loading dot animation
- `glow-rotate` - Border glow effect

### 2. Appearance Customization
**Storage:** World-level setting `appearanceSettings`
**Customizable Properties:**
- Title color (hex)
- Message color (hex)
- Button color (hex)
- Font family (string)
- Font size (CSS value)
- Background opacity (0-1)
- Animation style (preset name)

### 3. Countdown System
**Storage:** World-level setting `countdownSettings`
**Properties:**
- `isActive` - Timer running status
- `duration` - Total duration in milliseconds
- `startTime` - Timestamp when timer began
- `endTime` - Target end timestamp
- `displayFormat` - How timer appears to players

**Behavior:**
- Timer updates in real-time across all clients
- Players see countdown to re-entry
- Automatic lobby deactivation when countdown reaches zero
- Socket broadcasts every tick for synchronization

### 4. Preset System
**Storage:** World-level array `presets`
**Preset Object:**
```javascript
{
  name: "Dark Theme",
  appearance: { /* appearance settings */ },
  createdBy: "GM Username",
  createdAt: timestamp,
  uses: 15
}
```

### 5. Chat Monitoring
**Purpose:** Track player activity while lobby is active
**Features:**
- Captures chat messages in real-time
- Filters by sender and timestamp
- Displays in dedicated monitoring panel
- Stores history for session

### 6. Poll System
**Purpose:** Quick player engagement while waiting
**Poll Object:**
```javascript
{
  id: "unique-id",
  question: "Question text",
  options: ["Option 1", "Option 2"],
  votes: { "Player": "Option 1" },
  active: true,
  createdAt: timestamp
}
```

### 7. Analytics Panel
**Tracked Metrics:**
- Total lobby activations
- Average duration
- Player re-entry patterns
- Most used presets
- Common maintenance durations

## Integration Points

### Foundry Hooks
```javascript
Hooks.on("init", () => RNKLobby.init());
Hooks.on("ready", () => RNKLobby.ready());
```

### Socket System
```
Module Socket: module.rnk-lobby
Events:
- lobby-status: Broadcast lobby state changes
- lobby-request: Players request current state
```

### Sidebar Integration
- Custom sidebar button with icon
- Dynamic button state (active/inactive)
- Click handler for toggle

### Keyboard Shortcuts
- ESC key: Quick lobby toggle (GM only)

## Performance Considerations

### Optimizations
- Animations use CSS transforms (GPU-accelerated)
- Settings cached client-side
- DOM updates minimized
- Event listeners cleaned up on disable

### Resource Usage
- Overlay: ~100KB initial render
- Settings storage: ~50KB average
- Socket bandwidth: ~1KB per state change
- CPU: Minimal when inactive, <2% active

### Scalability
- Tested with 20+ concurrent players
- Countdown system updates at 100ms intervals
- Analytics storage efficient

## Security Considerations

### Player-Side Protection
- Overlay prevents interaction through CSS and event handlers
- Multiple layers of pointer-events blocking
- DevTools manipulation doesn't affect server state
- All critical decisions made server-side (GM)

## Module Dependencies

### Required
- Foundry VTT Core 12.0+
- Modern browser with ES6 support

### Recommended
- Font Awesome 5+ (for sidebar icon)

## File Structure

```
rnk-lobby/
â”œâ”€â”€ module.json              # Module metadata
â”œâ”€â”€ LICENSE                  # MIT License
â”œâ”€â”€ README.md               # User documentation
â”œâ”€â”€ system-summary.md       # Technical documentation
â”œâ”€â”€ styles/
â”‚   â”œâ”€â”€ lobby.css           # Main styling
â”‚   â””â”€â”€ control-hub.css     # Hub interface styling
â”œâ”€â”€ scripts/
â”‚   â””â”€â”€ main.js             # All functionality
â”œâ”€â”€ lang/
â”‚   â””â”€â”€ en.json            # English localization
â”œâ”€â”€ templates/
â”‚   â”œâ”€â”€ control-hub.hbs
â”‚   â”œâ”€â”€ appearance-form.hbs
â”‚   â”œâ”€â”€ countdown-form.hbs
â”‚   â”œâ”€â”€ chat-monitor.hbs
â”‚   â”œâ”€â”€ help-dialog.hbs
â”‚   â”œâ”€â”€ presets-manager.hbs
â”‚   â”œâ”€â”€ poll-manager.hbs
â”‚   â”œâ”€â”€ analytics-panel.hbs
â”‚   â””â”€â”€ toggle-controls.hbs
â””â”€â”€ assets/
    â””â”€â”€ rnk-codex.jpg # Default background image
```

## Configuration Examples

### Minimal Setup
```javascript
// Just activate the lobby with defaults
await game.settings.set(LOBBY_MODULE_ID, LOBBY_SETTING_KEY, true);
```

### Full Customization
```javascript
// Set appearance and message
await game.settings.set(LOBBY_MODULE_ID, CUSTOM_MESSAGE_KEY, "Server maintenance in progress");
await game.settings.set(LOBBY_MODULE_ID, APPEARANCE_SETTING_KEY, {
  titleColor: "#ff0000",
  messageColor: "#ffffff",
  backgroundOpacity: 0.9
});
```

## Localization

### Supported Languages
- English (en) - Default

### Adding New Languages
1. Create `lang/XX.json` file
2. Add translations for all keys in `en.json`
3. Register in `module.json`

## Troubleshooting

### Common Issues

**Image not loading**
- Verify path uses `modules/rnk-lobby/` prefix
- Check image file exists and is accessible
- Try refreshing browser

**Lobby won't toggle**
- Verify GM permissions
- Check module is enabled in world settings
- Check browser console for errors

**Players see different state**
- Check socket connectivity
- Have all players refresh browser
- Verify internet connection stability

**Countdown not working**
- Ensure countdown time is in future
- Check server clock synchronization

## License

MIT License - See LICENSE file for full text

## Credits

**Author:** RNK  
**Inspired by:** Player community feedback  
**Special Thanks:** Lisa (fiancÃ©e) for support and encouragement

---

**Last Updated:** November 2025  
**Version:** 1.0.0

