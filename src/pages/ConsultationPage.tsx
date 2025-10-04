import { useState, useEffect } from 'react';
import type { Patient, Diagnostic } from '../types/medical';
import { useConsultations } from '../hooks/useConsultations';
import { useDiagnostics } from '../hooks/useDiagnostics';
import { useDoctors } from '../hooks/useDoctors';
import { usePayments } from '../hooks/usePayments';
import { PatientSearch } from '../components/Patient/PatientSearch';
import { toast } from 'react-hot-toast';
import { 
  Save, RotateCcw, FileText, UserX, Building2, Skull, 
  Clock, Calendar, User, Stethoscope, Plus, X, Loader2, AlertTriangle,
  Activity, Heart, Euro, CreditCard, CheckCircle, XCircle,
  TrendingUp
} from 'lucide-react';

interface ConsultationFromApi {
  id: number;
  consultationId: string;
  consultationDate: Date;
  observation: string;
  symptoms: string;
  recommendedSteps: string;
  chiefComplaint: string;
  patientName?: string;
  doctorName?: string;
  patient?: string;
  doctor?: string;
  status: string;
}

interface PaymentFromApi {
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
  paymentId?: string;
  consultationId?: string;
  paymentMethod?: string;
  createdAt?: Date;
}

interface PaymentData {
  amount: string;
  method: "cash" | "card" | "insurance";
  reference: string;
}

export const ConsultationPage: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>();
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  
  const {
    loading: consultationLoading,
    createConsultation,
    getConsultationStats,
    consultations
  } = useConsultations();

  const {
    diagnostics,
    loading: diagnosticsLoading,
    createDiagnostic
  } = useDiagnostics();

  const {
    doctors,
    loading: doctorsLoading
  } = useDoctors();

  const {
    payments,
    loading: paymentsLoading,
    createPayment,
    getPayments
  } = usePayments();

  const [selectedDiagnostics, setSelectedDiagnostics] = useState<Diagnostic[]>([]);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [diagnosticSearch, setDiagnosticSearch] = useState('');
  const [newDiagnostic, setNewDiagnostic] = useState({ 
    name: '', 
    description: ''
  });

  const [todayStats, setTodayStats] = useState<{
    today_consultations?: number;
    total_consultations?: number;
  } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedConsultationForPayment, setSelectedConsultationForPayment] = useState<ConsultationFromApi | null>(null);
  const [showConsultationsList, setShowConsultationsList] = useState(false);
  const [consultationFilter, setConsultationFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: '25000',
    method: "cash",
    reference: `CONS-${Date.now().toString().slice(-6)}`
  });

  const [consultationData, setConsultationData] = useState({
    chiefComplaint: '',
    symptoms: '',
    observation: '',
    recommendedSteps: '',
    status: 'COMPLETED'
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadTodayStats = async () => {
      const stats = await getConsultationStats();
      if (stats) {
        setTodayStats(stats);
      }
    };
    loadTodayStats();
  }, [getConsultationStats]);

  useEffect(() => {
    getPayments();
  }, [getPayments]);

  const getFilteredConsultations = () => {
    const consultationsList = consultations as unknown as ConsultationFromApi[];
    
    switch (consultationFilter) {
      case 'paid':
        return consultationsList.filter(consultation => 
          (payments as PaymentFromApi[]).some(payment => 
            (payment.consultation_id || payment.consultationId) === consultation.consultationId && 
            payment.status === 'COMPLETED'
          )
        );
      case 'unpaid':
        return consultationsList.filter(consultation => 
          !(payments as PaymentFromApi[]).some(payment => 
            (payment.consultation_id || payment.consultationId) === consultation.consultationId && 
            payment.status === 'COMPLETED'
          )
        );
      default:
        return consultationsList;
    }
  };

  const isConsultationPaid = (consultationId: string): boolean => {
    return (payments as PaymentFromApi[]).some(payment => 
      (payment.consultation_id || payment.consultationId) === consultationId && 
      payment.status === 'COMPLETED'
    );
  };

  const getConsultationPaymentAmount = (consultationId: string): string => {
    const payment = (payments as PaymentFromApi[]).find(payment => 
      (payment.consultation_id || payment.consultationId) === consultationId && 
      payment.status === 'COMPLETED'
    );
    return payment?.amount || '0';
  };

  const getFinancialStats = () => {
    const allPayments = payments as PaymentFromApi[];
    const today = new Date().toISOString().split('T')[0];
    
    const todayPayments = allPayments.filter(payment => {
      const paymentDate = new Date(payment.created_at || payment.createdAt || '').toISOString().split('T')[0];
      return paymentDate === today && payment.status === 'COMPLETED';
    });

    const todayRevenue = todayPayments.reduce((sum, payment) => sum + parseFloat(payment.amount || '0'), 0);
    const unpaidConsultations = getFilteredConsultations().filter(consultation => !isConsultationPaid(consultation.consultationId));

    return {
      todayRevenue,
      todayPayments: todayPayments.length,
      unpaidCount: unpaidConsultations.length,
      totalRevenue: allPayments
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, payment) => sum + parseFloat(payment.amount || '0'), 0)
    };
  };

  const handleSave = async () => {
    if (!selectedPatient) {
      toast.error('Veuillez sélectionner un patient');
      return;
    }

    if (!selectedDoctor) {
      toast.error('Veuillez sélectionner un médecin');
      return;
    }

    if (!consultationData.observation?.trim()) {
      toast.error('Veuillez saisir au moins une observation');
      return;
    }

    if (!consultationData.chiefComplaint?.trim()) {
      toast.error('Veuillez saisir le motif de consultation');
      return;
    }

    const fullConsultationData = {
      consultationDate: new Date(),
      doctor: selectedDoctor,
      patient: selectedPatient.patientId,
      chiefComplaint: consultationData.chiefComplaint,
      symptoms: consultationData.symptoms,
      observation: consultationData.observation,
      diagnostic: selectedDiagnostics.length > 0 ? selectedDiagnostics[0].id.toString() : '',
      recommendedSteps: consultationData.recommendedSteps,
      status: consultationData.status
    };

    const result = await createConsultation(fullConsultationData);
    if (result) {
      toast.success('Consultation enregistrée avec succès');
      
      // Proposer le paiement directement
      if (window.confirm('Consultation enregistrée ! Voulez-vous procéder au paiement maintenant ?')) {
        setSelectedConsultationForPayment(result as unknown as ConsultationFromApi);
        setShowPaymentModal(true);
      }
      
      handleReset();
      // Recharger les stats
      const stats = await getConsultationStats();
      if (stats) setTodayStats(stats);
    }
  };

  const handlePayment = async () => {
    if (!selectedConsultationForPayment) return;

    try {
      await createPayment({
        consultation: selectedConsultationForPayment.consultationId,
        amount: paymentData.amount,
        payment_method: paymentData.method,
        status: "COMPLETED",
        reference_number: paymentData.reference
      });
      
      toast.success(`Paiement de ${paymentData.amount} XAF enregistré avec succès`);
      setShowPaymentModal(false);
      setSelectedConsultationForPayment(null);
      
      await getPayments();
      
      setPaymentData({
        ...paymentData,
        reference: `CONS-${Date.now().toString().slice(-6)}`
      });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors du paiement');
    }
  };

  const openPaymentModal = (consultation: ConsultationFromApi) => {
    setSelectedConsultationForPayment(consultation);
    setPaymentData({
      amount: '25000', 
      method: "cash",
      reference: `CONS-${Date.now().toString().slice(-6)}`
    });
    setShowPaymentModal(true);
  };

  const handleReset = () => {
    if (window.confirm('Êtes-vous sûr de vouloir remettre la consultation à zéro ?')) {
      setConsultationData({
        chiefComplaint: '',
        symptoms: '',
        observation: '',
        recommendedSteps: '',
        status: 'COMPLETED'
      });
      setSelectedDiagnostics([]);
      setSelectedDoctor('');
      toast.success('Consultation remise à zéro');
    }
  };

  const handleGenerateBon = () => {
    if (!selectedPatient) {
      toast.error('Veuillez sélectionner un patient');
      return;
    }
    toast.success('Bon de consultation généré !');
    //  la génération PDF à avenir
  };

  const handleEndConsultation = () => {
    if (window.confirm('Terminer cette consultation ?')) {
      toast.success('Consultation terminée');
      setSelectedPatient(undefined);
      handleReset();
    }
  };

  const handleHospitalization = () => {
    if (!selectedPatient) {
      toast.error('Veuillez sélectionner un patient');
      return;
    }
    
    if (window.confirm(`Demander l'hospitalisation pour ${selectedPatient.fullName} ?`)) {
      toast.success('Demande d\'hospitalisation initiée');
    }
  };

  const handleDeclarerDeces = () => {
    if (!selectedPatient) {
      toast.error('Veuillez sélectionner un patient');
      return;
    }
    
    if (window.confirm(`⚠️ ATTENTION ⚠️\n\nDéclarer le décès de ${selectedPatient.fullName} ?\n\nCette action est irréversible et aura des conséquences importantes.`)) {
      toast.error('Déclaration de décès initiée');
    }
  };

  const addDiagnostic = (diagnostic: Diagnostic) => {
    if (!selectedDiagnostics.find(d => d.id === diagnostic.id)) {
      setSelectedDiagnostics(prev => [...prev, diagnostic]);
      setShowDiagnosticModal(false);
      setDiagnosticSearch('');
    }
  };

  const removeDiagnostic = (diagnosticId: number) => {
    setSelectedDiagnostics(prev => prev.filter(d => d.id !== diagnosticId));
  };

  const handleCreateNewDiagnostic = async () => {
    if (!newDiagnostic.name.trim()) {
      toast.error('Le nom du diagnostic est requis');
      return;
    }

    const result = await createDiagnostic(newDiagnostic);
    if (result) {
      addDiagnostic(result);
      setNewDiagnostic({ name: '', description: '' });
      toast.success('Diagnostic créé et ajouté');
    }
  };

  const filteredDiagnostics = diagnosticSearch.length > 1 
    ? diagnostics.filter(d => 
        d.name.toLowerCase().includes(diagnosticSearch.toLowerCase()) ||
        d.description?.toLowerCase().includes(diagnosticSearch.toLowerCase())
      )
    : diagnostics.slice(0, 10);

  const formatTime = () => {
    return currentTime.toLocaleTimeString('fr-FR', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPatientInitials = (patient: Patient) => {
    return `${patient.firstName?.charAt(0) || ''}${patient.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (doctorsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
        <span className="ml-2">Chargement...</span>
      </div>
    );
  }

  const financialStats = getFinancialStats();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* En-tête avec statistiques financières */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Consultation Médicale</h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
              <Clock className="w-4 h-4 ml-4" />
              {formatTime()}
            </p>
          </div>

          {/* Statistiques rapides avec finances */}
          <div className="flex gap-4">
            {todayStats && (
              <>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-emerald-800">Aujourd'hui</p>
                  <p className="text-xl font-bold text-emerald-900">{todayStats.today_consultations || 0}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-blue-800">Total</p>
                  <p className="text-xl font-bold text-blue-900">{todayStats.total_consultations || 0}</p>
                </div>
              </>
            )}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-green-800">Revenus jour</p>
              <p className="text-xl font-bold text-green-900">{financialStats.todayRevenue.toLocaleString()} XAF</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-orange-800">Impayés</p>
              <p className="text-xl font-bold text-orange-900">{financialStats.unpaidCount}</p>
            </div>
          </div>
        </div>

        {/* Bouton pour voir les consultations */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowConsultationsList(!showConsultationsList)}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <FileText className="w-4 h-4" />
            {showConsultationsList ? 'Masquer' : 'Voir'} les consultations et paiements
            <TrendingUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Liste des consultations avec statut de paiement */}
      {showConsultationsList && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Consultations récentes</h2>
            <div className="flex gap-2">
              <select
                value={consultationFilter}
                onChange={(e) => setConsultationFilter(e.target.value as 'all' | 'paid' | 'unpaid')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                aria-label="Filtrer les consultations"
              >
                <option value="all">Toutes</option>
                <option value="paid">Payées</option>
                <option value="unpaid">Impayées</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {getFilteredConsultations().slice(0, 10).map((consultation) => {
              const isPaid = isConsultationPaid(consultation.consultationId);
              const paidAmount = getConsultationPaymentAmount(consultation.consultationId);

              return (
                <div key={consultation.consultationId} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-gray-900">
                          {consultation.patientName || 'Patient inconnu'}
                        </span>
                        <span className="text-sm text-gray-500">
                          Dr. {consultation.doctorName || 'Médecin inconnu'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(consultation.consultationDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{consultation.chiefComplaint}</p>
                      
                      {/* Statut de paiement */}
                      <div className="flex items-center gap-2">
                        {isPaid ? (
                          <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs border border-green-200">
                            <CheckCircle className="w-3 h-3" />
                            Payé - {paidAmount} XAF
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-full text-xs border border-orange-200">
                            <XCircle className="w-3 h-3" />
                            Impayé
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isPaid && (
                        <button
                          onClick={() => openPaymentModal(consultation)}
                          className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg text-sm transition-colors"
                        >
                          <Euro className="w-4 h-4" />
                          Payer
                        </button>
                      )}
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">25,000 XAF</div>
                        <div className="text-xs text-gray-500">Coût consultation</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {getFilteredConsultations().length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Aucune consultation trouvée</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sélection médecin */}
      {!selectedDoctor && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-yellow-600" />
            <h3 className="font-medium text-yellow-800">Sélectionner le médecin</h3>
          </div>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            aria-label="Sélectionner un médecin"
          >
            <option value="">Choisir un médecin...</option>
            {doctors.map(doctor => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.fullname} - {doctor.specialty}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedDoctor && (
        <>
          {/* Recherche Patient */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PatientSearch
                selectedPatient={selectedPatient}
                onPatientSelect={setSelectedPatient}
              />
            </div>
            
            {selectedPatient && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Informations Importantes
                </h3>
                
                {/* Informations vitales du patient */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 font-semibold text-sm">
                        {getPatientInitials(selectedPatient)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-emerald-900">{selectedPatient.fullName}</p>
                      <p className="text-sm text-emerald-700">Patient sélectionné</p>
                    </div>
                  </div>

                  {selectedPatient.allergy && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-orange-800 font-medium flex items-center gap-1 mb-1">
                        <AlertTriangle size={14} />
                        Allergies:
                      </p>
                      <p className="text-orange-700 text-sm">{selectedPatient.allergy}</p>
                    </div>
                  )}
                  
                  {selectedPatient.bloodType && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 font-medium flex items-center gap-1">
                        <Heart size={14} />
                        Groupe sanguin: {selectedPatient.bloodType}
                      </p>
                    </div>
                  )}
                  
                  {(selectedPatient.height > 0 || selectedPatient.weight > 0) && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800 font-medium flex items-center gap-1 mb-1">
                        <Activity size={14} />
                        Mesures:
                      </p>
                      <div className="text-blue-700 text-sm">
                        {selectedPatient.height > 0 && <span>Taille: {selectedPatient.height} cm</span>}
                        {selectedPatient.height > 0 && selectedPatient.weight > 0 && <span> • </span>}
                        {selectedPatient.weight > 0 && <span>Poids: {selectedPatient.weight} kg</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {selectedPatient && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Formulaire de consultation */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-medium text-gray-900 mb-6 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-emerald-600" />
                  Nouvelle Consultation
                </h3>

                <div className="space-y-6">
                  {/* Motif de consultation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motif de consultation *
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      rows={3}
                      value={consultationData.chiefComplaint}
                      onChange={(e) => setConsultationData({...consultationData, chiefComplaint: e.target.value})}
                      placeholder="Décrivez le motif de la consultation..."
                      required
                    />
                  </div>

                  {/* Symptômes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Symptômes observés
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      rows={4}
                      value={consultationData.symptoms}
                      onChange={(e) => setConsultationData({...consultationData, symptoms: e.target.value})}
                      placeholder="Décrivez les symptômes observés..."
                    />
                  </div>

                  {/* Observations */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observations médicales *
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      rows={5}
                      value={consultationData.observation}
                      onChange={(e) => setConsultationData({...consultationData, observation: e.target.value})}
                      placeholder="Saisissez vos observations médicales..."
                      required
                    />
                  </div>

                  {/* Recommandations */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recommandations et étapes suivantes
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      rows={4}
                      value={consultationData.recommendedSteps}
                      onChange={(e) => setConsultationData({...consultationData, recommendedSteps: e.target.value})}
                      placeholder="Recommandations pour le patient..."
                    />
                  </div>

                  {/* Statut */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statut de la consultation
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      value={consultationData.status}
                      onChange={(e) => setConsultationData({...consultationData, status: e.target.value})}
                      aria-label="Statut de la consultation"
                    >
                      <option value="COMPLETED">Terminée</option>
                      <option value="SCHEDULED">Programmée</option>
                      <option value="CANCELLED">Annulée</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Panel des actions et diagnostics */}
              <div className="space-y-6">
                {/* Diagnostics */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-900">Diagnostics</h3>
                    <button
                      onClick={() => setShowDiagnosticModal(true)}
                      className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-emerald-700 flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Ajouter
                    </button>
                  </div>

                  <div className="space-y-2">
                    {selectedDiagnostics.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">Aucun diagnostic sélectionné</p>
                    ) : (
                      selectedDiagnostics.map((diagnostic) => (
                        <div key={diagnostic.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{diagnostic.name}</p>
                            {diagnostic.description && (
                              <p className="text-xs text-gray-600 mt-1">{diagnostic.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeDiagnostic(diagnostic.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Actions de consultation */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleSave}
                      disabled={consultationLoading || !selectedPatient || !consultationData.observation.trim() || !consultationData.chiefComplaint.trim()}
                      className="w-full bg-emerald-600 text-white px-4 py-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                    >
                      {consultationLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Enregistrer consultation
                    </button>

                    <button
                      onClick={handleReset}
                      className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2 transition-colors"
                    >
                      <RotateCcw size={16} />
                      Réinitialiser
                    </button>

                    <div className="border-t pt-3 mt-3">
                      <p className="text-sm text-gray-600 mb-3">Actions rapides</p>
                      
                      <button
                        onClick={handleGenerateBon}
                        disabled={!selectedPatient}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 mb-2 transition-colors"
                      >
                        <FileText size={16} />
                        Bon de consultation
                      </button>

                      <button
                        onClick={handleEndConsultation}
                        className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2 mb-2 transition-colors"
                      >
                        <UserX size={16} />
                        Terminer consultation
                      </button>

                      <button
                        onClick={handleHospitalization}
                        disabled={!selectedPatient}
                        className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 mb-2 transition-colors"
                      >
                        <Building2 size={16} />
                        Demander hospitalisation
                      </button>

                      <button
                        onClick={handleDeclarerDeces}
                        disabled={!selectedPatient}
                        className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                      >
                        <Skull size={16} />
                        Déclarer décès
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de sélection de diagnostic */}
      {showDiagnosticModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Ajouter un diagnostic</h2>
              <button 
                onClick={() => setShowDiagnosticModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Fermer la modal"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Recherche de diagnostic */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Rechercher un diagnostic..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={diagnosticSearch}
                  onChange={(e) => setDiagnosticSearch(e.target.value)}
                />
              </div>

              {/* Liste des diagnostics */}
              <div className="mb-6 max-h-60 overflow-y-auto">
                {diagnosticsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-emerald-600" size={24} />
                    <span className="ml-2">Chargement des diagnostics...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredDiagnostics.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Aucun diagnostic trouvé</p>
                    ) : (
                      filteredDiagnostics.map((diagnostic) => (
                        <button
                          key={diagnostic.id}
                          onClick={() => addDiagnostic(diagnostic)}
                          className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
                        >
                          <p className="font-medium">{diagnostic.name}</p>
                          {diagnostic.description && (
                            <p className="text-sm text-gray-600 mt-1">{diagnostic.description}</p>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Créer nouveau diagnostic */}
              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Créer un nouveau diagnostic</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nom du diagnostic *"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={newDiagnostic.name}
                    onChange={(e) => setNewDiagnostic({...newDiagnostic, name: e.target.value})}
                  />
                  <textarea
                    placeholder="Description (optionnel)"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={3}
                    value={newDiagnostic.description}
                    onChange={(e) => setNewDiagnostic({...newDiagnostic, description: e.target.value})}
                  />
                  <button
                    onClick={handleCreateNewDiagnostic}
                    disabled={!newDiagnostic.name.trim() || diagnosticsLoading}
                    className="w-full bg-emerald-600 text-white px-4 py-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {diagnosticsLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    Créer et ajouter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de paiement */}
      {showPaymentModal && selectedConsultationForPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Euro className="w-5 h-5 text-emerald-600" />
                Paiement Consultation
              </h2>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700 p-1"
                aria-label="Fermer la modal de paiement"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Informations consultation */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Détails de la consultation</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Patient:</span> {selectedConsultationForPayment.patientName || 'N/A'}</p>
                  <p><span className="font-medium">Médecin:</span> Dr. {selectedConsultationForPayment.doctorName || 'N/A'}</p>
                  <p><span className="font-medium">Date:</span> {new Date(selectedConsultationForPayment.consultationDate).toLocaleDateString('fr-FR')}</p>
                  <p><span className="font-medium">Motif:</span> {selectedConsultationForPayment.chiefComplaint}</p>
                </div>
              </div>

              {/* Formulaire de paiement */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Montant (XAF) *</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                    placeholder="25000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mode de paiement *</label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={paymentData.method}
                    onChange={(e) => setPaymentData({...paymentData, method: e.target.value as "cash" | "card" | "insurance"})}
                    aria-label="Mode de paiement"
                  >
                    <option value="cash">Espèces</option>
                    <option value="card">Carte Bancaire</option>
                    <option value="insurance">Assurance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Référence</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={paymentData.reference}
                    onChange={(e) => setPaymentData({...paymentData, reference: e.target.value})}
                    placeholder="CONS-123456"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handlePayment}
                  disabled={paymentsLoading || !paymentData.amount}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {paymentsLoading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                  Confirmer le paiement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};