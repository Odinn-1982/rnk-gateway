/**
 * ════════════════════════════════════════════════════════════════════════════════
 * RNK GATEWAY - Next Generation Virtual Lobby for Foundry VTT
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * A completely redesigned virtual lobby system that keeps players engaged
 * in a beautiful, interactive environment while the GM preps the world.
 * 
 * Core Features:
 * - Full-screen immersive overlay blocking world access
 * - Real-time chat between all connected users
 * - Live polls and voting system
 * - Countdown timers with completion actions
 * - Character showcase cards
 * - Multiple visual themes
 * - GM Control Hub for management
 * 
 * @author RNK
 * @version 1.0.0
 */

const MODULE_ID = "rnk-gateway";
const MODULE_TITLE = "RNK Gateway";

// ════════════════════════════════════════════════════════════════════════════════
// RNK CODEX REGISTRATION - Must be at top level before hooks
// ════════════════════════════════════════════════════════════════════════════════

// Register with RNK Codex immediately (before hooks fire)
globalThis.RNK_MODULES = globalThis.RNK_MODULES || [];
globalThis.RNK_MODULES.push({
  id: MODULE_ID,
  title: MODULE_TITLE,
  icon: 'fa-solid fa-dungeon',
  applicationClass: 'gateway-control-hub',
  windowSelector: '#gateway-control-hub',
  order: 5,
  quantumPortal: true,
  onClick: () => {
    if (globalThis.RNKGateway?.openControlHub) {
      globalThis.RNKGateway.openControlHub();
    }
  }
});
console.log(`${MODULE_TITLE} | Registered with RNK Codex (Column B)`);

// ════════════════════════════════════════════════════════════════════════════════
// CONSTANTS & CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════════

const SETTINGS = {
  GATEWAY_ACTIVE: "gatewayActive",
  GM_PREVIEW: "gmPreview",
  CUSTOM_MESSAGE: "customMessage",
  BACKGROUND_IMAGE: "backgroundImage",
  ENABLE_SOUND: "enableSound",
  APPEARANCE: "appearance",
  COUNTDOWN: "countdown",
  CHAT_HISTORY: "chatHistory",
  POLL_STATE: "pollState",
  ANALYTICS: "analytics",
  PRESETS: "presets",
  POLL_HISTORY: "pollHistory",
  COUNTDOWN_HISTORY: "countdownHistory",
  ACTIVITY_FEED: "activityFeed",
  SESSION_START: "sessionStart"
};

const SOCKET_EVENTS = {
  STATUS: "gateway:status",
  STATE_REQUEST: "gateway:request",
  STATE_SYNC: "gateway:sync",
  CHAT_SEND: "gateway:chat:send",
  CHAT_BROADCAST: "gateway:chat:broadcast",
  CHAT_CLEAR: "gateway:chat:clear",
  POLL_UPDATE: "gateway:poll:update",
  POLL_VOTE: "gateway:poll:vote",
  POLL_CLOSE: "gateway:poll:close",
  COUNTDOWN_SYNC: "gateway:countdown:sync"
};

const DEFAULT_APPEARANCE = {
  theme: "nexus",
  accentColor: "#6366f1",
  accentSecondary: "#8b5cf6",
  overlayOpacity: 0.85,
  blurStrength: 20,
  glowIntensity: 0.4,
  particleCount: 40,
  animationsEnabled: true
};

const DEFAULT_COUNTDOWN = {
  isActive: false,
  duration: 0,
  endTime: 0,
  message: "Session begins in",
  showProgressBar: true,
  autoDeactivate: true
};

const DEFAULT_POLL = {
  active: false,
  question: "",
  options: [],
  responses: {},
  allowChangeVote: true,
  showResults: true
};

const DEFAULT_ANALYTICS = {
  totalSessions: 0,
  totalTime: 0,
  sessions: [],
  featureUsage: { chat: 0, polls: 0, countdown: 0 },
  weeklyUsage: []
};

const POLL_TEMPLATES = {
  "ready-check": {
    question: "Are you ready to begin?",
    options: ["Ready!", "Need a moment", "AFK"]
  },
  "break-vote": {
    question: "Should we take a break?",
    options: ["Yes, 5 minutes", "Yes, 10 minutes", "No, let's continue"]
  },
  "decision": {
    question: "What should we do?",
    options: ["Option A", "Option B", "Let the GM decide"]
  },
  "rating": {
    question: "How was today's session?",
    options: ["Amazing!", "Great", "Good", "Okay", "Needs improvement"]
  }
};

const THEMES = {
  nexus: {
    id: "nexus",
    label: "Nexus",
    accent: "#6366f1",
    secondary: "#8b5cf6",
    glow: "rgba(99, 102, 241, 0.4)"
  },
  crimson: {
    id: "crimson",
    label: "Crimson Dawn",
    accent: "#ef4444",
    secondary: "#f97316",
    glow: "rgba(239, 68, 68, 0.4)"
  },
  midnight: {
    id: "midnight",
    label: "Midnight Vigil",
    accent: "#3b82f6",
    secondary: "#06b6d4",
    glow: "rgba(59, 130, 246, 0.4)"
  },
  verdant: {
    id: "verdant",
    label: "Verdant Harbor",
    accent: "#22c55e",
    secondary: "#14b8a6",
    glow: "rgba(34, 197, 94, 0.4)"
  },
  ember: {
    id: "ember",
    label: "Emberfall",
    accent: "#f59e0b",
    secondary: "#ef4444",
    glow: "rgba(245, 158, 11, 0.4)"
  },
  arctic: {
    id: "arctic",
    label: "Arctic Aurora",
    accent: "#06b6d4",
    secondary: "#8b5cf6",
    glow: "rgba(6, 182, 212, 0.4)"
  },
  void: {
    id: "void",
    label: "Void Walker",
    accent: "#a855f7",
    secondary: "#ec4899",
    glow: "rgba(168, 85, 247, 0.4)"
  }
};

const MAX_CHAT_MESSAGES = 100;
const MAX_PRESETS = 10;
const MAX_ACTIVITY_ITEMS = 50;
const MAX_POLL_HISTORY = 20;
const MAX_COUNTDOWN_HISTORY = 10;
const MAX_SESSIONS = 30;

// ════════════════════════════════════════════════════════════════════════════════
// MAIN GATEWAY CLASS
// ════════════════════════════════════════════════════════════════════════════════

class RNKGateway {
  // Static state
  static instance = null;
  static overlayElement = null;
  static countdownInterval = null;
  static apps = {};

  // Current state
  static state = {
    isActive: false,
    appearance: { ...DEFAULT_APPEARANCE },
    countdown: { ...DEFAULT_COUNTDOWN },
    poll: { ...DEFAULT_POLL },
    chat: [],
    customMessage: "",
    backgroundImage: "",
    sessionStart: null,
    activityFeed: [],
    presets: [],
    pollHistory: [],
    countdownHistory: [],
    analytics: { ...DEFAULT_ANALYTICS }
  };

  // ──────────────────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ──────────────────────────────────────────────────────────────────────────────

  static init() {
    console.log(`${MODULE_TITLE} | Initializing...`);
    RNKGateway.registerSettings();
    RNKGateway.registerHelpers();
    
    // Expose API
    const module = game.modules.get(MODULE_ID);
    if (module) module.api = RNKGateway;
  }

  static ready() {
    console.log(`${MODULE_TITLE} | Ready`);
    
    // Load state from settings
    RNKGateway.loadState();
    
    // Set up socket listeners
    RNKGateway.setupSocket();
    
    // Check if gateway should be active
    if (RNKGateway.state.isActive) {
      if (game.user.isGM) {
        RNKGateway.updateGMIndicator(true);
        const gmPreview = game.settings.get(MODULE_ID, SETTINGS.GM_PREVIEW);
        if (gmPreview) RNKGateway.showOverlay();
      } else {
        RNKGateway.showOverlay();
        RNKGateway.requestState();
      }
    }

    // Add GM sidebar button (fallback if codex not present)
    if (game.user.isGM) {
      setTimeout(() => RNKGateway.addSidebarButton(), 300);
    }
    
    // Register keyboard handler
    document.addEventListener("keydown", RNKGateway.onKeyDown, true);
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // SETTINGS REGISTRATION
  // ──────────────────────────────────────────────────────────────────────────────

  static registerSettings() {
    // Gateway Active
    game.settings.register(MODULE_ID, SETTINGS.GATEWAY_ACTIVE, {
      name: game.i18n.localize("GATEWAY.Settings.GatewayActive.Name"),
      hint: game.i18n.localize("GATEWAY.Settings.GatewayActive.Hint"),
      scope: "world",
      config: false,
      type: Boolean,
      default: false,
      onChange: value => RNKGateway.onGatewayToggle(value)
    });

    // GM Preview
    game.settings.register(MODULE_ID, SETTINGS.GM_PREVIEW, {
      name: game.i18n.localize("GATEWAY.Settings.GmPreview.Name"),
      hint: game.i18n.localize("GATEWAY.Settings.GmPreview.Hint"),
      scope: "client",
      config: true,
      type: Boolean,
      default: false
    });

    // Custom Message
    game.settings.register(MODULE_ID, SETTINGS.CUSTOM_MESSAGE, {
      name: game.i18n.localize("GATEWAY.Settings.CustomMessage.Name"),
      hint: game.i18n.localize("GATEWAY.Settings.CustomMessage.Hint"),
      scope: "world",
      config: true,
      type: String,
      default: ""
    });

    // Background Image
    game.settings.register(MODULE_ID, SETTINGS.BACKGROUND_IMAGE, {
      name: game.i18n.localize("GATEWAY.Settings.BackgroundImage.Name"),
      hint: game.i18n.localize("GATEWAY.Settings.BackgroundImage.Hint"),
      scope: "world",
      config: true,
      type: String,
      default: ""
    });

    // Enable Sound
    game.settings.register(MODULE_ID, SETTINGS.ENABLE_SOUND, {
      name: game.i18n.localize("GATEWAY.Settings.EnableSound.Name"),
      hint: game.i18n.localize("GATEWAY.Settings.EnableSound.Hint"),
      scope: "client",
      config: true,
      type: Boolean,
      default: true
    });

    // Appearance (hidden)
    game.settings.register(MODULE_ID, SETTINGS.APPEARANCE, {
      scope: "world",
      config: false,
      type: Object,
      default: { ...DEFAULT_APPEARANCE }
    });

    // Countdown (hidden)
    game.settings.register(MODULE_ID, SETTINGS.COUNTDOWN, {
      scope: "world",
      config: false,
      type: Object,
      default: { ...DEFAULT_COUNTDOWN }
    });

    // Chat History (hidden)
    game.settings.register(MODULE_ID, SETTINGS.CHAT_HISTORY, {
      scope: "world",
      config: false,
      type: Array,
      default: []
    });

    // Poll State (hidden)
    game.settings.register(MODULE_ID, SETTINGS.POLL_STATE, {
      scope: "world",
      config: false,
      type: Object,
      default: { ...DEFAULT_POLL }
    });

    // Analytics (hidden)
    game.settings.register(MODULE_ID, SETTINGS.ANALYTICS, {
      scope: "world",
      config: false,
      type: Object,
      default: { sessions: [], totalTime: 0 }
    });

    // Presets (hidden)
    game.settings.register(MODULE_ID, SETTINGS.PRESETS, {
      scope: "world",
      config: false,
      type: Array,
      default: []
    });

    // Poll History (hidden)
    game.settings.register(MODULE_ID, SETTINGS.POLL_HISTORY, {
      scope: "world",
      config: false,
      type: Array,
      default: []
    });

    // Countdown History (hidden)
    game.settings.register(MODULE_ID, SETTINGS.COUNTDOWN_HISTORY, {
      scope: "world",
      config: false,
      type: Array,
      default: []
    });

    // Activity Feed (hidden)
    game.settings.register(MODULE_ID, SETTINGS.ACTIVITY_FEED, {
      scope: "world",
      config: false,
      type: Array,
      default: []
    });

    // Session Start (hidden)
    game.settings.register(MODULE_ID, SETTINGS.SESSION_START, {
      scope: "world",
      config: false,
      type: Number,
      default: 0
    });
  }

  static registerHelpers() {
    if (globalThis.Handlebars) {
      Handlebars.registerHelper("gateway_eq", (a, b) => a === b);
      Handlebars.registerHelper("eq", (a, b) => a === b);
      Handlebars.registerHelper("gateway_gt", (a, b) => a > b);
      Handlebars.registerHelper("gateway_formatTime", ms => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
      });
    }
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // STATE MANAGEMENT
  // ──────────────────────────────────────────────────────────────────────────────

  static loadState() {
    RNKGateway.state = {
      isActive: game.settings.get(MODULE_ID, SETTINGS.GATEWAY_ACTIVE),
      appearance: {
        ...DEFAULT_APPEARANCE,
        ...game.settings.get(MODULE_ID, SETTINGS.APPEARANCE)
      },
      countdown: {
        ...DEFAULT_COUNTDOWN,
        ...game.settings.get(MODULE_ID, SETTINGS.COUNTDOWN)
      },
      poll: {
        ...DEFAULT_POLL,
        ...game.settings.get(MODULE_ID, SETTINGS.POLL_STATE)
      },
      chat: game.settings.get(MODULE_ID, SETTINGS.CHAT_HISTORY) || [],
      customMessage: game.settings.get(MODULE_ID, SETTINGS.CUSTOM_MESSAGE) || "",
      backgroundImage: game.settings.get(MODULE_ID, SETTINGS.BACKGROUND_IMAGE) || "",
      sessionStart: game.settings.get(MODULE_ID, SETTINGS.SESSION_START) || null,
      activityFeed: game.settings.get(MODULE_ID, SETTINGS.ACTIVITY_FEED) || [],
      presets: game.settings.get(MODULE_ID, SETTINGS.PRESETS) || [],
      pollHistory: game.settings.get(MODULE_ID, SETTINGS.POLL_HISTORY) || [],
      countdownHistory: game.settings.get(MODULE_ID, SETTINGS.COUNTDOWN_HISTORY) || [],
      analytics: {
        ...DEFAULT_ANALYTICS,
        ...game.settings.get(MODULE_ID, SETTINGS.ANALYTICS)
      }
    };
  }

  static async saveState(partial = {}) {
    const newState = { ...RNKGateway.state, ...partial };
    RNKGateway.state = newState;

    if (game.user.isGM) {
      if (partial.appearance) {
        await game.settings.set(MODULE_ID, SETTINGS.APPEARANCE, newState.appearance);
      }
      if (partial.countdown) {
        await game.settings.set(MODULE_ID, SETTINGS.COUNTDOWN, newState.countdown);
      }
      if (partial.poll) {
        await game.settings.set(MODULE_ID, SETTINGS.POLL_STATE, newState.poll);
      }
      if (partial.chat) {
        await game.settings.set(MODULE_ID, SETTINGS.CHAT_HISTORY, newState.chat.slice(-MAX_CHAT_MESSAGES));
      }
    }
  }

  static getFullState() {
    return {
      isActive: RNKGateway.state.isActive,
      appearance: { ...RNKGateway.state.appearance },
      countdown: { ...RNKGateway.state.countdown },
      poll: RNKGateway.clonePoll(RNKGateway.state.poll),
      chat: [...RNKGateway.state.chat],
      customMessage: RNKGateway.state.customMessage,
      backgroundImage: RNKGateway.state.backgroundImage
    };
  }

  static applyState(state) {
    if (!state) return;
    
    RNKGateway.state = {
      isActive: state.isActive ?? RNKGateway.state.isActive,
      appearance: { ...DEFAULT_APPEARANCE, ...state.appearance },
      countdown: { ...DEFAULT_COUNTDOWN, ...state.countdown },
      poll: RNKGateway.clonePoll(state.poll),
      chat: Array.isArray(state.chat) ? [...state.chat] : RNKGateway.state.chat,
      customMessage: state.customMessage ?? RNKGateway.state.customMessage,
      backgroundImage: state.backgroundImage ?? RNKGateway.state.backgroundImage
    };

    // Update UI
    if (RNKGateway.overlayElement) {
      RNKGateway.updateOverlayContent();
      RNKGateway.syncCountdownDisplay();
      RNKGateway.updatePollDisplay();
      RNKGateway.updateChatDisplay();
    }
  }

  static clonePoll(poll) {
    if (!poll) return { ...DEFAULT_POLL };
    return {
      ...DEFAULT_POLL,
      ...poll,
      options: Array.isArray(poll.options) ? poll.options.map(o => ({ ...o })) : [],
      responses: poll.responses ? { ...poll.responses } : {}
    };
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // SOCKET COMMUNICATION
  // ──────────────────────────────────────────────────────────────────────────────

  static setupSocket() {
    game.socket.on(`module.${MODULE_ID}`, data => RNKGateway.handleSocket(data));
  }

  static handleSocket(data) {
    if (!data?.event) return;

    switch (data.event) {
      case SOCKET_EVENTS.STATUS:
        RNKGateway.onGatewayToggle(data.isActive, { source: "socket", state: data.state });
        break;

      case SOCKET_EVENTS.STATE_REQUEST:
        if (game.user.isGM) RNKGateway.sendStateTo(data.requesterId);
        break;

      case SOCKET_EVENTS.STATE_SYNC:
        if (!data.targetId || data.targetId === game.user.id) {
          RNKGateway.applyState(data.state);
        }
        break;

      case SOCKET_EVENTS.CHAT_SEND:
        if (game.user.isGM) RNKGateway.processChatMessage(data.message);
        break;

      case SOCKET_EVENTS.CHAT_BROADCAST:
        RNKGateway.receiveChatMessage(data.message);
        break;

      case SOCKET_EVENTS.CHAT_CLEAR:
        RNKGateway.clearChat({ broadcast: false });
        break;

      case SOCKET_EVENTS.POLL_UPDATE:
        RNKGateway.receivePollUpdate(data.poll);
        break;

      case SOCKET_EVENTS.POLL_VOTE:
        if (game.user.isGM) RNKGateway.processPollVote(data.vote);
        break;

      case SOCKET_EVENTS.POLL_CLOSE:
        RNKGateway.receivePollClose();
        break;

      case SOCKET_EVENTS.COUNTDOWN_SYNC:
        RNKGateway.receiveCountdownSync(data.countdown);
        break;
    }
  }

  static emit(event, data = {}) {
    game.socket.emit(`module.${MODULE_ID}`, { event, ...data });
  }

  static requestState() {
    RNKGateway.emit(SOCKET_EVENTS.STATE_REQUEST, { requesterId: game.user.id });
  }

  static sendStateTo(targetId) {
    RNKGateway.emit(SOCKET_EVENTS.STATE_SYNC, {
      targetId,
      state: RNKGateway.getFullState()
    });
  }

  static broadcastState() {
    if (!game.user.isGM) return;
    RNKGateway.emit(SOCKET_EVENTS.STATUS, {
      isActive: RNKGateway.state.isActive,
      state: RNKGateway.getFullState()
    });
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // GATEWAY TOGGLE
  // ──────────────────────────────────────────────────────────────────────────────

  static async toggle(active = null) {
    if (!game.user.isGM) return;
    
    const newState = active ?? !RNKGateway.state.isActive;
    
    // Track sessions
    if (newState && !RNKGateway.state.isActive) {
      await RNKGateway.startSession();
    } else if (!newState && RNKGateway.state.isActive) {
      await RNKGateway.endSession();
    }
    
    await game.settings.set(MODULE_ID, SETTINGS.GATEWAY_ACTIVE, newState);
  }

  static onGatewayToggle(isActive, options = {}) {
    const { source = "setting", state = null } = options;
    
    RNKGateway.state.isActive = isActive;
    
    // Apply full state if provided
    if (state) RNKGateway.applyState(state);

    // Play sound
    if (game.settings.get(MODULE_ID, SETTINGS.ENABLE_SOUND)) {
      RNKGateway.playSound(isActive ? "activate" : "deactivate");
    }

    // Show/hide overlay
    if (isActive) {
      const gmPreview = game.user.isGM && game.settings.get(MODULE_ID, SETTINGS.GM_PREVIEW);
      if (!game.user.isGM || gmPreview) {
        RNKGateway.showOverlay();
      }
      RNKGateway.updateGMIndicator(true);
    } else {
      RNKGateway.hideOverlay();
      RNKGateway.updateGMIndicator(false);
    }

    // Update sidebar button
    RNKGateway.updateSidebarButton();

    // Broadcast state if GM initiated
    if (game.user.isGM && source !== "socket") {
      RNKGateway.broadcastState();
      ui.notifications?.info(
        isActive
          ? game.i18n.localize("GATEWAY.Notifications.Activated")
          : game.i18n.localize("GATEWAY.Notifications.Deactivated")
      );
    }

    // Update control hub if open
    if (RNKGateway.apps.hub?.rendered) {
      RNKGateway.apps.hub.render(false);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // OVERLAY MANAGEMENT
  // ──────────────────────────────────────────────────────────────────────────────

  static showOverlay() {
    if (RNKGateway.overlayElement) return;

    const overlay = RNKGateway.createOverlayElement();
    document.body.appendChild(overlay);
    RNKGateway.overlayElement = overlay;

    // Apply theme
    RNKGateway.applyTheme();
    
    // Start countdown if active
    RNKGateway.syncCountdownDisplay();
    
    // Update displays
    RNKGateway.updatePollDisplay();
    RNKGateway.updateChatDisplay();

    // Trigger entrance animation
    requestAnimationFrame(() => {
      overlay.classList.add("visible");
    });
  }

  static hideOverlay() {
    if (!RNKGateway.overlayElement) return;

    RNKGateway.overlayElement.classList.remove("visible");
    RNKGateway.overlayElement.classList.add("exiting");

    setTimeout(() => {
      RNKGateway.overlayElement?.remove();
      RNKGateway.overlayElement = null;
    }, 500);

    // Clear countdown
    if (RNKGateway.countdownInterval) {
      clearInterval(RNKGateway.countdownInterval);
      RNKGateway.countdownInterval = null;
    }
  }

  static createOverlayElement() {
    const { appearance, customMessage, backgroundImage } = RNKGateway.state;
    const theme = THEMES[appearance.theme] || THEMES.nexus;
    const bgImage = backgroundImage || `modules/${MODULE_ID}/assets/codex-0.jpg`;
    const message = customMessage || game.i18n.localize("GATEWAY.UI.DefaultMessage");

    const overlay = document.createElement("div");
    overlay.id = "rnk-gateway";
    overlay.className = `theme-${appearance.theme}`;
    overlay.innerHTML = `
      <!-- Background Layer -->
      <div class="gateway-background">
        <img src="${bgImage}" alt="" class="gateway-bg-image" />
        <div class="gateway-bg-overlay"></div>
        <div class="gateway-particles" id="gateway-particles"></div>
      </div>

      <!-- Main Container -->
      <div class="gateway-container">
        <!-- Header -->
        <header class="gateway-header">
          <div class="gateway-logo">
            <span class="gateway-logo-icon">⬡</span>
            <h1 class="gateway-title">${game.i18n.localize("GATEWAY.UI.Title")}</h1>
          </div>
          <p class="gateway-subtitle">${game.i18n.localize("GATEWAY.UI.Subtitle")}</p>
        </header>

        <!-- Main Content Grid -->
        <div class="gateway-content">
          <!-- Left Panel: Status & Info -->
          <section class="gateway-panel gateway-status-panel">
            <div class="gateway-status-card">
              <div class="gateway-status-indicator">
                <span class="gateway-status-dot"></span>
                <span class="gateway-status-label">${game.i18n.localize("GATEWAY.UI.ServerStatus")}</span>
              </div>
              <span class="gateway-status-value">${game.i18n.localize("GATEWAY.UI.Maintenance")}</span>
            </div>

            <div class="gateway-countdown-card" id="gateway-countdown">
              <div class="gateway-countdown-label">${game.i18n.localize("GATEWAY.UI.EstimatedTime")}</div>
              <div class="gateway-countdown-time" id="gateway-countdown-time">--:--</div>
              <div class="gateway-countdown-progress" id="gateway-countdown-progress">
                <div class="gateway-countdown-bar" id="gateway-countdown-bar"></div>
              </div>
            </div>

            <div class="gateway-message-card">
              <p class="gateway-message" id="gateway-message">${message}</p>
            </div>

            <!-- Character Card -->
            <div class="gateway-character-card" id="gateway-character">
              <img class="gateway-character-avatar" id="gateway-character-avatar" src="icons/svg/mystery-man.svg" alt="" />
              <div class="gateway-character-info">
                <span class="gateway-character-name" id="gateway-character-name">${game.user.name}</span>
                <span class="gateway-character-role" id="gateway-character-role">Player</span>
              </div>
            </div>
          </section>

          <!-- Center Panel: Poll -->
          <section class="gateway-panel gateway-poll-panel" id="gateway-poll-panel">
            <h2 class="gateway-panel-title">
              <i class="fas fa-poll"></i>
              ${game.i18n.localize("GATEWAY.UI.Poll.Title")}
            </h2>
            <div class="gateway-poll-content" id="gateway-poll-content">
              <p class="gateway-poll-empty">${game.i18n.localize("GATEWAY.UI.Poll.NoActive")}</p>
            </div>
          </section>

          <!-- Right Panel: Chat -->
          <section class="gateway-panel gateway-chat-panel">
            <h2 class="gateway-panel-title">
              <i class="fas fa-comments"></i>
              Gateway Chat
            </h2>
            <div class="gateway-chat-messages" id="gateway-chat-messages"></div>
            <form class="gateway-chat-form" id="gateway-chat-form">
              <input 
                type="text" 
                class="gateway-chat-input" 
                id="gateway-chat-input"
                placeholder="${game.i18n.localize("GATEWAY.UI.ChatPlaceholder")}"
                maxlength="500"
                autocomplete="off"
              />
              <button type="submit" class="gateway-chat-send">
                <i class="fas fa-paper-plane"></i>
              </button>
            </form>
          </section>
        </div>

        <!-- Players Online -->
        <footer class="gateway-footer">
          <div class="gateway-players" id="gateway-players">
            <span class="gateway-players-label">${game.i18n.localize("GATEWAY.UI.Players.Title")}:</span>
            <div class="gateway-players-list" id="gateway-players-list"></div>
          </div>
        </footer>
      </div>

      <!-- GM Preview Badge -->
      ${game.user.isGM ? '<div class="gateway-gm-badge">GM Preview Mode - Press ESC to exit</div>' : ''}
    `;

    // Bind events
    RNKGateway.bindOverlayEvents(overlay);

    // Generate particles
    RNKGateway.generateParticles(overlay.querySelector("#gateway-particles"), appearance.particleCount);

    // Update character display
    RNKGateway.updateCharacterDisplay(overlay);

    // Update players list
    RNKGateway.updatePlayersDisplay(overlay);

    return overlay;
  }

  static bindOverlayEvents(overlay) {
    // Chat form submission
    const chatForm = overlay.querySelector("#gateway-chat-form");
    const chatInput = overlay.querySelector("#gateway-chat-input");
    
    chatForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const content = chatInput.value.trim();
      if (content) {
        RNKGateway.sendChatMessage(content);
        chatInput.value = "";
      }
    });

    // Poll voting
    overlay.addEventListener("click", (e) => {
      const option = e.target.closest(".gateway-poll-option");
      if (option && !option.classList.contains("disabled")) {
        const optionId = option.dataset.optionId;
        if (optionId) RNKGateway.vote(optionId);
      }
    });
  }

  static generateParticles(container, count) {
    if (!container) return;
    container.innerHTML = "";
    
    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div");
      particle.className = "gateway-particle";
      particle.style.setProperty("--delay", `${Math.random() * 20}s`);
      particle.style.setProperty("--x", `${Math.random() * 100}%`);
      particle.style.setProperty("--size", `${2 + Math.random() * 4}px`);
      particle.style.setProperty("--duration", `${15 + Math.random() * 15}s`);
      container.appendChild(particle);
    }
  }

  static updateOverlayContent() {
    if (!RNKGateway.overlayElement) return;

    const { customMessage, backgroundImage } = RNKGateway.state;
    
    // Update message
    const messageEl = RNKGateway.overlayElement.querySelector("#gateway-message");
    if (messageEl) {
      messageEl.textContent = customMessage || game.i18n.localize("GATEWAY.UI.DefaultMessage");
    }

    // Update background
    const bgImage = RNKGateway.overlayElement.querySelector(".gateway-bg-image");
    if (bgImage && backgroundImage) {
      bgImage.src = backgroundImage;
    }
  }

  static updateCharacterDisplay(container = RNKGateway.overlayElement) {
    if (!container) return;

    const actor = game.user.character;
    const avatar = container.querySelector("#gateway-character-avatar");
    const name = container.querySelector("#gateway-character-name");
    const role = container.querySelector("#gateway-character-role");

    if (actor) {
      if (avatar) avatar.src = actor.img || "icons/svg/mystery-man.svg";
      if (name) name.textContent = actor.name;
      if (role) role.textContent = actor.type || "Character";
    } else {
      if (avatar) avatar.src = game.user.avatar || "icons/svg/mystery-man.svg";
      if (name) name.textContent = game.user.name;
      if (role) role.textContent = game.user.isGM ? "Game Master" : "Player";
    }
  }

  static updatePlayersDisplay(container = RNKGateway.overlayElement) {
    if (!container) return;

    const listEl = container.querySelector("#gateway-players-list");
    if (!listEl) return;

    const onlineUsers = game.users.filter(u => u.active);
    listEl.innerHTML = onlineUsers.map(user => `
      <div class="gateway-player ${user.isGM ? 'gm' : ''}">
        <img src="${user.avatar || 'icons/svg/mystery-man.svg'}" alt="" class="gateway-player-avatar" />
        <span class="gateway-player-name">${user.name}</span>
        ${user.isGM ? '<i class="fas fa-crown gateway-player-crown"></i>' : ''}
      </div>
    `).join("");
  }

  static applyTheme() {
    if (!RNKGateway.overlayElement) return;

    const { appearance } = RNKGateway.state;
    const theme = THEMES[appearance.theme] || THEMES.nexus;

    RNKGateway.overlayElement.className = `theme-${appearance.theme}`;
    RNKGateway.overlayElement.style.setProperty("--gateway-accent", theme.accent);
    RNKGateway.overlayElement.style.setProperty("--gateway-accent-secondary", theme.secondary);
    RNKGateway.overlayElement.style.setProperty("--gateway-glow", theme.glow);
    RNKGateway.overlayElement.style.setProperty("--gateway-overlay-opacity", appearance.overlayOpacity);
    RNKGateway.overlayElement.style.setProperty("--gateway-blur", `${appearance.blurStrength}px`);
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // COUNTDOWN TIMER
  // ──────────────────────────────────────────────────────────────────────────────

  static async startCountdown(minutes, message = "Session begins in", autoDeactivate = true, showProgressBar = true) {
    if (!game.user.isGM) return;

    const duration = minutes * 60 * 1000;
    const endTime = Date.now() + duration;

    const countdown = {
      isActive: true,
      duration,
      endTime,
      message,
      showProgressBar,
      autoDeactivate
    };

    await RNKGateway.saveState({ countdown });
    await game.settings.set(MODULE_ID, SETTINGS.COUNTDOWN, countdown);
    
    // Save to history
    await RNKGateway.saveCountdownToHistory(countdown);
    
    // Add activity
    RNKGateway.addActivity("countdown", `Countdown started: <strong>${minutes} minutes</strong>`, "fa-play");
    
    RNKGateway.syncCountdownDisplay();
    RNKGateway.emit(SOCKET_EVENTS.COUNTDOWN_SYNC, { countdown });
  }

  static async stopCountdown() {
    if (!game.user.isGM) return;

    const countdown = { ...DEFAULT_COUNTDOWN };
    await RNKGateway.saveState({ countdown });
    await game.settings.set(MODULE_ID, SETTINGS.COUNTDOWN, countdown);
    
    RNKGateway.syncCountdownDisplay();
    RNKGateway.emit(SOCKET_EVENTS.COUNTDOWN_SYNC, { countdown });
  }

  static receiveCountdownSync(countdown) {
    RNKGateway.state.countdown = { ...DEFAULT_COUNTDOWN, ...countdown };
    RNKGateway.syncCountdownDisplay();
  }

  static syncCountdownDisplay() {
    if (!RNKGateway.overlayElement) return;

    const { countdown } = RNKGateway.state;
    const container = RNKGateway.overlayElement.querySelector("#gateway-countdown");
    const timeDisplay = RNKGateway.overlayElement.querySelector("#gateway-countdown-time");
    const progressBar = RNKGateway.overlayElement.querySelector("#gateway-countdown-bar");

    // Clear existing interval
    if (RNKGateway.countdownInterval) {
      clearInterval(RNKGateway.countdownInterval);
      RNKGateway.countdownInterval = null;
    }

    if (!countdown.isActive || countdown.endTime <= Date.now()) {
      container?.classList.add("hidden");
      return;
    }

    container?.classList.remove("hidden");

    const updateDisplay = () => {
      const remaining = Math.max(0, countdown.endTime - Date.now());
      const progress = 1 - (remaining / countdown.duration);

      if (remaining <= 0) {
        clearInterval(RNKGateway.countdownInterval);
        RNKGateway.countdownInterval = null;
        
        if (timeDisplay) timeDisplay.textContent = game.i18n.localize("GATEWAY.UI.Countdown.Complete");
        if (progressBar) progressBar.style.width = "100%";

        // Auto-deactivate if GM
        if (game.user.isGM && countdown.autoDeactivate) {
          setTimeout(() => RNKGateway.toggle(false), 2000);
        }
        return;
      }

      // Format time
      const seconds = Math.floor(remaining / 1000);
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      
      if (timeDisplay) {
        timeDisplay.textContent = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      }

      if (progressBar) {
        progressBar.style.width = `${progress * 100}%`;
      }
    };

    updateDisplay();
    RNKGateway.countdownInterval = setInterval(updateDisplay, 1000);
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // CHAT SYSTEM
  // ──────────────────────────────────────────────────────────────────────────────

  static sendChatMessage(content) {
    const message = {
      id: foundry.utils.randomID(),
      userId: game.user.id,
      author: game.user.name,
      avatar: game.user.avatar,
      content: content.substring(0, 500),
      timestamp: Date.now(),
      isGM: game.user.isGM
    };

    if (game.user.isGM) {
      RNKGateway.processChatMessage(message);
    } else {
      RNKGateway.emit(SOCKET_EVENTS.CHAT_SEND, { message });
    }
  }

  static processChatMessage(message) {
    if (!game.user.isGM) return;

    // Add to state
    RNKGateway.state.chat = [...RNKGateway.state.chat, message].slice(-MAX_CHAT_MESSAGES);
    console.log("RNK Gateway: Chat message processed, total messages:", RNKGateway.state.chat.length);
    RNKGateway.saveState({ chat: RNKGateway.state.chat });

    // Broadcast
    RNKGateway.emit(SOCKET_EVENTS.CHAT_BROADCAST, { message });
    
    // Update local display
    RNKGateway.receiveChatMessage(message);
  }

  static receiveChatMessage(message) {
    if (!RNKGateway.state.chat.find(m => m.id === message.id)) {
      RNKGateway.state.chat = [...RNKGateway.state.chat, message].slice(-MAX_CHAT_MESSAGES);
    }
    RNKGateway.updateChatDisplay();
    
    // Update control hub chat monitor
    if (RNKGateway.apps.hub?.rendered) {
      RNKGateway.apps.hub.render(false);
    }
  }

  static updateChatDisplay() {
    if (!RNKGateway.overlayElement) return;

    const container = RNKGateway.overlayElement.querySelector("#gateway-chat-messages");
    if (!container) return;

    container.innerHTML = RNKGateway.state.chat.map(msg => `
      <div class="gateway-chat-message ${msg.isGM ? 'gm' : ''} ${msg.userId === game.user.id ? 'self' : ''}">
        <img src="${msg.avatar || 'icons/svg/mystery-man.svg'}" alt="" class="gateway-chat-avatar" />
        <div class="gateway-chat-content">
          <span class="gateway-chat-author">${msg.author}${msg.isGM ? ' <i class="fas fa-crown"></i>' : ''}</span>
          <p class="gateway-chat-text">${RNKGateway.escapeHtml(msg.content)}</p>
        </div>
      </div>
    `).join("");

    container.scrollTop = container.scrollHeight;
  }

  static async clearChat(options = { broadcast: true }) {
    RNKGateway.state.chat = [];
    
    if (game.user.isGM) {
      await RNKGateway.saveState({ chat: [] });
      if (options.broadcast) {
        RNKGateway.emit(SOCKET_EVENTS.CHAT_CLEAR, {});
      }
    }

    RNKGateway.updateChatDisplay();
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // POLL SYSTEM
  // ──────────────────────────────────────────────────────────────────────────────

  static async createPoll(question, options) {
    if (!game.user.isGM) return false;

    const trimmedQuestion = question?.trim();
    const validOptions = options
      .map(o => o.trim())
      .filter((o, i, arr) => o && arr.indexOf(o) === i);

    if (!trimmedQuestion || validOptions.length < 2) {
      ui.notifications?.warn("Please provide a question and at least 2 unique options.");
      return false;
    }

    const poll = {
      active: true,
      question: trimmedQuestion,
      options: validOptions.map(text => ({
        id: foundry.utils.randomID(),
        text,
        votes: 0
      })),
      responses: {},
      allowChangeVote: true,
      showResults: true
    };

    await RNKGateway.saveState({ poll });
    await game.settings.set(MODULE_ID, SETTINGS.POLL_STATE, poll);
    
    RNKGateway.emit(SOCKET_EVENTS.POLL_UPDATE, { poll });
    RNKGateway.updatePollDisplay();

    // Add activity
    RNKGateway.addActivity("poll", `Poll created: <strong>${trimmedQuestion}</strong>`, "fa-poll");

    ui.notifications?.info(game.i18n.localize("GATEWAY.Notifications.PollCreated"));
    return true;
  }

  static vote(optionId) {
    if (!RNKGateway.state.poll.active) return;

    RNKGateway.emit(SOCKET_EVENTS.POLL_VOTE, {
      vote: {
        optionId,
        userId: game.user.id,
        userName: game.user.name
      }
    });
  }

  static processPollVote(vote) {
    if (!game.user.isGM) return;
    if (!RNKGateway.state.poll.active) return;
    if (!vote?.optionId || !vote?.userId) return;

    // Record vote
    RNKGateway.state.poll.responses[vote.userId] = vote.optionId;

    // Recalculate totals
    const tallies = {};
    Object.values(RNKGateway.state.poll.responses).forEach(optId => {
      tallies[optId] = (tallies[optId] || 0) + 1;
    });

    RNKGateway.state.poll.options = RNKGateway.state.poll.options.map(opt => ({
      ...opt,
      votes: tallies[opt.id] || 0
    }));

    RNKGateway.saveState({ poll: RNKGateway.state.poll });
    RNKGateway.emit(SOCKET_EVENTS.POLL_UPDATE, { poll: RNKGateway.state.poll });
    RNKGateway.updatePollDisplay();
  }

  static receivePollUpdate(poll) {
    RNKGateway.state.poll = RNKGateway.clonePoll(poll);
    RNKGateway.updatePollDisplay();
  }

  static async closePoll() {
    if (!game.user.isGM) return;

    // Save to history before closing
    await RNKGateway.savePollToHistory(RNKGateway.state.poll);
    
    // Add activity
    const totalVotes = RNKGateway.state.poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
    RNKGateway.addActivity("poll", `Poll ended with <strong>${totalVotes} votes</strong>`, "fa-poll");

    const poll = { ...DEFAULT_POLL };
    await RNKGateway.saveState({ poll });
    await game.settings.set(MODULE_ID, SETTINGS.POLL_STATE, poll);
    
    RNKGateway.emit(SOCKET_EVENTS.POLL_CLOSE, {});
    RNKGateway.updatePollDisplay();

    ui.notifications?.info(game.i18n.localize("GATEWAY.Notifications.PollClosed"));
  }

  static receivePollClose() {
    RNKGateway.state.poll = { ...DEFAULT_POLL };
    RNKGateway.updatePollDisplay();
  }

  static updatePollDisplay() {
    if (!RNKGateway.overlayElement) return;

    const container = RNKGateway.overlayElement.querySelector("#gateway-poll-content");
    if (!container) return;

    const { poll } = RNKGateway.state;

    if (!poll.active) {
      container.innerHTML = `
        <p class="gateway-poll-empty">${game.i18n.localize("GATEWAY.UI.Poll.NoActive")}</p>
        <p class="gateway-poll-waiting">${game.i18n.localize("GATEWAY.UI.Poll.Waiting")}</p>
      `;
      return;
    }

    const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
    const userVote = poll.responses[game.user.id];

    container.innerHTML = `
      <p class="gateway-poll-question">${RNKGateway.escapeHtml(poll.question)}</p>
      <div class="gateway-poll-options">
        ${poll.options.map(opt => {
          const votes = opt.votes || 0;
          const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
          const isSelected = userVote === opt.id;

          return `
            <button class="gateway-poll-option ${isSelected ? 'selected' : ''}" data-option-id="${opt.id}">
              <span class="gateway-poll-option-text">${RNKGateway.escapeHtml(opt.text)}</span>
              <span class="gateway-poll-option-stats">${votes} vote${votes !== 1 ? 's' : ''} · ${percentage}%</span>
              <div class="gateway-poll-option-bar" style="width: ${percentage}%"></div>
            </button>
          `;
        }).join("")}
      </div>
      <p class="gateway-poll-total">${totalVotes} total vote${totalVotes !== 1 ? 's' : ''}</p>
    `;
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // GM SIDEBAR BUTTON
  // ──────────────────────────────────────────────────────────────────────────────

  static addSidebarButton() {
    // Don't add button if Codex is handling it
    if (globalThis.RNKCodex) {
      console.log("Gateway: Codex detected, skipping sidebar button injection");
      return;
    }

    // Find sidebar menu - V13 uses menu.flexcol, older versions use #sidebar-tabs
    const sidebarMenu = document.querySelector('#sidebar menu.flexcol') || document.querySelector('#sidebar-tabs');
    if (!sidebarMenu) return;

    // Remove existing button
    document.getElementById("rnk-gateway-sidebar-li")?.remove();

    // Find insertion point - before collapse button or after settings
    const collapseLi = sidebarMenu.querySelector('li:has(button[data-action="toggleState"])');
    const settingsLi = sidebarMenu.querySelector('li:has(button[data-tab="settings"])');

    // Create list item wrapper
    const li = document.createElement("li");
    li.id = "rnk-gateway-sidebar-li";

    // Create button
    const button = document.createElement("button");
    button.type = "button";
    button.id = "rnk-gateway-button";
    button.className = "ui-control plain icon fa-solid fa-dungeon";
    button.setAttribute("data-action", "rnk-gateway");
    button.setAttribute("aria-label", "Gateway Control Hub");
    button.setAttribute("data-tooltip", game.i18n.localize("GATEWAY.Tooltips.OpenHub"));
    button.title = "Gateway Control Hub";

    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      RNKGateway.openControlHub();
    });

    // Add notification pip
    const pip = document.createElement("div");
    pip.className = "notification-pip";

    li.appendChild(button);
    li.appendChild(pip);

    // Insert button
    if (collapseLi) {
      collapseLi.insertAdjacentElement("beforebegin", li);
    } else if (settingsLi) {
      settingsLi.insertAdjacentElement("afterend", li);
    } else {
      sidebarMenu.appendChild(li);
    }

    RNKGateway.updateSidebarButton();
  }

  static updateSidebarButton() {
    const button = document.getElementById("rnk-gateway-button");
    if (!button) return;

    if (RNKGateway.state.isActive) {
      button.classList.add("active");
      button.style.color = "var(--color-shadow-primary, #ff6b6b)";
      button.style.textShadow = "0 0 10px currentColor";
    } else {
      button.classList.remove("active");
      button.style.color = "";
      button.style.textShadow = "";
    }
  }

  static updateGMIndicator(active) {
    // Could add a visual indicator to the GM's UI showing gateway is active
    // For now, the sidebar button state handles this
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // CONTROL HUB
  // ──────────────────────────────────────────────────────────────────────────────

  static openControlHub() {
    if (!game.user.isGM) return;

    if (!RNKGateway.apps.hub) {
      RNKGateway.apps.hub = new GatewayControlHub();
    }
    RNKGateway.apps.hub.render(true);
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // KEYBOARD HANDLING
  // ──────────────────────────────────────────────────────────────────────────────

  static onKeyDown(event) {
    if (event.key !== "Escape") return;

    // GM can press ESC to deactivate gateway
    if (game.user.isGM && RNKGateway.state.isActive) {
      event.preventDefault();
      RNKGateway.toggle(false);
      return;
    }

    // Players see logout prompt
    if (!game.user.isGM && RNKGateway.overlayElement) {
      event.preventDefault();
      RNKGateway.promptLogout();
    }
  }

  static promptLogout() {
    new Dialog({
      title: "Leave Gateway",
      content: "<p>Would you like to return to the login screen?</p>",
      buttons: {
        logout: {
          icon: '<i class="fas fa-sign-out-alt"></i>',
          label: "Return to Login",
          callback: () => {
            window.location.href = foundry.utils.getRoute("join");
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Stay"
        }
      },
      default: "cancel"
    }).render(true);
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // AUDIO
  // ──────────────────────────────────────────────────────────────────────────────

  static playSound(type) {
    try {
      const sounds = {
        activate: "sounds/notify.wav",
        deactivate: "sounds/lock.wav"
      };
      const src = sounds[type];
      if (src) {
        AudioHelper.play({ src, volume: 0.5, autoplay: true, loop: false }, false);
      }
    } catch (error) {
      console.warn(`${MODULE_TITLE} | Could not play sound:`, error);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // UTILITIES
  // ──────────────────────────────────────────────────────────────────────────────

  static escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // ACTIVITY FEED SYSTEM
  // ──────────────────────────────────────────────────────────────────────────────

  static async addActivity(type, message, icon = "fa-info-circle") {
    if (!game.user.isGM) return;

    const activity = {
      id: foundry.utils.randomID(),
      type,
      message,
      icon,
      timestamp: Date.now()
    };

    RNKGateway.state.activityFeed = [activity, ...RNKGateway.state.activityFeed].slice(0, MAX_ACTIVITY_ITEMS);
    await game.settings.set(MODULE_ID, SETTINGS.ACTIVITY_FEED, RNKGateway.state.activityFeed);
    
    // Update hub if open
    if (RNKGateway.apps.hub?.rendered) {
      RNKGateway.apps.hub.render(false);
    }
  }

  static async clearActivityFeed() {
    if (!game.user.isGM) return;
    RNKGateway.state.activityFeed = [];
    await game.settings.set(MODULE_ID, SETTINGS.ACTIVITY_FEED, []);
  }

  static getActivityFeedFormatted() {
    if (!RNKGateway.state.activityFeed || !RNKGateway.state.activityFeed.length) {
      // Return sample data for demonstration
      return [
        {
          type: 'info',
          icon: 'fa-door-open',
          message: 'Gateway Control Hub initialized',
          timestamp: Date.now() - 30000,
          timeAgo: 'Just now'
        },
        {
          type: 'success',
          icon: 'fa-check-circle',
          message: 'System ready - All modules loaded',
          timestamp: Date.now() - 60000,
          timeAgo: '1m ago'
        }
      ];
    }
    return RNKGateway.state.activityFeed.map(item => ({
      ...item,
      timeAgo: RNKGateway.formatTimeAgo(item.timestamp)
    }));
  }

  static formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // PRESET SYSTEM
  // ──────────────────────────────────────────────────────────────────────────────

  static async savePreset(name) {
    if (!game.user.isGM) return;

    const theme = THEMES[RNKGateway.state.appearance.theme] || THEMES.nexus;
    const preset = {
      id: foundry.utils.randomID(),
      name: name || `Preset ${RNKGateway.state.presets.length + 1}`,
      createdAt: Date.now(),
      appearance: { ...RNKGateway.state.appearance },
      theme: {
        id: theme.id,
        label: theme.label,
        accent: theme.accent
      },
      customMessage: RNKGateway.state.customMessage,
      backgroundImage: RNKGateway.state.backgroundImage
    };

    RNKGateway.state.presets = [...RNKGateway.state.presets, preset].slice(-MAX_PRESETS);
    await game.settings.set(MODULE_ID, SETTINGS.PRESETS, RNKGateway.state.presets);
    
    RNKGateway.addActivity("preset", `Saved preset: <strong>${preset.name}</strong>`, "fa-bookmark");
    ui.notifications?.info(`Preset "${preset.name}" saved!`);
    
    return preset;
  }

  static async loadPreset(presetId) {
    if (!game.user.isGM) return;

    const preset = RNKGateway.state.presets.find(p => p.id === presetId);
    if (!preset) return;

    // Apply appearance
    await RNKGateway.saveState({ appearance: preset.appearance });
    await game.settings.set(MODULE_ID, SETTINGS.APPEARANCE, preset.appearance);
    
    // Apply message and background
    if (preset.customMessage !== undefined) {
      await game.settings.set(MODULE_ID, SETTINGS.CUSTOM_MESSAGE, preset.customMessage);
      RNKGateway.state.customMessage = preset.customMessage;
    }
    if (preset.backgroundImage !== undefined) {
      await game.settings.set(MODULE_ID, SETTINGS.BACKGROUND_IMAGE, preset.backgroundImage);
      RNKGateway.state.backgroundImage = preset.backgroundImage;
    }

    RNKGateway.applyTheme();
    RNKGateway.updateOverlayContent();
    RNKGateway.broadcastState();
    
    RNKGateway.addActivity("preset", `Loaded preset: <strong>${preset.name}</strong>`, "fa-upload");
    ui.notifications?.info(`Preset "${preset.name}" loaded!`);
  }

  static async deletePreset(presetId) {
    if (!game.user.isGM) return;

    const preset = RNKGateway.state.presets.find(p => p.id === presetId);
    RNKGateway.state.presets = RNKGateway.state.presets.filter(p => p.id !== presetId);
    await game.settings.set(MODULE_ID, SETTINGS.PRESETS, RNKGateway.state.presets);
    
    if (preset) {
      ui.notifications?.info(`Preset "${preset.name}" deleted.`);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // ANALYTICS & SESSION TRACKING
  // ──────────────────────────────────────────────────────────────────────────────

  static async startSession() {
    if (!game.user.isGM) return;

    const sessionStart = Date.now();
    RNKGateway.state.sessionStart = sessionStart;
    await game.settings.set(MODULE_ID, SETTINGS.SESSION_START, sessionStart);
    
    RNKGateway.addActivity("session", "Gateway <strong>activated</strong>", "fa-door-open");
  }

  static async endSession() {
    if (!game.user.isGM) return;
    if (!RNKGateway.state.sessionStart) return;

    const duration = Date.now() - RNKGateway.state.sessionStart;
    const session = {
      id: foundry.utils.randomID(),
      startTime: RNKGateway.state.sessionStart,
      endTime: Date.now(),
      duration,
      messageCount: RNKGateway.state.chat.length,
      pollCount: RNKGateway.state.pollHistory.filter(p => p.sessionId === RNKGateway.state.sessionStart).length,
      players: game.users.filter(u => u.active && !u.isGM).map(u => ({
        id: u.id,
        name: u.name,
        avatar: u.avatar || "icons/svg/mystery-man.svg"
      }))
    };

    // Update analytics
    const analytics = { ...RNKGateway.state.analytics };
    analytics.totalSessions = (analytics.totalSessions || 0) + 1;
    analytics.totalTime = (analytics.totalTime || 0) + duration;
    analytics.sessions = [session, ...(analytics.sessions || [])].slice(0, MAX_SESSIONS);
    
    // Update feature usage
    if (RNKGateway.state.chat.length > 0) {
      analytics.featureUsage.chat = Math.min(100, (analytics.featureUsage.chat || 0) + 10);
    }
    
    // Update weekly usage
    analytics.weeklyUsage = RNKGateway.calculateWeeklyUsage(analytics.sessions);

    RNKGateway.state.analytics = analytics;
    await game.settings.set(MODULE_ID, SETTINGS.ANALYTICS, analytics);

    // Clear session start
    RNKGateway.state.sessionStart = null;
    await game.settings.set(MODULE_ID, SETTINGS.SESSION_START, 0);

    RNKGateway.addActivity("session", `Gateway <strong>deactivated</strong> (${RNKGateway.formatDuration(duration)})`, "fa-door-closed");
  }

  static calculateWeeklyUsage(sessions) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentSessions = sessions.filter(s => s.startTime > weekAgo);
    
    const dayCounts = new Array(7).fill(0);
    recentSessions.forEach(session => {
      const day = new Date(session.startTime).getDay();
      dayCounts[day]++;
    });

    const max = Math.max(...dayCounts, 1);
    return days.map((day, i) => ({
      day,
      value: dayCounts[i],
      percentage: Math.round((dayCounts[i] / max) * 100),
      label: `${day}: ${dayCounts[i]} sessions`
    }));
  }

  static getAnalyticsFormatted() {
    const analytics = RNKGateway.state.analytics || { ...DEFAULT_ANALYTICS };
    const recentSessions = (analytics.sessions || []).slice(0, 10).map(session => ({
      ...session,
      dayOfWeek: new Date(session.startTime).toLocaleDateString("en-US", { weekday: "short" }),
      dateFormatted: new Date(session.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      durationFormatted: RNKGateway.formatDuration(session.duration)
    }));

    const totalTime = analytics.totalTime || 0;
    const avgSession = (analytics.totalSessions || 0) > 0 ? totalTime / analytics.totalSessions : 0;

    return {
      totalSessions: analytics.totalSessions || 0,
      totalTime: totalTime,
      totalTimeFormatted: RNKGateway.formatDuration(totalTime),
      avgSessionLength: RNKGateway.formatDuration(avgSession),
      avgEngagement: Math.min(100, Math.round(((analytics.featureUsage?.chat || 0) * 0.5 + (analytics.featureUsage?.polls || 0) * 0.3 + (analytics.featureUsage?.countdown || 0) * 0.2))),
      featureUsage: analytics.featureUsage || { chat: 0, polls: 0, countdown: 0 },
      weeklyUsage: analytics.weeklyUsage || RNKGateway.calculateWeeklyUsage([]),
      recentSessions
    };
  }

  static formatDuration(ms) {
    if (!ms || ms < 0) return "0m";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // POLL HISTORY
  // ──────────────────────────────────────────────────────────────────────────────

  static async savePollToHistory(poll) {
    if (!game.user.isGM || !poll.active) return;

    const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
    const winner = poll.options.reduce((prev, curr) => 
      (curr.votes || 0) > (prev.votes || 0) ? curr : prev, poll.options[0]);

    const historyItem = {
      id: foundry.utils.randomID(),
      sessionId: RNKGateway.state.sessionStart,
      question: poll.question,
      options: poll.options.map(o => ({ text: o.text, votes: o.votes || 0 })),
      totalVotes,
      winner: winner?.text || "N/A",
      closedAt: Date.now(),
      dateFormatted: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    };

    RNKGateway.state.pollHistory = [historyItem, ...RNKGateway.state.pollHistory].slice(0, MAX_POLL_HISTORY);
    await game.settings.set(MODULE_ID, SETTINGS.POLL_HISTORY, RNKGateway.state.pollHistory);
    
    // Update analytics
    const analytics = { ...RNKGateway.state.analytics };
    analytics.featureUsage.polls = Math.min(100, (analytics.featureUsage.polls || 0) + 15);
    RNKGateway.state.analytics = analytics;
    await game.settings.set(MODULE_ID, SETTINGS.ANALYTICS, analytics);
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // COUNTDOWN HISTORY
  // ──────────────────────────────────────────────────────────────────────────────

  static async saveCountdownToHistory(countdown) {
    if (!game.user.isGM) return;

    const historyItem = {
      id: foundry.utils.randomID(),
      duration: countdown.duration,
      durationFormatted: RNKGateway.formatDuration(countdown.duration),
      message: countdown.message,
      createdAt: Date.now()
    };

    // Avoid duplicates of same duration/message
    const isDuplicate = RNKGateway.state.countdownHistory.some(
      h => h.duration === countdown.duration && h.message === countdown.message
    );
    
    if (!isDuplicate) {
      RNKGateway.state.countdownHistory = [historyItem, ...RNKGateway.state.countdownHistory].slice(0, MAX_COUNTDOWN_HISTORY);
      await game.settings.set(MODULE_ID, SETTINGS.COUNTDOWN_HISTORY, RNKGateway.state.countdownHistory);
    }

    // Update analytics
    const analytics = { ...RNKGateway.state.analytics };
    analytics.featureUsage.countdown = Math.min(100, (analytics.featureUsage.countdown || 0) + 10);
    RNKGateway.state.analytics = analytics;
    await game.settings.set(MODULE_ID, SETTINGS.ANALYTICS, analytics);
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // CHAT STATISTICS
  // ──────────────────────────────────────────────────────────────────────────────

  static getChatStats() {
    const chat = RNKGateway.state.chat || [];
    if (!chat.length) {
      return {
        uniqueUsers: 0,
        avgLength: 0,
        topChatters: []
      };
    }

    // Count messages per user
    const userCounts = {};
    const userInfo = {};
    let totalLength = 0;

    chat.forEach(msg => {
      userCounts[msg.userId] = (userCounts[msg.userId] || 0) + 1;
      userInfo[msg.userId] = { name: msg.author, avatar: msg.avatar };
      totalLength += (msg.content || "").length;
    });

    const topChatters = Object.entries(userCounts)
      .map(([userId, count]) => ({
        userId,
        name: userInfo[userId]?.name || "Unknown",
        avatar: userInfo[userId]?.avatar || "icons/svg/mystery-man.svg",
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      uniqueUsers: Object.keys(userCounts).length,
      avgLength: Math.round(totalLength / chat.length),
      topChatters
    };
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // CONNECTED USERS
  // ──────────────────────────────────────────────────────────────────────────────

  static getConnectedUsers() {
    if (!game.users) return [];
    return game.users.filter(u => u.active).map(user => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar || "icons/svg/mystery-man.svg",
      isGM: user.isGM,
      active: user.active,
      viewingGateway: !user.isGM && RNKGateway.state.isActive
    }));
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // ANALYTICS CLEAR
  // ──────────────────────────────────────────────────────────────────────────────

  static async clearAnalytics() {
    if (!game.user.isGM) return;
    
    RNKGateway.state.analytics = { ...DEFAULT_ANALYTICS };
    await game.settings.set(MODULE_ID, SETTINGS.ANALYTICS, RNKGateway.state.analytics);
    ui.notifications?.info("Analytics data cleared.");
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// GATEWAY CONTROL HUB APPLICATION
// ════════════════════════════════════════════════════════════════════════════════

class GatewayControlHub extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "gateway-control-hub",
    classes: ["rnk-gateway-hub"],
    tag: "div",
    window: {
      title: "Gateway Control Hub",
      resizable: true
    },
    position: {
      width: 1100,
      height: 850
    }
  };

  static PARTS = {
    hub: {
      template: `modules/${MODULE_ID}/templates/control-hub.hbs`
    }
  };

  tabGroups = {
    primary: "dashboard"
  };

  static TABS = {
    primary: {
      initial: "dashboard",
      tabs: [
        { id: "dashboard", label: "Dashboard", icon: "fas fa-th-large" },
        { id: "appearance", label: "Appearance", icon: "fas fa-palette" },
        { id: "countdown", label: "Countdown", icon: "fas fa-hourglass-half" },
        { id: "chat", label: "Chat", icon: "fas fa-comments" },
        { id: "polls", label: "Polls", icon: "fas fa-poll" },
        { id: "analytics", label: "Analytics", icon: "fas fa-chart-line" }
      ]
    }
  };

  async _prepareContext(options) {
    console.log("Gateway Control Hub - _prepareContext() called");
    const state = RNKGateway.getFullState();
    console.log("Gateway Control Hub - State:", state);
    const poll = state.poll || { ...DEFAULT_POLL };
    
    // Calculate poll data for display
    const totalVotes = poll.active ? (poll.options || []).reduce((sum, opt) => sum + (opt.votes || 0), 0) : 0;
    const activePlayers = game.users ? game.users.filter(u => u.active && !u.isGM).length : 0;
    const participationRate = poll.active && activePlayers > 0
      ? Math.round((Object.keys(poll.responses || {}).length / activePlayers) * 100)
      : 0;

    // Add percentage and voters to poll options
    const pollWithData = {
      ...poll,
      totalVotes,
      participationRate,
      options: (poll.options || []).map(opt => {
        const votes = opt.votes || 0;
        const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
        // Get voters for this option
        const voters = Object.entries(poll.responses || {})
          .filter(([userId, optId]) => optId === opt.id)
          .map(([userId]) => {
            const user = game.users?.get(userId);
            return user ? { id: userId, name: user.name, avatar: user.avatar || "icons/svg/mystery-man.svg" } : null;
          })
          .filter(Boolean);
        return { ...opt, percentage, voters };
      })
    };

    // Format chat messages with timestamps
    const chatFormatted = (state.chat || []).map(msg => ({
      ...msg,
      timeFormatted: new Date(msg.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    }));

    const tabs = this._prepareTabs("primary");
    
    const data = {
      tabs,
      isActive: state.isActive || false,
      appearance: state.appearance || { ...DEFAULT_APPEARANCE },
      countdown: state.countdown || { ...DEFAULT_COUNTDOWN },
      poll: pollWithData,
      chat: chatFormatted,
      themes: Object.values(THEMES),
      currentTheme: (state.appearance || DEFAULT_APPEARANCE).theme,
      customMessage: state.customMessage || "",
      backgroundImage: state.backgroundImage || "",
      
      // New data
      connectedUsers: RNKGateway.getConnectedUsers(),
      activityFeed: RNKGateway.getActivityFeedFormatted(),
      presets: RNKGateway.state.presets || [],
      pollHistory: RNKGateway.state.pollHistory || [],
      countdownHistory: RNKGateway.state.countdownHistory || [],
      analytics: RNKGateway.getAnalyticsFormatted(),
      chatStats: RNKGateway.getChatStats(),
      sessionStart: RNKGateway.state.sessionStart || null,
      totalVotes
    };
    
    console.log("Gateway Control Hub - Returning data:", data);
    return data;
  }

  async close(options = {}) {
    // Clear timers
    if (this._sessionTimerInterval) {
      clearInterval(this._sessionTimerInterval);
      this._sessionTimerInterval = null;
    }
    if (this._countdownTimerInterval) {
      clearInterval(this._countdownTimerInterval);
      this._countdownTimerInterval = null;
    }
    
    return super.close(options);
  }

  _onRender(context, options) {
    super._onRender(context, options);
    const html = $(this.element);
    
    // Remove all existing event handlers to prevent duplicates
    html.find("*").off();

    // ══════════════════════════════════════════════════════════════════════════
    // HEADER & POWER CONTROLS
    // ══════════════════════════════════════════════════════════════════════════
    
    html.find("#gateway-toggle, #quick-toggle").on("click", () => {
      RNKGateway.toggle();
    });

    // Session duration timer
    this._startSessionTimer(html);

    // ══════════════════════════════════════════════════════════════════════════
    // QUICK ACTIONS
    // ══════════════════════════════════════════════════════════════════════════

    html.find(".quick-action[data-action='countdown']").on("click", async (e) => {
      const minutes = parseInt(e.currentTarget.dataset.minutes) || 5;
      await RNKGateway.startCountdown(minutes);
      this.render(false);
    });

    html.find("#quick-broadcast").on("click", () => {
      this._tabs[0]?.activate("chat");
      setTimeout(() => html.find("#broadcast-input").focus(), 100);
    });

    html.find("#quick-poll").on("click", () => {
      this._tabs[0]?.activate("polls");
    });

    // ══════════════════════════════════════════════════════════════════════════
    // PRESETS
    // ══════════════════════════════════════════════════════════════════════════

    html.find("#save-preset").on("click", async () => {
      const name = await Dialog.prompt({
        title: "Save Preset",
        content: `<input type="text" name="preset-name" placeholder="Preset name..." style="width: 100%; margin-bottom: 1rem;">`,
        label: "Save",
        callback: (html) => html.find('input[name="preset-name"]').val()
      });
      if (name) {
        await RNKGateway.savePreset(name);
        this.render(false);
      }
    });

    html.find(".preset-load").on("click", async (e) => {
      const presetId = e.currentTarget.dataset.presetId;
      await RNKGateway.loadPreset(presetId);
      this.render(false);
    });

    html.find(".preset-delete").on("click", async (e) => {
      e.stopPropagation();
      const presetId = e.currentTarget.dataset.presetId;
      await RNKGateway.deletePreset(presetId);
      this.render(false);
    });

    // ══════════════════════════════════════════════════════════════════════════
    // ACTIVITY FEED
    // ══════════════════════════════════════════════════════════════════════════

    html.find("#clear-activity").on("click", async () => {
      await RNKGateway.clearActivityFeed();
      this.render(false);
    });

    // ══════════════════════════════════════════════════════════════════════════
    // WELCOME MESSAGE
    // ══════════════════════════════════════════════════════════════════════════

    html.find("#custom-message").on("input", (e) => {
      const count = e.target.value.length;
      html.find("#message-char-count").text(count);
    });

    html.find("#save-message").on("click", async () => {
      const value = html.find("#custom-message").val();
      await game.settings.set(MODULE_ID, SETTINGS.CUSTOM_MESSAGE, value);
      RNKGateway.state.customMessage = value;
      RNKGateway.updateOverlayContent();
      RNKGateway.broadcastState();
      ui.notifications?.info("Welcome message updated!");
    });

    // ══════════════════════════════════════════════════════════════════════════
    // THEME SELECTION
    // ══════════════════════════════════════════════════════════════════════════

    html.find(".theme-card").on("click", async (e) => {
      const themeId = e.currentTarget.dataset.theme;
      const theme = THEMES[themeId];
      if (theme) {
        const appearance = {
          ...RNKGateway.state.appearance,
          theme: themeId,
          accentColor: theme.accent,
          accentSecondary: theme.secondary
        };
        await RNKGateway.saveState({ appearance });
        await game.settings.set(MODULE_ID, SETTINGS.APPEARANCE, appearance);
        RNKGateway.applyTheme();
        RNKGateway.broadcastState();
        this.render(false);
      }
    });

    // ══════════════════════════════════════════════════════════════════════════
    // VISUAL CONTROLS
    // ══════════════════════════════════════════════════════════════════════════

    html.find("#opacity-slider").on("input", async (e) => {
      const value = parseFloat(e.target.value);
      html.find("#opacity-value").text(value);
      const appearance = { ...RNKGateway.state.appearance, overlayOpacity: value };
      await RNKGateway.saveState({ appearance });
      RNKGateway.applyTheme();
    });

    html.find("#blur-slider").on("input", async (e) => {
      const value = parseInt(e.target.value);
      html.find("#blur-value").text(`${value}px`);
      const appearance = { ...RNKGateway.state.appearance, blurStrength: value };
      await RNKGateway.saveState({ appearance });
      RNKGateway.applyTheme();
    });

    html.find("#particle-slider").on("input", async (e) => {
      const value = parseInt(e.target.value);
      html.find("#particle-value").text(value);
      const appearance = { ...RNKGateway.state.appearance, particleCount: value };
      await RNKGateway.saveState({ appearance });
      // Regenerate particles
      if (RNKGateway.overlayElement) {
        RNKGateway.generateParticles(RNKGateway.overlayElement.querySelector("#gateway-particles"), value);
      }
    });

    html.find("#animations-toggle").on("change", async (e) => {
      const appearance = { ...RNKGateway.state.appearance, animationsEnabled: e.target.checked };
      await RNKGateway.saveState({ appearance });
      await game.settings.set(MODULE_ID, SETTINGS.APPEARANCE, appearance);
    });

    // ══════════════════════════════════════════════════════════════════════════
    // BACKGROUND IMAGE
    // ══════════════════════════════════════════════════════════════════════════

    html.find("#background-image").on("change", async (e) => {
      const value = e.target.value;
      await game.settings.set(MODULE_ID, SETTINGS.BACKGROUND_IMAGE, value);
      RNKGateway.state.backgroundImage = value;
      RNKGateway.updateOverlayContent();
      RNKGateway.broadcastState();
      this.render(false);
    });

    html.find("#browse-background").on("click", () => {
      new FilePicker({
        type: "image",
        current: RNKGateway.state.backgroundImage,
        callback: async (path) => {
          html.find("#background-image").val(path);
          await game.settings.set(MODULE_ID, SETTINGS.BACKGROUND_IMAGE, path);
          RNKGateway.state.backgroundImage = path;
          RNKGateway.updateOverlayContent();
          RNKGateway.broadcastState();
          this.render(false);
        }
      }).render(true);
    });

    html.find("#clear-background").on("click", async () => {
      html.find("#background-image").val("");
      await game.settings.set(MODULE_ID, SETTINGS.BACKGROUND_IMAGE, "");
      RNKGateway.state.backgroundImage = "";
      RNKGateway.updateOverlayContent();
      RNKGateway.broadcastState();
      this.render(false);
    });

    html.find("#background-image").on("change", async (ev) => {
      const path = ev.target.value;
      await game.settings.set(MODULE_ID, SETTINGS.BACKGROUND_IMAGE, path);
      RNKGateway.state.backgroundImage = path;
      RNKGateway.updateOverlayContent();
      RNKGateway.broadcastState();
      this.render(false);
    });

    // ══════════════════════════════════════════════════════════════════════════
    // COUNTDOWN CONTROLS
    // ══════════════════════════════════════════════════════════════════════════

    html.find(".countdown-preset").on("click", (e) => {
      const minutes = parseInt(e.currentTarget.dataset.minutes);
      html.find("#countdown-hours").val(0);
      html.find("#countdown-minutes").val(minutes);
      html.find("#countdown-seconds").val(0);
    });

    html.find("#start-countdown").on("click", async () => {
      const hours = parseInt(html.find("#countdown-hours").val()) || 0;
      const minutes = parseInt(html.find("#countdown-minutes").val()) || 0;
      const seconds = parseInt(html.find("#countdown-seconds").val()) || 0;
      const totalMinutes = hours * 60 + minutes + (seconds / 60);
      
      if (totalMinutes <= 0) {
        ui.notifications?.warn("Please set a duration greater than 0");
        return;
      }
      
      const message = html.find("#countdown-message").val() || "Session begins in";
      const autoDeactivate = html.find("#countdown-auto-deactivate").is(":checked");
      const showProgressBar = html.find("#countdown-show-progress").is(":checked");
      
      await RNKGateway.startCountdown(totalMinutes, message, autoDeactivate, showProgressBar);
      this.render(false);
    });

    html.find("#stop-countdown").on("click", async () => {
      await RNKGateway.stopCountdown();
      this.render(false);
    });

    html.find("#add-time-1, #add-time-5").on("click", async (e) => {
      const addMinutes = e.currentTarget.id === "add-time-1" ? 1 : 5;
      const countdown = { ...RNKGateway.state.countdown };
      countdown.endTime += addMinutes * 60 * 1000;
      countdown.duration += addMinutes * 60 * 1000;
      await RNKGateway.saveState({ countdown });
      await game.settings.set(MODULE_ID, SETTINGS.COUNTDOWN, countdown);
      RNKGateway.emit(SOCKET_EVENTS.COUNTDOWN_SYNC, { countdown });
      RNKGateway.syncCountdownDisplay();
    });

    html.find(".history-reuse").on("click", async (e) => {
      const duration = parseInt(e.currentTarget.dataset.duration);
      const message = e.currentTarget.dataset.message;
      const minutes = duration / 60000;
      await RNKGateway.startCountdown(minutes, message);
      this.render(false);
    });

    // Start countdown display update in hub
    this._startCountdownTimer(html);

    // ══════════════════════════════════════════════════════════════════════════
    // CHAT CONTROLS
    // ══════════════════════════════════════════════════════════════════════════

    html.find("#clear-chat").on("click", async () => {
      await RNKGateway.clearChat();
      RNKGateway.addActivity("chat", "Chat <strong>cleared</strong>", "fa-trash-alt");
      this.render(false);
    });

    html.find("#export-chat").on("click", () => {
      const chat = RNKGateway.state.chat;
      const text = chat.map(m => `[${new Date(m.timestamp).toLocaleString()}] ${m.author}: ${m.content}`).join("\n");
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gateway-chat-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      ui.notifications?.info("Chat log exported!");
    });

    html.find("#broadcast-input").on("input", (e) => {
      html.find("#broadcast-char-count").text(e.target.value.length);
    });

    html.find("#broadcast-message").on("click", () => {
      const content = html.find("#broadcast-input").val();
      if (content?.trim()) {
        RNKGateway.sendChatMessage(content.trim());
        html.find("#broadcast-input").val("");
        html.find("#broadcast-char-count").text("0");
        RNKGateway.addActivity("broadcast", `Broadcast sent: "${content.trim().substring(0, 30)}..."`, "fa-bullhorn");
        ui.notifications?.info("Message broadcast to all players");
      }
    });

    html.find(".quick-reply").on("click", (e) => {
      const message = e.currentTarget.dataset.message;
      html.find("#broadcast-input").val(message);
      html.find("#broadcast-char-count").text(message.length);
    });

    html.find(".broadcast-type").on("click", (e) => {
      html.find(".broadcast-type").removeClass("active");
      $(e.currentTarget).addClass("active");
    });

    html.find("#chat-search").on("input", (e) => {
      const query = e.target.value.toLowerCase();
      html.find(".chat-message").each((i, el) => {
        const text = $(el).find(".chat-text").text().toLowerCase();
        const author = $(el).find(".chat-author").text().toLowerCase();
        $(el).toggle(text.includes(query) || author.includes(query));
      });
    });

    html.find("#chat-filter-user").on("change", (e) => {
      const userId = e.target.value;
      html.find(".chat-message").each((i, el) => {
        if (!userId) {
          $(el).show();
        } else {
          $(el).toggle($(el).data("user-id") === userId);
        }
      });
    });

    html.find(".chat-delete").on("click", async (e) => {
      const messageId = e.currentTarget.dataset.messageId;
      RNKGateway.state.chat = RNKGateway.state.chat.filter(m => m.id !== messageId);
      await RNKGateway.saveState({ chat: RNKGateway.state.chat });
      this.render(false);
    });

    // ══════════════════════════════════════════════════════════════════════════
    // POLL CONTROLS
    // ══════════════════════════════════════════════════════════════════════════

    html.find("#add-poll-option").on("click", () => {
      const builder = html.find("#poll-options-builder");
      const count = builder.find(".poll-option-input").length + 1;
      builder.append(`
        <div class="poll-option-input">
          <input type="text" placeholder="Option ${count}" class="poll-option">
          <button type="button" class="remove-option"><i class="fas fa-times"></i></button>
        </div>
      `);
      this._updateRemoveButtons(html);
    });

    html.find("#poll-options-builder").on("click", ".remove-option", (e) => {
      $(e.currentTarget).closest(".poll-option-input").remove();
      this._updateRemoveButtons(html);
    });

    html.find("#create-poll").on("click", async () => {
      const question = html.find("#poll-question").val();
      const options = html.find(".poll-option").map((i, el) => $(el).val()).get().filter(o => o.trim());
      
      const success = await RNKGateway.createPoll(question, options);
      if (success) {
        html.find("#poll-question").val("");
        html.find(".poll-option").val("");
        this.render(false);
      }
    });

    html.find("#close-poll").on("click", async () => {
      await RNKGateway.closePoll();
      this.render(false);
    });

    html.find("#reset-poll").on("click", async () => {
      const poll = { ...RNKGateway.state.poll };
      poll.responses = {};
      poll.options = poll.options.map(opt => ({ ...opt, votes: 0 }));
      await RNKGateway.saveState({ poll });
      await game.settings.set(MODULE_ID, SETTINGS.POLL_STATE, poll);
      RNKGateway.emit(SOCKET_EVENTS.POLL_UPDATE, { poll });
      RNKGateway.updatePollDisplay();
      this.render(false);
    });

    // Poll templates
    html.find(".poll-template").on("click", (e) => {
      const templateId = e.currentTarget.dataset.template;
      const template = POLL_TEMPLATES[templateId];
      if (template) {
        html.find("#poll-question").val(template.question);
        const builder = html.find("#poll-options-builder");
        builder.empty();
        template.options.forEach((opt, i) => {
          builder.append(`
            <div class="poll-option-input">
              <input type="text" placeholder="Option ${i + 1}" class="poll-option" value="${opt}">
              <button type="button" class="remove-option" ${i < 2 ? "disabled" : ""}><i class="fas fa-times"></i></button>
            </div>
          `);
        });
      }
    });

    // ══════════════════════════════════════════════════════════════════════════
    // ANALYTICS
    // ══════════════════════════════════════════════════════════════════════════

    html.find("#clear-analytics").on("click", async () => {
      const confirmed = await Dialog.confirm({
        title: "Clear Analytics",
        content: "<p>Are you sure you want to clear all analytics data? This cannot be undone.</p>"
      });
      if (confirmed) {
        await RNKGateway.clearAnalytics();
        this.render(false);
      }
    });
  }

  _startSessionTimer(html) {
    const durationEl = html.find("#session-duration .duration-value");
    if (!durationEl.length || !RNKGateway.state.sessionStart) return;

    const updateTimer = () => {
      const elapsed = Date.now() - RNKGateway.state.sessionStart;
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      durationEl.text(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    };

    updateTimer();
    this._sessionTimerInterval = setInterval(updateTimer, 1000);
  }

  _startCountdownTimer(html) {
    const countdown = RNKGateway.state.countdown;
    if (!countdown.isActive) return;

    const timeEl = html.find("#hub-countdown-time");
    const ringEl = html.find("#countdown-progress-ring");

    const updateDisplay = () => {
      const remaining = Math.max(0, countdown.endTime - Date.now());
      const progress = 1 - (remaining / countdown.duration);
      
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      timeEl.text(`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);

      // Update SVG ring (circumference = 2 * PI * 45 ≈ 283)
      const circumference = 283;
      const offset = circumference * (1 - progress);
      ringEl.css("stroke-dashoffset", offset);

      if (remaining <= 0) {
        clearInterval(this._countdownTimerInterval);
        this.render(false);
      }
    };

    updateDisplay();
    this._countdownTimerInterval = setInterval(updateDisplay, 1000);
  }

  _updateRemoveButtons(html) {
    const buttons = html.find("#poll-options-builder .remove-option");
    buttons.prop("disabled", buttons.length <= 2);
  }

  async close(options={}) {
    if (this._sessionTimerInterval) clearInterval(this._sessionTimerInterval);
    if (this._countdownTimerInterval) clearInterval(this._countdownTimerInterval);
    return super.close(options);
  }

  _onClickAction(event, target) {
    const action = target.dataset.action;
    
    switch(action) {
      case "change-tab":
        this._onChangeTab(event, target);
        break;
      // Add other action handlers as needed
    }
  }

  _onChangeTab(event, target) {
    const group = target.dataset.group;
    const tab = target.dataset.tab;
    if (group && tab) this.changeTab(tab, group);
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// HOOKS REGISTRATION
// ════════════════════════════════════════════════════════════════════════════════

Hooks.once("init", () => RNKGateway.init());
Hooks.once("ready", () => RNKGateway.ready());

// Re-add sidebar button when sidebar renders
Hooks.on("renderSidebar", () => {
  if (game.user?.isGM) {
    setTimeout(() => RNKGateway.addSidebarButton(), 100);
  }
});

// Update players display when users change
Hooks.on("userConnected", () => RNKGateway.updatePlayersDisplay());
Hooks.on("userDisconnected", () => RNKGateway.updatePlayersDisplay());

// Export for module API
globalThis.RNKGateway = RNKGateway;

function registerGatewayWithCodex() {
  registerRNKModule({
    id: MODULE_ID,
    title: MODULE_TITLE,
    icon: 'fa-solid fa-dungeon',
    applicationClass: 'gateway-control-hub',
    windowSelector: '#gateway-control-hub',
    order: 5,
    onClick: () => RNKGateway.openControlHub()
  });
}

function registerRNKModule(config) {
  if (!config?.id || typeof config.onClick !== 'function') {
    console.warn('RNK Gateway | Invalid RNK module registration', config);
    return false;
  }

  const payload = {
    id: config.id,
    title: config.title || config.id,
    icon: config.icon || 'fa-solid fa-puzzle-piece',
    order: config.order ?? 100,
    applicationClass: config.applicationClass,
    windowSelector: config.windowSelector,
    onClick: config.onClick,
    quantumPortal: config.quantumPortal ?? true
  };

  if (globalThis.RNKCodex?.registerModule) {
    console.log('RNK Gateway | Registering with RNKCodex API');
    globalThis.RNKCodex.registerModule(payload);
  } else {
    console.log('RNK Gateway | RNKCodex API not available, using fallback array registration');
    globalThis.RNK_MODULES = globalThis.RNK_MODULES || [];
    const existing = globalThis.RNK_MODULES.findIndex(m => m.id === payload.id);
    if (existing >= 0) {
      globalThis.RNK_MODULES[existing] = { ...globalThis.RNK_MODULES[existing], ...payload };
      console.log('RNK Gateway | Updated existing registration in RNK_MODULES');
    } else {
      globalThis.RNK_MODULES.push(payload);
      console.log('RNK Gateway | Added to RNK_MODULES array');
    }
  }

  if (globalThis.RNK_QUANTUM_PORTAL?.register && payload.quantumPortal !== false) {
    globalThis.RNK_QUANTUM_PORTAL.register({
      id: payload.id,
      applicationClass: payload.applicationClass,
      windowSelector: payload.windowSelector
    });
    console.log('RNK Gateway | Registered with Quantum Portal');
  }

  console.log(`RNK Gateway | Module registration complete for: ${config.id}`);
  return true;
}
