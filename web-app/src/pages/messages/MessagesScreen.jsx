import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../components';
import messageService from '../../services/messageService';

const MessagesScreen = () => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await messageService.getConversations();
      
      if (response.success) {
        setConversations(response.data);
      } else {
        setError('Failed to load conversations');
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.message || 'Failed to load conversations');
      // Show demo data if API fails
      setConversations([
        {
          conversationId: 'demo1',
          otherUser: {
            _id: '1',
            name: 'Priya Sharma',
            userType: 'patient'
          },
          lastMessage: {
            _id: '1',
            content: 'Dr. Sharma, I wanted to ask about the timing for taking Ashwagandha. Should I take it before or after meals?',
            createdAt: '2025-09-15T14:30:00Z',
            senderType: 'patient',
            isRead: false
          },
          unreadCount: 1
        },
        {
          conversationId: 'demo2',
          otherUser: {
            _id: '2',
            name: 'Dr. Mehta',
            userType: 'doctor',
            specialization: 'Ayurveda'
          },
          lastMessage: {
            _id: '2',
            content: 'I am referring Mr. Raj Kumar for Ayurvedic treatment. He has chronic digestive issues.',
            createdAt: '2025-09-15T11:15:00Z',
            senderType: 'doctor',
            isRead: true
          },
          unreadCount: 0
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conversation => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return conversation.unreadCount > 0;
    if (activeFilter === 'read') return conversation.unreadCount === 0;
    if (activeFilter === 'replied') return conversation.lastMessage.senderType !== getUserType();
    return true;
  });

  // Helper function to get current user type (this should come from auth context)
  const getUserType = () => {
    // This should be replaced with actual auth context
    return 'doctor'; // or 'patient' based on logged in user
  };

  const formatTimestamp = (timestamp) => {
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

  const handleMarkAsRead = async (conversationId) => {
    try {
      // In a real implementation, you'd mark the conversation messages as read
      // For now, just update the local state
      setConversations(prev => 
        prev.map(conv => 
          conv.conversationId === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleComposeMessage = () => {
    // TODO: Open compose message modal or navigate to compose page
    console.log('Compose message clicked');
  };

  const handleConversationClick = (conversation) => {
    // TODO: Navigate to conversation detail view
    console.log('Conversation clicked:', conversation);
  };

  const containerStyles = {
    padding: '1.5rem',
    backgroundColor: '#F5F7FA',
    minHeight: '100vh'
  };

  const headerStyles = {
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const titleStyles = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#2C5F41',
    margin: 0
  };

  const filterStyles = {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem'
  };

  const getTypeIcon = (type) => {
    const icons = {
      patient: '👤',
      doctor: '🩺',
      system: '⚙️',
      admin: '👨‍💼'
    };
    return icons[type] || '💬';
  };

  if (isLoading) {
    return (
      <div style={containerStyles}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '1.125rem', color: '#687076' }}>Loading conversations...</div>
        </div>
      </div>
    );
  }

  if (error && conversations.length === 0) {
    return (
      <div style={containerStyles}>
        <div style={headerStyles}>
          <h1 style={titleStyles}>Messages</h1>
          <Button variant="primary" size="medium" onClick={handleComposeMessage}>
            Compose Message
          </Button>
        </div>
        <Card medical={true} padding="large">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2C5F41', marginBottom: '0.5rem' }}>
              Connection Error
            </h3>
            <p style={{ color: '#687076', marginBottom: '1.5rem' }}>
              {error}. Showing demo data instead.
            </p>
            <Button variant="primary" onClick={fetchConversations}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h1 style={titleStyles}>Messages</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {error && (
            <Button variant="secondary" size="small" onClick={fetchConversations}>
              Retry
            </Button>
          )}
          <Button variant="primary" size="medium" onClick={handleComposeMessage}>
            Compose Message
          </Button>
        </div>
      </div>

      <div style={filterStyles}>
        {['all', 'unread', 'read', 'replied'].map(filter => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'primary' : 'outline'}
            size="small"
            onClick={() => setActiveFilter(filter)}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {filteredConversations.map(conversation => (
          <Card 
            key={conversation.conversationId} 
            medical={true} 
            padding="medium" 
            hover={true}
            style={{ cursor: 'pointer' }}
            onClick={() => handleConversationClick(conversation)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '1.5rem' }}>
                  {getTypeIcon(conversation.otherUser.userType)}
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: conversation.unreadCount > 0 ? '700' : '600', 
                    color: '#2C5F41', 
                    margin: '0 0 0.25rem 0' 
                  }}>
                    {conversation.otherUser.name}
                    {conversation.otherUser.userType === 'doctor' && conversation.otherUser.specialization && 
                      ` (${conversation.otherUser.specialization})`
                    }
                  </h3>
                  <div style={{ fontSize: '0.875rem', color: '#687076' }}>
                    {formatTimestamp(conversation.lastMessage.createdAt)} • {conversation.otherUser.userType}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {conversation.unreadCount > 0 && (
                  <div style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    backgroundColor: '#F4A26120',
                    color: '#F4A261'
                  }}>
                    {conversation.unreadCount} NEW
                  </div>
                )}
                <div style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  backgroundColor: conversation.unreadCount > 0 ? '#F4A26120' : '#3E8E5A20',
                  color: conversation.unreadCount > 0 ? '#F4A261' : '#3E8E5A'
                }}>
                  {conversation.unreadCount > 0 ? 'UNREAD' : 'READ'}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ 
                fontSize: '0.875rem', 
                color: '#687076',
                lineHeight: '1.5',
                backgroundColor: conversation.unreadCount > 0 ? '#FDF4E8' : '#E8F5E8',
                padding: '0.75rem',
                borderRadius: '8px',
                border: `1px solid ${conversation.unreadCount > 0 ? '#F4A261' : '#3E8E5A'}30`
              }}>
                <strong>
                  {conversation.lastMessage.senderType === getUserType() ? 'You: ' : ''}
                </strong>
                {conversation.lastMessage.content.length > 100 
                  ? `${conversation.lastMessage.content.substring(0, 100)}...`
                  : conversation.lastMessage.content
                }
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button 
                variant="outline" 
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleConversationClick(conversation);
                }}
              >
                View Chat
              </Button>
              {conversation.unreadCount > 0 && (
                <Button 
                  variant="success" 
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(conversation.conversationId);
                  }}
                >
                  Mark as Read
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredConversations.length === 0 && (
        <Card medical={true} padding="large">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2C5F41', marginBottom: '0.5rem' }}>
              No conversations found
            </h3>
            <p style={{ color: '#687076', marginBottom: '1.5rem' }}>
              {activeFilter === 'all' 
                ? 'You don\'t have any conversations yet.'
                : `No conversations match the "${activeFilter}" filter.`
              }
            </p>
            <Button variant="primary" onClick={handleComposeMessage}>
              Start New Conversation
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MessagesScreen;