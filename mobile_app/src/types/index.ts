// Type definitions for the application

export interface User {
  id: string;
  name: string;
  email: string;
  // Add other user properties
}

export interface SurveyData {
  fullName: string;
  mobileNumber: string;
  age: number;
  weight: string;
  height: string;
  preferredCuisine: string[];
  // Add other survey fields
}

// Add more type definitions as needed
