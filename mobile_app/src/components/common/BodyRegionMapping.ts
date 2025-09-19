import { BodyPart, BodyPartInput } from './HumanBodySvg';

export interface ExtendedBodyRegion {
  id: string;
  name: string;
  doshas: string[];
  description: string;
  symptoms: string[];
  problemKeywords: string[];
  bodyParts: BodyPart[]; // Maps to HumanBodySvg component parts
}

// Enhanced body regions with mappings to body component parts
export const extendedBodyRegions: ExtendedBodyRegion[] = [
  {
    id: 'head',
    name: 'Head & Brain',
    doshas: ['vata'],
    description: 'Nervous system, mental activity, and sensory functions',
    symptoms: ['Headaches', 'Mental fog', 'Anxiety', 'Insomnia', 'Memory issues'],
    problemKeywords: ['headache', 'anxiety', 'insomnia', 'stress', 'worry', 'mental', 'memory', 'concentration'],
    bodyParts: ['head', 'eyes', 'ears', 'nose', 'oral_cavity', 'neck_or_throat'],
  },
  {
    id: 'throat',
    name: 'Throat & Neck',
    doshas: ['kapha'],
    description: 'Communication, breathing, and lymphatic system',
    symptoms: ['Sore throat', 'Voice issues', 'Swollen glands', 'Neck tension'],
    problemKeywords: ['throat', 'voice', 'neck', 'swallow', 'glands'],
    bodyParts: ['neck_or_throat'],
  },
  {
    id: 'chest',
    name: 'Chest & Heart',
    doshas: ['kapha', 'vata'],
    description: 'Respiratory system, circulation, and emotional center',
    symptoms: ['Chest congestion', 'Breathing issues', 'Heart palpitations', 'Cough'],
    problemKeywords: ['chest', 'heart', 'breathing', 'cough', 'lung', 'asthma', 'palpitation'],
    bodyParts: ['chest'],
  },
  {
    id: 'stomach',
    name: 'Stomach & Liver',
    doshas: ['pitta'],
    description: 'Digestion, metabolism, and transformation',
    symptoms: ['Acidity', 'Heartburn', 'Nausea', 'Digestive issues', 'Liver problems'],
    problemKeywords: ['stomach', 'digestion', 'acid', 'heartburn', 'nausea', 'liver', 'bile'],
    bodyParts: ['upper_abdomen'],
  },
  {
    id: 'intestines',
    name: 'Intestines',
    doshas: ['vata', 'pitta'],
    description: 'Absorption, elimination, and gut health',
    symptoms: ['Constipation', 'Diarrhea', 'Bloating', 'Gas', 'IBS'],
    problemKeywords: ['constipation', 'diarrhea', 'bloating', 'gas', 'bowel', 'intestine', 'gut'],
    bodyParts: ['mid_abdomen'],
  },
  {
    id: 'pelvis',
    name: 'Pelvis & Reproductive',
    doshas: ['vata', 'kapha'],
    description: 'Reproductive health and elimination',
    symptoms: ['Menstrual issues', 'Reproductive problems', 'Urinary issues'],
    problemKeywords: ['menstrual', 'period', 'reproductive', 'urinary', 'bladder', 'sexual'],
    bodyParts: ['lower_abdomen', 'sexual_organs'],
  },
  {
    id: 'joints',
    name: 'Joints & Bones',
    doshas: ['vata'],
    description: 'Movement, flexibility, and skeletal system',
    symptoms: ['Joint pain', 'Stiffness', 'Arthritis', 'Bone issues'],
    problemKeywords: ['joint', 'bone', 'arthritis', 'stiff', 'pain', 'ache', 'muscle'],
    bodyParts: ['upper_arm', 'forearm', 'hand', 'thigh', 'knee', 'lower_leg', 'foot'],
  },
  {
    id: 'skin',
    name: 'Skin',
    doshas: ['pitta'],
    description: 'Protection, temperature regulation, and appearance',
    symptoms: ['Rashes', 'Acne', 'Dryness', 'Inflammation', 'Allergies'],
    problemKeywords: ['skin', 'rash', 'acne', 'eczema', 'dry skin', 'allergy', 'itching'],
    bodyParts: ['head', 'chest', 'upper_abdomen', 'mid_abdomen', 'lower_abdomen', 'upper_arm', 'forearm', 'hand', 'thigh', 'knee', 'lower_leg', 'foot'],
  },
  {
    id: 'shoulders',
    name: 'Shoulders & Upper Body',
    doshas: ['vata'],
    description: 'Upper body strength and posture',
    symptoms: ['Shoulder pain', 'Tension', 'Stiffness', 'Poor posture'],
    problemKeywords: ['shoulder', 'upper back', 'posture', 'tension'],
    bodyParts: ['upper_arm'],
  },
  {
    id: 'hands',
    name: 'Hands & Grip',
    doshas: ['vata'],
    description: 'Manual dexterity and fine motor control',
    symptoms: ['Hand pain', 'Weakness', 'Numbness', 'Tremors'],
    problemKeywords: ['hand', 'finger', 'grip', 'wrist', 'carpal'],
    bodyParts: ['hand'],
  },
  {
    id: 'feet',
    name: 'Feet & Foundation',
    doshas: ['kapha'],
    description: 'Balance, stability, and grounding',
    symptoms: ['Foot pain', 'Balance issues', 'Swelling', 'Circulation problems'],
    problemKeywords: ['foot', 'feet', 'ankle', 'balance', 'walking'],
    bodyParts: ['foot'],
  },
];

// Utility functions for mapping between regions and body parts
export const mapRegionsToBodyParts = (
  regions: ExtendedBodyRegion[],
  problemAreas: string[],
  currentPrakriti: any,
  selectedRegion: string | null
): BodyPartInput => {
  const bodyParts: BodyPartInput = {};

  // Get dosha colors
  const getDoshaColor = (dosha: string) => {
    switch (dosha.toLowerCase()) {
      case 'vata':
        return '#8E4EC6'; // Purple
      case 'pitta':
        return '#FF6B35'; // Orange
      case 'kapha':
        return '#4A90E2'; // Blue
      default:
        return '#E0E0E0';
    }
  };

  // Check if region has problems
  const hasProblems = (regionId: string): boolean => {
    return problemAreas.includes(regionId);
  };

  // Get region color based on problems and dosha dominance
  const getRegionColor = (region: ExtendedBodyRegion): string => {
    if (hasProblems(region.id)) {
      return '#FF4444'; // Red for problem areas
    }

    if (!currentPrakriti) return '#E0E0E0';

    const { primaryDosha, secondaryDosha } = currentPrakriti;
    const userDoshas = [primaryDosha?.toLowerCase(), secondaryDosha?.toLowerCase()].filter(Boolean);
    
    // Check if this region is affected by user's dominant doshas
    const regionDoshas = region.doshas.map(d => d.toLowerCase());
    const hasMatch = regionDoshas.some(dosha => userDoshas.includes(dosha));
    
    if (hasMatch) {
      // If dual prakriti and region has both doshas, blend color (simple average via overlay approach)
      if (primaryDosha && secondaryDosha && regionDoshas.includes(primaryDosha.toLowerCase()) && regionDoshas.includes(secondaryDosha.toLowerCase())) {
        // Return a neutral blended accent
        return '#B86FD0'; // Purple-Orange/Kapha blend approximation
      }
      // Prefer primary dosha if present
      if (primaryDosha && regionDoshas.includes(primaryDosha.toLowerCase())) {
        return getDoshaColor(primaryDosha);
      }
      if (secondaryDosha && regionDoshas.includes(secondaryDosha.toLowerCase())) {
        return getDoshaColor(secondaryDosha);
      }
    }
    return '#E0E0E0'; // Default gray
  };

  // Map regions to body parts
  regions.forEach(region => {
    const color = getRegionColor(region);
    const isSelected = selectedRegion === region.id;
    const hasRegionProblems = hasProblems(region.id);

    region.bodyParts.forEach(partName => {
      bodyParts[partName] = {
        selected: isSelected,
        highlighted: hasRegionProblems,
        color,
      };
    });
  });

  // Ensure all body parts have a default configuration
  const allBodyParts: BodyPart[] = [
    'head', 'eyes', 'ears', 'nose', 'oral_cavity', 'neck_or_throat',
    'chest', 'upper_arm', 'upper_abdomen', 'forearm', 'mid_abdomen',
    'lower_abdomen', 'hand', 'sexual_organs', 'thigh', 'knee', 'lower_leg', 'foot'
  ];
  
  allBodyParts.forEach(partName => {
    if (!bodyParts[partName]) {
      bodyParts[partName] = {
        selected: false,
        highlighted: false,
        color: '#E5E7EB', // light gray default
      };
    }
  });

  return bodyParts;
};

// Get region from body part name
export const getRegionFromBodyPart = (partName: BodyPart): ExtendedBodyRegion | null => {
  return extendedBodyRegions.find(region => 
    region.bodyParts.includes(partName)
  ) || null;
};

// Check if body part has problems
export const bodyPartHasProblems = (partName: BodyPart, problemAreas: string[]): boolean => {
  const region = getRegionFromBodyPart(partName);
  return region ? problemAreas.includes(region.id) : false;
};