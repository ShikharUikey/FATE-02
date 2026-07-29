/**
 * FATE System - Hand Gesture Mouse Control & Security Lock Subsystem
 * Powered by MediaPipe Hands & Native macOS Cursor Dispatcher (mac_mouse)
 */

class GestureEngine {
  constructor() {
    this.isActive = false;
    this.isLocked = false;
    this.videoElem = null;
    this.canvasElem = null;
    this.canvasCtx = null;
    this.hands = null;
    this.camera = null;

    this.screenW = window.screen.width || 1920;
    this.screenH = window.screen.height || 1080;

    this.lastX = 0;
    this.lastY = 0;
    this.lastClickTime = 0;
    this.gestureDebounce = 0;

    this.initUI();
    this.bindEvents();
  }

  initUI() {
    // Inject Video & Canvas if not present
    let container = document.getElementById('gesture-camera-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'gesture-camera-container';
      container.className = 'gesture-cam-box';
      container.innerHTML = `
        <div class="cam-header">
          <span>🖐️ GESTURE & VISION ENGINE</span>
          <span class="cam-status" id="gesture-cam-status">OFFLINE</span>
        </div>
        <div class="cam-preview-wrapper">
          <video id="gesture-video" playsinline style="display:none;"></video>
          <canvas id="gesture-canvas" width="320" height="240"></canvas>
          <div class="cam-crosshair"></div>
        </div>
        <div class="gesture-readout" id="gesture-readout">GESTURE: NONE</div>
      `;
      const suiteView = document.getElementById('tab-suite') || document.body;
      suiteView.appendChild(container);
    }

    this.videoElem = document.getElementById('gesture-video');
    this.canvasElem = document.getElementById('gesture-canvas');
    if (this.canvasElem) {
      this.canvasCtx = this.canvasElem.getContext('2d');
    }

    // Lock Overlay
    let lockOverlay = document.getElementById('fate-lock-overlay');
    if (!lockOverlay) {
      lockOverlay = document.createElement('div');
      lockOverlay.id = 'fate-lock-overlay';
      lockOverlay.className = 'fate-lock-screen hidden';
      lockOverlay.innerHTML = `
        <div class="lock-card">
          <div class="lock-shield-icon">🔒</div>
          <h2>FATE SYSTEM LOCKED</h2>
          <div class="lock-subtext">SECURITY PROTOCOL MARK-85 ACTIVE</div>
          <div class="lock-instruction">SHOW OPEN PALM 🖐️ TO UNLOCK OR SAY "UNLOCK SYSTEM"</div>
          <button class="unlock-btn" id="manual-unlock-btn">UNLOCK FATE</button>
        </div>
      `;
      document.body.appendChild(lockOverlay);

      document.getElementById('manual-unlock-btn')?.addEventListener('click', () => {
        this.unlockSystem();
      });
    }
  }

  bindEvents() {
    // Toggle button in UI if available
    const toggleBtn = document.getElementById('btn-toggle-gesture');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleGestureEngine());
    }
  }

  async startMediaPipe() {
    if (typeof Hands === 'undefined') {
      console.warn('MediaPipe Hands SDK loading...');
      return;
    }

    try {
      this.hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      this.hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
      });

      this.hands.onResults((results) => this.onResults(results));

      if (typeof Camera !== 'undefined' && this.videoElem) {
        this.camera = new Camera(this.videoElem, {
          onFrame: async () => {
            if (this.isActive && this.videoElem) {
              await this.hands.send({ image: this.videoElem });
            }
          },
          width: 320,
          height: 240
        });
        await this.camera.start();
        this.isActive = true;
        this.updateStatus('ACTIVE', '#00ff88');
      }
    } catch (e) {
      console.error('Gesture Camera initialization failed:', e);
      this.updateStatus('CAM ERROR', '#ff0055');
    }
  }

  toggleGestureEngine() {
    if (this.isActive) {
      this.isActive = false;
      if (this.camera) this.camera.stop();
      this.updateStatus('OFFLINE', 'var(--text-muted)');
    } else {
      this.startMediaPipe();
    }
  }

  onResults(results) {
    if (!this.canvasCtx || !this.canvasElem) return;

    this.canvasCtx.save();
    this.canvasCtx.clearRect(0, 0, this.canvasElem.width, this.canvasElem.height);
    this.canvasCtx.drawImage(results.image, 0, 0, this.canvasElem.width, this.canvasElem.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];

      // Draw Landmarks
      this.drawHandSkeleton(landmarks);

      // Recognize Gestures
      const gesture = this.classifyGesture(landmarks);
      this.processGestureAction(gesture, landmarks);
    } else {
      this.updateReadout('GESTURE: SCANNING...');
    }

    this.canvasCtx.restore();
  }

  drawHandSkeleton(landmarks) {
    const ctx = this.canvasCtx;
    ctx.fillStyle = '#00f0ff';
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;

    for (let i = 0; i < landmarks.length; i++) {
      const x = landmarks[i].x * this.canvasElem.width;
      const y = landmarks[i].y * this.canvasElem.height;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  classifyGesture(lm) {
    // lm[4] Thumb Tip, lm[8] Index Tip, lm[12] Middle Tip, lm[16] Ring Tip, lm[20] Pinky Tip
    // lm[0] Wrist

    const thumbExtended = lm[4].y < lm[3].y;
    const indexExtended = lm[8].y < lm[6].y;
    const middleExtended = lm[12].y < lm[10].y;
    const ringExtended = lm[16].y < lm[14].y;
    const pinkyExtended = lm[20].y < lm[18].y;

    const dx = lm[8].x - lm[4].x;
    const dy = lm[8].y - lm[4].y;
    const pinchDist = Math.sqrt(dx * dx + dy * dy);

    if (pinchDist < 0.06) {
      return 'PINCH_CLICK';
    }

    if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return 'FIST_LOCK';
    }

    if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
      return 'OPEN_PALM_UNLOCK';
    }

    if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
      return 'PEACE_TOGGLE';
    }

    if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return 'POINT_MOVE';
    }

    return 'PALM';
  }

  processGestureAction(gesture, lm) {
    this.updateReadout(`GESTURE: ${gesture}`);

    const now = Date.now();

    // 1. Move Mouse Cursor on Index Tip
    if (gesture === 'POINT_MOVE' || gesture === 'PINCH_CLICK' || gesture === 'PALM') {
      // Mirror X coordinates for webcam natural movement
      const normX = 1.0 - lm[8].x;
      const normY = lm[8].y;

      const targetX = Math.round(normX * this.screenW);
      const targetY = Math.round(normY * this.screenH);

      // Smooth interpolation
      const smoothX = Math.round(this.lastX + (targetX - this.lastX) * 0.35);
      const smoothY = Math.round(this.lastY + (targetY - this.lastY) * 0.35);

      this.lastX = smoothX;
      this.lastY = smoothY;

      let isClick = (gesture === 'PINCH_CLICK' && (now - this.lastClickTime > 400)) ? 1 : 0;
      if (isClick) this.lastClickTime = now;

      this.sendMouseCommand(smoothX, smoothY, isClick);
    }

    // 2. Lock System on Fist
    if (gesture === 'FIST_LOCK' && !this.isLocked && (now - this.gestureDebounce > 1500)) {
      this.gestureDebounce = now;
      this.lockSystem();
    }

    // 3. Unlock System on Open Palm
    if (gesture === 'OPEN_PALM_UNLOCK' && this.isLocked && (now - this.gestureDebounce > 1500)) {
      this.gestureDebounce = now;
      this.unlockSystem();
    }
  }

  sendMouseCommand(x, y, click) {
    fetch('/api/mac/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'move_mouse', x, y, click })
    }).catch(e => console.warn('Mouse command dispatch failed:', e));
  }

  lockSystem() {
    this.isLocked = true;
    const lockOverlay = document.getElementById('fate-lock-overlay');
    if (lockOverlay) lockOverlay.classList.remove('hidden');

    if (window.fateSpeech) {
      window.fateSpeech.speak("FATE System Locked, Boss! Gesture or voice authorization required.");
    }
  }

  unlockSystem() {
    this.isLocked = false;
    const lockOverlay = document.getElementById('fate-lock-overlay');
    if (lockOverlay) lockOverlay.classList.add('hidden');

    if (window.fateSpeech) {
      window.fateSpeech.speak("FATE System Unlocked! Welcome back, Boss.");
    }
  }

  updateStatus(text, color) {
    const elem = document.getElementById('gesture-cam-status');
    if (elem) {
      elem.textContent = text;
      elem.style.color = color;
    }
  }

  updateReadout(text) {
    const elem = document.getElementById('gesture-readout');
    if (elem) elem.textContent = text;
  }
}

// Global Export
window.GestureEngine = GestureEngine;
document.addEventListener('DOMContentLoaded', () => {
  window.fateGesture = new GestureEngine();
});
