import {
  Skia,
  drawAsImage,
  Group,
  Rect,
  Canvas,
  Atlas,
  rect,
  useTexture,
  useRSXformBuffer,
} from '@shopify/react-native-skia';
import {useSharedValue, useDerivedValue} from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import {HEIGHT, WIDTH} from '../../constants/config';
const size = {width: 25, height: 11.25};
const strokeWidth = 2;
const textureSize = {
  width: size.width + strokeWidth,
  height: size.height + strokeWidth,
};
const Splash = () => {
  const pos = useSharedValue({x: 0, y: 0});
  const texture = useTexture(
    <Group>
      <Rect
        rect={rect(strokeWidth / 2, strokeWidth / 2, size.width, size.height)}
        color="cyan"
      />
      <Rect
        rect={rect(strokeWidth / 2, strokeWidth / 2, size.width, size.height)}
        color="blue"
        style="stroke"
        strokeWidth={strokeWidth}
      />
    </Group>,
    textureSize,
  );
  const gesture = Gesture.Pan().onChange(e => (pos.value = e));
  const numberOfBoxes = 500;
  const width = WIDTH;
  const sprites = new Array(numberOfBoxes)
    .fill(0)
    .map(() => rect(0, 0, textureSize.width, textureSize.height));
  const transforms = useRSXformBuffer(numberOfBoxes, (val, i) => {
    'worklet';
    const tx = 5 + ((i * size.width) % width);
    const ty = 25 + Math.floor(i / (width / size.width)) * size.width;
    const r = Math.atan2(pos.value.y - ty, pos.value.x - tx);
    val.set(Math.cos(r), Math.sin(r), tx, ty);
  });
  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
      }}>
      <GestureDetector gesture={gesture}>
        <Canvas style={{flex: 1}}>
          <Atlas image={texture} sprites={sprites} transforms={transforms} />
        </Canvas>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

export default Splash;




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

  const PatchDemo = () => {
    const C = 64;
    const width = 256; // Use the screen width for larger patches
    const height = 500; // Use the screen height

    const topLeft = {pos: vec(0, 0), c1: vec(0, C), c2: vec(C, 0)};
    const topRight = {
      pos: vec(width, 0),
      c1: vec(width, C),
      c2: vec(width + C, 0),
    };
    const bottomRight = {
      pos: vec(width, height),
      c1: vec(width, height - 2 * C),
      c2: vec(width - 2 * C, height),
    };
    const bottomLeft = {
      pos: vec(0, height),
      c1: vec(0, height - 2 * C),
      c2: vec(-2 * C, height),
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
          {/* Single Canvas to hold the Patch */}
          <Canvas style={styles.bubbleCanvas}>
            {/* Define the Patch */}
            <Patch
              patch={PatchDemo()}
              colors={['#61dafb', '#fb61da', '#61fbcf', '#dafb61']} // Colors for the Patch
            />
          </Canvas>

          <View
            style={{
              ...splashStyles.logoContainer,
              width: WIDTH * 0.9,
              height: HEIGHT * 0.2,
              marginBottom: HEIGHT * 0.2,
            }}></View>
        </LinearGradient>
      </SafeAreaView>
    </Fragment>
  );
};

const styles = {
  bubbleCanvas: {
    position: 'absolute',
    width: WIDTH, // Cover full width
    height: HEIGHT, // Cover full height
    top: 0,
    left: 0,
  },
};

export default Splash;
