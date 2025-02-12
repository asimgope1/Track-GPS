import { useState } from "react";
import { StyleSheet, View, StatusBar, SafeAreaView } from "react-native";
import { Dimensions } from "react-native";

// Dimension Configuration
//----> Use HEIGHT & WIDTH for dynamic height & width throughout your code.
export const { width: WIDTH, height: HEIGHT } = Dimensions.get("window");

//Statusbar Configuration
//---> Use MyStatusBar for cross platform
export const MyStatusBar = ({ backgroundColor, ...props }) => (
  <View style={{ height: StatusBar.currentHeight, backgroundColor }}>
    <SafeAreaView>
      <StatusBar
        animated={true}
        translucent
        backgroundColor={backgroundColor}
        {...props}
      />
    </SafeAreaView>
  </View>
);

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
