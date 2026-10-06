import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  ImageBackground,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

interface SplashScreenProps {
  navigation?: any;
  onFinish?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SplashScreen({ navigation, onFinish }: SplashScreenProps) {
  const { state } = useAuth();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const logoWidth = Math.min(SCREEN_WIDTH * 0.74, 300);
  const logoHeight = logoWidth / (1488 / 1057);

  useEffect(() => {
    // 1. Entrance animation for the logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Loading progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();

    // 3. Smooth transition to next screen
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      } else if (navigation) {
        if (!state.isLoading && !state.token) {
          navigation.replace('Login');
        }
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [state.isLoading, state.token, onFinish, navigation]);

  const progressInterpolate = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Full-screen Background with Westminster Bridge & London Cityscape */}
      <ImageBackground
        source={require('../../../assets/launchscreenback.png')}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Centered Logo & Glowing Progress Bar */}
        <View style={styles.centerContainer}>
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Image
              source={require('../../../assets/logolaunch.png')}
              style={{ width: logoWidth, height: logoHeight }}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Glowing Progress Bar matching design */}
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressInterpolate,
                },
              ]}
            />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1e3f',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // Positioned slightly above the vertical center to balance with the London bridge below
    paddingBottom: 70,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    width: 140,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 114, 255, 0.28)',
    overflow: 'hidden',
    marginTop: 22,
    ...Platform.select({
      ios: {
        shadowColor: '#00d2ff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00d2ff',
    borderRadius: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#00d2ff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});
