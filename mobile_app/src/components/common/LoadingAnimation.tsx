import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';

export type LoadingType = 'spinner' | 'pulse' | 'dots' | 'wave' | 'shimmer' | 'ayurveda';

interface LoadingAnimationProps {
  type?: LoadingType;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
  overlay?: boolean;
  visible?: boolean;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  type = 'spinner',
  size = 'medium',
  color,
  message,
  overlay = false,
  visible = true,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const primaryColor = color || colors.herbalGreen;

  // Animation values
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const waveValue = useRef(new Animated.Value(0)).current;
  const shimmerValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  // Size configurations
  const sizeConfig = {
    small: { container: 40, icon: 20, dots: 6 },
    medium: { container: 60, icon: 30, dots: 8 },
    large: { container: 80, icon: 40, dots: 10 },
  };

  const config = sizeConfig[size];

  useEffect(() => {
    if (!visible) return;

    // Fade in animation
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Spinner animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );

    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    // Dots animation
    const dotsAnimation = Animated.loop(
      Animated.stagger(200, [
        Animated.sequence([
          Animated.timing(dot1, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot1, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dot2, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dot3, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
      ])
    );

    // Wave animation
    const waveAnimation = Animated.loop(
      Animated.timing(waveValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );

    // Shimmer animation
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );

    // Start appropriate animation
    switch (type) {
      case 'spinner':
      case 'ayurveda':
        spinAnimation.start();
        break;
      case 'pulse':
        pulseAnimation.start();
        break;
      case 'dots':
        dotsAnimation.start();
        break;
      case 'wave':
        waveAnimation.start();
        break;
      case 'shimmer':
        shimmerAnimation.start();
        break;
    }

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
      dotsAnimation.stop();
      waveAnimation.stop();
      shimmerAnimation.stop();
    };
  }, [visible, type, spinValue, pulseValue, dot1, dot2, dot3, waveValue, shimmerValue, fadeValue]);

  if (!visible) return null;

  const renderLoadingContent = () => {
    switch (type) {
      case 'spinner':
        return (
          <Animated.View
            style={[
              styles.spinner,
              {
                width: config.container,
                height: config.container,
                borderColor: primaryColor,
                transform: [{
                  rotate: spinValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                }],
              },
            ]}
          />
        );

      case 'pulse':
        return (
          <Animated.View
            style={[
              styles.pulse,
              {
                width: config.container,
                height: config.container,
                backgroundColor: primaryColor,
                transform: [{
                  scale: pulseValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  }),
                }],
                opacity: pulseValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.3],
                }),
              },
            ]}
          />
        );

      case 'dots':
        return (
          <View style={styles.dotsContainer}>
            {[dot1, dot2, dot3].map((dot, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: config.dots,
                    height: config.dots,
                    backgroundColor: primaryColor,
                    transform: [{
                      scale: dot.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      }),
                    }],
                    opacity: dot.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                  },
                ]}
              />
            ))}
          </View>
        );

      case 'wave':
        return (
          <View style={styles.waveContainer}>
            {[0, 1, 2, 3, 4].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.waveLine,
                  {
                    backgroundColor: primaryColor,
                    height: waveValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [config.container * 0.3, config.container],
                    }),
                    transform: [{
                      scaleY: waveValue.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.3, 1, 0.3],
                      }),
                    }],
                  },
                ]}
              />
            ))}
          </View>
        );

      case 'shimmer':
        return (
          <View style={[styles.shimmerContainer, { height: config.container }]}>
            <Animated.View
              style={[
                styles.shimmerGradient,
                {
                  transform: [{
                    translateX: shimmerValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-100, 100],
                    }),
                  }],
                },
              ]}
            >
              <LinearGradient
                colors={[
                  'transparent',
                  primaryColor + '40',
                  primaryColor + '80',
                  primaryColor + '40',
                  'transparent'
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shimmerGradientInner}
              />
            </Animated.View>
          </View>
        );

      case 'ayurveda':
        return (
          <Animated.View
            style={[
              styles.ayurvedaContainer,
              {
                transform: [{
                  rotate: spinValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                }],
              },
            ]}
          >
            <LinearGradient
              colors={['#4CAF50', '#2E7D32', '#1B5E20']}
              style={[styles.ayurvedaCircle, { width: config.container, height: config.container }]}
            >
              <Ionicons name="leaf" size={config.icon} color="white" />
            </LinearGradient>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  const containerStyle = overlay ? styles.overlayContainer : styles.inlineContainer;

  return (
    <Animated.View style={[containerStyle, { opacity: fadeValue }]}>
      {overlay && <View style={styles.overlay} />}
      <View style={[styles.content, overlay && styles.overlayContent]}>
        {renderLoadingContent()}
        {message && (
          <Text style={[
            styles.message,
            { 
              color: overlay ? '#FFFFFF' : colors.text,
              fontSize: size === 'small' ? 12 : size === 'large' ? 16 : 14,
            }
          ]}>
            {message}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    backdropFilter: 'blur(10px)',
  },
  spinner: {
    borderWidth: 3,
    borderTopColor: 'transparent',
    borderRadius: 50,
  },
  pulse: {
    borderRadius: 50,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 60,
  },
  dot: {
    borderRadius: 50,
    marginHorizontal: 2,
  },
  waveContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: 50,
    height: 40,
  },
  waveLine: {
    width: 4,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  shimmerContainer: {
    width: 100,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  shimmerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '200%',
  },
  shimmerGradientInner: {
    flex: 1,
  },
  ayurvedaContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ayurvedaCircle: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});