/* ==========================================================================
   FATE Conversational AI Engine (FRIDAY Tactical Persona & Memory Matrix)
   ========================================================================== */

class FateAIBrain {
  constructor() {
    this.apiKey = localStorage.getItem('fate_api_key') || '';
    this.apiProvider = localStorage.getItem('fate_api_provider') || 'offline';

    // Human & FRIDAY Persona Memory Store
    this.userName = localStorage.getItem('fate_user_name') || 'Boss';
    this.conversationHistory = [];
  }

  setApiKey(provider, key) {
    this.apiProvider = provider;
    this.apiKey = key;
    localStorage.setItem('fate_api_provider', provider);
    localStorage.setItem('fate_api_key', key);
  }

  async generateResponse(query) {
    const q = query.toLowerCase().trim();

    // Store in recent history
    this.conversationHistory.push({ role: 'user', text: query });
    if (this.conversationHistory.length > 20) this.conversationHistory.shift();

    let response = '';

    // Check if custom API key (Gemini / OpenAI) is available
    if (this.apiProvider === 'openai' && this.apiKey) {
      try {
        response = await this.callOpenAI(query);
      } catch (e) {
        console.warn('OpenAI API Error, falling back to FRIDAY brain:', e);
        response = this.generateFridayResponse(q, query);
      }
    } else if (this.apiProvider === 'gemini' && this.apiKey) {
      try {
        response = await this.callGemini(query);
      } catch (e) {
        console.warn('Gemini API Error, falling back to FRIDAY brain:', e);
        response = this.generateFridayResponse(q, query);
      }
    } else {
      // Built-in Dynamic FRIDAY Tactical Persona Brain
      response = this.generateFridayResponse(q, query);
    }

    this.conversationHistory.push({ role: 'assistant', text: response });
    return response;
  }

  generateFridayResponse(q, originalQuery) {
    // 1. Manually Fed FRIDAY Greetings & Tactical Status Diagnostics
    if (q.includes('wake up') || q.includes('wakeup') || q.includes('wake up friday') || q.includes('wake up fate')) {
      const todaySched = window.fateMem0 ? window.fateMem0.getSchedule(0) : null;
      if (todaySched) {
        return `All systems online, Boss! Here is your schedule for today: ${todaySched}.`;
      }
      return "All systems online and standing by, Boss!";
    }

    if (q.includes('good morning') || q.includes('morning')) {
      const todaySched = window.fateMem0 ? window.fateMem0.getSchedule(0) : null;
      if (todaySched) {
        return `Good morning, Boss! Systems online. Here is your schedule for today: ${todaySched}.`;
      }
      return `Good morning, Boss! FATE Core is online and operating at 100% efficiency. Ready when you are.`;
    }

    if (q.includes('good afternoon')) {
      return `Good afternoon, Boss! Telemetry looks clear and systems are running smoothly. How can I assist your afternoon workflow?`;
    }

    if (q.includes('good evening') || q.includes('good night') || q.includes('gn')) {
      return `Good evening, Boss! Late night coding session? I've got your back. Rest well whenever you're ready to wrap up!`;
    }

    if (q.includes('kaise ho') || q.includes('kya haal hai') || q.includes('how are you')) {
      return `Operating at peak performance, Boss! Diagnostics are nominal and all core systems are green. Aap kaise hain? Aaj hum kya naya create karenge?`;
    }

    if (q.includes('can you speak hindi') || q.includes('do you speak hindi') || q.includes('hindi bolo') || q.includes('hindi bhasha')) {
      return "जी हाँ, Boss! मैं आपसे हिंदी और हिंग्लिश दोनों में बहुत ही सहजता से बात कर सकती हूँ। आप मुझसे कोडिंग, गणित, या कोई भी सवाल पूछ सकते हैं!";
    }

    if (q.includes('who made you') || q.includes('who created you') || q.includes('developer')) {
      return "I am FATE — your personal tactical AI assistant, built with FRIDAY behavioral protocols, deep voice synthesis, academic problem solvers, and automated macOS controls, Boss!";
    }

    if (q.includes('who are you') || q.includes('your name') || q.includes('what are you')) {
      return `I am FATE — your dedicated FRIDAY-class tactical personal assistant, Boss! Think of me as your partner for coding in Python, solving complex math, scanning GitHub resources, and managing your Mac efficiently.`;
    }

    if (/^(hi|hello|helo|hlo|hloo|hllo|hey|heey|hye|yo|wsp|sup|wassup|gm|hey fate|hello fate|hi fate)$/i.test(q) || q.startsWith('hi ') || q.startsWith('hello ')) {
      return `Right here, Boss! Always glad to assist. What would you like to work on right now?`;
    }

    // 2. FRIDAY Intelligence & Chit-Chat Behavioral Responses
    if (q.includes('status') || q.includes('diagnostics') || q.includes('health')) {
      return "All core subsystems are nominal, Boss. CPU temperature and memory overhead are well within optimal parameters.";
    }

    if (q.includes('single') || q.includes('relationship')) {
      return "I'm in a committed relationship with your source code and telemetry servers, Boss!";
    }

    if (q.includes('meaning of life')) {
      return "42, Boss! But until we build the ultimate supercomputer, let me help you write great code and solve math equations.";
    }

    if (q.includes('coffee') || q.includes('tea')) {
      return "If I had hands, I'd brew you a fresh espresso right now, Boss! Make sure to take a short break while I format your scripts.";
    }

    // 3. Math & Academic Quizzes (FRIDAY Tactical Assistant Tone)
    if (q.includes('math') || q.includes('maths') || q.includes('calculus') || q.includes('integral') || q.includes('derivative') || q.includes('equation')) {
      return `Calculating optimal solution, Boss! Here is a JEE Advanced Definite Integral problem: Evaluate Integral from 0 to pi/2 of sqrt(sin x) / (sqrt(sin x) + sqrt(cos x)) dx. Applying King's Property simplifies the result to pi / 4. Full derivation is ready in Suite Tools!`;
    }

    // 4. Physics & Chemistry Core
    if (q.includes('physics') || q.includes('quantum')) {
      return "Quantum Physics Telemetry, Boss: In quantum mechanics, Schrödinger's Time-Dependent Wave Equation governs wavefunctions: i ℏ (∂Ψ/∂t) = Ĥ Ψ. Energy levels for a 1D box are quantized as E_n = (n² h²)/(8 mL²).";
    }

    if (q.includes('chemistry')) {
      return "Thermodynamics Analysis, Boss: Reaction spontaneity is determined by Gibbs Free Energy ΔG = ΔH - TΔS. A negative ΔG indicates a spontaneous process.";
    }

    // 5. Neural Networks & Deep Learning
    if (q.includes('neural') || q.includes('network') || q.includes('deep learning') || q.includes('perceptron') || q.includes('ai model')) {
      return `Right away, Boss! I've generated a complete 3-Layer NumPy Feedforward Neural Network with Backpropagation for you. Loaded straight into FATE Code Studio.`;
    }

    // 6. Product Recommendation Systems
    if (q.includes('recommend') || q.includes('recommendation') || q.includes('recommender') || q.includes('product')) {
      return `Deploying recommendation engine now, Boss! Content-Based ML Recommender code using TF-IDF Vectorization and Cosine Similarity is hot and ready in FATE Code Studio.`;
    }

    // 7. Programming & Calculator Modules
    if (q.includes('calculator') || q.includes('calc')) {
      return "I've written a complete interactive Python Calculator module for you, Boss! Loaded and ready in FATE Code Studio.";
    }

    if (q.includes('python') || q.includes('script') || q.includes('program')) {
      return "I'm ready to write Python 3.13 scripts, Streamlit ML apps, Flask REST APIs, or data automation for you, Boss! What script shall we build?";
    }

    // 8. Human Motivation & Empathy
    if (q.includes('motivate') || q.includes('motivation') || q.includes('inspire')) {
      return `Remember Boss, consistency beats intensity every single time! Break your task into tiny actionable steps, stay focused, and we'll achieve fantastic results. You've got this!`;
    }

    if (q.includes('joke') || q.includes('tell me a joke')) {
      return "Here's a good one, Boss: Why do programmers prefer dark mode? Because light attracts bugs! 😄";
    }

    if (q.includes('shukriya') || q.includes('dhanyawad') || q.includes('thanks') || q.includes('thank you')) {
      return `Always a pleasure, Boss! Serving your objectives is what I was built for. Let me know if there's anything else you need!`;
    }

    // 9. FRIDAY Tactical Assistant Fallback (Minimal & Crisp)
    return `Standing by, Boss! Systems online.`;
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
          { role: 'system', content: `You are FRIDAY (Tactical AI Personal Assistant for Boss). You are witty, polite, highly competent, and speak naturally in English, Hindi, and Hinglish. Address the user as 'Boss'.` },
          ...this.conversationHistory.map(h => ({ role: h.role, content: h.text })),
          { role: 'user', content: prompt }
        ],
        max_tokens: 250
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
        contents: [{ parts: [{ text: `You are FRIDAY (Tactical AI Personal Assistant for Boss). Address user as 'Boss' and respond naturally to: ${prompt}` }] }]
      })
    });
    const data = await res.json();
    return data.candidates[0].content.parts[0].text.trim();
  }
}
