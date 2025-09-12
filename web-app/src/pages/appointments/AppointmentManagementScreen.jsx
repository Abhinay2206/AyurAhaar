import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Input } from '../../components';
import { formatDate, formatCurrency } from '../../utils';
import { ApiService } from '../../services';
import './AppointmentManagement.css';

// Mock appointment data based on mobile app structure
const mockAppointments = [
  {
    id: 'APT001',
    bookingId: 'AYR001234',
    patient: {
      id: 'P0001',
      name: 'Rajesh Kumar',
      age: 56,
      phone: '+91 9876543210',
      email: 'rajesh.kumar@email.com'
    },
    doctor: {
      id: 'D1000',
      name: 'Dr. Rajesh Kumar',
      specialization: 'Panchakarma & Detoxification',
      clinic: 'Ayurveda Wellness Center',
      area: 'Banjara Hills',
      image: '👨‍⚕️'
    },
    date: '2024-02-10',
    time: '10:00 AM',
    duration: 60,
    status: 'confirmed',
    type: 'consultation',
    consultationFee: 800,
    paymentStatus: 'paid',
    notes: 'Follow-up consultation for digestive issues',
    createdAt: '2024-01-25',
    reminderSent: true
  },
  {
    id: 'APT002',
    bookingId: 'AYR001235',
    patient: {
      id: 'P0002',
      name: 'Priya Sharma',
      age: 36,
      phone: '+91 9876543211',
      email: 'priya.sharma@email.com'
    },
    doctor: {
      id: 'D1001',
      name: 'Dr. Priya Sharma',
      specialization: 'Digestive Health & Nutrition',
      clinic: 'Holistic Ayurveda Clinic',
      area: 'Madhapur',
      image: '👩‍⚕️'
    },
    date: '2024-02-12',
    time: '02:00 PM',
    duration: 45,
    status: 'pending',
    type: 'initial',
    consultationFee: 1000,
    paymentStatus: 'pending',
    notes: 'Initial consultation for weight management',
    createdAt: '2024-01-28',
    reminderSent: false
  },
  {
    id: 'APT003',
    bookingId: 'AYR001236',
    patient: {
      id: 'P0003',
      name: 'Anita Reddy',
      age: 20,
      phone: '+91 9876543212',
      email: 'anita.reddy@email.com'
    },
    doctor: {
      id: 'D1000',
      name: 'Dr. Rajesh Kumar',
      specialization: 'Panchakarma & Detoxification',
      clinic: 'Ayurveda Wellness Center',
      area: 'Banjara Hills',
      image: '👨‍⚕️'
    },
    date: '2024-02-08',
    time: '11:30 AM',
    duration: 60,
    status: 'completed',
    type: 'follow-up',
    consultationFee: 800,
    paymentStatus: 'paid',
    notes: 'Post-treatment follow-up',
    createdAt: '2024-01-20',
    reminderSent: true
  },
  {
    id: 'APT004',
    bookingId: 'AYR001237',
    patient: {
      id: 'P0004',
      name: 'Vikram Singh',
      age: 29,
      phone: '+91 9876543213',
      email: 'vikram.singh@email.com'
    },
    doctor: {
      id: 'D1002',
      name: 'Dr. Sunita Devi',
      specialization: 'Stress Management & Mental Wellness',
      clinic: 'Mind-Body Ayurveda Center',
      area: 'Kondapur',
      image: '👩‍⚕️'
    },
    date: '2024-02-15',
    time: '04:00 PM',
    duration: 90,
    status: 'confirmed',
    type: 'therapy',
    consultationFee: 1200,
    paymentStatus: 'paid',
    notes: 'Stress management therapy session',
    createdAt: '2024-01-30',
    reminderSent: false
  },
  {
    id: 'APT005',
    bookingId: 'AYR001238',
    patient: {
      id: 'P0005',
      name: 'Sunita Devi',
      age: 33,
      phone: '+91 9876543214',
      email: 'sunita.devi@email.com'
    },
    doctor: {
      id: 'D1001',
      name: 'Dr. Priya Sharma',
      specialization: 'Digestive Health & Nutrition',
      clinic: 'Holistic Ayurveda Clinic',
      area: 'Madhapur',
      image: '👩‍⚕️'
    },
    date: '2024-02-06',
    time: '09:00 AM',
    duration: 45,
    status: 'cancelled',
    type: 'consultation',
    consultationFee: 1000,
    paymentStatus: 'refunded',
    notes: 'Cancelled due to patient illness',
    createdAt: '2024-01-22',
    reminderSent: false
  }
];

const AppointmentManagementScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriteria, setFilterCriteria] = useState({
    status: 'all',
    type: 'all',
    paymentStatus: 'all',
    dateRange: 'all'
  });
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('list'); // 'list' or 'calendar'

  const filterAppointments = useCallback(() => {
    let filtered = appointments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(appointment =>
        appointment.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.patient.phone.includes(searchTerm) ||
        appointment.patient.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterCriteria.status !== 'all') {
      filtered = filtered.filter(appointment => appointment.status === filterCriteria.status);
    }

    // Type filter
    if (filterCriteria.type !== 'all') {
      filtered = filtered.filter(appointment => appointment.type === filterCriteria.type);
    }

    // Payment status filter
    if (filterCriteria.paymentStatus !== 'all') {
      filtered = filtered.filter(appointment => appointment.paymentStatus === filterCriteria.paymentStatus);
    }

    // Date range filter
    if (filterCriteria.dateRange !== 'all') {
      const today = new Date();
      filtered = filtered.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        switch (filterCriteria.dateRange) {
          case 'today':
            return appointmentDate.toDateString() === today.toDateString();
          case 'week': {
            const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            return appointmentDate >= today && appointmentDate <= weekFromNow;
          }
          case 'month': {
            const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
            return appointmentDate >= today && appointmentDate <= monthFromNow;
          }
          case 'past':
            return appointmentDate < today;
          default:
            return true;
        }
      });
    }

    // Sort by date and time
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateB - dateA;
    });

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, filterCriteria]);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAppointments(mockAppointments);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [filterAppointments]);

  const handleAppointmentSelect = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#16a34a';
      case 'pending': return '#f59e0b';
      case 'completed': return '#059669';
      case 'cancelled': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return '✅';
      case 'pending': return '⏳';
      case 'completed': return '✔️';
      case 'cancelled': return '❌';
      default: return '❓';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'initial': return '#3b82f6';
      case 'follow-up': return '#8b5cf6';
      case 'consultation': return '#059669';
      case 'therapy': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const handleStatusChange = (appointmentId, newStatus) => {
    setAppointments(prev => prev.map(apt => 
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    ));
    if (selectedAppointment?.id === appointmentId) {
      setSelectedAppointment(prev => ({ ...prev, status: newStatus }));
    }
  };

  const AppointmentModal = () => {
    if (!selectedAppointment) return null;

    return (
      <div className="appointment-modal-overlay" onClick={() => setShowAppointmentModal(false)}>
        <div className="appointment-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Appointment Details</h2>
            <button 
              className="close-btn"
              onClick={() => setShowAppointmentModal(false)}
            >
              ×
            </button>
          </div>
          
          <div className="modal-content">
            <div className="appointment-details-grid">
              <div className="detail-section">
                <h3>Appointment Information</h3>
                <div className="detail-item">
                  <span>Booking ID:</span>
                  <span className="booking-id">#{selectedAppointment.bookingId}</span>
                </div>
                <div className="detail-item">
                  <span>Date & Time:</span>
                  <span>{formatDate(selectedAppointment.date)} at {selectedAppointment.time}</span>
                </div>
                <div className="detail-item">
                  <span>Duration:</span>
                  <span>{selectedAppointment.duration} minutes</span>
                </div>
                <div className="detail-item">
                  <span>Status:</span>
                  <span style={{color: getStatusColor(selectedAppointment.status)}}>
                    {getStatusIcon(selectedAppointment.status)} {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                  </span>
                </div>
                <div className="detail-item">
                  <span>Type:</span>
                  <span style={{color: getTypeColor(selectedAppointment.type)}}>
                    {selectedAppointment.type.charAt(0).toUpperCase() + selectedAppointment.type.slice(1)}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Patient Information</h3>
                <div className="detail-item">
                  <span>Name:</span>
                  <span>{selectedAppointment.patient.name}</span>
                </div>
                <div className="detail-item">
                  <span>Age:</span>
                  <span>{selectedAppointment.patient.age} years</span>
                </div>
                <div className="detail-item">
                  <span>Phone:</span>
                  <span>{selectedAppointment.patient.phone}</span>
                </div>
                <div className="detail-item">
                  <span>Email:</span>
                  <span>{selectedAppointment.patient.email}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Doctor Information</h3>
                <div className="detail-item">
                  <span>Doctor:</span>
                  <span>{selectedAppointment.doctor.name}</span>
                </div>
                <div className="detail-item">
                  <span>Specialization:</span>
                  <span>{selectedAppointment.doctor.specialization}</span>
                </div>
                <div className="detail-item">
                  <span>Clinic:</span>
                  <span>{selectedAppointment.doctor.clinic}</span>
                </div>
                <div className="detail-item">
                  <span>Location:</span>
                  <span>{selectedAppointment.doctor.area}, Hyderabad</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Payment & Notes</h3>
                <div className="detail-item">
                  <span>Consultation Fee:</span>
                  <span>{formatCurrency(selectedAppointment.consultationFee)}</span>
                </div>
                <div className="detail-item">
                  <span>Payment Status:</span>
                  <span className={`payment-status ${selectedAppointment.paymentStatus}`}>
                    {selectedAppointment.paymentStatus.charAt(0).toUpperCase() + selectedAppointment.paymentStatus.slice(1)}
                  </span>
                </div>
                <div className="detail-item">
                  <span>Notes:</span>
                  <span>{selectedAppointment.notes}</span>
                </div>
                <div className="detail-item">
                  <span>Booked On:</span>
                  <span>{formatDate(selectedAppointment.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              {selectedAppointment.status === 'confirmed' && (
                <>
                  <Button 
                    variant="primary"
                    onClick={() => handleStatusChange(selectedAppointment.id, 'completed')}
                  >
                    Mark Complete
                  </Button>
                  <Button variant="secondary">Reschedule</Button>
                </>
              )}
              {selectedAppointment.status === 'pending' && (
                <>
                  <Button 
                    variant="primary"
                    onClick={() => handleStatusChange(selectedAppointment.id, 'confirmed')}
                  >
                    Confirm
                  </Button>
                  <Button variant="outline">Send Reminder</Button>
                </>
              )}
              <Button variant="outline">View Patient</Button>
              <Button variant="outline">Print Details</Button>
              {(selectedAppointment.status === 'pending' || selectedAppointment.status === 'confirmed') && (
                <Button 
                  variant="outline"
                  onClick={() => handleStatusChange(selectedAppointment.id, 'cancelled')}
                  style={{color: '#dc2626', borderColor: '#dc2626'}}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const StatsCards = () => {
    const today = new Date().toDateString();
    const todayAppointments = appointments.filter(apt => 
      new Date(apt.date).toDateString() === today
    );
    const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
    const totalRevenue = appointments
      .filter(apt => apt.paymentStatus === 'paid')
      .reduce((sum, apt) => sum + apt.consultationFee, 0);

    return (
      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-number">{todayAppointments.length}</div>
            <div className="stat-label">Today's Appointments</div>
          </div>
          <div className="stat-icon">📅</div>
        </Card>
        
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-number">{pendingAppointments.length}</div>
            <div className="stat-label">Pending Confirmations</div>
          </div>
          <div className="stat-icon">⏳</div>
        </Card>
        
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-number">{appointments.length}</div>
            <div className="stat-label">Total Appointments</div>
          </div>
          <div className="stat-icon">📊</div>
        </Card>
        
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-number">{formatCurrency(totalRevenue)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
          <div className="stat-icon">💰</div>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="appointment-management">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-management">
      <div className="page-header">
        <div className="header-content">
          <h1>Appointment Management</h1>
          <p>Manage patient appointments and schedules</p>
        </div>
        <div className="header-actions">
          <Button 
            variant="outline"
            onClick={() => setSelectedView(selectedView === 'list' ? 'calendar' : 'list')}
          >
            {selectedView === 'list' ? '📅 Calendar View' : '📋 List View'}
          </Button>
          <Button 
            variant="primary"
            onClick={() => alert('Booking modal will be implemented')}
          >
            + Book Appointment
          </Button>
        </div>
      </div>

      <StatsCards />

      <div className="filters-section">
        <div className="search-bar">
          <Input
            type="text"
            placeholder="Search by patient name, booking ID, doctor, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="🔍"
          />
        </div>

        <div className="filter-controls">
          <select
            value={filterCriteria.status}
            onChange={(e) => setFilterCriteria({...filterCriteria, status: e.target.value})}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filterCriteria.type}
            onChange={(e) => setFilterCriteria({...filterCriteria, type: e.target.value})}
          >
            <option value="all">All Types</option>
            <option value="initial">Initial</option>
            <option value="follow-up">Follow-up</option>
            <option value="consultation">Consultation</option>
            <option value="therapy">Therapy</option>
          </select>

          <select
            value={filterCriteria.paymentStatus}
            onChange={(e) => setFilterCriteria({...filterCriteria, paymentStatus: e.target.value})}
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={filterCriteria.dateRange}
            onChange={(e) => setFilterCriteria({...filterCriteria, dateRange: e.target.value})}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="past">Past Appointments</option>
          </select>
        </div>
      </div>

      <div className="appointments-grid">
        {filteredAppointments.map(appointment => (
          <Card 
            key={appointment.id} 
            className="appointment-card"
            onClick={() => handleAppointmentSelect(appointment)}
          >
            <div className="appointment-card-header">
              <div className="appointment-info">
                <h3>{appointment.patient.name}</h3>
                <p className="booking-id">#{appointment.bookingId}</p>
              </div>
              <div className="appointment-badges">
                <div 
                  className="status-badge"
                  style={{backgroundColor: getStatusColor(appointment.status)}}
                >
                  {getStatusIcon(appointment.status)} {appointment.status}
                </div>
                <div 
                  className="type-badge"
                  style={{backgroundColor: getTypeColor(appointment.type)}}
                >
                  {appointment.type}
                </div>
              </div>
            </div>

            <div className="appointment-details">
              <div className="detail-row">
                <span className="detail-icon">📅</span>
                <span>{formatDate(appointment.date)} at {appointment.time}</span>
              </div>
              <div className="detail-row">
                <span className="detail-icon">👨‍⚕️</span>
                <span>{appointment.doctor.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-icon">🏥</span>
                <span>{appointment.doctor.specialization}</span>
              </div>
              <div className="detail-row">
                <span className="detail-icon">📍</span>
                <span>{appointment.doctor.area}</span>
              </div>
              <div className="detail-row">
                <span className="detail-icon">💰</span>
                <span>{formatCurrency(appointment.consultationFee)} - </span>
                <span className={`payment-status ${appointment.paymentStatus}`}>
                  {appointment.paymentStatus}
                </span>
              </div>
              {appointment.notes && (
                <div className="detail-row notes">
                  <span className="detail-icon">📝</span>
                  <span>{appointment.notes}</span>
                </div>
              )}
            </div>

            <div className="appointment-actions">
              {appointment.status === 'pending' && (
                <>
                  <button 
                    className="action-btn confirm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(appointment.id, 'confirmed');
                    }}
                  >
                    Confirm
                  </button>
                  <button className="action-btn">Remind</button>
                </>
              )}
              {appointment.status === 'confirmed' && (
                <>
                  <button 
                    className="action-btn complete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(appointment.id, 'completed');
                    }}
                  >
                    Complete
                  </button>
                  <button className="action-btn">Reschedule</button>
                </>
              )}
              <button className="action-btn">View Patient</button>
            </div>
          </Card>
        ))}
      </div>

      {filteredAppointments.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No appointments found</h3>
          <p>Try adjusting your search criteria or book a new appointment.</p>
          <Button 
            variant="primary"
            onClick={() => alert('Booking modal will be implemented')}
          >
            Book New Appointment
          </Button>
        </div>
      )}

      {showAppointmentModal && <AppointmentModal />}
    </div>
  );
};

export default AppointmentManagementScreen;
