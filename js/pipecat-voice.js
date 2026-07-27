/* ==========================================================================
   FATE Pipecat Low-Latency Voice Pipeline (Optimized Audio Queue)
   ========================================================================== */

class FatePipecatPipeline {
  constructor(speechEngine) {
    this.speech = speechEngine;
    this.audioQueue = [];
    this.isProcessingQueue = false;
    this.interrupted = false;
  }

  interrupt() {
    this.interrupted = true;
    this.audioQueue.length = 0; // Fast array clear
    if (this.speech && this.speech.currentAudio) {
      this.speech.currentAudio.pause();
      this.speech.currentAudio = null;
    }
    if (this.speech && this.speech.synthesis) {
      this.speech.synthesis.cancel();
    }
    console.log('⚡ Pipecat Voice Pipeline Interrupted by User Input.');
  }

  enqueueSpeech(text, callback) {
    this.interrupted = false;
    this.audioQueue.push({ text, callback });
    if (!this.isProcessingQueue) {
      this.processQueue();
    }
  }

  processQueue() {
    if (this.audioQueue.length === 0 || this.interrupted) {
      this.isProcessingQueue = false;
      return;
    }

    this.isProcessingQueue = true;
    const item = this.audioQueue.shift();

    if (this.speech) {
      this.speech.speak(item.text, () => {
        if (item.callback) item.callback();
        requestAnimationFrame(() => this.processQueue());
      });
    } else {
      this.isProcessingQueue = false;
    }
  }
}

window.FatePipecatPipeline = FatePipecatPipeline;
