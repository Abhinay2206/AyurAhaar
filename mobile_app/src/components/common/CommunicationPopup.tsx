import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { Colors } from '@/src/constants/Colors';
import { useMessage } from '@/src/contexts/MessageContext';

interface CommunicationPopupProps {
  visible: boolean;
  onClose: () => void;
  position: { x: number; y: number };
}

const { width } = Dimensions.get('window');

export const CommunicationPopup: React.FC<CommunicationPopupProps> = ({
  visible,
  onClose,
  position,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { unreadCount } = useMessage();
  const [animation] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.timing(animation, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 150,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  }, [visible, animation]);

  const handleChatbotPress = () => {
    onClose();
    router.push('/chatbot');
  };

  const handleDoctorMessagesPress = () => {
    onClose();
    router.push('/doctor-messages' as any);
  };

  const popupScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const popupOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backdropTouchable}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.popupContainer,
          {
            backgroundColor: colors.background,
            borderColor: colors.inputBorder,
            transform: [
              { scale: popupScale },
              {
                translateX: Math.min(
                  position.x - 100,
                  width - 220
                ),
              },
              {
                translateY: Math.max(
                  position.y - 120,
                  50
                ),
              },
            ],
            opacity: popupOpacity,
          },
        ]}
      >
        <View style={styles.arrow} />
        
        <TouchableOpacity
          style={[styles.optionButton, { borderBottomColor: colors.inputBorder }]}
          onPress={handleChatbotPress}
          activeOpacity={0.7}
        >
          <View style={styles.optionContent}>
            <View style={[styles.iconContainer, { backgroundColor: colors.herbalGreen }]}>
              <Ionicons name="chatbubble-ellipses" size={20} color="white" />
            </View>
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                AI Chatbot
              </Text>
              <Text style={[styles.optionSubtitle, { color: colors.icon }]}>
                Get instant answers
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.icon} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={handleDoctorMessagesPress}
          activeOpacity={0.7}
        >
          <View style={styles.optionContent}>
            <View style={[styles.iconContainer, { backgroundColor: colors.herbalGreen }]}>
              <Ionicons name="medical" size={20} color="white" />
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.softOrange }]}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                Doctor Messages
              </Text>
              <Text style={[styles.optionSubtitle, { color: colors.icon }]}>
                {unreadCount > 0 
                  ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`
                  : 'Message your doctor'
                }
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.icon} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
  },
  backdropTouchable: {
    flex: 1,
  },
  popupContainer: {
    position: 'absolute',
    width: 200,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  arrow: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    marginLeft: -6,
    width: 12,
    height: 12,
    backgroundColor: 'white',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E1E5E9',
    transform: [{ rotate: '45deg' }],
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  optionText: {
    flex: 1,
    marginRight: 8,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
  },
});

export default CommunicationPopup;