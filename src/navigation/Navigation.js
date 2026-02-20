import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import 'react-native-gesture-handler';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../redux/reducers/index';
import Appnavigator from './Appnavigator';
import LinearGradient from 'react-native-linear-gradient';

const store = configureStore({ reducer: rootReducer });

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

export default Navigation = () => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E1B4B', '#4F46E5']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <Provider store={store}>
        <SafeAreaProvider>
          <NavigationContainer theme={navTheme}>
            <Appnavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </Provider>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
