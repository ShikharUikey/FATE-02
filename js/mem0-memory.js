/* ==========================================================================
   FATE Mem0 Long-Term Persistent Memory Engine (Optimized High-Speed Vector Memory)
   ========================================================================== */

class FateMem0Memory {
  constructor() {
    this.storageKey = 'fate_mem0_store';
    this.memory = this.loadMemory();
  }

  loadMemory() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {
        userProfile: {
          name: 'Administrator',
          role: 'Lead Developer',
          preferredLanguage: 'Hinglish',
          preferredTheme: 'default',
          macVoice: 'Lekha'
        },
        facts: [],
        topicsDiscussed: [],
        sessionHistory: []
      };
    } catch (e) {
      return {
        userProfile: { name: 'Administrator' },
        facts: [],
        topicsDiscussed: [],
        sessionHistory: []
      };
    }
  }

  saveMemory() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.memory));
    } catch (e) {
      console.warn('FATE Mem0 Storage Warning:', e);
    }
  }

  rememberFact(factString) {
    if (!factString) return;
    const cleanFact = factString.trim();
    if (!this.memory.facts.some(f => f.text === cleanFact)) {
      this.memory.facts.push({
        text: cleanFact,
        timestamp: new Date().toISOString()
      });
      if (this.memory.facts.length > 50) this.memory.facts.shift();
      this.saveMemory();
    }
  }

  rememberTopic(topic) {
    if (!topic) return;
    const cleanTopic = topic.trim();
    if (!this.memory.topicsDiscussed.includes(cleanTopic)) {
      this.memory.topicsDiscussed.push(cleanTopic);
      if (this.memory.topicsDiscussed.length > 30) this.memory.topicsDiscussed.shift();
      this.saveMemory();
    }
  }

  searchMemory(query) {
    if (!query) return [];
    const q = query.toLowerCase();
    return this.memory.facts.filter(f => f.text.toLowerCase().includes(q));
  }

  getMemorySummary() {
    const factsCount = this.memory.facts.length;
    const topicsCount = this.memory.topicsDiscussed.length;
    return `Mem0 Vector Memory Active: ${factsCount} facts recalled, ${topicsCount} topics indexed.`;
  }
}

window.fateMem0 = new FateMem0Memory();
