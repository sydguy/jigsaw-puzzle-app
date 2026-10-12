import type { Preferences } from "../local/types";
let audio: AudioContext | null = null;
export function feedback(preferences: Preferences) {
  if (preferences.haptics) try { navigator.vibrate?.(8); } catch { /* unsupported hardware */ }
  if (preferences.sound) try {
    audio ??= new AudioContext(); void audio.resume(); const tone = audio.createOscillator(), gain = audio.createGain();
    tone.frequency.value = 540; gain.gain.setValueAtTime(.025, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .08);
    tone.connect(gain); gain.connect(audio.destination); tone.start(); tone.stop(audio.currentTime + .08);
  } catch { /* autoplay/device policy: gameplay remains available */ }
}
