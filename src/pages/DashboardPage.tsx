import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Stethoscope, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  CheckCircle,
  FileText,
  Activity,
  Loader2,
  Plus,
  ArrowRight
} from 'lucide-react';
import { usePatients } from '../hooks/usePatients';
import { useConsultations } from '../hooks/useConsultations';
import { useAppointments } from '../hooks/useAppointments';
import { usePayments } from '../hooks/usePayments';

interface DashboardStats {
  totalPatients: number;
  consultationsToday: number;
  appointmentsScheduled: number;
  monthlyRevenue: number;
}

interface RecentConsultation {
  id: string;
  patient: string;
  time: string;
  status: string;
  diagnosis: string;
}

interface UpcomingAppointment {
  id: string;
  patient: string;
  time: string;
  motif: string;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentConsultations, setRecentConsultations] = useState<RecentConsultation[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Hooks pour les données
  const { getPatientStats } = usePatients();
  const { getTodayConsultations, getConsultationStats } = useConsultations();
  const { getUpcomingAppointments: fetchUpcomingAppointments } = useAppointments();
  const { getPaymentStats } = usePayments();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        patientStats,
        consultationStats,
        todayConsultations,
        upcomingAppts,
        paymentStats
      ] = await Promise.all([
        getPatientStats(),
        getConsultationStats(),
        getTodayConsultations(),
        fetchUpcomingAppointments(),
        getPaymentStats()
      ]);

      const monthlyRevenue = paymentStats?.total_revenue || 0;

      setStats({
        totalPatients: patientStats?.total_patients || 0,
        consultationsToday: todayConsultations?.length || 0,
        appointmentsScheduled: upcomingAppts?.length || 0,
        monthlyRevenue: monthlyRevenue
      });

      const recentConsultationsData = todayConsultations?.slice(0, 5).map((consultation: any) => ({
        id: consultation.consultationId,
        patient: consultation.patientName || 'Patient inconnu',
        time: new Date(consultation.consultationDate).toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        status: getConsultationStatus(consultation.status),
        diagnosis: consultation.diagnosticName || consultation.chiefComplaint || 'Diagnostic en cours'
      })) || [];

      setRecentConsultations(recentConsultationsData);

      const upcomingAppointmentsData = upcomingAppts?.slice(0, 5).map((appointment: any) => ({
        id: appointment.appointmentId,
        patient: appointment.patientName || 'Patient inconnu',
        time: new Date(appointment.appointmentTime).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        }),
        motif: appointment.notes || 'Consultation générale'
      })) || [];

      setUpcomingAppointments(upcomingAppointmentsData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        totalPatients: 0,
        consultationsToday: 0,
        appointmentsScheduled: 0,
        monthlyRevenue: 0
      });
      setRecentConsultations([]);
      setUpcomingAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const getConsultationStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'terminé':
      case 'termine':
        return 'Terminé';
      case 'in_progress':
      case 'en_cours':
      case 'en cours':
        return 'En cours';
      case 'scheduled':
      case 'programmé':
      case 'programme':
        return 'En attente';
      default:
        return 'En attente';
    }
  };

  const handleNavigateToConsultations = () => {
    navigate('/consultation');
  };

  const handleNavigateToAppointments = () => {
    navigate('/rendez-vous');
  };

  const handleNavigateToPatients = () => {
    navigate('/patients');
  };

  const handleNavigateToPrescriptions = () => {
    navigate('/ordonnances');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'consultation':
        navigate('/consultation');
        break;
      case 'appointment':
        navigate('/rendez-vous');
        break;
      case 'patient':
        navigate('/patients');
        break;
      case 'report':
        // la génération de rapport à avenir
        console.log('Générer rapport - à implémenter');
        break;
      default:
        break;
    }
  };

  const today = new Date().toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Terminé':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'En cours':
        return <Activity className="w-4 h-4 text-blue-600" />;
      case 'En attente':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="ml-2 text-gray-600">Chargement du tableau de bord...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Bienvenue sur SNI Health</h1>
            <p className="text-emerald-100">Nous sommes le {today}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">Tableau de Bord</p>
            <p className="text-emerald-100 text-sm">Gestion Médicale</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={handleNavigateToPatients}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Patients Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalPatients || 0}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium text-green-600">+0%</span>
                <span className="text-sm text-gray-500 ml-1">vs mois dernier</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={handleNavigateToConsultations}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Consultations Aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.consultationsToday || 0}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium text-green-600">+0%</span>
                <span className="text-sm text-gray-500 ml-1">vs hier</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-emerald-100 text-emerald-600">
              <Stethoscope className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={handleNavigateToAppointments}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rendez-vous Programmés</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.appointmentsScheduled || 0}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium text-green-600">+0%</span>
                <span className="text-sm text-gray-500 ml-1">vs semaine dernière</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-100 text-orange-600">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenus du Mois</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.monthlyRevenue?.toLocaleString() || 0} FCFA</p>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium text-green-600">+0%</span>
                <span className="text-sm text-gray-500 ml-1">vs mois dernier</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Consultations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Consultations Récentes</h2>
          </div>
          <div className="p-6">
            {recentConsultations.length === 0 ? (
              <div className="text-center py-8">
                <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucune consultation récente</p>
                <p className="text-sm text-gray-400">Les consultations apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentConsultations.map((consultation) => (
                  <div key={consultation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(consultation.status)}
                      <div>
                        <p className="font-medium text-gray-900">{consultation.patient}</p>
                        <p className="text-sm text-gray-600">{consultation.diagnosis}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{consultation.time}</p>
                      <p className="text-xs text-gray-500">{consultation.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button 
              onClick={handleNavigateToConsultations}
              className="w-full mt-4 px-4 py-2 text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
            >
              Voir toutes les consultations
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Prochains Rendez-vous</h2>
          </div>
          <div className="p-6">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun rendez-vous programmé</p>
                <p className="text-sm text-gray-400">Les rendez-vous apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{appointment.patient}</p>
                        <p className="text-sm text-gray-600">{appointment.motif}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600">{appointment.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button 
              onClick={handleNavigateToAppointments}
              className="w-full mt-4 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              Voir tous les rendez-vous
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => handleQuickAction('consultation')}
            className="flex items-center justify-center p-4 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors group"
          >
            <Stethoscope className="w-5 h-5 mr-2" />
            Nouvelle Consultation
            <Plus className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button 
            onClick={() => handleQuickAction('appointment')}
            className="flex items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors group"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Planifier RDV
            <Plus className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button 
            onClick={() => handleQuickAction('patient')}
            className="flex items-center justify-center p-4 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors group"
          >
            <Users className="w-5 h-5 mr-2" />
            Ajouter Patient
            <Plus className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button 
            onClick={() => handleQuickAction('report')}
            className="flex items-center justify-center p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors group"
          >
            <FileText className="w-5 h-5 mr-2" />
            Générer Rapport
            <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Activité Récente</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune activité récente</p>
            <p className="text-sm text-gray-400">L'activité du système apparaîtra ici</p>
          </div>
        </div>
      </div>
    </div>
  );
};