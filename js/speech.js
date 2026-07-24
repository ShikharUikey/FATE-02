/* ==========================================================================
   FATE Speech Engine - Echo Cancellation & Self-Feedback Prevention
   ========================================================================== */

class FateSpeechEngine {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis || null;

    this.isListening = false;
    this.isSpeaking = false;
    this.wasListeningBeforeSpeaking = false;

    this.ttsEngineMode = localStorage.getItem('fate_tts_engine') || 'coqui'; // 'coqui' (macOS/Neural) or 'webspeech'
    this.macVoice = localStorage.getItem('fate_mac_voice') || 'Samantha';

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
        // Discard speech recognition results if FATE is currently speaking
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

        // Echo prevention: filter out if recognition matches FATE's recent spoken text
        if (trimmedFinal && !this.isEcho(trimmedFinal)) {
          if (this.onResultCallback) this.onResultCallback(trimmedFinal, true);
        } else if (trimmedInterim && !this.isEcho(trimmedInterim)) {
          if (this.onResultCallback) this.onResultCallback(trimmedInterim, false);
        }
      };

      this.recognition.onerror = (event) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('FATE Speech Recognition Error:', event.error);
          this.isListening = false;
          if (this.onStateChangeCallback) this.onStateChangeCallback('idle');
        }
      };

      this.recognition.onend = () => {
        // Auto-restart listening ONLY if user initiated listening and FATE is NOT currently speaking
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

    // Check if recognized text is contained in FATE's last spoken response
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
      }, 400); // 400ms echo decay delay
    } else {
      if (this.onStateChangeCallback) this.onStateChangeCallback('idle');
    }
  }

  speak(text, onComplete) {
    if (!text) {
      if (onComplete) onComplete();
      return;
    }

    this.lastSpokenText = text;

    // Pause mic listening while FATE is speaking to prevent self-echo loop
    this.pauseListeningForSpeech();

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.synthesis) {
      this.synthesis.cancel();
    }

    // Coqui / macOS Native Speech Engine
    if (this.ttsEngineMode === 'coqui') {
      const ttsUrl = `/api/tts?voice=${encodeURIComponent(this.macVoice)}&text=${encodeURIComponent(text)}`;
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

      audio.onerror = () => {
        console.warn('TTS Server error. Falling back to WebSpeech Synthesis.');
        this.speakWebSpeech(text, onComplete);
      };

      audio.play().catch(() => {
        this.speakWebSpeech(text, onComplete);
      });

      return;
    }

    // WebSpeech Synthesis
    this.speakWebSpeech(text, onComplete);
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
