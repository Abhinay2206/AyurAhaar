import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../../components';
import { formatDate, getPrakritiColor } from '../../utils';
import './MealPlanManagement.css';

const MealPlanManagement = () => {
  const [mealPlans, setMealPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    doctor: 'all',
    prakriti: 'all',
    dateRange: 'all'
  });
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({});

  useEffect(() => {
    // Mock meal plans data based on CSV structure
    const mockPlans = [
      {
        id: 'MP001',
        doctorId: 'DOC001',
        doctorName: 'Dr. Priya Sharma',
        patientId: 'P0001',
        patientName: 'Rajesh Kumar',
        patientPrakriti: 'Kapha',
        createdDate: '2024-03-10',
        duration: 7,
        status: 'active',
        totalDays: 7,
        completedDays: 3,
        sleepTiming: '10:30 PM – 6:00 AM',
        doctorNotes: 'Patient advised to stay hydrated and exercise moderately.',
        planSummary: {
          breakfast: ['Wheat Dalia', 'Ghee', 'Sweet Lime'],
          lunch: ['Quinoa Sprouts', 'Mixed Spice Powder', 'Sprouted Moong'],
          dinner: ['Kodo Millet', 'Varuna', 'Medicinal Bitter Gourd'],
          snacks: ['Probiotic Dahi', 'Pineapple'],
          restrictedFoods: ['Cold foods', 'Processed foods', 'Excess sweets']
        },
        compliance: 85,
        patientFeedback: 'Feeling more energetic and digestive issues improved.',
        effectiveness: 'good'
      },
      {
        id: 'MP002',
        doctorId: 'DOC002',
        doctorName: 'Dr. Amit Patel',
        patientId: 'P0002',
        patientName: 'Priya Sharma',
        patientPrakriti: 'Vata',
        createdDate: '2024-03-08',
        duration: 14,
        status: 'completed',
        totalDays: 14,
        completedDays: 14,
        sleepTiming: '11:00 PM – 7:00 AM',
        doctorNotes: 'Focus on warm, nourishing foods. Avoid cold and raw foods.',
        planSummary: {
          breakfast: ['Warm Oats', 'Ghee', 'Dates'],
          lunch: ['Quinoa', 'Steamed Vegetables', 'Coconut Oil'],
          dinner: ['Millet Khichdi', 'Turmeric', 'Ginger'],
          snacks: ['Warm Milk', 'Almonds'],
          restrictedFoods: ['Cold drinks', 'Raw salads', 'Ice cream']
        },
        compliance: 92,
        patientFeedback: 'Excellent results. Sleep improved and anxiety reduced.',
        effectiveness: 'excellent'
      },
      {
        id: 'MP003',
        doctorId: 'DOC003',
        doctorName: 'Dr. Sunita Reddy',
        patientId: 'P0003',
        patientName: 'Anita Reddy',
        patientPrakriti: 'Vata',
        createdDate: '2024-03-12',
        duration: 7,
        status: 'pending_approval',
        totalDays: 7,
        completedDays: 0,
        sleepTiming: '10:00 PM – 6:30 AM',
        doctorNotes: 'Special attention to blood pressure management through diet.',
        planSummary: {
          breakfast: ['Oatmeal', 'Cinnamon', 'Banana'],
          lunch: ['Brown Rice', 'Dal', 'Cucumber'],
          dinner: ['Roti', 'Spinach', 'Yogurt'],
          snacks: ['Green Tea', 'Walnuts'],
          restrictedFoods: ['Salt', 'Caffeine', 'Fried foods']
        },
        compliance: 0,
        patientFeedback: '',
        effectiveness: 'pending'
      },
      {
        id: 'MP004',
        doctorId: 'DOC004',
        doctorName: 'Dr. Rajesh Kumar',
        patientId: 'P0004',
        patientName: 'Vikram Singh',
        patientPrakriti: 'Pitta',
        createdDate: '2024-03-05',
        duration: 21,
        status: 'active',
        totalDays: 21,
        completedDays: 8,
        sleepTiming: '10:30 PM – 6:00 AM',
        doctorNotes: 'Diabetes management through Ayurvedic principles.',
        planSummary: {
          breakfast: ['Barley Porridge', 'Bitter Gourd Juice'],
          lunch: ['Quinoa', 'Methi Leaves', 'Buttermilk'],
          dinner: ['Millet Roti', 'Karela Sabzi', 'Curd'],
          snacks: ['Amla', 'Green Tea'],
          restrictedFoods: ['Sugar', 'White rice', 'Sweets']
        },
        compliance: 78,
        patientFeedback: 'Blood sugar levels are stabilizing gradually.',
        effectiveness: 'good'
      },
      {
        id: 'MP005',
        doctorId: 'DOC001',
        doctorName: 'Dr. Priya Sharma',
        patientId: 'P0005',
        patientName: 'Meera Joshi',
        patientPrakriti: 'Kapha',
        createdDate: '2024-03-11',
        duration: 14,
        status: 'paused',
        totalDays: 14,
        completedDays: 5,
        sleepTiming: '10:15 PM – 6:15 AM',
        doctorNotes: 'PCOD management with hormonal balance focus.',
        planSummary: {
          breakfast: ['Fenugreek Tea', 'Upma'],
          lunch: ['Brown Rice', 'Turmeric Dal', 'Salad'],
          dinner: ['Ragi Roti', 'Mixed Vegetables'],
          snacks: ['Spearmint Tea', 'Seeds Mix'],
          restrictedFoods: ['Dairy', 'Refined sugar', 'Processed foods']
        },
        compliance: 65,
        patientFeedback: 'Had to pause due to travel. Plan was working well.',
        effectiveness: 'fair'
      }
    ];

    setMealPlans(mockPlans);

    // Calculate statistics
    const totalPlans = mockPlans.length;
    const activePlans = mockPlans.filter(p => p.status === 'active').length;
    const completedPlans = mockPlans.filter(p => p.status === 'completed').length;
    const pendingApproval = mockPlans.filter(p => p.status === 'pending_approval').length;
    const avgCompliance = Math.round(
      mockPlans.reduce((sum, p) => sum + p.compliance, 0) / totalPlans
    );

    setStats({
      totalPlans,
      activePlans,
      completedPlans,
      pendingApproval,
      avgCompliance,
      effectivenessStats: {
        excellent: mockPlans.filter(p => p.effectiveness === 'excellent').length,
        good: mockPlans.filter(p => p.effectiveness === 'good').length,
        fair: mockPlans.filter(p => p.effectiveness === 'fair').length,
        poor: mockPlans.filter(p => p.effectiveness === 'poor').length
      }
    });
  }, []);

  const filteredPlans = mealPlans.filter(plan => {
    const matchesSearch = plan.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || plan.status === filters.status;
    const matchesDoctor = filters.doctor === 'all' || plan.doctorName === filters.doctor;
    const matchesPrakriti = filters.prakriti === 'all' || plan.patientPrakriti === filters.prakriti;

    return matchesSearch && matchesStatus && matchesDoctor && matchesPrakriti;
  });

  const getStatusColor = (status) => {
    const colors = {
      'active': '#10b981',
      'completed': '#3b82f6',
      'pending_approval': '#f59e0b',
      'paused': '#ef4444',
      'cancelled': '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const getEffectivenessColor = (effectiveness) => {
    const colors = {
      'excellent': '#10b981',
      'good': '#3b82f6',
      'fair': '#f59e0b',
      'poor': '#ef4444',
      'pending': '#6b7280'
    };
    return colors[effectiveness] || '#6b7280';
  };

  const getComplianceColor = (compliance) => {
    if (compliance >= 80) return '#10b981';
    if (compliance >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const handleApprove = (planId) => {
    setMealPlans(prev => prev.map(plan => 
      plan.id === planId ? { ...plan, status: 'active' } : plan
    ));
  };

  const handleReject = (planId) => {
    setMealPlans(prev => prev.map(plan => 
      plan.id === planId ? { ...plan, status: 'cancelled' } : plan
    ));
  };

  const StatCard = ({ title, value, subtitle, icon, color }) => (
    <Card className={`stat-card ${color}`}>
      <div className="stat-content">
        <div className="stat-icon">{icon}</div>
        <div className="stat-details">
          <h3>{value}</h3>
          <p>{title}</p>
          {subtitle && <span className="stat-subtitle">{subtitle}</span>}
        </div>
      </div>
    </Card>
  );

  const PlanDetailsModal = () => (
    <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
      <div className="plan-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Meal Plan Details</h2>
          <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
        </div>
        
        {selectedPlan && (
          <div className="modal-content">
            <div className="plan-overview">
              <div className="plan-basic-info">
                <h3>{selectedPlan.id}</h3>
                <div className="plan-meta">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(selectedPlan.status) }}
                  >
                    {selectedPlan.status.replace('_', ' ')}
                  </span>
                  <span className="duration">{selectedPlan.duration} days</span>
                  <span 
                    className="effectiveness"
                    style={{ color: getEffectivenessColor(selectedPlan.effectiveness) }}
                  >
                    {selectedPlan.effectiveness}
                  </span>
                </div>
              </div>
              
              <div className="plan-participants">
                <div className="participant">
                  <h4>Patient</h4>
                  <p>{selectedPlan.patientName}</p>
                  <span 
                    className="prakriti-tag"
                    style={{ backgroundColor: getPrakritiColor(selectedPlan.patientPrakriti) }}
                  >
                    {selectedPlan.patientPrakriti}
                  </span>
                </div>
                <div className="participant">
                  <h4>Doctor</h4>
                  <p>{selectedPlan.doctorName}</p>
                </div>
              </div>
            </div>

            <div className="plan-progress">
              <h4>Progress</h4>
              <div className="progress-stats">
                <div className="progress-item">
                  <span className="label">Completion</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${(selectedPlan.completedDays / selectedPlan.totalDays) * 100}%`,
                        backgroundColor: '#3b82f6'
                      }}
                    ></div>
                  </div>
                  <span className="value">{selectedPlan.completedDays}/{selectedPlan.totalDays} days</span>
                </div>
                <div className="progress-item">
                  <span className="label">Compliance</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${selectedPlan.compliance}%`,
                        backgroundColor: getComplianceColor(selectedPlan.compliance)
                      }}
                    ></div>
                  </div>
                  <span className="value">{selectedPlan.compliance}%</span>
                </div>
              </div>
            </div>

            <div className="meal-summary">
              <h4>Meal Plan Summary</h4>
              <div className="meals-grid">
                <div className="meal-section">
                  <h5>🌅 Breakfast</h5>
                  <div className="food-items">
                    {selectedPlan.planSummary.breakfast.map((item, index) => (
                      <span key={index} className="food-tag">{item}</span>
                    ))}
                  </div>
                </div>
                <div className="meal-section">
                  <h5>🌞 Lunch</h5>
                  <div className="food-items">
                    {selectedPlan.planSummary.lunch.map((item, index) => (
                      <span key={index} className="food-tag">{item}</span>
                    ))}
                  </div>
                </div>
                <div className="meal-section">
                  <h5>🌙 Dinner</h5>
                  <div className="food-items">
                    {selectedPlan.planSummary.dinner.map((item, index) => (
                      <span key={index} className="food-tag">{item}</span>
                    ))}
                  </div>
                </div>
                <div className="meal-section">
                  <h5>🍎 Snacks</h5>
                  <div className="food-items">
                    {selectedPlan.planSummary.snacks.map((item, index) => (
                      <span key={index} className="food-tag">{item}</span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="restrictions">
                <h5>🚫 Restricted Foods</h5>
                <div className="food-items">
                  {selectedPlan.planSummary.restrictedFoods.map((item, index) => (
                    <span key={index} className="food-tag restricted">{item}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="additional-info">
              <div className="info-section">
                <h5>Sleep Schedule</h5>
                <p>{selectedPlan.sleepTiming}</p>
              </div>
              <div className="info-section">
                <h5>Doctor's Notes</h5>
                <p>{selectedPlan.doctorNotes}</p>
              </div>
              {selectedPlan.patientFeedback && (
                <div className="info-section">
                  <h5>Patient Feedback</h5>
                  <p>"{selectedPlan.patientFeedback}"</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="modal-actions">
          <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          {selectedPlan?.status === 'pending_approval' && (
            <>
              <Button 
                variant="danger" 
                onClick={() => {
                  handleReject(selectedPlan.id);
                  setShowDetailsModal(false);
                }}
              >
                Reject
              </Button>
              <Button 
                variant="primary" 
                onClick={() => {
                  handleApprove(selectedPlan.id);
                  setShowDetailsModal(false);
                }}
              >
                Approve
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="meal-plan-management">
      <div className="page-header">
        <div className="header-content">
          <h1>📋 Meal Plan Management</h1>
          <p>Monitor and manage all patient meal plans</p>
        </div>
        <div className="header-actions">
          <Button variant="outline">📊 Generate Report</Button>
          <Button variant="primary">📈 Analytics</Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <StatCard
          title="Total Plans"
          value={stats.totalPlans}
          icon="📋"
          color="blue"
        />
        <StatCard
          title="Active Plans"
          value={stats.activePlans}
          icon="🟢"
          color="green"
        />
        <StatCard
          title="Completed"
          value={stats.completedPlans}
          icon="✅"
          color="purple"
        />
        <StatCard
          title="Pending Approval"
          value={stats.pendingApproval}
          subtitle="Requires attention"
          icon="⏳"
          color="orange"
        />
        <StatCard
          title="Avg. Compliance"
          value={`${stats.avgCompliance}%`}
          icon="📊"
          color="teal"
        />
      </div>

      {/* Effectiveness Overview */}
      <Card className="effectiveness-card">
        <h3>📈 Plan Effectiveness Overview</h3>
        <div className="effectiveness-chart">
          {Object.entries(stats.effectivenessStats || {}).map(([level, count]) => (
            <div key={level} className="effectiveness-item">
              <div className="effectiveness-label">
                <span 
                  className="effectiveness-color"
                  style={{ backgroundColor: getEffectivenessColor(level) }}
                ></span>
                {level}
              </div>
              <div className="effectiveness-value">{count}</div>
              <div 
                className="effectiveness-bar"
                style={{ 
                  width: `${(count / stats.totalPlans) * 100}%`,
                  backgroundColor: getEffectivenessColor(level)
                }}
              ></div>
            </div>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <Card className="filters-card">
        <div className="filters-header">
          <h3>🔍 Search & Filters</h3>
        </div>
        
        <div className="filters-content">
          <div className="search-section">
            <Input
              type="text"
              placeholder="Search by patient name, doctor, or plan ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon="🔍"
            />
          </div>

          <div className="filters-grid">
            <div className="filter-group">
              <label>Status</label>
              <select 
                value={filters.status} 
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Doctor</label>
              <select 
                value={filters.doctor} 
                onChange={(e) => setFilters({...filters, doctor: e.target.value})}
              >
                <option value="all">All Doctors</option>
                <option value="Dr. Priya Sharma">Dr. Priya Sharma</option>
                <option value="Dr. Amit Patel">Dr. Amit Patel</option>
                <option value="Dr. Sunita Reddy">Dr. Sunita Reddy</option>
                <option value="Dr. Rajesh Kumar">Dr. Rajesh Kumar</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Prakriti</label>
              <select 
                value={filters.prakriti} 
                onChange={(e) => setFilters({...filters, prakriti: e.target.value})}
              >
                <option value="all">All Prakritis</option>
                <option value="Vata">Vata</option>
                <option value="Pitta">Pitta</option>
                <option value="Kapha">Kapha</option>
              </select>
            </div>
          </div>

          <div className="filter-actions">
            <Button 
              variant="outline" 
              onClick={() => {
                setFilters({
                  status: 'all',
                  doctor: 'all',
                  prakriti: 'all',
                  dateRange: 'all'
                });
                setSearchTerm('');
              }}
            >
              Clear Filters
            </Button>
            <span className="results-count">
              Showing {filteredPlans.length} of {mealPlans.length} plans
            </span>
          </div>
        </div>
      </Card>

      {/* Plans List */}
      <Card className="plans-list-card">
        <div className="list-header">
          <h3>📋 Meal Plans</h3>
          <Button variant="outline" size="small">Export List</Button>
        </div>

        <div className="plans-table">
          <div className="table-header">
            <div className="table-cell">Plan ID</div>
            <div className="table-cell">Patient</div>
            <div className="table-cell">Doctor</div>
            <div className="table-cell">Status</div>
            <div className="table-cell">Progress</div>
            <div className="table-cell">Compliance</div>
            <div className="table-cell">Effectiveness</div>
            <div className="table-cell">Actions</div>
          </div>

          <div className="table-body">
            {filteredPlans.map(plan => (
              <div key={plan.id} className="table-row">
                <div className="table-cell plan-id">
                  <span className="plan-code">{plan.id}</span>
                  <span className="plan-date">{formatDate(plan.createdDate)}</span>
                </div>
                <div className="table-cell patient-info">
                  <div className="patient-name">{plan.patientName}</div>
                  <span 
                    className="prakriti-tag"
                    style={{ backgroundColor: getPrakritiColor(plan.patientPrakriti) }}
                  >
                    {plan.patientPrakriti}
                  </span>
                </div>
                <div className="table-cell doctor-name">
                  {plan.doctorName}
                </div>
                <div className="table-cell">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(plan.status) }}
                  >
                    {plan.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="table-cell progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${(plan.completedDays / plan.totalDays) * 100}%`,
                        backgroundColor: '#3b82f6'
                      }}
                    ></div>
                  </div>
                  <span className="progress-text">{plan.completedDays}/{plan.totalDays}</span>
                </div>
                <div className="table-cell compliance">
                  <span 
                    className="compliance-value"
                    style={{ color: getComplianceColor(plan.compliance) }}
                  >
                    {plan.compliance}%
                  </span>
                </div>
                <div className="table-cell effectiveness">
                  <span 
                    className="effectiveness-badge"
                    style={{ color: getEffectivenessColor(plan.effectiveness) }}
                  >
                    {plan.effectiveness}
                  </span>
                </div>
                <div className="table-cell actions">
                  <Button 
                    variant="outline" 
                    size="small"
                    onClick={() => {
                      setSelectedPlan(plan);
                      setShowDetailsModal(true);
                    }}
                  >
                    View
                  </Button>
                  {plan.status === 'pending_approval' && (
                    <div className="approval-actions">
                      <Button 
                        variant="primary" 
                        size="small"
                        onClick={() => handleApprove(plan.id)}
                      >
                        Approve
                      </Button>
                      <Button 
                        variant="danger" 
                        size="small"
                        onClick={() => handleReject(plan.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {showDetailsModal && <PlanDetailsModal />}
    </div>
  );
};

export default MealPlanManagement;
