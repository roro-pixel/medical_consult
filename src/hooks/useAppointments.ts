import { useState, useEffect } from 'react';
import type { Appointment } from '../types/medical';
import { toast } from 'react-hot-toast';

const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_BASE_API_URL,
  APPOINTMENTS: '/appointments',
};

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async (): Promise<Appointment[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.APPOINTMENTS}/`, {
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
      const appointmentsData = data.results || data;
      
      const appointmentsWithDates = appointmentsData.map((appointment: any) => ({
        ...appointment,
        appointmentId: appointment.appointment_id,
        appointmentTime: new Date(appointment.appointment_time),
        patientName: appointment.patient_name,
        doctorName: appointment.doctor_name,
        doctorSpecialty: appointment.doctor_specialty,
        createdAt: new Date(appointment.created_at),
      }));
      
      setAppointments(appointmentsWithDates);
      return appointmentsWithDates;
    } catch (error) {
      const errorMessage = 'Erreur lors du chargement des rendez-vous';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Fetch appointments error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (appointmentData: {
    doctor: string;
    patient: string;
    appointmentTime: Date;
    status: string;
    notes?: string;
  }): Promise<Appointment | null> => {
    setLoading(true);
    try {
      const apiData = {
        doctor: appointmentData.doctor,
        patient: appointmentData.patient,
        appointment_time: appointmentData.appointmentTime.toISOString(),
        status: appointmentData.status,
        notes: appointmentData.notes || '',
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.APPOINTMENTS}/`, {
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
        console.error('Create appointment error:', errorData);
        throw new Error(`Erreur lors de la création: ${response.status}`);
      }

      const newAppointment = await response.json();
      const appointmentWithDate = {
        ...newAppointment,
        appointmentId: newAppointment.appointment_id,
        appointmentTime: new Date(newAppointment.appointment_time),
        patientName: newAppointment.patient_name,
        doctorName: newAppointment.doctor_name,
        doctorSpecialty: newAppointment.doctor_specialty,
        createdAt: new Date(newAppointment.created_at),
      };

      setAppointments(prev => [...prev, appointmentWithDate]);
      toast.success('Rendez-vous créé avec succès');
      return appointmentWithDate;
    } catch (error) {
      toast.error('Erreur lors de la création du rendez-vous');
      console.error('Create appointment error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getTodayAppointments = async (): Promise<Appointment[]> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.APPOINTMENTS}/today/`, {
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
      return data.map((appointment: any) => ({
        ...appointment,
        appointmentId: appointment.appointment_id,
        appointmentTime: new Date(appointment.appointment_time),
        patientName: appointment.patient_name,
        doctorName: appointment.doctor_name,
        doctorSpecialty: appointment.doctor_specialty,
        createdAt: new Date(appointment.created_at),
      }));
    } catch (error) {
      toast.error('Erreur lors du chargement des rendez-vous d\'aujourd\'hui');
      console.error('Get today appointments error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingAppointments = async (): Promise<Appointment[]> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.APPOINTMENTS}/upcoming/`, {
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
      return data.map((appointment: any) => ({
        ...appointment,
        appointmentId: appointment.appointment_id,
        appointmentTime: new Date(appointment.appointment_time),
        patientName: appointment.patient_name,
        doctorName: appointment.doctor_name,
        doctorSpecialty: appointment.doctor_specialty,
        createdAt: new Date(appointment.created_at),
      }));
    } catch (error) {
      toast.error('Erreur lors du chargement des rendez-vous à venir');
      console.error('Get upcoming appointments error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const completeAppointment = async (appointmentId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.APPOINTMENTS}/${appointmentId}/complete/`, {
        method: 'POST',
        headers: {
          'bypass-tunnel-reminder': 'true',
            Accept: 'application/json',
        'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la mise à jour: ${response.status}`);
      }

      setAppointments(prev => 
        prev.map(appointment => 
          appointment.appointmentId === appointmentId 
            ? { ...appointment, status: 'COMPLETED' }
            : appointment
        )
      );

      toast.success('Rendez-vous marqué comme terminé');
      return true;
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du rendez-vous');
      console.error('Complete appointment error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.APPOINTMENTS}/${appointmentId}/cancel/`, {
        method: 'POST',
        headers: {
          'bypass-tunnel-reminder': 'true',
            Accept: 'application/json',
        'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de l'annulation: ${response.status}`);
      }

      setAppointments(prev => 
        prev.map(appointment => 
          appointment.appointmentId === appointmentId 
            ? { ...appointment, status: 'CANCELLED' }
            : appointment
        )
      );

      toast.success('Rendez-vous annulé');
      return true;
    } catch (error) {
      toast.error('Erreur lors de l\'annulation du rendez-vous');
      console.error('Cancel appointment error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const markNoShow = async (appointmentId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.APPOINTMENTS}/${appointmentId}/no_show/`, {
        method: 'POST',
        headers: {
          'bypass-tunnel-reminder': 'true',
            Accept: 'application/json',
        'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la mise à jour: ${response.status}`);
      }

      setAppointments(prev => 
        prev.map(appointment => 
          appointment.appointmentId === appointmentId 
            ? { ...appointment, status: 'NO_SHOW' }
            : appointment
        )
      );

      toast.success('Rendez-vous marqué comme absent');
      return true;
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du rendez-vous');
      console.error('Mark no show error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    getTodayAppointments,
    getUpcomingAppointments,
    completeAppointment,
    cancelAppointment,
    markNoShow,
  };
};