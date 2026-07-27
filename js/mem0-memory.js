/* ==========================================================================
   FATE Mem0 Long-Term Persistent Memory Engine (Multi-Date Schedule Store)
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
          name: 'Boss',
          role: 'Lead Developer',
          preferredLanguage: 'Hinglish',
          preferredTheme: 'default',
          macVoice: 'Lekha'
        },
        facts: [],
        topicsDiscussed: [],
        sessionHistory: [],
        schedules: {}
      };
    } catch (e) {
      return {
        userProfile: { name: 'Boss' },
        facts: [],
        topicsDiscussed: [],
        sessionHistory: [],
        schedules: {}
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

  formatDateKey(dateOffsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() + dateOffsetDays);
    return d.toISOString().split('T')[0];
  }

  setSchedule(scheduleText, dateOffsetDays = 0) {
    if (!scheduleText) return;
    const dateKey = this.formatDateKey(dateOffsetDays);
    if (!this.memory.schedules) this.memory.schedules = {};
    this.memory.schedules[dateKey] = scheduleText.trim();
    this.saveMemory();
    return dateKey;
  }

  getSchedule(dateOffsetDays = 0) {
    const dateKey = this.formatDateKey(dateOffsetDays);
    if (!this.memory.schedules || !this.memory.schedules[dateKey]) {
      return null;
    }
    return this.memory.schedules[dateKey];
  }

  clearSchedule(dateOffsetDays = 0) {
    const dateKey = this.formatDateKey(dateOffsetDays);
    if (this.memory.schedules && this.memory.schedules[dateKey]) {
      delete this.memory.schedules[dateKey];
      this.saveMemory();
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
