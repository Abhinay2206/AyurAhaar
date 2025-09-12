import React, { useState } from 'react';

const PatientsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const patients = [
    {
      id: 1,
      name: 'Mrs. Priya Sharma',
      age: 34,
      gender: 'Female',
      phone: '+91 98765 43210',
      lastVisit: '2024-01-15',
      condition: 'Digestive Disorders',
      status: 'Active Treatment',
      priority: 'high',
      avatar: 'PS'
    },
    {
      id: 2,
      name: 'Mr. Amit Patel',
      age: 42,
      gender: 'Male',
      phone: '+91 98765 43211',
      lastVisit: '2024-01-12',
      condition: 'Joint Pain & Arthritis',
      status: 'Follow-up Required',
      priority: 'medium',
      avatar: 'AP'
    },
    {
      id: 3,
      name: 'Mrs. Sunita Devi',
      age: 28,
      gender: 'Female',
      phone: '+91 98765 43212',
      lastVisit: '2024-01-10',
      condition: 'Skin Disorders',
      status: 'Under Observation',
      priority: 'low',
      avatar: 'SD'
    },
    {
      id: 4,
      name: 'Mr. Ravi Kumar',
      age: 55,
      gender: 'Male',
      phone: '+91 98765 43213',
      lastVisit: '2024-01-08',
      condition: 'Respiratory Issues',
      status: 'Active Treatment',
      priority: 'high',
      avatar: 'RK'
    },
    {
      id: 5,
      name: 'Mrs. Meera Gupta',
      age: 38,
      gender: 'Female',
      phone: '+91 98765 43214',
      lastVisit: '2024-01-05',
      condition: 'Diabetes Management',
      status: 'Stable',
      priority: 'medium',
      avatar: 'MG'
    },
  ];

  const filterOptions = [
    { value: 'all', label: 'All Patients', count: patients.length },
    { value: 'active', label: 'Active Treatment', count: patients.filter(p => p.status === 'Active Treatment').length },
    { value: 'followup', label: 'Follow-up Required', count: patients.filter(p => p.status === 'Follow-up Required').length },
    { value: 'stable', label: 'Stable', count: patients.filter(p => p.status === 'Stable').length },
  ];

  const containerStyles = {
    padding: '24px 24px 24px 280px',
    minHeight: '100vh',
    backgroundColor: '#F7F8FA',
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
    marginTop: '72px',
  };

  const headerStyles = {
    marginBottom: '32px',
  };

  const titleStyles = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: '8px',
  };

  const subtitleStyles = {
    fontSize: '16px',
    color: '#64748B',
    fontWeight: '400',
  };

  const actionsBarStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    padding: '16px 20px',
    backgroundColor: 'white',
    border: '1px solid #E8EBF0',
    borderRadius: '8px',
  };

  const searchContainerStyles = {
    position: 'relative',
    width: '300px',
  };

  const searchInputStyles = {
    width: '100%',
    height: '40px',
    padding: '0 16px 0 44px',
    border: '1px solid #E8EBF0',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: '#F8FAFC',
    outline: 'none',
  };

  const searchIconStyles = {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '16px',
    color: '#64748B',
  };

  const filtersStyles = {
    display: 'flex',
    gap: '8px',
  };

  const filterButtonStyles = (isActive) => ({
    padding: '8px 16px',
    border: '1px solid #E8EBF0',
    borderRadius: '6px',
    backgroundColor: isActive ? '#1565C0' : 'white',
    color: isActive ? 'white' : '#64748B',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  const addButtonStyles = {
    padding: '10px 20px',
    backgroundColor: '#1565C0',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const statsGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  };

  const statCardStyles = {
    backgroundColor: 'white',
    border: '1px solid #E8EBF0',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
  };

  const statValueStyles = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: '4px',
  };

  const statLabelStyles = {
    fontSize: '14px',
    color: '#64748B',
    fontWeight: '500',
  };

  const patientsListStyles = {
    backgroundColor: 'white',
    border: '1px solid #E8EBF0',
    borderRadius: '8px',
    overflow: 'hidden',
  };

  const tableHeaderStyles = {
    backgroundColor: '#F8FAFC',
    borderBottom: '1px solid #E8EBF0',
    padding: '16px 20px',
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 120px',
    gap: '16px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const patientRowStyles = {
    padding: '16px 20px',
    borderBottom: '1px solid #F1F5F9',
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 120px',
    gap: '16px',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  };

  const avatarStyles = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    marginRight: '12px',
  };

  const patientInfoStyles = {
    display: 'flex',
    alignItems: 'center',
  };

  const patientNameStyles = {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: '2px',
  };

  const patientDetailsStyles = {
    fontSize: '13px',
    color: '#64748B',
  };

  const statusBadgeStyles = (status) => {
    const statusColors = {
      'Active Treatment': { bg: '#FEE2E2', color: '#DC2626' },
      'Follow-up Required': { bg: '#FEF3C7', color: '#92400E' },
      'Under Observation': { bg: '#E0F2FE', color: '#0369A1' },
      'Stable': { bg: '#DCFCE7', color: '#166534' },
    };
    
    const colors = statusColors[status] || { bg: '#F1F5F9', color: '#64748B' };
    
    return {
      fontSize: '11px',
      fontWeight: '600',
      padding: '4px 8px',
      borderRadius: '12px',
      textTransform: 'uppercase',
      backgroundColor: colors.bg,
      color: colors.color,
    };
  };

  const priorityBadgeStyles = (priority) => ({
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '12px',
    textTransform: 'uppercase',
    backgroundColor: priority === 'high' ? '#FEE2E2' : priority === 'medium' ? '#FEF3C7' : '#DCFCE7',
    color: priority === 'high' ? '#DC2626' : priority === 'medium' ? '#92400E' : '#166534',
  });

  const actionButtonStyles = {
    padding: '6px 12px',
    backgroundColor: '#1565C0',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.condition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || patient.status === getStatusFromFilter(selectedFilter);
    return matchesSearch && matchesFilter;
  });

  function getStatusFromFilter(filter) {
    const filterMap = {
      'active': 'Active Treatment',
      'followup': 'Follow-up Required',
      'stable': 'Stable',
    };
    return filterMap[filter];
  }

  const handleRowHover = (e) => {
    e.currentTarget.style.backgroundColor = '#F8FAFC';
  };

  const handleRowLeave = (e) => {
    e.currentTarget.style.backgroundColor = 'white';
  };

  const handleButtonHover = (e) => {
    e.target.style.backgroundColor = '#1976D2';
  };

  const handleButtonLeave = (e) => {
    e.target.style.backgroundColor = '#1565C0';
  };

  const handleAddButtonHover = (e) => {
    e.target.style.backgroundColor = '#1976D2';
    e.target.style.transform = 'translateY(-1px)';
  };

  const handleAddButtonLeave = (e) => {
    e.target.style.backgroundColor = '#1565C0';
    e.target.style.transform = 'translateY(0)';
  };

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <h1 style={titleStyles}>Patient Registry</h1>
        <p style={subtitleStyles}>Manage and monitor patient records and treatment progress</p>
      </div>

      {/* Stats Cards */}
      <div style={statsGridStyles}>
        <div style={statCardStyles}>
          <div style={statValueStyles}>{patients.length}</div>
          <div style={statLabelStyles}>Total Patients</div>
        </div>
        <div style={statCardStyles}>
          <div style={statValueStyles}>{patients.filter(p => p.status === 'Active Treatment').length}</div>
          <div style={statLabelStyles}>Active Treatment</div>
        </div>
        <div style={statCardStyles}>
          <div style={statValueStyles}>{patients.filter(p => p.status === 'Follow-up Required').length}</div>
          <div style={statLabelStyles}>Follow-up Required</div>
        </div>
        <div style={statCardStyles}>
          <div style={statValueStyles}>{patients.filter(p => p.priority === 'high').length}</div>
          <div style={statLabelStyles}>High Priority</div>
        </div>
      </div>

      {/* Actions Bar */}
      <div style={actionsBarStyles}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={searchContainerStyles}>
            <div style={searchIconStyles}>🔍</div>
            <input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={searchInputStyles}
            />
          </div>
          <div style={filtersStyles}>
            {filterOptions.map(filter => (
              <button
                key={filter.value}
                style={filterButtonStyles(selectedFilter === filter.value)}
                onClick={() => setSelectedFilter(filter.value)}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>
        <button
          style={addButtonStyles}
          onMouseEnter={handleAddButtonHover}
          onMouseLeave={handleAddButtonLeave}
        >
          + Add New Patient
        </button>
      </div>

      {/* Patients List */}
      <div style={patientsListStyles}>
        <div style={tableHeaderStyles}>
          <div>Patient</div>
          <div>Age/Gender</div>
          <div>Condition</div>
          <div>Last Visit</div>
          <div>Status</div>
          <div>Priority</div>
          <div>Actions</div>
        </div>
        {filteredPatients.map(patient => (
          <div
            key={patient.id}
            style={patientRowStyles}
            onMouseEnter={handleRowHover}
            onMouseLeave={handleRowLeave}
          >
            <div style={patientInfoStyles}>
              <div style={avatarStyles}>{patient.avatar}</div>
              <div>
                <div style={patientNameStyles}>{patient.name}</div>
                <div style={patientDetailsStyles}>{patient.phone}</div>
              </div>
            </div>
            <div style={{ fontSize: '14px', color: '#64748B' }}>
              {patient.age}yrs / {patient.gender.charAt(0)}
            </div>
            <div style={{ fontSize: '14px', color: '#1E293B', fontWeight: '500' }}>
              {patient.condition}
            </div>
            <div style={{ fontSize: '14px', color: '#64748B' }}>
              {new Date(patient.lastVisit).toLocaleDateString()}
            </div>
            <div style={statusBadgeStyles(patient.status)}>
              {patient.status}
            </div>
            <div style={priorityBadgeStyles(patient.priority)}>
              {patient.priority}
            </div>
            <button
              style={actionButtonStyles}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
            >
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientsScreen;
