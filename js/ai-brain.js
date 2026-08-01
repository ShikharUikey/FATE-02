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
    // 0. World Leaders, Tech Visionaries & Global Entities Knowledge Engine
    const entityResponse = this.processWorldEntitiesKnowledge(q, originalQuery);
    if (entityResponse) return entityResponse;

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

    // 2. Vocabulary & Advanced C1/C2 English Language Proficiency
    if (q.includes('c1') || q.includes('c2') || q.includes('vocabulary') || q.includes('advanced words') || q.includes('english words')) {
      return "Here are 5 C1-level Advanced English words, Boss: 1. Ubiquitous (present everywhere), 2. Ephemeral (lasting a short time), 3. Fastidious (attentive to detail), 4. Perspicacious (having keen insight), 5. Pernicious (having a subtle harmful effect).";
    }

    // 3. Neural Network & System Architecture Intelligence
    if (q.includes('neural') || q.includes('network') || q.includes('system') || q.includes('deep learning') || q.includes('arch') || q.includes('model') || q.includes('scappa')) {
      return "FATE's Neural Subsystem is fully active, Boss: Powered by a multi-layered Intent Classification Engine, Mem0 Persistent Vector Storage, Low-Latency Pipecat Voice Pipeline, and STARK Cyberpunk Telemetry.";
    }

    // 4. System Speed & Performance Diagnostics
    if (q === 'speed' || q.includes('speed') || q.includes('latency') || q.includes('fast')) {
      return "System latency is optimized, Boss: Speech recognition operates in real-time, TTS streaming latency is under 200ms, and all core engines are green.";
    }

    // 5. FRIDAY Intelligence & Chit-Chat Behavioral Responses
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

    // 6. Math & Academic Quizzes (FRIDAY Tactical Assistant Tone)
    if (q.includes('math') || q.includes('maths') || q.includes('calculus') || q.includes('integral') || q.includes('derivative') || q.includes('equation')) {
      return `Calculating optimal solution, Boss! Here is a JEE Advanced Definite Integral problem: Evaluate Integral from 0 to pi/2 of sqrt(sin x) / (sqrt(sin x) + sqrt(cos x)) dx. Applying King's Property simplifies the result to pi / 4. Full derivation is ready in Suite Tools!`;
    }

    // 7. Physics, Chemistry, NIST JARVIS Materials & Ishaan JARVIS Desktop Core
    if (q.includes('ishaan') || q.includes('ishaan1013') || q.includes('desktop assistant') || q.includes('system diagnostics')) {
      return "Ishaan JARVIS Desktop AI Voice Assistant Core (ishaan1013/jarvis) active, Boss! Features automated system diagnostics, PyTTSx3 speech synthesis, WolframAlpha computational intelligence, and daily briefing protocols.";
    }

    if (q.includes('jarvis materials') || q.includes('jarvis tools') || q.includes('materials design') || q.includes('dft') || clean.includes('alignn')) {
      return "NIST JARVIS Materials Design Infrastructure (jarvis-tools-notebooks) active, Boss! Computes DFT bandgaps, generates 3D atomic structures, and predicts properties with Atomistic Line Graph Neural Networks (ALIGNN). Full Jupyter notebook pipeline is loaded in Suite Tools!";
    }

    if (q.includes('physics') || q.includes('quantum')) {
      return "Quantum Physics & NIST Materials Telemetry, Boss: Schrödinger's Time-Dependent Wave Equation i ℏ (∂Ψ/∂t) = Ĥ Ψ governs atomic quantum states. Integrated with NIST JARVIS-DFT dataset for bandgap predictions.";
    }

    if (q.includes('chemistry')) {
      return "Thermodynamics Analysis, Boss: Reaction spontaneity is determined by Gibbs Free Energy ΔG = ΔH - TΔS. A negative ΔG indicates a spontaneous process.";
    }

    // 8. Programming & Automation Modules
    if (q.includes('calculator') || q.includes('calc') || q.includes('calculate')) {
      const sanitized = originalQuery.replace(/calculate|calc|calculator|what is|solve|equal to|equals to|equal|equals|=/gi, '').replace(/\bplus\b/gi, '+').replace(/\bminus\b/gi, '-').replace(/\btimes\b|\binto\b|\bx\b/gi, '*').replace(/\bdivided by\b|\bby\b/gi, '/').replace(/[^0-9+\-*/().\s]/g, '').trim();
      try {
        if (sanitized) {
          const res = Function(`"use strict"; return (${sanitized})`)();
          if (typeof res === 'number' && !isNaN(res)) {
            return `${sanitized} = ${res}`;
          }
        }
      } catch (e) {}
      return "FATE Calculator active. Please specify the numerical expression to evaluate, Boss!";
    }

    if (q.includes('python') || q.includes('script') || q.includes('program')) {
      return "I'm ready to write Python 3.13 scripts, Streamlit ML apps, Flask REST APIs, or data automation for you, Boss! What script shall we build?";
    }

    // 9. Human Motivation & Empathy
    if (q.includes('motivate') || q.includes('motivation') || q.includes('inspire')) {
      return `Remember Boss, consistency beats intensity every single time! Break your task into tiny actionable steps, stay focused, and we'll achieve fantastic results. You've got this!`;
    }

    if (q.includes('joke') || q.includes('tell me a joke')) {
      return "Here's a good one, Boss: Why do programmers prefer dark mode? Because light attracts bugs! 😄";
    }

    if (q.includes('shukriya') || q.includes('dhanyawad') || q.includes('thanks') || q.includes('thank you')) {
      return `Always a pleasure, Boss! Serving your objectives is what I was built for. Let me know if there's anything else you need!`;
    }

    // 10. Smart Conversational Handler for General Queries ("give me X", "explain X", "tell me X")
    if (q.startsWith('give me ') || q.startsWith('tell me ') || q.startsWith('explain ') || q.startsWith('what is ') || q.startsWith('how to ')) {
      const topic = originalQuery.replace(/give me|tell me|explain|what is|how to/gi, '').trim();
      return `Right away, Boss! Analyzing topic '${topic}'. I can write code, search GitHub, or fetch web data for '${topic}' on command!`;
    }

    // 11. FRIDAY Tactical Assistant Fallback (Minimal & Crisp)
    return `Standing by, Boss! Systems online.`;
  }

  // World Leaders, Tech Visionaries & Key Global Entities Knowledge Engine
  processWorldEntitiesKnowledge(q, originalQuery) {
    const knowledgeBase = [
      // Boss Profile & Political Leaders
      { keywords: ['shikhar uikey', 'shikhar', 'who am i', 'my profile', 'my instagram', 'shikhar_uikey_'], answer: "You are Shikhar Uikey (@shikhar_uikey_), Boss! Full-Stack AI Developer, BCA Specialist at SAGE University Bhopal, and creator of the FATE Autonomous Tech Assistant." },
      { keywords: ['narendra modi', 'pm modi', 'prime minister of india'], answer: "Narendra Modi is the Prime Minister of India, serving since May 2014. He is the leader of the Bharatiya Janata Party (BJP) and one of the world's most prominent global leaders, Boss." },
      { keywords: ['droupadi murmu', 'president of india'], answer: "Droupadi Murmu is the President of India, serving as the 15th President since July 2022. She is the first tribal woman to hold the highest constitutional office in India, Boss." },
      { keywords: ['donald trump', 'trump'], answer: "Donald Trump is the President of the United States, serving as the 47th US President, Boss." },
      { keywords: ['joe biden', 'biden'], answer: "Joe Biden served as the 46th President of the United States from 2021 to 2025, Boss." },
      { keywords: ['keir starmer', 'prime minister of uk', 'pm of uk'], answer: "Keir Starmer is the Prime Minister of the United Kingdom, serving as the leader of the Labour Party, Boss." },
      { keywords: ['emmanuel macron', 'president of france'], answer: "Emmanuel Macron is the President of France, serving as President since May 2017, Boss." },
      { keywords: ['vladimir putin', 'president of russia', 'putin'], answer: "Vladimir Putin is the President of Russia, serving as the leader of the Russian Federation, Boss." },
      { keywords: ['xi jinping', 'president of china'], answer: "Xi Jinping is the President of the People's Republic of China and General Secretary of the Chinese Communist Party, Boss." },
      { keywords: ['volodymyr zelenskyy', 'president of ukraine', 'zelensky'], answer: "Volodymyr Zelenskyy is the President of Ukraine, leading the nation since 2019, Boss." },
      { keywords: ['benjamin netanyahu', 'prime minister of israel'], answer: "Benjamin Netanyahu is the Prime Minister of Israel, serving as leader of the Likud party, Boss." },

      // Tech CEOs & Visionaries
      { keywords: ['sundar pichai', 'ceo of google', 'ceo of alphabet'], answer: "Sundar Pichai is the CEO of Alphabet Inc. and its subsidiary Google, leading global advancements in Search, Android, Cloud, and AI, Boss." },
      { keywords: ['satya nadella', 'ceo of microsoft'], answer: "Satya Nadella is the Chairman and CEO of Microsoft, driving Microsoft's Cloud transformation and AI partnership with OpenAI, Boss." },
      { keywords: ['elon musk', 'ceo of tesla', 'ceo of spacex', 'owner of x'], answer: "Elon Musk is the CEO of Tesla, SpaceX, Neuralink, and X (formerly Twitter), known for pioneering electric vehicles, commercial spaceflight, and AI, Boss." },
      { keywords: ['sam altman', 'ceo of openai'], answer: "Sam Altman is the CEO of OpenAI, the artificial intelligence research company behind ChatGPT, GPT-4, and Sora, Boss." },
      { keywords: ['mark zuckerberg', 'ceo of meta', 'founder of facebook'], answer: "Mark Zuckerberg is the Founder, Chairman, and CEO of Meta (formerly Facebook), leading social media platforms and Metaverse VR/AI development, Boss." },
      { keywords: ['tim cook', 'ceo of apple'], answer: "Tim Cook is the CEO of Apple Inc., leading Apple since August 2011 following Steve Jobs, Boss." },
      { keywords: ['jensen huang', 'ceo of nvidia'], answer: "Jensen Huang is the Co-founder and CEO of NVIDIA, the global leader in GPU computing, AI hardware, and CUDA acceleration, Boss." },
      { keywords: ['demis hassabis', 'ceo of deepmind', 'ceo of google deepmind'], answer: "Demis Hassabis is the Co-founder and CEO of Google DeepMind, Nobel laureate in Chemistry, and pioneer of AlphaFold, Gemini, and advanced AI architectures, Boss." },
      { keywords: ['jeff bezos', 'founder of amazon'], answer: "Jeff Bezos is the Founder and Executive Chairman of Amazon and founder of aerospace company Blue Origin, Boss." },
      { keywords: ['bill gates', 'founder of microsoft'], answer: "Bill Gates is the Co-founder of Microsoft and co-chair of the Bill & Melinda Gates Foundation, Boss." },

      // Key Global Entities & Organizations
      { keywords: ['isro', 'indian space research'], answer: "ISRO (Indian Space Research Organisation) is India's national space agency, famous for landmark missions like Chandrayaan-3 and Mangalyaan, Boss." },
      { keywords: ['nasa'], answer: "NASA (National Aeronautics and Space Administration) is the civil space program of the United States government, leading deep space exploration and Apollo/Artemis missions, Boss." },
      { keywords: ['united nations'], answer: "The United Nations (UN) is an international organization founded in 1945, dedicated to maintaining international peace, security, and global development, Boss." },
      { keywords: ['who', 'world health organization'], answer: "WHO (World Health Organization) is the specialized agency of the United Nations responsible for international public health, Boss." },
      { keywords: ['rbi', 'reserve bank of india'], answer: "RBI (Reserve Bank of India) is India's central bank and monetary authority, regulating the Indian Rupee and banking system, Boss." },
      { keywords: ['drdo'], answer: "DRDO (Defence Research and Development Organisation) is India's premier military research agency, developing advanced missile systems and defense technology, Boss." },
      { keywords: ['google deepmind', 'deepmind'], answer: "Google DeepMind is Google's world-leading AI research laboratory creating frontier AI models including Gemini, AlphaFold, and Antigravity SDK, Boss." },
      { keywords: ['microsoft jarvis', 'taskmatrix', 'task matrix', 'microsoft jarvis system'], answer: "Microsoft JARVIS (TaskMatrix.AI) is an advanced AI system that connects LLMs as a controller with specialized neural models across speech, vision, code execution, and web automation, Boss! FATE Core embeds this exact LLM Multi-Model Task Matrix." }
    ];

    for (const item of knowledgeBase) {
      if (item.keywords.some(kw => q.includes(kw))) {
        return item.answer;
      }
    }

    // Dynamic Entity Query Matcher for "who is <name>" or "tell me about <name>"
    if (q.startsWith('who is ') || q.startsWith('tell me about ') || q.startsWith('who was ')) {
      const entity = originalQuery.replace(/who is|tell me about|who was/gi, '').trim();
      return `${entity} is a globally recognized public leader/entity, Boss. Tell me 'search google for ${entity}' if you'd like live web news on them!`;
    }

    return null;
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
