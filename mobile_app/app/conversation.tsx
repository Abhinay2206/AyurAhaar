import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { Colors } from '@/src/constants/Colors';
import { useMessage } from '@/src/contexts/MessageContext';
import { ThemedView } from '@/src/components/common/ThemedView';
import { ThemedText } from '@/src/components/common/ThemedText';
import type { Message } from '@/src/services/message';

export default function ConversationScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { 
    currentConversation,
    currentOtherUser,
    isLoading,
    fetchConversation,
    sendMessage,
    markAsRead
  } = useMessage();
  
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (currentOtherUser) {
      fetchConversation(currentOtherUser._id);
    }
  }, [currentOtherUser, fetchConversation]);

  useEffect(() => {
    // Mark messages as read when conversation is viewed
    if (currentConversation.length > 0) {
      currentConversation.forEach(message => {
        if (!message.isRead && message.receiver._id !== currentOtherUser?._id) {
          markAsRead(message._id);
        }
      });
    }
  }, [currentConversation, markAsRead, currentOtherUser]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentOtherUser || sending) return;

    const messageToSend = messageText.trim();
    setMessageText('');
    setSending(true);

    try {
      await sendMessage(currentOtherUser._id, messageToSend);
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send message');
      setMessageText(messageToSend); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMessageItem = ({ item, index }: { item: Message; index: number }) => {
    const isMyMessage = item.senderType === 'patient'; // Assuming current user is patient
    const previousMessage = index > 0 ? currentConversation[index - 1] : null;
    const nextMessage = index < currentConversation.length - 1 ? currentConversation[index + 1] : null;
    
    // Show date header if this is the first message or date changed
    const showDateHeader = !previousMessage || 
      formatMessageDate(item.createdAt) !== formatMessageDate(previousMessage.createdAt);

    // Show time if this is the last message from this sender or time gap > 5 minutes
    const showTime = !nextMessage || 
      nextMessage.senderType !== item.senderType ||
      (new Date(nextMessage.createdAt).getTime() - new Date(item.createdAt).getTime()) > 5 * 60 * 1000;

    return (
      <View>
        {showDateHeader && (
          <View style={styles.dateHeader}>
            <Text style={[styles.dateText, { color: colors.icon }]}>
              {formatMessageDate(item.createdAt)}
            </Text>
          </View>
        )}
        
        <View style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
        ]}>
          <View style={[
            styles.messageBubble,
            {
              backgroundColor: isMyMessage ? colors.herbalGreen : colors.cardBackground,
              borderColor: isMyMessage ? colors.herbalGreen : colors.inputBorder,
            }
          ]}>
            <Text style={[
              styles.messageText,
              { color: isMyMessage ? 'white' : colors.text }
            ]}>
              {item.content}
            </Text>
          </View>
          
          {showTime && (
            <Text style={[
              styles.messageTime,
              { 
                color: colors.icon,
                textAlign: isMyMessage ? 'right' : 'left'
              }
            ]}>
              {formatMessageTime(item.createdAt)}
              {isMyMessage && (
                <Text style={styles.messageStatus}>
                  {item.status === 'read' ? ' ✓✓' : item.status === 'delivered' ? ' ✓' : ' ⏱'}
                </Text>
              )}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubble-outline" size={64} color={colors.icon} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Start a conversation
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
        Send a message to {currentOtherUser?.name}
      </Text>
    </View>
  );

  if (!currentOtherUser) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.softOrange} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            No conversation selected
          </Text>
          <TouchableOpacity
            style={[styles.errorButton, { backgroundColor: colors.herbalGreen }]}
            onPress={() => router.back()}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.inputBorder }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <View style={[styles.headerAvatar, { backgroundColor: colors.herbalGreen }]}>
              <Ionicons 
                name={currentOtherUser.userType === 'doctor' ? 'medical' : 'person'} 
                size={20} 
                color="white" 
              />
            </View>
            <View style={styles.headerText}>
              <ThemedText style={styles.headerTitle}>{currentOtherUser.name}</ThemedText>
              <Text style={[styles.headerSubtitle, { color: colors.icon }]}>
                {currentOtherUser.userType === 'doctor' 
                  ? `Dr. • ${currentOtherUser.specialization || 'General'}`
                  : 'Patient'
                }
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => {/* Add more options */}}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <View style={styles.messagesContainer}>
          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={colors.herbalGreen} />
            </View>
          ) : currentConversation.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              ref={flatListRef}
              data={currentConversation}
              renderItem={renderMessageItem}
              keyExtractor={(item) => item._id}
              style={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            />
          )}
        </View>

        {/* Message Input */}
        <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.inputBorder }]}>
          <View style={[styles.inputWrapper, { backgroundColor: colors.cardBackground, borderColor: colors.inputBorder }]}>
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type a message..."
              placeholderTextColor={colors.icon}
              multiline
              maxLength={1000}
              editable={!sending}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { 
                  backgroundColor: messageText.trim() && !sending ? colors.herbalGreen : colors.inputBorder 
                }
              ]}
              onPress={handleSendMessage}
              disabled={!messageText.trim() || sending}
              activeOpacity={0.7}
            >
              {sending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
    marginLeft: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dateHeader: {
    alignItems: 'center',
    paddingVertical: 8,
    marginVertical: 8,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  messageContainer: {
    marginVertical: 2,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    marginHorizontal: 8,
  },
  messageStatus: {
    opacity: 0.7,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    maxHeight: 80,
    marginRight: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});