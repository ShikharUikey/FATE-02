/* ==========================================================================
   FATE 3D Three.js WebGL Holographic Sphere & High-Performance Visualizer
   ========================================================================== */

class FateVisualizer {
  constructor() {
    this.bgCanvas = document.getElementById('bg-canvas');
    this.bgCtx = this.bgCanvas ? this.bgCanvas.getContext('2d') : null;

    this.reactorCanvas = document.getElementById('visualizer-canvas');
    this.reactorCtx = this.reactorCanvas ? this.reactorCanvas.getContext('2d') : null;

    this.particles = [];
    this.numParticles = 40; // Optimized particle count for 60FPS fluid execution

    this.state = 'idle'; // 'idle', 'listening', 'speaking'
    this.primaryColor = '#00f0ff';
    this.secondaryColor = '#7000ff';
    this.accentColor = '#ff0077';

    this.rotationAngle = 0;
    this.wavePhase = 0;

    // Three.js 3D Holographic Sphere Variables
    this.threeScene = null;
    this.threeCamera = null;
    this.threeRenderer = null;
    this.spherePoints = null;

    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas(), { passive: true });

    this.createParticles();
    this.initThreeJSSphere();
    this.animate();
  }

  initThreeJSSphere() {
    if (typeof THREE === 'undefined' || !this.reactorCanvas) return;

    try {
      const parent = this.reactorCanvas.parentElement;
      const width = parent ? parent.clientWidth : 240;
      const height = parent ? parent.clientHeight : 240;

      this.threeScene = new THREE.Scene();
      this.threeCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      this.threeCamera.position.z = 180;

      this.threeRenderer = new THREE.WebGLRenderer({
        canvas: this.reactorCanvas,
        alpha: true,
        antialias: true
      });
      this.threeRenderer.setSize(width, height);
      this.threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      // 3D Particle Sphere Geometry
      const geometry = new THREE.BufferGeometry();
      const count = 750;
      const positions = new Float32Array(count * 3);
      const radius = 55;

      for (let i = 0; i < count; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = radius + (Math.random() - 0.5) * 6;

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.PointsMaterial({
        color: new THREE.Color(this.primaryColor),
        size: 2.2,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
      });

      this.spherePoints = new THREE.Points(geometry, material);
      this.threeScene.add(this.spherePoints);

      // Inner Glowing Ring Torus
      const ringGeom = new THREE.TorusGeometry(38, 0.8, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(this.secondaryColor),
        wireframe: true,
        transparent: true,
        opacity: 0.6
      });
      this.torusRing = new THREE.Mesh(ringGeom, ringMat);
      this.threeScene.add(this.torusRing);

    } catch (e) {
      console.warn('Three.js fallback to 2D Canvas:', e);
      this.threeRenderer = null;
    }
  }

  updateColors(primary, secondary, accent) {
    if (primary) this.primaryColor = primary;
    if (secondary) this.secondaryColor = secondary;
    if (accent) this.accentColor = accent;

    if (this.spherePoints && typeof THREE !== 'undefined') {
      this.spherePoints.material.color = new THREE.Color(this.primaryColor);
    }
    if (this.torusRing && typeof THREE !== 'undefined') {
      this.torusRing.material.color = new THREE.Color(this.secondaryColor);
    }
  }

  setState(state) {
    this.state = state;
  }

  resizeCanvas() {
    if (this.bgCanvas) {
      this.bgCanvas.width = window.innerWidth;
      this.bgCanvas.height = window.innerHeight;
    }
    if (this.reactorCanvas && this.threeRenderer) {
      const parent = this.reactorCanvas.parentElement;
      const width = parent ? parent.clientWidth : 240;
      const height = parent ? parent.clientHeight : 240;
      this.threeCamera.aspect = width / height;
      this.threeCamera.updateProjectionMatrix();
      this.threeRenderer.setSize(width, height);
    }
  }

  createParticles() {
    this.particles = [];
    const w = this.bgCanvas ? this.bgCanvas.width : window.innerWidth;
    const h = this.bgCanvas ? this.bgCanvas.height : window.innerHeight;

    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2
      });
    }
  }

  // Fast O(N^2) squared-distance particle rendering without Math.sqrt overhead
  drawBackgroundParticles() {
    if (!this.bgCtx) return;
    const w = this.bgCanvas.width;
    const h = this.bgCanvas.height;

    this.bgCtx.clearRect(0, 0, w, h);

    const maxDistSq = 8100; // 90px squared
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      this.bgCtx.beginPath();
      this.bgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.bgCtx.fillStyle = this.primaryColor;
      this.bgCtx.globalAlpha = p.alpha;
      this.bgCtx.fill();

      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < maxDistSq) {
          this.bgCtx.beginPath();
          this.bgCtx.moveTo(p.x, p.y);
          this.bgCtx.lineTo(p2.x, p2.y);
          this.bgCtx.strokeStyle = this.primaryColor;
          this.bgCtx.globalAlpha = (1 - distSq / maxDistSq) * 0.18;
          this.bgCtx.lineWidth = 0.8;
          this.bgCtx.stroke();
        }
      }
    }
    this.bgCtx.globalAlpha = 1.0;
  }

  drawArcReactorVisualizer() {
    if (this.threeRenderer && this.threeScene && this.threeCamera) {
      const isSpeaking = this.state === 'speaking';
      const isListening = this.state === 'listening';

      // Real-time Soundgram Audio Frequency Wave Simulation
      const soundFreq = isSpeaking 
        ? Math.abs(Math.sin(Date.now() * 0.015) * Math.cos(Date.now() * 0.022)) * 1.8 
        : isListening ? Math.abs(Math.sin(Date.now() * 0.008)) * 0.8 : 0.2;

      // 3D Logo Vibration & Soundgram Scaling
      const baseScale = 1.0 + soundFreq * 0.35;
      const vibrateX = isSpeaking ? (Math.random() - 0.5) * 6 : 0;
      const vibrateY = isSpeaking ? (Math.random() - 0.5) * 6 : 0;

      if (this.spherePoints) {
        const speed = isSpeaking ? 0.06 : isListening ? 0.06 : 0.015;
        this.spherePoints.rotation.y += speed;
        this.spherePoints.rotation.x += speed * 0.5;

        // Apply 3D Logo Vibration & Soundgram Pulse
        this.spherePoints.scale.set(baseScale, baseScale, baseScale);
        this.spherePoints.position.set(vibrateX, vibrateY, 0);
      }

      if (this.torusRing) {
        const speed = isSpeaking ? 0.06 : 0.015;
        this.torusRing.rotation.z -= speed * 1.5;
        this.torusRing.rotation.y += speed * 0.8;
        this.torusRing.scale.set(baseScale * 1.08, baseScale * 1.08, baseScale * 1.08);
      }

      // Also vibrate and scale the central UI Arc Core element & STARK Concentric Rings
      const arcCoreElem = document.getElementById('arc-reactor-core');
      const outerRingElem = document.querySelector('.stark-ring-outer');
      const midRingElem = document.querySelector('.stark-ring-mid');

      if (arcCoreElem) {
        if (isSpeaking) {
          arcCoreElem.classList.add('vibrating');
        } else {
          arcCoreElem.classList.remove('vibrating');
        }
        const coreScale = 1.0 + soundFreq * 0.35;
        const coreVibeX = isSpeaking ? (Math.random() - 0.5) * 8 : 0;
        const coreVibeY = isSpeaking ? (Math.random() - 0.5) * 8 : 0;
        arcCoreElem.style.transform = `translate(${coreVibeX}px, ${coreVibeY}px) scale(${coreScale})`;
        arcCoreElem.style.boxShadow = `0 0 ${35 + soundFreq * 50}px var(--primary-color)`;
      }

      if (outerRingElem) {
        const ringScale = 1.0 + soundFreq * 0.15;
        outerRingElem.style.transform = `scale(${ringScale})`;
      }

      if (midRingElem) {
        const ringScale = 1.0 + soundFreq * 0.2;
        midRingElem.style.transform = `scale(${ringScale})`;
      }

      // TRON Identity Disc Container & Concentric Rings High-Frequency Vibration
      const tronDiscContainer = document.getElementById('tron-disc-container');
      const tronOuterRing = document.querySelector('.tron-ring-outer');
      const tronCyanRing = document.querySelector('.tron-ring-cyan');
      const tronTicksRing = document.querySelector('.tron-ring-ticks');

      if (tronDiscContainer && isSpeaking) {
        const discVibeX = (Math.random() - 0.5) * 8;
        const discVibeY = (Math.random() - 0.5) * 8;
        tronDiscContainer.style.transform = `translate(${discVibeX}px, ${discVibeY}px)`;
      } else if (tronDiscContainer) {
        tronDiscContainer.style.transform = `translate(0px, 0px)`;
      }

      if (tronOuterRing) {
        const scale = 1.0 + soundFreq * 0.18;
        tronOuterRing.style.transform = `scale(${scale})`;
      }

      if (tronCyanRing) {
        const scale = 1.0 + soundFreq * 0.22;
        tronCyanRing.style.transform = `scale(${scale})`;
      }

      if (tronTicksRing) {
        const scale = 1.0 + soundFreq * 0.28;
        tronTicksRing.style.transform = `scale(${scale})`;
      }

      this.threeRenderer.render(this.threeScene, this.threeCamera);
      return;
    }

    if (!this.reactorCtx) return;
    const ctx = this.reactorCtx;
    const w = this.reactorCanvas.width;
    const h = this.reactorCanvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    this.rotationAngle += (this.state === 'speaking' ? 0.05 : this.state === 'listening' ? 0.08 : 0.02);

    let activeColor = this.primaryColor;
    if (this.state === 'listening') activeColor = this.accentColor;
    if (this.state === 'speaking') activeColor = this.secondaryColor;

    ctx.save();
    ctx.translate(cx, cy);

    ctx.rotate(this.rotationAngle);
    ctx.beginPath();
    ctx.arc(0, 0, cx - 12, 0, Math.PI * 2);
    ctx.strokeStyle = activeColor;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([12, 8, 4, 8]);
    ctx.stroke();

    ctx.restore();
  }

  animate() {
    this.drawBackgroundParticles();
    this.drawArcReactorVisualizer();
    requestAnimationFrame(() => this.animate());
  }
}
