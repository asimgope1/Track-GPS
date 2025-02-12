import React, {Fragment, useEffect, useRef} from 'react';
import {View, SafeAreaView, Animated} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {BRAND, GRAY, GREEN, WHITE} from '../../constants/color';
import {LOGO, TATA} from '../../constants/imagepath';
import {HEIGHT, MyStatusBar, WIDTH} from '../../constants/config';
import {splashStyles} from './SplashStyles';
import {
  Skia,
  Canvas,
  Circle,
  RoundedRect,
  Patch,
  vec,
} from '@shopify/react-native-skia';

const Splash = ({navigation}) => {
  // Animated values for scaling and positioning
  const logoScale = useRef(new Animated.Value(1.5)).current;
  const tataScale = useRef(new Animated.Value(1.5)).current;
  const logoTranslateY = useRef(new Animated.Value(50)).current;
  const tataTranslateY = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Run both scale and translate animations in parallel
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(tataScale, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(logoTranslateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(tataTranslateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Navigate to the login screen once the animation is complete
      // navigation.navigate('Login');
    });
  }, []);
  const size = 100;
  const r = size * 0.2;
  const rrct = {
    rect: {x: 0, y: 150, width: size, height: size},
    topLeft: {x: 0, y: 0},
    topRight: {x: r, y: r},
    bottomRight: {x: 0, y: 0},
    bottomLeft: {x: r, y: r},
  };
  const PatchDemo = () => {
    // const colors = ['#61dafb', '#fb61da', '#61fbcf', '#dafb61'];

    const C = 64;
    const width = 500;
    const topLeft = {pos: vec(0, 0), c1: vec(0, C), c2: vec(C, 0)};
    const topRight = {
      pos: vec(width, 0),
      c1: vec(width, C),
      c2: vec(width + C, 0),
    };
    const bottomRight = {
      pos: vec(width, width),
      c1: vec(width, width - 2 * C),
      c2: vec(width - 2 * C, width),
    };
    const bottomLeft = {
      pos: vec(0, width),
      c1: vec(0, width - 2 * C),
      c2: vec(-2 * C, width),
    };

    return [
      {pos: topLeft.pos, c1: topLeft.c1, c2: topLeft.c2},
      {pos: topRight.pos, c1: topRight.c1, c2: topRight.c2},
      {pos: bottomLeft.pos, c1: bottomLeft.c1, c2: bottomLeft.c2},
      {pos: bottomRight.pos, c1: bottomRight.c1, c2: bottomRight.c2},
    ];
  };

  return (
    <Fragment>
      <MyStatusBar backgroundColor={'transparent'} barStyle={'dark-content'} />
      <SafeAreaView style={splashStyles.maincontainer}>
        <LinearGradient
          end={{x: 0, y: 0}}
          start={{x: 0, y: 1}}
          colors={[GREEN, GRAY]}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}>
          {/* Single Canvas to hold all Bubbles */}
          <Canvas style={styles.bubbleCanvas}>
            {/* Top Left Bubble */}
            <Circle cx={300} cy={700} r={100} color={WHITE} />
            {/* Top Right Bubble */}
            <Circle cx={50} cy={700} r={70} color={WHITE} />
            {/* Bottom Left Bubble */}
            <Circle cx={10} cy={10} r={100} color={WHITE} />
            {/* Bottom Right Bubble */}
            <Circle cx={300} cy={50} r={100} color={WHITE} />
            <RoundedRect
              x={10}
              y={300}
              width={100}
              height={100}
              r={25}
              color="lightblue"
            />
            <RoundedRect rect={rrct} color="lightblue" />
            <Patch
              patch={PatchDemo()}
              colors={['#61dafb', '#fb61da', '#61fbcf', '#dafb61']}
            />
          </Canvas>

          <View
            style={{
              ...splashStyles.logoContainer,
              width: WIDTH * 0.9,
              height: HEIGHT * 0.2,
              marginBottom: HEIGHT * 0.2,
            }}>
            {/* TATA Image with scale and translate animations */}
            <Animated.Image
              source={{}}
              style={{
                width: WIDTH * 0.8,
                height: HEIGHT * 0.2,
                tintColor: BRAND,
                transform: [{scale: tataScale}, {translateY: tataTranslateY}],
              }}
              resizeMode="contain"
            />
            {/* LOGO Image with scale and translate animations */}
            <Animated.Image
              source={{}}
              style={{
                width: WIDTH * 0.8,
                height: HEIGHT * 0.08,
                tintColor: BRAND,
                transform: [{scale: logoScale}, {translateY: logoTranslateY}],
              }}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>
      </SafeAreaView>
    </Fragment>
  );
};

const styles = {
  bubbleCanvas: {
    position: 'absolute',
    width: WIDTH,
    height: HEIGHT,
    top: 0,
    left: 0,
  },
};

export default Splash;
