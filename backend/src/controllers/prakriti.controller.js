const { PrakritiQuestion, PrakritiResponse, PrakritiAssessment } = require('../models/PrakritiAssessment');
const Patient = require('../models/Patient');

// Get all Prakriti assessment questions
async function getPrakritiQuestions(req, res) {
  try {
    let questions = await PrakritiQuestion.find({ isActive: true }).sort({ questionNumber: 1 });
    
    // If no questions exist in database, create default ones
    if (questions.length === 0) {
      const defaultQuestions = PrakritiQuestion.getDefaultQuestions();
      questions = await PrakritiQuestion.insertMany(defaultQuestions);
    }
    
    res.json({
      success: true,
      message: 'Prakriti assessment questions retrieved successfully',
      questions: questions.map(q => ({
        id: q._id,
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        category: q.category,
        options: q.options.map((option, index) => ({
          index,
          text: option.optionText
        }))
      }))
    });
  } catch (error) {
    console.error('Error getting Prakriti questions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving questions'
    });
  }
}

// Start a new Prakriti assessment
async function startPrakritiAssessment(req, res) {
  try {
    const { userId } = req.user;
    
    // Check if patient exists
    const patient = await Patient.findById(userId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    // Check if there's an incomplete assessment
    let existingAssessment = await PrakritiAssessment.findOne({
      patientId: userId,
      isCompleted: false
    });
    
    if (existingAssessment) {
      return res.json({
        success: true,
        message: 'Existing incomplete assessment found',
        assessmentId: existingAssessment._id,
        completedQuestions: existingAssessment.responses.length
      });
    }
    
    // Create new assessment
    const newAssessment = new PrakritiAssessment({
      patientId: userId,
      totalScores: { vata: 0, pitta: 0, kapha: 0 },
      prakritiType: {
        primary: 'Vata', // Will be calculated later
        percentages: { vata: 0, pitta: 0, kapha: 0 }
      }
    });
    
    await newAssessment.save();
    
    res.json({
      success: true,
      message: 'New Prakriti assessment started',
      assessmentId: newAssessment._id,
      completedQuestions: 0
    });
  } catch (error) {
    console.error('Error starting Prakriti assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while starting assessment'
    });
  }
}

// Submit answer to a specific question
async function submitPrakritiAnswer(req, res) {
  try {
    const { userId } = req.user;
    const { assessmentId, questionNumber, selectedOption } = req.body;
    
    // Validate input
    if (!assessmentId || !questionNumber || selectedOption === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: assessmentId, questionNumber, selectedOption'
      });
    }
    
    // Get the assessment
    const assessment = await PrakritiAssessment.findOne({
      _id: assessmentId,
      patientId: userId,
      isCompleted: false
    });
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found or already completed'
      });
    }
    
    // Get the question
    const question = await PrakritiQuestion.findOne({
      questionNumber,
      isActive: true
    });
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    // Validate selected option
    if (selectedOption < 0 || selectedOption >= question.options.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid option selected'
      });
    }
    
    const selectedOptionData = question.options[selectedOption];
    
    // Check if response already exists for this question
    let existingResponse = await PrakritiResponse.findOne({
      patientId: userId,
      assessmentId,
      questionNumber
    });
    
    if (existingResponse) {
      // Update existing response
      existingResponse.selectedOption = selectedOption;
      existingResponse.vataScore = selectedOptionData.vataScore;
      existingResponse.pittaScore = selectedOptionData.pittaScore;
      existingResponse.kaphaScore = selectedOptionData.kaphaScore;
      await existingResponse.save();
    } else {
      // Create new response
      const newResponse = new PrakritiResponse({
        patientId: userId,
        assessmentId,
        questionNumber,
        selectedOption,
        vataScore: selectedOptionData.vataScore,
        pittaScore: selectedOptionData.pittaScore,
        kaphaScore: selectedOptionData.kaphaScore
      });
      
      await newResponse.save();
      assessment.responses.push(newResponse._id);
    }
    
    // Calculate total scores
    const allResponses = await PrakritiResponse.find({
      patientId: userId,
      assessmentId
    });
    
    const totalScores = allResponses.reduce((acc, response) => ({
      vata: acc.vata + response.vataScore,
      pitta: acc.pitta + response.pittaScore,
      kapha: acc.kapha + response.kaphaScore
    }), { vata: 0, pitta: 0, kapha: 0 });
    
    assessment.totalScores = totalScores;
    
    // Check if assessment is complete (all 10 questions answered)
    if (allResponses.length === 10) {
      assessment.isCompleted = true;
      assessment.completedAt = new Date();
      
      // Calculate prakriti type
      assessment.calculatePrakritiType();
      
      // Update patient record
      await Patient.findByIdAndUpdate(userId, {
        prakritiCompleted: true,
        currentPrakriti: {
          assessmentId: assessment._id,
          primaryDosha: assessment.prakritiType.primary,
          secondaryDosha: assessment.prakritiType.secondary,
          isDual: assessment.prakritiType.isDual,
          completedAt: assessment.completedAt,
          isValid: true
        },
        $push: { prakritiAssessments: assessment._id }
      });
    }
    
    await assessment.save();
    
    res.json({
      success: true,
      message: 'Answer submitted successfully',
      completedQuestions: allResponses.length,
      totalQuestions: 10,
      isAssessmentComplete: assessment.isCompleted,
      currentScores: totalScores,
      ...(assessment.isCompleted && {
        prakritiResult: {
          primary: assessment.prakritiType.primary,
          secondary: assessment.prakritiType.secondary,
          isDual: assessment.prakritiType.isDual,
          percentages: assessment.prakritiType.percentages
        }
      })
    });
  } catch (error) {
    console.error('Error submitting Prakriti answer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting answer'
    });
  }
}

// Get assessment progress
async function getAssessmentProgress(req, res) {
  try {
    const { userId } = req.user;
    const { assessmentId } = req.params;
    
    const assessment = await PrakritiAssessment.findOne({
      _id: assessmentId,
      patientId: userId
    }).populate('responses');
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }
    
    const responseMap = {};
    assessment.responses.forEach(response => {
      responseMap[response.questionNumber] = response.selectedOption;
    });
    
    res.json({
      success: true,
      assessment: {
        id: assessment._id,
        completedQuestions: assessment.responses.length,
        totalQuestions: 10,
        isCompleted: assessment.isCompleted,
        responses: responseMap,
        currentScores: assessment.totalScores,
        ...(assessment.isCompleted && {
          prakritiResult: {
            primary: assessment.prakritiType.primary,
            secondary: assessment.prakritiType.secondary,
            isDual: assessment.prakritiType.isDual,
            percentages: assessment.prakritiType.percentages,
            completedAt: assessment.completedAt
          }
        })
      }
    });
  } catch (error) {
    console.error('Error getting assessment progress:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving assessment progress'
    });
  }
}

// Get patient's Prakriti history
async function getPrakritiHistory(req, res) {
  try {
    const { userId } = req.user;
    
    const patient = await Patient.findById(userId)
      .populate({
        path: 'prakritiAssessments',
        options: { sort: { createdAt: -1 } }
      })
      .populate('currentPrakriti.assessmentId');
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    res.json({
      success: true,
      prakritiCompleted: patient.prakritiCompleted,
      currentPrakriti: patient.currentPrakriti,
      assessmentHistory: patient.prakritiAssessments.map(assessment => ({
        id: assessment._id,
        completedAt: assessment.completedAt,
        isCompleted: assessment.isCompleted,
        prakritiType: assessment.prakritiType,
        totalScores: assessment.totalScores
      }))
    });
  } catch (error) {
    console.error('Error getting Prakriti history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving Prakriti history'
    });
  }
}

// Get current Prakriti status
async function getCurrentPrakriti(req, res) {
  try {
    const { userId } = req.user;
    
    const patient = await Patient.findById(userId);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    res.json({
      success: true,
      prakritiCompleted: patient.prakritiCompleted,
      currentPrakriti: patient.currentPrakriti || null
    });
  } catch (error) {
    console.error('Error getting current Prakriti:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving current Prakriti'
    });
  }
}

module.exports = {
  getPrakritiQuestions,
  startPrakritiAssessment,
  submitPrakritiAnswer,
  getAssessmentProgress,
  getPrakritiHistory,
  getCurrentPrakriti,
  getPatientPrakritiData
};

// Get patient Prakriti data by patient ID (admin/doctor route)
async function getPatientPrakritiData(req, res) {
  try {
    const { patientId } = req.params;
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Get the latest assessment
    const latestAssessment = await PrakritiAssessment.findOne({ 
      patient: patientId,
      isCompleted: true 
    })
    .sort({ completedAt: -1 })
    .populate('responses.question');

    res.json({
      success: true,
      data: {
        prakritiCompleted: patient.prakritiCompleted || false,
        currentPrakriti: patient.currentPrakriti || null,
        assessmentData: latestAssessment ? {
          id: latestAssessment._id,
          completedAt: latestAssessment.completedAt,
          scores: latestAssessment.scores,
          dominantDosha: latestAssessment.dominantDosha,
          prakritiType: latestAssessment.prakritiType,
          characteristics: latestAssessment.characteristics,
          responses: latestAssessment.responses.map(response => ({
            questionText: response.question.questionText,
            category: response.question.category,
            selectedAnswer: response.selectedAnswer,
            answerText: response.question.options[response.selectedAnswer]?.optionText
          }))
        } : null
      }
    });
  } catch (error) {
    console.error('Error getting patient Prakriti data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving Prakriti data'
    });
  }
}