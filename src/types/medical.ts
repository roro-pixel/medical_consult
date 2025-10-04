export interface Patient {
  patientId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  maidenName: string;
  gender: string;
  height: number;
  weight: number;
  allergy: string;
  bloodType: string;
  birthDate: Date;
  nationality: string;
  address: string;
  phone: string;
  email: string;
  assuranceNumber: string;
}

export interface MedicalRecord {
  medicalRecordId: string;
  createdAt: Date;
  attendingPhysician: string;
  pastMedicalHistory: string;
  consultations: Consultation[];
}

export interface Appointment {
  id: number;
  appointmentId: string;
  appointmentTime: Date;
  patient_id: string;
  doctor_id: string;
  status: string;
}

export interface Prescription {
  id: number;
  prescriptionId: string;
  items: PrescriptionItem[];
}

export interface PrescriptionItem {
  id: number;
  name: string;
  description: string;
  indication: string;
  duration: string;
  dosage: string;
}

export interface Consultation {
  id: number;
  consultationId: string;
  consultationDate: Date;
  observation: string;
  diagnostic_id: string;
  symptoms: string;
  resume: string;
  recommendedSteps: string;
  chiefComplaint: string;
  pastMedicalHistory: string;
}

export interface Diagnostic {
  id: number;
  diagnosticId: string;
  name: string;
  description: string;
  createdAt: Date;
}



export interface PaymentModalData {
  prescriptionId: string;
  patientId: string;
  amount: number;
  paymentMethod: "cash" | "card" | "insurance";
}