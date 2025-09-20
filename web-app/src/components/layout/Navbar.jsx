import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/authService';
import { DashboardService } from '../../services';

const Navbar = ({ sidebarCollapsed, setSidebarCollapsed }) => {
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  const unreadCount = notifications.filter(n => n.unread).length;

  // Load user data and notifications on component mount
  useEffect(() => {
    const userData = AuthService.getUser();
    if (userData) {
      setUser(userData);
    }
    
    // Load notifications
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const notificationsData = await DashboardService.getNotifications();
      if (notificationsData && Array.isArray(notificationsData)) {
        setNotifications(notificationsData);
      }
    } catch (error) {
      console.error('❌ Navbar: Error loading notifications:', error);
      // Fallback to demo data if API fails
      setNotifications([
        { 
          id: 1, 
          message: 'New patient registration', 
          time: '5 min ago', 
          type: 'patient', 
          unread: true,
          priority: 'normal'
        },
        { 
          id: 2, 
          message: 'Lab results ready', 
          time: '15 min ago', 
          type: 'lab', 
          unread: true,
          priority: 'high'
        }
      ]);
    }
  };

  const handleSignOut = () => {
    AuthService.logout();
    window.location.href = '/auth';
  };

  const handleProfileSettings = () => {
    setShowProfileDropdown(false);
    navigate('/app/settings', { state: { activeTab: 'profile' } });
  };

  const handlePreferences = () => {
    setShowProfileDropdown(false);
    navigate('/app/settings', { state: { activeTab: 'preferences' } });
  };

  const styles = {
    navbar: {
      height: '60px', // Reduced from 80px for minimal design
      background: 'linear-gradient(135deg, #3E8E5A 0%, #4A9D6A 100%)', // Herbal green gradient
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1rem', // Reduced from 2rem for minimal design
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: '50',
      boxShadow: '0 4px 20px rgba(62, 142, 90, 0.15)',
      backdropFilter: 'blur(8px)',
    },
    
    leftSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem', // Reduced from 1rem
    },
    
    menuButton: {
      width: '36px', // Reduced from 44px
      height: '36px',
      borderRadius: '8px', // Reduced from 12px
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '16px', // Reduced from 18px
      color: 'white',
      ':hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        transform: 'translateY(-1px)',
      }
    },
    
    brandSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px', // Reduced from 12px
    },
    
    logo: {
      width: '40px', // Reduced from 50px
      height: '40px',
      background: 'linear-gradient(135deg, #F4A261, #F5B17A)', // Orange gradient
      borderRadius: '12px', // Reduced from 16px
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '18px', // Reduced from 22px
      fontWeight: '700',
      boxShadow: '0 4px 15px rgba(244, 162, 97, 0.3)',
      border: '2px solid rgba(255, 255, 255, 0.2)',
    },
    
    brandText: {
      display: 'flex',
      flexDirection: 'column',
    },
    
    title: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: 'white',
      fontFamily: 'var(--font-heading)',
      letterSpacing: '-0.02em',
      lineHeight: 1,
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    
    subtitle: {
      fontSize: '0.875rem',
      color: 'rgba(255, 255, 255, 0.8)',
      fontWeight: '500',
      lineHeight: 1,
      marginTop: '2px',
    },
    
    centerSection: {
      flex: 1,
      maxWidth: '500px',
      margin: '0 2rem',
      position: 'relative',
    },
    
    searchContainer: {
      position: 'relative',
      width: '100%',
    },
    
    searchInput: {
      width: '100%',
      height: '44px',
      padding: '0 1rem 0 3rem',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '24px',
      fontSize: '0.875rem',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(8px)',
      transition: 'all 0.3s ease',
      outline: 'none',
      fontFamily: 'var(--font-primary)',
      color: 'white',
      '::placeholder': {
        color: 'rgba(255, 255, 255, 0.7)',
      },
      ':focus': {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderColor: 'rgba(255, 255, 255, 0.4)',
        boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.1)',
      }
    },
    
    searchIcon: {
      position: 'absolute',
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '18px',
      color: 'rgba(255, 255, 255, 0.7)',
    },
    
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    
    iconButton: {
      position: 'relative',
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '18px',
      color: 'white',
      ':hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        transform: 'translateY(-1px)',
      }
    },
    
    notificationBadge: {
      position: 'absolute',
      top: '-2px',
      right: '-2px',
      width: '20px',
      height: '20px',
      backgroundColor: '#F4A261', // Orange accent
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid white',
      boxShadow: '0 2px 8px rgba(244, 162, 97, 0.4)',
      fontSize: '0.75rem',
      fontWeight: '600',
      color: 'white',
    },
    
    profileButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.5rem',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative',
      ':hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        transform: 'translateY(-1px)',
      }
    },
    
    profileAvatar: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #F4A261, #F5B17A)', // Orange gradient
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '0.875rem',
      fontWeight: '600',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 2px 8px rgba(244, 162, 97, 0.3)',
    },
    
    profileInfo: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    
    profileName: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: 'white',
      lineHeight: 1.2,
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    },
    
    profileRole: {
      fontSize: '0.75rem',
      color: 'rgba(255, 255, 255, 0.8)',
      fontWeight: '400',
      lineHeight: 1,
    },
    
    dropdown: {
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: '8px',
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      padding: '0',
      minWidth: '220px',
      zIndex: '1000',
      fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },
    
    notificationDropdown: {
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: 'var(--space-2)',
      background: 'white',
      border: '1px solid var(--gray-200)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-lg)',
      padding: 'var(--space-4)',
      minWidth: '320px',
      maxHeight: '400px',
      overflowY: 'auto',
      zIndex: 'var(--z-50)',
    },
    
    notificationItem: {
      padding: 'var(--space-3)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--gray-100)',
      marginBottom: 'var(--space-2)',
      backgroundColor: 'var(--gray-25)',
      transition: 'var(--transition-fast)',
    },
    
    notificationHeader: {
      fontSize: 'var(--text-lg)',
      fontWeight: '600',
      color: 'var(--gray-900)',
      marginBottom: 'var(--space-3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  };

  const handleMenuToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleIconHover = (e) => {
    e.target.style.backgroundColor = 'var(--primary-50)';
    e.target.style.borderColor = 'var(--primary-200)';
    e.target.style.color = 'var(--primary-600)';
    e.target.style.transform = 'translateY(-1px)';
  };

  const handleIconLeave = (e) => {
    e.target.style.backgroundColor = 'var(--gray-50)';
    e.target.style.borderColor = 'var(--gray-200)';
    e.target.style.color = 'var(--gray-600)';
    e.target.style.transform = 'translateY(0)';
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.leftSection}>
        <button 
          style={styles.menuButton}
          onClick={handleMenuToggle}
          onMouseEnter={handleIconHover}
          onMouseLeave={handleIconLeave}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        
        <div style={styles.brandSection}>
          <div style={styles.logo}>⚕</div>
          <div style={styles.brandText}>
            <div style={styles.title}>AyurAhaar</div>
            <div style={styles.subtitle}>Medical Portal</div>
          </div>
        </div>
      </div>

      <div style={styles.rightSection}>
        <button 
          style={styles.iconButton}
          onMouseEnter={handleIconHover}
          onMouseLeave={handleIconLeave}
          aria-label="Quick actions"
        >
          ■
        </button>
        
        <div style={{ position: 'relative' }}>
          <button 
            style={styles.iconButton}
            onClick={() => setShowNotifications(!showNotifications)}
            onMouseEnter={handleIconHover}
            onMouseLeave={handleIconLeave}
            aria-label="Notifications"
          >
            🔔
            {unreadCount > 0 && (
              <div style={styles.notificationBadge}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </button>
          
          {showNotifications && (
            <div style={styles.notificationDropdown}>
              <div style={styles.notificationHeader}>
                <span>Notifications</span>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  Mark all read
                </button>
              </div>
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  style={{
                    ...styles.notificationItem,
                    backgroundColor: notification.unread ? 'var(--primary-25)' : 'var(--gray-25)',
                  }}
                >
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-800)', marginBottom: '4px' }}>
                    {notification.message}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
                    {notification.time}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div style={{ position: 'relative' }}>
          <button 
            style={styles.profileButton}
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <div style={styles.profileAvatar}>
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'DR'}
            </div>
            <div style={styles.profileInfo}>
              <div style={styles.profileName}>{user?.name || 'Loading...'}</div>
              <div style={styles.profileRole}>{user?.specialization || 'Ayurvedic Physician'}</div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>▼</div>
          </button>
          
          {showProfileDropdown && (
            <div style={styles.dropdown}>
              <div style={{ 
                padding: '12px 16px', 
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#f8f9fa'
              }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#2C5F41',
                  marginBottom: '2px'
                }}>
                  {user?.name || 'Loading...'}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#687076',
                  marginBottom: '4px'
                }}>
                  {user?.specialization || 'Ayurvedic Physician'}
                </div>
                {user?.email && (
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#9CA3AF',
                    fontStyle: 'italic'
                  }}>
                    {user.email}
                  </div>
                )}
              </div>
              
              <div style={{ padding: '8px 0' }}>
                <button 
                  onClick={handleProfileSettings}
                  style={{ 
                    width: '100%', 
                    textAlign: 'left', 
                    padding: '10px 16px', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <span style={{ marginRight: '8px' }}>👤</span>
                  Profile Settings
                </button>
                
                <button 
                  onClick={handlePreferences}
                  style={{ 
                    width: '100%', 
                    textAlign: 'left', 
                    padding: '10px 16px', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <span style={{ marginRight: '8px' }}>⚙</span>
                  Preferences
                </button>
                
                <button 
                  style={{ 
                    width: '100%', 
                    textAlign: 'left', 
                    padding: '10px 16px', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <span style={{ marginRight: '8px' }}>?</span>
                  Help & Support
                </button>
                
                <hr style={{ 
                  margin: '8px 16px', 
                  border: 'none', 
                  borderTop: '1px solid #e5e7eb'
                }} />
                
                <button 
                  onClick={handleSignOut}
                  style={{ 
                    width: '100%', 
                    textAlign: 'left', 
                    padding: '10px 16px', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#dc3545',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <span style={{ marginRight: '8px' }}>⊗</span>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
