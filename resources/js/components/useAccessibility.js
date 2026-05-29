import { useEffect, useState } from "react";

const STORAGE_KEY = "mefasafe_a11y";

const DEFAULTS = {
  fontPercent: 100,
  highContrast: false,
  reduceMotion: false,
};

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...DEFAULTS, ...saved };
  } catch {
    return { ...DEFAULTS };
  }
}

function applySettings(settings) {
  const root = document.documentElement;
  root.style.fontSize = `${settings.fontPercent}%`;
  root.classList.toggle("a11y-high-contrast", settings.highContrast);
  root.classList.toggle("a11y-reduce-motion", settings.reduceMotion);
}

export function useAccessibility() {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    applySettings(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const update = (patch) => setSettings((current) => ({ ...current, ...patch }));
  const reset = () => setSettings({ ...DEFAULTS });

  return { settings, update, reset };
}
