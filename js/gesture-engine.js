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
          <div class="lock-instruction">SHOW 😛 TONGUE OUT FACIAL EXPRESSION TO UNLOCK FATE SYSTEM</div>
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
    const w = this.canvasElem.width;
    const h = this.canvasElem.height;

    // Hand Landmark Connections (MediaPipe Skeleton)
    const connections = [
      [0,1],[1,2],[2,3],[3,4], // Thumb
      [0,5],[5,6],[6,7],[7,8], // Index
      [5,9],[9,10],[10,11],[11,12], // Middle
      [9,13],[13,14],[14,15],[15,16], // Ring
      [13,17],[17,18],[18,19],[19,20],[0,17] // Pinky & Palm
    ];

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
    ctx.lineWidth = 2;
    for (const [i, j] of connections) {
      if (landmarks[i] && landmarks[j]) {
        ctx.beginPath();
        ctx.moveTo(landmarks[i].x * w, landmarks[i].y * h);
        ctx.lineTo(landmarks[j].x * w, landmarks[j].y * h);
        ctx.stroke();
      }
    }

    // Draw Glowing Landmark Nodes
    ctx.fillStyle = '#00ff88';
    for (let i = 0; i < landmarks.length; i++) {
      const x = landmarks[i].x * w;
      const y = landmarks[i].y * h;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw Cyber Target Reticle on Index Tip (Landmark 8)
    if (landmarks[8]) {
      const ix = landmarks[8].x * w;
      const iy = landmarks[8].y * h;
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ix, iy, 8, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }

  classifyGesture(lm) {
    // lm[4] Thumb Tip, lm[8] Index Tip, lm[12] Middle Tip, lm[16] Ring Tip, lm[20] Pinky Tip
    const dist = (p1, p2) => {
      const dx = p1.x - p2.x, dy = p1.y - p2.y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const dThumbIndex = dist(lm[4], lm[8]);
    const dThumbMiddle = dist(lm[4], lm[12]);
    const dThumbRing = dist(lm[4], lm[16]);

    // 🤌 Italian Hand Emoji / Pinched Fingers Text Selection Gesture (Index, Middle & Ring meeting Thumb tip!)
    if (dThumbIndex < 0.08 && dThumbMiddle < 0.09 && dThumbRing < 0.10) {
      return 'PINCHED_TEXT_SELECT';
    }

    const indexExtended = lm[8].y < lm[6].y;
    const middleExtended = lm[12].y < lm[10].y;
    const ringExtended = lm[16].y < lm[14].y;
    const pinkyExtended = lm[20].y < lm[18].y;

    if (dThumbIndex < 0.055) {
      return 'PINCH_CLICK';
    }

    const isThumbDown = lm[4].y > lm[2].y && lm[4].y > lm[3].y;
    const otherFingersCurled = !indexExtended && !middleExtended && !ringExtended && !pinkyExtended;

    // 👎 Thumbs Down Gesture (Thumb pointing down + other 4 fingers curled)
    if (isThumbDown && otherFingersCurled) {
      return 'THUMBS_DOWN_LOCK';
    }

    if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return 'FIST_LOCK';
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
    const now = Date.now();

    // Handle Text Selection Release when gesture changes away from PINCHED_TEXT_SELECT
    if (this.isSelectingText && gesture !== 'PINCHED_TEXT_SELECT') {
      this.isSelectingText = false;
      this.sendMouseCommand(this.lastX, this.lastY, 4); // Left Mouse Up (Release Selection)
      this.updateReadout('TEXT SELECTION RELEASED');
    }

    // Dynamic Target Calculation with Deadzone & Speed Acceleration
    const calcSmoothPos = (point) => {
      const normX = 1.0 - point.x;
      const normY = point.y;
      const targetX = Math.round(normX * this.screenW);
      const targetY = Math.round(normY * this.screenH);

      const dx = targetX - this.lastX;
      const dy = targetY - this.lastY;
      const distMove = Math.sqrt(dx * dx + dy * dy);

      // Deadzone: ignore micro-vibrations < 2.2px
      if (distMove < 2.2) {
        return { x: this.lastX, y: this.lastY };
      }

      // Speed Gain Factor
      const speedFactor = Math.min(1.4, 0.45 + (distMove / 500) * 0.55);
      const smoothX = Math.round(this.lastX + dx * speedFactor);
      const smoothY = Math.round(this.lastY + dy * speedFactor);
      this.lastX = smoothX;
      this.lastY = smoothY;
      return { x: smoothX, y: smoothY };
    };

    // 1. 🤌 PINCHED TEXT SELECTION GESTURE
    if (gesture === 'PINCHED_TEXT_SELECT') {
      this.updateReadout('🤌 TEXT SELECTION / DRAGGING ACTIVE');
      const pos = calcSmoothPos(lm[8]);

      this.isSelectingText = true;
      this.sendMouseCommand(pos.x, pos.y, 3); // Left Mouse Down + Dragged
      return;
    }

    // 2. Normal Cursor Move & Click
    if (gesture === 'POINT_MOVE' || gesture === 'PINCH_CLICK' || gesture === 'PALM') {
      this.updateReadout(`GESTURE: ${gesture}`);
      const pos = calcSmoothPos(lm[8]);

      let clickAction = 0;
      if (gesture === 'PINCH_CLICK' && (now - this.lastClickTime > 380)) {
        clickAction = 1;
        this.lastClickTime = now;
      }

      this.sendMouseCommand(pos.x, pos.y, clickAction);
    }

    // 3. Lock System on 👎 Thumbs Down or ✊ Fist
    if ((gesture === 'THUMBS_DOWN_LOCK' || gesture === 'FIST_LOCK') && !this.isLocked && (now - this.gestureDebounce > 1500)) {
      this.gestureDebounce = now;
      this.updateReadout('👎 THUMBS DOWN DETECTED // LOCKING SYSTEM');
      this.lockSystem();
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
