import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Alert,
  Platform,
  Image,
  View,
  ActivityIndicator,
} from 'react-native';
import {MyStatusBar} from '../../constants/config';
import RNPermissions, {PERMISSIONS, RESULTS} from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';

const Splash = ({navigation}) => {
  const [location, setLocation] = useState(null);

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
            },
            {maximumAge: 10000},
          );
        }
      } catch (error) {
        console.error('Permission error:', error);
      } finally {
        setTimeout(() => {
          if (navigation) navigation.replace('Login');
        }, 1500); // Wait 1.5 seconds then navigate
      }
    };

    requestLocationPermission();
  }, [navigation]);

  return (
    <>
      <MyStatusBar backgroundColor={'#ffffff'} barStyle={'dark-content'} />
      <SafeAreaView style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/tracking.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
        </View>
      </SafeAreaView>
    </>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  loader: {
    marginTop: 20,
  },
});
