/* ==========================================================================
   FATE Open-Interpreter Desktop Automation Engine (Optimized Failsafe Subsystem)
   ========================================================================== */

class FateOpenInterpreter {
  constructor() {
    this.activeTasks = [];
    this.timeoutMs = 5000;
  }

  async executeTask(actionName, payload = {}) {
    console.log(`🤖 Open-Interpreter Executing: ${actionName}`, payload);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch('/api/mac/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionName, ...payload }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      return data;
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn('Open-Interpreter Execution Error/Timeout:', e.message);
      return { error: e.message };
    }
  }

  async takeScreenshot() {
    return await this.executeTask('screenshot');
  }

  async setVolume(direction) {
    return await this.executeTask(direction === 'up' ? 'volume_up' : 'volume_down');
  }

  async launchApp(appName) {
    return await this.executeTask('open_app', { appName });
  }

  async openPath(targetPath) {
    return await this.executeTask('open_path', { targetPath });
  }

  async getBatteryStatus() {
    return await this.executeTask('battery');
  }

  async getStorageDiagnostics() {
    return await this.executeTask('storage');
  }
}

window.fateInterpreter = new FateOpenInterpreter();
