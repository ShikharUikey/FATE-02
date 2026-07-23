/* ==========================================================================
   FATE Visualizer & Particle Canvas Engine
   ========================================================================== */

class FateVisualizer {
  constructor() {
    this.bgCanvas = document.getElementById('bg-canvas');
    this.bgCtx = this.bgCanvas ? this.bgCanvas.getContext('2d') : null;

    this.reactorCanvas = document.getElementById('visualizer-canvas');
    this.reactorCtx = this.reactorCanvas ? this.reactorCanvas.getContext('2d') : null;

    this.particles = [];
    this.numParticles = 55;

    this.state = 'idle'; // 'idle', 'listening', 'speaking'
    this.primaryColor = '#00f0ff';
    this.secondaryColor = '#7000ff';
    this.accentColor = '#ff0077';

    this.rotationAngle = 0;
    this.wavePhase = 0;

    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.createParticles();
    this.animate();
  }

  updateColors(primary, secondary, accent) {
    if (primary) this.primaryColor = primary;
    if (secondary) this.secondaryColor = secondary;
    if (accent) this.accentColor = accent;
  }

  setState(state) {
    this.state = state;
  }

  resizeCanvas() {
    if (this.bgCanvas) {
      this.bgCanvas.width = window.innerWidth;
      this.bgCanvas.height = window.innerHeight;
    }
    if (this.reactorCanvas) {
      const parent = this.reactorCanvas.parentElement;
      if (parent) {
        this.reactorCanvas.width = parent.clientWidth || 240;
        this.reactorCanvas.height = parent.clientHeight || 240;
      }
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
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2
      });
    }
  }

  drawBackgroundParticles() {
    if (!this.bgCtx) return;
    const w = this.bgCanvas.width;
    const h = this.bgCanvas.height;

    this.bgCtx.clearRect(0, 0, w, h);

    // Update and draw nodes
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

      // Connect nearby nodes with glowing lines
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          this.bgCtx.beginPath();
          this.bgCtx.moveTo(p.x, p.y);
          this.bgCtx.lineTo(p2.x, p2.y);
          this.bgCtx.strokeStyle = this.primaryColor;
          this.bgCtx.globalAlpha = (1 - dist / 120) * 0.18;
          this.bgCtx.lineWidth = 0.8;
          this.bgCtx.stroke();
        }
      }
    }
    this.bgCtx.globalAlpha = 1.0;
  }

  drawArcReactorVisualizer() {
    if (!this.reactorCtx) return;
    const ctx = this.reactorCtx;
    const w = this.reactorCanvas.width;
    const h = this.reactorCanvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    this.rotationAngle += (this.state === 'speaking' ? 0.05 : this.state === 'listening' ? 0.08 : 0.02);
    this.wavePhase += 0.06;

    // Active Color determination
    let activeColor = this.primaryColor;
    if (this.state === 'listening') activeColor = this.accentColor;
    if (this.state === 'speaking') activeColor = this.secondaryColor;

    // Outer Concentric HUD Rings
    ctx.save();
    ctx.translate(cx, cy);

    // Ring 1 (Rotating dash)
    ctx.rotate(this.rotationAngle);
    ctx.beginPath();
    ctx.arc(0, 0, cx - 12, 0, Math.PI * 2);
    ctx.strokeStyle = activeColor;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([12, 8, 4, 8]);
    ctx.stroke();

    // Ring 2 (Counter-rotating dash)
    ctx.rotate(-this.rotationAngle * 2);
    ctx.beginPath();
    ctx.arc(0, 0, cx - 24, 0, Math.PI * 2);
    ctx.strokeStyle = activeColor;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 15]);
    ctx.stroke();

    ctx.restore();

    // Animated Audio Waveform Ring
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();

    const points = 60;
    const baseRadius = cx - 38;
    const waveAmp = (this.state === 'speaking' ? 12 : this.state === 'listening' ? 16 : 4);

    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const freqOffset = Math.sin(angle * 6 + this.wavePhase) * Math.cos(angle * 3 + this.wavePhase);
      const r = baseRadius + freqOffset * waveAmp;

      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = activeColor;
    ctx.shadowBlur = 15;
    ctx.globalAlpha = 0.95;
    ctx.stroke();
    ctx.restore();
  }

  animate() {
    this.drawBackgroundParticles();
    this.drawArcReactorVisualizer();
    requestAnimationFrame(() => this.animate());
  }
}
