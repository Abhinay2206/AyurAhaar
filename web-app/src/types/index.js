// TypeScript-style type definitions for documentation
// (These would be actual TypeScript interfaces in a .ts project)

// User Types
export const UserRole = {
  DOCTOR: 'doctor',
  ADMIN: 'admin',
};

export const AppointmentStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const MealPlanStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  MODIFIED: 'modified',
};

export const HealthCondition = {
  DIABETES: 'diabetes',
  PCOS: 'pcos',
  OBESITY: 'obesity',
  HYPERTENSION: 'hypertension',
  THYROID: 'thyroid',
};

export const DoshaType = {
  VATA: 'vata',
  PITTA: 'pitta',
  KAPHA: 'kapha',
  VATA_PITTA: 'vata-pitta',
  PITTA_KAPHA: 'pitta-kapha',
  VATA_KAPHA: 'vata-kapha',
  TRIDOSHIC: 'tridoshic',
};
