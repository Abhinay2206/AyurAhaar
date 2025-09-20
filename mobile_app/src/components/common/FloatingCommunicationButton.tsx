import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { Colors } from '@/src/constants/Colors';
import { useMessage } from '@/src/contexts/MessageContext';
import { CommunicationPopup } from './CommunicationPopup';

interface FloatingCommunicationButtonProps {
  style?: object;
}

export const FloatingCommunicationButton: React.FC<FloatingCommunicationButtonProps> = ({ style }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { unreadCount } = useMessage();
  const [showPopup, setShowPopup] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const buttonRef = useRef<any>(null);

  // Pulse animation for unread messages
  React.useEffect(() => {
    if (unreadCount > 0) {
      const pulse = Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]);

      const loop = Animated.loop(pulse);
      loop.start();

      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [unreadCount, pulseAnim]);

  const handlePress = () => {
    if (buttonRef.current) {
      buttonRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
        setButtonPosition({ 
          x: x + width / 2, 
          y: y - height 
        });
        setShowPopup(true);
      });
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          style,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <TouchableOpacity
          ref={buttonRef}
          style={[
            styles.button,
            {
              backgroundColor: colors.herbalGreen,
              shadowColor: colors.text,
            },
          ]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubbles" size={24} color="white" />
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.softOrange }]}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      <CommunicationPopup
        visible={showPopup}
        onClose={handleClosePopup}
        position={buttonPosition}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default FloatingCommunicationButton;