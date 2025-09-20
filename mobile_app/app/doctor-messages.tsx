import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { Colors } from '@/src/constants/Colors';
import { useMessage } from '@/src/contexts/MessageContext';
import { ThemedView } from '@/src/components/common/ThemedView';
import { ThemedText } from '@/src/components/common/ThemedText';
import type { Conversation } from '@/src/services/message';

export default function DoctorMessagesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { 
    conversations, 
    isLoading, 
    error, 
    fetchConversations, 
    refreshConversations,
    setCurrentOtherUser
  } = useMessage();
  
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = useCallback(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshConversations();
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleConversationPress = (conversation: Conversation) => {
    setCurrentOtherUser(conversation.otherUser);
    router.push('/conversation' as any);
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateMessage = (message: string, maxLength: number = 60): string => {
    return message.length > maxLength ? `${message.substring(0, maxLength)}...` : message;
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        { 
          backgroundColor: colors.cardBackground,
          borderBottomColor: colors.inputBorder,
        }
      ]}
      onPress={() => handleConversationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { backgroundColor: colors.herbalGreen }]}>
          <Ionicons 
            name={item.otherUser.userType === 'doctor' ? 'medical' : 'person'} 
            size={20} 
            color="white" 
          />
        </View>
        {item.unreadCount > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: colors.softOrange }]}>
            <Text style={styles.unreadBadgeText}>
              {item.unreadCount > 99 ? '99+' : item.unreadCount}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
            {item.otherUser.name}
          </Text>
          <Text style={[styles.timestamp, { color: colors.icon }]}>
            {formatTimestamp(item.lastMessage.createdAt)}
          </Text>
        </View>

        <View style={styles.messageRow}>
          <Text style={[styles.userRole, { color: colors.icon }]} numberOfLines={1}>
            {item.otherUser.userType === 'doctor' 
              ? `Dr. • ${item.otherUser.specialization || 'General'}`
              : 'Patient'
            }
          </Text>
        </View>

        <Text 
          style={[
            styles.lastMessage, 
            { 
              color: item.unreadCount > 0 ? colors.text : colors.icon,
              fontWeight: item.unreadCount > 0 ? '600' : '400'
            }
          ]} 
          numberOfLines={2}
        >
          {item.lastMessage.senderType === 'patient' ? 'You: ' : ''}
          {truncateMessage(item.lastMessage.content)}
        </Text>
      </View>

      <View style={styles.conversationActions}>
        <Ionicons name="chevron-forward" size={16} color={colors.icon} />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={64} color={colors.icon} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No conversations yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
        Start a conversation with your doctor after booking an appointment
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: colors.herbalGreen }]}
        onPress={() => router.push('/doctor-list')}
      >
        <Text style={styles.emptyButtonText}>Find Doctors</Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorState}>
      <Ionicons name="alert-circle-outline" size={64} color={colors.softOrange} />
      <Text style={[styles.errorTitle, { color: colors.text }]}>
        Unable to load conversations
      </Text>
      <Text style={[styles.errorSubtitle, { color: colors.icon }]}>
        {error || 'Please check your connection and try again'}
      </Text>
      <TouchableOpacity
        style={[styles.errorButton, { backgroundColor: colors.herbalGreen }]}
        onPress={handleRefresh}
      >
        <Text style={styles.errorButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.inputBorder }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Messages</ThemedText>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={colors.herbalGreen} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading conversations...
          </Text>
        </View>
      ) : error && conversations.length === 0 ? (
        renderError()
      ) : conversations.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.conversationId}
          style={styles.conversationsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.herbalGreen]}
              tintColor={colors.herbalGreen}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  refreshButton: {
    padding: 8,
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadge: {
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
  unreadBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  conversationContent: {
    flex: 1,
    marginRight: 8,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
  },
  messageRow: {
    marginBottom: 4,
  },
  userRole: {
    fontSize: 12,
    fontWeight: '500',
  },
  lastMessage: {
    fontSize: 14,
    lineHeight: 18,
  },
  conversationActions: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
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
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
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