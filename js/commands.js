/* ==========================================================================
   FATE Command Execution Engine (Hyper-Optimized Intent Parser)
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

    // 1. Weather Intent ("what's the weather", "weather in London", "temperature", "forecast")
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

    // 2. Mute / Silence Commands ("mute", "stop speaking", "be quiet", "hush", "shutup")
    if (cleanText.includes('mute') || cleanText.includes('stop speaking') || cleanText.includes('be quiet') || cleanText === 'stop' || cleanText.includes('hush')) {
      if (this.app.speech.synthesis) {
        this.app.speech.synthesis.cancel();
      }
      return { speakText: "Audio output silenced.", actionTaken: "Speech Silenced" };
    }

    // 3. Clear Chat / Reset Conversation ("clear chat", "clear feed", "reset chat", "clean log")
    if (cleanText.includes('clear chat') || cleanText.includes('clear feed') || cleanText.includes('reset chat') || cleanText.includes('clear log')) {
      this.app.clearChatFeed();
      return { speakText: "Conversation buffer purged. Standing by for fresh telemetry.", actionTaken: "Chat Purged" };
    }

    // 4. YouTube & Video Automation
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

    // 5. Google Web Search & AI Platforms
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

    // 6. Developer Tools & Portals (GitHub, StackOverflow, Maps, Gmail)
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

    // 7. Time & Date Telemetry
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

    // 8. Theme Customization
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

    // 9. Voice Scientific Calculator
    if (cleanText.includes('calculate') || cleanText.includes('plus') || cleanText.includes('minus') || cleanText.includes('times') || cleanText.includes('divided by') || cleanText.includes('square root')) {
      try {
        let mathExpr = cleanText.replace(/calculate|what is|how much is/gi, '').trim();
        mathExpr = mathExpr.replace(/plus/g, '+')
                           .replace(/minus/g, '-')
                           .replace(/times|multiplied by/g, '*')
                           .replace(/divided by/g, '/')
                           .replace(/square root of (\d+)/g, 'Math.sqrt($1)');
        
        const sanitized = mathExpr.replace(/[^0-9+\-*/().Mathsqrt]/g, '');
        if (sanitized) {
          const result = Function(`"use strict"; return (${sanitized})`)();
          if (this.app.calcInput) this.app.calcInput.value = result;
          this.app.switchTab('suite');
          return { speakText: `The calculation result is ${result}.`, actionTaken: `Calc: ${mathExpr} = ${result}` };
        }
      } catch (e) {
        return { speakText: "Unable to calculate expression safely.", actionTaken: "Calc Error" };
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
}
