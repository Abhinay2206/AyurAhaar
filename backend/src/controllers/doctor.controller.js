const Doctor = require('../models/Doctor');

// Get all doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).select('-password');
    
    res.status(200).json({
      success: true,
      message: 'Doctors retrieved successfully',
      doctors: doctors,
      count: doctors.length
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors',
      error: error.message
    });
  }
};

// Get doctors by location
const getDoctorsByLocation = async (req, res) => {
  try {
    const { location } = req.query;
    
    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Location parameter is required'
      });
    }

    // Search for doctors with location containing the search term (case-insensitive)
    const doctors = await Doctor.find({
      location: { $regex: location, $options: 'i' }
    }).select('-password');
    
    res.status(200).json({
      success: true,
      message: `Doctors found for location: ${location}`,
      doctors: doctors,
      count: doctors.length
    });
  } catch (error) {
    console.error('Error fetching doctors by location:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors by location',
      error: error.message
    });
  }
};

// Get doctor by ID
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doctor = await Doctor.findById(id).select('-password');
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Doctor retrieved successfully',
      doctor: doctor
    });
  } catch (error) {
    console.error('Error fetching doctor by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor',
      error: error.message
    });
  }
};

// Create a new doctor (for admin use)
const createDoctor = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      specialization, 
      licenseNumber, 
      experience, 
      location,
      consultationFee
    } = req.body;

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'Doctor with this email already exists'
      });
    }

    // Create new doctor
    const doctor = new Doctor({
      name,
      email,
      phone,
      specialization,
      licenseNumber,
      experience,
      location,
      consultationFee,
      role: 'doctor'
    });

    await doctor.save();

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization,
        licenseNumber: doctor.licenseNumber,
        experience: doctor.experience,
        location: doctor.location,
        consultationFee: doctor.consultationFee
      }
    });
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating doctor',
      error: error.message
    });
  }
};

// Update doctor
const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove password from updates if present
    delete updates.password;
    delete updates.role;

    const doctor = await Doctor.findByIdAndUpdate(
      id, 
      updates, 
      { new: true, runValidators: true }
    ).select('-password');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully',
      doctor: doctor
    });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating doctor',
      error: error.message
    });
  }
};

// Delete doctor
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByIdAndDelete(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting doctor',
      error: error.message
    });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorsByLocation,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
};