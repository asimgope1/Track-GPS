import React, {useEffect, useRef, useState} from 'react';
import {
  SafeAreaView,
  Animated,
  ImageBackground,
  StyleSheet,
  Alert,
  Platform,
  Image,
} from 'react-native';
import {MyStatusBar} from '../../constants/config';
import {HEIGHT, WIDTH} from '../../constants/config';
import RNPermissions, {PERMISSIONS, RESULTS} from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';

const Splash = ({navigation}) => {
  const [location, setLocation] = useState(null);

  // Animated values for markers
  const markerPositions = useRef([
    {x: new Animated.Value(-50), y: new Animated.Value(-50)},
    {x: new Animated.Value(WIDTH + 50), y: new Animated.Value(-50)},
    {x: new Animated.Value(-50), y: new Animated.Value(-50)},
    {x: new Animated.Value(WIDTH + 50), y: new Animated.Value(-50)},
  ]).current;

  const markerSize = useRef(new Animated.Value(40)).current; // Initial size

  useEffect(() => {
    // Request location permission and get geolocation
    const requestLocationPermission = async () => {
      try {
        const permission =
          Platform.OS === 'android'
            ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
            : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

        const result = await RNPermissions.request(permission);

        if (result === RESULTS.GRANTED) {
          Geolocation.getCurrentPosition(
            position => {
              setLocation(position.coords);
              console.log('Location:', position.coords);
            },
            error => {
              console.error('Geolocation error:', error.message);
              Alert.alert('Error', 'Failed to get location. Please try again.');
            },
            {maximumAge: 10000},
          );
        } else {
          Alert.alert('Permission Denied', 'Location permission is required.');
        }
      } catch (error) {
        console.error('Permission error:', error);
      }
    };

    requestLocationPermission();

    // Define target positions for each marker
    const initialTargetPositions = [
      {x: WIDTH / 4 - 50, y: HEIGHT / 2.3},
      {x: WIDTH / 2 + 60, y: HEIGHT / 2.5},
      {x: WIDTH / 4 - 30, y: HEIGHT / 2 + 140},
      {x: WIDTH / 2 + 35, y: HEIGHT / 2 + 80},
    ];

    // Step 1: Move markers to initial positions
    Animated.sequence(
      initialTargetPositions.map((target, index) =>
        Animated.parallel([
          Animated.timing(markerPositions[index].x, {
            toValue: target.x,
            duration: 1000,
            //useNativeDriver: true,
          }),
          Animated.timing(markerPositions[index].y, {
            toValue: target.y,
            duration: 1000,
            //useNativeDriver: true,
          }),
        ]),
      ),
    ).start(() => {
      // Step 2: Merge all markers to the center point
      Animated.parallel(
        markerPositions.map(pos =>
          Animated.parallel([
            Animated.timing(pos.x, {
              toValue: WIDTH / 2 - 20, // Move to center
              duration: 800,
              //useNativeDriver: true,
            }),
            Animated.timing(pos.y, {
              toValue: HEIGHT / 2 - 20, // Move to center
              duration: 800,
              //useNativeDriver: true,
            }),
          ]),
        ),
      ).start(() => {
        // Step 3: Increase marker size (useNativeDriver: false for width/height)
        Animated.timing(markerSize, {
          toValue: 100, // Increase size
          duration: 500,
          useNativeDriver: false, // Fixes the native driver issue
        }).start(() => {
          // Step 4: Navigate to login page after animation completes
          if (navigation) navigation.replace('Login');
        });
      });
    });
  }, [markerPositions, navigation]);

  return (
    <>
      <MyStatusBar
        backgroundColor={'rgba(100, 100, 100, 0.5)'}
        barStyle={'dark-content'}
      />
      <ImageBackground
        resizeMode="cover"
        source={require('../../assets/images/sattelite.jpg')}
        style={styles.backgroundImage}>
        <SafeAreaView style={styles.container}>
          {/* Render Animated Markers Dynamically */}
          {markerPositions.map((pos, index) => (
            <Animated.Image
              key={index}
              source={require('../../assets/images/location.png')} // Replace with your marker icon
              style={[
                styles.marker,
                {
                  transform: [{translateX: pos.x}, {translateY: pos.y}],
                  width: markerSize,
                  height: markerSize,
                },
              ]}
            />
          ))}
        </SafeAreaView>
      </ImageBackground>
    </>
  );
};

export default Splash;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: WIDTH * 1.2,
    height: HEIGHT * 1.2,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  marker: {
    position: 'absolute',
  },
});
