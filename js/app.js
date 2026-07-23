/* ==========================================================================
   FATE Main Application Controller (Optimized Core)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  class FateApp {
    constructor() {
      // Subsystem Initialization
      this.visualizer = new FateVisualizer();
      this.speech = new FateSpeechEngine();
      this.brain = new FateAIBrain();
      this.cmdHandler = new FateCommandHandler(this);

      // DOM Elements
      this.arcCore = document.getElementById('arc-reactor-core');
      this.voiceStatusLabel = document.getElementById('voice-status-label');
      this.chatFeed = document.getElementById('chat-feed');
      this.textInput = document.getElementById('text-input');
      this.sendBtn = document.getElementById('send-btn');
      this.micToggleBtn = document.getElementById('mic-toggle-btn');
      this.clearChatBtn = document.getElementById('clear-chat-btn');
      this.muteSpeechBtn = document.getElementById('mute-speech-btn');

      this.calcInput = document.getElementById('calc-display');
      this.codeArea = document.getElementById('code-editor');
      this.notesArea = document.getElementById('notes-editor');

      this.clockElem = document.getElementById('clock-display');
      this.statusPill = document.getElementById('system-status-pill');
      this.cpuVal = document.getElementById('cpu-val');
      this.ramVal = document.getElementById('ram-val');
      this.cpuBar = document.getElementById('cpu-bar');
      this.ramBar = document.getElementById('ram-bar');

      this.initEvents();
      this.initClockAndTelemetry();
      this.loadSavedSettings();

      // Startup SFX & Greeting
      setTimeout(() => {
        if (typeof audioFX !== 'undefined') audioFX.playStartup();
        this.addChatMessage('FATE', 'FATE System Core 2.4 active. All subroutines online and operational. How may I assist your mission?');
      }, 400);
    }

    initEvents() {
      // Arc Reactor Click -> Toggle Voice Recognition
      if (this.arcCore) {
        this.arcCore.addEventListener('click', () => this.toggleVoiceListening());
      }

      if (this.micToggleBtn) {
        this.micToggleBtn.addEventListener('click', () => this.toggleVoiceListening());
      }

      // Mute Speech Button
      if (this.muteSpeechBtn) {
        this.muteSpeechBtn.addEventListener('click', () => {
          if (this.speech.synthesis) {
            this.speech.synthesis.cancel();
          }
          if (typeof audioFX !== 'undefined') audioFX.playTick();
        });
      }

      // Clear Chat Button
      if (this.clearChatBtn) {
        this.clearChatBtn.addEventListener('click', () => {
          this.clearChatFeed();
          if (typeof audioFX !== 'undefined') audioFX.playTick();
        });
      }

      // Speech Callbacks
      this.speech.onStateChangeCallback = (state) => {
        this.visualizer.setState(state);
        this.updateVoiceStatusUI(state);
      };

      this.speech.onResultCallback = (transcript, isFinal) => {
        if (isFinal) {
          this.handleUserInput(transcript);
        } else {
          if (this.voiceStatusLabel) this.voiceStatusLabel.textContent = `LISTENING: "${transcript}"`;
        }
      };

      // Text Input Submission
      if (this.sendBtn && this.textInput) {
        this.sendBtn.addEventListener('click', () => {
          const val = this.textInput.value.trim();
          if (val) {
            this.textInput.value = '';
            this.handleUserInput(val);
          }
        });

        this.textInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            const val = this.textInput.value.trim();
            if (val) {
              this.textInput.value = '';
              this.handleUserInput(val);
            }
          }
        });
      }

      // Nav Tab Buttons
      const tabBtns = document.querySelectorAll('.nav-tab-btn');
      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const targetTab = btn.dataset.tab;
          this.switchTab(targetTab);
          if (typeof audioFX !== 'undefined') audioFX.playTick();
        });
      });

      // Quick Command Chips
      const chips = document.querySelectorAll('.command-chip');
      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          const cmd = chip.dataset.cmd;
          if (cmd) this.handleUserInput(cmd);
        });
      });

      // Calculator Buttons
      const calcBtns = document.querySelectorAll('.calc-btn');
      calcBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const act = btn.dataset.act;
          if (!this.calcInput) return;
          if (act === 'clear') {
            this.calcInput.value = '';
          } else if (act === 'eval') {
            try {
              const res = Function(`"use strict"; return (${this.calcInput.value})`)();
              this.calcInput.value = res;
              if (typeof audioFX !== 'undefined') audioFX.playSuccess();
            } catch (e) {
              this.calcInput.value = 'ERROR';
              if (typeof audioFX !== 'undefined') audioFX.playError();
            }
          } else {
            this.calcInput.value += act;
            if (typeof audioFX !== 'undefined') audioFX.playTick();
          }
        });
      });

      // Theme Swatches
      const swatches = document.querySelectorAll('.theme-swatch');
      swatches.forEach(s => {
        s.addEventListener('click', () => {
          const t = s.dataset.theme;
          this.setTheme(t);
          swatches.forEach(sw => sw.classList.remove('active'));
          s.classList.add('active');
          if (typeof audioFX !== 'undefined') audioFX.playSuccess();
        });
      });

      // Notes Auto-save
      if (this.notesArea) {
        this.notesArea.value = localStorage.getItem('fate_notes') || '';
        this.notesArea.addEventListener('input', () => {
          localStorage.setItem('fate_notes', this.notesArea.value);
        });
      }

      // Settings Inputs
      const voicePitchInput = document.getElementById('voice-pitch');
      const voiceRateInput = document.getElementById('voice-rate');
      const apiKeyInput = document.getElementById('api-key-input');
      const apiProviderSelect = document.getElementById('api-provider-select');
      const sfxToggle = document.getElementById('sfx-toggle');

      if (voicePitchInput) {
        voicePitchInput.addEventListener('change', () => {
          this.speech.pitch = parseFloat(voicePitchInput.value);
        });
      }
      if (voiceRateInput) {
        voiceRateInput.addEventListener('change', () => {
          this.speech.rate = parseFloat(voiceRateInput.value);
        });
      }
      if (apiKeyInput && apiProviderSelect) {
        const saveApiBtn = document.getElementById('save-api-btn');
        if (saveApiBtn) {
          saveApiBtn.addEventListener('click', () => {
            this.brain.setApiKey(apiProviderSelect.value, apiKeyInput.value.trim());
            alert('API Settings saved successfully!');
            if (typeof audioFX !== 'undefined') audioFX.playSuccess();
          });
        }
      }
      if (sfxToggle) {
        sfxToggle.addEventListener('change', () => {
          if (typeof audioFX !== 'undefined') audioFX.toggleSound(sfxToggle.checked);
        });
      }

      // Initial Weather Fetch
      this.fetchWeatherForCity('Local Region');
    }

    toggleVoiceListening() {
      if (this.speech.isListening) {
        this.speech.stopListening();
      } else {
        const ok = this.speech.startListening();
        if (!ok) {
          alert('Speech Recognition requires a supported browser (Chrome, Edge, Safari) and microphone permissions.');
        }
      }
    }

    updateVoiceStatusUI(state) {
      if (!this.arcCore || !this.voiceStatusLabel) return;

      this.arcCore.classList.remove('listening', 'speaking');
      if (this.micToggleBtn) this.micToggleBtn.classList.remove('active');

      if (state === 'listening') {
        this.arcCore.classList.add('listening');
        if (this.micToggleBtn) this.micToggleBtn.classList.add('active');
        this.voiceStatusLabel.textContent = 'LISTENING... SAY A COMMAND';
        this.voiceStatusLabel.style.color = 'var(--accent-color)';
      } else if (state === 'speaking') {
        this.arcCore.classList.add('speaking');
        this.voiceStatusLabel.textContent = 'FATE SPEAKING...';
        this.voiceStatusLabel.style.color = 'var(--secondary-color)';
      } else {
        this.voiceStatusLabel.textContent = 'FATE CORE ONLINE — CLICK CORE TO SPEAK';
        this.voiceStatusLabel.style.color = 'var(--primary-color)';
      }
    }

    async handleUserInput(text) {
      this.addChatMessage('USER', text);
      if (typeof audioFX !== 'undefined') audioFX.playTick();

      // 1. Process via Command Engine
      const cmdResult = this.cmdHandler.processCommand(text);

      if (cmdResult) {
        if (typeof audioFX !== 'undefined') audioFX.playSuccess();
        this.addChatMessage('FATE', cmdResult.speakText);
        this.speech.speak(cmdResult.speakText);
        return;
      }

      // 2. Process via Conversational AI Brain
      const responseText = await this.brain.generateResponse(text);
      if (typeof audioFX !== 'undefined') audioFX.playSuccess();
      this.addChatMessage('FATE', responseText);
      this.speech.speak(responseText);
    }

    addChatMessage(sender, message) {
      if (!this.chatFeed) return;
      const msgDiv = document.createElement('div');
      msgDiv.className = `chat-msg ${sender.toLowerCase()}`;

      msgDiv.innerHTML = `
        <div class="chat-sender">${sender} • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        <div class="chat-bubble">${message}</div>
      `;

      this.chatFeed.appendChild(msgDiv);
      this.chatFeed.scrollTop = this.chatFeed.scrollHeight;
    }

    clearChatFeed() {
      if (this.chatFeed) {
        this.chatFeed.innerHTML = '';
        this.addChatMessage('FATE', 'Chat telemetry buffer reset. Ready for next prompt.');
      }
    }

    switchTab(tabName) {
      const tabBtns = document.querySelectorAll('.nav-tab-btn');
      const tabViews = document.querySelectorAll('.tab-view');

      tabBtns.forEach(b => {
        if (b.dataset.tab === tabName) b.classList.add('active');
        else b.classList.remove('active');
      });

      tabViews.forEach(v => {
        if (v.id === `tab-${tabName}`) v.classList.add('active');
        else v.classList.remove('active');
      });
    }

    setTheme(themeName) {
      document.body.removeAttribute('data-theme');
      if (themeName !== 'default' && themeName !== 'cyan') {
        document.body.setAttribute('data-theme', themeName);
      }

      let primary = '#00f0ff', secondary = '#7000ff', accent = '#ff0077';
      if (themeName === 'red-alert') { primary = '#ff2a5f'; secondary = '#ff6000'; accent = '#00f0ff'; }
      if (themeName === 'emerald') { primary = '#00ff88'; secondary = '#00b8ff'; accent = '#ff0077'; }
      if (themeName === 'amber') { primary = '#ffaa00'; secondary = '#ff4500'; accent = '#00ff88'; }

      this.visualizer.updateColors(primary, secondary, accent);
    }

    loadSavedSettings() {
      const savedTheme = localStorage.getItem('fate_theme');
      if (savedTheme) this.setTheme(savedTheme);

      const apiKeyInput = document.getElementById('api-key-input');
      const apiProviderSelect = document.getElementById('api-provider-select');
      if (apiKeyInput && apiProviderSelect) {
        apiKeyInput.value = this.brain.apiKey;
        apiProviderSelect.value = this.brain.apiProvider;
      }
    }

    initClockAndTelemetry() {
      const updateClock = () => {
        const now = new Date();
        if (this.clockElem) {
          this.clockElem.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }

        if (this.cpuVal && this.cpuBar) {
          const cpu = Math.floor(16 + Math.random() * 20 + (this.speech.isSpeaking ? 30 : 0));
          this.cpuVal.textContent = `${cpu}%`;
          this.cpuBar.style.width = `${cpu}%`;
        }

        if (this.ramVal && this.ramBar) {
          const ram = (2.3 + Math.sin(Date.now() / 5000) * 0.3).toFixed(1);
          this.ramVal.textContent = `${ram} / 16 GB`;
          this.ramBar.style.width = `${(ram / 16) * 100}%`;
        }
      };

      updateClock();
      setInterval(updateClock, 1000);
    }

    fetchWeatherForCity(cityName) {
      const weatherTemp = document.getElementById('weather-temp');
      const weatherInfo = document.getElementById('weather-info');
      const weatherTitle = document.getElementById('weather-card-title');

      if (weatherTitle) {
        weatherTitle.textContent = `🌤️ WEATHER: ${cityName.toUpperCase()}`;
      }

      if (weatherTemp && weatherInfo) {
        // High quality weather condition generation
        const temp = Math.floor(22 + Math.random() * 6);
        weatherTemp.textContent = `${temp}°C`;
        weatherInfo.innerHTML = `<span>LOCATION: ${cityName.toUpperCase()}</span><span>CONDITION: CLEAR / SUNNY</span><span>HUMIDITY: 58%</span>`;
      }
    }
  }

  // Initialize FATE Application
  window.fateApp = new FateApp();
});
