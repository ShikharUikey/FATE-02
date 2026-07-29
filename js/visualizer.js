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

      // 1. 4D Hypersphere Point Cloud (4D coordinates x,y,z,w projected to 3D)
      this.points4D = [];
      const count4D = 900;
      const radius4D = 58;

      for (let i = 0; i < count4D; i++) {
        // Generate uniform random points on 4D sphere (Hypersphere S3)
        const u1 = Math.random(), u2 = Math.random(), u3 = Math.random();
        const r1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const r2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
        const r3 = Math.sqrt(-2 * Math.log(u3)) * Math.cos(2 * Math.PI * Math.random());
        const r4 = Math.sqrt(-2 * Math.log(u3)) * Math.sin(2 * Math.PI * Math.random());
        const norm = Math.sqrt(r1 * r1 + r2 * r2 + r3 * r3 + r4 * r4);

        this.points4D.push({
          x: (r1 / norm) * radius4D,
          y: (r2 / norm) * radius4D,
          z: (r3 / norm) * radius4D,
          w: (r4 / norm) * radius4D
        });
      }

      const geom4D = new THREE.BufferGeometry();
      const posArray = new Float32Array(count4D * 3);
      geom4D.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

      const mat4D = new THREE.PointsMaterial({
        color: new THREE.Color(this.primaryColor),
        size: 2.5,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
      });

      this.spherePoints = new THREE.Points(geom4D, mat4D);
      this.threeScene.add(this.spherePoints);

      // 2. 4D Tesseract Hypercube Wireframe (16 4D Vertices + 32 Edges)
      this.tesseractVertices4D = [];
      for (let i = 0; i < 16; i++) {
        this.tesseractVertices4D.push({
          x: (i & 1 ? 1 : -1) * 32,
          y: (i & 2 ? 1 : -1) * 32,
          z: (i & 4 ? 1 : -1) * 32,
          w: (i & 8 ? 1 : -1) * 32
        });
      }

      // Generate 32 edges connecting vertices differing by 1 bit in 4D space
      this.tesseractEdges = [];
      for (let i = 0; i < 16; i++) {
        for (let j = i + 1; j < 16; j++) {
          const diff = i ^ j;
          if ((diff & (diff - 1)) === 0) {
            this.tesseractEdges.push([i, j]);
          }
        }
      }

      const tesseractGeom = new THREE.BufferGeometry();
      const tessPosArray = new Float32Array(32 * 2 * 3);
      tesseractGeom.setAttribute('position', new THREE.BufferAttribute(tessPosArray, 3));

      const tesseractMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(this.secondaryColor),
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending
      });

      this.tesseractMesh = new THREE.LineSegments(tesseractGeom, tesseractMat);
      this.threeScene.add(this.tesseractMesh);

      // 3. Inner Glowing Ring Torus
      const ringGeom = new THREE.TorusGeometry(40, 0.8, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(this.primaryColor),
        wireframe: true,
        transparent: true,
        opacity: 0.6
      });
      this.torusRing = new THREE.Mesh(ringGeom, ringMat);
      this.threeScene.add(this.torusRing);

      // 4D Rotation angles
      this.angleXW = 0;
      this.angleZW = 0;

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

      // 4D Hyper-Rotation Equations (Rotating in XW and ZW planes)
      const rotationSpeed = isSpeaking ? 0.04 : isListening ? 0.03 : 0.012;
      this.angleXW = (this.angleXW || 0) + rotationSpeed;
      this.angleZW = (this.angleZW || 0) + rotationSpeed * 0.7;

      const cosXW = Math.cos(this.angleXW), sinXW = Math.sin(this.angleXW);
      const cosZW = Math.cos(this.angleZW), sinZW = Math.sin(this.angleZW);

      // 1. Transform 4D Hypersphere Point Cloud to 3D Space
      if (this.spherePoints && this.points4D) {
        const positions = this.spherePoints.geometry.attributes.position.array;

        for (let i = 0; i < this.points4D.length; i++) {
          const pt = this.points4D[i];

          // 4D Rotation XW
          let x1 = pt.x * cosXW - pt.w * sinXW;
          let w1 = pt.x * sinXW + pt.w * cosXW;

          // 4D Rotation ZW
          let z2 = pt.z * cosZW - w1 * sinZW;
          let w2 = pt.z * sinZW + w1 * cosZW;

          // 4D -> 3D Perspective Projection
          const distance = 2.2 - (w2 / 120);
          const px = (x1 / distance) * baseScale + vibrateX;
          const py = (pt.y / distance) * baseScale + vibrateY;
          const pz = (z2 / distance) * baseScale;

          positions[i * 3] = px;
          positions[i * 3 + 1] = py;
          positions[i * 3 + 2] = pz;
        }
        this.spherePoints.geometry.attributes.position.needsUpdate = true;
      }

      // 2. Transform 4D Tesseract Hypercube Wireframe Edges to 3D Space
      if (this.tesseractMesh && this.tesseractVertices4D && this.tesseractEdges) {
        const linePositions = this.tesseractMesh.geometry.attributes.position.array;
        const projectedVerts = [];

        for (let i = 0; i < this.tesseractVertices4D.length; i++) {
          const v = this.tesseractVertices4D[i];

          // 4D Rotation XW
          let x1 = v.x * cosXW - v.w * sinXW;
          let w1 = v.x * sinXW + v.w * cosXW;

          // 4D Rotation ZW
          let z2 = v.z * cosZW - w1 * sinZW;
          let w2 = v.z * sinZW + w1 * cosZW;

          // 4D -> 3D Perspective Projection
          const distance = 2.0 - (w2 / 100);
          projectedVerts.push({
            x: (x1 / distance) * baseScale + vibrateX,
            y: (v.y / distance) * baseScale + vibrateY,
            z: (z2 / distance) * baseScale
          });
        }

        let ptr = 0;
        for (let i = 0; i < this.tesseractEdges.length; i++) {
          const edge = this.tesseractEdges[i];
          const vA = projectedVerts[edge[0]];
          const vB = projectedVerts[edge[1]];

          linePositions[ptr++] = vA.x;
          linePositions[ptr++] = vA.y;
          linePositions[ptr++] = vA.z;

          linePositions[ptr++] = vB.x;
          linePositions[ptr++] = vB.y;
          linePositions[ptr++] = vB.z;
        }
        this.tesseractMesh.geometry.attributes.position.needsUpdate = true;
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
        arcCoreElem.style.transform = `translate(calc(-50% + ${coreVibeX}px), calc(-50% + ${coreVibeY}px)) scale(${coreScale})`;
        arcCoreElem.style.boxShadow = `0 0 ${35 + soundFreq * 50}px var(--primary-color)`;
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
        tronOuterRing.style.transform = `translate(-50%, -50%) scale(${scale})`;
      }

      if (tronCyanRing) {
        const scale = 1.0 + soundFreq * 0.22;
        tronCyanRing.style.transform = `translate(-50%, -50%) scale(${scale})`;
      }

      if (tronTicksRing) {
        const scale = 1.0 + soundFreq * 0.28;
        tronTicksRing.style.transform = `translate(-50%, -50%) scale(${scale})`;
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
