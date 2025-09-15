const Patient = require('../models/Patient');

async function submitSurvey(req, res) {
  try {
    const { userId } = req.user; // Assuming user info is attached by auth middleware
    const surveyData = req.body;

    // Validate required survey fields
    const requiredFields = ['age', 'weight', 'height', 'lifestyle'];
    const missingFields = requiredFields.filter(field => !surveyData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Update patient with survey data
    const updateData = {
      age: surveyData.age,
      weight: surveyData.weight,
      height: surveyData.height,
      lifestyle: surveyData.lifestyle,
      allergies: surveyData.allergies || [],
      healthConditions: surveyData.healthConditions || [],
      preferredCuisine: surveyData.preferredCuisine || [],
      surveyCompleted: true
    };

    const patient = await Patient.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({ 
      message: 'Survey submitted successfully',
      surveyCompleted: true,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        surveyCompleted: patient.surveyCompleted
      }
    });
  } catch (err) {
    console.error('Survey submission error:', err);
    res.status(500).json({ message: 'Server error during survey submission' });
  }
}

async function getSurveyStatus(req, res) {
  try {
    const { userId } = req.user;
    
    const patient = await Patient.findById(userId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({ 
      surveyCompleted: patient.surveyCompleted || false,
      surveyData: {
        age: patient.age,
        weight: patient.weight,
        height: patient.height,
        lifestyle: patient.lifestyle,
        allergies: patient.allergies,
        healthConditions: patient.healthConditions
      }
    });
  } catch (err) {
    console.error('Get survey status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { submitSurvey, getSurveyStatus, getPatientSurveyData };

// Get patient survey data by patient ID (admin/doctor route)
async function getPatientSurveyData(req, res) {
  try {
    const { patientId } = req.params;
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ 
        success: false,
        message: 'Patient not found' 
      });
    }

    res.json({ 
      success: true,
      data: {
        surveyCompleted: patient.surveyCompleted || false,
        surveyData: {
          age: patient.age,
          weight: patient.weight,
          height: patient.height,
          lifestyle: patient.lifestyle,
          allergies: patient.allergies || [],
          healthConditions: patient.healthConditions || [],
          preferredCuisine: patient.preferredCuisine || [],
          // Calculate BMI
          bmi: patient.weight && patient.height ? 
            (patient.weight / Math.pow(patient.height / 100, 2)).toFixed(1) : null
        }
      }
    });
  } catch (err) {
    console.error('Get patient survey data error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
}
