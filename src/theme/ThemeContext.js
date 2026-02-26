/**
 * ThemeContext – provides dark/light mode to the whole app.
 *
 * Usage:
 *   const { theme, isDark, toggleTheme } = useAppTheme();
 *   <View style={{ backgroundColor: theme.colors.backgroundSolid }} />
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme } from '../theme';

const STORAGE_KEY = '@app_theme_mode'; // 'dark' | 'light' | 'system'

const ThemeContext = createContext({
  theme: darkTheme,
  isDark: true,
  themeMode: 'system',
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme(); // 'dark' | 'light' | null
  const [themeMode, setThemeModeState] = useState('system');

  // Load saved preference on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(saved => {
        if (saved) setThemeModeState(saved);
      })
      .catch(() => {});
  }, []);

  const setThemeMode = useCallback(async mode => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, mode);
    } catch (_) {}
  }, []);

  // Resolve actual dark/light from mode + system BEFORE toggle is created
  const resolvedIsDark = useMemo(() => {
    if (themeMode === 'system') return systemScheme === 'dark';
    return themeMode === 'dark';
  }, [themeMode, systemScheme]);

  // Toggle between dark ↔ light — references resolvedIsDark correctly in closure
  const toggleTheme = useCallback(() => {
    const next = resolvedIsDark ? 'light' : 'dark';
    setThemeMode(next);
  }, [resolvedIsDark, setThemeMode]);

  const theme = resolvedIsDark ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({ theme, isDark: resolvedIsDark, themeMode, toggleTheme, setThemeMode }),
    [theme, resolvedIsDark, themeMode, toggleTheme, setThemeMode],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);

export default ThemeContext;
