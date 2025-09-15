const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const MealPlan = require('../models/MealPlan');
const dashboardService = require('../services/dashboardService');

// Get dashboard statistics for a doctor
const getDashboardStats = async (req, res) => {
  try {
    const doctorId = req.user?.userId || req.params.doctorId;
    
    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID is required'
      });
    }

    // Use dashboard service for better organization
    const stats = await dashboardService.getDoctorStats(doctorId);

    // Format response to match frontend expectations
    const formattedStats = {
      totalPatients: stats.patients.total,
      todayAppointments: stats.appointments.today,
      pendingAppointments: stats.appointments.pending,
      activeMealPlans: stats.mealPlans.active
    };

    res.json({
      success: true,
      data: formattedStats
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

// Get recent activities for dashboard
const getRecentActivities = async (req, res) => {
  try {
    const doctorId = req.user?.userId || req.params.doctorId;
    
    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID is required'
      });
    }

    const limit = parseInt(req.query.limit) || 5;

    // Use dashboard service
    const activities = await dashboardService.getRecentActivities(doctorId, limit);

    res.json({
      success: true,
      data: activities
    });

  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activities',
      error: error.message
    });
  }
};

// Search patients and appointments for dashboard
const searchDashboard = async (req, res) => {
  try {
    const doctorId = req.user?.userId || req.params.doctorId;
    const { query } = req.query;
    
    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID is required'
      });
    }

    const limit = parseInt(req.query.limit) || 10;

    // Use dashboard service
    const results = await dashboardService.searchDashboard(doctorId, query, limit);

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Error searching dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search dashboard',
      error: error.message
    });
  }
};

// Get notifications for doctor (placeholder for future implementation)
const getNotifications = async (req, res) => {
  try {
    const doctorId = req.user?.userId || req.params.doctorId;
    
    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID is required'
      });
    }

    // For now, return mock notifications
    // In future, implement actual notification system
    const mockNotifications = [
      {
        id: 1,
        message: 'New appointment request from John Doe',
        time: '2 hours ago',
        urgent: false
      },
      {
        id: 2,
        message: 'Meal plan approval needed for Jane Smith',
        time: '4 hours ago',
        urgent: true
      },
      {
        id: 3,
        message: 'Patient follow-up due: Mike Johnson',
        time: '1 day ago',
        urgent: false
      }
    ];

    res.json({
      success: true,
      data: mockNotifications
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivities,
  searchDashboard,
  getNotifications
};