// Система звуков для интерфейса
export class SoundSystem {
  private static instance: SoundSystem;
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  private constructor() {
    if (typeof window !== "undefined") {
      this.enabled = localStorage.getItem("systemSoundsEnabled") !== "false";
    }
  }

  static getInstance(): SoundSystem {
    if (!SoundSystem.instance) {
      SoundSystem.instance = new SoundSystem();
    }
    return SoundSystem.instance;
  }

  private async getAudioContext(): Promise<AudioContext> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    return this.audioContext;
  }

  private async createBeep(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
  ): Promise<void> {
    if (!this.enabled) return;

    try {
      const audioContext = await this.getAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.1,
        audioContext.currentTime + 0.01,
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + duration,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn("Sound system error:", error);
    }
  }

  // Различные звуки для разных действий
  async playButtonClick(): Promise<void> {
    await this.createBeep(800, 0.1, "sine");
  }

  async playSuccess(): Promise<void> {
    await this.createBeep(600, 0.15, "sine");
    setTimeout(() => this.createBeep(800, 0.15, "sine"), 100);
  }

  async playError(): Promise<void> {
    await this.createBeep(300, 0.3, "sawtooth");
  }

  async playHover(): Promise<void> {
    await this.createBeep(1000, 0.05, "sine");
  }

  async playNavigation(): Promise<void> {
    await this.createBeep(500, 0.12, "triangle");
  }

  // Управление настройками
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("systemSoundsEnabled", enabled.toString());
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // Инициализация для пользовательского взаимодействия
  async init(): Promise<void> {
    if (typeof window !== "undefined") {
      try {
        await this.getAudioContext();
      } catch (error) {
        console.warn("Audio context initialization failed:", error);
      }
    }
  }
}

// Хук для использования в компонентах
export function useSounds() {
  const soundSystem = SoundSystem.getInstance();

  return {
    playButtonClick: () => soundSystem.playButtonClick(),
    playSuccess: () => soundSystem.playSuccess(),
    playError: () => soundSystem.playError(),
    playHover: () => soundSystem.playHover(),
    playNavigation: () => soundSystem.playNavigation(),
    setEnabled: (enabled: boolean) => soundSystem.setEnabled(enabled),
    isEnabled: () => soundSystem.isEnabled(),
    init: () => soundSystem.init(),
  };
}
