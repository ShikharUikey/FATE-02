/* ==========================================================================
   FATE Conversational AI Engine (Human Assistant Persona & Memory Matrix)
   ========================================================================== */

class FateAIBrain {
  constructor() {
    this.apiKey = localStorage.getItem('fate_api_key') || '';
    this.apiProvider = localStorage.getItem('fate_api_provider') || 'offline';

    // Human Assistant Memory Store
    this.userName = localStorage.getItem('fate_user_name') || 'Administrator';
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
        console.warn('OpenAI API Error, falling back to local human brain:', e);
        response = this.generateHumanAssistantResponse(q, query);
      }
    } else if (this.apiProvider === 'gemini' && this.apiKey) {
      try {
        response = await this.callGemini(query);
      } catch (e) {
        console.warn('Gemini API Error, falling back to local human brain:', e);
        response = this.generateHumanAssistantResponse(q, query);
      }
    } else {
      // Built-in Dynamic Human Assistant Brain
      response = this.generateHumanAssistantResponse(q, query);
    }

    this.conversationHistory.push({ role: 'assistant', text: response });
    return response;
  }

  generateHumanAssistantResponse(q, originalQuery) {
    // 1. Human Greetings & Daily Chit-Chat
    if (q.includes('good morning') || q.includes('morning')) {
      return `Good morning, ${this.userName}! I hope you're having a great start to your day. FATE Core is online and fully ready to assist you. What are we building or exploring today?`;
    }

    if (q.includes('good afternoon')) {
      return `Good afternoon, ${this.userName}! Systems are running smoothly. How can I help make your afternoon more productive?`;
    }

    if (q.includes('good evening') || q.includes('good night') || q.includes('gn')) {
      return `Good evening, ${this.userName}! I'm right here if you need any late-night coding, math assistance, or quick notes summarized. Rest well whenever you wrap up!`;
    }

    if (q.includes('kaise ho') || q.includes('kya haal hai') || q.includes('how are you')) {
      return `मैं बिल्कुल बढ़िया हूँ, ${this.userName}! All systems are operating in peak 100% optimal mode. Aap kaise hain? Aaj hum kya naya create karenge?`;
    }

    if (q.includes('can you speak hindi') || q.includes('do you speak hindi') || q.includes('hindi bolo') || q.includes('hindi bhasha')) {
      return "जी हाँ! मैं आपसे हिंदी और हिंग्लिश दोनों में बहुत ही सहजता से बात कर सकता हूँ। आप मुझसे कोडिंग, गणित, या कोई भी सवाल पूछ सकते हैं!";
    }

    if (q.includes('who made you') || q.includes('who created you') || q.includes('developer')) {
      return "I am FATE — your personal human-like AI companion and assistant! Designed with deep voice synthesis, academic problem solvers, multi-language speech, and automated macOS controls.";
    }

    if (q.includes('who are you') || q.includes('your name') || q.includes('what are you')) {
      return `I am FATE — your dedicated personal AI assistant! Think of me as your everyday partner for coding in Python, solving complex math, scanning GitHub resources, and managing your Mac efficiently.`;
    }

    if (/^(hi|hello|helo|hlo|hloo|hllo|hey|heey|hye|yo|wsp|sup|wassup|gm|hey fate|hello fate|hi fate)$/i.test(q) || q.startsWith('hi ') || q.startsWith('hello ')) {
      return `Hey ${this.userName}! Always glad to assist. What would you like to work on right now?`;
    }

    // 2. Math & Academic Quizzes (Human Assistant Tone)
    if (q.includes('math') || q.includes('maths') || q.includes('calculus') || q.includes('integral') || q.includes('derivative') || q.includes('equation')) {
      return `Here is a challenging Definite Integral problem for you, ${this.userName}: Evaluate Integral from 0 to pi/2 of sqrt(sin x) / (sqrt(sin x) + sqrt(cos x)) dx. Using King's Property, the solution simplifies to pi / 4. I've placed the full step-by-step derivation in FATE Suite Tools for you!`;
    }

    // 3. Physics & Chemistry Core
    if (q.includes('physics') || q.includes('quantum')) {
      return "Quantum Physics Insight: In quantum mechanics, Schrödinger's Time-Dependent Wave Equation governs wavefunctions: i ℏ (∂Ψ/∂t) = Ĥ Ψ. Energy levels for a 1D box are quantized as E_n = (n² h²)/(8 mL²). Let me know if you'd like an example derivation!";
    }

    if (q.includes('chemistry')) {
      return "Thermodynamics Note: Reaction spontaneity is determined by Gibbs Free Energy ΔG = ΔH - TΔS. A negative ΔG indicates a spontaneous process. Would you like me to generate a sample Nernst equation script?";
    }

    // 4. Neural Networks & Deep Learning
    if (q.includes('neural') || q.includes('network') || q.includes('deep learning') || q.includes('perceptron') || q.includes('ai model')) {
      return `I've generated a complete 3-Layer NumPy Feedforward Neural Network with Backpropagation for you, ${this.userName}! I've loaded the runnable Python code straight into FATE Code Studio.`;
    }

    // 5. Product Recommendation Systems
    if (q.includes('recommend') || q.includes('recommendation') || q.includes('recommender') || q.includes('product')) {
      return `I've prepared a Content-Based Machine Learning Product Recommendation System using TF-IDF Vectorization and Cosine Similarity! The complete script is ready in FATE Code Studio.`;
    }

    // 6. Programming & Calculator Modules
    if (q.includes('calculator') || q.includes('calc')) {
      return "I've written a complete interactive Python Calculator module for you! It's loaded and ready in FATE Code Studio.";
    }

    if (q.includes('python') || q.includes('script') || q.includes('program')) {
      return "I'm ready to write Python 3.13 scripts, Streamlit ML apps, Flask REST APIs, or data automation for you! What script shall we build?";
    }

    // 7. Human Motivation & Empathy
    if (q.includes('motivate') || q.includes('motivation') || q.includes('inspire')) {
      return `Remember ${this.userName}, consistency beats intensity every single time! Break your task into tiny actionable steps, stay focused, and you'll achieve fantastic results. You've got this!`;
    }

    if (q.includes('joke') || q.includes('tell me a joke')) {
      return "Here's a good one: Why do programmers prefer dark mode? Because light attracts bugs! 😄";
    }

    if (q.includes('shukriya') || q.includes('dhanyawad') || q.includes('thanks') || q.includes('thank you')) {
      return `You're very welcome, ${this.userName}! I'm always happy to help. Let me know if there's anything else you need!`;
    }

    // 8. Human Assistant Fallback
    return `I hear you, ${this.userName}! I'm ready to assist with "${originalQuery}". Would you like me to write a Python script, solve a math problem, or search GitHub for open-source resources on this?`;
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
          { role: 'system', content: `You are FATE, a warm, highly intelligent, human-like personal assistant for ${this.userName}. Speak naturally, politely, and empathetically in English, Hindi, and Hinglish.` },
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
        contents: [{ parts: [{ text: `You are FATE, a warm, intelligent human personal assistant. Respond naturally to: ${prompt}` }] }]
      })
    });
    const data = await res.json();
    return data.candidates[0].content.parts[0].text.trim();
  }
}
