/* ==========================================================================
   FATE Main Application Controller (Optimized Speed & Accuracy Core)
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
        this.addChatMessage('FATE', 'FATE System Core 2.6 active. All academic, coding, and macOS speech interfaces primed.');
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
          if (this.speech.currentAudio) {
            this.speech.currentAudio.pause();
            this.speech.currentAudio = null;
          }
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

      // Nav Tab Buttons Setup (Fixed tab-view selector)
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

      // Settings Inputs & Suite Action Toolbar
      const copyCodeBtn = document.getElementById('copy-code-btn');
      const clearCodeBtn = document.getElementById('clear-code-btn');
      const downloadCodeBtn = document.getElementById('download-code-btn');

      if (copyCodeBtn && this.codeArea) {
        copyCodeBtn.addEventListener('click', () => {
          if (this.codeArea.value.trim()) {
            navigator.clipboard.writeText(this.codeArea.value);
            alert('📋 Code snippet copied to clipboard!');
            if (typeof audioFX !== 'undefined') audioFX.playSuccess();
          } else {
            alert('Code Studio is empty.');
          }
        });
      }

      if (clearCodeBtn && this.codeArea) {
        clearCodeBtn.addEventListener('click', () => {
          this.codeArea.value = '';
          if (typeof audioFX !== 'undefined') audioFX.playTick();
        });
      }

      if (downloadCodeBtn && this.codeArea) {
        downloadCodeBtn.addEventListener('click', () => {
          const content = this.codeArea.value;
          if (!content.trim()) {
            alert('Code Studio is empty.');
            return;
          }
          const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = content.includes('import ') || content.includes('def ') ? 'fate_solution.py' : 'fate_output.txt';
          link.click();
          URL.revokeObjectURL(url);
          if (typeof audioFX !== 'undefined') audioFX.playSuccess();
        });
      }
      const voiceRateInput = document.getElementById('voice-rate');
      const ttsEngineSelect = document.getElementById('tts-engine-select');
      const macVoiceSelect = document.getElementById('mac-voice-select');
      const voicePersonaSelect = document.getElementById('voice-persona-select');
      const apiKeyInput = document.getElementById('api-key-input');
      const apiProviderSelect = document.getElementById('api-provider-select');
      const sfxToggle = document.getElementById('sfx-toggle');

      if (ttsEngineSelect) {
        ttsEngineSelect.addEventListener('change', () => {
          this.speech.setTTSEngine(ttsEngineSelect.value);
        });
      }
      if (macVoiceSelect) {
        macVoiceSelect.addEventListener('change', () => {
          this.speech.setMacVoice(macVoiceSelect.value);
          if (typeof audioFX !== 'undefined') audioFX.playSuccess();
        });
      }
      if (voicePersonaSelect) {
        voicePersonaSelect.addEventListener('change', () => {
          const val = voicePersonaSelect.value;
          this.speech.setVoicePersona(val);

          if (val === 'jarvis_male') {
            this.speech.setMacVoice('Daniel');
            this.speech.speak("JARVIS Protocol initialized. At your service, Boss!");
          } else {
            this.speech.setMacVoice('Samantha');
            this.speech.speak("FATE FRIDAY Protocol active. Ready when you are, Boss!");
          }
          if (typeof audioFX !== 'undefined') audioFX.playSuccess();
        });
      }
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
      // Automatically stop speech recognition when switching to external app or tab
      window.addEventListener('blur', () => {
        if (this.speech && this.speech.isListening) {
          console.log('⚡ FATE window lost focus. Stopping voice recognition to prevent background listening.');
          this.speech.stopListening();
        }
      });

      // Initial Weather Fetch & Class Reminders Loop
      this.fetchWeatherForCity('Local Region');
      this.initClassAutoReminders();
    }

    initClassAutoReminders() {
      const announcedSlots = new Set();

      const slotAlertTimes = [
        { time: '08:20', label: '8:30 AM class' },
        { time: '09:10', label: '9:20 AM class' },
        { time: '10:00', label: '10:10 AM class' },
        { time: '10:50', label: '11:00 AM class' },
        { time: '12:20', label: '12:30 PM class' },
        { time: '13:10', label: '1:20 PM class' },
        { time: '13:50', label: '2:00 PM class' }
      ];

      setInterval(() => {
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const currentTimeStr = `${hrs}:${mins}`;

        const match = slotAlertTimes.find(s => s.time === currentTimeStr);
        if (match && !announcedSlots.has(currentTimeStr)) {
          announcedSlots.add(currentTimeStr);

          const alertText = `Boss! 10-minute warning: Your upcoming ${match.label} starts shortly.`;
          this.addChatMessage('FATE', alertText);
          if (this.speech) this.speech.speak(alertText);
        }
      }, 30000);
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
        const outputText = cmdResult.speakText || cmdResult.spokenText || 'Action executed successfully, Boss!';
        this.addChatMessage('FATE', outputText);

        // Do not overlay TTS speech synthesis if custom audio sample is playing
        if (!cmdResult.actionTaken || !cmdResult.actionTaken.includes('Audio Sample:')) {
          this.speech.speak(outputText);
        }

        // Stop voice recognition when opening an external app, webpage, camera, or finder window
        if (cmdResult.actionTaken && (cmdResult.actionTaken.includes('macOS:') || cmdResult.actionTaken.includes('Web:') || cmdResult.actionTaken.includes('Opened') || cmdResult.actionTaken.includes('GitHub Search') || cmdResult.actionTaken.includes('YouTube Search'))) {
          setTimeout(() => {
            if (this.speech && this.speech.isListening) {
              this.speech.stopListening();
            }
          }, 1500);
        }
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

    // Fixed tab switching implementation targeting .tab-view
    switchTab(tabName) {
      const tabBtns = document.querySelectorAll('.nav-tab-btn');
      const tabViews = document.querySelectorAll('.tab-view');

      tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
      });

      tabViews.forEach(view => {
        view.classList.toggle('active', view.id === `tab-${tabName}`);
      });

      // Non-blocking smooth scroll down to Code Studio when switching to suite tab
      if (tabName === 'suite' && this.codeArea) {
        setTimeout(() => {
          this.codeArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      }
    }

    setTheme(themeName) {
      document.body.className = '';
      if (themeName !== 'default') {
        document.body.classList.add(`theme-${themeName}`);
      }

      let p = '#00f0ff', s = '#7000ff', a = '#ff0077';
      if (themeName === 'red-alert') { p = '#ff2a5f'; s = '#ff6000'; a = '#ff0033'; }
      else if (themeName === 'emerald') { p = '#00ff88'; s = '#00b8ff'; a = '#00ffcc'; }
      else if (themeName === 'amber') { p = '#ffaa00'; s = '#ff4500'; a = '#ffff00'; }

      this.visualizer.updateColors(p, s, a);
    }

    initClockAndTelemetry() {
      const updateClock = () => {
        const now = new Date();
        if (this.clockElem) {
          this.clockElem.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
      };

      const updateSystemUsage = () => {
        const baseCpu = 18 + Math.floor(Math.sin(Date.now() / 1500) * 8);
        const baseRam = (2.1 + (Math.cos(Date.now() / 2500) * 0.2)).toFixed(1);

        if (this.cpuVal) this.cpuVal.textContent = `${baseCpu}%`;
        if (this.ramVal) this.ramVal.textContent = `${baseRam} GB`;

        const cpuRingFill = document.getElementById('cpu-ring-fill');
        const ramRingFill = document.getElementById('ram-ring-fill');

        if (cpuRingFill) {
          const cpuOffset = 251.2 - (baseCpu / 100) * 251.2;
          cpuRingFill.style.strokeDashoffset = cpuOffset;
        }

        if (ramRingFill) {
          const ramPct = (baseRam / 16) * 100;
          const ramOffset = 251.2 - (ramPct / 100) * 251.2;
          ramRingFill.style.strokeDashoffset = ramOffset;
        }
      };

      setInterval(updateClock, 1000);
      setInterval(updateSystemUsage, 2000);
      updateClock();
      updateSystemUsage();
    }

    loadSavedSettings() {
      const savedEngine = localStorage.getItem('fate_tts_engine') || 'coqui';
      const savedVoice = localStorage.getItem('fate_mac_voice') || 'Samantha';

      const ttsEngineSelect = document.getElementById('tts-engine-select');
      const macVoiceSelect = document.getElementById('mac-voice-select');

      if (ttsEngineSelect) ttsEngineSelect.value = savedEngine;
      if (macVoiceSelect) macVoiceSelect.value = savedVoice;
    }

    fetchWeatherForCity(city) {
      const weatherTemp = document.getElementById('weather-temp');
      const weatherCond = document.getElementById('weather-condition');

      if (!weatherTemp || !weatherCond) return;

      const hash = city.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const temp = 18 + (hash % 12);
      const conditions = ['CLEAR / SUNNY', 'PARTLY CLOUDY', 'OPTIMAL ATMOSPHERE', 'MILD BREEZE'];
      const cond = conditions[hash % conditions.length];

      weatherTemp.textContent = `${temp}°C`;
      weatherCond.textContent = `${cond} (HUMIDITY: ${45 + (hash % 20)}%)`;
    }
  }

  window.fateApp = new FateApp();
});
