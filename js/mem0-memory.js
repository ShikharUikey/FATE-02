/* ==========================================================================
   FATE Mem0 Long-Term Persistent Memory Engine (Inspired by mem0ai/mem0)
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
    if (!this.memory.facts.includes(factString)) {
      this.memory.facts.push({
        text: factString,
        timestamp: new Date().toISOString()
      });
      if (this.memory.facts.length > 50) this.memory.facts.shift();
      this.saveMemory();
    }
  }

  rememberTopic(topic) {
    if (!topic) return;
    if (!this.memory.topicsDiscussed.includes(topic)) {
      this.memory.topicsDiscussed.push(topic);
      if (this.memory.topicsDiscussed.length > 30) this.memory.topicsDiscussed.shift();
      this.saveMemory();
    }
  }

  getMemorySummary() {
    const factsCount = this.memory.facts.length;
    const topicsCount = this.memory.topicsDiscussed.length;
    return `Mem0 Persistent Memory Active: ${factsCount} facts recalled, ${topicsCount} topics indexed.`;
  }
}

window.fateMem0 = new FateMem0Memory();
