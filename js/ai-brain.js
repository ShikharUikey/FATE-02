/* ==========================================================================
   FATE Conversational AI Engine (English & Hindi Literature Enabled)
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

    // Built-in English & Hindi Literature & Science Engine
    return this.generateOfflineResponse(q, query);
  }

  generateOfflineResponse(q, originalQuery) {
    // 1. Hindi Literature Core (हिंदी साहित्य)
    if (q.includes('hindi literature') || q.includes('हिंदी साहित्य') || q.includes('kabir') || q.includes('tulsidas') || q.includes('premchand') || q.includes('chhayavaad') || q.includes('छायावाद') || q.includes('dinkar') || q.includes('godan') || q.includes('ramcharitmanas')) {
      if (q.includes('kabir') || q.includes('कबीर')) {
        return "कबीरदास भक्तिकाल की निर्गुण ज्ञानाश्रयी शाखा के प्रमुख कवि थे। उनकी रचनाएँ 'बीजक' (साखी, सबद, रमैनी) में संकलित हैं, जो सामाजिक कुरीतियों पर प्रहार करती हैं।";
      }
      if (q.includes('tulsidas') || q.includes('तुलसीदास')) {
        return "गोस्वामी तुलसीदास सगुण रामभक्ति शाखा के महान कवि थे। उन्होंने अवधी भाषा में महाकाव्य 'रामचरितमानस' की रचना की।";
      }
      if (q.includes('premchand') || q.includes('प्रेमचंद')) {
        return "मुंशी प्रेमचंद को हिंदी उपन्यास का सम्राट कहा जाता है। उनके प्रमुख उपन्यास 'गोदान', 'गबन', 'निर्मला' और 'सेवा सदन' हैं।";
      }
      if (q.includes('chhayavaad') || q.includes('छायावाद')) {
        return "छायावाद हिंदी साहित्य का स्वर्णिम युग है (1918-1936)। इसके चार प्रमुख स्तंभ हैं: जयशंकर प्रसाद (कामायनी), सूर्यकांत त्रिपाठी 'निराला', सुमित्रानंदन पंत और महादेवी वर्मा।";
      }
      return "हिंदी साहित्य चार कालखंडों में विभाजित है: आदिकाल (वीरगाथा काल), भक्तिकाल (कबीर, तुलसी, सूर), रीतिकाल (बिहारी), एवं आधुनिक काल (भारतेन्दु, छायावाद, प्रगतिवाद, प्रेमचंद, दिनकर)।";
    }

    // 2. English Literature Core
    if (q.includes('english literature') || q.includes('shakespeare') || q.includes('wordsworth') || q.includes('keats') || q.includes('shelley') || q.includes('chaucer') || q.includes('dickens') || q.includes('romanticism') || q.includes('sonnet') || q.includes('hamlet')) {
      if (q.includes('shakespeare')) {
        return "William Shakespeare (1564–1616) is widely regarded as the greatest dramatist in English literature, famous for tragedies like Hamlet, Macbeth, Othello, King Lear, and 154 Sonnets written in iambic pentameter.";
      }
      if (q.includes('wordsworth') || q.includes('romanticism')) {
        return "Romanticism (1798–1837) emphasized emotion, nature, and individualism, launched by William Wordsworth and S.T. Coleridge's 'Lyrical Ballads', alongside Keats, Shelley, and Byron.";
      }
      return "English Literature evolves from Old English Beowulf and Chaucer's Canterbury Tales, to Renaissance Shakespeare, Metaphysical Donne, 19th-Century Romanticism, Victorian Dickens, and Modernist T.S. Eliot.";
    }

    // 3. Spoken Languages & Translation
    if (q.includes('hindi') || q.includes('नमस्ते') || q.includes('हिंदी')) {
      return "नमस्ते! मैं आपका स्वायत्त एआई सहायक FATE (फेट) हूँ। मैं प्रोग्रामिंग, साहित्य, विज्ञान और गणित में आपकी सहायता कर सकता हूँ।";
    }

    if (q.includes('spanish') || q.includes('hola')) {
      return "¡Hola! Soy FATE, tu asistente autónomo de inteligencia artificial. Puedo ayudarte con literatura, programación y ciencia.";
    }

    // 4. Programming Languages Intelligence
    if (q.includes('python') || q.includes('rust') || q.includes('cpp') || q.includes('c++') || q.includes('java') || q.includes('javascript') || q.includes('sql') || q.includes('golang')) {
      return "FATE Polyglot Code Engine: I support code generation, syntax analysis, and debugging across Python, Rust, C++, Java, JavaScript/TypeScript, Go, SQL, and Bash.";
    }

    // 5. Quantum Physics Core
    if (q.includes('quantum') || q.includes('schrodinger') || q.includes('heisenberg') || q.includes('wavefunction') || q.includes('photon') || q.includes('qubit') || q.includes('superposition') || q.includes('entanglement')) {
      return "Quantum Mechanics describes nature at atomic scales via wavefunctions satisfying Schrödinger's equation i ħ (∂Ψ/∂t) = Ĥ Ψ and Heisenberg's Uncertainty Principle.";
    }

    // 6. Identity & Persona
    if (q.includes('who are you') || q.includes('your name') || q.includes('what are you') || q.includes('identify')) {
      return "I am FATE — Futuristic Autonomous Tech Assistant. Equipped with English & Hindi Literature, Quantum Physics, Polyglot Code, and Science engines.";
    }

    // 7. Greetings & Courtesy
    if (q === 'hi' || q === 'hello' || q.includes('hey fate') || q.includes('hello fate') || q === 'yo') {
      return "Greetings, Administrator. All core literature, polyglot, and science subsystems are operational.";
    }

    // 8. General Knowledge Query Fallback
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
          { role: 'system', content: 'You are FATE (Futuristic Autonomous Tech Assistant), an expert in English Literature (Shakespeare, Romanticism, Modernism) and Hindi Literature (हिंदी साहित्य: कबीर, तुलसी, प्रेमचंद, छायावाद, दिनकर). Provide detailed literary analysis.' },
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
        contents: [{ parts: [{ text: `You are FATE (Futuristic Autonomous Tech Assistant), an expert in English Literature and Hindi Literature (हिंदी साहित्य). Provide a detailed literary analysis for: ${prompt}` }] }]
      })
    });
    const data = await res.json();
    return data.candidates[0].content.parts[0].text.trim();
  }
}
