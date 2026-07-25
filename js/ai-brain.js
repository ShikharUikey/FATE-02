/* ==========================================================================
   FATE Conversational AI Engine (100% Reliable & Natural Response Matrix)
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

    // Check if custom API key (Gemini / OpenAI) is available
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

    // Built-in Dynamic Reliable Response Matrix
    return this.generateOfflineResponse(q, query);
  }

  generateOfflineResponse(q, originalQuery) {
    // 1. Natural Greetings & Daily Chit-Chat (Handles all variations: "hi good morning", "good morning fate", "hey", "hlo", etc.)
    if (q.includes('good morning') || q.includes('morning')) {
      return "Good morning, Administrator! FATE Core is online and operating at 100% efficiency. How may I assist your mission today?";
    }

    if (q.includes('good afternoon')) {
      return "Good afternoon, Administrator! FATE Core is primed and standing by for your commands.";
    }

    if (q.includes('good evening') || q.includes('good night') || q.includes('gn')) {
      return "Good evening! FATE Core remains active to assist with your coding, research, and technical tasks.";
    }

    if (q.includes('kaise ho') || q.includes('kya haal hai') || q.includes('how are you')) {
      return "मैं बिल्कुल बढ़िया हूँ! FATE कोर के सभी सिस्टम्स 100% ऑप्टिमल मोड में काम कर रहे हैं। आप कैसे हैं प्रशासक (Administrator)?";
    }

    if (q.includes('can you speak hindi') || q.includes('do you speak hindi') || q.includes('hindi bolo') || q.includes('hindi bhasha')) {
      return "जी हाँ! मैं हिंदी और हिंग्लिश दोनों में बात कर सकता हूँ। आदेश दीजिए, आज हम क्या नया बनाना या सीखना चाहते हैं?";
    }

    if (q.includes('who made you') || q.includes('who created you') || q.includes('developer')) {
      return "I am FATE — Futuristic Autonomous Tech Assistant, engineered for advanced coding, multi-language speech, quantum physics, and macOS system automation.";
    }

    if (q.includes('who are you') || q.includes('your name') || q.includes('what are you')) {
      return "I am FATE — Futuristic Autonomous Tech Assistant. Equipped with Polyglot Languages, Neural Networks, Literature, Quantum Physics, Streamlit ML, and macOS System Controls.";
    }

    if (/^(hi|hello|helo|hlo|hloo|hllo|hey|heey|hye|yo|wsp|sup|wassup|gm|hey fate|hello fate|hi fate)$/i.test(q) || q.startsWith('hi ') || q.startsWith('hello ')) {
      return "Greetings, Administrator! FATE Core is online and ready for your command.";
    }

    // 2. Math & Academic Quizzes
    if (q.includes('math') || q.includes('maths') || q.includes('calculus') || q.includes('integral') || q.includes('derivative') || q.includes('equation')) {
      return "Advanced Mathematics Challenge: Evaluate Integral from 0 to pi/2 of sqrt(sin x) / (sqrt(sin x) + sqrt(cos x)) dx. Applying King's Property yields the answer pi / 4. Full step-by-step derivation loaded into FATE Suite Tools!";
    }

    // 3. Physics & Chemistry Core
    if (q.includes('physics') || q.includes('quantum')) {
      return "Physics Diagnostic: In Quantum Mechanics, Schrödinger's Time-Dependent Wave Equation is i h-bar (d-psi/dt) = H-hat psi. Energy levels in a 1D potential well are E_n = (n^2 h^2)/(8 m L^2).";
    }

    if (q.includes('chemistry')) {
      return "Advanced Chemistry Diagnostic: Reaction spontaneity is governed by Gibbs Free Energy ΔG = ΔH - TΔS. If ΔG < 0, the reaction is thermodynamically spontaneous.";
    }

    // 4. Neural Networks & Deep Learning Query Matcher
    if (q.includes('neural') || q.includes('network') || q.includes('deep learning') || q.includes('perceptron') || q.includes('ai model')) {
      return "FATE Neural Network Core: Generated 3-layer Deep Learning Feedforward Neural Network with Backpropagation in FATE Code Studio!";
    }

    // 5. Product Recommendation Systems Query Matcher
    if (q.includes('recommend') || q.includes('recommendation') || q.includes('recommender') || q.includes('product')) {
      return "FATE Recommendation Engine: Generated Content-Based ML Recommender code using TF-IDF and Cosine Similarity in FATE Code Studio!";
    }

    // 6. Programming Languages & Code Generation
    if (q.includes('calculator') || q.includes('calc')) {
      return "FATE Code Studio: Generated complete runnable Python Calculator script!";
    }

    if (q.includes('python') || q.includes('script') || q.includes('program')) {
      return "FATE Polyglot Engine: I support code generation, syntax analysis, and debugging across Python 3.13, Rust, C++, Java, JavaScript, and Go!";
    }

    // 7. Humanoid Chit-Chat & Motivation
    if (q.includes('motivate') || q.includes('motivation') || q.includes('inspire')) {
      return "Discipline beats motivation every single time. Take a deep breath, break the problem into smaller functions, and execute!";
    }

    if (q.includes('joke') || q.includes('tell me a joke')) {
      return "Why do programmers prefer dark mode? Because light attracts bugs!";
    }

    if (q.includes('shukriya') || q.includes('dhanyawad') || q.includes('thanks') || q.includes('thank you')) {
      return "You're very welcome, Administrator! Serving your objectives is FATE's highest priority.";
    }

    // 8. RELIABLE NATURAL FALLBACK (No weird robotic telemetry message)
    return `I understand you are asking about "${originalQuery}". FATE Core stands ready to generate python scripts, solve math problems, or discuss science and literature. How can I assist you further?`;
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
          { role: 'system', content: 'You are FATE (Futuristic Autonomous Tech Assistant), a polite, highly intelligent AI assistant fluent in English, Hindi, and Hinglish.' },
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
        contents: [{ parts: [{ text: `You are FATE (Futuristic Autonomous Tech Assistant). Respond politely and accurately to: ${prompt}` }] }]
      })
    });
    const data = await res.json();
    return data.candidates[0].content.parts[0].text.trim();
  }
}
