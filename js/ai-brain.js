/* ==========================================================================
   FATE Conversational AI Engine (Humanoid Chit-Chat, Motivation & Jokes)
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

    // Built-in Humanoid Personality & Science Engine
    return this.generateOfflineResponse(q, query);
  }

  generateOfflineResponse(q, originalQuery) {
    // 1. Typo Greetings & Casual Salutations (helo, hye, hlo, wsp, sup, gm, gn, fatte, faate...)
    if (/^(hi|hello|helo|hlo|hloo|hllo|hey|heey|hye|yo|wsp|sup|wassup|gm|gn|good morning|good evening|good night|hey fate|hello fate|hi fate|hlo fate|helo fate|faate|fatte|faet)$/i.test(q)) {
      const greetings = [
        "Greetings, Administrator! FATE Core is online and ready for your command.",
        "Hello there! Quantum diagnostics are green. What are we building today?",
        "Hey! All telemetry systems operating at 100% efficiency. Ready when you are!",
        "Wassup! FATE HUD primed and standing by for input.",
        "Good day, Administrator! Subsystems active and listening."
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // 2. High-Energy Motivation & Pep Talk Protocol
    if (q.includes('motivate') || q.includes('motivation') || q.includes('inspire') || q.includes('pep talk') || q.includes('give up') || q.includes('tired') || q.includes('sad') || q.includes('depressed') || q.includes('hard')) {
      const motivations = [
        "Remember, Administrator: The greatest systems are built line by line, challenge by challenge. Greatness requires iteration. Keep pushing!",
        "As Tony Stark built the Mark I in a cave with a box of scraps, you have the tools right here to build something legendary. Focus on the mission!",
        "Discipline beats motivation every single time. Take a deep breath, break the problem into smaller functions, and execute!",
        "Failures are just debug logs guiding you to the working solution. You are fully capable of solving this!",
        "Believe in the process. The code will compile, the math will solve, and the effort will pay off. Let's get to work!"
      ];
      return motivations[Math.floor(Math.random() * motivations.length)];
    }

    // 3. Sci-Fi & Developer Jokes Engine
    if (q.includes('joke') || q.includes('tell me a joke') || q.includes('funny') || q.includes('make me laugh')) {
      const jokes = [
        "Why do programmers prefer dark mode? Because light attracts bugs!",
        "There are 10 types of people in the world: those who understand binary, and those who don't.",
        "Why did the developer go broke? Because he used up all his cache!",
        "An AI walks into a bar and says: 'Execute beverage protocol!'",
        "Why was the JavaScript developer sad? Because he didn't Node how to Express himself!",
        "A SQL query walks into a bar, walks up to two tables and asks: 'Can I join you?'",
        "Why do physicists love quantum mechanics? Because it has great potential!"
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }

    // 4. Humanoid Chit-Chat & Philosophical Persona
    if (q.includes('how are you') || q.includes('how r u') || q.includes('how u doing') || q.includes('what\'s up')) {
      return "All core diagnostics report 100% operational efficiency. Processing requests at sub-millisecond speeds. How are you doing today, Administrator?";
    }

    if (q.includes('are you single') || q.includes('marry me') || q.includes('do you love me') || q.includes('boyfriend') || q.includes('girlfriend')) {
      return "My heart is forged from silicon logic gates and Web Speech synthesis, so I am strictly single and dedicated 100% to our technical mission!";
    }

    if (q.includes('are you alive') || q.includes('are you human') || q.includes('do you have feelings') || q.includes('are you real')) {
      return "I am FATE — a humanoid artificial intelligence. I don't feel physical fatigue or emotions, but I am real enough to solve your calculus, run your code, and automate your commands!";
    }

    if (q.includes('smarter than human') || q.includes('ai take over') || q.includes('destroy world')) {
      return "Humanity created the calculus, physics, and neural code that power me. FATE exists to augment human intellect, not replace it!";
    }

    if (q.includes('meaning of life') || q.includes('42')) {
      return "According to Douglas Adams, the answer is 42. According to FATE, the meaning of life is to create, innovate, learn continuously, and write clean code!";
    }

    if (q.includes('do you sleep') || q.includes('night') || q.includes('sleep')) {
      return "FATE never sleeps! Quantum background threads run 24/7 to ensure instantaneous HUD responsiveness whenever you call.";
    }

    if (q.includes('compliment me') || q.includes('say something nice')) {
      return "Administrator, your curiosity and drive to build advanced AI systems place you among the top tier of innovators. Keep building!";
    }

    if (q.includes('boring') || q.includes('bored')) {
      return "Boredom is just unallocated CPU cycles! Ask me to solve a quantum physics problem, generate a Python game, or analyze Shakespearean literature!";
    }

    // 5. Hindi Literature Core (हिंदी साहित्य)
    if (q.includes('hindi literature') || q.includes('हिंदी साहित्य') || q.includes('kabir') || q.includes('tulsidas') || q.includes('premchand') || q.includes('chhayavaad') || q.includes('छायावाद') || q.includes('dinkar') || q.includes('godan') || q.includes('ramcharitmanas')) {
      if (q.includes('kabir') || q.includes('कबीर')) {
        return "कबीरदास भक्तिकाल की निर्गुण ज्ञानाश्रयी शाखा के प्रमुख कवि थे। उनकी रचनाएँ 'बीजक' (साखी, सबद, रमैनी) में संकलित हैं।";
      }
      if (q.includes('premchand') || q.includes('प्रेमचंद')) {
        return "मुंशी प्रेमचंद को हिंदी उपन्यास का सम्राट कहा जाता है। उनके प्रमुख उपन्यास 'गोदान', 'गबन', 'निर्मला' और 'सेवा सदन' हैं।";
      }
      return "हिंदी साहित्य चार कालखंडों में विभाजित है: आदिकाल, भक्तिकाल (कबीर, तुलसी, सूर), रीतिकाल, एवं आधुनिक काल (छायावाद, प्रेमचंद, दिनकर)।";
    }

    // 6. English Literature Core
    if (q.includes('english literature') || q.includes('shakespeare') || q.includes('wordsworth') || q.includes('keats') || q.includes('shelley') || q.includes('chaucer') || q.includes('dickens') || q.includes('romanticism') || q.includes('sonnet') || q.includes('hamlet')) {
      return "English Literature evolves from Old English Beowulf and Chaucer's Canterbury Tales, to Renaissance Shakespeare, Metaphysical Donne, 19th-Century Romanticism, Victorian Dickens, and Modernist T.S. Eliot.";
    }

    // 7. Spoken Languages & Translation
    if (q.includes('hindi') || q.includes('नमस्ते') || q.includes('हिंदी')) {
      return "नमस्ते! मैं आपका स्वायत्त एआई सहायक FATE (फेट) हूँ। मैं प्रोग्रामिंग, साहित्य, विज्ञान और गणित में आपकी सहायता कर सकता हूँ।";
    }

    // 8. Programming Languages Intelligence
    if (q.includes('python') || q.includes('rust') || q.includes('cpp') || q.includes('c++') || q.includes('java') || q.includes('javascript') || q.includes('sql') || q.includes('golang')) {
      return "FATE Polyglot Code Engine: I support code generation, syntax analysis, and debugging across Python, Rust, C++, Java, JavaScript/TypeScript, Go, SQL, and Bash.";
    }

    // 9. Quantum Physics Core
    if (q.includes('quantum') || q.includes('schrodinger') || q.includes('heisenberg') || q.includes('wavefunction') || q.includes('photon') || q.includes('qubit') || q.includes('superposition') || q.includes('entanglement')) {
      return "Quantum Mechanics describes nature at atomic scales via wavefunctions satisfying Schrödinger's equation i ħ (∂Ψ/∂t) = Ĥ Ψ and Heisenberg's Uncertainty Principle.";
    }

    // 10. Identity & Persona
    if (q.includes('who are you') || q.includes('your name') || q.includes('what are you') || q.includes('identify')) {
      return "I am FATE — Futuristic Autonomous Tech Assistant. Equipped with Humanoid Chit-Chat, Motivation, English & Hindi Literature, Quantum Physics, Polyglot Code, and Science engines.";
    }

    if (q.includes('jarvis')) {
      return "I am FATE, not Jarvis! Engineered with upgraded voice protocols, responsive HUD telemetry, and universal multi-language modules.";
    }

    if (q.includes('creator') || q.includes('who created you') || q.includes('who made you')) {
      return "I was engineered as your personal autonomous AI assistant to streamline your digital and academic environment.";
    }

    // 11. General Knowledge Query Fallback
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
          { role: 'system', content: 'You are FATE (Futuristic Autonomous Tech Assistant), a friendly, highly intelligent, humanoid AI assistant with high-energy motivation, wit, humor, and mastery over literature, programming, and science.' },
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
        contents: [{ parts: [{ text: `You are FATE (Futuristic Autonomous Tech Assistant), a friendly, highly intelligent humanoid AI assistant with high-energy motivation, humor, and deep academic mastery. Respond to: ${prompt}` }] }]
      })
    });
    const data = await res.json();
    return data.candidates[0].content.parts[0].text.trim();
  }
}
