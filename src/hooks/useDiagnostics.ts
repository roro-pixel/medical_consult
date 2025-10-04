import { useState, useEffect } from 'react';
import type { Diagnostic } from '../types/medical';
import { toast } from 'react-hot-toast';

const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_BASE_API_URL,
  DIAGNOSTICS: '/diagnostics',
};

export const useDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupérer tous les diagnostics
  const fetchDiagnostics = async (): Promise<Diagnostic[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.DIAGNOSTICS}/`, {
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
      const diagnosticsData = data.results || data;
      
      const diagnosticsWithDates = diagnosticsData.map((diagnostic: any) => ({
        ...diagnostic,
        diagnosticId: diagnostic.diagnostic_id,
        createdAt: new Date(diagnostic.created_at),
      }));
      
      setDiagnostics(diagnosticsWithDates);
      return diagnosticsWithDates;
    } catch (error) {
      const errorMessage = 'Erreur lors du chargement des diagnostics';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Fetch diagnostics error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createDiagnostic = async (diagnosticData: {
    name: string;
    description: string;
    icd_code?: string;
  }): Promise<Diagnostic | null> => {
    setLoading(true);
    try {
      const apiData = {
        name: diagnosticData.name,
        description: diagnosticData.description,
        icd_code: diagnosticData.icd_code || '',
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.DIAGNOSTICS}/`, {
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
        console.error('Create diagnostic error:', errorData);
        throw new Error(`Erreur lors de la création: ${response.status}`);
      }

      const newDiagnostic = await response.json();
      const diagnosticWithDate = {
        ...newDiagnostic,
        diagnosticId: newDiagnostic.diagnostic_id,
        createdAt: new Date(newDiagnostic.created_at),
      };

      setDiagnostics(prev => [...prev, diagnosticWithDate]);
      toast.success('Diagnostic créé avec succès');
      return diagnosticWithDate;
    } catch (error) {
      toast.error('Erreur lors de la création du diagnostic');
      console.error('Create diagnostic error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchDiagnosticsWithIcd = async (): Promise<Diagnostic[]> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.DIAGNOSTICS}/with_icd/`, {
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
      const diagnosticsData = data.results || data;
      
      return diagnosticsData.map((diagnostic: any) => ({
        ...diagnostic,
        diagnosticId: diagnostic.diagnostic_id,
        createdAt: new Date(diagnostic.created_at),
      }));
    } catch (error) {
      toast.error('Erreur lors du chargement des diagnostics avec codes ICD');
      console.error('Fetch diagnostics with ICD error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  return {
    diagnostics,
    loading,
    error,
    fetchDiagnostics,
    createDiagnostic,
    fetchDiagnosticsWithIcd,
  };
};