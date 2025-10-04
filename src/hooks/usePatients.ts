import { useState, useEffect } from 'react';
import type { Patient } from '../types/medical';
import { toast } from 'react-hot-toast';

const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_BASE_API_URL,
  PATIENTS: '/patients',
};

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async (): Promise<Patient[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PATIENTS}/`, {
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
      
      const patientsData = data.results || data;
      
      const patientsWithDates = patientsData.map((patient: any) => ({
        ...patient,
        birthDate: new Date(patient.birth_date),
        fullName: patient.fullname,
        firstName: patient.firstname,
        lastName: patient.lastname,
        patientId: patient.patient_id,
        phoneFormatted: patient.phone_formatted,
      }));
      
      setPatients(patientsWithDates);
      return patientsWithDates;
    } catch (error) {
      const errorMessage = 'Erreur lors du chargement des patients';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Fetch patients error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const searchPatients = async (query: string): Promise<Patient[]> => {
    if (!query || query.length < 2) return [];
    
    setLoading(true);
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.PATIENTS}/?search=${encodeURIComponent(query)}`,
        {
          headers: {  
            'bypass-tunnel-reminder': 'true',   
              Accept: 'application/json',
        'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      const patientsData = data.results || data;
      
      const searchResults = patientsData.map((patient: any) => ({
        ...patient,
        birthDate: new Date(patient.birth_date),
        fullName: patient.fullname,
        firstName: patient.firstname,
        lastName: patient.lastname,
        patientId: patient.patient_id,
        phoneFormatted: patient.phone_formatted,
      }));
      
      return searchResults;
    } catch (error) {
      toast.error('Erreur lors de la recherche');
      console.error('Search patients error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getPatientById = async (patientId: string): Promise<Patient | null> => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.PATIENTS}/${patientId}/`,
        {
          headers: {  
            'bypass-tunnel-reminder': 'true',         
              Accept: 'application/json',
        'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Patient non trouvé: ${response.status}`);
      }
      
      const patient = await response.json();
      return {
        ...patient,
        birthDate: new Date(patient.birth_date),
        fullName: patient.fullname,
        firstName: patient.firstname,
        lastName: patient.lastname,
        patientId: patient.patient_id,
        phoneFormatted: patient.phone_formatted,
      };
    } catch (error) {
      toast.error('Erreur lors de la récupération du patient');
      console.error('Get patient error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createPatient = async (patientData: Omit<Patient, 'id' | 'patientId' | 'fullName' | 'age' | 'medicalRecord' | 'createdAt' | 'updatedAt'>): Promise<Patient | null> => {
    setLoading(true);
    try {
      const apiData = {
        firstname: patientData.firstName,
        lastname: patientData.lastName,
        gender: patientData.gender,
        birth_date: patientData.birthDate.toISOString().split('T')[0],
        phone: patientData.phone,
        email: patientData.email,
        address: patientData.address,
        nationality: patientData.nationality,
        height: patientData.height,
        weight: patientData.weight,
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PATIENTS}/`, {
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
        console.error('Create patient error:', errorData);
        throw new Error(`Erreur lors de la création: ${response.status}`);
      }

      const newPatient = await response.json();
      const patientWithDate = {
        ...newPatient,
        birthDate: new Date(newPatient.birth_date),
        fullName: newPatient.fullname,
        firstName: newPatient.firstname,
        lastName: newPatient.lastname,
        patientId: newPatient.patient_id,
        phoneFormatted: newPatient.phone_formatted,
      };

      setPatients(prev => [...prev, patientWithDate]);
      toast.success('Patient créé avec succès');
      return patientWithDate;
    } catch (error) {
      toast.error('Erreur lors de la création du patient');
      console.error('Create patient error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updatePatient = async (patientId: string, patientData: Partial<Patient>): Promise<Patient | null> => {
    setLoading(true);
    try {
      const apiData: any = {};
      if (patientData.firstName) apiData.firstname = patientData.firstName;
      if (patientData.lastName) apiData.lastname = patientData.lastName;
      if (patientData.gender) apiData.gender = patientData.gender;
      if (patientData.birthDate) apiData.birth_date = patientData.birthDate.toISOString().split('T')[0];
      if (patientData.phone) apiData.phone = patientData.phone;
      if (patientData.email) apiData.email = patientData.email;
      if (patientData.address) apiData.address = patientData.address;
      if (patientData.nationality) apiData.nationality = patientData.nationality;
      if (patientData.height) apiData.height = patientData.height;
      if (patientData.weight) apiData.weight = patientData.weight;

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PATIENTS}/${patientId}/`, {
        method: 'PUT',
        headers: {
          'bypass-tunnel-reminder': 'true',
          'Content-Type': 'application/json',       
            Accept: 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la mise à jour: ${response.status}`);
      }

      const updatedPatient = await response.json();
      const patientWithDate = {
        ...updatedPatient,
        birthDate: new Date(updatedPatient.birth_date),
        fullName: updatedPatient.fullname,
        firstName: updatedPatient.firstname,
        lastName: updatedPatient.lastname,
        patientId: updatedPatient.patient_id,
        phoneFormatted: updatedPatient.phone_formatted,
      };

      setPatients(prev => 
        prev.map(patient => 
          patient.patientId === patientId ? patientWithDate : patient
        )
      );

      toast.success('Patient mis à jour avec succès');
      return patientWithDate;
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du patient');
      console.error('Update patient error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deletePatient = async (patientId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PATIENTS}/${patientId}/`, {
        method: 'DELETE',
        headers: {  
          'bypass-tunnel-reminder': 'true',      
            Accept: 'application/json',
        'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la suppression: ${response.status}`);
      }

      setPatients(prev => prev.filter(patient => patient.patientId !== patientId));
      toast.success('Patient supprimé avec succès');
      return true;
    } catch (error) {
      toast.error('Erreur lors de la suppression du patient');
      console.error('Delete patient error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getPatientStats = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PATIENTS}/stats/`, {
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
      console.error('Get patient stats error:', error);
      return null;
    }
  };

  const getPatientMedicalRecord = async (patientId: string) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.PATIENTS}/${patientId}/medical_record/`,
        {
          headers: { 
            'bypass-tunnel-reminder': 'true',          
              Accept: 'application/json',
           'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get patient medical record error:', error);
      return null;
    }
  };

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return {
    patients,
    loading,
    error,
    fetchPatients,
    searchPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient,
    getPatientStats,
    getPatientMedicalRecord,
    calculateAge,
  };
};