import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Plus, Search, Edit, Trash2, X, CheckCircle, XCircle, AlertTriangle, Loader2, Activity, Users, CalendarCheck, TrendingUp, CreditCard, DollarSign } from 'lucide-react';
import type { Appointment, Patient } from '../types/medical';
import { useAppointments } from '../hooks/useAppointments';
import { usePatients } from '../hooks/usePatients';
import { useDoctors } from '../hooks/useDoctors';
import { usePayments } from '../hooks/usePayments';
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

interface PaymentStatus {
  isPaid: boolean;
  amount?: number;
  paymentMethod?: string;
  paymentDate?: Date;
  status?: string;
}

export const AppointmentsPage: React.FC = () => {
  const {
    appointments,
    loading: appointmentsLoading,
    createAppointment,
    getTodayAppointments,
    getUpcomingAppointments,
    completeAppointment,
    cancelAppointment,
    markNoShow
  } = useAppointments();

  const { patients } = usePatients();
  const { doctors } = useDoctors();
  const { payments, getPayments } = usePayments();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState(''); // Nouveau filtre pour les paiements
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [appointmentPayments, setAppointmentPayments] = useState<Record<string, PaymentStatus>>({});

  const [formData, setFormData] = useState({
    doctor: '',
    patient: '',
    appointmentTime: new Date(),
    status: 'SCHEDULED' as string,
    notes: ''
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadAppointmentData = async () => {
      const today = await getTodayAppointments();
      const upcoming = await getUpcomingAppointments();
      
      if (today) setTodayAppointments(today);
      if (upcoming) setUpcomingAppointments(upcoming);
    };
    
    loadAppointmentData();
  }, [getTodayAppointments, getUpcomingAppointments]);

  useEffect(() => {
    const loadPaymentsData = async () => {
      const allPayments = await getPayments();
      const paymentsByConsultation: Record<string, PaymentStatus> = {};

      allPayments.forEach(payment => {
        if (payment.consultation_id) {
          paymentsByConsultation[payment.consultation_id] = {
            isPaid: payment.status === 'COMPLETED',
            amount: parseFloat(payment.amount),
            paymentMethod: payment.payment_method,
            paymentDate: payment.paid_at ? new Date(payment.paid_at) : undefined,
            status: payment.status
          };
        }
      });

      setAppointmentPayments(paymentsByConsultation);
    };

    loadPaymentsData();
  }, [getPayments]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'NO_SHOW':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Programmé';
      case 'COMPLETED':
        return 'Terminé';
      case 'CANCELLED':
        return 'Annulé';
      case 'NO_SHOW':
        return 'Absent';
      default:
        return status;
    }
  };

  const getPaymentStatus = (appointmentId: string): PaymentStatus => {
    return appointmentPayments[appointmentId] || { isPaid: false };
  };

  const getPaymentIcon = (paymentStatus: PaymentStatus) => {
    if (paymentStatus.isPaid) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (paymentStatus.status === 'PENDING') {
      return <Clock className="w-4 h-4 text-yellow-600" />;
    } else if (paymentStatus.status === 'FAILED') {
      return <XCircle className="w-4 h-4 text-red-600" />;
    }
    return <CreditCard className="w-4 h-4 text-gray-400" />;
  };

  const getPaymentBadgeColor = (paymentStatus: PaymentStatus) => {
    if (paymentStatus.isPaid) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (paymentStatus.status === 'PENDING') {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else if (paymentStatus.status === 'FAILED') {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getPaymentLabel = (paymentStatus: PaymentStatus) => {
    if (paymentStatus.isPaid) {
      return 'Payé';
    } else if (paymentStatus.status === 'PENDING') {
      return 'En attente';
    } else if (paymentStatus.status === 'FAILED') {
      return 'Échoué';
    }
    return 'Non payé';
  };

  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.appointmentTime).toISOString().split('T')[0];
    const matchesDate = appointmentDate === selectedDate;
    
    const patient = patients.find(p => p.patientId === appointment.patient_id);
    const patientName = patient ? `${patient.fullName} ${patient.firstName}` : '';
    const matchesSearch = patientName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || appointment.status === statusFilter;
    
    const paymentStatus = getPaymentStatus(appointment.appointmentId);
    const matchesPayment = !paymentFilter || 
      (paymentFilter === 'paid' && paymentStatus.isPaid) ||
      (paymentFilter === 'unpaid' && !paymentStatus.isPaid && !paymentStatus.status) ||
      (paymentFilter === 'pending' && paymentStatus.status === 'PENDING') ||
      (paymentFilter === 'failed' && paymentStatus.status === 'FAILED');
    
    return matchesDate && matchesSearch && matchesStatus && matchesPayment;
  });

  const handleStatusChange = async (appointment: Appointment, newStatus: string) => {
    try {
      let success = false;
      
      switch (newStatus) {
        case 'COMPLETED':
          success = await completeAppointment(appointment.appointmentId);
          break;
        case 'CANCELLED':
          success = await cancelAppointment(appointment.appointmentId);
          break;
        case 'NO_SHOW':
          success = await markNoShow(appointment.appointmentId);
          break;
        default:
          toast.error('Action non supportée');
          return;
      }

      if (success) {
        const today = await getTodayAppointments();
        const upcoming = await getUpcomingAppointments();
        if (today) setTodayAppointments(today);
        if (upcoming) setUpcomingAppointments(upcoming);
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patient || !formData.doctor || !formData.appointmentTime) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const result = await createAppointment(formData);
      
      if (result) {
        setShowAddModal(false);
        resetForm();
        toast.success('Rendez-vous créé avec succès');
        
        const today = await getTodayAppointments();
        const upcoming = await getUpcomingAppointments();
        if (today) setTodayAppointments(today);
        if (upcoming) setUpcomingAppointments(upcoming);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Erreur lors de la création du rendez-vous');
    }
  };

  const resetForm = () => {
    setFormData({
      doctor: '',
      patient: '',
      appointmentTime: new Date(),
      status: 'SCHEDULED',
      notes: ''
    });
    setSelectedAppointment(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPatient = (patientId: string): Patient | undefined => {
    return patients.find(p => p.patientId === patientId);
  };

  const getDoctor = (doctorId: string): Doctor | undefined => {
    return doctors.find(d => d.id === doctorId);
  };

  const getPatientInitials = (patient: Patient) => {
    return `${patient?.firstName?.charAt(0) || ''}${patient?.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const todayStats = {
    total: todayAppointments.length,
    completed: todayAppointments.filter(app => app.status === 'COMPLETED').length,
    scheduled: todayAppointments.filter(app => app.status === 'SCHEDULED').length,
    cancelled: todayAppointments.filter(app => app.status === 'CANCELLED').length,
    paid: todayAppointments.filter(app => getPaymentStatus(app.appointmentId).isPaid).length,
    unpaid: todayAppointments.filter(app => !getPaymentStatus(app.appointmentId).isPaid && app.status === 'COMPLETED').length
  };

  if (appointmentsLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="ml-3 text-gray-600">Chargement des rendez-vous...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* En-tête avec heure */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Rendez-vous</h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
              <Clock className="w-4 h-4 ml-4" />
              {currentTime.toLocaleTimeString('fr-FR', { 
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau Rendez-vous
          </button>
        </div>
      </div>

      {/* Statistiques mises à jour */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-900">{todayStats.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Terminés</p>
              <p className="text-2xl font-bold text-green-900">{todayStats.completed}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Programmés</p>
              <p className="text-2xl font-bold text-yellow-900">{todayStats.scheduled}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600">À venir</p>
              <p className="text-2xl font-bold text-emerald-900">{upcomingAppointments.length}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Nouvelles statistiques de paiement */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Payés</p>
              <p className="text-2xl font-bold text-green-900">{todayStats.paid}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Impayés</p>
              <p className="text-2xl font-bold text-red-900">{todayStats.unpaid}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres mis à jour */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Tous les statuts</option>
            <option value="SCHEDULED">Programmé</option>
            <option value="COMPLETED">Terminé</option>
            <option value="CANCELLED">Annulé</option>
            <option value="NO_SHOW">Absent</option>
          </select>

          {/* Nouveau filtre pour les paiements */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Tous les paiements</option>
            <option value="paid">Payés</option>
            <option value="unpaid">Non payés</option>
            <option value="pending">En attente</option>
            <option value="failed">Échoués</option>
          </select>
        </div>
      </div>

      {/* Liste des rendez-vous avec statut de paiement */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-200">
          <h2 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5" />
            Rendez-vous du {new Date(selectedDate).toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
            <span className="text-sm font-normal">({filteredAppointments.length})</span>
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rendez-vous</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || statusFilter || paymentFilter
                  ? 'Aucun rendez-vous ne correspond à vos critères de recherche.'
                  : 'Aucun rendez-vous trouvé pour cette date. Planifiez votre premier rendez-vous.'
                }
              </p>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Planifier un rendez-vous
              </button>
            </div>
          ) : (
            filteredAppointments.map((appointment) => {
              const patient = getPatient(appointment.patient_id);
              const doctor = getDoctor(appointment.doctor_id);
              const paymentStatus = getPaymentStatus(appointment.appointmentId);
              
              return (
                <div key={appointment.appointmentId} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Clock className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900 text-lg">
                            {formatTime(appointment.appointmentTime)}
                          </span>
                          <p className="text-sm text-gray-500">
                            {new Date(appointment.appointmentTime).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {patient ? getPatientInitials(patient) : 'XX'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 text-lg">
                            {patient ? `${patient.fullName} ${patient.firstName}` : 'Patient inconnu'}
                          </span>
                          <p className="text-sm text-gray-500">
                            {doctor ? `Dr. ${doctor.fullname}` : 'Médecin non assigné'}
                          </p>
                          {patient?.phone && (
                            <p className="text-xs text-gray-400">{patient.phone}</p>
                          )}
                        </div>
                      </div>

                      {/* Alertes patient */}
                      <div className="flex gap-2">
                        {patient?.allergy && (
                          <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs border border-orange-200 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Allergies
                          </div>
                        )}
                        {patient?.bloodType && (
                          <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs border border-red-200">
                            {patient.bloodType}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Statut du rendez-vous */}
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(appointment.status)}
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(appointment.status)}`}>
                          {getStatusLabel(appointment.status)}
                        </span>
                      </div>

                      {/* Nouveau : Statut de paiement */}
                      <div className="flex items-center space-x-2">
                        {getPaymentIcon(paymentStatus)}
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPaymentBadgeColor(paymentStatus)}`}>
                          {getPaymentLabel(paymentStatus)}
                        </span>
                        {paymentStatus.amount && (
                          <span className="text-xs text-gray-500 ml-1">
                            {paymentStatus.amount.toLocaleString()} FCFA
                          </span>
                        )}
                      </div>

                      {/* Actions rapides */}
                      {appointment.status === 'SCHEDULED' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleStatusChange(appointment, 'COMPLETED')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Marquer comme terminé"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(appointment, 'NO_SHOW')}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Marquer comme absent"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(appointment, 'CANCELLED')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Annuler"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Détails du paiement (si disponible) */}
                  {paymentStatus.paymentMethod && paymentStatus.paymentDate && (
                    <div className="mt-3 pl-16 text-xs text-gray-500">
                      <p>Méthode: {paymentStatus.paymentMethod} • Payé le: {paymentStatus.paymentDate.toLocaleDateString('fr-FR')}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Nouveau Rendez-vous</h2>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient *</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={formData.patient}
                  onChange={(e) => setFormData({...formData, patient: e.target.value})}
                  required
                >
                  <option value="">Sélectionner un patient</option>
                  {patients.map((patient) => (
                    <option key={patient.patientId} value={patient.patientId}>
                      {patient.fullName} {patient.firstName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Médecin *</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={formData.doctor}
                  onChange={(e) => setFormData({...formData, doctor: e.target.value})}
                  required
                >
                  <option value="">Sélectionner un médecin</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.fullname} - {doctor.specialty}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date et heure *</label>
                <input
                  type="datetime-local"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={formData.appointmentTime ? new Date(formData.appointmentTime.getTime() - formData.appointmentTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setFormData({...formData, appointmentTime: new Date(e.target.value)})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="SCHEDULED">Programmé</option>
                  <option value="COMPLETED">Terminé</option>
                  <option value="CANCELLED">Annulé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Notes additionnelles..."
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={appointmentsLoading}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {appointmentsLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};