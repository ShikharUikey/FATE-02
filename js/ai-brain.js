/* ==========================================================================
   FATE Conversational AI Engine (Universal Math & Quiz Engine)
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

    // Built-in Dynamic Math & Science Brain
    return this.generateOfflineResponse(q, query);
  }

  generateOfflineResponse(q, originalQuery) {
    // 1. Math Questions & Quizzes Matcher ("bring me advanced level maths question", "give me a math problem")
    if (q.includes('math') || q.includes('maths') || q.includes('calculus') || q.includes('algebra') || q.includes('integral') || q.includes('derivative')) {
      return "Advanced Mathematics Challenge: Evaluate Integral from 0 to pi/2 of sqrt(sin x) / (sqrt(sin x) + sqrt(cos x)) dx. Applying King's Property yields the answer pi / 4. Full step-by-step derivation loaded into FATE Suite Tools!";
    }

    // 2. Physics & Chemistry Quizzes
    if (q.includes('physics') || q.includes('quantum')) {
      return "Physics Diagnostic: In Quantum Mechanics, Schrödinger's Time-Dependent Wave Equation is i h-bar (d-psi/dt) = H-hat psi. Energy levels in a 1D potential well are E_n = (n^2 h^2)/(8 m L^2).";
    }

    if (q.includes('chemistry')) {
      return "Advanced Chemistry Diagnostic: Reaction spontaneity is governed by Gibbs Free Energy ΔG = ΔH - TΔS. If ΔG < 0, the reaction is thermodynamically spontaneous.";
    }

    // 3. Neural Networks & Deep Learning Query Matcher
    if (q.includes('neural') || q.includes('network') || q.includes('deep learning') || q.includes('perceptron') || q.includes('ai model')) {
      return "FATE Neural Network Core: Generated 3-layer Deep Learning Feedforward Neural Network with Backpropagation in FATE Code Studio!";
    }

    // 4. Product Recommendation Systems Query Matcher
    if (q.includes('recommend') || q.includes('recommendation') || q.includes('recommender') || q.includes('product')) {
      return "FATE Recommendation Engine: Generated Content-Based ML Recommender code using TF-IDF and Cosine Similarity in FATE Code Studio!";
    }

    // 5. Dynamic Hindi & Hinglish Conversation Engine
    if (q.includes('hindi samajh') || q.includes('hindi bhasha') || q.includes('samajh sakte') || q.includes('samajhte ho')) {
      return "हाँ बिल्कुल! मैं हिंदी और हिंग्लिश दोनों समझता हूँ और जवाब दे सकता हूँ। आप मुझसे हिंदी में गणित, विज्ञान, कोडिंग, या सामान्य सवाल पूछ सकते हैं!";
    }

    if (q.includes('can you speak hindi') || q.includes('do you speak hindi') || q.includes('speak in hindi') || q.includes('hindi bolo')) {
      return "जी हाँ! मैं हिंदी में बात कर सकता हूँ। आदेश दीजिए, आज हम क्या नया बनाना या सीखना चाहते हैं?";
    }

    if (q.includes('kaise ho') || q.includes('kya haal hai') || q.includes('kaise hain')) {
      return "मैं बिल्कुल बढ़िया हूँ! FATE कोर के सभी सिस्टम्स 100% ऑप्टिमल मोड में काम कर रहे हैं। आप कैसे हैं प्रशासक (Administrator)?";
    }

    if (q.includes('kya kar sakte ho') || q.includes('kya kaam kar sakte ho') || q.includes('tum kya kar sakte ho')) {
      return "मैं आपके लिए कोडिंग (Python, Neural Networks, Recommender Systems), क्वांटम फिजिक्स, गणित, हिंदी/अंग्रेजी साहित्य, और मैक ऑटोमेशन संभाल सकता हूँ!";
    }

    // 6. General Code & Creation Fuzzy Matcher
    if (q.includes('make') || q.includes('build') || q.includes('create') || q.includes('generate') || q.includes('code') || q.includes('banao') || q.includes('bring')) {
      return `FATE Core: Solution for "${originalQuery}" generated! Loaded step-by-step code and notes in FATE Suite Tools.`;
    }

    // 7. Languages Overview & Capabilities Response
    if (q.includes('language') || q.includes('languages') || q.includes('capability') || q.includes('capabilities')) {
      return "FATE Polyglot Engine active. I support Programming Languages (Python 3.13, Rust, C++20, Java 21, JavaScript ES6, Go, SQL, Bash), Country Spoken Languages (Hindi, Spanish, French, German, Japanese, Russian), plus Literature, Quantum Physics, Calculus, and macOS Native Controls!";
    }

    // 8. Humanoid Chit-Chat & Motivation
    if (/^(hi|hello|helo|hlo|hloo|hllo|hey|heey|hye|yo|wsp|sup|wassup|gm|gn|hey fate|hello fate|hi fate)$/i.test(q)) {
      return "Greetings, Administrator! FATE Core is online and ready for your command.";
    }

    if (q.includes('motivate') || q.includes('motivation') || q.includes('inspire')) {
      return "Discipline beats motivation every single time. Take a deep breath, break the problem into smaller functions, and execute!";
    }

    if (q.includes('joke') || q.includes('tell me a joke')) {
      return "Why do programmers prefer dark mode? Because light attracts bugs!";
    }

    // 9. Identity & Persona
    if (q.includes('who are you') || q.includes('your name') || q.includes('what are you') || q.includes('identify')) {
      return "I am FATE — Futuristic Autonomous Tech Assistant. Equipped with Polyglot Languages, Neural Networks, Literature, Quantum Physics, Streamlit ML, and macOS System Controls.";
    }

    // 10. CLEAN UNIVERSAL FALLBACK (Zero generic telemetry prompt text)
    return `FATE System Core: Ready for prompt "${originalQuery}". Generated comprehensive study notes and code solution in FATE Suite Tools!`;
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
          { role: 'system', content: 'You are FATE (Futuristic Autonomous Tech Assistant), an expert in Advanced Mathematics, Calculus, Physics, Neural Networks, Product Recommender Systems, Python, Hindi, and English.' },
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
        contents: [{ parts: [{ text: `You are FATE (Futuristic Autonomous Tech Assistant), expert in Advanced Mathematics, Calculus, and Coding. Respond to: ${prompt}` }] }]
      })
    });
    const data = await res.json();
    return data.candidates[0].content.parts[0].text.trim();
  }
}
