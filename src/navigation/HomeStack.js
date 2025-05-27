import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DashBoard from '../Pages/DashBoard/DashBoard';
import VehicleMap from '../Pages/VehicleMap/VehicleMap';
import Track from '../Pages/Track/Track';
import HistoryModal from '../Pages/History/HistoryModal';
import Home from '../Pages/Home/Home';
import DescriptionData from '../Pages/Piedata/DescriptionData';

const {Navigator, Screen} = createNativeStackNavigator();

export default HomeStack = () => {
  return (
    <Navigator initialRouteName="Home">
      <Screen options={{headerShown: false}} name="Home" component={Home} />
      <Screen
        options={{headerShown: false}}
        name="DashBoard"
        component={DashBoard}
      />
      <Screen name="VehicleMap" component={VehicleMap} />
      <Screen name="Track" component={Track} />
      <Screen name="HistoryModal" component={HistoryModal} />
      <Screen name="DescriptionData" component={DescriptionData} />
    </Navigator>
  );
};
