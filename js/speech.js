/* ==========================================================================
   FATE Speech Engine - Ultra-Reliable Multilingual Native Speech Subsystem
   ========================================================================== */

class FateSpeechEngine {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis || null;

    this.isListening = false;
    this.isSpeaking = false;
    this.wasListeningBeforeSpeaking = false;

    this.ttsEngineMode = localStorage.getItem('fate_tts_engine') || 'coqui';
    this.macVoice = localStorage.getItem('fate_mac_voice') || 'Lekha';

    this.onResultCallback = null;
    this.onStateChangeCallback = null;

    this.pitch = 1.0;
    this.rate = 1.0;
    this.selectedVoice = null;
    this.currentAudio = null;
    this.lastSpokenText = '';

    this.initRecognition();
    this.loadVoices();
  }

  setTTSEngine(mode) {
    this.ttsEngineMode = mode;
    localStorage.setItem('fate_tts_engine', mode);
  }

  setMacVoice(voiceName) {
    this.macVoice = voiceName;
    localStorage.setItem('fate_mac_voice', voiceName);
  }

  // Play custom recorded M4A/MP3/WAV voice samples when available
  playCustomAudioSample(sampleName, textFallback, callback) {
    const m4aPath = `/audio_samples/${sampleName}.m4a`;
    const mp3Path = `/audio_samples/${sampleName}.mp3`;
    const wavPath = `/audio_samples/${sampleName}.wav`;

    const tryPlayFile = (filePath, nextFallback) => {
      const audio = new Audio();
      audio.src = filePath;

      audio.oncanplaythrough = () => {
        if (this.currentAudio) this.currentAudio.pause();
        this.currentAudio = audio;
        audio.play().then(() => {
          audio.onended = () => {
            this.currentAudio = null;
            if (callback) callback();
          };
        }).catch(() => nextFallback());
      };

      audio.onerror = () => nextFallback();
    };

    // Try .m4a -> .mp3 -> .wav -> Native Speech fallback
    tryPlayFile(m4aPath, () => {
      tryPlayFile(mp3Path, () => {
        tryPlayFile(wavPath, () => {
          this.speak(textFallback, callback);
        });
      });
    });
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onStateChangeCallback) this.onStateChangeCallback('listening');
      };

      this.recognition.onresult = (event) => {
        if (this.isSpeaking) return;

        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const trimmedFinal = finalTranscript.trim();
        const trimmedInterim = interimTranscript.trim();

        if (trimmedFinal && !this.isEcho(trimmedFinal)) {
          if (this.onResultCallback) this.onResultCallback(trimmedFinal, true);
        } else if (trimmedInterim && !this.isEcho(trimmedInterim)) {
          if (this.onResultCallback) this.onResultCallback(trimmedInterim, false);
        }
      };

      this.recognition.onerror = (event) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('FATE Speech Recognition Warning:', event.error);
          this.isListening = false;
          if (this.onStateChangeCallback) this.onStateChangeCallback('idle');
        }
      };

      this.recognition.onend = () => {
        if (this.isListening && !this.isSpeaking) {
          try {
            this.recognition.start();
          } catch (e) {
            this.isListening = false;
            if (this.onStateChangeCallback) this.onStateChangeCallback('idle');
          }
        } else if (!this.isSpeaking) {
          if (this.onStateChangeCallback) this.onStateChangeCallback('idle');
        }
      };
    }
  }

  isEcho(text) {
    if (!this.lastSpokenText) return false;
    const cleanInput = text.toLowerCase().trim();
    const cleanSpoken = this.lastSpokenText.toLowerCase().trim();

    if (cleanSpoken.includes(cleanInput) || cleanInput.includes(cleanSpoken)) {
      console.log('🔇 Suppressed Self-Echo Input:', text);
      return true;
    }
    return false;
  }

  loadVoices() {
    if (!this.synthesis) return;
    const populateVoices = () => {
      const voices = this.synthesis.getVoices();
      this.selectedVoice = voices.find(v => v.name.includes('Lekha') || v.name.includes('Samantha') || v.name.includes('Alex') || v.name.includes('Daniel') || v.lang.startsWith('hi')) || voices[0];
    };

    populateVoices();
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = populateVoices;
    }
  }

  startListening() {
    if (!this.recognition) return false;
    this.isListening = true;
    try {
      this.recognition.start();
      if (typeof audioFX !== 'undefined') audioFX.playListenPing();
      return true;
    } catch (e) {
      return false;
    }
  }

  stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    if (this.onStateChangeCallback) this.onStateChangeCallback('idle');
  }

  pauseListeningForSpeech() {
    this.wasListeningBeforeSpeaking = this.isListening;
    if (this.recognition && this.isListening) {
      try {
        this.recognition.abort();
      } catch (e) {}
    }
  }

  resumeListeningAfterSpeech() {
    if (this.wasListeningBeforeSpeaking && this.recognition) {
      setTimeout(() => {
        try {
          this.isListening = true;
          this.recognition.start();
          if (this.onStateChangeCallback) this.onStateChangeCallback('listening');
        } catch (e) {}
      }, 400);
    } else {
      if (this.onStateChangeCallback) this.onStateChangeCallback('idle');
    }
  }

  speak(text, onComplete) {
    if (!text) {
      if (onComplete) onComplete();
      return;
    }

    // Strip out long code snippets or markdown for audio speech synthesis so audio stays concise & clear
    let speakableText = text.replace(/```[\s\S]*?```/g, 'Code loaded into FATE Suite Tools.').trim();
    if (speakableText.length > 250) {
      speakableText = speakableText.substring(0, 240) + '... Full response displayed on HUD.';
    }

    this.lastSpokenText = speakableText;
    this.pauseListeningForSpeech();

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.synthesis) {
      this.synthesis.cancel();
    }

    // Auto-detect Hindi text and route to native macOS Lekha voice
    let activeVoice = this.macVoice;
    if (/[\u0900-\u097F]/.test(speakableText)) {
      activeVoice = 'Lekha';
    }

    // Native macOS Speech Engine Proxy (/api/tts)
    if (this.ttsEngineMode === 'coqui') {
      const ttsUrl = `/api/tts?voice=${encodeURIComponent(activeVoice)}&text=${encodeURIComponent(speakableText)}`;
      const audio = new Audio(ttsUrl);
      this.currentAudio = audio;

      audio.onplay = () => {
        this.isSpeaking = true;
        if (this.onStateChangeCallback) this.onStateChangeCallback('speaking');
      };

      audio.onended = () => {
        this.isSpeaking = false;
        this.currentAudio = null;
        this.resumeListeningAfterSpeech();
        if (onComplete) onComplete();
      };

      audio.onerror = (e) => {
        console.warn('macOS Native Speech endpoint error, falling back to WebSpeech:', e);
        this.speakWebSpeech(speakableText, onComplete);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio Autoplay policy caught, trying WebSpeech fallback:', err);
          this.speakWebSpeech(speakableText, onComplete);
        });
      }

      return;
    }

    this.speakWebSpeech(speakableText, onComplete);
  }

  speakWebSpeech(text, onComplete) {
    if (!this.synthesis) {
      this.resumeListeningAfterSpeech();
      if (onComplete) onComplete();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) utterance.voice = this.selectedVoice;
    utterance.pitch = this.pitch;
    utterance.rate = this.rate;

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (this.onStateChangeCallback) this.onStateChangeCallback('speaking');
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.resumeListeningAfterSpeech();
      if (onComplete) onComplete();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.resumeListeningAfterSpeech();
      if (onComplete) onComplete();
    };

    this.synthesis.speak(utterance);
  }
}
