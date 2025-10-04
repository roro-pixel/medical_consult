import { useState, useEffect } from 'react';
import type { Prescription, PrescriptionItem } from '../types/medical';
import { toast } from 'react-hot-toast';

const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_BASE_API_URL,
  PRESCRIPTIONS: '/prescriptions',
  PRESCRIPTION_ITEMS: '/prescription-items',
};

export const usePrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lister toutes les prescriptions
  const getPrescriptions = async (): Promise<Prescription[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PRESCRIPTIONS}/`, {
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
      const prescriptionsData = data.results || data;

      const prescriptionsWithDates = prescriptionsData.map((prescription: any) => ({
        ...prescription,
        prescriptionId: prescription.prescription_id,
        consultationId: prescription.consultation_id,
        createdAt: new Date(prescription.created_at),
        items: prescription.items || [],
      }));

      setPrescriptions(prescriptionsWithDates);
      return prescriptionsWithDates;
    } catch (error) {
      const errorMessage = 'Erreur lors du chargement des prescriptions';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Get prescriptions error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createPrescription = async (
    consultationId: string, 
    notes?: string
  ): Promise<Prescription | null> => {
    setLoading(true);
    setError(null);
    try {
      const apiData = {
        consultation: consultationId,
        notes: notes || '',
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PRESCRIPTIONS}/`, {
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
        console.error('Create prescription error:', errorData);
        throw new Error(`Erreur lors de la création: ${response.status}`);
      }

      const newPrescription = await response.json();
      const adaptedPrescription = {
        ...newPrescription,
        prescriptionId: newPrescription.prescription_id,
        consultationId: newPrescription.consultation_id,
        createdAt: new Date(newPrescription.created_at),
        items: newPrescription.items || [],
      };

      setPrescriptions(prev => [...prev, adaptedPrescription]);
      toast.success('Prescription créée avec succès');
      return adaptedPrescription;
    } catch (error) {
      const errorMessage = 'Erreur lors de la création de la prescription';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Create prescription error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addPrescriptionItem = async (
    prescriptionId: string, 
    itemData: {
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      indication: string;
    }
  ): Promise<PrescriptionItem | null> => {
    setLoading(true);
    try {
      const apiData = {
        prescription: prescriptionId,
        name: itemData.name,
        dosage: itemData.dosage,
        frequency: itemData.frequency,
        duration: itemData.duration,
        indication: itemData.indication,
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PRESCRIPTION_ITEMS}/`, {
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
        console.error('Add prescription item error:', errorData);
        throw new Error(`Erreur lors de l'ajout: ${response.status}`);
      }

      const newItem = await response.json();
      const adaptedItem = {
        ...newItem,
        createdAt: new Date(newItem.created_at),
      };
      
      setPrescriptions(prev => 
        prev.map(prescription => 
          prescription.prescriptionId === prescriptionId 
            ? { ...prescription, items: [...prescription.items, adaptedItem] }
            : prescription
        )
      );

      toast.success('Médicament ajouté à la prescription');
      return adaptedItem;
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du médicament');
      console.error('Add prescription item error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getPopularMedications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PRESCRIPTION_ITEMS}/popular_medications/`, {
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
      return data;
    } catch (error) {
      toast.error('Erreur lors du chargement des médicaments populaires');
      console.error('Get popular medications error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPrescriptions();
  }, []);

  return {
    prescriptions,
    loading,
    error,
    getPrescriptions,
    createPrescription,
    addPrescriptionItem,
    getPopularMedications,
  };
};