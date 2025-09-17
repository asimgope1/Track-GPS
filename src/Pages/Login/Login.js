/* eslint-disable prettier/prettier */
import {
  View,
  Text,
  Image,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  BackHandler,
  Modal,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import React, {Fragment, useEffect, useState} from 'react';
import {BLACK, GREEN, GRAY, ORANGE, WHITE} from '../../constants/color';
import CustomButton from '../../components/CustomButton';
import {loginStyles} from './LoginStyles';
import {HEIGHT, MyStatusBar, WIDTH} from '../../constants/config';
import {CustomTextInput} from '../../components/CustomTextInput';
import {Loader} from '../../components/Loader';
import {appStyles} from '../../styles/AppStyles';
import {EXTRABOLD, MEDIUM, REGULAR, SEMIBOLD} from '../../constants/fontfamily';
import {RFValue} from 'react-native-responsive-fontsize';
import {useFocusEffect} from '@react-navigation/native';
import {BASE_URL} from '../../constants/url';
import {POSTNETWORK} from '../../utils/Network';
import {storeObjByKey} from '../../utils/Storage';
import Alertmodal from '../../components/Alertmodal/Alertmodal';
import Exitmodal from '../../components/Exitmodal';
import {BG, LOGO, TATA} from '../../constants/imagepath';
import {Card, Icon, Input} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import {Switch, TextInput} from 'react-native-paper';
import {useDispatch} from 'react-redux';
import {checkuserToken} from '../../redux/actions/auth';
import {encode, decode} from 'base-64';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-toast-message';
import NetInfo from '@react-native-community/netinfo';
const Login = ({navigation, route}) => {
  const [loader, setLoader] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [alertModal, setAlertModal] = useState(false);
  const [exitModal, setExitModal] = useState(false);
  const [pageLoad, setPageLoad] = useState(false);
  const Dispatch = useDispatch();

  const [isSwitchOn, setIsSwitchOn] = React.useState(false);

  const onToggleSwitch = () => setIsSwitchOn(!isSwitchOn);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setPassword('');
      setEmail('');
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        // Green toast for internet connected

        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'Internet Connected',
          text2: 'You are now connected to the internet.',
          visibilityTime: 7000,
          autoHide: true,
          style: {
            backgroundColor: 'green', // Green for success
            borderRadius: 20, // Rounded corners
            paddingVertical: 15,
            paddingHorizontal: 20,
            marginBottom: 50, // Some space from the bottom
            shadowColor: 'black', // Shadow for elevation effect
            shadowOffset: {width: 0, height: 5},
            shadowOpacity: 0.2,
            shadowRadius: 10,
          },
          text1Style: {
            color: 'green',
            fontSize: 18,
            fontWeight: 'bold',
          },
          text2Style: {
            color: 'lightgreen',
            fontSize: 14,
          },
        });
      } else {
        // Red toast for no internet connection
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'No Internet Connection',
          text2: 'Please check your internet connection.',
          visibilityTime: 7000,
          autoHide: true,
          style: {
            backgroundColor: 'red', // Red for error
            borderRadius: 20,
            paddingVertical: 15,
            paddingHorizontal: 20,
            marginBottom: 50,
            shadowColor: 'black',
            shadowOffset: {width: 0, height: 5},
            shadowOpacity: 0.3,
            shadowRadius: 10,
          },
          text1Style: {
            color: 'red',
            fontSize: 18,
            // fontFamily: 'Arial-BoldMT',
            fontWeight: 'bold',
          },
          text2Style: {
            color: 'orange',
            fontSize: 14,
            // fontFamily: 'Arial',
          },
        });
      }
    });

    return () => unsubscribe(); // Cleanup on component unmount
  }, []);

  const handleLogin = () => {
    console.log('Credentials:', email, password);
    setPageLoad(true);

    // Encode password and email
    const pass = encode(password);
    const obj = encode(`${email}:${pass}`);
    console.log('object', obj);

    const myHeaders = new Headers();
    myHeaders.append('Authorization', `Authenticate ${obj}`);

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow',
    };

    fetch(`${BASE_URL}user/auth/`, requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log('result at login', result);
        storeObjByKey('loginResponse', result);
        Dispatch(checkuserToken());
        setPageLoad(false);
        console.log(result);
      })
      .catch(error => {
        setPageLoad(false);
        console.error(error);
      });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route?.params?.registered) {
        setAlertMsg('Registered successfully, Please login!');
        setAlertModal(true);
        navigation.setParams({registered: false});
      }
    });
    return unsubscribe;
  }, [navigation, route]);

  useFocusEffect(() => {
    const backAction = () => {
      setExitModal(true);
      setAlertMsg('Are you sure you want to Exit app?');
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  });

  return (
    <Fragment>
      <MyStatusBar backgroundColor={'transparent'} barStyle={'dark-content'} />
      <SafeAreaView style={[appStyles.safeareacontainer]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{flex: 1}}>
          <ImageBackground
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            source={require('../../assets/images/map1.jpeg')}
            resizeMode="cover">
            <ScrollView
              keyboardShouldPersistTaps={'handled'}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                flexGrow: 1,
                alignItems: 'center',
                // paddingBottom: 10,
                alignSelf: 'center',
                justifyContent: 'center',
              }}>
              <View
                style={{
                  width: WIDTH * 0.9,
                  alignSelf: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)', // Slightly opaque background
                  alignItems: 'center',
                  borderRadius: 15,
                  paddingTop: HEIGHT * 0.1,
                  paddingBottom: HEIGHT * 0.1,
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 5},
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                }}>
                {/* Logo and Title */}
                <Image
                  source={require('../../assets/images/tracking.png')}
                  style={{width: 120, height: 120, marginBottom: HEIGHT * 0.05}}
                />

                {/* Email Input */}
                <TextInput
                  label="Email"
                  style={{
                    width: WIDTH * 0.8,
                    marginTop: HEIGHT * 0.03,
                    backgroundColor: 'white',
                  }}
                  mode="outlined"
                  outlineColor={GREEN}
                  activeOutlineColor={GREEN}
                  placeholder="Email"
                  placeholderTextColor={GRAY}
                  value={email}
                  onChangeText={text => setEmail(text)}
                />

                {/* Password Input */}
                <TextInput
                  label="Password"
                  style={{
                    width: WIDTH * 0.8,
                    marginTop: HEIGHT * 0.02,
                    backgroundColor: 'white',
                  }}
                  mode="outlined"
                  outlineColor={GREEN}
                  activeOutlineColor={GREEN}
                  placeholder="Password"
                  placeholderTextColor={GRAY}
                  value={password}
                  onChangeText={text => setPassword(text)}
                />

                {/* Remember Me Switch */}
                <View
                  style={{
                    width: WIDTH * 0.8,
                    height: HEIGHT * 0.07,
                    alignItems: 'center',
                    flexDirection: 'row',
                    marginTop: HEIGHT * 0.02,
                  }}>
                  <Switch
                    value={isSwitchOn}
                    onValueChange={onToggleSwitch}
                    style={{
                      marginRight: 10,
                      tintColor: isSwitchOn ? WHITE : ORANGE,
                    }}
                    color="orange"
                  />
                  <Text
                    style={{
                      color: BLACK,
                      fontSize: RFValue(12),
                      fontFamily: REGULAR,
                    }}>
                    Remember Me
                  </Text>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('ForgotPassword')}
                  style={{
                    width: WIDTH * 0.8,
                    alignItems: 'flex-end',
                    marginTop: HEIGHT * 0.02,
                  }}>
                  <Text
                    style={{
                      color: BLACK,
                      fontSize: RFValue(12),
                      fontFamily: SEMIBOLD,
                    }}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity
                  onPress={handleLogin}
                  style={{
                    width: WIDTH * 0.8,
                    height: HEIGHT * 0.065,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: GREEN,
                    borderRadius: 10,
                    marginTop: HEIGHT * 0.02,
                  }}>
                  <Text
                    style={{
                      color: WHITE,
                      fontSize: RFValue(14),
                      fontFamily: REGULAR,
                    }}>
                    Login
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View
                style={{
                  width: WIDTH * 0.9,
                  height: HEIGHT * 0.04,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: HEIGHT * 0.05,
                }}>
                <Text
                  style={{
                    color: BLACK,
                    fontSize: RFValue(12),
                    fontFamily: MEDIUM,
                  }}>
                  © 2024, made by{' '}
                  <Text
                    style={{
                      color: BLACK,
                      fontSize: RFValue(14),
                      fontFamily: EXTRABOLD,
                    }}>
                    Epsumlabs
                  </Text>
                </Text>
              </View>
              <View
                style={{
                  width: WIDTH,
                  height: HEIGHT * 0.21,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: HEIGHT * 0.08,
                  backgroundColor: 'transparent',
                }}>
                {/* <VideoPlayer /> */}
                {/* <FastImage
                  source={require('../../assets/images/truckVideo.gif')}
                  style={{
                    height: '100%',
                    width: '100%',
                    resizeMode: 'cover',
                  }}
                /> */}
              </View>
            </ScrollView>
          </ImageBackground>

          {loader && <Loader />}
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Modals */}
      {alertModal && (
        <Alertmodal
          visible={alertModal}
          message={alertMsg}
          onClose={() => setAlertModal(false)}
        />
      )}
      {exitModal && (
        <Exitmodal
          visible={exitModal}
          message="Are you sure you want to exit?"
          onClose={() => setExitModal(false)}
          onConfirm={() => BackHandler.exitApp()}
        />
      )}
      <Loader visible={pageLoad} />
      <Toast ref={ref => Toast.setRef(ref)} />
    </Fragment>
  );
};

export default Login;
