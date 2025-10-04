import { useState } from 'react';
import type { MedicalRecord, Consultation } from '../types/medical';
import { toast } from 'react-hot-toast';

const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_BASE_API_URL,
  MEDICAL_RECORDS: '/medical-records',
  CONSULTATIONS: '/consultations',
};

export const useMedicalRecords = () => {
  const [medicalRecords, setMedicalRecords] = useState<Record<string, MedicalRecord>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllMedicalRecords = async (): Promise<MedicalRecord[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.MEDICAL_RECORDS}/`, {
        headers: {     
          'bypass-tunnel-reminder': 'true',    
            Accept: 'application/json',
        'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      const recordsData = data.results || data;

      const adaptedRecords = recordsData.map((record: any) => ({
        ...record,
        medicalRecordId: record.medical_record_id,
        patientName: record.patient_name,
        patientId: record.patient_id,
        attendingPhysician: record.attending_physician,
        pastMedicalHistory: record.past_medical_history,
        chronicConditions: record.chronic_conditions,
        familyHistory: record.family_history,
        consultationCount: record.consultation_count,
        createdAt: new Date(record.created_at),
        updatedAt: new Date(record.updated_at),
        consultations: record.consultations?.map((consultation: any) => ({
          ...consultation,
          consultationId: consultation.consultation_id,
          consultationDate: new Date(consultation.consultation_date),
          doctorName: consultation.doctor_name,
          diagnosticName: consultation.diagnostic_name,
          chiefComplaint: consultation.chief_complaint,
        })) || [],
        recentConsultations: record.recent_consultations?.map((consultation: any) => ({
          ...consultation,
          consultationId: consultation.consultation_id,
          consultationDate: new Date(consultation.consultation_date),
          doctorName: consultation.doctor_name,
          chiefComplaint: consultation.chief_complaint,
        })) || [],
      }));

      return adaptedRecords;
    } catch (error) {
      const errorMessage = 'Erreur lors du chargement des dossiers médicaux';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Fetch medical records error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicalRecord = async (recordId: string): Promise<MedicalRecord | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.MEDICAL_RECORDS}/${recordId}/`, {
        headers: {  
          'bypass-tunnel-reminder': 'true',      
            Accept: 'application/json',
        'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const record = await response.json();
      const adaptedRecord = {
        ...record,
        medicalRecordId: record.medical_record_id,
        patientName: record.patient_name,
        patientId: record.patient_id,
        attendingPhysician: record.attending_physician,
        pastMedicalHistory: record.past_medical_history,
        chronicConditions: record.chronic_conditions,
        familyHistory: record.family_history,
        consultationCount: record.consultation_count,
        createdAt: new Date(record.created_at),
        updatedAt: new Date(record.updated_at),
        consultations: record.consultations?.map((consultation: any) => ({
          ...consultation,
          consultationId: consultation.consultation_id,
          consultationDate: new Date(consultation.consultation_date),
          doctorName: consultation.doctor_name,
          diagnosticName: consultation.diagnostic_name,
          chiefComplaint: consultation.chief_complaint,
        })) || [],
        recentConsultations: record.recent_consultations?.map((consultation: any) => ({
          ...consultation,
          consultationId: consultation.consultation_id,
          consultationDate: new Date(consultation.consultation_date),
          doctorName: consultation.doctor_name,
          chiefComplaint: consultation.chief_complaint,
        })) || [],
      };

      setMedicalRecords(prev => ({ ...prev, [record.patient_id]: adaptedRecord }));
      return adaptedRecord;
    } catch (error) {
      const errorMessage = 'Erreur lors du chargement du dossier médical';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Fetch medical record error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientMedicalRecord = async (patientId: string): Promise<MedicalRecord | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/patients/${patientId}/medical_record/`, {
        headers: {  
          'bypass-tunnel-reminder': 'true',       
            Accept: 'application/json',
        'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const record = await response.json();
      const adaptedRecord = {
        ...record,
        medicalRecordId: record.medical_record_id,
        patientName: record.patient_name,
        patientId: record.patient_id,
        attendingPhysician: record.attending_physician,
        pastMedicalHistory: record.past_medical_history,
        chronicConditions: record.chronic_conditions,
        familyHistory: record.family_history,
        consultationCount: record.consultation_count,
        createdAt: new Date(record.created_at),
        updatedAt: new Date(record.updated_at),
        consultations: record.consultations?.map((consultation: any) => ({
          ...consultation,
          consultationId: consultation.consultation_id,
          consultationDate: new Date(consultation.consultation_date),
          doctorName: consultation.doctor_name,
          diagnosticName: consultation.diagnostic_name,
          chiefComplaint: consultation.chief_complaint,
        })) || [],
        recentConsultations: record.recent_consultations?.map((consultation: any) => ({
          ...consultation,
          consultationId: consultation.consultation_id,
          consultationDate: new Date(consultation.consultation_date),
          doctorName: consultation.doctor_name,
          chiefComplaint: consultation.chief_complaint,
        })) || [],
      };

      setMedicalRecords(prev => ({ ...prev, [patientId]: adaptedRecord }));
      return adaptedRecord;
    } catch (error) {
      const errorMessage = 'Erreur lors du chargement du dossier médical du patient';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Fetch patient medical record error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchAllConsultations = async (): Promise<Consultation[]> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CONSULTATIONS}/`, {
        headers: { 
          'bypass-tunnel-reminder': 'true',     
            Accept: 'application/json',
        'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      const consultationsData = data.results || data;

      return consultationsData.map((consultation: any) => ({
        ...consultation,
        consultationId: consultation.consultation_id,
        consultationDate: new Date(consultation.consultation_date),
        patientName: consultation.patient_name,
        doctorName: consultation.doctor_name,
        diagnosticName: consultation.diagnostic_name,
        chiefComplaint: consultation.chief_complaint,
        recommendedSteps: consultation.recommended_steps,
        createdAt: new Date(consultation.created_at),
      }));
    } catch (error) {
      toast.error('Erreur lors du chargement des consultations');
      console.error('Fetch consultations error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createConsultation = async (consultationData: {
    consultationDate: Date;
    doctor: string;
    patient: string;
    chiefComplaint: string;
    symptoms: string;
    observation: string;
    diagnostic: string;
    recommendedSteps: string;
    status: string;
  }): Promise<Consultation | null> => {
    setLoading(true);
    try {
      const apiData = {
        consultation_date: consultationData.consultationDate.toISOString(),
        doctor: consultationData.doctor,
        patient: consultationData.patient,
        chief_complaint: consultationData.chiefComplaint,
        symptoms: consultationData.symptoms,
        observation: consultationData.observation,
        diagnostic: consultationData.diagnostic,
        recommended_steps: consultationData.recommendedSteps,
        status: consultationData.status,
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CONSULTATIONS}/`, {
        method: 'POST',
        headers: {
          'bypass-tunnel-reminder': 'true',
          'Content-Type': 'application/json',      
            Accept: 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Create consultation error:', errorData);
        throw new Error(`Erreur lors de la création: ${response.status}`);
      }

      const newConsultation = await response.json();
      const adaptedConsultation = {
        ...newConsultation,
        consultationId: newConsultation.consultation_id,
        consultationDate: new Date(newConsultation.consultation_date),
        patientName: newConsultation.patient_name,
        doctorName: newConsultation.doctor_name,
        diagnosticName: newConsultation.diagnostic_name,
        chiefComplaint: newConsultation.chief_complaint,
        recommendedSteps: newConsultation.recommended_steps,
        createdAt: new Date(newConsultation.created_at),
      };

      toast.success('Consultation créée avec succès');
      return adaptedConsultation;
    } catch (error) {
      toast.error('Erreur lors de la création de la consultation');
      console.error('Create consultation error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getTodayConsultations = async (): Promise<Consultation[]> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CONSULTATIONS}/today/`, {
        headers: { 
          'bypass-tunnel-reminder': 'true',       
            Accept: 'application/json',
        'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data.map((consultation: any) => ({
        ...consultation,
        consultationId: consultation.consultation_id,
        consultationDate: new Date(consultation.consultation_date),
        patientName: consultation.patient_name,
        doctorName: consultation.doctor_name,
        diagnosticName: consultation.diagnostic_name,
        chiefComplaint: consultation.chief_complaint,
        recommendedSteps: consultation.recommended_steps,
        createdAt: new Date(consultation.created_at),
      }));
    } catch (error) {
      console.error('Get today consultations error:', error);
      return [];
    }
  };

  const getUpcomingConsultations = async (): Promise<Consultation[]> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CONSULTATIONS}/upcoming/`, {
        headers: {   
          'bypass-tunnel-reminder': 'true',     
            Accept: 'application/json',
        'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data.map((consultation: any) => ({
        ...consultation,
        consultationId: consultation.consultation_id,
        consultationDate: new Date(consultation.consultation_date),
        patientName: consultation.patient_name,
        doctorName: consultation.doctor_name,
        diagnosticName: consultation.diagnostic_name,
        chiefComplaint: consultation.chief_complaint,
        recommendedSteps: consultation.recommended_steps,
        createdAt: new Date(consultation.created_at),
      }));
    } catch (error) {
      console.error('Get upcoming consultations error:', error);
      return [];
    }
  };

  const getConsultationStats = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CONSULTATIONS}/stats/`, {
        headers: { 
          'bypass-tunnel-reminder': 'true',   
            Accept: 'application/json',
        'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get consultation stats error:', error);
      return null;
    }
  };

  return {
    medicalRecords,
    loading,
    error,
    fetchAllMedicalRecords,
    fetchMedicalRecord,
    fetchPatientMedicalRecord,
    fetchAllConsultations,
    createConsultation,
    getTodayConsultations,
    getUpcomingConsultations,
    getConsultationStats,
  };
};