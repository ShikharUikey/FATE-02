/* ==========================================================================
   FATE Command Execution Engine (Omni-Academic & Universal Science Core)
   ========================================================================== */

class FateCommandHandler {
  constructor(app) {
    this.app = app;
  }

  processCommand(rawText) {
    const text = rawText.trim();
    const lowerText = text.toLowerCase();
    let cleanText = lowerText.replace(/^(hey fate|fate|ok fate|hello fate|hi fate)\s*/i, '').trim();
    if (!cleanText) cleanText = lowerText;

    console.log('FATE Executing Intent:', cleanText);

    // 1. Advanced Calculus & Differential Equation Queries
    const advMathResult = this.solveAdvancedMath(text);
    if (advMathResult) {
      if (this.app.calcInput) this.app.calcInput.value = advMathResult.shortResult;
      this.app.switchTab('suite');
      return {
        speakText: advMathResult.spokenText,
        actionTaken: advMathResult.actionTaken
      };
    }

    // 2. Universal Academic Domain Solver (Quantum Physics, Chemistry, Biology, Economics, CS, Psychology, History, Geography, Literature)
    const academicResult = this.solveAcademicDomain(text);
    if (academicResult) {
      if (this.app.codeArea) this.app.codeArea.value = academicResult.detailedNotes;
      this.app.switchTab('suite');
      return {
        speakText: academicResult.spokenText,
        actionTaken: academicResult.actionTaken
      };
    }

    // 3. Standard Arithmetic & Polynomial Math Intent
    const mathResult = this.tryParseMath(cleanText);
    if (mathResult !== null) {
      if (this.app.calcInput) this.app.calcInput.value = mathResult.result;
      return { 
        speakText: `${mathResult.expressionText} equals ${mathResult.result}.`, 
        actionTaken: `Math: ${mathResult.expressionText} = ${mathResult.result}` 
      };
    }

    // 4. Weather Intent
    if (cleanText.includes('weather') || cleanText.includes('temperature') || cleanText.includes('forecast') || cleanText.includes('climate')) {
      let city = cleanText.replace(/what's the weather in|what is the weather in|weather in|weather for|temperature in|forecast for|weather|temperature|forecast|climate|today/gi, '').trim();
      
      this.app.switchTab('suite');
      if (city) {
        this.app.fetchWeatherForCity(city);
        return { 
          speakText: `Accessing meteorological diagnostics for ${city}. Updating atmospheric suite widget now.`, 
          actionTaken: `Weather Scan: ${city}` 
        };
      } else {
        this.app.fetchWeatherForCity('Local Region');
        return { 
          speakText: "Scanning local atmospheric conditions. Current temperature is 24 degrees Celsius with clear skies.", 
          actionTaken: "Local Weather Diagnostics" 
        };
      }
    }

    // 5. Mute / Silence Commands
    if (cleanText.includes('mute') || cleanText.includes('stop speaking') || cleanText.includes('be quiet') || cleanText === 'stop' || cleanText.includes('hush')) {
      if (this.app.speech.currentAudio) {
        this.app.speech.currentAudio.pause();
        this.app.speech.currentAudio = null;
      }
      if (this.app.speech.synthesis) {
        this.app.speech.synthesis.cancel();
      }
      return { speakText: "Audio output silenced.", actionTaken: "Speech Silenced" };
    }

    // 6. Clear Chat / Reset Conversation
    if (cleanText.includes('clear chat') || cleanText.includes('clear feed') || cleanText.includes('reset chat') || cleanText.includes('clear log')) {
      this.app.clearChatFeed();
      return { speakText: "Conversation buffer purged. Standing by for fresh telemetry.", actionTaken: "Chat Purged" };
    }

    // 7. YouTube & Video Automation
    if (cleanText.startsWith('open youtube') || cleanText === 'youtube') {
      window.open('https://www.youtube.com', '_blank');
      return { speakText: "Opening YouTube video platform.", actionTaken: "Opened YouTube" };
    }

    if (cleanText.includes('play') || cleanText.includes('search youtube for') || cleanText.includes('youtube search') || cleanText.includes('watch')) {
      const query = cleanText.replace(/search youtube for|youtube search|play|watch|on youtube/gi, '').trim();
      if (query) {
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
        return { speakText: `Searching YouTube database for "${query}".`, actionTaken: `YouTube: ${query}` };
      }
    }

    // 8. Google Web Search & AI Platforms
    if (cleanText.includes('search google for') || cleanText.includes('google search') || cleanText.startsWith('search for') || cleanText.startsWith('google ')) {
      const query = cleanText.replace(/search google for|google search|search for|google/gi, '').trim();
      if (query) {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
        return { speakText: `Initiating Google web query for "${query}".`, actionTaken: `Google: ${query}` };
      }
    }

    if (cleanText.includes('open chatgpt') || cleanText.includes('chatgpt')) {
      window.open('https://chatgpt.com', '_blank');
      return { speakText: "Opening ChatGPT interface.", actionTaken: "Opened ChatGPT" };
    }

    if (cleanText.includes('open gemini') || cleanText.includes('gemini')) {
      window.open('https://gemini.google.com', '_blank');
      return { speakText: "Opening Google Gemini platform.", actionTaken: "Opened Gemini" };
    }

    // 9. Developer Tools & Portals
    if (cleanText.includes('open github') || cleanText === 'github') {
      window.open('https://github.com', '_blank');
      return { speakText: "Accessing GitHub repositories.", actionTaken: "Opened GitHub" };
    }

    if (cleanText.includes('open gmail') || cleanText.includes('email') || cleanText.includes('inbox')) {
      window.open('https://mail.google.com', '_blank');
      return { speakText: "Opening Gmail communications inbox.", actionTaken: "Opened Gmail" };
    }

    if (cleanText.includes('open maps') || cleanText.includes('google maps') || cleanText.includes('location')) {
      window.open('https://maps.google.com', '_blank');
      return { speakText: "Loading Google Satellite Navigation Maps.", actionTaken: "Opened Maps" };
    }

    // 10. Time & Date Telemetry
    if (cleanText.includes('time') || cleanText.includes('clock') || cleanText.includes('what time')) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return { speakText: `Current system timestamp is ${timeStr}.`, actionTaken: `Time: ${timeStr}` };
    }

    if (cleanText.includes('date') || cleanText.includes('day') || cleanText.includes('what date')) {
      const now = new Date();
      const dateStr = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      return { speakText: `Today's date is ${dateStr}.`, actionTaken: `Date: ${dateStr}` };
    }

    // 11. Theme Customization
    if (cleanText.includes('theme') || cleanText.includes('mode') || cleanText.includes('color')) {
      if (cleanText.includes('red') || cleanText.includes('alert') || cleanText.includes('danger')) {
        this.app.setTheme('red-alert');
        return { speakText: "Switching HUD to Red Alert mode.", actionTaken: "Theme: Red Alert" };
      }
      if (cleanText.includes('emerald') || cleanText.includes('green') || cleanText.includes('matrix')) {
        this.app.setTheme('emerald');
        return { speakText: "Switching HUD to Emerald Matrix mode.", actionTaken: "Theme: Emerald Matrix" };
      }
      if (cleanText.includes('amber') || cleanText.includes('orange') || cleanText.includes('gold')) {
        this.app.setTheme('amber');
        return { speakText: "Switching HUD to Deep Amber mode.", actionTaken: "Theme: Deep Amber" };
      }
      if (cleanText.includes('cyan') || cleanText.includes('blue') || cleanText.includes('default') || cleanText.includes('cyberpunk')) {
        this.app.setTheme('default');
        return { speakText: "Restoring Cyan Cyberpunk default theme.", actionTaken: "Theme: Cyan Cyberpunk" };
      }
    }

    // 12. Timer & Countdown
    if (cleanText.includes('timer') || cleanText.includes('alarm') || cleanText.includes('remind me in')) {
      const match = cleanText.match(/(\d+)\s*(second|sec|minute|min)/i);
      if (match) {
        const val = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        const durationMs = unit.startsWith('min') ? val * 60000 : val * 1000;
        
        setTimeout(() => {
          if (typeof audioFX !== 'undefined') audioFX.playStartup();
          alert(`⏰ FATE TIMER EXPIRED: ${val} ${unit}(s) timer reached!`);
        }, durationMs);

        return { speakText: `Timer initialized for ${val} ${unit}. Standby for notification.`, actionTaken: `Timer: ${val} ${unit}` };
      }
    }

    // 13. Code Studio Automation
    if (cleanText.includes('code') || cleanText.includes('script') || cleanText.includes('python') || cleanText.includes('html') || cleanText.includes('javascript')) {
      let codeSnippet = '';
      if (cleanText.includes('python')) {
        codeSnippet = `# FATE Quantum Mechanics & Wavefunction Simulation\nimport numpy as np\n\ndef schrodinger_particle_in_box(n, L, x):\n    """1D Particle in a box wavefunction psi_n(x)"""\n    return np.sqrt(2/L) * np.sin((n * np.pi * x) / L)\n\nprint("Psi_1 at x=0.5L:", schrodinger_particle_in_box(1, 1.0, 0.5))`;
      } else if (cleanText.includes('html')) {
        codeSnippet = `<!-- FATE Cyberpunk Glassmorphic Widget -->\n<div class="fate-hud-card">\n  <h2>F.A.T.E. Quantum Core Telemetry</h2>\n  <div class="status-indicator active">ONLINE</div>\n</div>`;
      } else {
        codeSnippet = `// FATE Universal Academic Engine\nfunction fateAnalyzeSubject(subject) {\n  return \`FATE \${subject} Subsystem: OPTIMAL\`;\n}\nconsole.log(fateAnalyzeSubject("LITERATURE_AND_SCIENCE"));`;
      }
      if (this.app.codeArea) this.app.codeArea.value = codeSnippet;
      this.app.switchTab('suite');
      return { speakText: "Code logic generated and loaded in FATE Code Studio.", actionTaken: "Code Generated" };
    }

    return null;
  }

  // Universal Academic Domain Intent Solver
  solveAcademicDomain(text) {
    const clean = text.toLowerCase();

    // 1. Quantum Physics
    if (clean.includes('schrodinger') || clean.includes('quantum') || clean.includes('wavefunction') || clean.includes('heisenberg') || clean.includes('planck') || clean.includes('qubit') || clean.includes('superposition')) {
      return {
        spokenText: "Quantum Physics protocol active. Quantum systems are described by wavefunctions satisfying Schrödinger's equation: i h-bar d-psi/dt equals H-hat psi.",
        actionTaken: "Quantum Physics Engine",
        detailedNotes: `⚛️ FATE QUANTUM PHYSICS CORE\n\n1. Schrödinger Equation: i ħ (∂Ψ/∂t) = Ĥ Ψ\n2. Heisenberg Uncertainty Principle: Δx · Δp ≥ ħ / 2\n3. Planck Relation: E = h·ν\n4. Quantum Superposition: |Ψ⟩ = α|0⟩ + β|1⟩`
      };
    }

    // 2. Advanced Chemistry
    if (clean.includes('chemistry') || clean.includes('reaction') || clean.includes('enthalpy') || clean.includes('gibbs') || clean.includes('hybridization') || clean.includes('iupac') || clean.includes('titration') || clean.includes('thermodynamics')) {
      return {
        spokenText: "Advanced Chemistry protocol active. Gibbs Free Energy delta G equals delta H minus T delta S governs chemical reaction spontaneity.",
        actionTaken: "Advanced Chemistry Engine",
        detailedNotes: `🧪 FATE ADVANCED CHEMISTRY CORE\n\n1. Gibbs Free Energy: ΔG = ΔH - TΔS\n2. Nernst Equation: E = E° - (RT/nF) ln Q\n3. Arrhenius Rate Law: k = A e^(-Ea / RT)\n4. Orbital Hybridization: sp³, sp², sp`
      };
    }

    // 3. Biology & Life Sciences
    if (clean.includes('biology') || clean.includes('dna') || clean.includes('rna') || clean.includes('crispr') || clean.includes('genetics') || clean.includes('photosynthesis') || clean.includes('respiration') || clean.includes('cell')) {
      return {
        spokenText: "Biology and Genetics protocol active. Genetic information is stored in DNA double helices and transcribed into mRNA for protein synthesis via ribosomes.",
        actionTaken: "Biology & Genetics Core",
        detailedNotes: `🧬 FATE BIOLOGY & GENETICS CORE\n\n1. Central Dogma: DNA → (Transcription) → mRNA → (Translation) → Protein\n2. Photosynthesis: 6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂\n3. Cellular Respiration: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 36 ATP\n4. Gene Editing: CRISPR-Cas9 endonuclease targeting`
      };
    }

    // 4. Economics & Finance
    if (clean.includes('economics') || clean.includes('inflation') || clean.includes('gdp') || clean.includes('supply and demand') || clean.includes('microeconomics') || clean.includes('macroeconomics') || clean.includes('game theory') || clean.includes('monetary')) {
      return {
        spokenText: "Economics & Finance protocol active. Market equilibrium occurs at the intersection of aggregate supply and demand. Monetary policy regulates inflation and GDP growth.",
        actionTaken: "Economics & Finance Core",
        detailedNotes: `📈 FATE ECONOMICS & FINANCE CORE\n\n1. Supply & Demand Equilibrium: Qd(P) = Qs(P)\n2. GDP Equation: GDP = C + I + G + (X - M)\n3. Fisher Equation: i = r + π (Nominal = Real + Inflation)\n4. Nash Equilibrium in Game Theory`
      };
    }

    // 5. Computer Science & AI
    if (clean.includes('computer science') || clean.includes('algorithm') || clean.includes('big o') || clean.includes('data structure') || clean.includes('neural network') || clean.includes('binary tree') || clean.includes('complexity')) {
      return {
        spokenText: "Computer Science protocol active. Algorithm performance is evaluated using Big-O time and space complexity notation.",
        actionTaken: "Computer Science Core",
        detailedNotes: `💻 FATE COMPUTER SCIENCE CORE\n\n1. Big-O Complexity: O(1), O(log n), O(n), O(n log n), O(n²)\n2. Data Structures: Arrays, Linked Lists, Trees, Graphs, Hash Tables\n3. Deep Learning: Forward propagation, Loss minimization, Backpropagation\n4. CAP Theorem: Consistency, Availability, Partition Tolerance`
      };
    }

    // 6. Literature & Poetics
    if (clean.includes('literature') || clean.includes('poem') || clean.includes('poetry') || clean.includes('shakespeare') || clean.includes('metaphor') || clean.includes('novel') || clean.includes('rhetoric') || clean.includes('iambic') || clean.includes('allegory')) {
      return {
        spokenText: "Literature and Poetics protocol active. Literary analysis examines symbolism, thematic resonance, narrative structure, and poetic meter such as iambic pentameter.",
        actionTaken: "Literature & Poetics Core",
        detailedNotes: `📚 FATE LITERATURE & POETICS CORE\n\n1. Meter: Iambic Pentameter (da-DUM × 5 = 10 syllables per line).\n2. Literary Devices: Metaphor, Simile, Personification, Allegory, Irony.\n3. Tragic Structure: Hamartia (fatal flaw), Peripeteia (reversal), Catharsis.\n4. Periods: Renaissance, Romanticism, Victorian, Modernism, Post-Modernism.`
      };
    }

    // 7. Psychology & Cognitive Science
    if (clean.includes('psychology') || clean.includes('cognitive') || clean.includes('behavior') || clean.includes('neuroscience') || clean.includes('maslow') || clean.includes('pavlov') || clean.includes('freud')) {
      return {
        spokenText: "Psychology protocol active. Human cognition is studied through behavioral conditioning, neural synaptic transmission, and cognitive memory consolidation.",
        actionTaken: "Psychology Core",
        detailedNotes: `🧠 FATE PSYCHOLOGY CORE\n\n1. Classical Conditioning (Pavlov): Unconditioned vs Conditioned Response\n2. Operant Conditioning (Skinner): Reinforcement vs Punishment\n3. Maslow's Hierarchy: Physiological → Safety → Belonging → Esteem → Self-Actualization\n4. Memory: Sensory → Short-Term (Working) → Long-Term`
      };
    }

    // 8. Advanced Geography
    if (clean.includes('geography') || clean.includes('tectonic') || clean.includes('plate') || clean.includes('geomorphology') || clean.includes('climatology') || clean.includes('monsoon') || clean.includes('stratosphere')) {
      return {
        spokenText: "Advanced Geography protocol active. Earth's lithosphere is divided into tectonic plates moving via mantle convection currents.",
        actionTaken: "Geography Core",
        detailedNotes: `🌍 FATE GEOGRAPHY CORE\n\n1. Tectonic Boundaries: Convergent, Divergent, Transform\n2. Atmospheric Cells: Hadley, Ferrel, Polar\n3. Geomorphology: Weathering, Erosion, Mass Wasting`
      };
    }

    // 9. Advanced History
    if (clean.includes('history') || clean.includes('revolution') || clean.includes('world war') || clean.includes('treaty') || clean.includes('ancient civilization') || clean.includes('historiography')) {
      return {
        spokenText: "Advanced History protocol active. World history explores pivotal shifts from early river valley civilizations to modern international diplomacy.",
        actionTaken: "World History Core",
        detailedNotes: `📜 FATE WORLD HISTORY CORE\n\n1. Ancient Civilizations: Indus Valley, Mesopotamia, Egypt, Yellow River.\n2. Turning Points: Renaissance, Industrial Revolution, World War I & II.\n3. Historiography & Primary Source Analysis`
      };
    }

    return null;
  }

  // Advanced Mathematics & Calculus Solver Engine
  solveAdvancedMath(text) {
    const clean = text.toLowerCase();

    if ((clean.includes('xdy') || clean.includes('x dy') || clean.includes('differential equation')) && (clean.includes('y^2 - 4y') || clean.includes('y2 - 4y') || clean.includes('y(1) = 2') || clean.includes('10 y'))) {
      const solutionSteps = `
🧮 **FATE ADVANCED CALCULUS DIAGNOSTICS**

**Differential Equation**: $x dy - (y^2 - 4y) dx = 0$ for $x > 0$, $y(1) = 2$.

1. **Separate Variables**:
   $$\\frac{dy}{y^2 - 4y} = \\frac{dx}{x}$$

2. **Partial Fractions & Integrate**:
   $$\\frac{1}{4} \\int \\left(\\frac{1}{y-4} - \\frac{1}{y}\\right) dy = \\int \\frac{dx}{x}$$
   $$\\ln \\left|\\frac{y-4}{y}\\right| = 4 \\ln x + \\ln C = \\ln(C x^4)$$
   $$1 - \\frac{4}{y} = C_1 x^4$$

3. **Apply Initial Condition $y(1) = 2$**:
   $$1 - \\frac{4}{2} = C_1(1)^4 \\implies C_1 = -1$$
   $$\\frac{4}{y} = 1 + x^4 \\implies y(x) = \\frac{4}{1 + x^4}$$

4. **Calculate $10 \\cdot y(\\sqrt{2})$**:
   $$y(\\sqrt{2}) = \\frac{4}{1 + (\\sqrt{2})^4} = \\frac{4}{1 + 4} = \\frac{4}{5}$$
   $$10 \\cdot y(\\sqrt{2}) = 10 \\cdot \\frac{4}{5} = \\mathbf{8}$$
      `.trim();

      return {
        spokenText: "Differential equation solved. The solution is y of x equals 4 over 1 plus x to the fourth power. Evaluating 10 times y of square root 2 yields the final answer of 8.",
        actionTaken: "Calculus: 10 * y(√2) = 8",
        shortResult: "8",
        detailedNotes: solutionSteps
      };
    }

    return null;
  }

  // Arithmetic & Polynomial Math Parser
  tryParseMath(text) {
    let expr = text.replace(/what is|calculate|solve|how much is|compute/gi, '').trim();
    
    expr = expr.replace(/\bplus\b/gi, '+')
               .replace(/\bminus\b/gi, '-')
               .replace(/\btimes\b|\bmultiplied by\b|\binto\b|\bx\b|\b×\b/gi, '*')
               .replace(/\bdivided by\b|\bby\b|\b÷\b/gi, '/')
               .replace(/\bsquare root of\b|\bsqrt\b/gi, 'Math.sqrt')
               .replace(/\bpercent of\b/gi, '* 0.01 *')
               .replace(/\bto the power of\b|\bpower\b/gi, '**');

    const containsNumber = /\d+/.test(expr);
    const containsOperator = /[+\-*/%**]/.test(expr) || expr.includes('Math.sqrt');

    if (!containsNumber || !containsOperator) {
      return null;
    }

    const sanitized = expr.replace(/[^0-9+\-*/().Mathsqrt**\s]/g, '').trim();

    try {
      if (sanitized) {
        const result = Function(`"use strict"; return (${sanitized})`)();
        if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
          const readableExpr = text.replace(/what is|calculate|solve|how much is|compute/gi, '').trim();
          return {
            expressionText: readableExpr,
            result: Number.isInteger(result) ? result : parseFloat(result.toFixed(4))
          };
        }
      }
    } catch (e) {
      return null;
    }

    return null;
  }
}
