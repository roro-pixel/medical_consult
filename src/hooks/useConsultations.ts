import { useState, useEffect } from 'react';
import type { Consultation } from '../types/medical';
import { toast } from 'react-hot-toast';

const API_CONFIG = {
  BASE_URL:  import.meta.env.VITE_BASE_API_URL,
  CONSULTATIONS: '/consultations',
};

export const useConsultations = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConsultations = async (): Promise<Consultation[]> => {
    setLoading(true);
    setError(null);
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
      
      const consultationsWithDates = consultationsData.map((consultation: any) => ({
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
      
      setConsultations(consultationsWithDates);
      return consultationsWithDates;
    } catch (error) {
      const errorMessage = 'Erreur lors du chargement des consultations';
      setError(errorMessage);
      toast.error(errorMessage);
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
      const consultationWithDate = {
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

      setConsultations(prev => [...prev, consultationWithDate]);
      toast.success('Consultation créée avec succès');
      return consultationWithDate;
    } catch (error) {
      toast.error('Erreur lors de la création de la consultation');
      console.error('Create consultation error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getTodayConsultations = async (): Promise<Consultation[]> => {
    setLoading(true);
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
      toast.error('Erreur lors du chargement des consultations d\'aujourd\'hui');
      console.error('Get today consultations error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingConsultations = async (): Promise<Consultation[]> => {
    setLoading(true);
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
      toast.error('Erreur lors du chargement des consultations à venir');
      console.error('Get upcoming consultations error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getConsultationStats = async () => {
    setLoading(true);
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
      toast.error('Erreur lors du chargement des statistiques');
      console.error('Get consultation stats error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  return {
    consultations,
    loading,
    error,
    fetchConsultations,
    createConsultation,
    getTodayConsultations,
    getUpcomingConsultations,
    getConsultationStats,
  };
};