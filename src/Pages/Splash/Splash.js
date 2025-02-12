import React, {useEffect, useRef, useState} from 'react';
import {
  SafeAreaView,
  Animated,
  ImageBackground,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import {MyStatusBar} from '../../constants/config';
import {WHITE} from '../../constants/color';
import {HEIGHT, WIDTH} from '../../constants/config';
import RNPermissions, {PERMISSIONS, RESULTS} from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';

const Splash = ({navigation}) => {
  const [location, setLocation] = useState(null);

  // Animated values for circles
  const circlePositions = useRef([
    {x: new Animated.Value(-50), y: new Animated.Value(-50)}, // Circle 1
    {x: new Animated.Value(WIDTH + 50), y: new Animated.Value(-50)}, // Circle 2
    {x: new Animated.Value(-50), y: new Animated.Value(-50)}, // Circle 3
    {x: new Animated.Value(WIDTH + 50), y: new Animated.Value(-50)}, // Circle 4
  ]).current;

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
          // Permission granted, get geolocation
          Geolocation.getCurrentPosition(
            position => {
              setLocation(position.coords); // Set the user's location
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

    // Define target positions for each circle
    const targetPositions = [
      {x: WIDTH / 4 - 100, y: HEIGHT / 2.3}, // Circle 1
      {x: WIDTH / 2 + 95, y: HEIGHT / 3}, // Circle 2
      {x: WIDTH / 4 - 70, y: HEIGHT / 2 + 140}, // Circle 3
      {x: WIDTH / 2 - 15, y: HEIGHT / 2 + 40}, // Circle 4
    ];

    // Sequential animation for all circles
    Animated.sequence(
      targetPositions.map((target, index) =>
        Animated.parallel([
          Animated.timing(circlePositions[index].x, {
            toValue: target.x,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(circlePositions[index].y, {
            toValue: target.y,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ),
    ).start(() => {
      // Navigate to the next screen after animation
      if (navigation) navigation.navigate('Login');
    });
  }, [circlePositions, navigation]);

  return (
    <>
      <MyStatusBar
        backgroundColor={'rgba(100, 100, 100, 0.5)'}
        barStyle={'dark-content'}
      />
      <ImageBackground
        resizeMode="cover"
        source={require('../../assets/images/map1.jpeg')}
        style={styles.backgroundImage}>
        <SafeAreaView style={styles.container}>
          {/* Render Animated Circles Dynamically */}
          {circlePositions.map((pos, index) => (
            <Animated.View
              key={index}
              style={[
                styles.circle,
                index === 0 && styles.smallCircle, // Apply smaller size for Circle 1
                {
                  backgroundColor: WHITE,
                  transform: [{translateX: pos.x}, {translateY: pos.y}],
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
    width: WIDTH,
    height: HEIGHT,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    position: 'absolute',
  },
  smallCircle: {
    width: 40,
    height: 40,
  },
});
