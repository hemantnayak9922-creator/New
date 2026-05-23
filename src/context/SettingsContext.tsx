import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface SettingsContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playWinSound: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => setIsMuted((prev) => !prev);

  const playWinSound = useCallback(() => {
    if (isMuted) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      masterGain.gain.value = 0.1;

      const playNote = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        osc.connect(masterGain);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      playNote(523.25, 0, 0.1);     // C5
      playNote(659.25, 0.1, 0.2);   // E5
      playNote(783.99, 0.3, 0.3);   // G5
      playNote(1046.50, 0.6, 0.4);  // C6
      
    } catch (err) {
      console.log('Audio playback failed', err);
    }
  }, [isMuted]);

  return (
    <SettingsContext.Provider value={{ isMuted, toggleMute, playWinSound }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
