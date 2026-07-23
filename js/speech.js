/* ==========================================================================
   FATE Speech Recognition & Voice Synthesis Engine
   ========================================================================== */

class FateSpeechEngine {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis || null;

    this.isListening = false;
    this.isSpeaking = false;
    this.wakeWord = 'fate';

    this.onResultCallback = null;
    this.onStateChangeCallback = null;

    this.pitch = 1.0;
    this.rate = 1.0;
    this.selectedVoice = null;

    this.initRecognition();
    this.loadVoices();
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
      // Prefer natural English robotic/sci-fi male or female voices
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
    if (!this.synthesis || !text) {
      if (onComplete) onComplete();
      return;
    }

    // Cancel ongoing speech
    this.synthesis.cancel();

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
