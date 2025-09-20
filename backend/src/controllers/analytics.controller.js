const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const TreatmentPlan = require('../models/TreatmentPlan');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');

// Helper function to get date range based on period
const getDateRange = (period) => {
  const now = new Date();
  let startDate, endDate = now;

  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return { startDate, endDate };
};

// Helper function to get previous period for growth calculation
const getPreviousDateRange = (period) => {
  const now = new Date();
  let startDate, endDate;

  switch (period) {
    case 'week':
      endDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
      break;
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      endDate = new Date(now.getFullYear(), quarter * 3, 0);
      const prevQuarter = quarter - 1 < 0 ? 3 : quarter - 1;
      const prevYear = quarter - 1 < 0 ? now.getFullYear() - 1 : now.getFullYear();
      startDate = new Date(prevYear, prevQuarter * 3, 1);
      break;
    case 'year':
      endDate = new Date(now.getFullYear(), 0, 0);
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      break;
    default:
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  }

  return { startDate, endDate };
};

// Helper function to calculate growth percentage
const calculateGrowth = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number(((current - previous) / previous * 100).toFixed(1));
};

// Get overall analytics
const getAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const doctorId = req.user.id;
    
    // Get all analytics data
    const [patientStats, consultationStats, treatmentStats, revenueStats] = await Promise.all([
      getPatientAnalyticsData(doctorId, period),
      getConsultationAnalyticsData(doctorId, period),
      getTreatmentAnalyticsData(doctorId, period),
      getRevenueAnalyticsData(doctorId, period)
    ]);

    res.json({
      success: true,
      data: {
        patientStats,
        consultationStats,
        treatmentStats,
        revenueStats
      }
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics data',
      error: error.message
    });
  }
};

// Get patient analytics data
const getPatientAnalyticsData = async (doctorId, period) => {
  const { startDate, endDate } = getDateRange(period);
  const { startDate: prevStartDate, endDate: prevEndDate } = getPreviousDateRange(period);

  const [currentStats, previousStats] = await Promise.all([
    // Current period stats
    Patient.aggregate([
      {
        $facet: {
          totalPatients: [
            { $match: { doctorId: new mongoose.Types.ObjectId(doctorId) } },
            { $count: "count" }
          ],
          newPatients: [
            { 
              $match: { 
                doctorId: new mongoose.Types.ObjectId(doctorId),
                createdAt: { $gte: startDate, $lte: endDate }
              }
            },
            { $count: "count" }
          ],
          activePatients: [
            {
              $lookup: {
                from: 'appointments',
                localField: '_id',
                foreignField: 'patientId',
                as: 'appointments'
              }
            },
            {
              $match: {
                doctorId: new mongoose.Types.ObjectId(doctorId),
                'appointments.date': { $gte: startDate, $lte: endDate },
                'appointments.status': 'completed'
              }
            },
            { $count: "count" }
          ]
        }
      }
    ]),
    // Previous period stats
    Patient.aggregate([
      {
        $facet: {
          totalPatients: [
            { $match: { doctorId: new mongoose.Types.ObjectId(doctorId) } },
            { $count: "count" }
          ],
          newPatients: [
            { 
              $match: { 
                doctorId: new mongoose.Types.ObjectId(doctorId),
                createdAt: { $gte: prevStartDate, $lte: prevEndDate }
              }
            },
            { $count: "count" }
          ],
          activePatients: [
            {
              $lookup: {
                from: 'appointments',
                localField: '_id',
                foreignField: 'patientId',
                as: 'appointments'
              }
            },
            {
              $match: {
                doctorId: new mongoose.Types.ObjectId(doctorId),
                'appointments.date': { $gte: prevStartDate, $lte: prevEndDate },
                'appointments.status': 'completed'
              }
            },
            { $count: "count" }
          ]
        }
      }
    ])
  ]);

  const current = currentStats[0];
  const previous = previousStats[0];

  const totalPatients = current.totalPatients[0]?.count || 0;
  const newPatients = current.newPatients[0]?.count || 0;
  const activePatients = current.activePatients[0]?.count || 0;
  const recoveredPatients = Math.floor(activePatients * 0.3); // Mock calculation

  const prevTotalPatients = previous.totalPatients[0]?.count || 0;
  const prevNewPatients = previous.newPatients[0]?.count || 0;
  const prevActivePatients = previous.activePatients[0]?.count || 0;
  const prevRecoveredPatients = Math.floor(prevActivePatients * 0.3);

  return {
    totalPatients,
    newPatients,
    activePatients,
    recoveredPatients,
    growth: {
      totalPatients: calculateGrowth(totalPatients, prevTotalPatients),
      newPatients: calculateGrowth(newPatients, prevNewPatients),
      activePatients: calculateGrowth(activePatients, prevActivePatients),
      recoveredPatients: calculateGrowth(recoveredPatients, prevRecoveredPatients)
    }
  };
};

// Get consultation analytics data
const getConsultationAnalyticsData = async (doctorId, period) => {
  const { startDate, endDate } = getDateRange(period);
  const { startDate: prevStartDate, endDate: prevEndDate } = getPreviousDateRange(period);

  const [currentStats, previousStats] = await Promise.all([
    // Current period
    Appointment.aggregate([
      {
        $match: {
          doctorId: new mongoose.Types.ObjectId(doctorId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $facet: {
          totalConsultations: [{ $count: "count" }],
          completedConsultations: [
            { $match: { status: 'completed' } },
            { $count: "count" }
          ],
          scheduledConsultations: [
            { $match: { status: 'scheduled' } },
            { $count: "count" }
          ],
          averageDuration: [
            { $match: { status: 'completed', duration: { $exists: true } } },
            { $group: { _id: null, avgDuration: { $avg: "$duration" } } }
          ]
        }
      }
    ]),
    // Previous period
    Appointment.aggregate([
      {
        $match: {
          doctorId: new mongoose.Types.ObjectId(doctorId),
          date: { $gte: prevStartDate, $lte: prevEndDate }
        }
      },
      {
        $facet: {
          totalConsultations: [{ $count: "count" }],
          completedConsultations: [
            { $match: { status: 'completed' } },
            { $count: "count" }
          ],
          scheduledConsultations: [
            { $match: { status: 'scheduled' } },
            { $count: "count" }
          ],
          averageDuration: [
            { $match: { status: 'completed', duration: { $exists: true } } },
            { $group: { _id: null, avgDuration: { $avg: "$duration" } } }
          ]
        }
      }
    ])
  ]);

  const current = currentStats[0];
  const previous = previousStats[0];

  const totalConsultations = current.totalConsultations[0]?.count || 0;
  const completedConsultations = current.completedConsultations[0]?.count || 0;
  const scheduledConsultations = current.scheduledConsultations[0]?.count || 0;
  const averageDuration = Math.round(current.averageDuration[0]?.avgDuration || 42);

  const prevTotalConsultations = previous.totalConsultations[0]?.count || 0;
  const prevCompletedConsultations = previous.completedConsultations[0]?.count || 0;
  const prevScheduledConsultations = previous.scheduledConsultations[0]?.count || 0;
  const prevAverageDuration = Math.round(previous.averageDuration[0]?.avgDuration || 42);

  return {
    totalConsultations,
    completedConsultations,
    scheduledConsultations,
    averageDuration,
    growth: {
      totalConsultations: calculateGrowth(totalConsultations, prevTotalConsultations),
      completedConsultations: calculateGrowth(completedConsultations, prevCompletedConsultations),
      scheduledConsultations: calculateGrowth(scheduledConsultations, prevScheduledConsultations),
      averageDuration: calculateGrowth(averageDuration, prevAverageDuration)
    }
  };
};

// Get treatment analytics data
const getTreatmentAnalyticsData = async (doctorId, period) => {
  const { startDate, endDate } = getDateRange(period);
  const { startDate: prevStartDate, endDate: prevEndDate } = getPreviousDateRange(period);

  const [currentStats, previousStats] = await Promise.all([
    // Current period
    TreatmentPlan.aggregate([
      {
        $match: {
          doctorId: new mongoose.Types.ObjectId(doctorId),
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $facet: {
          activeTreatments: [
            { $match: { status: 'active' } },
            { $count: "count" }
          ],
          completedTreatments: [
            { $match: { status: 'completed' } },
            { $count: "count" }
          ],
          successfulTreatments: [
            { $match: { status: 'completed', outcome: 'successful' } },
            { $count: "count" }
          ],
          allCompletedTreatments: [
            { $match: { status: 'completed' } },
            { $count: "count" }
          ]
        }
      }
    ]),
    // Previous period
    TreatmentPlan.aggregate([
      {
        $match: {
          doctorId: new mongoose.Types.ObjectId(doctorId),
          createdAt: { $gte: prevStartDate, $lte: prevEndDate }
        }
      },
      {
        $facet: {
          activeTreatments: [
            { $match: { status: 'active' } },
            { $count: "count" }
          ],
          completedTreatments: [
            { $match: { status: 'completed' } },
            { $count: "count" }
          ],
          successfulTreatments: [
            { $match: { status: 'completed', outcome: 'successful' } },
            { $count: "count" }
          ],
          allCompletedTreatments: [
            { $match: { status: 'completed' } },
            { $count: "count" }
          ]
        }
      }
    ])
  ]);

  const current = currentStats[0];
  const previous = previousStats[0];

  const activeTreatments = current.activeTreatments[0]?.count || 0;
  const completedTreatments = current.completedTreatments[0]?.count || 0;
  const successfulTreatments = current.successfulTreatments[0]?.count || 0;
  const allCompleted = current.allCompletedTreatments[0]?.count || 0;
  const successRate = allCompleted > 0 ? Number(((successfulTreatments / allCompleted) * 100).toFixed(1)) : 85;

  const prevActiveTreatments = previous.activeTreatments[0]?.count || 0;
  const prevCompletedTreatments = previous.completedTreatments[0]?.count || 0;
  const prevSuccessfulTreatments = previous.successfulTreatments[0]?.count || 0;
  const prevAllCompleted = previous.allCompletedTreatments[0]?.count || 0;
  const prevSuccessRate = prevAllCompleted > 0 ? Number(((prevSuccessfulTreatments / prevAllCompleted) * 100).toFixed(1)) : 85;

  return {
    activeTreatments,
    completedTreatments,
    successRate,
    averageTreatmentDuration: 28, // Mock value
    growth: {
      activeTreatments: calculateGrowth(activeTreatments, prevActiveTreatments),
      completedTreatments: calculateGrowth(completedTreatments, prevCompletedTreatments),
      successRate: calculateGrowth(successRate, prevSuccessRate),
      averageTreatmentDuration: -5.4 // Mock value
    }
  };
};

// Get revenue analytics data
const getRevenueAnalyticsData = async (doctorId, period) => {
  // Mock revenue data since we don't have payment models yet
  return {
    totalRevenue: 245000,
    monthlyGrowth: 12.5,
    averagePerPatient: 1690,
    topTreatments: [
      { name: 'Panchakarma', revenue: 89000, patients: 23 },
      { name: 'Herbal Medicine', revenue: 67000, patients: 45 },
      { name: 'Ayurvedic Consultation', revenue: 89000, patients: 77 }
    ]
  };
};

// Individual endpoint functions
const getPatientAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const doctorId = req.user.id;
    
    const data = await getPatientAnalyticsData(doctorId, period);
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error getting patient analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get patient analytics',
      error: error.message
    });
  }
};

const getConsultationAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const doctorId = req.user.id;
    
    const data = await getConsultationAnalyticsData(doctorId, period);
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error getting consultation analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get consultation analytics',
      error: error.message
    });
  }
};

const getTreatmentAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const doctorId = req.user.id;
    
    const data = await getTreatmentAnalyticsData(doctorId, period);
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error getting treatment analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get treatment analytics',
      error: error.message
    });
  }
};

const getRevenueAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const doctorId = req.user.id;
    
    const data = await getRevenueAnalyticsData(doctorId, period);
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error getting revenue analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue analytics',
      error: error.message
    });
  }
};

// Export analytics report as PDF
const exportAnalyticsReport = async (req, res) => {
  try {
    const { period = 'month', format = 'pdf' } = req.query;
    const doctorId = req.user.id;

    // Get all analytics data
    const [patientStats, consultationStats, treatmentStats, revenueStats] = await Promise.all([
      getPatientAnalyticsData(doctorId, period),
      getConsultationAnalyticsData(doctorId, period),
      getTreatmentAnalyticsData(doctorId, period),
      getRevenueAnalyticsData(doctorId, period)
    ]);

    if (format === 'pdf') {
      // Create PDF
      const doc = new PDFDocument();
      const filename = `analytics-report-${period}-${new Date().toISOString().split('T')[0]}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      doc.pipe(res);

      // Add content to PDF
      doc.fontSize(20).text('Analytics Report', { align: 'center' });
      doc.fontSize(14).text(`Period: ${period.charAt(0).toUpperCase() + period.slice(1)}`, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown(2);

      // Patient Statistics
      doc.fontSize(16).text('Patient Statistics', { underline: true });
      doc.fontSize(12);
      doc.text(`Total Patients: ${patientStats.totalPatients}`);
      doc.text(`New Patients: ${patientStats.newPatients} (${patientStats.growth.newPatients > 0 ? '+' : ''}${patientStats.growth.newPatients}%)`);
      doc.text(`Active Patients: ${patientStats.activePatients} (${patientStats.growth.activePatients > 0 ? '+' : ''}${patientStats.growth.activePatients}%)`);
      doc.text(`Recovered Patients: ${patientStats.recoveredPatients} (${patientStats.growth.recoveredPatients > 0 ? '+' : ''}${patientStats.growth.recoveredPatients}%)`);
      doc.moveDown();

      // Consultation Statistics
      doc.fontSize(16).text('Consultation Statistics', { underline: true });
      doc.fontSize(12);
      doc.text(`Total Consultations: ${consultationStats.totalConsultations} (${consultationStats.growth.totalConsultations > 0 ? '+' : ''}${consultationStats.growth.totalConsultations}%)`);
      doc.text(`Completed: ${consultationStats.completedConsultations} (${consultationStats.growth.completedConsultations > 0 ? '+' : ''}${consultationStats.growth.completedConsultations}%)`);
      doc.text(`Scheduled: ${consultationStats.scheduledConsultations} (${consultationStats.growth.scheduledConsultations > 0 ? '+' : ''}${consultationStats.growth.scheduledConsultations}%)`);
      doc.text(`Average Duration: ${consultationStats.averageDuration} minutes (${consultationStats.growth.averageDuration > 0 ? '+' : ''}${consultationStats.growth.averageDuration}%)`);
      doc.moveDown();

      // Treatment Statistics
      doc.fontSize(16).text('Treatment Statistics', { underline: true });
      doc.fontSize(12);
      doc.text(`Active Treatments: ${treatmentStats.activeTreatments} (${treatmentStats.growth.activeTreatments > 0 ? '+' : ''}${treatmentStats.growth.activeTreatments}%)`);
      doc.text(`Completed Treatments: ${treatmentStats.completedTreatments} (${treatmentStats.growth.completedTreatments > 0 ? '+' : ''}${treatmentStats.growth.completedTreatments}%)`);
      doc.text(`Success Rate: ${treatmentStats.successRate}% (${treatmentStats.growth.successRate > 0 ? '+' : ''}${treatmentStats.growth.successRate}%)`);
      doc.text(`Average Duration: ${treatmentStats.averageTreatmentDuration} days (${treatmentStats.growth.averageTreatmentDuration > 0 ? '+' : ''}${treatmentStats.growth.averageTreatmentDuration}%)`);
      doc.moveDown();

      // Revenue Statistics
      doc.fontSize(16).text('Revenue Statistics', { underline: true });
      doc.fontSize(12);
      doc.text(`Total Revenue: ₹${revenueStats.totalRevenue.toLocaleString()} (+${revenueStats.monthlyGrowth}%)`);
      doc.text(`Average per Patient: ₹${revenueStats.averagePerPatient.toLocaleString()}`);
      doc.moveDown();

      doc.fontSize(14).text('Top Treatments by Revenue:', { underline: true });
      doc.fontSize(12);
      revenueStats.topTreatments.forEach((treatment, index) => {
        doc.text(`${index + 1}. ${treatment.name}: ₹${treatment.revenue.toLocaleString()} (${treatment.patients} patients)`);
      });

      doc.end();
    } else {
      // Return JSON data for other formats
      res.json({
        success: true,
        data: {
          period,
          generatedAt: new Date().toISOString(),
          patientStats,
          consultationStats,
          treatmentStats,
          revenueStats
        }
      });
    }
  } catch (error) {
    console.error('Error exporting analytics report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export analytics report',
      error: error.message
    });
  }
};

module.exports = {
  getAnalytics,
  getPatientAnalytics,
  getConsultationAnalytics,
  getTreatmentAnalytics,
  getRevenueAnalytics,
  exportAnalyticsReport
};