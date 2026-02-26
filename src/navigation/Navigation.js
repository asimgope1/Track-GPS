import * as React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import 'react-native-gesture-handler';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../redux/reducers/index';
import Appnavigator from './Appnavigator';
import LinearGradient from 'react-native-linear-gradient';
import { ThemeProvider, useAppTheme } from '../theme/ThemeContext';

const store = configureStore({ reducer: rootReducer });

// Inner component so it can consume ThemeContext
const ThemedApp = () => {
  const { theme, isDark } = useAppTheme();
  const c = theme.colors;

  // Navigation theme – tells react-navigation what colours to use for headers/tabs
  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: 'transparent',
      card: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(248,250,252,0.97)',
      text: c.text,
      primary: c.primary,
      border: c.border,
      notification: c.primary,
    },
  };

  return (
    <View style={styles.container}>
      {/* Full-screen gradient background that adapts to the active theme */}
      <LinearGradient
        colors={c.primaryGradient}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Status bar colour */}
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaProvider>
        <NavigationContainer theme={navTheme}>
          <Appnavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </View>
  );
};

export default Navigation = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});
