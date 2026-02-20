import React, { Fragment, useEffect, useState } from 'react';
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
  TouchableOpacity,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { Switch } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';

import { MyStatusBar } from '../../constants/config';
import { BASE_URL } from '../../constants/url';
import { storeObjByKey } from '../../utils/Storage';
import { checkuserToken } from '../../redux/actions/auth';
import { encode } from 'base-64';
import { colors } from '../../theme';
import { loginStyles } from './LoginStyles';
import { appStyles } from '../../styles/AppStyles';
import { Loader } from '../../components/Loader';
import Alertmodal from '../../components/Alertmodal/Alertmodal';
import Exitmodal from '../../components/Exitmodal';
import PasswordInput from './PasswordInput';

const Login = ({ navigation, route }) => {
  const [loader, setLoader] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [alertModal, setAlertModal] = useState(false);
  const [exitModal, setExitModal] = useState(false);
  const [pageLoad, setPageLoad] = useState(false);
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const dispatch = useDispatch();

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
        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'Internet Connected',
          visibilityTime: 3000,
        });
      } else {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'No Internet Connection',
          text2: 'Please check your connection.',
          visibilityTime: 4000,
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both email and password.', [{ text: 'OK' }]);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Validation Error', 'Please enter a valid email address.', [{ text: 'OK' }]);
      return;
    }

    setPageLoad(true);
    try {
      const pass = encode(password);
      const obj = encode(`${email}:${pass}`);
      const myHeaders = new Headers();
      myHeaders.append('Authorization', `Authenticate ${obj}`);

      const response = await fetch(`${BASE_URL}user/auth/`, {
        method: 'POST',
        headers: myHeaders,
        redirect: 'follow',
        timeout: 30000,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        await storeObjByKey('loginResponse', result);
        await storeObjByKey('project_sl', result?.data?.project_sl);
        setPageLoad(false);
        dispatch(checkuserToken());
      } else {
        setPageLoad(false);
        Alert.alert('Login Failed', result.message || 'Login failed. Please try again.', [{ text: 'OK' }]);
      }
    } catch (error) {
      setPageLoad(false);
      if (__DEV__) console.error('Login error:', error);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('HTTP error')) {
        errorMessage = 'Server error. Please try again later.';
      }
      Alert.alert('Login Error', errorMessage, [{ text: 'OK' }]);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route?.params?.registered) {
        setAlertMsg('Registered successfully. Please login!');
        setAlertModal(true);
        navigation.setParams({ registered: false });
      }
    });
    return unsubscribe;
  }, [navigation, route]);

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        setExitModal(true);
        setAlertMsg('Are you sure you want to exit the app?');
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => backHandler.remove();
    }, []),
  );

  return (
    <Fragment>
      <MyStatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <SafeAreaView style={[appStyles.safeareacontainer, loginStyles.safeareacontainer]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={loginStyles.scroll}>
            <View style={loginStyles.card}>
              <View style={loginStyles.logoBox}>
                <Image
                  source={require('../../assets/images/tracking.png')}
                  style={loginStyles.logo}
                  resizeMode="contain"
                />
                <Text style={loginStyles.title}>FleetCue</Text>
                <Text style={loginStyles.subtitle}>Fleet management made simple</Text>
              </View>

              <TextInput
                label="Email"
                style={loginStyles.inputWrap}
                mode="outlined"
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
                placeholder="Enter your email"
                placeholderTextColor={colors.textPlaceholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <PasswordInput password={password} setPassword={setPassword} />

              <View style={loginStyles.rememberRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Switch
                    value={isSwitchOn}
                    onValueChange={setIsSwitchOn}
                    color={colors.primary}
                  />
                  <Text style={[loginStyles.rememberLabel, { marginLeft: 8 }]}>Remember me</Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ForgotPassword')}
                  style={loginStyles.forgotLink}
                  activeOpacity={0.7}>
                  <Text style={loginStyles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                style={loginStyles.loginButton}
                activeOpacity={0.8}>
                <Text style={loginStyles.loginButtonText}>Sign in</Text>
              </TouchableOpacity>
            </View>

            <View style={loginStyles.footer}>
              <Text style={loginStyles.footerText}>
                © {new Date().getFullYear()} FleetCue · powered by{' '}
                <Text style={loginStyles.footerBrand}>Epsumlabs</Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

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
      <Toast />
    </Fragment>
  );
};

export default Login;
