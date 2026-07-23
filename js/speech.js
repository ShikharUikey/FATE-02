/* ==========================================================================
   FATE Speech Recognition & Voice Synthesis Engine (Coqui TTS Enabled)
   ========================================================================== */

class FateSpeechEngine {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis || null;

    this.isListening = false;
    this.isSpeaking = false;
    this.ttsEngineMode = localStorage.getItem('fate_tts_engine') || 'coqui'; // 'coqui' or 'webspeech'

    this.onResultCallback = null;
    this.onStateChangeCallback = null;

    this.pitch = 1.0;
    this.rate = 1.0;
    this.selectedVoice = null;
    this.currentAudio = null;

    this.initRecognition();
    this.loadVoices();
  }

  setTTSEngine(mode) {
    this.ttsEngineMode = mode;
    localStorage.setItem('fate_tts_engine', mode);
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
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript && this.onResultCallback) {
          this.onResultCallback(finalTranscript.trim(), true);
        } else if (interimTranscript && this.onResultCallback) {
          this.onResultCallback(interimTranscript.trim(), false);
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('FATE Speech Recognition Error:', event.error);
        if (event.error !== 'no-speech') {
          this.isListening = false;
          if (this.onStateChangeCallback) this.onStateChangeCallback('idle');
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch (e) {
            this.isListening = false;
            if (this.onStateChangeCallback) this.onStateChangeCallback('idle');
          }
        } else {
          if (this.onStateChangeCallback) this.onStateChangeCallback('idle');
        }
      };
    }
  }

  loadVoices() {
    if (!this.synthesis) return;
    const populateVoices = () => {
      const voices = this.synthesis.getVoices();
      this.selectedVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Alex') || v.name.includes('Daniel') || v.lang.startsWith('en')) || voices[0];
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

  speak(text, onComplete) {
    if (!text) {
      if (onComplete) onComplete();
      return;
    }

    // Stop current playing audio or synthesis
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.synthesis) {
      this.synthesis.cancel();
    }

    // Try Coqui Neural TTS if enabled
    if (this.ttsEngineMode === 'coqui') {
      const ttsUrl = `/api/tts?text=${encodeURIComponent(text)}`;
      const audio = new Audio(ttsUrl);
      this.currentAudio = audio;

      audio.onplay = () => {
        this.isSpeaking = true;
        if (this.onStateChangeCallback) this.onStateChangeCallback('speaking');
      };

      audio.onended = () => {
        this.isSpeaking = false;
        this.currentAudio = null;
        if (this.onStateChangeCallback) this.onStateChangeCallback(this.isListening ? 'listening' : 'idle');
        if (onComplete) onComplete();
      };

      audio.onerror = () => {
        console.warn('Coqui TTS Server unreachable or error. Falling back to WebSpeech Synthesis.');
        this.speakWebSpeech(text, onComplete);
      };

      audio.play().catch(() => {
        this.speakWebSpeech(text, onComplete);
      });

      return;
    }

    // Fallback to WebSpeech Synthesis
    this.speakWebSpeech(text, onComplete);
  }

  speakWebSpeech(text, onComplete) {
    if (!this.synthesis) {
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
      if (this.onStateChangeCallback) this.onStateChangeCallback(this.isListening ? 'listening' : 'idle');
      if (onComplete) onComplete();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (this.onStateChangeCallback) this.onStateChangeCallback(this.isListening ? 'listening' : 'idle');
      if (onComplete) onComplete();
    };

    this.synthesis.speak(utterance);
  }
}
