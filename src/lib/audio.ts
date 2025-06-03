export type SoundType = "chime" | "bell" | "notification" | "gentle" | "alarm";

interface AudioFile {
  name: string;
  displayName: string;
  url: string;
}

// Audio context for better performance
let audioContext: AudioContext | null = null;
const audioBuffers = new Map<string, AudioBuffer>();

// Available sound files
export const AVAILABLE_SOUNDS: Record<SoundType, AudioFile> = {
  chime: {
    name: "chime",
    displayName: "Sanfter Gong",
    url: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeAznOt", // Minimal audio data
  },
  bell: {
    name: "bell",
    displayName: "Glocke",
    url: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeAznOt",
  },
  notification: {
    name: "notification",
    displayName: "Benachrichtigung",
    url: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeAznOt",
  },
  gentle: {
    name: "gentle",
    displayName: "Sanft",
    url: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeAznOt",
  },
  alarm: {
    name: "alarm",
    displayName: "Alarm",
    url: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeAznOt",
  },
};

// Initialize audio context
function initAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  }
  return audioContext;
}

// Generate audio buffer for sound type
function generateAudioBuffer(
  soundType: SoundType,
  duration = 0.5,
): AudioBuffer {
  const audioCtx = initAudioContext();
  const sampleRate = audioCtx.sampleRate;
  const buffer = audioCtx.createBuffer(1, sampleRate * duration, sampleRate);
  const data = buffer.getChannelData(0);

  // Generate different waveforms for different sounds
  for (let i = 0; i < data.length; i++) {
    const t = i / sampleRate;
    let value = 0;

    switch (soundType) {
      case "chime":
        // Soft bell-like sound
        value =
          Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 3) * 0.3 +
          Math.sin(2 * Math.PI * 1200 * t) * Math.exp(-t * 4) * 0.2;
        break;
      case "bell":
        // Classic bell sound
        value =
          Math.sin(2 * Math.PI * 523 * t) * Math.exp(-t * 2) * 0.4 +
          Math.sin(2 * Math.PI * 1047 * t) * Math.exp(-t * 3) * 0.3;
        break;
      case "notification":
        // Two-tone notification
        value =
          t < 0.15
            ? Math.sin(2 * Math.PI * 800 * t) * 0.3
            : t < 0.3
              ? Math.sin(2 * Math.PI * 600 * t) * 0.3
              : 0;
        break;
      case "gentle":
        // Soft sine wave
        value = Math.sin(2 * Math.PI * 440 * t) * Math.exp(-t * 1.5) * 0.2;
        break;
      case "alarm":
        // Urgent alarm sound
        value =
          Math.sin(2 * Math.PI * 1000 * t) *
          (t < 0.1 ? 1 : Math.sin(2 * Math.PI * 10 * t)) *
          0.5;
        break;
    }

    data[i] = value;
  }

  return buffer;
}

// Audio manager class
export class AudioManager {
  private static instance: AudioManager;
  private volume = 0.7;
  private enabled = true;

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  async playSound(soundType: SoundType, repeat = 1): Promise<void> {
    if (!this.enabled) return;

    try {
      const audioCtx = initAudioContext();

      // Resume context if suspended (required for user interaction)
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      // Get or create audio buffer
      let buffer = audioBuffers.get(soundType);
      if (!buffer) {
        buffer = generateAudioBuffer(soundType);
        audioBuffers.set(soundType, buffer);
      }

      // Play sound with repetition
      for (let i = 0; i < repeat; i++) {
        await new Promise<void>((resolve) => {
          const source = audioCtx.createBufferSource();
          const gainNode = audioCtx.createGain();

          source.buffer = buffer;
          gainNode.gain.value = this.volume;

          source.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          source.onended = () => {
            setTimeout(resolve, i < repeat - 1 ? 200 : 0); // 200ms gap between repetitions
          };

          source.start();
        });
      }
    } catch (error) {
      console.error('Error playing sound:', error);
      // Fallback: try simple beep
      this.playFallbackSound();
    }
  }

  // Fallback sound when AudioContext fails
  private playFallbackSound(): void {
    try {
      // Create a simple beep using oscillator as fallback
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = this.volume * 0.3;

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (error) {
      console.warn('Audio fallback also failed:', error);
    }
  }
  }

  // Play reminder sound
  async playReminder(soundType: SoundType = "chime"): Promise<void> {
    return this.playSound(soundType, 1);
  }

  // Play alarm sound (more urgent)
  async playAlarm(soundType: SoundType = "alarm"): Promise<void> {
    return this.playSound(soundType, 3);
  }

  // Test sound for settings
  async testSound(soundType: SoundType): Promise<void> {
    return this.playSound(soundType, 1);
  }
}

// Simple fallback for browsers without AudioContext
export class SimpleAudioManager {
  private volume = 0.7;
  private enabled = true;

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  async playSound(soundType: SoundType): Promise<void> {
    if (!this.enabled) return;

    // Create a simple beep using oscillator
    try {
      const audioCtx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      // Different frequencies for different sounds
      const frequencies: Record<SoundType, number> = {
        chime: 800,
        bell: 523,
        notification: 800,
        gentle: 440,
        alarm: 1000,
      };

      oscillator.frequency.value = frequencies[soundType];
      oscillator.type = soundType === "alarm" ? "square" : "sine";
      gainNode.gain.value = this.volume * 0.3;

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (error) {
      console.warn("Audio not supported:", error);
    }
  }

  async playReminder(soundType: SoundType = "chime"): Promise<void> {
    return this.playSound(soundType);
  }

  async playAlarm(soundType: SoundType = "alarm"): Promise<void> {
    return this.playSound(soundType);
  }

  async testSound(soundType: SoundType): Promise<void> {
    return this.playSound(soundType);
  }
}

// Export the appropriate manager based on browser support
export const audioManager =
  typeof AudioContext !== "undefined" ||
  typeof (window as any).webkitAudioContext !== "undefined"
    ? AudioManager.getInstance()
    : new SimpleAudioManager();