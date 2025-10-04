import { useState, useEffect } from 'react';
import { Pill, Plus, Search, Package, AlertTriangle, TrendingDown, TrendingUp, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Medicament {
  id: string;
  nom: string;
  dosage: string;
  forme: string;
  laboratoire: string;
  stockActuel: number;
  stockMinimum: number;
  prixUnitaire: number;
  dateExpiration: string;
  indication: string;
  contrindications: string;
  effetsSecondaires: string;
  statut: 'Disponible' | 'Stock faible' | 'Rupture' | 'Expiré';
}

const formesMedicaments = [
  'Comprimé',
  'Gélule',
  'Sirop',
  'Solution',
  'Pommade',
  'Gouttes',
  'Spray',
  'Injection'
];

export const MedicamentsPage: React.FC = () => {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formeFilter, setFormeFilter] = useState('');
  const [selectedMedicament, setSelectedMedicament] = useState<Medicament | null>(null);

  useEffect(() => {
    fetchMedicaments();
  }, []);

  const fetchMedicaments = async () => {
    setLoading(true);
    try {
      // TODO: Remplacer par l'appel API réel
      // const response = await api.get('/medicaments');
      // setMedicaments(response.data);
      
      // En attente de l'API
      setMedicaments([]);
    } catch (error) {
      toast.error('Erreur lors du chargement des médicaments');
      console.error('Error fetching medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicaments = medicaments.filter(med => {
    const matchesSearch = med.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         med.laboratoire.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || med.statut === statusFilter;
    const matchesForme = !formeFilter || med.forme === formeFilter;
    return matchesSearch && matchesStatus && matchesForme;
  });

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'Disponible':
        return 'bg-green-100 text-green-800';
      case 'Stock faible':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rupture':
        return 'bg-red-100 text-red-800';
      case 'Expiré':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'Disponible':
        return <Package className="w-4 h-4 text-green-600" />;
      case 'Stock faible':
        return <TrendingDown className="w-4 h-4 text-yellow-600" />;
      case 'Rupture':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'Expiré':
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleAddMedicament = () => {
    toast.success('Nouveau médicament ajouté');
  };

  const handleViewMedicament = (medicament: Medicament) => {
    setSelectedMedicament(medicament);
  };

  const handleEditMedicament = async (medicament: Medicament) => {
    try {
      // TODO: Appel API pour modifier
      // await api.put(`/medicaments/${medicament.id}`, medicament);
      toast.success('Médicament modifié');
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  const handleDeleteMedicament = async (id: string) => {
    try {
      // TODO: Appel API pour supprimer
      // await api.delete(`/medicaments/${id}`);
      setMedicaments(prev => prev.filter(med => med.id !== id));
      toast.success('Médicament supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleUpdateStock = async (id: string, newStock: number) => {
    try {
      // TODO: Appel API pour mettre à jour le stock
      // await api.patch(`/medicaments/${id}`, { stockActuel: newStock });
      
      setMedicaments(prev => prev.map(med => {
        if (med.id === id) {
          let newStatus: Medicament['statut'] = 'Disponible';
          if (newStock === 0) newStatus = 'Rupture';
          else if (newStock <= med.stockMinimum) newStatus = 'Stock faible';
          
          return { ...med, stockActuel: newStock, statut: newStatus };
        }
        return med;
      }));
      toast.success('Stock mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const totalMedicaments = medicaments.length;
  const disponibles = medicaments.filter(m => m.statut === 'Disponible').length;
  const stockFaible = medicaments.filter(m => m.statut === 'Stock faible').length;
  const ruptures = medicaments.filter(m => m.statut === 'Rupture').length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="ml-2 text-gray-600">Chargement des médicaments...</span>
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
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Médicaments</h1>
            <p className="text-gray-600">Gérez votre stock de médicaments et pharmacie</p>
          </div>
          <button
            onClick={handleAddMedicament}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau Médicament
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
              placeholder="Rechercher un médicament..."
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
            <option value="Disponible">Disponible</option>
            <option value="Stock faible">Stock faible</option>
            <option value="Rupture">Rupture</option>
            <option value="Expiré">Expiré</option>
          </select>

          <select
            value={formeFilter}
            onChange={(e) => setFormeFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Toutes les formes</option>
            {formesMedicaments.map(forme => (
              <option key={forme} value={forme}>{forme}</option>
            ))}
          </select>

          <button className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <TrendingUp className="w-5 h-5 mr-2" />
            Rapport Stock
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Médicaments</p>
              <p className="text-2xl font-bold text-gray-900">{totalMedicaments}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Pill className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Disponibles</p>
              <p className="text-2xl font-bold text-gray-900">{disponibles}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stock Faible</p>
              <p className="text-2xl font-bold text-gray-900">{stockFaible}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ruptures</p>
              <p className="text-2xl font-bold text-gray-900">{ruptures}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Empty State or Medicaments List */}
      {medicaments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun médicament trouvé</h3>
            <p className="text-gray-500 mb-6">
              Commencez par ajouter votre premier médicament au stock de la pharmacie.
            </p>
            <button
              onClick={handleAddMedicament}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter un médicament
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-200">
            <h2 className="text-lg font-semibold text-emerald-900">Stock des Médicaments</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Médicament</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Forme</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Laboratoire</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Stock</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Prix</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Expiration</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Statut</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMedicaments.map((medicament, index) => (
                  <tr key={medicament.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Pill className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{medicament.nom}</p>
                          <p className="text-sm text-gray-500">{medicament.dosage}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{medicament.forme}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{medicament.laboratoire}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">{medicament.stockActuel}</p>
                        <p className="text-xs text-gray-500">Min: {medicament.stockMinimum}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      {medicament.prixUnitaire.toLocaleString()} FC
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                      {new Date(medicament.dateExpiration).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {getStatusIcon(medicament.statut)}
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(medicament.statut)}`}>
                          {medicament.statut}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewMedicament(medicament)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir détails"
                        >
                          <Package className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditMedicament(medicament)}
                          className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMedicament(medicament.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Medicament Detail Modal */}
      {selectedMedicament && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Détail du Médicament</h3>
              <button
                onClick={() => setSelectedMedicament(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedMedicament.nom}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dosage</label>
                  <p className="text-lg text-gray-900">{selectedMedicament.dosage}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Forme</label>
                  <p className="text-lg text-gray-900">{selectedMedicament.forme}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Laboratoire</label>
                  <p className="text-lg text-gray-900">{selectedMedicament.laboratoire}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock Actuel</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={selectedMedicament.stockActuel}
                      onChange={(e) => handleUpdateStock(selectedMedicament.id, parseInt(e.target.value))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <span className="text-sm text-gray-500">unités</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock Minimum</label>
                  <p className="text-lg text-gray-900">{selectedMedicament.stockMinimum}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prix Unitaire</label>
                  <p className="text-lg text-gray-900">{selectedMedicament.prixUnitaire.toLocaleString()} FC</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date d'Expiration</label>
                <p className="text-lg text-gray-900">
                  {new Date(selectedMedicament.dateExpiration).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Indication</label>
                <p className="text-gray-900 bg-blue-50 p-4 rounded-lg">{selectedMedicament.indication}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contre-indications</label>
                <p className="text-gray-900 bg-red-50 p-4 rounded-lg">{selectedMedicament.contrindications}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Effets Secondaires</label>
                <p className="text-gray-900 bg-yellow-50 p-4 rounded-lg">{selectedMedicament.effetsSecondaires}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedMedicament.statut)}`}>
                  {selectedMedicament.statut}
                </span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedMedicament(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => handleEditMedicament(selectedMedicament)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};