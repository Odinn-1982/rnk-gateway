# RNK Lobby

A comprehensive, system-agnostic maintenance mode module for Foundry VTT that prevents players from accessing the world while the GM performs maintenance or prepares for the next session.

## Overview

RNK Lobby provides GMs with a powerful full-screen overlay system to manage player access during maintenance windows. When activated, players see a customizable maintenance message while the GM continues working behind the scenes. The system includes countdown timers, customizable appearances, chat monitoring, preset configurations, and analytics tracking.

## Key Features

### ðŸŽ­ Flexible Lobby System
- **Instant Activation** - Toggle the lobby on/off with a single click
- **Countdown Timers** - Set automatic re-entry times for players
- **Custom Messages** - Display personalized maintenance messages
- **Custom Backgrounds** - Use your own images for the overlay
- **Appearance Customization** - Control colors, fonts, opacity, and animations

### ðŸŽ¨ Visual Customization
- **Color Palette Control** - Customize title and message colors
- **Font Selection** - Choose from multiple font options
- **Animation Presets** - Apply pre-configured animation styles
- **Opacity Control** - Adjust overlay transparency
- **Responsive Design** - Looks great on all screen sizes

### â±ï¸ Advanced Features
- **Countdown Timers** - Set time for automatic player re-entry
- **Chat Monitoring** - Monitor player chat while they wait
- **Preset Configurations** - Save and load appearance presets
- **Poll System** - Create quick surveys or polls for players
- **Analytics Panel** - Track lobby usage and statistics
- **Help System** - Built-in help dialog for users

### ðŸ”§ GM Tools
- **Sidebar Button** - Easy access from the main interface
- **GM Preview Mode** - Test the lobby appearance before going live
- **Sound Notifications** - Optional audio feedback when toggling
- **Keyboard Shortcuts** - Press ESC to quickly toggle off
- **State Broadcasting** - All clients stay synchronized

## Installation

### Method 1: Foundry Module Browser
1. Open Foundry VTT
2. Go to **Add-on Modules**
3. Click **Install Module**
4. Search for "RNK Lobby"
5. Click **Install**
6. Enable the module in your world

### Method 2: Manual Installation
1. Download the latest release from the [GitHub repository](https://github.com/Odinn-1982/rnk-lobby)
2. Extract the contents to your `Data/modules` folder
3. Restart Foundry VTT
4. Enable the module in your world settings

## Quick Start

### Basic Usage
1. **Activate the Lobby**
   - Click the "Lobby" button in the left sidebar, OR
   - Use the module settings to toggle the lobby on

2. **Configure the Message** (Optional)
   - Go to Module Settings â†’ RNK Lobby
   - Set "Custom Lobby Message" to your desired text
   - Leave blank to use the default message

3. **Customize Appearance** (Optional)
   - Click the "Hub" button for full customization options
   - Adjust colors, fonts, and animations
   - Preview changes in real-time with GM Preview Mode

4. **Deactivate**
   - Click the Lobby button again, OR
   - Press ESC key, OR
   - Click "End Lobby" in the hub window

### Setting Countdown Timer
1. Open the RNK Lobby Hub
2. Click "Set Countdown"
3. Enter the duration (minutes)
4. Click "Start Countdown"
5. Players will see the timer and lobby will automatically end when time expires

## Configuration

### Module Settings

**GM Preview Mode**
- Allow yourself to see the maintenance overlay for testing
- *Scope: Client (per-user)*

**Custom Lobby Message**
- Override the default maintenance message with your own text
- *Scope: World*

**Custom Background Image**
- Path to a custom background image (e.g., `modules/rnk-lobby/assets/bg.jpg`)
- Leave blank to use the default image
- *Scope: World*

**Enable Sound Notifications**
- Play a sound when the lobby is activated or deactivated
- *Scope: Client (per-user)*

## Advanced Features

### Appearance Customization
Access the full appearance editor through the RNK Lobby Hub:
- **Title Color** - Customize the maintenance title color
- **Message Color** - Change the message text color
- **Button Color** - Customize interactive buttons
- **Font Family** - Select from available fonts
- **Font Size** - Adjust text sizes
- **Background Opacity** - Control overlay transparency
- **Animation Style** - Choose from multiple animation presets

### Presets
- **Save Presets** - Save your custom appearance settings
- **Load Presets** - Quickly apply saved configurations
- **Built-in Presets** - Several pre-configured themes included

### Chat Monitoring
While the lobby is active, you can:
- Monitor what players are saying in chat
- Track player activity during maintenance
- View chat history in the monitoring panel

### Polls
Create quick surveys while players wait:
1. Open the Poll Manager from the Hub
2. Create a poll with custom options
3. Players vote while in the lobby
4. View real-time poll results

### Analytics
Track lobby usage patterns:
- View activation/deactivation history
- Monitor average lobby duration
- Track player re-entry times
- Export data for analysis

## Troubleshooting

### Image Not Loading
- Ensure the image path is correct (e.g., `modules/rnk-lobby/assets/rnk-codex.jpg`)
- Image must be accessible from your Foundry instance
- Try refreshing the page or reloading the module

### Lobby Won't Activate
- Verify you are logged in as the GM
- Check that the module is enabled in world settings
- Try reloading the browser page
- Check browser console (F12) for error messages

### Players Can't See the Lobby
- Ensure all players have the module enabled
- Check their client settings (GM Preview Mode shouldn't interfere)
- Have them refresh their browser
- Verify socket connectivity (check console for socket errors)

### Countdown Not Working
- Ensure the countdown time is in the future
- Verify that "countdown" feature is enabled in settings
- Check that all players are synchronized

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `ESC` | Toggle lobby off (GM only) |
| `Click Lobby Button` | Toggle lobby on/off (GM only) |

## Permissions

- **GMs Only**: Activate/deactivate lobby, configure settings
- **Players**: See the lobby overlay when active
- **Everyone**: Can be affected by the lobby state

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Minimal performance impact when inactive
- Optimized animations for smooth 60 FPS
- Efficient socket communication for state synchronization
- Light resource usage even on older systems

## Credits & Acknowledgments

**Special Thanks:**
- To my amazing players who inspired this module through their patient support during maintenance sessions
- To **Lisa**, my wonderful fiancÃ©e, for endless encouragement and support throughout development

This module was created to solve real-world problems experienced during actual gameplay sessions and has been refined based on practical feedback from an engaged and supportive player community.

## Support

If you enjoy RNK Lobby, please consider supporting development:

### ðŸ’œ Patreon
Support ongoing development and get exclusive content:
[Become a Patron](https://patreon.com/RNK?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink)

### â˜• Buy Me a Coffee
Prefer one-time donations? Buy me a coffee:
[Buy Me a Coffee](https://buymeacoffee.com/RNKcodex)

### ðŸŽ® Join Our Community
Connect with other Foundry users in my Discord:
- **Server:** RNK Codex
- **Discord:** [Join our community](https://discord.gg/RNKcodex)

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## Compatibility

- **Foundry VTT Version**: 12+ (tested on 13)
- **System Compatibility**: System-agnostic (works with all game systems)
- **Browser**: Modern browsers with ES6 support

## Known Issues

None currently reported. Please report any issues on the [GitHub Issues page](https://github.com/Odinn-1982/rnk-lobby/issues).

## Roadmap

Future enhancements may include:
- Player-side countdown displays
- Integration with Foundry's built-in tools
- Additional animation styles
- More appearance customization options
- Performance optimizations for large player counts

## Contributing

Contributions are welcome! Please feel free to:
- Report bugs and issues
- Suggest new features
- Submit pull requests with improvements

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

---

## Footer

**Version:** 1.0.0  
**Author:** RNK  
**Last Updated:** November 2025  
**Repository:** [RNK Lobby on GitHub](https://github.com/Odinn-1982/rnk-lobby)

### Quick Links
- ðŸ“š [Documentation](https://github.com/Odinn-1982/rnk-lobby/wiki)
- ðŸ› [Report Issues](https://github.com/Odinn-1982/rnk-lobby/issues)
- ðŸ’¡ [Feature Requests](https://github.com/Odinn-1982/rnk-lobby/discussions)
- ðŸ¤ [Contribute](https://github.com/Odinn-1982/rnk-lobby/blob/main/CONTRIBUTING.md)

Made with â¤ï¸ for the Foundry VTT community.

Enjoy managing your maintenance sessions! ðŸŽ­


