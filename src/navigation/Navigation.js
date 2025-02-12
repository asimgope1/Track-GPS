import * as React from 'react';
import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import rootReducer from '../redux/reducers/index';
import Appnavigator from './Appnavigator';

const store = configureStore({reducer: rootReducer});
export default Navigation = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Appnavigator />
      </NavigationContainer>
    </Provider>
  );
};
