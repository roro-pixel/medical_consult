import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Doctor {
  id: string;
  doctor_id: string;
  firstname: string;
  lastname: string;
  fullname: string;
  specialty: string;
  phone: string;
  phone_formatted: string;
  email: string;
  license_number: string;
  consultation_count: number;
  created_at: Date;
}

const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_BASE_API_URL,
  DOCTORS: '/doctors',
};

export const useDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = async (): Promise<Doctor[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.DOCTORS}/`, {
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
      const doctorsData = data.results || data;

      const doctorsWithDates = doctorsData.map((doctor: any) => ({
        ...doctor,
        doctorId: doctor.doctor_id,
        firstName: doctor.firstname,
        lastName: doctor.lastname,
        fullName: doctor.fullname,
        phoneFormatted: doctor.phone_formatted,
        licenseNumber: doctor.license_number,
        consultationCount: doctor.consultation_count,
        createdAt: new Date(doctor.created_at),
      }));

      setDoctors(doctorsWithDates);
      return doctorsWithDates;
    } catch (error) {
      const errorMessage = 'Erreur lors du chargement des médecins';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Fetch doctors error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createDoctor = async (doctorData: {
    firstname: string;
    lastname: string;
    specialty: string;
    phone: string;
    email: string;
    license_number: string;
  }): Promise<Doctor | null> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.DOCTORS}/`, {
        method: 'POST',
        headers: {
          'bypass-tunnel-reminder': 'true',
          'Content-Type': 'application/json',        
            Accept: 'application/json',
        },
        body: JSON.stringify(doctorData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Create doctor error:', errorData);
        throw new Error(`Erreur lors de la création: ${response.status}`);
      }

      const newDoctor = await response.json();
      const doctorWithDate = {
        ...newDoctor,
        doctorId: newDoctor.doctor_id,
        firstName: newDoctor.firstname,
        lastName: newDoctor.lastname,
        fullName: newDoctor.fullname,
        phoneFormatted: newDoctor.phone_formatted,
        licenseNumber: newDoctor.license_number,
        consultationCount: newDoctor.consultation_count,
        createdAt: new Date(newDoctor.created_at),
      };

      setDoctors(prev => [...prev, doctorWithDate]);
      toast.success('Médecin créé avec succès');
      return doctorWithDate;
    } catch (error) {
      toast.error('Erreur lors de la création du médecin');
      console.error('Create doctor error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getDoctorsBySpecialty = async (): Promise<Record<string, Doctor[]>> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.DOCTORS}/by_specialty/`, {
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
      
      const adaptedData: Record<string, Doctor[]> = {};
      for (const [specialty, doctorsList] of Object.entries(data)) {
        adaptedData[specialty] = (doctorsList as any[]).map((doctor: any) => ({
          ...doctor,
          doctorId: doctor.doctor_id,
          firstName: doctor.firstname,
          lastName: doctor.lastname,
          fullName: doctor.fullname,
          phoneFormatted: doctor.phone_formatted,
          licenseNumber: doctor.license_number,
          consultationCount: doctor.consultation_count,
          createdAt: new Date(doctor.created_at),
        }));
      }

      return adaptedData;
    } catch (error) {
      toast.error('Erreur lors du chargement des médecins par spécialité');
      console.error('Get doctors by specialty error:', error);
      return {};
    } finally {
      setLoading(false);
    }
  };

  const getDoctorStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.DOCTORS}/stats/`, {
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
      console.error('Get doctor stats error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return {
    doctors,
    loading,
    error,
    fetchDoctors,
    createDoctor,
    getDoctorsBySpecialty,
    getDoctorStats,
  };
};