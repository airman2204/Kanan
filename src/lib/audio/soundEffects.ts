// Motor de efectos de sonido con Web Audio API (Latencia Cero)
// Genera timbres armónicos de alta fidelidad sin requerir descarga de archivos MP3 externos.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private audioUnlocked: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      const unlock = () => {
        const c = this.getContext();
        if (c && c.state === "suspended") {
          c.resume().catch(() => {});
        }
        this.audioUnlocked = true;
        window.removeEventListener("click", unlock);
        window.removeEventListener("touchstart", unlock);
        window.removeEventListener("keydown", unlock);
      };
      window.addEventListener("click", unlock, { once: true });
      window.addEventListener("touchstart", unlock, { once: true });
      window.addEventListener("keydown", unlock, { once: true });
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("kanan_sound_muted", muted ? "1" : "0");
    }
  }

  public isMuted(): boolean {
    if (typeof window !== "undefined" && localStorage.getItem("kanan_sound_muted") === "1") {
      this.muted = true;
    }
    return this.muted;
  }

  private playAudioFile(src: string, volume: number = 0.8) {
    if (this.isMuted()) return;
    try {
      if (typeof window !== "undefined") {
        // Asegurarse de que el AudioContext y subsistema de audio esté reanudado
        const ctx = this.getContext();
        if (ctx && ctx.state === "suspended") {
          ctx.resume().catch(() => {});
        }

        const audio = new Audio(src);
        audio.volume = volume;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("[SoundEngine] Autoplay bloqueado o no iniciado:", err);
          });
        }
      }
    } catch (e) {
      console.warn("[SoundEngine] Error reproduciendo audio:", e);
    }
  }

  /**
   * 1. Sonido de Nueva Cita Agendada (Ding Reserva + Doble Ladrido o Timbre)
   * Timbre de mostrador con el perro para cuando agenden un nuevo servicio
   */
  public playNewBookingSound() {
    if (this.isMuted()) return;
    try {
      if (typeof window !== "undefined") {
        const a1 = new Audio("/sounds/bell_service.mp3");
        const a2 = new Audio("/sounds/bark1.mp3");
        a1.volume = 0.85;
        a2.volume = 0.9;
        a1.play().catch(() => {});
        setTimeout(() => {
          a2.play().catch(() => {});
        }, 550);
      }
    } catch {}
  }

  /**
   * 2. Sonido de Mensaje Entrante de Chat (Opción elegida: "Ding Reserva" /sounds/booking_ding.mp3)
   */
  public playIncomingChatSound() {
    this.playAudioFile("/sounds/booking_ding.mp3", 0.9);
  }

  /**
   * 3. Sonido de Cita Confirmada por Cliente (🏆 Combo Kanan: Campana Recepción C + Doble Ladrido 1)
   */
  public playConfirmationSound() {
    if (this.isMuted()) return;
    try {
      if (typeof window !== "undefined") {
        const a1 = new Audio("/sounds/bell_service.mp3");
        const a2 = new Audio("/sounds/bark1.mp3");
        a1.volume = 0.85;
        a2.volume = 0.9;
        a1.play().catch(() => {});
        setTimeout(() => {
          a2.play().catch(() => {});
        }, 550);
      }
    } catch {}
  }

  /**
   * 4. Sonido de Alerta de Cancelación (Tono suave de logística)
   */
  public playCancellationSound() {
    this.playAudioFile("/sounds/chat_notification.mp3", 0.6);
  }
}

export const soundEngine = new SoundEngine();
