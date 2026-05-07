const tabMonitor = {
  switchCount: 0,
  sessionId: null,
  isMonitoring: false,
  debounceTimer: null,
  DEBOUNCE_MS: 2000, // ignore switches shorter than 2 seconds
  isMobile: false,

  init(sessionId) {
    this.sessionId = sessionId;
    this.isMonitoring = true;

    // Detect mobile vs desktop
    this.isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    console.log("Device type:", this.isMobile ? "Mobile" : "Desktop");

    // Check browser compatibility
    if (!this._checkCompatibility()) {
      console.warn("Browser does not support required APIs");
      return;
    }

    // Bind events
    this._handleVisibility = this._handleVisibilityChange.bind(this);
    this._handleBlur = this._handleBlur.bind(this);
    this._handleFocus = this._handleFocus.bind(this);

    // visibilitychange works on both mobile and desktop
    document.addEventListener("visibilitychange", this._handleVisibility);

    // blur/focus only reliable on desktop
    if (!this.isMobile) {
      window.addEventListener("blur", this._handleBlur);
      window.addEventListener("focus", this._handleFocus);
    }

    console.log("Tab monitor started for session:", sessionId);
    console.log("Mobile mode:", this.isMobile);
  },

  // Check if browser supports required APIs
  _checkCompatibility() {
    const checks = {
      visibilityAPI: typeof document.hidden !== "undefined",
      fetchAPI: typeof fetch !== "undefined",
      localStorageAPI: typeof localStorage !== "undefined",
    };

    console.log("Browser compatibility:", checks);

    // visibilitychange is the minimum requirement
    if (!checks.visibilityAPI) {
      console.error("visibilitychange API not supported in this browser");
      return false;
    }

    return true;
  },

  _handleVisibilityChange() {
    if (document.hidden) {
      this._startDebounce("visibility_hidden");
    } else {
      this._cancelDebounce();
      this._logReturn();
    }
  },

  _handleBlur() {
    this._startDebounce("window_blur");
  },

  _handleFocus() {
    this._cancelDebounce();
    this._logReturn();
  },

  // Debounce logic — only log if user stays away for DEBOUNCE_MS
  _startDebounce(trigger) {
    // Cancel any existing timer
    this._cancelDebounce();

    this.debounceTimer = setTimeout(() => {
      this._logSwitch(trigger);
    }, this.DEBOUNCE_MS);

    console.log("Debounce started for trigger:", trigger);
  },

  _cancelDebounce() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
      console.log("Debounce cancelled — accidental switch ignored");
    }
  },

  _logSwitch(trigger) {
    this.switchCount++;

    // Base output format as required by task
    const payload = {
      tab_switched: true,
      timestamp: new Date().toISOString(),
      // Additional fields for backend
      trigger: trigger,
      switch_count: this.switchCount,
      session_id: this.sessionId,
      device_type: this.isMobile ? "mobile" : "desktop",
    };

    console.log("Tab switch detected:", payload);
    this._sendToBackend(payload);
  },

  _logReturn() {
    const payload = {
      tab_switched: false,
      timestamp: new Date().toISOString(),
      event: "user_returned",
      session_id: this.sessionId,
      device_type: this.isMobile ? "mobile" : "desktop",
    };

    console.log("User returned:", payload);
    this._sendToBackend(payload);
  },

  async _sendToBackend(payload) {
    // If fetch not supported, just buffer
    if (typeof fetch === "undefined") {
      this._bufferEvent(payload);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/monitoring/tab-switch",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        console.log("Log sent to backend successfully");
      }
    } catch (error) {
      console.warn("Backend not available, buffering event");
      this._bufferEvent(payload);
    }
  },

  _bufferEvent(payload) {
    try {
      const buffer = JSON.parse(localStorage.getItem("tab_events") || "[]");
      buffer.push(payload);
      localStorage.setItem("tab_events", JSON.stringify(buffer));
      console.log("Event buffered locally. Total buffered:", buffer.length);
    } catch (e) {
      console.error("Buffering failed:", e);
    }
  },

  // Flush buffered events when backend becomes available
  async flushBuffer() {
    try {
      const buffer = JSON.parse(localStorage.getItem("tab_events") || "[]");
      if (buffer.length === 0) return;

      console.log("Flushing", buffer.length, "buffered events");

      for (const event of buffer) {
        await this._sendToBackend(event);
      }

      localStorage.removeItem("tab_events");
      console.log("Buffer flushed successfully");
    } catch (e) {
      console.error("Flush failed:", e);
    }
  },

  stop() {
    document.removeEventListener("visibilitychange", this._handleVisibility);
    window.removeEventListener("blur", this._handleBlur);
    window.removeEventListener("focus", this._handleFocus);
    this._cancelDebounce();
    this.isMonitoring = false;
    console.log("Tab monitor stopped. Total switches:", this.switchCount);
  },
};

export default tabMonitor;