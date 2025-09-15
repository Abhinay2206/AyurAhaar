const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');

// Mock prescription data - In production, this would come from a database
let prescriptions = [
  {
    id: 1,
    patientId: 1,
    patientName: 'Priya Sharma',
    prescriptionId: 'RX-2025-001',
    date: '2025-09-15',
    medicines: [
      { name: 'Ashwagandha Churna', dosage: '1 tsp twice daily', duration: '30 days' },
      { name: 'Triphala Tablets', dosage: '2 tablets before bed', duration: '30 days' }
    ],
    instructions: 'Take with warm water. Avoid spicy foods.',
    status: 'active',
    doctor: 'Dr. Sharma',
    doctorId: 1,
    createdAt: new Date('2025-09-15'),
    updatedAt: new Date('2025-09-15')
  },
  {
    id: 2,
    patientId: 2,
    patientName: 'Raj Kumar',
    prescriptionId: 'RX-2025-002',
    date: '2025-09-14',
    medicines: [
      { name: 'Brahmi Ghrita', dosage: '1/2 tsp with milk', duration: '21 days' },
      { name: 'Saraswatarishta', dosage: '15ml twice daily', duration: '21 days' }
    ],
    instructions: 'Take after meals. Practice meditation.',
    status: 'completed',
    doctor: 'Dr. Sharma',
    doctorId: 1,
    createdAt: new Date('2025-09-14'),
    updatedAt: new Date('2025-09-14')
  },
  {
    id: 3,
    patientId: 3,
    patientName: 'Sunita Devi',
    prescriptionId: 'RX-2025-003',
    date: '2025-09-13',
    medicines: [
      { name: 'Trikatu Churna', dosage: '1/4 tsp with honey', duration: '15 days' },
      { name: 'Ginger Tea', dosage: 'One cup morning', duration: '15 days' }
    ],
    instructions: 'Take before breakfast. Avoid cold drinks.',
    status: 'active',
    doctor: 'Dr. Sharma',
    doctorId: 1,
    createdAt: new Date('2025-09-13'),
    updatedAt: new Date('2025-09-13')
  }
];

// Get all prescriptions for the authenticated doctor
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Filter prescriptions by doctor ID
    const doctorPrescriptions = prescriptions.filter(p => p.doctorId === req.user.id);
    
    res.json({
      success: true,
      data: doctorPrescriptions,
      message: 'Prescriptions retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescriptions',
      error: error.message
    });
  }
});

// Get prescription by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const prescriptionId = parseInt(req.params.id);
    const prescription = prescriptions.find(p => p.id === prescriptionId && p.doctorId === req.user.id);
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    res.json({
      success: true,
      data: prescription,
      message: 'Prescription retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescription',
      error: error.message
    });
  }
});

// Create new prescription
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { patientId, patientName, medicines, instructions } = req.body;
    
    // Validate required fields
    if (!patientId || !patientName || !medicines || !instructions) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    const newPrescription = {
      id: prescriptions.length + 1,
      patientId,
      patientName,
      prescriptionId: `RX-2025-${(prescriptions.length + 1).toString().padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      medicines,
      instructions,
      status: 'active',
      doctor: req.user.name || 'Dr. Sharma',
      doctorId: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    prescriptions.push(newPrescription);
    
    res.status(201).json({
      success: true,
      data: newPrescription,
      message: 'Prescription created successfully'
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create prescription',
      error: error.message
    });
  }
});

// Update prescription
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const prescriptionId = parseInt(req.params.id);
    const prescriptionIndex = prescriptions.findIndex(p => p.id === prescriptionId && p.doctorId === req.user.id);
    
    if (prescriptionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    const updatedPrescription = {
      ...prescriptions[prescriptionIndex],
      ...req.body,
      updatedAt: new Date()
    };
    
    prescriptions[prescriptionIndex] = updatedPrescription;
    
    res.json({
      success: true,
      data: updatedPrescription,
      message: 'Prescription updated successfully'
    });
  } catch (error) {
    console.error('Error updating prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update prescription',
      error: error.message
    });
  }
});

// Delete prescription
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const prescriptionId = parseInt(req.params.id);
    const prescriptionIndex = prescriptions.findIndex(p => p.id === prescriptionId && p.doctorId === req.user.id);
    
    if (prescriptionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    prescriptions.splice(prescriptionIndex, 1);
    
    res.json({
      success: true,
      message: 'Prescription deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete prescription',
      error: error.message
    });
  }
});

// Renew prescription
router.post('/:id/renew', authenticateToken, async (req, res) => {
  try {
    const prescriptionId = parseInt(req.params.id);
    const originalPrescription = prescriptions.find(p => p.id === prescriptionId && p.doctorId === req.user.id);
    
    if (!originalPrescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    const renewedPrescription = {
      ...originalPrescription,
      id: prescriptions.length + 1,
      prescriptionId: `RX-2025-${(prescriptions.length + 1).toString().padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    prescriptions.push(renewedPrescription);
    
    res.status(201).json({
      success: true,
      data: renewedPrescription,
      message: 'Prescription renewed successfully'
    });
  } catch (error) {
    console.error('Error renewing prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to renew prescription',
      error: error.message
    });
  }
});

// Print prescription (returns PDF data)
router.get('/:id/print', authenticateToken, async (req, res) => {
  try {
    const prescriptionId = parseInt(req.params.id);
    const prescription = prescriptions.find(p => p.id === prescriptionId && p.doctorId === req.user.id);
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    // In a real application, you would generate a PDF here
    // For now, we'll return a success message
    res.json({
      success: true,
      message: 'Prescription print data generated successfully',
      data: {
        prescriptionId: prescription.prescriptionId,
        printUrl: `/api/prescriptions/${prescriptionId}/download`
      }
    });
  } catch (error) {
    console.error('Error printing prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to print prescription',
      error: error.message
    });
  }
});

// Get prescriptions by patient
router.get('/patient/:patientId', authenticateToken, async (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId);
    const patientPrescriptions = prescriptions.filter(p => p.patientId === patientId && p.doctorId === req.user.id);
    
    res.json({
      success: true,
      data: patientPrescriptions,
      message: 'Patient prescriptions retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient prescriptions',
      error: error.message
    });
  }
});

// Search prescriptions
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const searchResults = prescriptions.filter(p => 
      p.doctorId === req.user.id && (
        p.patientName.toLowerCase().includes(q.toLowerCase()) ||
        p.prescriptionId.toLowerCase().includes(q.toLowerCase()) ||
        p.medicines.some(m => m.name.toLowerCase().includes(q.toLowerCase()))
      )
    );
    
    res.json({
      success: true,
      data: searchResults,
      message: 'Search completed successfully'
    });
  } catch (error) {
    console.error('Error searching prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search prescriptions',
      error: error.message
    });
  }
});

// Get prescription statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const doctorPrescriptions = prescriptions.filter(p => p.doctorId === req.user.id);
    
    const stats = {
      total: doctorPrescriptions.length,
      active: doctorPrescriptions.filter(p => p.status === 'active').length,
      completed: doctorPrescriptions.filter(p => p.status === 'completed').length,
      expired: doctorPrescriptions.filter(p => p.status === 'expired').length,
      thisMonth: doctorPrescriptions.filter(p => {
        const prescriptionDate = new Date(p.date);
        const now = new Date();
        return prescriptionDate.getMonth() === now.getMonth() && 
               prescriptionDate.getFullYear() === now.getFullYear();
      }).length
    };
    
    res.json({
      success: true,
      data: stats,
      message: 'Prescription statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching prescription stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescription statistics',
      error: error.message
    });
  }
});

module.exports = router;