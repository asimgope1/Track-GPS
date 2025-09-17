import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import DashBoard from '../Pages/DashBoard/DashBoard';
import VehicleMap from '../Pages/VehicleMap/VehicleMap';
import Track from '../Pages/Track/Track';
import HistoryModal from '../Pages/History/HistoryModal';
import Home from '../Pages/Home/Home';
import DescriptionData from '../Pages/Piedata/DescriptionData';
import MaintenanceScheduleScreen from '../Pages/Sidebarpages/MaintenanceScheduleScreen';
import MaintenanceCalendarScreen from '../Pages/Sidebarpages/MaintenanceCalendarScreen';
import TripAssignment from '../Pages/Sidebarpages/TripAssignment';
import VehicleBreakdown from '../Pages/Sidebarpages/VehicleBreakdown';
import VehicleInspection from '../Pages/Sidebarpages/VehicleInspection';
import RouteOptimization from '../Pages/Sidebarpages/RouteOptimization';
import TripExpenses from '../Pages/Sidebarpages/TripExpenses';
import DriverRating from '../Pages/Sidebarpages/DriverRating';
import { clearAll, getObjByKey } from '../utils/Storage';
import { useDispatch } from 'react-redux';
import { checkuserToken } from '../redux/actions/auth';
import MaintenanceJob from '../Pages/Sidebarpages/MaintenanceJob';
import TripStart from '../Pages/Sidebarpages/TripStart';
import TripStop from '../Pages/Sidebarpages/TripStop';
// Import other screens as needed for the drawer items

// Create both navigators
const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// Your existing stack navigator
function HomeStack() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={Home}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="DashBoard"
        component={DashBoard}
        options={{headerShown: false}}
      />
      <Stack.Screen name="VehicleMap" component={VehicleMap} />
      <Stack.Screen name="Track" component={Track} />
      <Stack.Screen name="HistoryModal" component={HistoryModal} />
      <Stack.Screen name="DescriptionData" component={DescriptionData} />
      <Stack.Screen
        name="MaintenanceSchedule"
        component={MaintenanceScheduleScreen}
      />
    </Stack.Navigator>
  );
}

// Custom Drawer Content Component
const CustomDrawerContent = props => {
  // Get the logged-in user role
  async function getUseType() {
    try {
      const loginRes = await getObjByKey('loginResponse');
      const userType = loginRes?.data?.user_type;
      return userType || 'admin'; // default to admin if not found
    } catch (error) {
      console.error('Error fetching user type:', error);
      return 'admin';
    }
  }

  const [userRole, setUserRole] = React.useState(null); // start null

  React.useEffect(() => {
    const fetchUserRole = async () => {
      const role = await getUseType();
      setUserRole(role);
    };
    fetchUserRole();
  }, []);

  const Dispatch = useDispatch();
  const currentRouteName = props.state.routeNames[props.state.index];

  const adminOptions = [
    {
      label: 'Maintenance Schedule',
      icon: 'schedule',
      screen: 'MaintenanceSchedule',
    },
    {
      label: 'Maintenance Calendar',
      icon: 'calendar-today',
      screen: 'MaintenanceCalendar',
    },
    {label: 'Maintenance Job', icon: 'assignment', screen: 'MaintenanceJob'},
    {
      label: 'Vehicle Inspection',
      icon: 'car-repair',
      screen: 'VehicleInspection',
    },
    {label: 'Vehicle Breakdown', icon: 'warning', screen: 'VehicleBreakdown'},
    {label: 'Trip Assignment', icon: 'assignment', screen: 'TripAssignment'},
    {label: 'Route Optimization', icon: 'route', screen: 'RouteOptimization'},
    {label: 'Trip Expenses', icon: 'attach-money', screen: 'TripExpenses'},
    {label: 'Driver Rating', icon: 'star-rate', screen: 'DriverRating'},
  ];

  const managerOptions = [
    {label: 'Trip Inspection', icon: 'checklist', screen: 'TripInspection'},
    {label: 'Trip Assignment', icon: 'assignment', screen: 'TripAssignment'},
    {label: 'Trip Expenses', icon: 'attach-money', screen: 'TripExpenses'},
    {label: 'Driver Rating', icon: 'star-rate', screen: 'DriverRating'},
  ];

  const driverOptions = [
    {label: 'Trip Start', icon: 'play-arrow', screen: 'TripStart'},
    {label: 'Trip Stop', icon: 'stop', screen: 'TripStop'},
  ];

  const getOptionsForRole = () => {
    switch (userRole) {
      case 'admin':
        return adminOptions;
      case 'manager':
        return managerOptions;
      case 'driver':
        return driverOptions;
      default:
        return [];
    }
  };

  if (!userRole) return null; // wait until role is loaded

  return (
    <DrawerContentScrollView {...props}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fleet Management</Text>
        <Text style={{color: 'white', fontSize: 14, textAlign: 'center'}}>
          {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
        </Text>
      </View>

      {/* Home Drawer Item */}
      <DrawerItem
        label="Home"
        icon={({color, size}) => (
          <Icon
            name="home"
            color={currentRouteName === 'HomeStack' ? '#0284c7' : color}
            size={size}
          />
        )}
        focused={currentRouteName === 'HomeStack'}
        labelStyle={{
          color: currentRouteName === 'HomeStack' ? '#0284c7' : '#333',
          fontWeight: currentRouteName === 'HomeStack' ? 'bold' : 'normal',
        }}
        style={{
          backgroundColor:
            currentRouteName === 'HomeStack' ? '#e0f2fe' : 'transparent',
          borderRadius: 6,
          marginHorizontal: 4,
        }}
        onPress={() => props.navigation.navigate('HomeStack')}
      />

      {/* Role-Based Items */}
      {getOptionsForRole().map((item, index) => {
        const isFocused = currentRouteName === item.screen;
        return (
          <DrawerItem
            key={index}
            label={item.label}
            icon={({color, size}) => (
              <Icon
                name={item.icon}
                color={isFocused ? '#0284c7' : color}
                size={size}
              />
            )}
            focused={isFocused}
            labelStyle={{
              color: isFocused ? '#0284c7' : '#333',
              fontWeight: isFocused ? 'bold' : 'normal',
            }}
            style={{
              backgroundColor: isFocused ? '#e0f2fe' : 'transparent',
              borderRadius: 6,
              marginHorizontal: 4,
            }}
            onPress={() => props.navigation.navigate(item.screen)}
          />
        );
      })}

      {/* Footer */}
      <View style={styles.footer}>
        <DrawerItem
          label="Logout"
          icon={({color, size}) => (
            <Icon name="exit-to-app" color={color} size={size} />
          )}
          onPress={() => {
            clearAll();
            Dispatch(checkuserToken());
          }}
        />
      </View>
    </DrawerContentScrollView>
  );
};



// Main App Navigator with Drawer
function AppNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="HomeStack"
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: 'left',
        drawerType: 'front',
        drawerActiveTintColor: '#0284c7',
        drawerInactiveTintColor: '#333',
        drawerLabelStyle: {
          marginLeft: -15,
          fontSize: 16,
        },
      }}>
      <Drawer.Screen
        name="HomeStack"
        component={HomeStack}
        options={{title: 'Home'}}
      />

      {/* Add all other screens that might be navigated to from the drawer */}
      <Drawer.Screen
        name="MaintenanceSchedule"
        component={MaintenanceScheduleScreen}
      />
      <Drawer.Screen
        name="MaintenanceCalendar"
        component={MaintenanceCalendarScreen}
      />
      <Drawer.Screen name="VehicleInspection" component={VehicleInspection} />
      <Drawer.Screen name="VehicleBreakdown" component={VehicleBreakdown} />
      <Drawer.Screen name="RouteOptimization" component={RouteOptimization} />
      <Drawer.Screen name="TripAssignment" component={TripAssignment} />
      <Drawer.Screen name="TripExpenses" component={TripExpenses} />
      <Drawer.Screen name="DriverRating" component={DriverRating} />
      <Drawer.Screen name="MaintenanceJob" component={MaintenanceJob} />
      <Drawer.Screen name="TripStart" component={TripStart} />
      <Drawer.Screen name="TripStop" component={TripStop} />

      {/* Add other screens similarly */}
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    backgroundColor: '#0284c7',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  logo: {
    width: 60,
    height: 60,
    alignSelf: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  profileSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  profileButton: {
    flex: 1,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 5,
    marginHorizontal: 3,
    alignItems: 'center',
  },
  activeProfile: {
    backgroundColor: 'white',
  },
  profileText: {
    color: 'black',
    fontWeight:'700', 
    fontSize: 12,
  },
  activeProfileText: {
    color: '#0284c7',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginTop: 15,
  },
});

export default AppNavigator;
