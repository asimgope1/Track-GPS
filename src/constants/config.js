import { StyleSheet, View, StatusBar, Platform } from "react-native";
import { Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Dimension Configuration
//----> Use HEIGHT & WIDTH for dynamic height & width throughout your code.
export const { width: WIDTH, height: HEIGHT } = Dimensions.get("window");

// Status bar height for use outside of React (e.g. before SafeAreaProvider).
// Prefer useStatusBarHeight() or MyStatusBar inside the app.
export const getStatusBarHeightForLayout = () => {
  if (Platform.OS === "android") {
    return StatusBar.currentHeight ?? 24;
  }
  return 44; // iOS default; useSafeAreaInsets() is accurate when inside SafeAreaProvider
};

/**
 * Hook for safe top inset (status bar + notch). Use inside screens for Toast topOffset etc.
 * Must be used within SafeAreaProvider.
 */
export const useStatusBarHeight = () => {
  const insets = useSafeAreaInsets();
  return insets.top;
};

// StatusBar component – optimized for all screen sizes (notch, punch-hole, different densities).
// Uses safe area top inset so content is never under the status bar. Use inside SafeAreaProvider.
export const MyStatusBar = ({ backgroundColor, ...props }) => {
  const insets = useSafeAreaInsets();
  const topInset = insets.top;

  return (
    <>
      <StatusBar
        animated={true}
        translucent
        backgroundColor={backgroundColor}
        {...props}
      />
      <View style={{ height: topInset, backgroundColor }} />
    </>
  );
};

//Styles configuration
export const STYLES = StyleSheet.create({
  //---> Use STYLES.elevation for cross platform elevation
  elevation: {
    shadowColor: "#1C1C1C",
    shadowOffset: { width: 2, height: 1.54 },
    shadowOpacity: 0.15,
    shadowRadius: 3.5,
    elevation: 5,
  },
});

export const STYLESCONFIG = StyleSheet.create({
  //---> Use STYLES.elevation for cross platform elevation
  elevation: {
    shadowColor: "#1C1C1C",
    shadowOffset: { width: 2, height: 1.5 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 2,
  },
});

export let mod = false;
