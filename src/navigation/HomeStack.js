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
import { colors, spacing, typography } from '../theme';

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

// Complete list of all permissions from your system
const ALL_PERMISSIONS = [
  "create_user", "edit_user", "read_user", "delete_user",
  "create_maintenance_master", "edit_maintenance_master", "read_maintenance_master", "delete_maintenance_master",
  "create_driver", "edit_driver", "delete_driver", "read_driver",
  "create_driver_checklist", "edit_driver_checklist", "read_driver_checklist", "delete_driver_checklist",
  "create_expense_master", "edit_expense_master", "read_expense_master", "delete_expense_master",
  "create_checklist", "edit_checklist", "read_checklist", "delete_checklist",
  "create_maintenance_schedule", "edit_maintenance_schedule", "read_maintenance_schedule", "delete_maintenance_schedule",
  "create_maintenance_job", "edit_maintenance_job", "read_maintenance_job", "delete_maintenance_job",
  "view_maintenance_calendar",
  "create_vehicle_inspection", "edit_vehicle_inspection", "read_vehicle_inspection", "delete_vehicle_inspection",
  "create_vehicle_breakdown", "edit_vehicle_breakdown", "read_vehicle_breakdown", "delete_vehicle_breakdown",
  "create_trip_request", "edit_trip_request", "read_trip_request", "delete_trip_request",
  "create_trip_assignment", "edit_trip_assignment", "read_trip_assignment", "delete_trip_assignment",
  "create_expense_entry", "edit_expense_entry", "read_expense_entry", "delete_expense_entry",
  "create_driver_rating", "edit_driver_rating", "read_driver_rating", "delete_driver_rating",
  "view_vehicle_analytics", "view_driver_analytics", "view_fuel_analytics", "view_maintenance_analytics",
  "view_trip_report", "view_vehicle_report", "view_expense_report", "view_maintenance_report",
  "view_breakdown_report", "view_vehicle_utilization_report", "view_driver_utilization_report"
];

// Permission-based menu configuration
const menuConfig = {
  // Maintenance related menus
  maintenance_schedule: {
    label: 'Maintenance Schedule',
    icon: 'schedule',
    screen: 'MaintenanceSchedule',
    permissions: {
      create: 'create_maintenance_schedule',
      read: 'read_maintenance_schedule',
      edit: 'edit_maintenance_schedule',
      delete: 'delete_maintenance_schedule'
    }
  },
  maintenance_calendar: {
    label: 'Maintenance Calendar',
    icon: 'calendar-today',
    screen: 'MaintenanceCalendar',
    permissions: {
      view: 'view_maintenance_calendar'
    }
  },
  maintenance_job: {
    label: 'Maintenance Job',
    icon: 'assignment',
    screen: 'MaintenanceJob',
    permissions: {
      create: 'create_maintenance_job',
      read: 'read_maintenance_job',
      edit: 'edit_maintenance_job',
      delete: 'delete_maintenance_job'
    }
  },
  vehicle_inspection: {
    label: 'Vehicle Inspection',
    icon: 'car-repair',
    screen: 'VehicleInspection',
    permissions: {
      create: 'create_vehicle_inspection',
      read: 'read_vehicle_inspection',
      edit: 'edit_vehicle_inspection',
      delete: 'delete_vehicle_inspection'
    }
  },
  vehicle_breakdown: {
    label: 'Vehicle Breakdown',
    icon: 'warning',
    screen: 'VehicleBreakdown',
    permissions: {
      create: 'create_vehicle_breakdown',
      read: 'read_vehicle_breakdown',
      edit: 'edit_vehicle_breakdown',
      delete: 'delete_vehicle_breakdown'
    }
  },
  trip_assignment: {
    label: 'Trip Assignment',
    icon: 'assignment',
    screen: 'TripAssignment',
    permissions: {
      create: 'create_trip_assignment',
      read: 'read_trip_assignment',
      edit: 'edit_trip_assignment',
      delete: 'delete_trip_assignment'
    }
  },
  trip_expenses: {
    label: 'Trip Expenses',
    icon: 'attach-money',
    screen: 'TripExpenses',
    permissions: {
      create: 'create_expense_entry',
      read: 'read_expense_entry',
      edit: 'edit_expense_entry',
      delete: 'delete_expense_entry'
    }
  },
  driver_rating: {
    label: 'Driver Rating',
    icon: 'star-rate',
    screen: 'DriverRating',
    permissions: {
      create: 'create_driver_rating',
      read: 'read_driver_rating',
      edit: 'edit_driver_rating',
      delete: 'delete_driver_rating'
    }
  },
  trip_start: {
    label: 'Trip Start',
    icon: 'play-arrow',
    screen: 'TripStart',
    permissions: {
      create: 'create_trip_request',
      read: 'read_trip_request'
    }
  },
  trip_stop: {
    label: 'Trip Stop',
    icon: 'stop',
    screen: 'TripStop',
    permissions: {
      create: 'create_trip_request',
      read: 'read_trip_request'
    }
  },
  route_optimization: {
    label: 'Route Optimization',
    icon: 'route',
    screen: 'RouteOptimization',
    permissions: {
      view: 'view_trip_report'
    }
  }
};

// Custom Drawer Content Component
const CustomDrawerContent = props => {
  const [userData, setUserData] = React.useState(null);
  const Dispatch = useDispatch();
  const currentRouteName = props.state.routeNames[props.state.index];

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const loginRes = await getObjByKey('loginResponse');
        setUserData(loginRes?.data || null);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  // Check if user has "all" permission
  const hasAllPermission = () => {
    return userData?.permissions?.includes('all');
  };

  // Function to check if user has permission for a menu item
  const hasPermission = (menuKey) => {
    if (!userData?.permissions) return false;
    
    // If user has "all" permission, return true for everything
    if (hasAllPermission()) return true;
    
    const menu = menuConfig[menuKey];
    if (!menu) return false;
    
    const permissionRules = menu.permissions;
    const userPermissions = userData.permissions;
    
    // Check if user has any of the required permissions for this menu
    const requiredPermissions = Object.values(permissionRules);
    return requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );
  };

  // Function to check if user has any of the view permissions for analytics/reports
  const hasViewPermissions = () => {
    if (!userData?.permissions) return false;
    
    // If user has "all" permission, return true
    if (hasAllPermission()) return true;
    
    const viewPermissions = [
      'view_vehicle_analytics',
      'view_driver_analytics',
      'view_fuel_analytics',
      'view_maintenance_analytics',
      'view_trip_report',
      'view_vehicle_report',
      'view_expense_report',
      'view_maintenance_report',
      'view_breakdown_report',
      'view_vehicle_utilization_report',
      'view_driver_utilization_report'
    ];
    
    return viewPermissions.some(permission => 
      userData.permissions.includes(permission)
    );
  };

  // Get available menu items based on permissions (drivers always get Trip Start & Trip Stop)
  const getAvailableMenuItems = () => {
    if (!userData) return [];

    if (hasAllPermission()) {
      return Object.values(menuConfig);
    }

    const permissionKeys = Object.keys(menuConfig).filter(menuKey =>
      hasPermission(menuKey)
    );

    // Drivers always see Trip Start and Trip Stop in the drawer
    const isDriver = userData.user_type === 'driver';
    const driverMenuKeys = isDriver ? ['trip_start', 'trip_stop'] : [];
    const allKeys = [...new Set([...permissionKeys, ...driverMenuKeys])];

    return allKeys.map(menuKey => menuConfig[menuKey]);
  };

  if (!userData) {
    return (
      <DrawerContentScrollView {...props}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Fleet Management</Text>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </DrawerContentScrollView>
    );
  }

  const availableMenus = getAvailableMenuItems();
  const canViewAnalytics = hasViewPermissions();
  const hasAllPermissions = hasAllPermission();

  return (
    <DrawerContentScrollView {...props}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fleet Management</Text>
        <Text style={styles.userInfo}>
          {userData.user_type?.charAt(0).toUpperCase() + userData.user_type?.slice(1)}
          {hasAllPermissions && (
            <Text style={styles.allPermissionsBadge}> • ALL PERMISSIONS</Text>
          )}
        </Text>
        <Text style={styles.permissionInfo}>
          {hasAllPermissions ? 'Full system access' : `${userData.permissions?.length} permissions available`}
        </Text>
      </View>

      {/* Home Drawer Item - Always visible */}
      <DrawerItem
        label="Home"
        icon={({color, size}) => (
          <Icon
            name="home"
            color={currentRouteName === 'HomeStack' ? colors.primary : color}
            size={size}
          />
        )}
        focused={currentRouteName === 'HomeStack'}
        labelStyle={{
          color: currentRouteName === 'HomeStack' ? colors.primary : colors.text,
          fontWeight: currentRouteName === 'HomeStack' ? 'bold' : 'normal',
        }}
        style={{
          backgroundColor:
            currentRouteName === 'HomeStack' ? colors.infoLight : 'transparent',
          borderRadius: 6,
          marginHorizontal: 4,
        }}
        onPress={() => props.navigation.navigate('HomeStack')}
      />

      {/* Analytics/Reports Section - Show if user has any view permissions */}
      {/* {canViewAnalytics && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Analytics & Reports</Text>
          </View>
          <DrawerItem
            label="Dashboard & Reports"
            icon={({color, size}) => (
              <Icon
                name="analytics"
                color={currentRouteName === 'DashBoard' ? colors.primary : color}
                size={size}
              />
            )}
            focused={currentRouteName === 'DashBoard'}
            labelStyle={{
              color: currentRouteName === 'DashBoard' ? colors.primary : colors.text,
              fontWeight: currentRouteName === 'DashBoard' ? 'bold' : 'normal',
            }}
            style={{
              backgroundColor: currentRouteName === 'DashBoard' ? colors.infoLight : 'transparent',
              borderRadius: 6,
              marginHorizontal: 4,
            }}
            onPress={() => props.navigation.navigate('HomeStack', { 
              screen: 'DashBoard' 
            })}
          />
        </>
      )} */}

      {/* Operations Section */}
      {availableMenus.length > 0 && (
        <>
          {/* <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Operations
              {hasAllPermissions && (
                <Text style={styles.allAccessText}> • Full Access</Text>
              )}
            </Text>
          </View> */}
          {availableMenus.map((item, index) => {
            const isFocused = currentRouteName === item.screen;
            return (
              <DrawerItem
                key={index}
                label={item.label}
                icon={({ color, size }) => (
                  <Icon
                    name={item.icon}
                    color={isFocused ? colors.primary : color}
                    size={size}
                  />
                )}
                focused={isFocused}
                labelStyle={{
                  color: isFocused ? colors.primary : colors.text,
                  fontWeight: isFocused ? typography.bold : typography.regular,
                }}
                style={{
                  backgroundColor: isFocused ? colors.infoLight : 'transparent',
                  borderRadius: 8,
                  marginHorizontal: spacing.xxs,
                }}
                onPress={() => props.navigation.navigate(item.screen)}
              />
            );
          })}
        </>
      )}

      {/* No Permissions Message (only show if user doesn't have "all" and no specific permissions) */}
      {!hasAllPermissions && availableMenus.length === 0 && !canViewAnalytics && (
        <View style={styles.noPermissions}>
          <Text style={styles.noPermissionsText}>
            No menu items available for your current permissions.
          </Text>
        </View>
      )}

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
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.text,
        drawerLabelStyle: {
          marginLeft: -15,
          fontSize: typography.md,
        },
      }}>
      <Drawer.Screen
        name="HomeStack"
        component={HomeStack}
        options={{title: 'Home'}}
      />

      {/* Add all screens that might be navigated to from the drawer */}
      {Object.values(menuConfig).map((menu, index) => (
        <Drawer.Screen
          key={index}
          name={menu.screen}
          component={getScreenComponent(menu.screen)}
        />
      ))}
    </Drawer.Navigator>
  );
}

// Helper function to get screen components
function getScreenComponent(screenName) {
  const screenComponents = {
    'MaintenanceSchedule': MaintenanceScheduleScreen,
    'MaintenanceCalendar': MaintenanceCalendarScreen,
    'MaintenanceJob': MaintenanceJob,
    'VehicleInspection': VehicleInspection,
    'VehicleBreakdown': VehicleBreakdown,
    'TripAssignment': TripAssignment,
    'TripExpenses': TripExpenses,
    'DriverRating': DriverRating,
    'TripStart': TripStart,
    'TripStop': TripStop,
    'RouteOptimization': RouteOptimization,
  };
  
  return screenComponents[screenName] || MaintenanceScheduleScreen; // fallback
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  headerTitle: {
    color: colors.white,
    fontSize: typography.xl,
    fontWeight: typography.bold,
    textAlign: 'center',
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  userInfo: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: typography.sm,
    textAlign: 'center',
    marginBottom: spacing.xxs,
  },
  allPermissionsBadge: {
    color: '#fef08a',
    fontWeight: typography.bold,
    fontSize: typography.xs,
  },
  permissionInfo: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.xs,
    textAlign: 'center',
  },
  loadingText: {
    color: colors.white,
    fontSize: typography.sm,
    textAlign: 'center',
  },
  sectionHeader: {
    padding: spacing.sm,
    backgroundColor: colors.borderLight,
  },
  sectionTitle: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: colors.textSecondary,
  },
  allAccessText: {
    color: colors.success,
    fontSize: typography.xs,
    fontWeight: typography.regular,
  },
  noPermissions: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  noPermissionsText: {
    color: colors.textMuted,
    fontSize: typography.sm,
    textAlign: 'center',
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    marginTop: spacing.md,
    paddingTop: spacing.xs,
  },
});

export default AppNavigator;