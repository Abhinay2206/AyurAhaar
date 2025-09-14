import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { ThemedText } from '@/src/components/common/ThemedText';
import { ThemedView } from '@/src/components/common/ThemedView';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ChatService } from '@/src/services/chat';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatbotScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { patient } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Ayurvedic wellness assistant. I can help you with questions about foods, doshas, and Ayurvedic practices. How can I assist you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      const response = await ChatService.sendMessage(userMessage.text, patient?._id);
      
      if (response.success) {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: response.reply,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(response.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I\'m having trouble responding right now. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppointments = () => {
    router.push('/appointments' as any);
  };

  const handleProfile = () => {
    router.push('/profile' as any);
  };

  const handleDashboard = () => {
    router.push('/dashboard' as any);
  };

  const renderMessage = (message: ChatMessage) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessageContainer : styles.botMessageContainer,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          message.isUser
            ? [styles.userBubble, { backgroundColor: colors.herbalGreen }]
            : [styles.botBubble, { backgroundColor: colors.cardBackground }],
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: message.isUser ? 'white' : colors.text },
          ]}
        >
          {message.text}
        </Text>
        <Text
          style={[
            styles.timestamp,
            { color: message.isUser ? 'rgba(255,255,255,0.7)' : colors.icon },
          ]}
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  const suggestedQuestions = [
    "What foods are good for Vata dosha?",
    "How can I improve my digestion?",
    "What spices help with inflammation?",
    "Tell me about Ayurvedic meal timing",
  ];

  const handleSuggestedQuestion = (question: string) => {
    setInputText(question);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.headerContent}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.herbalGreen }]}>
            <Ionicons name="chatbubble-ellipses" size={24} color="white" />
          </View>
          <View style={styles.headerText}>
            <ThemedText style={styles.headerTitle}>Ayurvedic Assistant</ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: colors.icon }]}>
              Always here to help
            </ThemedText>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          
          {/* Suggested Questions (only show when conversation is short) */}
          {messages.length <= 2 && (
            <View style={styles.suggestionsContainer}>
              <ThemedText style={[styles.suggestionsTitle, { color: colors.icon }]}>
                Try asking:
              </ThemedText>
              {suggestedQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.suggestionBubble, { backgroundColor: colors.cardBackground }]}
                  onPress={() => handleSuggestedQuestion(question)}
                >
                  <Text style={[styles.suggestionText, { color: colors.text }]}>
                    {question}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {isLoading && (
            <View style={[styles.messageContainer, styles.botMessageContainer]}>
              <View style={[styles.messageBubble, styles.botBubble, { backgroundColor: colors.cardBackground }]}>
                <View style={styles.typingIndicator}>
                  <View style={[styles.typingDot, { backgroundColor: colors.icon }]} />
                  <View style={[styles.typingDot, { backgroundColor: colors.icon }]} />
                  <View style={[styles.typingDot, { backgroundColor: colors.icon }]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.inputWrapper, { backgroundColor: colors.background }]}>
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about Ayurveda, foods, or wellness..."
              placeholderTextColor={colors.icon}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: inputText.trim() && !isLoading 
                    ? colors.herbalGreen 
                    : colors.icon,
                },
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: colors.cardBackground }]}>
        <TouchableOpacity style={styles.navItem} onPress={handleDashboard}>
          <Ionicons name="home" size={24} color={colors.icon} />
          <Text style={[styles.navLabel, { color: colors.icon }]}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={handleAppointments}>
          <Ionicons name="calendar" size={24} color={colors.icon} />
          <Text style={[styles.navLabel, { color: colors.icon }]}>Appointments</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="chatbubble-ellipses" size={24} color={colors.herbalGreen} />
          <Text style={[styles.navLabel, { color: colors.herbalGreen }]}>Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={handleProfile}>
          <Ionicons name="person" size={24} color={colors.icon} />
          <Text style={[styles.navLabel, { color: colors.icon }]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  botMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    borderBottomRightRadius: 8,
  },
  botBubble: {
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  suggestionsContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  suggestionsTitle: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '500',
  },
  suggestionBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  suggestionText: {
    fontSize: 14,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.6,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
    paddingRight: 12,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});