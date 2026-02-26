import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
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
import TripMaster from '../Pages/Sidebarpages/TripMaster';
import { clearAll, getObjByKey } from '../utils/Storage';
import { useDispatch } from 'react-redux';
import { checkuserToken } from '../redux/actions/auth';
import MaintenanceJob from '../Pages/Sidebarpages/MaintenanceJob';
import TripStart from '../Pages/Sidebarpages/TripStart';
import TripStop from '../Pages/Sidebarpages/TripStop';
import { spacing, typography } from '../theme';
import { useAppTheme } from '../theme/ThemeContext';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// ─── Stack ────────────────────────────────────────────────────────────────────
function HomeStack() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
      <Stack.Screen name="DashBoard" component={DashBoard} options={{ headerShown: false }} />
      <Stack.Screen name="VehicleMap" component={VehicleMap} />
      <Stack.Screen name="Track" component={Track} />
      <Stack.Screen name="HistoryModal" component={HistoryModal} />
      <Stack.Screen name="DescriptionData" component={DescriptionData} />
      <Stack.Screen name="MaintenanceSchedule" component={MaintenanceScheduleScreen} />
    </Stack.Navigator>
  );
}

// ─── Permission config (unchanged) ───────────────────────────────────────────
const menuConfig = {
  maintenance_schedule: {
    label: 'Maintenance Schedule', icon: 'schedule', screen: 'MaintenanceSchedule',
    permissions: { create: 'create_maintenance_schedule', read: 'read_maintenance_schedule', edit: 'edit_maintenance_schedule', delete: 'delete_maintenance_schedule' },
  },
  maintenance_calendar: {
    label: 'Maintenance Calendar', icon: 'calendar-today', screen: 'MaintenanceCalendar',
    permissions: { view: 'view_maintenance_calendar' },
  },
  maintenance_job: {
    label: 'Maintenance Job', icon: 'assignment', screen: 'MaintenanceJob',
    permissions: { create: 'create_maintenance_job', read: 'read_maintenance_job', edit: 'edit_maintenance_job', delete: 'delete_maintenance_job' },
  },
  vehicle_inspection: {
    label: 'Vehicle Inspection', icon: 'car-repair', screen: 'VehicleInspection',
    permissions: { create: 'create_vehicle_inspection', read: 'read_vehicle_inspection', edit: 'edit_vehicle_inspection', delete: 'delete_vehicle_inspection' },
  },
  vehicle_breakdown: {
    label: 'Vehicle Breakdown', icon: 'warning', screen: 'VehicleBreakdown',
    permissions: { create: 'create_vehicle_breakdown', read: 'read_vehicle_breakdown', edit: 'edit_vehicle_breakdown', delete: 'delete_vehicle_breakdown' },
  },
  trip_assignment: {
    label: 'Trip Assignment', icon: 'assignment', screen: 'TripAssignment',
    permissions: { create: 'create_trip_assignment', read: 'read_trip_assignment', edit: 'edit_trip_assignment', delete: 'delete_trip_assignment' },
  },
  trip_master: {
    label: 'Create Trip', icon: 'add-box', screen: 'TripMaster',
    permissions: { create: 'create_trip_master', read: 'read_trip_master', edit: 'edit_trip_master', delete: 'delete_trip_master' },
  },
  trip_expenses: {
    label: 'Trip Expenses', icon: 'attach-money', screen: 'TripExpenses',
    permissions: { create: 'create_expense_entry', read: 'read_expense_entry', edit: 'edit_expense_entry', delete: 'delete_expense_entry' },
  },
  driver_rating: {
    label: 'Driver Rating', icon: 'star-rate', screen: 'DriverRating',
    permissions: { create: 'create_driver_rating', read: 'read_driver_rating', edit: 'edit_driver_rating', delete: 'delete_driver_rating' },
  },
  trip_start: {
    label: 'Trip Start', icon: 'play-arrow', screen: 'TripStart',
    permissions: { create: 'create_trip_request', read: 'read_trip_request' },
  },
  trip_stop: {
    label: 'Trip Stop', icon: 'stop', screen: 'TripStop',
    permissions: { create: 'create_trip_request', read: 'read_trip_request' },
  },
  route_optimization: {
    label: 'Route Optimization', icon: 'route', screen: 'RouteOptimization',
    permissions: { view: 'view_trip_report' },
  },
};

// ─── Drawer content (fully theme-aware) ──────────────────────────────────────
const CustomDrawerContent = props => {
  const [userData, setUserData] = React.useState(null);
  const Dispatch = useDispatch();
  const { theme, isDark, toggleTheme } = useAppTheme();
  const c = theme.colors;

  const currentRouteName = props.state.routeNames[props.state.index];

  React.useEffect(() => {
    getObjByKey('loginResponse')
      .then(res => setUserData(res?.data || null))
      .catch(err => console.error('Error fetching user data:', err));
  }, []);

  const hasAllPermission = () => userData?.permissions?.includes('all');

  const hasPermission = menuKey => {
    if (!userData?.permissions) return false;
    if (hasAllPermission()) return true;
    const menu = menuConfig[menuKey];
    if (!menu) return false;
    return Object.values(menu.permissions).some(p => userData.permissions.includes(p));
  };

  const hasViewPermissions = () => {
    if (!userData?.permissions) return false;
    if (hasAllPermission()) return true;
    const vp = [
      'view_vehicle_analytics', 'view_driver_analytics', 'view_fuel_analytics',
      'view_maintenance_analytics', 'view_trip_report', 'view_vehicle_report',
      'view_expense_report', 'view_maintenance_report', 'view_breakdown_report',
      'view_vehicle_utilization_report', 'view_driver_utilization_report',
    ];
    return vp.some(p => userData.permissions.includes(p));
  };

  const getAvailableMenuItems = () => {
    if (!userData) return [];
    if (hasAllPermission()) return Object.values(menuConfig);
    const keys = Object.keys(menuConfig).filter(k => hasPermission(k));
    const isDriver = userData.user_type === 'driver';
    const driverKeys = isDriver ? ['trip_start', 'trip_stop'] : [];
    return [...new Set([...keys, ...driverKeys])].map(k => menuConfig[k]);
  };

  // Theme-aware dynamic styles
  const drawerBg   = isDark ? 'rgba(15, 23, 42, 0.97)' : '#FFFFFF';
  const divider    = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.12)';
  const focusedBg  = c.primary;
  const focusedTxt = '#FFFFFF';                          // always white on indigo pill
  const normalTxt  = c.text;                             // dark slate in light, white in dark
  const normalIcon = isDark ? 'rgba(255,255,255,0.55)' : '#64748B';
  const toggleTrackOn  = c.primary;
  const toggleTrackOff = isDark ? '#374151' : '#E2E8F0'; // dark gray / light gray
  const toggleAccent   = isDark ? '#818CF8' : '#6366F1';

  if (!userData) {
    return (
      <DrawerContentScrollView {...props} style={{ backgroundColor: drawerBg }}>
        <View style={[dynStyles.header, { borderBottomColor: divider }]}>
          <Text style={[dynStyles.headerTitle, { color: c.text }]}>Fleet Management</Text>
          <Text style={[dynStyles.loadingText, { color: c.textMuted }]}>Loading...</Text>
        </View>
      </DrawerContentScrollView>
    );
  }

  const availableMenus = getAvailableMenuItems();
  const hasAllPermissions = hasAllPermission();

  return (
    <DrawerContentScrollView
      {...props}
      style={{ backgroundColor: drawerBg }}
      contentContainerStyle={{ paddingBottom: spacing.lg }}>

      {/* Header */}
      <View style={[dynStyles.header, { borderBottomColor: divider }]}>
        <Text style={[dynStyles.headerTitle, { color: c.text }]}>Fleet Management</Text>
        <Text style={[dynStyles.userInfo, { color: c.textSecondary }]}>
          {userData.user_type?.charAt(0).toUpperCase() + userData.user_type?.slice(1)}
          {hasAllPermissions && (
            <Text style={{ color: c.warning, fontWeight: typography.bold, fontSize: typography.xs }}>
              {'  '}• ALL PERMISSIONS
            </Text>
          )}
        </Text>
        <Text style={[dynStyles.permissionInfo, { color: c.textMuted }]}>
          {hasAllPermissions ? 'Full system access' : `${userData.permissions?.length} permissions available`}
        </Text>

        {/* Theme toggle */}
        <View style={dynStyles.themeRow}>
          <Icon
            name={isDark ? 'nightlight-round' : 'wb-sunny'}
            size={14}
            color={toggleAccent}
          />
          <Text style={[dynStyles.themeLabel, { color: c.textMuted }]}>
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </Text>
          <View style={[dynStyles.toggleTrack, { backgroundColor: isDark ? toggleTrackOn : toggleTrackOff }]}>
            <View
              style={[
                dynStyles.toggleThumb,
                { transform: [{ translateX: isDark ? 20 : 2 }], backgroundColor: isDark ? '#FFFFFF' : '#6366F1' },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Home */}
      <DrawerItem
        label="Home"
        icon={({ size }) => (
          <Icon
            name="home"
            color={currentRouteName === 'HomeStack' ? focusedTxt : normalIcon}
            size={size}
          />
        )}
        focused={currentRouteName === 'HomeStack'}
        labelStyle={{
          color: currentRouteName === 'HomeStack' ? focusedTxt : normalTxt,
          fontWeight: currentRouteName === 'HomeStack' ? typography.bold : typography.medium,
        }}
        style={{
          backgroundColor: currentRouteName === 'HomeStack' ? focusedBg : 'transparent',
          borderRadius: 10,
          marginHorizontal: spacing.xs,
        }}
        onPress={() => props.navigation.navigate('HomeStack')}
      />

      {/* Dynamic menu items */}
      {availableMenus.map((item, index) => {
        const isFocused = currentRouteName === item.screen;
        return (
          <DrawerItem
            key={index}
            label={item.label}
            icon={({ size }) => (
              <Icon
                name={item.icon}
                color={isFocused ? focusedTxt : normalIcon}
                size={size}
              />
            )}
            focused={isFocused}
            labelStyle={{
              color: isFocused ? focusedTxt : normalTxt,
              fontWeight: isFocused ? typography.bold : typography.medium,
            }}
            style={{
              backgroundColor: isFocused ? focusedBg : 'transparent',
              borderRadius: 10,
              marginHorizontal: spacing.xs,
            }}
            onPress={() => props.navigation.navigate(item.screen)}
          />
        );
      })}

      {!hasAllPermissions && availableMenus.length === 0 && (
        <View style={dynStyles.noPermissions}>
          <Text style={[dynStyles.noPermissionsText, { color: c.textMuted }]}>
            No menu items available for your current permissions.
          </Text>
        </View>
      )}

      {/* Footer – logout */}
      <View style={[dynStyles.footer, { borderTopColor: c.border }]}>
        <DrawerItem
          label="Logout"
          icon={({ size }) => <Icon name="exit-to-app" color={c.error} size={size} />}
          onPress={() => { clearAll(); Dispatch(checkuserToken()); }}
          labelStyle={{ color: c.error, fontWeight: typography.bold }}
        />
      </View>
    </DrawerContentScrollView>
  );
};

// ─── Helper ───────────────────────────────────────────────────────────────────
function getScreenComponent(screenName) {
  const map = {
    MaintenanceSchedule: MaintenanceScheduleScreen,
    MaintenanceCalendar: MaintenanceCalendarScreen,
    MaintenanceJob: MaintenanceJob,
    VehicleInspection: VehicleInspection,
    VehicleBreakdown: VehicleBreakdown,
    TripAssignment: TripAssignment,
    TripMaster: TripMaster,
    TripExpenses: TripExpenses,
    DriverRating: DriverRating,
    TripStart: TripStart,
    TripStop: TripStop,
    RouteOptimization: RouteOptimization,
  };
  return map[screenName] || MaintenanceScheduleScreen;
}

// ─── App Navigator (drawer) ───────────────────────────────────────────────────
function AppNavigator() {
  const { theme, isDark } = useAppTheme();
  const c = theme.colors;

  return (
    <Drawer.Navigator
      initialRouteName="HomeStack"
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: 'left',
        drawerType: 'front',
        drawerActiveTintColor: c.primary,
        drawerInactiveTintColor: c.text,
        sceneContainerStyle: { backgroundColor: 'transparent' },
        // Drawer panel background adapts to theme
        drawerStyle: {
          backgroundColor: isDark
            ? 'rgba(15, 23, 42, 0.97)'
            : 'rgba(248, 250, 252, 0.98)',
          width: 280,
        },
        drawerLabelStyle: { marginLeft: -15, fontSize: typography.md },
      }}>
      <Drawer.Screen name="HomeStack" component={HomeStack} options={{ title: 'Home' }} />
      {Object.values(menuConfig).map((menu, index) => (
        <Drawer.Screen key={index} name={menu.screen} component={getScreenComponent(menu.screen)} />
      ))}
    </Drawer.Navigator>
  );
}

// ─── Static styles (layout only, no colours) ─────────────────────────────────
const dynStyles = StyleSheet.create({
  header: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    textAlign: 'center',
    marginBottom: spacing.xxs,
    letterSpacing: 0.3,
  },
  userInfo: {
    fontSize: typography.sm,
    textAlign: 'center',
    marginBottom: spacing.xxs,
  },
  permissionInfo: {
    fontSize: typography.xs,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  loadingText: { fontSize: typography.sm, textAlign: 'center' },
  noPermissions: { padding: spacing.xl, alignItems: 'center' },
  noPermissionsText: { fontSize: typography.sm, textAlign: 'center' },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.xs,
  },
  themeLabel: { fontSize: typography.xs, flex: 1 },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
  },
});

export default AppNavigator;