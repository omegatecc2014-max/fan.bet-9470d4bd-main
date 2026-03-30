export class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled = false;

  private getContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  enable() {
    this.soundEnabled = true;
    this.getContext();
  }

  playClick() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      // Ignore
    }
  }

  playNotification() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      
      const playTone = (freq: number, startTime: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.08, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      };

      playTone(523.25, ctx.currentTime); // C5
      playTone(659.25, ctx.currentTime + 0.1); // E5
    } catch (e) {
      // Ignore
    }
  }
}

export const sounds = new SoundManager();

// Setup global click listener for buttons
if (typeof window !== 'undefined') {
  document.addEventListener('click', (e) => {
    // Enable audio context on first user interaction
    sounds.enable();

    // Play click sound if a button was clicked
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]')) {
      sounds.playClick();
    }
  }, { capture: true });

  // Setup mutation observer to play sound when sonner toasts appear
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement && node.matches('li[data-sonner-toast]')) {
          sounds.playNotification();
        }
      });
    });
  });

  window.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, { childList: true, subtree: true });
  });
}
