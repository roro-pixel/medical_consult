import { useState, useEffect } from 'react';
import { Activity, Plus, Search, Calendar, User, FileText, Download, Eye, Clock, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Examen {
  id: string;
  patientNom: string;
  patientPrenom: string;
  typeExamen: string;
  date: string;
  statut: 'Programmé' | 'En cours' | 'Terminé' | 'Annulé';
  resultats?: string;
  medecin: string;
  laboratoire?: string;
  urgence: boolean;
}

const typesExamens = [
  'Audiométrie',
  'Tympanométrie',
  'Endoscopie nasale',
  'Scanner des sinus',
  'IRM cérébrale',
  'Radiographie cervicale',
  'Biopsie',
  'Test allergologique',
  'Vidéonystagmographie',
  'Potentiels évoqués auditifs'
];

export const ExamensPage: React.FC = () => {
  const [examens, setExamens] = useState<Examen[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedExamen, setSelectedExamen] = useState<Examen | null>(null);

  useEffect(() => {
    fetchExamens();
  }, []);

  const fetchExamens = async () => {
    setLoading(true);
    try {
      // TODO: Remplacer par l'appel API réel
      // const response = await api.get('/examens');
      // setExamens(response.data);
      
      // En attente de l'API
      setExamens([]);
    } catch (error) {
      toast.error('Erreur lors du chargement des examens');
      console.error('Error fetching examens:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExamens = examens.filter(examen => {
    const matchesSearch = `${examen.patientNom} ${examen.patientPrenom}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || examen.statut === statusFilter;
    const matchesType = !typeFilter || examen.typeExamen === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'Programmé':
        return 'bg-blue-100 text-blue-800';
      case 'En cours':
        return 'bg-yellow-100 text-yellow-800';
      case 'Terminé':
        return 'bg-green-100 text-green-800';
      case 'Annulé':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'Programmé':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'En cours':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'Terminé':
        return <Activity className="w-4 h-4 text-green-600" />;
      case 'Annulé':
        return <Activity className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleAddExamen = () => {
    toast.success('Nouvel examen programmé');
  };

  const handleViewExamen = (examen: Examen) => {
    setSelectedExamen(examen);
  };

  const handleDownloadResults = async (examen: Examen) => {
    try {
      // TODO: Appel API pour télécharger les résultats
      // await api.get(`/examens/${examen.id}/results`);
      toast.success(`Téléchargement des résultats pour ${examen.patientNom} ${examen.patientPrenom}`);
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleStatusChange = async (id: string, newStatus: Examen['statut']) => {
    try {
      // TODO: Appel API pour mettre à jour le statut
      // await api.patch(`/examens/${id}`, { statut: newStatus });
      
      setExamens(prev => prev.map(examen => 
        examen.id === id ? { ...examen, statut: newStatus } : examen
      ));
      toast.success('Statut mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="ml-2 text-gray-600">Chargement des examens...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Examens</h1>
            <p className="text-gray-600">Planifiez et suivez les examens médicaux</p>
          </div>
          <button
            onClick={handleAddExamen}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvel Examen
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Tous les statuts</option>
            <option value="Programmé">Programmé</option>
            <option value="En cours">En cours</option>
            <option value="Terminé">Terminé</option>
            <option value="Annulé">Annulé</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Tous les types</option>
            {typesExamens.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <input
            type="date"
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Examens</p>
              <p className="text-2xl font-bold text-gray-900">{examens.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Programmés</p>
              <p className="text-2xl font-bold text-gray-900">
                {examens.filter(ex => ex.statut === 'Programmé').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En cours</p>
              <p className="text-2xl font-bold text-gray-900">
                {examens.filter(ex => ex.statut === 'En cours').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Terminés</p>
              <p className="text-2xl font-bold text-gray-900">
                {examens.filter(ex => ex.statut === 'Terminé').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Empty State or Examens List */}
      {examens.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun examen trouvé</h3>
            <p className="text-gray-500 mb-6">
              Commencez par programmer votre premier examen médical.
            </p>
            <button
              onClick={handleAddExamen}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Programmer un examen
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-200">
            <h2 className="text-lg font-semibold text-emerald-900">Liste des Examens</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Patient</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type d'Examen</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Laboratoire</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Statut</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Urgence</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredExamens.map((examen, index) => (
                  <tr key={examen.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {examen.patientNom} {examen.patientPrenom}
                          </p>
                          <p className="text-sm text-gray-500">{examen.medecin}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{examen.typeExamen}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(examen.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {examen.laboratoire || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {getStatusIcon(examen.statut)}
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(examen.statut)}`}>
                          {examen.statut}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {examen.urgence && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                          Urgent
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewExamen(examen)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {examen.statut === 'Terminé' && (
                          <button
                            onClick={() => handleDownloadResults(examen)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Télécharger résultats"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <select
                          value={examen.statut}
                          onChange={(e) => handleStatusChange(examen.id, e.target.value as Examen['statut'])}
                          className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="Programmé">Programmé</option>
                          <option value="En cours">En cours</option>
                          <option value="Terminé">Terminé</option>
                          <option value="Annulé">Annulé</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Examen Detail Modal */}
      {selectedExamen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Détail de l'Examen</h3>
              <button
                onClick={() => setSelectedExamen(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Patient</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedExamen.patientNom} {selectedExamen.patientPrenom}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type d'Examen</label>
                  <p className="text-lg text-gray-900">{selectedExamen.typeExamen}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="text-lg text-gray-900">
                    {new Date(selectedExamen.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Laboratoire</label>
                  <p className="text-lg text-gray-900">{selectedExamen.laboratoire || 'Non spécifié'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Médecin Prescripteur</label>
                <p className="text-lg text-gray-900">{selectedExamen.medecin}</p>
              </div>

              {selectedExamen.resultats && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Résultats</label>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-gray-900">{selectedExamen.resultats}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedExamen.statut)}`}>
                    {selectedExamen.statut}
                  </span>
                  {selectedExamen.urgence && (
                    <span className="inline-flex px-3 py-1 text-sm font-semibold bg-red-100 text-red-800 rounded-full">
                      Urgent
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedExamen(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
              {selectedExamen.statut === 'Terminé' && (
                <button
                  onClick={() => handleDownloadResults(selectedExamen)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Télécharger Résultats
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};