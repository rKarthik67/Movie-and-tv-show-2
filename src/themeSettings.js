import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const storageKey = 'arkplay-appearance';

export const fontChoices = [
  ['Space Grotesk', 'Space Grotesk'], ['Instrument Serif', 'Instrument Serif'],
  ['Inter', 'Inter'], ['Montserrat', 'Montserrat'], ['Manrope', 'Manrope'],
  ['Outfit', 'Outfit'], ['Poppins', 'Poppins'], ['DM Sans', 'DM Sans'],
  ['Noto Sans', 'Noto Sans'], ['Roboto', 'Roboto'], ['Work Sans', 'Work Sans'],
  ['Source Sans 3', 'Source Sans 3'], ['Rubik', 'Rubik'], ['Nunito', 'Nunito'],
  ['Quicksand', 'Quicksand'], ['Raleway', 'Raleway'], ['Josefin Sans', 'Josefin Sans'],
  ['Playfair Display', 'Playfair Display'], ['Lora', 'Lora'], ['Merriweather', 'Merriweather'],
  ['Libre Baskerville', 'Libre Baskerville'], ['Cormorant Garamond', 'Cormorant Garamond'],
  ['Cinzel', 'Cinzel'], ['DM Serif Display', 'DM Serif Display'], ['Bebas Neue', 'Bebas Neue'],
];

export const animationChoices = [
  ['lift', 'Fade & lift'], ['fade', 'Fade'], ['scale', 'Scale in'],
  ['left', 'Slide from left'], ['right', 'Slide from right'],
];

const defaults = {
  bodyFont: 'Space Grotesk',
  displayFont: 'Instrument Serif',
  accent: '#E0A83A',
  glassOpacity: 0.55,
  textScale: 1,
  animation: 'lift',
  animationColor: '#E0A83A',
  reduceMotion: false,
  watchRegion: 'IN',
  categoryFonts: {
    header: 'Instrument Serif', card: 'Space Grotesk', body: 'Space Grotesk',
    info: 'Space Grotesk', cast: 'Space Grotesk', button: 'Space Grotesk', navigation: 'Space Grotesk',
  },
  categoryColors: {},
};

const ThemeSettingsContext = createContext(null);

export function ThemeSettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return {
        ...defaults,
        ...stored,
        categoryFonts: { ...defaults.categoryFonts, ...(stored.categoryFonts || {}) },
        categoryColors: { ...defaults.categoryColors, ...(stored.categoryColors || {}) },
      };
    } catch (_) {
      return defaults;
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(settings));
    const root = document.documentElement;
    root.style.setProperty('--font-ui', `'${settings.bodyFont}', sans-serif`);
    root.style.setProperty('--font-display', `'${settings.displayFont}', serif`);
    root.style.setProperty('--accent', settings.accent);
    // The chosen theme color drives the entire dark palette, not only buttons.
    root.style.setProperty('--background', `color-mix(in srgb, ${settings.accent} 9%, #08090d)`);
    root.style.setProperty('--surface', `color-mix(in srgb, ${settings.accent} 13%, #101116)`);
    root.style.setProperty('--surface-variant', `color-mix(in srgb, ${settings.accent} 19%, #12141a)`);
    root.style.setProperty('--border', `color-mix(in srgb, ${settings.accent} 35%, #292c34)`);
    root.style.setProperty('--glass-alpha', String(Math.min(.92, .08 + (settings.glassOpacity * .13))));
    root.style.setProperty('--glass', `color-mix(in srgb, var(--surface) ${Math.round(Math.min(.92, .08 + (settings.glassOpacity * .13)) * 100)}%, transparent)`);
    // The glass remains transparent at every level. This setting controls
    // only refraction/frosting: 0 = optically clear, 4 = 20px blur.
    root.style.setProperty('--liquid-glass-blur', `${Math.max(0, settings.glassOpacity * 5)}px`);
    root.style.setProperty('--text-scale', String(settings.textScale));
    root.style.setProperty('--animation-color', settings.animationColor);
    Object.entries(settings.categoryFonts).forEach(([category, font]) => root.style.setProperty(`--font-${category}`, `'${font}', sans-serif`));
    Object.entries(settings.categoryColors).forEach(([category, color]) => root.style.setProperty(`--color-${category}`, color));
    root.dataset.motion = settings.reduceMotion ? 'none' : settings.animation;
  }, [settings]);

  const value = useMemo(() => ({
    settings,
    update: (changes) => setSettings((current) => ({ ...current, ...changes })),
    updateCategoryFont: (category, font) => setSettings((current) => ({ ...current, categoryFonts: { ...current.categoryFonts, [category]: font } })),
    updateCategoryColor: (category, color) => setSettings((current) => ({ ...current, categoryColors: { ...current.categoryColors, [category]: color } })),
    reset: () => setSettings(defaults),
  }), [settings]);

  return <ThemeSettingsContext.Provider value={value}>{children}</ThemeSettingsContext.Provider>;
}

export function useThemeSettings() {
  const context = useContext(ThemeSettingsContext);
  if (!context) throw new Error('useThemeSettings must be used within ThemeSettingsProvider');
  return context;
}
