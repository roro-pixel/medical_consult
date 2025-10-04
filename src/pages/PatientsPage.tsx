import { useState } from 'react';
import { User, Plus, Search, Edit, Trash2, Phone, Mail, Loader2, X, FileText, Stethoscope, ChevronDown, ChevronUp, Droplet, Calendar, MapPin, AlertTriangle, Activity, CreditCard, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { Patient } from '../types/medical';
import { usePatients } from '../hooks/usePatients';
import { useMedicalRecords } from '../hooks/useMedicalRecords';
import { usePayments } from '../hooks/usePayments';
import { toast } from 'react-hot-toast';

export const PatientsPage: React.FC = () => {
  const {
    patients,
    loading: patientsLoading,
    createPatient,
    updatePatient,
    deletePatient,
    calculateAge,
    getPatientStats
  } = usePatients();

  const {
    fetchPatientMedicalRecord,
    loading: recordsLoading
  } = useMedicalRecords();

  const {
    payments,
    loading: paymentsLoading,
    getPayments,
    markAsPaid,
    refundPayment,
    markAsFailed
  } = usePayments();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<'medical' | 'payments' | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<Record<string, any>>({});
  const [patientPayments, setPatientPayments] = useState<Record<string, any[]>>({});
  const [patientBalances, setPatientBalances] = useState<Record<string, any>>({});
  const [loadingRecords, setLoadingRecords] = useState<string | null>(null);
  const [loadingPayments, setLoadingPayments] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  
  const [formData, setFormData] = useState<Partial<Patient>>({
    firstName: '',
    lastName: '',
    fullName: '',
    maidenName: '',
    gender: 'M',
    height: 0,
    weight: 0,
    allergy: '',
    bloodType: '',
    birthDate: new Date(),
    nationality: 'Congolaise',
    address: '',
    phone: '',
    email: '',
    assuranceNumber: ''
  });

  React.useEffect(() => {
    const loadStats = async () => {
      const statsData = await getPatientStats();
      if (statsData) {
        setStats(statsData);
      }
    };
    loadStats();
  }, [getPatientStats]);

  const filteredPatients = patients.filter(patient => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      patient.fullName?.toLowerCase().includes(searchTerm) ||
      patient.firstName?.toLowerCase().includes(searchTerm) ||
      patient.lastName?.toLowerCase().includes(searchTerm) ||
      patient.phone?.toLowerCase().includes(searchTerm) ||
      patient.email?.toLowerCase().includes(searchTerm) ||
      patient.assuranceNumber?.toLowerCase().includes(searchTerm)
    );
  });

  const fetchMedicalRecord = async (patientId: string) => {
    setLoadingRecords(patientId);
    try {
      const record = await fetchPatientMedicalRecord(patientId);
      if (record) {
        setMedicalRecords(prev => ({ ...prev, [patientId]: record }));
      }
    } catch (error) {
      console.error('Error fetching medical record:', error);
      toast.error('Erreur lors du chargement du dossier médical');
    } finally {
      setLoadingRecords(null);
    }
  };

  const fetchPatientPayments = async (patientId: string) => {
    setLoadingPayments(patientId);
    try {
      const allPayments = await getPayments();
      const patientSpecificPayments = allPayments.filter(payment => 
        payment.patient_name && patients.find(p => p.patientId === patientId)?.fullName === payment.patient_name
      );
      
      setPatientPayments(prev => ({ ...prev, [patientId]: patientSpecificPayments }));
      
      const totalPaid = patientSpecificPayments
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
      
      const totalPending = patientSpecificPayments
        .filter(p => p.status === 'PENDING')
        .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
      
      setPatientBalances(prev => ({ 
        ...prev, 
        [patientId]: {
          totalPaid,
          totalPending,
          balance: totalPending,
          lastPaymentDate: patientSpecificPayments
            .filter(p => p.status === 'COMPLETED' && p.paid_at)
            .sort((a, b) => new Date(b.paid_at!).getTime() - new Date(a.paid_at!).getTime())[0]?.paid_at
        }
      }));
    } catch (error) {
      console.error('Error fetching patient payments:', error);
      toast.error('Erreur lors du chargement des paiements');
    } finally {
      setLoadingPayments(null);
    }
  };

  const toggleSection = async (patientId: string, section: 'medical' | 'payments') => {
    if (expandedPatientId === patientId && expandedSection === section) {
      setExpandedPatientId(null);
      setExpandedSection(null);
    } else {
      setExpandedPatientId(patientId);
      setExpandedSection(section);
      
      if (section === 'medical' && !medicalRecords[patientId]) {
        await fetchMedicalRecord(patientId);
      } else if (section === 'payments' && !patientPayments[patientId]) {
        await fetchPatientPayments(patientId);
      }
    }
  };

  const getPatientInitials = (patient: Patient) => {
    return `${patient.firstName?.charAt(0) || ''}${patient.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-700 bg-green-100';
      case 'PENDING':
        return 'text-yellow-700 bg-yellow-100';
      case 'FAILED':
        return 'text-red-700 bg-red-100';
      case 'REFUNDED':
        return 'text-gray-700 bg-gray-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle size={16} />;
      case 'PENDING':
        return <Clock size={16} />;
      case 'FAILED':
        return <XCircle size={16} />;
      case 'REFUNDED':
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const handleMarkAsPaid = async (paymentId: string, patientId: string) => {
    const success = await markAsPaid(paymentId);
    if (success) {
      await fetchPatientPayments(patientId);
    }
  };

  const handleRefund = async (paymentId: string, patientId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir rembourser ce paiement ?')) {
      const success = await refundPayment(paymentId);
      if (success) {
        await fetchPatientPayments(patientId);
      }
    }
  };

  const handleMarkAsFailed = async (paymentId: string, patientId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir marquer ce paiement comme échoué ?')) {
      const success = await markAsFailed(paymentId);
      if (success) {
        await fetchPatientPayments(patientId);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.firstName || !formData.lastName || !formData.gender || !formData.birthDate) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      const fullFormData = {
        ...formData,
        fullName: `${formData.lastName} ${formData.firstName}`.trim(),
        birthDate: formData.birthDate || new Date()
      };

      let success = false;
      if (selectedPatient) {
        const result = await updatePatient(selectedPatient.patientId, fullFormData);
        success = !!result;
      } else {
        const result = await createPatient(fullFormData as Omit<Patient, 'patientId'>);
        success = !!result;
      }

      if (success) {
        setShowAddModal(false);
        resetForm();
        const statsData = await getPatientStats();
        if (statsData) setStats(statsData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      fullName: '',
      maidenName: '',
      gender: 'M',
      height: 0,
      weight: 0,
      allergy: '',
      bloodType: '',
      birthDate: new Date(),
      nationality: 'Congolaise',
      address: '',
      phone: '',
      email: '',
      assuranceNumber: ''
    });
    setSelectedPatient(null);
  };

  const openEditModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData({ ...patient });
    setShowAddModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleDeletePatient = async (patientId: string, patientName: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le patient ${patientName} ?`)) {
      const success = await deletePatient(patientId);
      if (success) {
        const statsData = await getPatientStats();
        if (statsData) setStats(statsData);
      }
    }
  };

  if (patientsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
        <span className="ml-2">Chargement des patients...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* En-tête avec statistiques */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Patients</h1>
            <p className="text-gray-600">{patients.length} patients enregistrés</p>
          </div>
          
          <button
            onClick={openCreateModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Nouveau patient
          </button>
        </div>

        {/* Statistiques rapides */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Total</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total_patients || 0}</p>
                </div>
                <User className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Hommes</p>
                  <p className="text-2xl font-bold text-green-900">{stats.male_patients || 0}</p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-pink-800">Femmes</p>
                  <p className="text-2xl font-bold text-pink-900">{stats.female_patients || 0}</p>
                </div>
                <User className="w-8 h-8 text-pink-600" />
              </div>
            </div>
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-800">Aujourd'hui</p>
                  <p className="text-2xl font-bold text-emerald-900">{stats.today_registered || 0}</p>
                </div>
                <Calendar className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </div>
        )}

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher un patient par nom, téléphone, email..."
            className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Liste des patients */}
      <div className="space-y-4">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">
              {searchQuery ? 'Aucun patient trouvé' : 'Aucun patient enregistré'}
            </p>
            {!searchQuery && (
              <button
                onClick={openCreateModal}
                className="mt-4 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700"
              >
                Ajouter le premier patient
              </button>
            )}
          </div>
        ) : (
          filteredPatients.map(patient => (
            <div key={patient.patientId} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow bg-white">
              {/* En-tête du patient */}
              <div className="p-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 p-3 rounded-full w-14 h-14 flex items-center justify-center">
                    <span className="text-emerald-600 font-semibold text-lg">
                      {getPatientInitials(patient)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-xl text-gray-900">
                        {patient.fullName} {patient.firstName}
                      </h3>
                      {patient.bloodType && (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                          <Droplet size={12} />
                          {patient.bloodType}
                        </span>
                      )}
                      {patient.allergy && (
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                          <AlertTriangle size={12} />
                          Allergies
                        </span>
                      )}
                      {patientBalances[patient.patientId]?.balance > 0 && (
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                          <DollarSign size={12} />
                          Impayé
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {calculateAge(patient.birthDate)} ans
                      </span>
                      <span>{patient.gender === 'M' ? 'Homme' : 'Femme'}</span>
                      {patient.nationality && <span>{patient.nationality}</span>}
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      {patient.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={14} />
                          {patient.phone}
                        </span>
                      )}
                      {patient.email && (
                        <span className="flex items-center gap-1">
                          <Mail size={14} />
                          {patient.email}
                        </span>
                      )}
                      {patient.address && (
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {patient.address.substring(0, 30)}...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(patient)}
                    className="p-3 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit size={20} />
                  </button>
                  
                  <button
                    onClick={() => handleDeletePatient(patient.patientId, patient.fullName)}
                    className="p-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={20} />
                  </button>
                  
                  <button
                    onClick={() => toggleSection(patient.patientId, 'medical')}
                    className={`p-3 rounded-lg transition-colors ${
                      expandedPatientId === patient.patientId && expandedSection === 'medical'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    title="Voir le dossier médical"
                  >
                    <FileText size={20} />
                  </button>

                  <button
                    onClick={() => toggleSection(patient.patientId, 'payments')}
                    className={`p-3 rounded-lg transition-colors ${
                      expandedPatientId === patient.patientId && expandedSection === 'payments'
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'
                    }`}
                    title="Voir les paiements"
                  >
                    <CreditCard size={20} />
                  </button>
                </div>
              </div>
              
              {/* Section dépliable */}
              {expandedPatientId === patient.patientId && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  {/* Dossier médical */}
                  {expandedSection === 'medical' && (
                    <>
                      {loadingRecords === patient.patientId ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="animate-spin text-gray-400" size={24} />
                          <span className="ml-3 text-gray-600">Chargement du dossier médical...</span>
                        </div>
                      ) : medicalRecords[patient.patientId] ? (
                        <div>
                          <div className="flex items-center gap-3 mb-6">
                            <FileText className="text-blue-600" size={24} />
                            <h4 className="font-semibold text-gray-900 text-lg">Dossier Médical</h4>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Médecin traitant</h5>
                              <p className="text-gray-900 font-medium">
                                {medicalRecords[patient.patientId].attendingPhysician || 'Non renseigné'}
                              </p>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Consultations</h5>
                              <p className="text-gray-900 font-medium">
                                {medicalRecords[patient.patientId].consultationCount || 0} consultation(s)
                              </p>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Dossier créé</h5>
                              <p className="text-gray-900 font-medium">
                                {new Date(medicalRecords[patient.patientId].createdAt).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>

                          {medicalRecords[patient.patientId].pastMedicalHistory && (
                            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Antécédents médicaux</h5>
                              <p className="text-gray-900">{medicalRecords[patient.patientId].pastMedicalHistory}</p>
                            </div>
                          )}

                          {medicalRecords[patient.patientId].allergies && (
                            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg shadow-sm mb-4">
                              <h5 className="text-sm font-medium text-orange-800 mb-2 flex items-center gap-2">
                                <AlertTriangle size={16} />
                                Allergies
                              </h5>
                              <p className="text-orange-900">{medicalRecords[patient.patientId].allergies}</p>
                            </div>
                          )}

                          {medicalRecords[patient.patientId].recentConsultations?.length > 0 && (
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <h5 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                <Stethoscope size={16} />
                                Consultations récentes ({medicalRecords[patient.patientId].recentConsultations.length})
                              </h5>
                              <div className="space-y-3 max-h-60 overflow-y-auto">
                                {medicalRecords[patient.patientId].recentConsultations.map((consult: any) => (
                                  <div key={consult.consultationId} className="border-l-4 border-emerald-400 pl-4 py-3 bg-emerald-50 rounded-r-lg">
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <p className="font-medium text-gray-900">
                                          {new Date(consult.consultationDate).toLocaleDateString('fr-FR')}
                                        </p>
                                        <p className="text-sm text-gray-600">{consult.doctorName}</p>
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-1">
                                      <span className="font-medium">Motif:</span> {consult.chiefComplaint}
                                    </p>
                                    {consult.diagnosticName && (
                                      <p className="text-sm text-emerald-700">
                                        <span className="font-medium">Diagnostic:</span> {consult.diagnosticName}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="mx-auto mb-3" size={40} />
                          <p className="text-lg">Aucun dossier médical disponible</p>
                          <p className="text-sm">Le dossier sera créé automatiquement lors de la première consultation</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Historique des paiements */}
                  {expandedSection === 'payments' && (
                    <>
                      {loadingPayments === patient.patientId ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="animate-spin text-gray-400" size={24} />
                          <span className="ml-3 text-gray-600">Chargement des paiements...</span>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-3 mb-6">
                            <CreditCard className="text-emerald-600" size={24} />
                            <h4 className="font-semibold text-gray-900 text-lg">Historique des Paiements</h4>
                          </div>

                          {/* Résumé financier */}
                          {patientBalances[patient.patientId] && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                                <h5 className="text-sm font-medium text-green-800 mb-1">Total payé</h5>
                                <p className="text-2xl font-bold text-green-900">
                                  {patientBalances[patient.patientId].totalPaid?.toLocaleString()} FCFA
                                </p>
                              </div>
                              
                              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                <h5 className="text-sm font-medium text-yellow-800 mb-1">En attente</h5>
                                <p className="text-2xl font-bold text-yellow-900">
                                  {patientBalances[patient.patientId].totalPending?.toLocaleString()} FCFA
                                </p>
                              </div>
                              
                              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                <h5 className="text-sm font-medium text-blue-800 mb-1">Dernier paiement</h5>
                                <p className="text-lg font-medium text-blue-900">
                                  {patientBalances[patient.patientId].lastPaymentDate 
                                    ? new Date(patientBalances[patient.patientId].lastPaymentDate).toLocaleDateString('fr-FR')
                                    : 'Aucun'
                                  }
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Liste des paiements */}
                          {patientPayments[patient.patientId]?.length > 0 ? (
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Consultation
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Montant
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Méthode
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Statut
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Référence
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {patientPayments[patient.patientId].map((payment) => (
                                      <tr key={payment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          {payment.consultation || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                          {parseFloat(payment.amount).toLocaleString()} FCFA
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {payment.payment_method}
                                          </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                                            {getPaymentStatusIcon(payment.status)}
                                            {payment.status}
                                          </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          {payment.reference_number || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          <div className="flex gap-2">
                                            {payment.status === 'PENDING' && (
                                              <button
                                                onClick={() => handleMarkAsPaid(payment.id, patient.patientId)}
                                                className="text-green-600 hover:text-green-800 text-xs font-medium"
                                                disabled={paymentsLoading}
                                              >
                                                Marquer payé
                                              </button>
                                            )}
                                            {payment.status === 'COMPLETED' && (
                                              <button
                                                onClick={() => handleRefund(payment.id, patient.patientId)}
                                                className="text-orange-600 hover:text-orange-800 text-xs font-medium"
                                                disabled={paymentsLoading}
                                              >
                                                Rembourser
                                              </button>
                                            )}
                                            {payment.status === 'PENDING' && (
                                              <button
                                                onClick={() => handleMarkAsFailed(payment.id, patient.patientId)}
                                                className="text-red-600 hover:text-red-800 text-xs font-medium ml-2"
                                                disabled={paymentsLoading}
                                              >
                                                Marquer échoué
                                              </button>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <CreditCard className="mx-auto mb-3" size={40} />
                              <p className="text-lg">Aucun paiement enregistré</p>
                              <p className="text-sm">Les paiements apparaîtront ici après les consultations</p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal d'ajout/modification */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">
                {selectedPatient ? 'Modifier Patient' : 'Nouveau Patient'}
              </h2>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Informations personnelles */}
                <div className="md:col-span-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-600" />
                    Informations personnelles
                  </h3>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Prénom *</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={formData.firstName || ''}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Nom *</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={formData.lastName || ''}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Nom de jeune fille</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={formData.maidenName || ''}
                    onChange={(e) => setFormData({...formData, maidenName: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Genre *</label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={formData.gender || 'M'}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    required
                  >
                    <option value="M">Homme</option>
                    <option value="F">Femme</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Date de naissance *</label>
                  <input
                    type="date"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={formData.birthDate ? formData.birthDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({...formData, birthDate: new Date(e.target.value)})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Nationalité</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={formData.nationality || ''}
                    onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                    placeholder="Ex: Congolaise"
                  />
                </div>
                
                {/* Informations médicales */}
                <div className="md:col-span-3 mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Informations médicales
                  </h3>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Taille (cm)</label>
                  <input
                    type="number"
                    min="0"
                    max="250"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={formData.height || ''}
                    onChange={(e) => setFormData({...formData, height: Number(e.target.value)})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Poids (kg)</label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    step="0.1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={formData.weight || ''}
                    onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Groupe sanguin</label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={formData.bloodType || ''}
                    onChange={(e) => setFormData({...formData, bloodType: e.target.value})}
                  >
                    <option value="">Sélectionner</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                
                <div className="space-y-2 md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Allergies</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={3}
                    value={formData.allergy || ''}
                    onChange={(e) => setFormData({...formData, allergy: e.target.value})}
                    placeholder="Décrivez les allergies connues..."
                  />
                </div>
                
                {/* Informations de contact */}
                <div className="md:col-span-3 mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-green-600" />
                    Informations de contact
                  </h3>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                  <input
                    type="tel"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Ex: 06 123 45 67"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="exemple@email.cg"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Numéro d'assurance</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={formData.assuranceNumber || ''}
                    onChange={(e) => setFormData({...formData, assuranceNumber: e.target.value})}
                    placeholder="Ex: ASS-123456"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Adresse</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={3}
                    value={formData.address || ''}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Adresse complète - Quartier, Ville, Pays"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={patientsLoading}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {patientsLoading && <Loader2 size={16} className="animate-spin" />}
                  {selectedPatient ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};