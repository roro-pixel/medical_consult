import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Payment {
  id: string;
  payment_id: string;
  consultation: string;
  consultation_id: string;
  patient_name: string;
  amount: string;
  payment_method: string;
  status: string;
  reference_number: string;
  paid_at: Date | null;
  created_at: Date;
}

const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_BASE_API_URL,
  PAYMENTS: '/payments',
};

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPayments = async (): Promise<Payment[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PAYMENTS}/`, {
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
      const paymentsData = data.results || data;

      const paymentsWithDates = paymentsData.map((payment: any) => ({
        ...payment,
        paymentId: payment.payment_id,
        consultationId: payment.consultation_id,
        patientName: payment.patient_name,
        paymentMethod: payment.payment_method,
        referenceNumber: payment.reference_number,
        paidAt: payment.paid_at ? new Date(payment.paid_at) : null,
        createdAt: new Date(payment.created_at),
      }));

      setPayments(paymentsWithDates);
      return paymentsWithDates;
    } catch (error) {
      const errorMessage = 'Erreur lors du chargement des paiements';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Get payments error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async (paymentData: {
    consultation: string;
    amount: string;
    payment_method: string;
    status: string;
    reference_number: string;
  }): Promise<Payment | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PAYMENTS}/`, {
        method: 'POST',
        headers: {
          'bypass-tunnel-reminder': 'true',
          'Content-Type': 'application/json', 
            Accept: 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Create payment error:', errorData);
        throw new Error(`Erreur lors de la création: ${response.status}`);
      }

      const newPayment = await response.json();
      const paymentWithDate = {
        ...newPayment,
        paymentId: newPayment.payment_id,
        consultationId: newPayment.consultation_id,
        patientName: newPayment.patient_name,
        paymentMethod: newPayment.payment_method,
        referenceNumber: newPayment.reference_number,
        paidAt: newPayment.paid_at ? new Date(newPayment.paid_at) : null,
        createdAt: new Date(newPayment.created_at),
      };

      setPayments(prev => [...prev, paymentWithDate]);
      toast.success('Paiement créé avec succès');
      return paymentWithDate;
    } catch (error) {
      const errorMessage = 'Erreur lors de la création du paiement';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Create payment error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PAYMENTS}/stats/`, {
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
      toast.error('Erreur lors du chargement des statistiques de paiement');
      console.error('Get payment stats error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getDailyRevenue = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PAYMENTS}/daily_revenue/`, {
        headers: {
          
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      toast.error('Erreur lors du chargement des revenus quotidiens');
      console.error('Get daily revenue error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getPaymentsByMethod = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PAYMENTS}/by_method/`, {
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
      toast.error('Erreur lors du chargement des paiements par méthode');
      console.error('Get payments by method error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (paymentId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PAYMENTS}/${paymentId}/mark_paid/`, {
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

      setPayments(prev => 
        prev.map(payment => 
          payment.id === paymentId 
            ? { ...payment, status: 'COMPLETED', paidAt: new Date() }
            : payment
        )
      );

      toast.success('Paiement marqué comme payé');
      return true;
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du paiement');
      console.error('Mark as paid error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refundPayment = async (paymentId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PAYMENTS}/${paymentId}/refund/`, {
        method: 'POST',
        headers: {
          'bypass-tunnel-reminder': 'true',         
            Accept: 'application/json',
         'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur lors du remboursement: ${response.status}`);
      }

      setPayments(prev => 
        prev.map(payment => 
          payment.id === paymentId 
            ? { ...payment, status: 'REFUNDED' }
            : payment
        )
      );

      toast.success('Paiement remboursé');
      return true;
    } catch (error) {
      toast.error('Erreur lors du remboursement');
      console.error('Refund payment error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const markAsFailed = async (paymentId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PAYMENTS}/${paymentId}/mark_failed/`, {
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

      setPayments(prev => 
        prev.map(payment => 
          payment.id === paymentId 
            ? { ...payment, status: 'FAILED' }
            : payment
        )
      );

      toast.success('Paiement marqué comme échoué');
      return true;
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du paiement');
      console.error('Mark as failed error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPayments();
  }, []);

  return {
    payments,
    loading,
    error,
    getPayments,
    createPayment,
    getPaymentStats,
    getDailyRevenue,
    getPaymentsByMethod,
    markAsPaid,
    refundPayment,
    markAsFailed,
  };
};