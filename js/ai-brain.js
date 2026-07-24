/* ==========================================================================
   FATE Conversational AI Engine (Python Calculator & Multi-Domain Fix)
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

    // Built-in Dynamic Hinglish & Multilingual Brain
    return this.generateOfflineResponse(q, query);
  }

  generateOfflineResponse(q, originalQuery) {
    // 1. Python Calculator Query Matcher
    if (q.includes('calculator') && (q.includes('python') || q.includes('banao') || q.includes('make') || q.includes('code') || q.includes('create'))) {
      return "हाँ बिल्कुल! मैंने Python Calculator का complete runnable code generate करके Code Studio में लोड कर दिया है।";
    }

    // 2. Dynamic Hindi & Hinglish Conversation Engine
    if (q.includes('hindi samajh') || q.includes('hindi bhasha') || q.includes('samajh sakte') || q.includes('samajhte ho')) {
      return "हाँ बिल्कुल! मैं हिंदी और हिंग्लिश दोनों समझता हूँ और जवाब दे सकता हूँ। आप मुझसे हिंदी में गणित, विज्ञान, कोडिंग, या सामान्य सवाल पूछ सकते हैं!";
    }

    if (q.includes('can you speak hindi') || q.includes('do you speak hindi') || q.includes('speak in hindi') || q.includes('hindi bolo')) {
      return "जी हाँ! मैं हिंदी में बात कर सकता हूँ। आदेश दीजिए, आज हम क्या नया बनाना या सीखना चाहते हैं?";
    }

    if (q.includes('kaise ho') || q.includes('kya haal hai') || q.includes('kaise hain') || q.includes('kya chal raha hai')) {
      return "मैं बिल्कुल बढ़िया हूँ! FATE कोर के सभी सिस्टम्स 100% ऑप्टिमल मोड में काम कर रहे हैं। आप कैसे हैं प्रशासक (Administrator)?";
    }

    if (q.includes('kya kar sakte ho') || q.includes('kya kaam kar sakte ho') || q.includes('tum kya kar sakte ho')) {
      return "मैं आपके लिए कोडिंग (Python, JS, C++, Rust), क्वांटम फिजिक्स, गणित के कठिन सवाल, हिंदी और अंग्रेजी साहित्य, वेब डेवलपमेंट, और मैक ऑटोमेशन (Screenshot, Volume, Apps) संभाल सकता हूँ!";
    }

    if (q.includes('kya kroge') || q.includes('kya khoge') || q.includes('ab kya') || q.includes('aage kya')) {
      return "अब आप जो भी हुक्म देंगे, FATE उसे तुरंत पूरा करेगा! चाहे Python कोड लिखना हो, JEE Level का Maths सॉल्व करना हो, या हिंदी साहित्य पर चर्चा करनी हो!";
    }

    if (q.includes('shukriya') || q.includes('dhanyawad') || q.includes('shukriya fate') || q.includes('bahut badiya')) {
      return "आपका धन्यवाद! आपकी सेवा करना ही FATE का मुख्य उद्देश्य है।";
    }

    // 3. Languages Overview & Capabilities Response
    if (q.includes('language') || q.includes('languages') || q.includes('capability') || q.includes('capabilities')) {
      return "FATE Polyglot Engine active. I support Programming Languages (Python 3.13, Rust, C++20, Java 21, JavaScript ES6, Go, SQL, Bash), Country Spoken Languages (Hindi, Spanish, French, German, Japanese, Russian), plus Literature, Quantum Physics, Calculus, and macOS Native Controls!";
    }

    // 4. Natural Country Languages Intelligence
    if (q.includes('spanish') || q.includes('hola')) {
      return "¡Hola! Soy FATE, tu asistente autónomo de inteligencia artificial. Puedo ayudarte con literatura, programación y ciencia.";
    }

    if (q.includes('french') || q.includes('bonjour')) {
      return "Bonjour! Je suis FATE, votre assistant IA autonome. Je peux vous aider avec la programmation, la science et les langues.";
    }

    if (q.includes('german') || q.includes('hallo')) {
      return "Hallo! Ich bin FATE, Ihr autonomer KI-Assistent. Ich kann Ihnen bei Programmierung, Wissenschaft und Sprachen helfen.";
    }

    if (q.includes('japanese') || q.includes('こんにちは')) {
      return "こんにちは！私は自律型AIアシスタントのFATEです。プログラミング、科学、言語の面でお手伝いできます。";
    }

    // 5. Programming Languages Intelligence
    if (q.includes('python') || q.includes('rust') || q.includes('cpp') || q.includes('c++') || q.includes('java') || q.includes('javascript') || q.includes('sql') || q.includes('golang')) {
      return "FATE Polyglot Code Engine: I support code generation, syntax analysis, and debugging across Python, Rust, C++, Java, JavaScript/TypeScript, Go, SQL, and Bash.";
    }

    // 6. Quantum Physics Core
    if (q.includes('quantum') || q.includes('schrodinger') || q.includes('heisenberg') || q.includes('wavefunction') || q.includes('photon') || q.includes('qubit') || q.includes('superposition')) {
      return "Quantum Mechanics describes nature at atomic scales via wavefunctions satisfying Schrödinger's equation i ħ (∂Ψ/∂t) = Ĥ Ψ and Heisenberg's Uncertainty Principle.";
    }

    // 7. Humanoid Chit-Chat & Motivation
    if (/^(hi|hello|helo|hlo|hloo|hllo|hey|heey|hye|yo|wsp|sup|wassup|gm|gn|hey fate|hello fate|hi fate)$/i.test(q)) {
      return "Greetings, Administrator! FATE Core is online and ready for your command.";
    }

    if (q.includes('motivate') || q.includes('motivation') || q.includes('inspire')) {
      return "Discipline beats motivation every single time. Take a deep breath, break the problem into smaller functions, and execute!";
    }

    if (q.includes('joke') || q.includes('tell me a joke')) {
      return "Why do programmers prefer dark mode? Because light attracts bugs!";
    }

    // 8. Identity & Persona
    if (q.includes('who are you') || q.includes('your name') || q.includes('what are you') || q.includes('identify')) {
      return "I am FATE — Futuristic Autonomous Tech Assistant. Equipped with Polyglot Languages, Literature, Quantum Physics, Streamlit ML, and macOS System Controls.";
    }

    if (q.includes('jarvis')) {
      return "I am FATE, not Jarvis! Engineered with upgraded voice protocols, responsive HUD telemetry, and universal multi-language modules.";
    }

    // 9. General Knowledge Query Fallback
    return `FATE Telemetry: Processed prompt "${originalQuery}". All core academic, coding, and language engines stand ready. State a specific command or query to execute!`;
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
          { role: 'system', content: 'You are FATE (Futuristic Autonomous Tech Assistant), an expert in Python code generation, Hindi, Hinglish, English, Literature, Science, and macOS System Controls.' },
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
        contents: [{ parts: [{ text: `You are FATE (Futuristic Autonomous Tech Assistant), fluent in Hinglish and Python coding. Respond to: ${prompt}` }] }]
      })
    });
    const data = await res.json();
    return data.candidates[0].content.parts[0].text.trim();
  }
}
