import React, { useState } from 'react';

const Navbar = ({ sidebarCollapsed, setSidebarCollapsed }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [notifications] = useState([
    { 
      id: 1, 
      message: 'New patient registration: Priya Sharma', 
      time: '5 min ago', 
      type: 'patient', 
      unread: true,
      priority: 'normal'
    },
    { 
      id: 2, 
      message: 'Lab results ready for Amit Patel', 
      time: '15 min ago', 
      type: 'lab', 
      unread: true,
      priority: 'high'
    },
    { 
      id: 3, 
      message: 'Appointment rescheduled by Sunita Devi', 
      time: '1 hour ago', 
      type: 'appointment', 
      unread: false,
      priority: 'normal'
    },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const styles = {
    navbar: {
      height: '80px',
      background: 'var(--bg-gradient-header)',
      borderBottom: '1px solid var(--gray-200)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--space-6)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 'var(--z-50)',
      boxShadow: 'var(--shadow-sm)',
      backdropFilter: 'blur(8px)',
    },
    
    leftSection: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
    },
    
    menuButton: {
      width: '44px',
      height: '44px',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--gray-200)',
      backgroundColor: 'var(--gray-50)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'var(--transition-fast)',
      fontSize: '18px',
    },
    
    brandSection: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
    },
    
    logo: {
      width: '44px',
      height: '44px',
      background: 'linear-gradient(135deg, var(--primary-600), var(--primary-700))',
      borderRadius: 'var(--radius-xl)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '20px',
      fontWeight: '700',
      boxShadow: 'var(--shadow-sm)',
    },
    
    brandText: {
      display: 'flex',
      flexDirection: 'column',
    },
    
    title: {
      fontSize: 'var(--text-xl)',
      fontWeight: '700',
      color: 'var(--gray-900)',
      fontFamily: 'var(--font-display)',
      letterSpacing: 'var(--tracking-tight)',
      lineHeight: 1,
    },
    
    subtitle: {
      fontSize: 'var(--text-sm)',
      color: 'var(--gray-500)',
      fontWeight: '500',
      lineHeight: 1,
    },
    
    centerSection: {
      flex: 1,
      maxWidth: '500px',
      margin: '0 var(--space-8)',
      position: 'relative',
    },
    
    searchContainer: {
      position: 'relative',
      width: '100%',
    },
    
    searchInput: {
      width: '100%',
      height: '44px',
      padding: '0 var(--space-4) 0 var(--space-12)',
      border: '1px solid var(--gray-200)',
      borderRadius: 'var(--radius-xl)',
      fontSize: 'var(--text-sm)',
      backgroundColor: 'var(--gray-50)',
      transition: 'var(--transition-fast)',
      outline: 'none',
      fontFamily: 'var(--font-primary)',
    },
    
    searchIcon: {
      position: 'absolute',
      left: 'var(--space-4)',
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '18px',
      color: 'var(--gray-400)',
    },
    
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
    },
    
    iconButton: {
      position: 'relative',
      width: '44px',
      height: '44px',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--gray-200)',
      backgroundColor: 'var(--gray-50)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'var(--transition-fast)',
      fontSize: '18px',
      color: 'var(--gray-600)',
    },
    
    notificationBadge: {
      position: 'absolute',
      top: '-2px',
      right: '-2px',
      width: '20px',
      height: '20px',
      backgroundColor: 'var(--error-500)',
      borderRadius: 'var(--radius-full)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'var(--text-xs)',
      fontWeight: '600',
      color: 'white',
      border: '2px solid white',
    },
    
    profileButton: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      padding: 'var(--space-2)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--gray-200)',
      backgroundColor: 'var(--gray-50)',
      cursor: 'pointer',
      transition: 'var(--transition-fast)',
      position: 'relative',
    },
    
    profileAvatar: {
      width: '36px',
      height: '36px',
      borderRadius: 'var(--radius-full)',
      background: 'linear-gradient(135deg, var(--ayurveda-sage), var(--ayurveda-kapha))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: 'var(--text-sm)',
      fontWeight: '600',
    },
    
    profileInfo: {
      display: 'flex',
      flexDirection: 'column',
      textAlign: 'left',
    },
    
    profileName: {
      fontSize: 'var(--text-sm)',
      fontWeight: '600',
      color: 'var(--gray-900)',
      lineHeight: 1.2,
    },
    
    profileRole: {
      fontSize: 'var(--text-xs)',
      color: 'var(--gray-500)',
      lineHeight: 1.2,
    },
    
    dropdown: {
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: 'var(--space-2)',
      background: 'white',
      border: '1px solid var(--gray-200)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-lg)',
      padding: 'var(--space-2)',
      minWidth: '280px',
      zIndex: 'var(--z-50)',
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

  const handleSearchFocus = (e) => {
    e.target.style.backgroundColor = 'white';
    e.target.style.borderColor = 'var(--primary-500)';
    e.target.style.boxShadow = '0 0 0 3px var(--primary-50)';
  };

  const handleSearchBlur = (e) => {
    e.target.style.backgroundColor = 'var(--gray-50)';
    e.target.style.borderColor = 'var(--gray-200)';
    e.target.style.boxShadow = 'none';
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
          <div style={styles.logo}>🌿</div>
          <div style={styles.brandText}>
            <div style={styles.title}>AyurAhaar</div>
            <div style={styles.subtitle}>Medical Portal</div>
          </div>
        </div>
      </div>

      <div style={styles.centerSection}>
        <div style={styles.searchContainer}>
          <div style={styles.searchIcon}>🔍</div>
          <input
            type="text"
            placeholder="Search patients, appointments, treatments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
        </div>
      </div>

      <div style={styles.rightSection}>
        <button 
          style={styles.iconButton}
          onMouseEnter={handleIconHover}
          onMouseLeave={handleIconLeave}
          aria-label="Quick actions"
        >
          ⚡
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
            <div style={styles.profileAvatar}>DR</div>
            <div style={styles.profileInfo}>
              <div style={styles.profileName}>Dr. Rajesh Kumar</div>
              <div style={styles.profileRole}>Ayurvedic Physician</div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>▼</div>
          </button>
          
          {showProfileDropdown && (
            <div style={styles.dropdown}>
              <div style={{ padding: 'var(--space-2)' }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: '600', marginBottom: 'var(--space-2)' }}>
                  Profile Menu
                </div>
                <button style={{ width: '100%', textAlign: 'left', padding: 'var(--space-2)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Profile Settings
                </button>
                <button style={{ width: '100%', textAlign: 'left', padding: 'var(--space-2)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Preferences
                </button>
                <button style={{ width: '100%', textAlign: 'left', padding: 'var(--space-2)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Help & Support
                </button>
                <hr style={{ margin: 'var(--space-2) 0', border: 'none', borderTop: '1px solid var(--gray-200)' }} />
                <button style={{ width: '100%', textAlign: 'left', padding: 'var(--space-2)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error-600)' }}>
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
