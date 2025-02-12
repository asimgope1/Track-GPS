import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DashBoard from '../Pages/DashBoard/DashBoard';
import VehicleMap from '../Pages/VehicleMap/VehicleMap';
import Track from '../Pages/Track/Track';
import HistoryModal from '../Pages/History/HistoryModal';

const {Navigator, Screen} = createNativeStackNavigator();

export default HomeStack = () => {
  return (
    <Navigator initialRouteName="DashBoard">
      <Screen
        options={{headerShown: false}}
        name="DashBoard"
        component={DashBoard}
      />
      <Screen name="VehicleMap" component={VehicleMap} />
      <Screen name="Track" component={Track} />
      <Screen name="HistoryModal" component={HistoryModal} />
    </Navigator>
  );
};
