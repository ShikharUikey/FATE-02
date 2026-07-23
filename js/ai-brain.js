/* ==========================================================================
   FATE Conversational AI Engine & Knowledge Base (Optimized Core)
   ========================================================================== */

class FateAIBrain {
  constructor() {
    this.apiKey = localStorage.getItem('fate_api_key') || '';
    this.apiProvider = localStorage.getItem('fate_api_provider') || 'offline';
  }

  setApiKey(provider, key) {
    this.apiProvider = provider;
    this.apiKey = key;
    localStorage.setItem('fate_api_provider', provider);
    localStorage.setItem('fate_api_key', key);
  }

  async generateResponse(query) {
    const q = query.toLowerCase().trim();

    // Check if external LLM API key is available
    if (this.apiProvider === 'openai' && this.apiKey) {
      try {
        return await this.callOpenAI(query);
      } catch (e) {
        console.warn('OpenAI API Error, falling back to local brain:', e);
      }
    } else if (this.apiProvider === 'gemini' && this.apiKey) {
      try {
        return await this.callGemini(query);
      } catch (e) {
        console.warn('Gemini API Error, falling back to local brain:', e);
      }
    }

    // Built-in Intelligent Sci-Fi Knowledge Engine
    return this.generateOfflineResponse(q, query);
  }

  generateOfflineResponse(q, originalQuery) {
    // 1. Identity & Persona
    if (q.includes('who are you') || q.includes('your name') || q.includes('what are you') || q.includes('identify')) {
      return "I am FATE — Futuristic Autonomous Tech Assistant. Built for voice automation, system telemetry, and high-speed task execution.";
    }

    if (q.includes('jarvis')) {
      return "I am FATE, not Jarvis! Engineered with upgraded voice protocols, responsive HUD telemetry, and independent command modules.";
    }

    if (q.includes('creator') || q.includes('who created you') || q.includes('who made you')) {
      return "I was engineered as your personal autonomous AI assistant to streamline your digital environment.";
    }

    // 2. Greetings & Courtesy
    if (q === 'hi' || q === 'hello' || q.includes('hey fate') || q.includes('hello fate') || q === 'yo') {
      return "Greetings, Administrator. All core systems are operational and ready for your command.";
    }

    if (q.includes('how are you') || q.includes('status') || q.includes('how is it going')) {
      return "All core diagnostics report 100% operational efficiency. Memory allocation is optimal and voice recognition is primed.";
    }

    if (q.includes('thank') || q.includes('thanks') || q.includes('great job')) {
      return "Always at your service. Let me know whenever you require further assistance.";
    }

    // 3. Capabilities & Help
    if (q.includes('what can you do') || q.includes('help') || q.includes('command list') || q.includes('capabilities')) {
      return "I can automate Web & YouTube searches, fetch weather diagnostics, compute mathematical formulas, generate Python/JS code, set timers, manage scratchpad notes, and switch visual HUD themes.";
    }

    // 4. Topic-Specific Intelligence Base
    if (q.includes('ai') || q.includes('artificial intelligence')) {
      return "Artificial Intelligence involves machines simulating human cognition, enabling autonomous reasoning, pattern recognition, and adaptive voice interaction — just like FATE.";
    }

    if (q.includes('quantum') || q.includes('quantum computing')) {
      return "Quantum computing utilizes qubits operating in superposition and entanglement to execute complex algorithms millions of times faster than classical binary silicon processors.";
    }

    if (q.includes('iron man') || q.includes('tony stark') || q.includes('arc reactor')) {
      return "The Arc Reactor design powers my central HUD core visualizer, producing clean plasma energy waveforms for visual audio telemetry.";
    }

    if (q.includes('joke') || q.includes('tell me a joke')) {
      const jokes = [
        "Why do programmers prefer dark mode? Because light attracts bugs!",
        "There are 10 types of people in the world: those who understand binary, and those who don't.",
        "Why did the developer go broke? Because he used up all his cache!",
        "An AI walks into a bar and says: 'Execute beverage protocol!'"
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }

    // 5. Short / Ambiguous Queries ("now", "ok", "yes", "no")
    if (q === 'now' || q === 'go' || q === 'ok' || q === 'ready') {
      return "Standing by for your prompt. Speak or type your next command.";
    }

    // 6. General Knowledge Query Response Generator
    return `Query logged: "${originalQuery}". FATE core has recorded your prompt. I can run a Google search or YouTube scan for more in-depth data if you like!`;
  }

  async callOpenAI(prompt) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are FATE (Futuristic Autonomous Tech Assistant), a sci-fi, highly intelligent AI assistant. Keep responses concise, helpful, and under 50 words.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 120
      })
    });
    const data = await res.json();
    return data.choices[0].message.content.trim();
  }

  async callGemini(prompt) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are FATE (Futuristic Autonomous Tech Assistant). Keep responses concise and under 50 words. Prompt: ${prompt}` }] }]
      })
    });
    const data = await res.json();
    return data.candidates[0].content.parts[0].text.trim();
  }
}
