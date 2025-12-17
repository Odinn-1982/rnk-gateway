/**
 * RNK Lobby - System agnostic GM prep mode with GM control center.
 */

const LOBBY_MODULE_ID = "rnk-lobby";
const LOBBY_SETTING_KEY = "lobbyActive";
const GM_PREVIEW_KEY = "gmPreview";
const CUSTOM_MESSAGE_KEY = "customMessage";
const CUSTOM_IMAGE_KEY = "customImage";
const ENABLE_SOUND_KEY = "enableSound";
const APPEARANCE_SETTING_KEY = "appearanceSettings";
const COUNTDOWN_SETTING_KEY = "countdownState";
const CHAT_HISTORY_KEY = "chatHistory";
const PRESET_STORAGE_KEY = "lobbyPresets";
const POLL_STATE_KEY = "lobbyPollState";
const ANALYTICS_KEY = "lobbyAnalytics";

const SOCKET_ACTIONS = {
  STATUS: "lobby-status",
  REQUEST: "lobby-request",
  STATE: "lobby-state",
  CHAT_SEND: "lobby-chat-send",
  CHAT_BROADCAST: "lobby-chat",
  CHAT_CLEAR: "lobby-chat-clear",
  POLL_UPDATE: "lobby-poll-update",
  POLL_VOTE: "lobby-poll-vote",
  POLL_CLOSE: "lobby-poll-close"
};

const DEFAULT_IMAGE_FILE = "assets/rnk-codex.jpg";
const DEFAULT_APPEARANCE = {
  customTitle: "",
  accentColor: "#ff6b6b",
  overlayOpacity: 0.65,
  blurStrength: 12,
  messageAlignment: "center",
  headingFont: '"Roboto Condensed", "Segoe UI", sans-serif',
  bodyFont: '"Roboto", "Segoe UI", sans-serif'
};

const DEFAULT_COUNTDOWN = {
  isActive: false,
  duration: 0,
  endTime: 0,
  message: "GM Prep complete in",
  showProgressBar: true,
  completed: false,
  actions: {
    macroId: "",
    sceneId: "",
    soundPath: "",
    chatMessage: ""
  }
};

const MAX_CHAT_ENTRIES = 200;

const DEFAULT_POLL_STATE = {
  active: false,
  question: "",
  options: [],
  responses: {}
};

const DEFAULT_ANALYTICS = {
  sessions: [],
  totalActiveMs: 0,
  chatStats: {},
  countdownUses: 0,
  pollHistory: [],
  lastActivatedAt: null
};

function odBaz19r8e2() {}

const MAX_RECENT_SESSIONS = 20;
const MAX_PRESETS = 12;

function odSent98_in2() {}

const BUTTON_STACK_ID = "custom-sidebar-buttons";
const BUTTON_STACK_STYLE_ID = "rnk-lobby-button-stack-style";

function odMa_rk18_92() {}

const BUILT_IN_THEMES = [
  {
    id: "crimson-dawn",
    label: "Crimson Dawn",
    appearance: {
      accentColor: "#ff4d67",
      overlayOpacity: 0.62,
      blurStrength: 14,
      messageAlignment: "center",
      headingFont: '"Bebas Neue", "Roboto", sans-serif',
      bodyFont: '"Montserrat", "Segoe UI", sans-serif'
    }
  },
  {
    id: "midnight-vigil",
    label: "Midnight Vigil",
    appearance: {
      accentColor: "#6ca6ff",
      overlayOpacity: 0.72,
      blurStrength: 18,
      messageAlignment: "left",
      headingFont: '"Oswald", "Segoe UI", sans-serif',
      bodyFont: '"Open Sans", "Segoe UI", sans-serif'
    }
  },
  {
    id: "verdant-harbor",
    label: "Verdant Harbor",
    appearance: {
      accentColor: "#42f59b",
      overlayOpacity: 0.58,
      blurStrength: 10,
      messageAlignment: "center",
      headingFont: '"Raleway", "Segoe UI", sans-serif',
      bodyFont: '"Source Sans Pro", "Segoe UI", sans-serif'
    }
  },
  {
    id: "emberfall",
    label: "Emberfall",
    appearance: {
      accentColor: "#ffb347",
      overlayOpacity: 0.66,
      blurStrength: 16,
      messageAlignment: "right",
      headingFont: '"Cinzel", "Georgia", serif',
      bodyFont: '"Merriweather", "Georgia", serif'
    }
  }
];

function odEc1ho9_8_2() {}

const ApplicationBase = globalThis?.foundry?.applications?.api?.ApplicationV2 ?? Application;
const FormApplicationBase = globalThis?.foundry?.applications?.api?.FormApplicationV2 ?? FormApplication;

const HandlebarsApplicationMixin = globalThis?.foundry?.applications?.api?.HandlebarsApplicationMixin;
const HandlebarsFormApplicationMixin = globalThis?.foundry?.applications?.api?.HandlebarsFormApplicationMixin;

const RenderableApplicationBase = typeof HandlebarsApplicationMixin === "function" && ApplicationBase !== Application
  ? HandlebarsApplicationMixin(ApplicationBase)
  : ApplicationBase;

const RenderableFormApplicationBase = typeof HandlebarsFormApplicationMixin === "function" && FormApplicationBase !== FormApplication
  ? HandlebarsFormApplicationMixin(FormApplicationBase)
  : FormApplicationBase;

const USE_APPLICATION_V2 = RenderableApplicationBase !== Application;
const USE_FORM_APPLICATION_V2 = RenderableFormApplicationBase !== FormApplication;

const isJQueryAvailable = typeof window !== "undefined" && typeof window.jQuery === "function";
const isJQueryInstance = (value) => isJQueryAvailable && value instanceof window.jQuery;
const toJQuery = (value) => (isJQueryAvailable ? window.jQuery(value) : null);
const toElementArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value.length === "number" && !isJQueryInstance(value) && !(value instanceof HTMLElement) && !(value instanceof DocumentFragment)) {
    return Array.from(value).filter(Boolean);
  }
  return [value];
};

const getRootNode = (html) => {
  if (!html) return null;
  if (isJQueryInstance(html)) return html[0] ?? null;
  if (html instanceof HTMLElement || html instanceof DocumentFragment) return html;
  const [first] = toElementArray(html);
  return first ?? null;
};

const findElements = (html, selector) => {
  if (isJQueryAvailable) {
    if (isJQueryInstance(html)) return Array.from(html.find(selector));
    const $root = toJQuery(getRootNode(html));
    return $root ? Array.from($root.find(selector)) : [];
  }

  const root = getRootNode(html);
  if (!root) return [];
  if (typeof root.querySelectorAll === "function") return Array.from(root.querySelectorAll(selector));
  return [];
};

const addEventListenerCompat = (html, selector, eventName, handler) => {
  if (isJQueryAvailable) {
    if (isJQueryInstance(html)) {
      html.find(selector).on(eventName, handler);
      return;
    }
    const $root = toJQuery(getRootNode(html));
    if ($root) {
      $root.find(selector).on(eventName, handler);
      return;
    }
  }

  findElements(html, selector).forEach((element) => element.addEventListener(eventName, handler));
};

const getFirstElement = (html, selector) => {
  const elements = selector ? findElements(html, selector) : toElementArray(getRootNode(html));
  return elements[0] ?? null;
};

// Use the modern expandObject when available while keeping older builds functional.
const expandObjectCompat = (data) => {
  const expand = globalThis?.foundry?.utils?.expandObject ?? globalThis?.expandObject;
  return typeof expand === "function" ? expand(data) : data;
};

const cloneObjectCompat = (value) => {
  if (value == null) return {};
  if (typeof foundry?.utils?.deepClone === "function") return foundry.utils.deepClone(value);
  if (typeof structuredClone === "function") return structuredClone(value);
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (error) {
    return value;
  }
};

const mergeDefaults = (klass, overrides) => {
  const parent = Object.getPrototypeOf(klass);
  const base = parent?.DEFAULT_OPTIONS ?? (typeof parent?.defaultOptions !== "undefined" ? parent.defaultOptions : {});
  return foundry.utils.mergeObject(cloneObjectCompat(base ?? {}), overrides ?? {});
};

const mergeContexts = (base, data) => {
  const initial = cloneObjectCompat(base ?? {});
  return foundry.utils.mergeObject(initial, data ?? {}, { inplace: false });
};

function odW9a8tch2r() {}

function odF1ag9_8_2() {}

let moduleBasePath = `modules/${LOBBY_MODULE_ID}`;

function odTok1en98_2() {}

class RNKLobby {
  static suppressSettingUpdate = false;
  static overlayElements = null;
  static countdownInterval = null;
  static chatMessages = [];
  static currentState = {
    isActive: false,
    appearance: { ...DEFAULT_APPEARANCE },
    countdown: { ...DEFAULT_COUNTDOWN },
    customMessage: "",
    customImage: "",
    poll: { ...DEFAULT_POLL_STATE }
  };
  static pollState = { ...DEFAULT_POLL_STATE };
  static analytics = { ...DEFAULT_ANALYTICS };
  static countdownCompletionHandled = false;
  static apps = {};

  static async init() {
    RNKLobby.registerSettings();

    if (globalThis.Handlebars && !Handlebars.helpers.eq) {
      Handlebars.registerHelper("eq", (a, b) => a === b);
    }

    const module = game.modules?.get?.(LOBBY_MODULE_ID);
    if (module) module.api = RNKLobby;
  }

  static registerSettings() {
    game.settings.register(LOBBY_MODULE_ID, LOBBY_SETTING_KEY, {
      name: "game.settings.rnk-lobby.lobbyActive.name",
      hint: "game.settings.rnk-lobby.lobbyActive.hint",
      scope: "world",
      config: false,
      type: Boolean,
      default: false,
      onChange: (value) => {
        if (RNKLobby.suppressSettingUpdate) return;
        RNKLobby.handleLobbyToggle(value, { source: "setting" });
      }
    });

    game.settings.register(LOBBY_MODULE_ID, GM_PREVIEW_KEY, {
      name: "GM Preview Mode",
      hint: "Allow GMs to see the lobby overlay for testing purposes",
      scope: "client",
      config: true,
      type: Boolean,
      default: false,
      onChange: () => {
        const state = RNKLobby.collectStateFromSettings();
        if (state.isActive) RNKLobby.handleLobbyToggle(true, { source: "setting", state });
      }
    });

    game.settings.register(LOBBY_MODULE_ID, CUSTOM_MESSAGE_KEY, {
      name: "Custom Lobby Message",
      hint: "Custom message to display to players (leave empty for default)",
      scope: "world",
      config: true,
      type: String,
      default: ""
    });

    game.settings.register(LOBBY_MODULE_ID, CUSTOM_IMAGE_KEY, {
      name: "Custom Background Image",
      hint: "Path to custom background image (e.g., 'modules/my-module/assets/bg.jpg' or leave empty for default)",
      scope: "world",
      config: true,
      type: String,
      default: ""
    });

    game.settings.register(LOBBY_MODULE_ID, ENABLE_SOUND_KEY, {
      name: "Enable Sound Notifications",
      hint: "Play a notification sound when the lobby is activated or deactivated",
      scope: "client",
      config: true,
      type: Boolean,
      default: false
    });

    game.settings.register(LOBBY_MODULE_ID, APPEARANCE_SETTING_KEY, {
      name: "Lobby Appearance",
      scope: "world",
      config: false,
      type: Object,
      default: { ...DEFAULT_APPEARANCE },
      onChange: () => RNKLobby.refreshOverlayAppearance()
    });

    game.settings.register(LOBBY_MODULE_ID, COUNTDOWN_SETTING_KEY, {
      name: "Lobby Countdown",
      scope: "world",
      config: false,
      type: Object,
      default: { ...DEFAULT_COUNTDOWN },
      onChange: () => RNKLobby.syncCountdownFromSettings()
    });

    game.settings.register(LOBBY_MODULE_ID, CHAT_HISTORY_KEY, {
      name: "Lobby Chat History",
      scope: "world",
      config: false,
      type: Object,
      default: []
    });

    game.settings.register(LOBBY_MODULE_ID, PRESET_STORAGE_KEY, {
      name: "Lobby Presets",
      scope: "world",
      config: false,
      type: Object,
      default: []
    });

    game.settings.register(LOBBY_MODULE_ID, POLL_STATE_KEY, {
      name: "Lobby Poll State",
      scope: "world",
      config: false,
      type: Object,
      default: { ...DEFAULT_POLL_STATE },
      onChange: (value) => RNKLobby.receivePollState(value)
    });

    game.settings.register(LOBBY_MODULE_ID, ANALYTICS_KEY, {
      name: "Lobby Analytics",
      scope: "world",
      config: false,
      type: Object,
      default: { ...DEFAULT_ANALYTICS },
      onChange: () => {
        RNKLobby.analytics = RNKLobby.getAnalyticsData();
        if (RNKLobby.apps.analytics?.rendered) RNKLobby.apps.analytics.render(false);
      }
    });
  }

  static async ready() {
    const moduleData = game.modules.get(LOBBY_MODULE_ID);
    if (moduleData?.path) moduleBasePath = moduleData.path.replace(/\/$/, "");

    RNKLobby.chatMessages = RNKLobby.cloneChatHistory(game.settings.get(LOBBY_MODULE_ID, CHAT_HISTORY_KEY));
  RNKLobby.analytics = RNKLobby.getAnalyticsData();
  RNKLobby.pollState = RNKLobby.getPollStateFromSettings();
    RNKLobby.currentState = RNKLobby.collectStateFromSettings();
    RNKLobby.syncCountdownFromSettings();

    game.socket.on(`module.${LOBBY_MODULE_ID}`, (data) => RNKLobby.handleSocketMessage(data));

    const isActive = RNKLobby.currentState.isActive;

    if (!game.user.isGM && isActive) {
      RNKLobby.showLobbyOverlay(RNKLobby.currentState);
      RNKLobby.requestCurrentState();
    } else if (game.user.isGM && isActive) {
      RNKLobby.updateStatusBanner(true);
    }

    if (game.user.isGM) {
      setTimeout(() => RNKLobby.addSidebarButton(), 400);
    }

    document.addEventListener("keydown", RNKLobby.handleGlobalKeydown, true);

    RNKLobby.updateSidebarButtonState();
  }

  static handleGlobalKeydown(event) {
    if (event.key !== "Escape") return;

    if (game.user.isGM) {
      const isActive = game.settings.get(LOBBY_MODULE_ID, LOBBY_SETTING_KEY);
      if (isActive) {
        event.preventDefault();
        RNKLobby.handleLobbyToggle(false, { source: "gm-escape" });
      }
      return;
    }

    if (RNKLobby.isOverlayVisible()) {
      event.preventDefault();
      RNKLobby.sendPlayerToLogin();
    }
  }

  static handleSocketMessage(data) {
    switch (data?.action) {
      case SOCKET_ACTIONS.STATUS:
        RNKLobby.handleLobbyToggle(data.isActive, { source: "socket", state: data.state });
        break;
      case SOCKET_ACTIONS.REQUEST:
        if (game.user.isGM) RNKLobby.sendStateToRequester(data.requester);
        break;
      case SOCKET_ACTIONS.STATE:
        if (!data.recipient || data.recipient === game.user.id) RNKLobby.applyState(data.state);
        break;
      case SOCKET_ACTIONS.CHAT_SEND:
        if (game.user.isGM) RNKLobby.processInboundChat(data.payload);
        break;
      case SOCKET_ACTIONS.CHAT_BROADCAST:
        RNKLobby.receiveChatMessage(data.message, { fromBroadcast: true });
        break;
      case SOCKET_ACTIONS.CHAT_CLEAR:
        RNKLobby.clearChatMessages({ fromBroadcast: true });
        break;
      case SOCKET_ACTIONS.POLL_UPDATE:
        RNKLobby.receivePollState(data.poll);
        break;
      case SOCKET_ACTIONS.POLL_VOTE:
        if (game.user.isGM) RNKLobby.processPollVote(data.payload);
        break;
      case SOCKET_ACTIONS.POLL_CLOSE:
        RNKLobby.receivePollState(DEFAULT_POLL_STATE);
        break;
      default:
        break;
    }
  }

  static collectStateFromSettings() {
    return {
      isActive: game.settings.get(LOBBY_MODULE_ID, LOBBY_SETTING_KEY),
      appearance: RNKLobby.getAppearanceSettings(),
      countdown: RNKLobby.getCountdownState(),
      customMessage: game.settings.get(LOBBY_MODULE_ID, CUSTOM_MESSAGE_KEY) ?? "",
      customImage: game.settings.get(LOBBY_MODULE_ID, CUSTOM_IMAGE_KEY) ?? "",
      chat: RNKLobby.chatMessages,
      poll: RNKLobby.getPollStateFromSettings()
    };
  }

  static getAppearanceSettings() {
    const stored = game.settings.get(LOBBY_MODULE_ID, APPEARANCE_SETTING_KEY) || {};
    return {
      ...DEFAULT_APPEARANCE,
      ...stored
    };
  }

  static async setAppearanceSettings(settings) {
    const merged = {
      ...DEFAULT_APPEARANCE,
      ...RNKLobby.getAppearanceSettings(),
      ...settings
    };
    await game.settings.set(LOBBY_MODULE_ID, APPEARANCE_SETTING_KEY, merged);
    RNKLobby.currentState.appearance = merged;
    RNKLobby.refreshOverlayAppearance();
    RNKLobby.broadcastState();
  }

  static getCountdownState() {
    const stored = game.settings.get(LOBBY_MODULE_ID, COUNTDOWN_SETTING_KEY) || {};
    const merged = { ...DEFAULT_COUNTDOWN, ...stored };
    if (!merged.isActive || merged.endTime <= Date.now()) {
      return { ...DEFAULT_COUNTDOWN, isActive: false };
    }
    return merged;
  }

  // Random helper function
  static odF1ag9_8_2() {}

  static async setCountdownState(state) {
    const merged = {
      ...DEFAULT_COUNTDOWN,
      ...state,
      actions: {
        ...DEFAULT_COUNTDOWN.actions,
        ...(state?.actions || {})
      }
    };
    await game.settings.set(LOBBY_MODULE_ID, COUNTDOWN_SETTING_KEY, merged);
    RNKLobby.currentState.countdown = merged;
    RNKLobby.countdownCompletionHandled = !merged.isActive;
    RNKLobby.syncCountdown(merged);
    if (game.user.isGM && merged.isActive) await RNKLobby.recordCountdownStart();
    RNKLobby.broadcastState();
  }

  static cloneChatHistory(history) {
    return Array.isArray(history) ? history.map((entry) => ({ ...entry })) : [];
  }

  static getThemeOptions() {
    const appearance = RNKLobby.getAppearanceSettings();
    return BUILT_IN_THEMES.map((theme) => ({
      ...theme,
      isActive: RNKLobby.appearanceMatchesTheme(appearance, theme.appearance)
    }));
  }

  static appearanceMatchesTheme(appearance, themeAppearance) {
    if (!appearance || !themeAppearance) return false;
    const keys = ["accentColor", "overlayOpacity", "blurStrength", "messageAlignment", "headingFont", "bodyFont"];
    return keys.every((key) => {
      const current = appearance[key];
      const target = themeAppearance[key];
      if (typeof current === "number" || typeof target === "number") {
        const currentValue = Number(current ?? 0);
        const targetValue = Number(target ?? 0);
        return Math.abs(currentValue - targetValue) < 0.01;
      }
      return (current ?? "").toString() === (target ?? "").toString();
    });
  }

  static async applyTheme(themeId) {
    if (!game.user.isGM) return;
    const theme = BUILT_IN_THEMES.find((entry) => entry.id === themeId);
    if (!theme) {
      ui.notifications?.warn("Theme not found");
      return;
    }
    await RNKLobby.setAppearanceSettings(theme.appearance);
    if (RNKLobby.isOverlayVisible()) RNKLobby.applyAppearance();
    ui.notifications?.info(`Theme applied: ${theme.label}`);
    if (RNKLobby.apps.appearance?.rendered) RNKLobby.apps.appearance.render(false);
  }

  static clonePollState(poll) {
    if (!poll) return { ...DEFAULT_POLL_STATE };
    return {
      ...poll,
      options: Array.isArray(poll.options) ? poll.options.map((opt) => ({ ...opt })) : [],
      responses: poll.responses && typeof poll.responses === "object" ? { ...poll.responses } : {}
    };
  }

  static getPollStateFromSettings() {
    const stored = game.settings.get(LOBBY_MODULE_ID, POLL_STATE_KEY) || {};
    return RNKLobby.normalizePollState(stored);
  }

  static normalizePollState(state) {
    const poll = {
      ...DEFAULT_POLL_STATE,
      ...(state || {})
    };
    poll.options = Array.isArray(poll.options)
      ? poll.options.map((opt, index) => ({
          id: opt?.id || foundry.utils?.randomID?.() || `option-${index}`,
          text: opt?.text ?? `Option ${index + 1}`,
          votes: Number(opt?.votes ?? 0)
        }))
      : [];
    poll.responses = poll.responses && typeof poll.responses === "object" ? { ...poll.responses } : {};
    const tallies = RNKLobby.computePollTallies(poll);
    poll.options = poll.options.map((opt) => ({ ...opt, votes: tallies[opt.id] ?? 0 }));
    poll.active = Boolean(poll.active && poll.question && poll.options.length >= 2);
    if (!poll.active) {
      poll.responses = {};
    }
    return poll;
  }

  static computePollTallies(poll) {
    const result = {};
    const responses = poll?.responses || {};
    Object.values(responses).forEach((optionId) => {
      if (!optionId) return;
      result[optionId] = (result[optionId] || 0) + 1;
    });
    (poll?.options || []).forEach((opt) => {
      if (!result[opt.id]) result[opt.id] = 0;
    });
    return result;
  }

  static async setPollState(state, { broadcast = true, persist = true } = {}) {
    const normalized = RNKLobby.normalizePollState(state);
    RNKLobby.pollState = RNKLobby.clonePollState(normalized);
    RNKLobby.currentState.poll = RNKLobby.clonePollState(normalized);
    if (persist && game.user.isGM) {
      await game.settings.set(LOBBY_MODULE_ID, POLL_STATE_KEY, RNKLobby.pollState);
    }
    if (broadcast && game.user.isGM) RNKLobby.broadcastPollState();
    RNKLobby.refreshPollOverlay();
    if (RNKLobby.apps.pollManager?.rendered) RNKLobby.apps.pollManager.render(false);
  }

  static broadcastPollState() {
    game.socket.emit(`module.${LOBBY_MODULE_ID}`, {
      action: SOCKET_ACTIONS.POLL_UPDATE,
      poll: RNKLobby.pollState
    });
  }

  static receivePollState(state) {
    const normalized = RNKLobby.normalizePollState(state);
    RNKLobby.pollState = RNKLobby.clonePollState(normalized);
    RNKLobby.currentState.poll = RNKLobby.clonePollState(normalized);
    RNKLobby.refreshPollOverlay();
    if (RNKLobby.apps.pollManager?.rendered) RNKLobby.apps.pollManager.render(false);
  }

  static async processPollVote(payload) {
    if (!game.user.isGM) return;
    const { userId, optionId, userName } = payload || {};
    if (!userId || !optionId || !RNKLobby.pollState.active) return;
    if (!RNKLobby.pollState.options.some((opt) => opt.id === optionId)) return;
    RNKLobby.pollState.responses = {
      ...RNKLobby.pollState.responses,
      [userId]: optionId
    };
    const tallies = RNKLobby.computePollTallies(RNKLobby.pollState);
    RNKLobby.pollState.options = RNKLobby.pollState.options.map((opt) => ({
      ...opt,
      votes: tallies[opt.id] ?? 0
    }));
    await RNKLobby.setPollState(RNKLobby.pollState, { broadcast: true, persist: true });
  }

  static voteInPoll(optionId) {
    if (!RNKLobby.pollState.active) return;
    game.socket.emit(`module.${LOBBY_MODULE_ID}`, {
      action: SOCKET_ACTIONS.POLL_VOTE,
      payload: {
        optionId,
        userId: game.user.id,
        userName: game.user.name
      }
    });
  }

  static async closePoll() {
    if (!game.user.isGM) return;
    if (!RNKLobby.pollState.active) return;
    await RNKLobby.recordPollOutcome(RNKLobby.pollState);
    RNKLobby.pollState = { ...DEFAULT_POLL_STATE };
    await RNKLobby.setPollState(RNKLobby.pollState, { broadcast: true, persist: true });
    game.socket.emit(`module.${LOBBY_MODULE_ID}`, { action: SOCKET_ACTIONS.POLL_CLOSE });
    ui.notifications?.info("Lobby poll closed");
  }

  static async createPoll({ question, options }) {
    if (!game.user.isGM) return false;
    const trimmedQuestion = question?.trim();
    const normalizedOptions = Array.isArray(options)
      ? options
          .map((opt) => (typeof opt === "string" ? opt.trim() : ""))
          .filter((opt, index, arr) => opt && arr.indexOf(opt) === index)
      : [];

    if (!trimmedQuestion || normalizedOptions.length < 2) {
      ui.notifications?.warn("Provide a question and at least two unique options.");
      return false;
    }

    const pollState = {
      active: true,
      question: trimmedQuestion,
      options: normalizedOptions.map((text) => ({
        id:
          foundry.utils?.randomID?.() ||
          globalThis.crypto?.randomUUID?.() ||
          text.toLowerCase().replace(/\s+/g, "-"),
        text,
        votes: 0
      })),
      responses: {}
    };

    await RNKLobby.setPollState(pollState, { broadcast: true, persist: true });
    ui.notifications?.info("Lobby poll launched");
    return true;
  }

  static refreshPollOverlay() {
    if (!RNKLobby.overlayElements?.poll) return;
    RNKLobby.renderPollState();
  }

  static getUserPollVote(userId = game.user?.id) {
    return RNKLobby.pollState.responses?.[userId] ?? null;
  }

  static renderPollState() {
    if (!RNKLobby.overlayElements?.poll) return;
    const { container, question, options, status } = RNKLobby.overlayElements.poll;
    const poll = RNKLobby.pollState;

    if (!poll?.active) {
      container.classList.add("hidden");
      options.innerHTML = "";
      question.textContent = "No active poll at the moment.";
      status.textContent = "Awaiting the next GM prompt.";
      return;
    }

    container.classList.remove("hidden");
    question.textContent = poll.question;

    const tallies = RNKLobby.computePollTallies(poll);
    const totalVotes = Object.values(tallies).reduce((sum, count) => sum + count, 0);
    const userVote = RNKLobby.getUserPollVote();

    options.innerHTML = "";
    poll.options.forEach((opt) => {
      const votes = tallies[opt.id] ?? 0;
      const percentage = totalVotes ? Math.round((votes / totalVotes) * 100) : 0;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "rnk-lobby-poll__option";
      button.dataset.optionId = opt.id;

      const label = document.createElement("span");
      label.className = "rnk-lobby-poll__option-label";
      label.textContent = opt.text;

      const meta = document.createElement("span");
      meta.className = "rnk-lobby-poll__option-meta";
      if (totalVotes === 0) {
        meta.textContent = "No votes yet";
      } else {
        meta.textContent = `${votes} vote${votes === 1 ? "" : "s"} Ã‚Â· ${percentage}%`;
      }

      const bar = document.createElement("span");
      bar.className = "rnk-lobby-poll__option-bar";
  bar.style.setProperty("--poll-progress", String(Math.min(100, Math.max(0, percentage))));

      button.append(label, meta, bar);
      if (userVote === opt.id) button.classList.add("selected");
      options.appendChild(button);
    });

    if (totalVotes === 0) {
      status.textContent = "Cast the first vote to kick things off.";
    } else if (userVote) {
      status.textContent = "Your vote is locked in Ã¢â‚¬â€ feel free to change it while the poll is open.";
    } else {
      status.textContent = "Pick an option to have your say.";
    }
  }

  static onPollOptionClick(event) {
    const target = event.target.closest(".rnk-lobby-poll__option");
    if (!target) return;
    event.preventDefault();
    if (!RNKLobby.pollState.active) return;
    const optionId = target.dataset.optionId;
    if (!optionId) return;
    RNKLobby.voteInPoll(optionId);
  }

  static getPresets() {
    const stored = game.settings.get(LOBBY_MODULE_ID, PRESET_STORAGE_KEY) || [];
    if (!Array.isArray(stored)) return [];
    return stored
      .map((preset) => ({ ...preset }))
      .sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
  }

  static async persistPresets(presets) {
    if (!game.user.isGM) return;
    const trimmed = Array.isArray(presets) ? presets.slice(0, MAX_PRESETS) : [];
    await game.settings.set(LOBBY_MODULE_ID, PRESET_STORAGE_KEY, trimmed);
    if (RNKLobby.apps.presets?.rendered) RNKLobby.apps.presets.render(false);
  }

  static async savePreset(name, { includeCountdown = true } = {}) {
    if (!game.user.isGM) return false;
    const presets = RNKLobby.getPresets();
    const displayName = name?.trim() || `Preset ${new Date().toLocaleString()}`;
    const appearance = RNKLobby.getAppearanceSettings();
    const countdown = RNKLobby.currentState.countdown || DEFAULT_COUNTDOWN;

    const countdownTemplate = includeCountdown
      ? {
          duration: countdown.duration || DEFAULT_COUNTDOWN.duration,
          message: countdown.message || DEFAULT_COUNTDOWN.message,
          showProgressBar: countdown.showProgressBar !== false,
          actions: {
            ...DEFAULT_COUNTDOWN.actions,
            ...(countdown.actions || {})
          }
        }
      : null;

    const preset = {
      id: foundry.utils?.randomID?.() || globalThis.crypto?.randomUUID?.() || Date.now().toString(36),
      name: displayName,
      savedAt: Date.now(),
      appearance,
      customMessage: game.settings.get(LOBBY_MODULE_ID, CUSTOM_MESSAGE_KEY) ?? "",
      customImage: game.settings.get(LOBBY_MODULE_ID, CUSTOM_IMAGE_KEY) ?? "",
      countdownTemplate
    };

    const existingIndex = presets.findIndex((entry) => entry.name === preset.name);
    if (existingIndex >= 0) presets.splice(existingIndex, 1);
    presets.unshift(preset);
    await RNKLobby.persistPresets(presets.slice(0, MAX_PRESETS));
    ui.notifications?.info(`Saved lobby preset: ${preset.name}`);
    return true;
  }

  static async deletePreset(presetId) {
    if (!game.user.isGM) return;
    const presets = RNKLobby.getPresets().filter((preset) => preset.id !== presetId);
    await RNKLobby.persistPresets(presets);
    ui.notifications?.info("Preset removed");
  }

  static async applyPreset(presetId) {
    if (!game.user.isGM) return;
    const preset = RNKLobby.getPresets().find((entry) => entry.id === presetId);
    if (!preset) {
      ui.notifications?.warn("Preset not found");
      return;
    }

    await game.settings.set(LOBBY_MODULE_ID, CUSTOM_MESSAGE_KEY, preset.customMessage ?? "");
    await game.settings.set(LOBBY_MODULE_ID, CUSTOM_IMAGE_KEY, preset.customImage ?? "");
    RNKLobby.currentState.customMessage = preset.customMessage ?? "";
    RNKLobby.currentState.customImage = preset.customImage ?? "";

    await RNKLobby.setAppearanceSettings({
      ...DEFAULT_APPEARANCE,
      ...(preset.appearance || {})
    });
    RNKLobby.updateOverlayBackground();

    if (preset.countdownTemplate) {
      const template = preset.countdownTemplate;
      await RNKLobby.setCountdownState({
        isActive: false,
        duration: template.duration || DEFAULT_COUNTDOWN.duration,
        endTime: 0,
        message: template.message || DEFAULT_COUNTDOWN.message,
        showProgressBar: template.showProgressBar !== false,
        completed: false,
        actions: {
          ...DEFAULT_COUNTDOWN.actions,
          ...(template.actions || {})
        }
      });
    }

    if (RNKLobby.isOverlayVisible()) {
      RNKLobby.applyAppearance();
    }

    ui.notifications?.info(`Preset applied: ${preset.name}`);
  }

  static getAnalyticsData() {
    const stored = game.settings.get(LOBBY_MODULE_ID, ANALYTICS_KEY) || {};
    const analytics = {
      ...DEFAULT_ANALYTICS,
      ...stored
    };
    analytics.sessions = Array.isArray(analytics.sessions) ? analytics.sessions.slice(-MAX_RECENT_SESSIONS) : [];
    analytics.chatStats = analytics.chatStats && typeof analytics.chatStats === "object" ? { ...analytics.chatStats } : {};
    analytics.pollHistory = Array.isArray(analytics.pollHistory) ? analytics.pollHistory.slice(-MAX_RECENT_SESSIONS) : [];
    return analytics;
  }

  static async commitAnalytics() {
    const payload = {
      ...DEFAULT_ANALYTICS,
      ...RNKLobby.analytics,
      sessions: Array.isArray(RNKLobby.analytics.sessions)
        ? RNKLobby.analytics.sessions.slice(-MAX_RECENT_SESSIONS)
        : [],
      chatStats: RNKLobby.analytics.chatStats && typeof RNKLobby.analytics.chatStats === "object"
        ? { ...RNKLobby.analytics.chatStats }
        : {},
      pollHistory: Array.isArray(RNKLobby.analytics.pollHistory)
        ? RNKLobby.analytics.pollHistory.slice(-MAX_RECENT_SESSIONS)
        : [],
      lastActivatedAt: RNKLobby.analytics.lastActivatedAt ?? null
    };
    RNKLobby.analytics = payload;
    if (game.user.isGM) await game.settings.set(LOBBY_MODULE_ID, ANALYTICS_KEY, payload);
    if (RNKLobby.apps.analytics?.rendered) RNKLobby.apps.analytics.render(false);
    if (RNKLobby.apps.pollManager?.rendered) RNKLobby.apps.pollManager.render(false);
  }

  static async recordLobbyActivation() {
    if (!game.user.isGM) return;
    if (RNKLobby.analytics.lastActivatedAt) return;
    RNKLobby.analytics.lastActivatedAt = Date.now();
    await RNKLobby.commitAnalytics();
  }

  static async recordLobbyDeactivation() {
    if (!game.user.isGM) return;
    const startedAt = RNKLobby.analytics.lastActivatedAt;
    if (!startedAt) return;
    const endedAt = Date.now();
    const duration = Math.max(0, endedAt - startedAt);
    const sessions = Array.isArray(RNKLobby.analytics.sessions)
      ? [...RNKLobby.analytics.sessions]
      : [];
    sessions.push({ startedAt, endedAt, duration });
    RNKLobby.analytics.sessions = sessions.slice(-MAX_RECENT_SESSIONS);
    RNKLobby.analytics.totalActiveMs = Number(RNKLobby.analytics.totalActiveMs || 0) + duration;
    RNKLobby.analytics.lastActivatedAt = null;
    await RNKLobby.commitAnalytics();
  }

  static async recordChatAnalytics(message) {
    if (!game.user.isGM) return;
    if (!message?.userId) return;
    const stats = RNKLobby.analytics.chatStats && typeof RNKLobby.analytics.chatStats === "object"
      ? { ...RNKLobby.analytics.chatStats }
      : {};
    const existing = stats[message.userId] || { count: 0, name: message.author || "Unknown", lastMessageAt: null };
    existing.count += 1;
    existing.name = message.author || existing.name;
    existing.lastMessageAt = message.timestamp || Date.now();
    stats[message.userId] = existing;
    RNKLobby.analytics.chatStats = stats;
    await RNKLobby.commitAnalytics();
  }

  static async recordCountdownStart() {
    if (!game.user.isGM) return;
    RNKLobby.analytics.countdownUses = Number(RNKLobby.analytics.countdownUses || 0) + 1;
    await RNKLobby.commitAnalytics();
  }

  static async recordPollOutcome(poll) {
    if (!game.user.isGM) return;
    const tallies = RNKLobby.computePollTallies(poll);
    const summary = {
      question: poll?.question || "",
      closedAt: Date.now(),
      options: (poll?.options || []).map((opt) => ({
        text: opt.text,
        votes: tallies[opt.id] ?? 0
      })),
    };
    summary.totalVotes = summary.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
    const history = Array.isArray(RNKLobby.analytics.pollHistory)
      ? [...RNKLobby.analytics.pollHistory]
      : [];
    history.push(summary);
    RNKLobby.analytics.pollHistory = history.slice(-MAX_RECENT_SESSIONS);
    await RNKLobby.commitAnalytics();
  }

  static applyState(state) {
    if (!state) return;
    RNKLobby.currentState = {
      isActive: state.isActive,
      appearance: { ...DEFAULT_APPEARANCE, ...state.appearance },
      countdown: { ...DEFAULT_COUNTDOWN, ...state.countdown },
      customMessage: state.customMessage ?? "",
      customImage: state.customImage ?? "",
      poll: RNKLobby.normalizePollState(state.poll)
    };

    RNKLobby.chatMessages = RNKLobby.cloneChatHistory(state.chat ?? RNKLobby.chatMessages);
    RNKLobby.syncCountdown(RNKLobby.currentState.countdown);
    RNKLobby.pollState = RNKLobby.clonePollState(RNKLobby.currentState.poll);

    if (state.isActive) {
      RNKLobby.showLobbyOverlay(RNKLobby.currentState);
    } else {
      RNKLobby.hideLobbyOverlay();
    }

    RNKLobby.updateSidebarButtonState();
    RNKLobby.updateStatusBanner(state.isActive);
    RNKLobby.refreshChatMonitor();
    RNKLobby.refreshPollOverlay();
    if (RNKLobby.apps.hub?.rendered) RNKLobby.apps.hub.render(false);
    if (RNKLobby.apps.switchboard?.rendered) RNKLobby.apps.switchboard.render(false);
    if (RNKLobby.apps.countdown?.rendered) RNKLobby.apps.countdown.render(false);
    if (RNKLobby.apps.appearance?.rendered) RNKLobby.apps.appearance.render(false);
  }

  static async handleLobbyToggle(isActive, options = {}) {
    const source = options.source ?? "manual";
    if (game.settings.get(LOBBY_MODULE_ID, LOBBY_SETTING_KEY) !== isActive && source !== "setting") {
      try {
        RNKLobby.suppressSettingUpdate = true;
        await game.settings.set(LOBBY_MODULE_ID, LOBBY_SETTING_KEY, isActive);
      } finally {
        RNKLobby.suppressSettingUpdate = false;
      }
    }

    if (game.settings.get(LOBBY_MODULE_ID, ENABLE_SOUND_KEY)) {
      RNKLobby.playNotificationSound(isActive);
    }

    RNKLobby.currentState.isActive = isActive;

    const state = options.state ?? RNKLobby.collectStateFromSettings();
    RNKLobby.currentState = { ...state, isActive };
    if (state?.poll) {
      const normalizedPoll = RNKLobby.normalizePollState(state.poll);
      RNKLobby.pollState = RNKLobby.clonePollState(normalizedPoll);
      RNKLobby.currentState.poll = RNKLobby.clonePollState(normalizedPoll);
    }

    if (isActive) {
      RNKLobby.showLobbyOverlay(state);
    } else {
      RNKLobby.hideLobbyOverlay();
    }

    RNKLobby.updateSidebarButtonState();
    RNKLobby.refreshSidebarStack();
    RNKLobby.updateStatusBanner(isActive);

    if (game.user.isGM && source !== "socket") {
      if (isActive) await RNKLobby.recordLobbyActivation();
      else await RNKLobby.recordLobbyDeactivation();
      RNKLobby.broadcastState();
      ui.notifications?.info(
        isActive
          ? game.i18n.localize("game.notifications.rnk-lobby.lobby-activated")
          : game.i18n.localize("game.notifications.rnk-lobby.lobby-deactivated")
      );
    }

    if (RNKLobby.apps.hub?.rendered) RNKLobby.apps.hub.render(false);
    if (RNKLobby.apps.switchboard?.rendered) RNKLobby.apps.switchboard.render(false);
    if (RNKLobby.apps.countdown?.rendered) RNKLobby.apps.countdown.render(false);
  }

  static broadcastState() {
    if (!game.user.isGM) return;
    const state = {
      ...RNKLobby.collectStateFromSettings(),
      chat: RNKLobby.chatMessages,
      poll: RNKLobby.pollState
    };
    game.socket.emit(`module.${LOBBY_MODULE_ID}`, {
      action: SOCKET_ACTIONS.STATUS,
      isActive: state.isActive,
      state
    });
  }

  static requestCurrentState() {
    game.socket.emit(`module.${LOBBY_MODULE_ID}`, {
      action: SOCKET_ACTIONS.REQUEST,
      requester: game.user.id
    });
  }

  static sendStateToRequester(requester) {
    const state = {
      ...RNKLobby.collectStateFromSettings(),
      chat: RNKLobby.chatMessages,
      poll: RNKLobby.pollState
    };
    game.socket.emit(`module.${LOBBY_MODULE_ID}`, {
      action: SOCKET_ACTIONS.STATE,
      recipient: requester,
      state
    });
  }

  static addSidebarButton() {
    const container = RNKLobby.getSidebarButtonStack();
    if (!container) return;

    const existing = document.getElementById("rnk-lobby-button");
    if (existing?.parentElement !== container) existing?.remove();

    const button = document.createElement("div");
    button.id = "rnk-lobby-button";
    button.className = "rnk-lobby-sidebar-button";
    button.title = "Lobby Control Hub";
    button.innerHTML = '<i class="fas fa-door-closed"></i>';

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      RNKLobby.openHub();
    });

    container.appendChild(button);
    RNKLobby.updateSidebarButtonState(button);
    RNKLobby.refreshSidebarStack();
  }

  static getSidebarButtonStack() {
    const tabs = document.querySelector("#sidebar-tabs") || document.querySelector('#sidebar');
    if (!tabs) return null;

    let stack = tabs.querySelector(`#${BUTTON_STACK_ID}`);
    if (!stack) {
      stack = document.createElement("div");
      stack.id = BUTTON_STACK_ID;
      stack.style.cssText = `
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        gap: 4px !important;
        padding: 4px 0 !important;
        pointer-events: auto !important;
        width: 52px !important;
        max-width: 52px !important;
      `;

      const reference = tabs.querySelector('.item[data-tab="settings"]') ?? tabs.querySelector('.tab.settings') ?? tabs.querySelector('.item') ?? tabs.lastElementChild;
      if (reference) {
        reference.insertAdjacentElement("afterend", stack);
      } else {
        tabs.append(stack);
      }
    }

    const legacy = tabs.querySelector("#RNK-sidebar-button-stack");
    if (legacy && legacy !== stack) {
      while (legacy.firstChild) stack.appendChild(legacy.firstChild);
      legacy.remove();
    }

    ["#runar-buttons", "#deck-buttons", "#crimson-blood-buttons"].forEach((selector) => {
      const container = tabs.querySelector(selector);
      if (container && container !== stack) {
        while (container.firstChild) stack.appendChild(container.firstChild);
        container.remove();
      }
    });

    RNKLobby.ensureSidebarStackStyles();
    return stack;
  }

  static ensureSidebarStackStyles() {
    if (document.getElementById(BUTTON_STACK_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = BUTTON_STACK_STYLE_ID;
    style.textContent = `
      #${BUTTON_STACK_ID} {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        gap: 4px !important;
        padding: 4px 0 !important;
        pointer-events: auto !important;
        width: 52px !important;
        max-width: 52px !important;
      }

      #${BUTTON_STACK_ID} > * {
        width: 48px !important;
        height: 48px !important;
        margin: 0 !important;
      }

      #rnk-lobby-button.rnk-lobby-sidebar-button {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        border-radius: 4px !important;
        border: 2px solid rgba(255, 255, 255, 0.25) !important;
        background: rgba(0, 0, 0, 0.75) !important;
        color: #f5f5f5 !important;
        transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease !important;
        width: 32px !important;
        height: 32px !important;
        min-width: 32px !important;
        max-width: 32px !important;
        min-height: 32px !important;
        max-height: 32px !important;
        margin: 2px 0 !important;
      }

      #rnk-lobby-button.rnk-lobby-sidebar-button i {
        font-size: 14px !important;
        pointer-events: none !important;
      }

      #rnk-lobby-button.rnk-lobby-sidebar-button:hover,
      #rnk-lobby-button.rnk-lobby-sidebar-button:focus-visible {
        border-color: #ff6b6b !important;
        color: #ff6b6b !important;
        box-shadow: 0 0 12px rgba(255, 107, 107, 0.4) !important;
        outline: none !important;
      }

      #rnk-lobby-button.rnk-lobby-sidebar-button.active {
        border-color: #ff6b6b !important;
        color: #ff6b6b !important;
        box-shadow: 0 0 14px rgba(255, 107, 107, 0.55) !important;
      }
    `;
    document.head?.appendChild(style);
  }

  static openHub() {
    console.log("RNK Lobby | Opening Control Hub");
    if (!RNKLobby.apps.hub) {
      RNKLobby.apps.hub = new RNKLobbyHub();
    }
    RNKLobby.apps.hub.render(true);
  }

  static updateSidebarButtonState(button = null) {
    const btn = button || document.getElementById("rnk-lobby-button");
    if (!btn) return;
    if (RNKLobby.currentState.isActive) {
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
    } else {
      btn.classList.remove("active");
      btn.setAttribute("aria-pressed", "false");
    }
  }

  static refreshSidebarStack() {
    const stack = RNKLobby.getSidebarButtonStack();
    if (!stack) return;
    const lobbyButton = document.getElementById("rnk-lobby-button");
    if (lobbyButton && lobbyButton.parentElement !== stack) {
      stack.appendChild(lobbyButton);
    }
  }

  static playNotificationSound(isActive) {
    try {
      const soundPath = isActive ? "sounds/notify.wav" : "sounds/lock.wav";
      AudioHelper.play({ src: soundPath, volume: 0.5, autoplay: true, loop: false }, false);
    } catch (error) {
      console.warn("RNK Lobby | Could not play notification sound:", error);
    }
  }

  static showLobbyOverlay(state = RNKLobby.currentState) {
    const gmPreview = game.user.isGM && game.settings.get(LOBBY_MODULE_ID, GM_PREVIEW_KEY);
    if (game.user.isGM && !gmPreview) return;

    RNKLobby.removeExistingOverlay();

    const overlay = document.createElement("div");
    overlay.id = "rnk-lobby-overlay";
    overlay.classList.add("rnk-lobby-active");

    // 1. Background Layer
    const backgroundLayer = document.createElement("div");
    backgroundLayer.id = "rnk-lobby-background";
    overlay.appendChild(backgroundLayer);

    // 2. Glass Container
    const container = document.createElement("div");
    container.classList.add("rnk-lobby-container");

    // 3. Main Content Area
    const mainContent = document.createElement("div");
    mainContent.classList.add("rnk-lobby-main");

    const title = document.createElement("h1");
    title.classList.add("rnk-lobby-title");

    const subtitle = document.createElement("div");
    subtitle.classList.add("rnk-lobby-subtitle");
    subtitle.textContent = "System Maintenance In Progress";

    const message = document.createElement("div");
    message.classList.add("rnk-lobby-message");

    // Status Bar
    const statusBar = document.createElement("div");
    statusBar.classList.add("rnk-lobby-status-bar");

    const statusStat = document.createElement("div");
    statusStat.classList.add("rnk-lobby-stat");
    statusStat.innerHTML = `
      <span class="rnk-lobby-stat-label">Server Status</span>
      <span class="rnk-lobby-stat-value">
        <span class="rnk-status-dot maintenance"></span> Maintenance
      </span>
    `;
    statusBar.appendChild(statusStat);

    // Countdown (Hidden by default)
    const countdownContainer = document.createElement("div");
    countdownContainer.classList.add("rnk-lobby-stat");
    countdownContainer.style.display = "none";
    countdownContainer.innerHTML = `
      <span class="rnk-lobby-stat-label">Estimated Time</span>
      <span class="rnk-lobby-stat-value" id="rnk-lobby-timer">--:--</span>
    `;
    statusBar.appendChild(countdownContainer);

    mainContent.appendChild(title);
    mainContent.appendChild(subtitle);
    mainContent.appendChild(message);
    mainContent.appendChild(statusBar);

    // 4. Sidebar (Character Card & Chat)
    const sidebar = document.createElement("div");
    sidebar.classList.add("rnk-lobby-sidebar");

    // Character Card
    const charCard = document.createElement("div");
    charCard.classList.add("rnk-character-card");
    
    const actor = game.user.character;
    const charImg = document.createElement("img");
    charImg.classList.add("rnk-character-image");
    charImg.src = actor?.img || "icons/svg/mystery-man.svg";
    
    const charInfo = document.createElement("div");
    charInfo.classList.add("rnk-character-info");
    charInfo.innerHTML = `
      <div class="rnk-character-name">${actor?.name || game.user.name}</div>
      <div class="rnk-character-class">${actor?.type || "Player"}</div>
    `;

    charCard.appendChild(charImg);
    charCard.appendChild(charInfo);
    sidebar.appendChild(charCard);

    // Chat / Updates Area
    const updatesArea = document.createElement("div");
    updatesArea.classList.add("rnk-lobby-updates");
    sidebar.appendChild(updatesArea);

    // Chat Input
    const chatForm = document.createElement("form");
    chatForm.style.display = "flex";
    chatForm.style.gap = "0.5rem";
    chatForm.innerHTML = `
      <input type="text" placeholder="Message GM..." style="flex:1; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:white; padding:0.5rem; border-radius:4px;">
      <button type="submit" style="background:var(--lobby-accent); border:none; color:white; padding:0 1rem; border-radius:4px; cursor:pointer;">Send</button>
    `;
    sidebar.appendChild(chatForm);

    container.appendChild(mainContent);
    container.appendChild(sidebar);
    overlay.appendChild(container);

    // 5. Audio Controls
    const audioControls = document.createElement("div");
    audioControls.classList.add("rnk-audio-controls");
    audioControls.innerHTML = `
      <div class="rnk-audio-btn" id="rnk-lobby-mute" title="Toggle Sound"><i class="fas fa-volume-up"></i></div>
      <div class="rnk-audio-btn" id="rnk-lobby-logout" title="Logout"><i class="fas fa-sign-out-alt"></i></div>
    `;
    overlay.appendChild(audioControls);

    document.body.appendChild(overlay);

    // Store references
    RNKLobby.overlayElements = {
      overlay,
      backgroundLayer,
      title,
      message,
      countdown: {
        container: countdownContainer,
        timer: countdownContainer.querySelector("#rnk-lobby-timer")
      },
      chat: {
        log: updatesArea,
        form: chatForm,
        input: chatForm.querySelector("input")
      }
    };

    // Initialize Content
    RNKLobby.updateOverlayBackground(state.customImage);
    RNKLobby.applyAppearance(state);
    RNKLobby.renderChatMessages();
    RNKLobby.updateCountdownDisplay();

    // Event Listeners
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = chatForm.querySelector("input");
      const text = input.value.trim();
      if (text) {
        RNKLobby.sendChatMessage(text);
        input.value = "";
      }
    });

    document.getElementById("rnk-lobby-logout").addEventListener("click", () => RNKLobby.sendPlayerToLogin());
    
    // Mute Toggle
    let isMuted = false;
    document.getElementById("rnk-lobby-mute").addEventListener("click", (e) => {
      isMuted = !isMuted;
      const icon = e.currentTarget.querySelector("i");
      icon.className = isMuted ? "fas fa-volume-mute" : "fas fa-volume-up";
      // Implement actual audio muting logic here if we add background music
    });

    const shouldDisableInteraction = !game.user.isGM || gmPreview;
    if (shouldDisableInteraction) {
      RNKLobby.disableWorldInteraction();
    }
  }

  static updateOverlayBackground(path) {
    if (!RNKLobby.overlayElements) return;
    const layer = RNKLobby.overlayElements.backgroundLayer;
    layer.innerHTML = ""; // Clear existing

    const imagePath = path || DEFAULT_IMAGE_FILE;
    const resolvedPath = RNKLobby.resolveImagePath(imagePath);
    const isVideo = resolvedPath.endsWith(".webm") || resolvedPath.endsWith(".mp4");

    if (isVideo) {
      const video = document.createElement("video");
      video.src = resolvedPath;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      layer.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.src = resolvedPath;
      layer.appendChild(img);
    }
  }

  static removeExistingOverlay() {
    const existing = document.getElementById("rnk-lobby-overlay");
    if (existing) existing.remove();
    RNKLobby.overlayElements = null;
  }

  static hideLobbyOverlay() {
    const overlay = document.getElementById("rnk-lobby-overlay");
    if (overlay) {
      overlay.classList.remove("rnk-lobby-active");
      setTimeout(() => {
        overlay.remove();
      }, 500);
    }
    RNKLobby.overlayElements = null;
    RNKLobby.enableWorldInteraction();
  }

  static applyAppearance(state = RNKLobby.currentState) {
    if (!RNKLobby.overlayElements) return;

    const { overlay, title, message } = RNKLobby.overlayElements;
    const appearance = state.appearance ?? DEFAULT_APPEARANCE;
    const customMessage = state.customMessage?.trim();

    // Update CSS Variables
    overlay.style.setProperty("--lobby-accent", appearance.accentColor ?? "#ff6b6b");
    overlay.style.setProperty("--lobby-glass-blur", `${appearance.blurStrength ?? 20}px`);
    
    // Update Text
    const localizedTitle = game.i18n.localize("game.messages.rnk-lobby.maintenance-title");
    title.textContent = appearance.customTitle?.trim() || localizedTitle || "Ragnarok's Lobby";

    const defaultMessage = game.i18n.localize("game.messages.rnk-lobby.maintenance-message");
    message.innerHTML = customMessage || defaultMessage || "The world is currently being reshaped by the Game Master. Please stand by.";
  }

  static refreshOverlayAppearance() {
    RNKLobby.currentState.appearance = RNKLobby.getAppearanceSettings();
    if (RNKLobby.isOverlayVisible()) {
      RNKLobby.applyAppearance();
      RNKLobby.updateOverlayBackground(RNKLobby.currentState.customImage);
    }
  }

  static syncCountdownFromSettings() {
    const state = RNKLobby.getCountdownState();
    RNKLobby.currentState.countdown = state;

    RNKLobby.countdownCompletionHandled = !state.isActive;
    RNKLobby.syncCountdown(state);
  }

  static syncCountdown(state) {
    if (RNKLobby.countdownInterval) {
      clearInterval(RNKLobby.countdownInterval);
      RNKLobby.countdownInterval = null;
    }

    if (!state?.isActive) {
      RNKLobby.updateCountdownDisplay();
      return;
    }

    RNKLobby.countdownInterval = window.setInterval(() => RNKLobby.updateCountdownDisplay(), 1000);
    RNKLobby.updateCountdownDisplay();
  }

  static updateCountdownDisplay() {
    if (!RNKLobby.overlayElements) return;
    const countdown = RNKLobby.currentState.countdown;
    const elements = RNKLobby.overlayElements.countdown;
    if (!elements) return;

    if (!countdown?.isActive || countdown.endTime <= Date.now()) {
      elements.container.classList.add("hidden");
      if (RNKLobby.countdownInterval) {
        clearInterval(RNKLobby.countdownInterval);
        RNKLobby.countdownInterval = null;
      }
      if (countdown?.isActive && countdown.endTime <= Date.now()) {
        RNKLobby.onCountdownComplete();
      }
      return;
    }

    elements.container.classList.remove("hidden");
    elements.label.textContent = countdown.message || DEFAULT_COUNTDOWN.message;

    const remaining = Math.max(0, countdown.endTime - Date.now());
    const total = Math.max(1, countdown.duration * 60 * 1000);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000).toString().padStart(2, "0");
    elements.timer.textContent = `${minutes}:${seconds}`;

    if (countdown.showProgressBar) {
      const ratio = 1 - remaining / total;
      elements.progressBar.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
      elements.progressBar.parentElement.classList.remove("hidden");
    } else {
      elements.progressBar.parentElement.classList.add("hidden");
    }
  }

  static async onCountdownComplete() {
    if (RNKLobby.countdownCompletionHandled) return;
    RNKLobby.countdownCompletionHandled = true;
    const countdown = { ...RNKLobby.currentState.countdown };
    const actions = {
      ...DEFAULT_COUNTDOWN.actions,
      ...(countdown.actions || {})
    };

    if (game.user.isGM) {
      try {
        await RNKLobby.executeCountdownActions(actions);
      } catch (error) {
        console.error("RNK Lobby | Countdown action failed", error);
      }
      const nextState = {
        ...countdown,
        isActive: false,
        completed: true,
        endTime: 0,
        actions
      };
      await RNKLobby.setCountdownState(nextState);
      ui.notifications?.info("Lobby countdown complete");
    } else {
      RNKLobby.currentState.countdown = {
        ...countdown,
        isActive: false,
        endTime: 0
      };
      RNKLobby.syncCountdown(RNKLobby.currentState.countdown);
    }
  }

  static async executeCountdownActions(actions = {}) {
    if (!game.user.isGM) return;
    if (actions.chatMessage?.trim()) {
      await ChatMessage.create({
        content: actions.chatMessage.trim(),
        speaker: { alias: "Lobby Countdown" }
      });
    }

    if (actions.soundPath?.trim()) {
      try {
        await AudioHelper.play({ src: actions.soundPath.trim(), volume: 0.8, autoplay: true, loop: false }, true);
      } catch (error) {
        console.warn("RNK Lobby | Countdown sound failed", error);
      }
    }

    if (actions.sceneId?.trim()) {
      const sceneId = actions.sceneId.trim();
      const scene = game.scenes?.get(sceneId) || (foundry.utils?.isUUID?.(sceneId) ? await fromUuid(sceneId) : null);
      if (scene?.activate) {
        await scene.activate();
      }
    }

    if (actions.macroId?.trim()) {
      const macroId = actions.macroId.trim();
      let macro = game.macros?.get(macroId);
      if (!macro && foundry.utils?.isUUID?.(macroId)) {
        macro = await fromUuid(macroId);
      }
      if (macro?.execute) {
        try {
          await macro.execute();
        } catch (error) {
          console.error("RNK Lobby | Countdown macro failed", error);
        }
      }
    }
  }

  static sendPlayerToLogin() {
    if (typeof game.logOut === "function") {
      game.logOut();
    } else {
      window.location.reload();
    }
  }

  static disableWorldInteraction() {
    const uiTop = document.getElementById("ui-top");
    if (uiTop) {
      uiTop.style.pointerEvents = "none";
      uiTop.style.opacity = "0.5";
    }
    const board = document.getElementById("board");
    if (board) board.style.pointerEvents = "none";
    const controls = document.getElementById("controls");
    if (controls) controls.style.pointerEvents = "none";
  }

  static enableWorldInteraction() {
    const uiTop = document.getElementById("ui-top");
    if (uiTop) {
      uiTop.style.pointerEvents = "auto";
      uiTop.style.opacity = "1";
    }
    const board = document.getElementById("board");
    if (board) board.style.pointerEvents = "auto";
    const controls = document.getElementById("controls");
    if (controls) controls.style.pointerEvents = "auto";
  }

  static isOverlayVisible() {
    return Boolean(document.getElementById("rnk-lobby-overlay"));
  }

  static resolveImagePath(imageSetting) {
    const trimmed = (imageSetting ?? "").trim();
    if (!trimmed) return `${moduleBasePath}/${DEFAULT_IMAGE_FILE}`;
    if (/^(https?:|data:)/i.test(trimmed)) return trimmed;
    if (/^(modules|systems|worlds)\//i.test(trimmed)) return trimmed;
    return `${moduleBasePath}/${trimmed.replace(/^\/+/, "")}`;
  }

  static updateOverlayBackground() {
    if (!RNKLobby.overlayElements?.overlay) return;
    const customImage = RNKLobby.currentState.customImage ?? "";
    const resolvedImagePath = RNKLobby.resolveImagePath(customImage);
    const routedImagePath = globalThis?.foundry?.utils?.getRoute
      ? foundry.utils.getRoute(resolvedImagePath)
      : resolvedImagePath;
    RNKLobby.overlayElements.overlay.style.setProperty("--lobby-bg-image", `url('${routedImagePath}')`);
  }

  static sendChatMessage(text) {
    const payload = {
      text,
      author: game.user.name,
      userId: game.user.id,
      timestamp: Date.now()
    };
    game.socket.emit(`module.${LOBBY_MODULE_ID}`, {
      action: SOCKET_ACTIONS.CHAT_SEND,
      payload
    });
  }

  static async processInboundChat(payload) {
    const message = RNKLobby.normalizeChatMessage(payload);
    RNKLobby.chatMessages.push(message);
    if (RNKLobby.chatMessages.length > MAX_CHAT_ENTRIES) RNKLobby.chatMessages.shift();
    await game.settings.set(LOBBY_MODULE_ID, CHAT_HISTORY_KEY, RNKLobby.chatMessages);
    await RNKLobby.recordChatAnalytics(message);
    RNKLobby.broadcastChatMessage(message);
  }

  static broadcastChatMessage(message) {
    game.socket.emit(`module.${LOBBY_MODULE_ID}`, {
      action: SOCKET_ACTIONS.CHAT_BROADCAST,
      message
    });
  }

  static normalizeChatMessage(payload) {
    const timestamp = payload?.timestamp ?? Date.now();
    const sanitized = RNKLobby.escapeHTML(payload?.text || "").replace(/\n/g, "<br>");
    return {
      id: `${payload?.userId || "anon"}-${timestamp}`,
      author: payload?.author || "Unknown",
      userId: payload?.userId || "",
      text: sanitized,
      timestamp
    };
  }

  static receiveChatMessage(message, { fromBroadcast = false } = {}) {
    if (!message) return;
    const exists = RNKLobby.chatMessages.some((entry) => entry.id === message.id);
    if (!exists) RNKLobby.chatMessages.push(message);
    if (RNKLobby.chatMessages.length > MAX_CHAT_ENTRIES) RNKLobby.chatMessages.shift();
    if (!fromBroadcast && game.user.isGM) {
      game.settings.set(LOBBY_MODULE_ID, CHAT_HISTORY_KEY, RNKLobby.chatMessages);
    }
    RNKLobby.renderChatMessages();
    RNKLobby.refreshChatMonitor();
  }

  static renderChatMessages() {
    if (!RNKLobby.overlayElements) return;
    const log = RNKLobby.overlayElements.chat.log;
    if (!log) return;
    log.innerHTML = "";
    if (!RNKLobby.chatMessages.length) {
      const empty = document.createElement("p");
      empty.classList.add("rnk-lobby-chat__empty");
      empty.textContent = "No messages yet. Be the first to say hi.";
      log.appendChild(empty);
      return;
    }
    RNKLobby.chatMessages
      .slice(-MAX_CHAT_ENTRIES)
      .forEach((entry) => {
        const article = document.createElement("article");
        article.classList.add("rnk-lobby-chat__entry");
        article.innerHTML = `<header><strong>${entry.author}</strong><time>${new Date(entry.timestamp).toLocaleTimeString()}</time></header><p>${entry.text}</p>`;
        log.appendChild(article);
      });
    log.scrollTop = log.scrollHeight;
  }

  static async clearChatMessages({ fromBroadcast = false } = {}) {
    if (!fromBroadcast && game.user.isGM) {
      RNKLobby.chatMessages = [];
      await game.settings.set(LOBBY_MODULE_ID, CHAT_HISTORY_KEY, []);
      game.socket.emit(`module.${LOBBY_MODULE_ID}`, { action: SOCKET_ACTIONS.CHAT_CLEAR });
    } else if (fromBroadcast) {
      RNKLobby.chatMessages = [];
    }
    RNKLobby.renderChatMessages();
    RNKLobby.refreshChatMonitor();
  }

  static refreshChatMonitor() {
    if (RNKLobby.apps.chatMonitor?.rendered) RNKLobby.apps.chatMonitor.render(false);
  }

  static updateStatusBanner(isActive) {
    if (!game.user.isGM) return;
    let banner = document.getElementById("rnk-lobby-status-banner");
    if (!isActive) {
      if (banner) banner.remove();
      return;
    }
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "rnk-lobby-status-banner";
      document.body.appendChild(banner);
    }
    banner.textContent = "Lobby active - players are waiting";
  }

  static escapeHTML(text) {
    return text.replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  static templatePath(file) {
    return `${moduleBasePath}/templates/${file}`;
  }

  static async sendBroadcastMessage(text) {
    const content = text?.trim();
    if (!content) return;
    if (!game.user.isGM) return;
    await ChatMessage.create({
      content,
      speaker: { alias: "Lobby" }
    });
    ui.notifications?.info("Broadcast sent to chat");
  }

  static async resetAppearanceToDefaults() {
    await game.settings.set(LOBBY_MODULE_ID, CUSTOM_MESSAGE_KEY, "");
    await game.settings.set(LOBBY_MODULE_ID, CUSTOM_IMAGE_KEY, "");
    RNKLobby.currentState.customMessage = "";
    RNKLobby.currentState.customImage = "";
    await RNKLobby.setAppearanceSettings({ ...DEFAULT_APPEARANCE });
  }
}

class RNKLobbyHub extends RenderableApplicationBase {
  static get defaultOptions() {
    if (USE_APPLICATION_V2) {
      return mergeDefaults(this, {
        id: "rnk-lobby-hub",
        classes: ["rnk-lobby"],
        window: { title: "RNK Lobby", resizable: true },
        position: { width: 820 }
      });
    }

    return mergeDefaults(this, {
      id: "rnk-lobby-hub",
      classes: ["rnk-lobby"],
      title: "RNK Lobby",
      template: RNKLobby.templatePath("control-hub.hbs"),
      width: 820,
      height: "auto",
      resizable: true
    });
  }

  static DEFAULT_OPTIONS = USE_APPLICATION_V2
    ? mergeDefaults(RNKLobbyHub, {
        id: "rnk-lobby-hub",
        classes: ["rnk-lobby"],
        window: { title: "RNK Lobby", resizable: true },
        position: { width: 820 }
      })
    : mergeDefaults(RNKLobbyHub, {
        id: "rnk-lobby-hub",
        classes: ["rnk-lobby"],
        title: "RNK Lobby",
        template: RNKLobby.templatePath("control-hub.hbs"),
        width: 820,
        height: "auto",
        resizable: true
      });

  static PARTS = USE_APPLICATION_V2
    ? {
        body: { template: RNKLobby.templatePath("control-hub.hbs") }
      }
    : undefined;

  async _prepareContext(options) {
    const base = typeof super._prepareContext === "function" ? await super._prepareContext(options) : {};
    const data = await this.getData(options);
    return mergeContexts(base, data);
  }

  getData() {
    const countdown = RNKLobby.currentState.countdown;
    let statusDetails = "Players are on the live scene. Activate the overlay when you need a pause.";
    if (RNKLobby.currentState.isActive && countdown?.isActive) {
      const remaining = Math.max(0, countdown.endTime - Date.now());
      const minutes = Math.ceil(remaining / 60000);
      const countdownLabel = countdown.message?.trim() || "Maintenance";
      const plural = minutes === 1 ? "" : "s";
      statusDetails = `${countdownLabel} in about ${minutes} minute${plural}`;
    } else if (RNKLobby.currentState.isActive) {
      statusDetails = "Players see the maintenance overlay.";
    }

    const controls = [
      {
        action: "switchboard",
        label: "Lobby Switchboard",
        icon: "fas fa-toggle-on",
        description: "Toggle the overlay, enable GM preview, and send broadcasts."
      },
      {
        action: "appearance",
        label: "Appearance",
        icon: "fas fa-palette",
        description: "Adjust imagery, accent colors, fonts, and messaging."
      },
      {
        action: "presets",
        label: "Presets",
        icon: "fas fa-star",
        description: "Save curated looks and swap between your favorites instantly."
      },
      {
        action: "countdown",
        label: "Countdown",
        icon: "fas fa-hourglass-half",
        description: "Start automated timers, macros, and reminders for returns."
      },
      {
        action: "polls",
        label: "Polls & Ready Checks",
        icon: "fas fa-poll",
        description: "Engage the table with quick polls, votes, and readiness checks."
      },
      {
        action: "chat-monitor",
        label: "Chat Monitor",
        icon: "fas fa-comments",
        description: "Review and moderate lobby chat history while you prep."
      },
      {
        action: "analytics",
        label: "Analytics",
        icon: "fas fa-chart-line",
        description: "Track uptime, countdown usage, and engagement patterns."
      },
      {
        action: "help",
        label: "Help Guide",
        icon: "fas fa-question-circle",
        description: "Explore tips, workflows, and FAQs for mastering the hub."
      }
    ];

    const customImage = RNKLobby.currentState.customImage ?? "";
    const resolvedImagePath = RNKLobby.resolveImagePath(customImage);
    const hubImage = globalThis?.foundry?.utils?.getRoute
      ? foundry.utils.getRoute(resolvedImagePath)
      : resolvedImagePath;

    return {
      isActive: RNKLobby.currentState.isActive,
      statusDetails,
      controls,
      hubImage
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (USE_APPLICATION_V2) return;
    this.bindControls(html);
  }

  _onRender(context, options) {
    super._onRender(context, options);
    if (!USE_APPLICATION_V2) return;
    this.bindControls(this.element);
  }

  bindControls(target) {
    addEventListenerCompat(target, "[data-action]", "click", (event) => this.onAction(event));
  }

  onAction(event) {
    const action = event.currentTarget.dataset.action;
    switch (action) {
      case "switchboard":
        if (!RNKLobby.apps.switchboard) RNKLobby.apps.switchboard = new RNKLobbyToggleWindow();
        RNKLobby.apps.switchboard.render(true);
        break;
      case "appearance":
        if (!RNKLobby.apps.appearance) RNKLobby.apps.appearance = new RNKLobbyAppearanceForm();
        RNKLobby.apps.appearance.render(true);
        break;
      case "countdown":
        if (!RNKLobby.apps.countdown) RNKLobby.apps.countdown = new RNKLobbyCountdownForm();
        RNKLobby.apps.countdown.render(true);
        break;
      case "presets":
        if (!RNKLobby.apps.presets) RNKLobby.apps.presets = new RNKLobbyPresetsManager();
        RNKLobby.apps.presets.render(true);
        break;
      case "polls":
        if (!RNKLobby.apps.pollManager) RNKLobby.apps.pollManager = new RNKLobbyPollManager();
        RNKLobby.apps.pollManager.render(true);
        break;
      case "chat-monitor":
        if (!RNKLobby.apps.chatMonitor) RNKLobby.apps.chatMonitor = new RNKLobbyChatMonitor();
        RNKLobby.apps.chatMonitor.render(true);
        break;
      case "analytics":
        if (!RNKLobby.apps.analytics) RNKLobby.apps.analytics = new RNKLobbyAnalyticsPanel();
        RNKLobby.apps.analytics.render(true);
        break;
      case "help":
        if (!RNKLobby.apps.help) RNKLobby.apps.help = new RNKLobbyHelpDialog();
        RNKLobby.apps.help.render(true);
        break;
      case "refresh-state":
        RNKLobby.requestCurrentState();
        ui.notifications?.info("Requested latest lobby state");
        break;
      case "close":
        this.close();
        break;
      default:
        break;
    }
  }
}

class RNKLobbyToggleWindow extends RenderableApplicationBase {
  static get defaultOptions() {
    return mergeDefaults(this, {
      id: "rnk-lobby-switchboard",
      classes: ["rnk-lobby"],
      title: "Lobby Switchboard",
      template: RNKLobby.templatePath("toggle-controls.hbs"),
      width: 420,
      height: "auto",
      resizable: false
    });
  }

  static DEFAULT_OPTIONS = USE_APPLICATION_V2
    ? mergeDefaults(RNKLobbyToggleWindow, {
        id: "rnk-lobby-switchboard",
        classes: ["rnk-lobby"],
        window: { title: "Lobby Switchboard", resizable: false },
        position: { width: 420 }
      })
    : mergeDefaults(RNKLobbyToggleWindow, {
        id: "rnk-lobby-switchboard",
        classes: ["rnk-lobby"],
        title: "Lobby Switchboard",
        template: RNKLobby.templatePath("toggle-controls.hbs"),
        width: 420,
        height: "auto",
        resizable: false
      });

  static PARTS = USE_APPLICATION_V2
    ? {
        body: { template: RNKLobby.templatePath("toggle-controls.hbs") }
      }
    : undefined;

  async _prepareContext(options) {
    const base = typeof super._prepareContext === "function" ? await super._prepareContext(options) : {};
    const data = await this.getData(options);
    return mergeContexts(base, data);
  }

  getData() {
    return {
      isActive: RNKLobby.currentState.isActive,
      gmPreview: game.settings.get(LOBBY_MODULE_ID, GM_PREVIEW_KEY),
      enableSound: game.settings.get(LOBBY_MODULE_ID, ENABLE_SOUND_KEY),
      broadcastDefault: RNKLobby.currentState.isActive ? "Lobby returning soon." : "Lobby entering maintenance mode."
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (USE_APPLICATION_V2) return;
    this.bindControls(html);
  }
}

RNKLobbyToggleWindow.prototype._onRender = function _onRender(context, options) {
  RenderableApplicationBase.prototype._onRender?.call(this, context, options);
  if (!USE_APPLICATION_V2) return;
  this.bindControls(this.element);
};

RNKLobbyToggleWindow.prototype.bindControls = function bindControls(target) {
  addEventListenerCompat(target, '[data-action="toggle"]', "click", async () => {
    const nextState = !RNKLobby.currentState.isActive;
    await RNKLobby.handleLobbyToggle(nextState, { source: "switchboard" });
    this.render(false);
  });

  addEventListenerCompat(target, '[name="gmPreview"]', "change", (event) => {
    game.settings.set(LOBBY_MODULE_ID, GM_PREVIEW_KEY, event.currentTarget.checked);
  });

  addEventListenerCompat(target, '[name="enableSound"]', "change", (event) => {
    game.settings.set(LOBBY_MODULE_ID, ENABLE_SOUND_KEY, event.currentTarget.checked);
  });

  addEventListenerCompat(target, '[data-action="broadcast"]', "click", () => {
    const input = getFirstElement(target, '[name="broadcast"]');
    const text = input ? input.value : undefined;
    RNKLobby.sendBroadcastMessage(text);
  });
};

function odSi9gna8l2() {}

class RNKLobbyAppearanceForm extends RenderableFormApplicationBase {
  static get defaultOptions() {
    return mergeDefaults(this, {
      id: "rnk-lobby-appearance",
      classes: ["rnk-lobby"],
      title: "Lobby Appearance",
      template: RNKLobby.templatePath("appearance-form.hbs"),
      width: 500,
      height: "auto"
    });
  }

  static DEFAULT_OPTIONS = USE_FORM_APPLICATION_V2
    ? mergeDefaults(RNKLobbyAppearanceForm, {
        id: "rnk-lobby-appearance",
        classes: ["rnk-lobby"],
        tag: "form",
        window: { title: "Lobby Appearance", resizable: true },
        position: { width: 500 }
      })
    : mergeDefaults(RNKLobbyAppearanceForm, {
        id: "rnk-lobby-appearance",
        classes: ["rnk-lobby"],
        title: "Lobby Appearance",
        template: RNKLobby.templatePath("appearance-form.hbs"),
        width: 500,
        height: "auto"
      });

  static PARTS = USE_FORM_APPLICATION_V2
    ? {
        form: { template: RNKLobby.templatePath("appearance-form.hbs") }
      }
    : undefined;

  async _prepareContext(options) {
    const base = typeof super._prepareContext === "function" ? await super._prepareContext(options) : {};
    const data = await this.getData(options);
    return mergeContexts(base, data);
  }

  getData() {
    const appearance = RNKLobby.getAppearanceSettings();
    return {
      settings: {
        ...appearance,
        customMessage: game.settings.get(LOBBY_MODULE_ID, CUSTOM_MESSAGE_KEY) ?? "",
        customImage: game.settings.get(LOBBY_MODULE_ID, CUSTOM_IMAGE_KEY) ?? ""
      },
      themes: RNKLobby.getThemeOptions()
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (USE_FORM_APPLICATION_V2) return;
    this.bindControls(html);
  }

  async _updateObject(event, formData) {
    const values = expandObjectCompat(formData);
    const customMessage = values.customMessage ?? "";
    const customImage = values.customImage ?? "";
    await game.settings.set(LOBBY_MODULE_ID, CUSTOM_MESSAGE_KEY, customMessage);
    await game.settings.set(LOBBY_MODULE_ID, CUSTOM_IMAGE_KEY, customImage);
    RNKLobby.currentState.customMessage = customMessage;
    RNKLobby.currentState.customImage = customImage;

    const appearance = {
      customTitle: values.customTitle ?? "",
      accentColor: values.accentColor ?? DEFAULT_APPEARANCE.accentColor,
      overlayOpacity: Number(values.overlayOpacity ?? DEFAULT_APPEARANCE.overlayOpacity),
      blurStrength: Number(values.blurStrength ?? DEFAULT_APPEARANCE.blurStrength),
      messageAlignment: values.messageAlignment ?? DEFAULT_APPEARANCE.messageAlignment,
      headingFont: values.headingFont?.trim() || DEFAULT_APPEARANCE.headingFont,
      bodyFont: values.bodyFont?.trim() || DEFAULT_APPEARANCE.bodyFont
    };

    await RNKLobby.setAppearanceSettings(appearance);
  }
}

RNKLobbyAppearanceForm.prototype._onRender = function _onRender(context, options) {
  RenderableFormApplicationBase.prototype._onRender?.call(this, context, options);
  if (!USE_FORM_APPLICATION_V2) return;
  this.bindControls(this.element);
};

RNKLobbyAppearanceForm.prototype.bindControls = function bindControls(target) {
  addEventListenerCompat(target, "input[type=range]", "input", (event) => {
    const range = event.currentTarget;
    if (range?.nextElementSibling) range.nextElementSibling.textContent = range.value;
  });

  addEventListenerCompat(target, '[data-action="reset-defaults"]', "click", async (event) => {
    event.preventDefault();
    await RNKLobby.resetAppearanceToDefaults();
    this.render(false);
  });

  addEventListenerCompat(target, '[data-theme-id]', "click", async (event) => {
    const themeId = event.currentTarget?.dataset?.themeId;
    if (themeId) await RNKLobby.applyTheme(themeId);
  });
};

class RNKLobbyCountdownForm extends RenderableFormApplicationBase {
  static get defaultOptions() {
    return mergeDefaults(this, {
      id: "rnk-lobby-countdown",
      classes: ["rnk-lobby"],
      title: "Lobby Countdown",
      template: RNKLobby.templatePath("countdown-form.hbs"),
      width: 420,
      height: "auto"
    });
  }

  static DEFAULT_OPTIONS = USE_FORM_APPLICATION_V2
    ? mergeDefaults(RNKLobbyCountdownForm, {
        id: "rnk-lobby-countdown",
        classes: ["rnk-lobby"],
        tag: "form",
        window: { title: "Lobby Countdown", resizable: true },
        position: { width: 420 }
      })
    : mergeDefaults(RNKLobbyCountdownForm, {
        id: "rnk-lobby-countdown",
        classes: ["rnk-lobby"],
        title: "Lobby Countdown",
        template: RNKLobby.templatePath("countdown-form.hbs"),
        width: 420,
        height: "auto"
      });

  static PARTS = USE_FORM_APPLICATION_V2
    ? {
        form: { template: RNKLobby.templatePath("countdown-form.hbs") }
      }
    : undefined;

  async _prepareContext(options) {
    const base = typeof super._prepareContext === "function" ? await super._prepareContext(options) : {};
    const data = await this.getData(options);
    return mergeContexts(base, data);
  }

  getData() {
    return {
      state: {
        ...DEFAULT_COUNTDOWN,
        ...RNKLobby.currentState.countdown,
        duration: RNKLobby.currentState.countdown.duration || 15,
        message: RNKLobby.currentState.countdown.message || DEFAULT_COUNTDOWN.message
      },
      macros: (game.macros?.contents ?? []).map((macro) => ({
        id: macro.id,
        name: macro.name
      })),
      scenes: (game.scenes?.contents ?? []).map((scene) => ({
        id: scene.id,
        name: scene.name
      }))
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (USE_FORM_APPLICATION_V2) return;
    this.bindControls(html);
  }

  async _updateObject(event, formData) {
    const values = expandObjectCompat(formData);
    const minutes = Math.max(1, Number(values.countdownMinutes ?? 0));
    const message = values.countdownMessage?.trim() || DEFAULT_COUNTDOWN.message;
    const showProgressBar = values.showProgressBar !== "false";
    const endTime = Date.now() + minutes * 60 * 1000;
    const actions = {
      macroId: values.actions?.macroId === "none" ? "" : values.actions?.macroId ?? "",
      sceneId: values.actions?.sceneId === "none" ? "" : values.actions?.sceneId ?? "",
      soundPath: values.actions?.soundPath?.trim() || "",
      chatMessage: values.actions?.chatMessage?.trim() || ""
    };

    await RNKLobby.setCountdownState({
      isActive: true,
      duration: minutes,
      endTime,
      message,
      showProgressBar,
      actions,
      completed: false
    });

    ui.notifications?.info("Countdown started");
  }
}

RNKLobbyCountdownForm.prototype._onRender = function _onRender(context, options) {
  RenderableFormApplicationBase.prototype._onRender?.call(this, context, options);
  if (!USE_FORM_APPLICATION_V2) return;
  this.bindControls(this.element);
};

RNKLobbyCountdownForm.prototype.bindControls = function bindControls(target) {
  addEventListenerCompat(target, '[data-action="clear"]', "click", async (event) => {
    event.preventDefault();
    await RNKLobby.setCountdownState({ ...DEFAULT_COUNTDOWN });
    ui.notifications?.info("Countdown cleared");
    this.render(false);
  });
};

class RNKLobbyChatMonitor extends RenderableApplicationBase {
  static get defaultOptions() {
    return mergeDefaults(this, {
      id: "rnk-lobby-chat-monitor",
      classes: ["rnk-lobby"],
      title: "Lobby Chat Monitor",
      template: RNKLobby.templatePath("chat-monitor.hbs"),
      width: 480,
      height: 520,
      resizable: true
    });
  }

  static DEFAULT_OPTIONS = USE_APPLICATION_V2
    ? mergeDefaults(RNKLobbyChatMonitor, {
        id: "rnk-lobby-chat-monitor",
        classes: ["rnk-lobby"],
        window: { title: "Lobby Chat Monitor", resizable: true },
        position: { width: 480, height: 520 }
      })
    : mergeDefaults(RNKLobbyChatMonitor, {
        id: "rnk-lobby-chat-monitor",
        classes: ["rnk-lobby"],
        title: "Lobby Chat Monitor",
        template: RNKLobby.templatePath("chat-monitor.hbs"),
        width: 480,
        height: 520,
        resizable: true
      });

  static PARTS = USE_APPLICATION_V2
    ? {
        body: { template: RNKLobby.templatePath("chat-monitor.hbs") }
      }
    : undefined;

  async _prepareContext(options) {
    const base = typeof super._prepareContext === "function" ? await super._prepareContext(options) : {};
    const data = await this.getData(options);
    return mergeContexts(base, data);
  }

  getData() {
    const messages = RNKLobby.chatMessages.map((entry) => ({
      ...entry,
      iso: new Date(entry.timestamp).toISOString(),
      time: new Date(entry.timestamp).toLocaleTimeString(),
      text: entry.text
    }));
    return { messages };
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (USE_APPLICATION_V2) return;
    this.bindControls(html);
  }
}

RNKLobbyChatMonitor.prototype._onRender = function _onRender(context, options) {
  RenderableApplicationBase.prototype._onRender?.call(this, context, options);
  if (!USE_APPLICATION_V2) return;
  this.bindControls(this.element);
};

RNKLobbyChatMonitor.prototype.bindControls = function bindControls(target) {
  addEventListenerCompat(target, '[data-action="export"]', "click", () => RNKLobby.exportChatHistory());

  addEventListenerCompat(target, '[data-action="clear"]', "click", async () => {
    await RNKLobby.clearChatMessages();
    this.render(false);
  });

  addEventListenerCompat(target, '[data-action="close"]', "click", () => this.close());
};

function odFe_nce198_2() {}

class RNKLobbyHelpDialog extends RenderableApplicationBase {
  static get defaultOptions() {
    return mergeDefaults(this, {
      id: "rnk-lobby-help",
      classes: ["rnk-lobby"],
      title: "Lobby Help Guide",
      template: RNKLobby.templatePath("help-dialog.hbs"),
      width: 420,
      height: "auto"
    });
  }

  static DEFAULT_OPTIONS = USE_APPLICATION_V2
    ? mergeDefaults(RNKLobbyHelpDialog, {
        id: "rnk-lobby-help",
        classes: ["rnk-lobby"],
        window: { title: "Lobby Help Guide", resizable: true },
        position: { width: 420 }
      })
    : mergeDefaults(RNKLobbyHelpDialog, {
        id: "rnk-lobby-help",
        classes: ["rnk-lobby"],
        title: "Lobby Help Guide",
        template: RNKLobby.templatePath("help-dialog.hbs"),
        width: 420,
        height: "auto"
      });

  static PARTS = USE_APPLICATION_V2
    ? {
        body: { template: RNKLobby.templatePath("help-dialog.hbs") }
      }
    : undefined;

  async _prepareContext(options) {
    const base = typeof super._prepareContext === "function" ? await super._prepareContext(options) : {};
    const data = await this.getData(options);
    return mergeContexts(base, data);
  }
}

class RNKLobbyPresetsManager extends RenderableApplicationBase {
  static get defaultOptions() {
    return mergeDefaults(this, {
      id: "rnk-lobby-presets",
      classes: ["rnk-lobby"],
      title: "Lobby Presets",
      template: RNKLobby.templatePath("presets-manager.hbs"),
      width: 540,
      height: "auto",
      resizable: true
    });
  }

  static DEFAULT_OPTIONS = USE_APPLICATION_V2
    ? mergeDefaults(RNKLobbyPresetsManager, {
        id: "rnk-lobby-presets",
        classes: ["rnk-lobby"],
        window: { title: "Lobby Presets", resizable: true },
        position: { width: 540 }
      })
    : mergeDefaults(RNKLobbyPresetsManager, {
        id: "rnk-lobby-presets",
        classes: ["rnk-lobby"],
        title: "Lobby Presets",
        template: RNKLobby.templatePath("presets-manager.hbs"),
        width: 540,
        height: "auto",
        resizable: true
      });

  static PARTS = USE_APPLICATION_V2
    ? {
        body: { template: RNKLobby.templatePath("presets-manager.hbs") }
      }
    : undefined;

  async _prepareContext(options) {
    const base = typeof super._prepareContext === "function" ? await super._prepareContext(options) : {};
    const data = await this.getData(options);
    return mergeContexts(base, data);
  }

  getData() {
    const presets = RNKLobby.getPresets().map((preset) => ({
      ...preset,
      savedAtLabel: preset.savedAt ? new Date(preset.savedAt).toLocaleString() : "Unknown",
      hasCountdown: Boolean(preset.countdownTemplate)
    }));
    return {
      presets,
      hasPresets: presets.length > 0,
      includeCountdownDefault: true
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (USE_APPLICATION_V2) return;
    this.bindControls(html);
  }
}

RNKLobbyPresetsManager.prototype._onRender = function _onRender(context, options) {
  RenderableApplicationBase.prototype._onRender?.call(this, context, options);
  if (!USE_APPLICATION_V2) return;
  this.bindControls(this.element);
};

RNKLobbyPresetsManager.prototype.bindControls = function bindControls(target) {
  addEventListenerCompat(target, 'form[data-form="new-preset"]', "submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("presetName");
    const includeCountdown = formData.get("includeCountdown") === "on";
    await RNKLobby.savePreset(name, { includeCountdown });
    form.reset();
    this.render(false);
  });

  addEventListenerCompat(target, '[data-action="apply-preset"]', "click", async (event) => {
    const id = event.currentTarget.dataset.id;
    await RNKLobby.applyPreset(id);
  });

  addEventListenerCompat(target, '[data-action="delete-preset"]', "click", async (event) => {
    const id = event.currentTarget.dataset.id;
    const preset = RNKLobby.getPresets().find((entry) => entry.id === id);
    if (!preset) return;
    const safeName = RNKLobby.escapeHTML(preset.name);
    const confirmed = await Dialog.confirm({
      title: "Delete Preset",
      content: `<p>Are you sure you want to delete <strong>${safeName}</strong>?</p>`
    });
    if (!confirmed) return;
    await RNKLobby.deletePreset(id);
    this.render(false);
  });
};

class RNKLobbyPollManager extends RenderableApplicationBase {
  static get defaultOptions() {
    return mergeDefaults(this, {
      id: "rnk-lobby-poll-manager",
      classes: ["rnk-lobby"],
      title: "Lobby Polls & Ready Checks",
      template: RNKLobby.templatePath("poll-manager.hbs"),
      width: 520,
      height: "auto",
      resizable: true
    });
  }

  static DEFAULT_OPTIONS = USE_APPLICATION_V2
    ? mergeDefaults(RNKLobbyPollManager, {
        id: "rnk-lobby-poll-manager",
        classes: ["rnk-lobby"],
        window: { title: "Lobby Polls & Ready Checks", resizable: true },
        position: { width: 520 }
      })
    : mergeDefaults(RNKLobbyPollManager, {
        id: "rnk-lobby-poll-manager",
        classes: ["rnk-lobby"],
        title: "Lobby Polls & Ready Checks",
        template: RNKLobby.templatePath("poll-manager.hbs"),
        width: 520,
        height: "auto",
        resizable: true
      });

  static PARTS = USE_APPLICATION_V2
    ? {
        body: { template: RNKLobby.templatePath("poll-manager.hbs") }
      }
    : undefined;

  async _prepareContext(options) {
    const base = typeof super._prepareContext === "function" ? await super._prepareContext(options) : {};
    const data = await this.getData(options);
    return mergeContexts(base, data);
  }

  getData() {
    const poll = RNKLobby.pollState;
    const tallies = RNKLobby.computePollTallies(poll);
    const totalVotes = Object.values(tallies).reduce((sum, count) => sum + count, 0);
    const options = (poll.options || []).map((opt) => ({
      id: opt.id,
      text: opt.text,
      votes: tallies[opt.id] ?? 0,
      percentage: totalVotes ? Math.round(((tallies[opt.id] ?? 0) / totalVotes) * 100) : 0
    }));

    const history = (RNKLobby.analytics.pollHistory || [])
      .slice()
      .reverse()
      .slice(0, 8)
      .map((entry) => ({
        ...entry,
        closedAtLabel: entry.closedAt ? new Date(entry.closedAt).toLocaleString() : "Unknown",
        options: entry.options?.map((opt) => ({
          text: opt.text,
          votes: opt.votes,
          percentage: entry.totalVotes ? Math.round((opt.votes / entry.totalVotes) * 100) : 0
        })) ?? [],
        totalVotes: entry.totalVotes ?? 0
      }));

    return {
      poll,
      options,
      totalVotes,
      hasActivePoll: poll.active,
      history
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (USE_APPLICATION_V2) return;
    this.bindControls(html);
  }
}

RNKLobbyPollManager.prototype._onRender = function _onRender(context, options) {
  RenderableApplicationBase.prototype._onRender?.call(this, context, options);
  if (!USE_APPLICATION_V2) return;
  this.bindControls(this.element);
};

RNKLobbyPollManager.prototype.bindControls = function bindControls(target) {
  addEventListenerCompat(target, 'form[data-form="create-poll"]', "submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const question = formData.get("question");
    const optionsInput = (formData.get("options") || "").toString();
    const options = optionsInput
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const created = await RNKLobby.createPoll({ question, options });
    if (created) {
      form.reset();
      this.render(false);
    }
  });

  addEventListenerCompat(target, '[data-action="close-poll"]', "click", async () => {
    await RNKLobby.closePoll();
    this.render(false);
  });

  addEventListenerCompat(target, '[data-action="refresh-poll"]', "click", () => this.render(false));
};

class RNKLobbyAnalyticsPanel extends RenderableApplicationBase {
  static get defaultOptions() {
    return mergeDefaults(this, {
      id: "rnk-lobby-analytics",
      classes: ["rnk-lobby"],
      title: "Lobby Analytics",
      template: RNKLobby.templatePath("analytics-panel.hbs"),
      width: 600,
      height: 620,
      resizable: true
    });
  }

  static DEFAULT_OPTIONS = USE_APPLICATION_V2
    ? mergeDefaults(RNKLobbyAnalyticsPanel, {
        id: "rnk-lobby-analytics",
        classes: ["rnk-lobby"],
        window: { title: "Lobby Analytics", resizable: true },
        position: { width: 600, height: 620 }
      })
    : mergeDefaults(RNKLobbyAnalyticsPanel, {
        id: "rnk-lobby-analytics",
        classes: ["rnk-lobby"],
        title: "Lobby Analytics",
        template: RNKLobby.templatePath("analytics-panel.hbs"),
        width: 600,
        height: 620,
        resizable: true
      });

  static PARTS = USE_APPLICATION_V2
    ? {
        body: { template: RNKLobby.templatePath("analytics-panel.hbs") }
      }
    : undefined;

  async _prepareContext(options) {
    const base = typeof super._prepareContext === "function" ? await super._prepareContext(options) : {};
    const data = await this.getData(options);
    return mergeContexts(base, data);
  }

  getData() {
    const analytics = RNKLobby.analytics;
    const totalMs = Number(analytics.totalActiveMs || 0);
    const totalMinutes = Math.round(totalMs / 60000);
    const activeNowMs = RNKLobby.currentState.isActive && analytics.lastActivatedAt
      ? Date.now() - analytics.lastActivatedAt
      : 0;

    const sessions = (analytics.sessions || [])
      .slice()
      .reverse()
      .slice(0, 10)
      .map((session) => ({
        startedAtLabel: session.startedAt ? new Date(session.startedAt).toLocaleString() : "Unknown",
        endedAtLabel: session.endedAt ? new Date(session.endedAt).toLocaleString() : "In progress",
        durationMinutes: Math.round(Number(session.duration || 0) / 60000)
      }));

    const chatLeaders = Object.values(analytics.chatStats || {})
      .map((entry) => ({
        name: entry.name,
        count: entry.count,
        lastMessageAt: entry.lastMessageAt ? new Date(entry.lastMessageAt).toLocaleString() : null
      }))
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 7);

    const pollHistory = (analytics.pollHistory || [])
      .slice()
      .reverse()
      .slice(0, 6)
      .map((entry) => ({
        question: entry.question,
        closedAtLabel: entry.closedAt ? new Date(entry.closedAt).toLocaleString() : "Unknown",
        totalVotes: entry.totalVotes ?? 0,
        topOption: entry.options?.slice().sort((a, b) => (b.votes || 0) - (a.votes || 0))[0] || null
      }));

    return {
      totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(1),
      activeNowMinutes: Math.round(activeNowMs / 60000),
      countdownUses: analytics.countdownUses || 0,
      sessions,
      chatLeaders,
      pollHistory,
      hasData: totalMinutes > 0 || sessions.length > 0 || chatLeaders.length > 0
    };
  }
}

function odShi9el82() {}

RNKLobby.exportChatHistory = async function exportChatHistory() {
  const text = RNKLobby.chatMessages
    .map((entry) => `[${new Date(entry.timestamp).toLocaleString()}] ${entry.author}: ${entry.text}`)
    .join("\n");

  try {
    await navigator.clipboard.writeText(text);
    ui.notifications?.info("Lobby chat copied to clipboard");
  } catch (error) {
    console.warn("RNK Lobby | Clipboard export failed", error);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "lobby-chat.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }
};

// Initialize module
Hooks.once("init", () => RNKLobby.init());
Hooks.once("ready", () => RNKLobby.ready());

// Export for external access if needed
window.RNKLobby = RNKLobby;



