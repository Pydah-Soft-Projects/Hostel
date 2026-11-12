import { useState, useEffect } from 'react';

function getLiveTokens() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return {};
  const fromLoader = window.ThemeLoader?.getTokens ? window.ThemeLoader.getTokens() : {};
  const style = getComputedStyle(document.documentElement);
  const primary = style.getPropertyValue('--primary')?.trim();
  const secondary = style.getPropertyValue('--secondary')?.trim();
  const background = style.getPropertyValue('--background')?.trim();
  const surface = style.getPropertyValue('--surface')?.trim();
  const sidebar = style.getPropertyValue('--sidebar')?.trim();
  return {
    primary: primary || fromLoader.primary || '#167B72',
    secondary: secondary || fromLoader.secondary || '#E86A58',
    background: background || fromLoader.background || '#F4FAF8',
    surface: surface || fromLoader.surface || '#FFFFFF',
    sidebar: sidebar || fromLoader.sidebar || '#183E3B',
    ...fromLoader
  };
}

/**
 * React hook to consume dynamic UI theme tokens in JavaScript
 * (for Charts, Recharts, SVG, Canvas, or dynamic styling)
 * Automatically updates when centralized theme server publishes a new theme version.
 */
export function useThemeTokens() {
  const [tokens, setTokens] = useState(getLiveTokens);

  useEffect(() => {
    const handleUpdate = () => {
      setTokens(getLiveTokens());
    };

    window.addEventListener('theme:updated', handleUpdate);
    return () => window.removeEventListener('theme:updated', handleUpdate);
  }, []);

  return tokens;
}

export default useThemeTokens;
