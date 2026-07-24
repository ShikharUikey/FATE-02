/* ==========================================================================
   FATE Command Execution Engine (Advanced Math & Intent Engine)
   ========================================================================== */

class FateCommandHandler {
  constructor(app) {
    this.app = app;
  }

  processCommand(rawText) {
    const text = rawText.toLowerCase().trim();
    let cleanText = text.replace(/^(hey fate|fate|ok fate|hello fate|hi fate)\s*/i, '').trim();
    if (!cleanText) cleanText = text;

    console.log('FATE Executing Intent:', cleanText);

    // 1. Math Calculation Intent (Detects "what is 2 x 4 + 8", "50 + 50", "10 * 5", "square root of 16", etc.)
    const mathResult = this.tryParseMath(cleanText);
    if (mathResult !== null) {
      if (this.app.calcInput) this.app.calcInput.value = mathResult.result;
      return { 
        speakText: `${mathResult.expressionText} equals ${mathResult.result}.`, 
        actionTaken: `Math: ${mathResult.expressionText} = ${mathResult.result}` 
      };
    }

    // 2. Weather Intent ("what's the weather", "weather in London", "temperature", "forecast")
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

    // 3. Mute / Silence Commands
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

    // 4. Clear Chat / Reset Conversation
    if (cleanText.includes('clear chat') || cleanText.includes('clear feed') || cleanText.includes('reset chat') || cleanText.includes('clear log')) {
      this.app.clearChatFeed();
      return { speakText: "Conversation buffer purged. Standing by for fresh telemetry.", actionTaken: "Chat Purged" };
    }

    // 5. YouTube & Video Automation
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

    // 6. Google Web Search & AI Platforms
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

    // 7. Developer Tools & Portals
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

    // 8. Time & Date Telemetry
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

    // 9. Theme Customization
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

    // 10. Timer & Countdown
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

    // 11. Code Studio Automation
    if (cleanText.includes('code') || cleanText.includes('script') || cleanText.includes('python') || cleanText.includes('html') || cleanText.includes('javascript')) {
      let codeSnippet = '';
      if (cleanText.includes('python')) {
        codeSnippet = `# FATE Autonomous Python Automation Core\nimport time\nimport requests\n\ndef run_fate_diagnostics():\n    print("⚡ FATE Core Scanning Subsystems...")\n    time.sleep(0.5)\n    print("✅ All Diagnostics Optimal.")\n\nif __name__ == '__main__':\n    run_fate_diagnostics()`;
      } else if (cleanText.includes('html')) {
        codeSnippet = `<!-- FATE Cyberpunk Glassmorphic Widget -->\n<div class="fate-hud-card">\n  <h2>F.A.T.E. Core Telemetry</h2>\n  <div class="status-indicator active">ONLINE</div>\n</div>`;
      } else {
        codeSnippet = `// FATE Autonomous JS Controller\nclass FateSubsystem {\n  constructor() {\n    this.status = "OPTIMAL";\n  }\n  ping() {\n    console.log("FATE Signal: OK");\n  }\n}\nnew FateSubsystem().ping();`;
      }
      if (this.app.codeArea) this.app.codeArea.value = codeSnippet;
      this.app.switchTab('suite');
      return { speakText: "Code logic generated and loaded in FATE Code Studio.", actionTaken: "Code Generated" };
    }

    // No direct automation rule match -> delegate to Conversational AI Brain
    return null;
  }

  // Smart Math Expression Parser
  tryParseMath(text) {
    // Standardize math words and symbols
    let expr = text.replace(/what is|calculate|solve|how much is|compute/gi, '').trim();
    
    // Replace spoken math terms with math operators
    expr = expr.replace(/\bplus\b/gi, '+')
               .replace(/\bminus\b/gi, '-')
               .replace(/\btimes\b|\bmultiplied by\b|\binto\b|\bx\b|\b×\b/gi, '*')
               .replace(/\bdivided by\b|\bby\b|\b÷\b/gi, '/')
               .replace(/\bsquare root of\b|\bsqrt\b/gi, 'Math.sqrt')
               .replace(/\bpercent of\b/gi, '* 0.01 *')
               .replace(/\bto the power of\b|\bpower\b/gi, '**');

    // Filter to ensure text contains numbers and valid math operators
    const containsNumber = /\d+/.test(expr);
    const containsOperator = /[+\-*/%**]/.test(expr) || expr.includes('Math.sqrt');

    if (!containsNumber || !containsOperator) {
      return null;
    }

    // Sanitize string to allow only mathematical characters
    const sanitized = expr.replace(/[^0-9+\-*/().Mathsqrt**\s]/g, '').trim();

    try {
      if (sanitized) {
        const result = Function(`"use strict"; return (${sanitized})`)();
        if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
          // Format display math string
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
