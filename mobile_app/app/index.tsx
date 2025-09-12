import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { AuthService } from '@/src/services/auth';

export default function IndexScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Start the loading animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Check auth status and redirect accordingly
    const checkAuthAndRedirect = async () => {
      const authStatus = await AuthService.checkAuthStatus();
      
      setTimeout(() => {
        switch (authStatus) {
          case 'unauthenticated':
            router.replace('/home'); // Show home screen with login option
            break;
          case 'survey-pending':
            router.replace('/survey'); // Redirect to survey
            break;
          case 'authenticated':
            router.replace('/plan-selection'); // Redirect to plan selection
            break;
          default:
            router.replace('/home');
        }
      }, 3000);
    };

    checkAuthAndRedirect();
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.title}>AyurAhaar</Text>
        <Text style={styles.subtitle}>Personalized Ayurvedic Nutrition</Text>
      </Animated.View>
      
      <View style={styles.loadingContainer}>
        <LoadingDots />
      </View>
    </View>
  );
}

function LoadingDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDots = () => {
      const duration = 400;
      Animated.sequence([
        Animated.timing(dot1, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(dot1, { toValue: 0, duration, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 0, duration, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 0, duration, useNativeDriver: true }),
      ]).start(() => animateDots());
    };

    animateDots();
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, { opacity: dot1 }]} />
      <Animated.View style={[styles.dot, { opacity: dot2 }]} />
      <Animated.View style={[styles.dot, { opacity: dot3 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3498db',
    marginHorizontal: 4,
  },
});
