import React, { useState } from 'react';
import { Card, Button, Input } from '../../components';
import { formatDate } from '../../utils';
import './DoctorManagement.css';

// Mock doctors data
const mockDoctors = [
  {
    id: 'DOC001',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@ayurahaar.com',
    phone: '+91 98765 43210',
    specialization: 'Panchakarma Specialist',
    experience: 8,
    qualification: 'BAMS, MD (Ayurveda)',
    license: 'AYU123456',
    status: 'active',
    joinDate: '2023-01-15',
    patients: 156,
    consultations: 892,
    rating: 4.8,
    address: 'Mumbai, Maharashtra',
    profileImage: '/api/placeholder/150/150'
  },
  {
    id: 'DOC002',
    name: 'Dr. Amit Patel',
    email: 'amit.patel@ayurahaar.com',
    phone: '+91 98765 43211',
    specialization: 'Nutrition & Diet Therapy',
    experience: 12,
    qualification: 'BAMS, PhD (Nutrition)',
    license: 'AYU123457',
    status: 'active',
    joinDate: '2022-08-20',
    patients: 203,
    consultations: 1245,
    rating: 4.9,
    address: 'Ahmedabad, Gujarat',
    profileImage: '/api/placeholder/150/150'
  },
  {
    id: 'DOC003',
    name: 'Dr. Sunita Reddy',
    email: 'sunita.reddy@ayurahaar.com',
    phone: '+91 98765 43212',
    specialization: 'Women\'s Health',
    experience: 6,
    qualification: 'BAMS, MS (Ayurveda)',
    license: 'AYU123458',
    status: 'pending',
    joinDate: '2024-02-10',
    patients: 45,
    consultations: 178,
    rating: 4.6,
    address: 'Hyderabad, Telangana',
    profileImage: '/api/placeholder/150/150'
  },
  {
    id: 'DOC004',
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@ayurahaar.com',
    phone: '+91 98765 43213',
    specialization: 'General Medicine',
    experience: 15,
    qualification: 'BAMS, MD (Kayachikitsa)',
    license: 'AYU123459',
    status: 'inactive',
    joinDate: '2021-06-12',
    patients: 89,
    consultations: 567,
    rating: 4.4,
    address: 'Delhi, India',
    profileImage: '/api/placeholder/150/150'
  }
];

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState(mockDoctors);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    qualification: '',
    license: '',
    address: ''
  });

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doctor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      active: '#22c55e',
      pending: '#f59e0b',
      inactive: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: '✅ Active',
      pending: '⏳ Pending',
      inactive: '❌ Inactive'
    };
    return badges[status] || status;
  };

  const handleStatusChange = (doctorId, newStatus) => {
    setDoctors(prev => prev.map(doctor => 
      doctor.id === doctorId ? { ...doctor, status: newStatus } : doctor
    ));
  };

  const handleAddDoctor = () => {
    const doctorWithId = {
      ...newDoctor,
      id: `DOC${String(doctors.length + 1).padStart(3, '0')}`,
      status: 'pending',
      joinDate: new Date().toISOString().split('T')[0],
      patients: 0,
      consultations: 0,
      rating: 0,
      profileImage: '/api/placeholder/150/150'
    };
    
    setDoctors(prev => [...prev, doctorWithId]);
    setNewDoctor({
      name: '', email: '', phone: '', specialization: '', 
      experience: '', qualification: '', license: '', address: ''
    });
    setShowAddModal(false);
  };

  const handleDeleteDoctor = (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      setDoctors(prev => prev.filter(doctor => doctor.id !== doctorId));
    }
  };

  const AddDoctorModal = () => (
    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Doctor</h2>
          <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <Input
              label="Full Name"
              value={newDoctor.name}
              onChange={(e) => setNewDoctor(prev => ({...prev, name: e.target.value}))}
              placeholder="Enter doctor's full name"
            />
            <Input
              label="Email"
              type="email"
              value={newDoctor.email}
              onChange={(e) => setNewDoctor(prev => ({...prev, email: e.target.value}))}
              placeholder="doctor@example.com"
            />
            <Input
              label="Phone"
              value={newDoctor.phone}
              onChange={(e) => setNewDoctor(prev => ({...prev, phone: e.target.value}))}
              placeholder="+91 98765 43210"
            />
            <Input
              label="Specialization"
              value={newDoctor.specialization}
              onChange={(e) => setNewDoctor(prev => ({...prev, specialization: e.target.value}))}
              placeholder="e.g., Panchakarma Specialist"
            />
            <Input
              label="Experience (years)"
              type="number"
              value={newDoctor.experience}
              onChange={(e) => setNewDoctor(prev => ({...prev, experience: e.target.value}))}
              placeholder="5"
            />
            <Input
              label="Qualification"
              value={newDoctor.qualification}
              onChange={(e) => setNewDoctor(prev => ({...prev, qualification: e.target.value}))}
              placeholder="BAMS, MD (Ayurveda)"
            />
            <Input
              label="License Number"
              value={newDoctor.license}
              onChange={(e) => setNewDoctor(prev => ({...prev, license: e.target.value}))}
              placeholder="AYU123456"
            />
            <Input
              label="Address"
              value={newDoctor.address}
              onChange={(e) => setNewDoctor(prev => ({...prev, address: e.target.value}))}
              placeholder="City, State"
              className="full-width"
            />
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddDoctor}>Add Doctor</Button>
        </div>
      </div>
    </div>
  );

  const DoctorDetailsModal = () => (
    <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Doctor Details</h2>
          <button className="modal-close" onClick={() => setShowDetailsModal(false)}>×</button>
        </div>
        <div className="modal-body">
          {selectedDoctor && (
            <div className="doctor-details">
              <div className="doctor-profile">
                <img 
                  src={selectedDoctor.profileImage} 
                  alt={selectedDoctor.name}
                  className="profile-image"
                />
                <div className="profile-info">
                  <h3>{selectedDoctor.name}</h3>
                  <p className="specialization">{selectedDoctor.specialization}</p>
                  <p className="experience">{selectedDoctor.experience} years experience</p>
                  <div className="rating">
                    ⭐ {selectedDoctor.rating}/5.0
                  </div>
                </div>
              </div>
              
              <div className="details-grid">
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{selectedDoctor.email}</span>
                </div>
                <div className="detail-item">
                  <label>Phone:</label>
                  <span>{selectedDoctor.phone}</span>
                </div>
                <div className="detail-item">
                  <label>License:</label>
                  <span>{selectedDoctor.license}</span>
                </div>
                <div className="detail-item">
                  <label>Qualification:</label>
                  <span>{selectedDoctor.qualification}</span>
                </div>
                <div className="detail-item">
                  <label>Address:</label>
                  <span>{selectedDoctor.address}</span>
                </div>
                <div className="detail-item">
                  <label>Join Date:</label>
                  <span>{formatDate(selectedDoctor.joinDate)}</span>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-value">{selectedDoctor.patients}</span>
                  <span className="stat-label">Total Patients</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{selectedDoctor.consultations}</span>
                  <span className="stat-label">Consultations</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{selectedDoctor.rating}/5</span>
                  <span className="stat-label">Rating</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <Button variant="outline" onClick={() => setShowDetailsModal(false)}>Close</Button>
          <Button variant="primary">Edit Doctor</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="doctor-management">
      <div className="page-header">
        <div className="header-content">
          <h1>👨‍⚕️ Doctor Management</h1>
          <p>Manage all registered doctors and their profiles</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          + Add New Doctor
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-overview">
        <Card className="stat-card active">
          <div className="stat-content">
            <span className="stat-icon">✅</span>
            <div className="stat-info">
              <span className="stat-number">{doctors.filter(d => d.status === 'active').length}</span>
              <span className="stat-label">Active Doctors</span>
            </div>
          </div>
        </Card>
        <Card className="stat-card pending">
          <div className="stat-content">
            <span className="stat-icon">⏳</span>
            <div className="stat-info">
              <span className="stat-number">{doctors.filter(d => d.status === 'pending').length}</span>
              <span className="stat-label">Pending Approval</span>
            </div>
          </div>
        </Card>
        <Card className="stat-card inactive">
          <div className="stat-content">
            <span className="stat-icon">❌</span>
            <div className="stat-info">
              <span className="stat-number">{doctors.filter(d => d.status === 'inactive').length}</span>
              <span className="stat-label">Inactive</span>
            </div>
          </div>
        </Card>
        <Card className="stat-card total">
          <div className="stat-content">
            <span className="stat-icon">👥</span>
            <div className="stat-info">
              <span className="stat-number">{doctors.length}</span>
              <span className="stat-label">Total Doctors</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="filters-section">
        <div className="filters-grid">
          <Input
            type="text"
            placeholder="Search doctors by name, email, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="🔍"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </Card>

      {/* Doctors List */}
      <Card className="doctors-list">
        <div className="list-header">
          <h3>Doctors ({filteredDoctors.length})</h3>
        </div>
        <div className="doctors-grid">
          {filteredDoctors.map(doctor => (
            <div key={doctor.id} className="doctor-card">
              <div className="doctor-header">
                <img 
                  src={doctor.profileImage} 
                  alt={doctor.name}
                  className="doctor-avatar"
                />
                <div className="doctor-info">
                  <h4>{doctor.name}</h4>
                  <p className="doctor-id">{doctor.id}</p>
                  <span 
                    className="status-badge"
                    style={{color: getStatusColor(doctor.status)}}
                  >
                    {getStatusBadge(doctor.status)}
                  </span>
                </div>
              </div>

              <div className="doctor-details">
                <div className="detail-row">
                  <span className="label">Specialization:</span>
                  <span className="value">{doctor.specialization}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Experience:</span>
                  <span className="value">{doctor.experience} years</span>
                </div>
                <div className="detail-row">
                  <span className="label">Patients:</span>
                  <span className="value">{doctor.patients}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Rating:</span>
                  <span className="value">⭐ {doctor.rating}/5</span>
                </div>
              </div>

              <div className="doctor-actions">
                <Button 
                  variant="outline" 
                  size="small"
                  onClick={() => {
                    setSelectedDoctor(doctor);
                    setShowDetailsModal(true);
                  }}
                >
                  View Details
                </Button>
                <select
                  value={doctor.status}
                  onChange={(e) => handleStatusChange(doctor.id, e.target.value)}
                  className="status-select"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteDoctor(doctor.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="no-results">
            <p>No doctors found matching your criteria.</p>
          </div>
        )}
      </Card>

      {showAddModal && <AddDoctorModal />}
      {showDetailsModal && <DoctorDetailsModal />}
    </div>
  );
};

export default DoctorManagement;
