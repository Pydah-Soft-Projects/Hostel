import { useState, useEffect } from 'react';

/**
 * React hook to consume dynamic UI theme tokens in JavaScript
 * (for Charts, Recharts, SVG, Canvas, or dynamic styling)
 * Automatically updates when centralized theme server publishes a new theme version.
 */
export function useThemeTokens() {
  const [tokens, setTokens] = useState(() => 
    typeof window !== 'undefined' && window.ThemeLoader ? window.ThemeLoader.getTokens() : {}
  );

  useEffect(() => {
    const handleUpdate = () => {
      if (typeof window !== 'undefined' && window.ThemeLoader) {
        setTokens(window.ThemeLoader.getTokens());
      }
    };

    window.addEventListener('theme:updated', handleUpdate);
    return () => window.removeEventListener('theme:updated', handleUpdate);
  }, []);

  return tokens;
}

export default useThemeTokens;

