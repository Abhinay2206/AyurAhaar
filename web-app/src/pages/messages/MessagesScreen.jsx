import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../components';

const MessagesScreen = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    // Mock data for messages
    setTimeout(() => {
      setMessages([
        {
          id: 1,
          sender: 'Priya Sharma',
          subject: 'Question about prescribed herbs',
          message: 'Dr. Sharma, I wanted to ask about the timing for taking Ashwagandha. Should I take it before or after meals?',
          timestamp: '2025-09-15 14:30',
          status: 'unread',
          priority: 'normal',
          type: 'patient'
        },
        {
          id: 2,
          sender: 'Dr. Mehta (Referral)',
          subject: 'Patient referral - Raj Kumar',
          message: 'I am referring Mr. Raj Kumar for Ayurvedic treatment. He has chronic digestive issues. Please find his medical history attached.',
          timestamp: '2025-09-15 11:15',
          status: 'read',
          priority: 'high',
          type: 'doctor'
        },
        {
          id: 3,
          sender: 'Sunita Devi',
          subject: 'Appointment rescheduling request',
          message: 'Hello Doctor, I need to reschedule my appointment from tomorrow to next week due to family emergency. Please let me know available slots.',
          timestamp: '2025-09-14 16:45',
          status: 'replied',
          priority: 'normal',
          type: 'patient'
        },
        {
          id: 4,
          sender: 'Lab Services',
          subject: 'Lab results ready - Amit Patel',
          message: 'Lab results for patient Amit Patel are now available. You can access them through the patient portal.',
          timestamp: '2025-09-14 09:20',
          status: 'read',
          priority: 'normal',
          type: 'system'
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredMessages = messages.filter(message => 
    activeFilter === 'all' || message.status === activeFilter
  );

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

  const getStatusColor = (status) => {
    const colors = {
      unread: '#F4A261',
      read: '#687076',
      replied: '#3E8E5A'
    };
    return colors[status] || '#687076';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#DC3545',
      normal: '#687076',
      low: '#17A2B8'
    };
    return colors[priority] || '#687076';
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
          <div style={{ fontSize: '1.125rem', color: '#687076' }}>Loading messages...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h1 style={titleStyles}>Messages</h1>
        <Button variant="primary" size="medium">
          Compose Message
        </Button>
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
        {filteredMessages.map(message => (
          <Card key={message.id} medical={true} padding="medium" hover={true}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '1.5rem' }}>
                  {getTypeIcon(message.type)}
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: message.status === 'unread' ? '700' : '600', 
                    color: '#2C5F41', 
                    margin: '0 0 0.25rem 0' 
                  }}>
                    {message.sender}
                  </h3>
                  <div style={{ fontSize: '0.875rem', color: '#687076' }}>
                    {message.timestamp} • {message.type}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {message.priority === 'high' && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: getPriorityColor(message.priority)
                  }} />
                )}
                <div style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  backgroundColor: `${getStatusColor(message.status)}20`,
                  color: getStatusColor(message.status)
                }}>
                  {message.status.toUpperCase()}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                color: '#2C5F41', 
                marginBottom: '0.5rem'
              }}>
                {message.subject}
              </h4>
              <div style={{ 
                fontSize: '0.875rem', 
                color: '#687076',
                lineHeight: '1.5',
                backgroundColor: message.status === 'unread' ? '#FDF4E8' : '#E8F5E8',
                padding: '0.75rem',
                borderRadius: '8px',
                border: `1px solid ${message.status === 'unread' ? '#F4A261' : '#3E8E5A'}30`
              }}>
                {message.message}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="outline" size="small">
                Reply
              </Button>
              <Button variant="secondary" size="small">
                Forward
              </Button>
              {message.status === 'unread' && (
                <Button variant="success" size="small">
                  Mark as Read
                </Button>
              )}
              <Button variant="warning" size="small">
                Archive
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredMessages.length === 0 && (
        <Card medical={true} padding="large">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2C5F41', marginBottom: '0.5rem' }}>
              No messages found
            </h3>
            <p style={{ color: '#687076', marginBottom: '1.5rem' }}>
              No messages match the selected filter.
            </p>
            <Button variant="primary">Compose New Message</Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MessagesScreen;