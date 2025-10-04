import { useState, useEffect, useRef } from 'react';
import { Search, User, Calendar, Phone, Mail, Loader2, X, Droplet, AlertTriangle, MapPin } from 'lucide-react';
import type { Patient } from '../../types/medical';
import { usePatients } from '../../hooks/usePatients';

interface PatientSearchProps {
  selectedPatient?: Patient;
  onPatientSelect: (patient: Patient) => void;
}

export const PatientSearch: React.FC<PatientSearchProps> = ({
  selectedPatient,
  onPatientSelect
}) => {
  const { patients, loading, calculateAge, searchPatients } = usePatients();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Patient[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Recherche avec debounce et API
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (query.length > 1) {
        setIsSearching(true);
        try {
          // Utiliser la méthode de recherche du hook si disponible
          const searchResults = await searchPatients(query);
          setSuggestions(searchResults.slice(0, 10));
          setShowSuggestions(true);
        } catch (error) {
          // Fallback vers filtrage local si la recherche API échoue
          const searchTerm = query.toLowerCase();
          const filteredPatients = patients.filter(patient => 
            patient.fullName?.toLowerCase().includes(searchTerm) ||
            patient.firstName?.toLowerCase().includes(searchTerm) ||
            patient.lastName?.toLowerCase().includes(searchTerm) ||
            patient.phone?.toLowerCase().includes(searchTerm) ||
            patient.email?.toLowerCase().includes(searchTerm) ||
            patient.assuranceNumber?.toLowerCase().includes(searchTerm)
          ).slice(0, 10);
          setSuggestions(filteredPatients);
          setShowSuggestions(true);
        }
        setIsSearching(false);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query, patients, searchPatients]);

  // Gérer la fermeture des suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchTerm: string) => {
    setQuery(searchTerm);
  };

  const handlePatientSelect = (patient: Patient) => {
    setQuery(`${patient.fullName} ${patient.firstName}`);
    setShowSuggestions(false);
    onPatientSelect(patient);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const formatPatientInfo = (patient: Patient) => {
    const age = calculateAge(patient.birthDate);
    const genderText = patient.gender === 'M' ? 'Homme' : 'Femme';
    return `${age} ans • ${genderText}`;
  };

  const getPatientInitials = (patient: Patient) => {
    return `${patient.firstName?.charAt(0) || ''}${patient.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-emerald-600 mr-2" size={20} />
          <span className="text-gray-600">Chargement des patients...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-emerald-600" />
        Recherche Patient
      </h2>
      
      <div className="relative mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Rechercher par nom, prénom, téléphone, email..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          />
          
          {/* Indicateur de chargement */}
          {isSearching && (
            <div className="absolute right-3 top-3">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          )}
          
          {/* Bouton de clear */}
          {query && !isSearching && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
        
        {/* Suggestions dropdown */}
        {showSuggestions && (
          <div 
            ref={suggestionsRef}
            className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
          >
            {suggestions.length > 0 ? (
              <>
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                  {suggestions.length} patient{suggestions.length > 1 ? 's' : ''} trouvé{suggestions.length > 1 ? 's' : ''}
                </div>
                {suggestions.map((patient) => (
                  <button
                    key={patient.patientId}
                    onClick={() => handlePatientSelect(patient)}
                    className="w-full px-4 py-3 text-left hover:bg-emerald-50 border-b border-gray-100 last:border-b-0 transition-colors focus:bg-emerald-50 focus:outline-none"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-600 font-medium text-sm">
                          {getPatientInitials(patient)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 truncate">
                            {patient.fullName} {patient.firstName}
                          </p>
                          {patient.bloodType && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full flex items-center gap-1">
                              <Droplet size={10} />
                              {patient.bloodType}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatPatientInfo(patient)}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          {patient.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {patient.phone}
                            </span>
                          )}
                          {patient.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {patient.email}
                            </span>
                          )}
                          {patient.assuranceNumber && (
                            <span className="text-blue-600">
                              Ass: {patient.assuranceNumber}
                            </span>
                          )}
                        </div>
                        {patient.allergy && (
                          <div className="mt-1">
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                              <AlertTriangle size={10} />
                              Allergies
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </>
            ) : query.length > 1 && !isSearching ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <User className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                <p>Aucun patient trouvé</p>
                <p className="text-xs mt-1">Essayez avec un autre terme de recherche</p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Patient sélectionné */}
      {selectedPatient && (
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-emerald-900 flex items-center gap-2">
              <User className="w-5 h-5" />
              Patient Sélectionné
            </h3>
            <button
              onClick={clearSearch}
              className="text-emerald-600 hover:text-emerald-800 text-sm underline"
            >
              Changer
            </button>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-600 font-semibold">
                {getPatientInitials(selectedPatient)}
              </span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <p className="font-semibold text-emerald-900 text-lg">
                  {selectedPatient.fullName} {selectedPatient.firstName}
                </p>
                {selectedPatient.bloodType && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <Droplet size={10} />
                    {selectedPatient.bloodType}
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <p className="text-emerald-700 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatPatientInfo(selectedPatient)}
                </p>
                
                {selectedPatient.phone && (
                  <p className="text-emerald-600 flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {selectedPatient.phone}
                  </p>
                )}
                
                {selectedPatient.email && (
                  <p className="text-emerald-600 flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {selectedPatient.email}
                  </p>
                )}
                
                {selectedPatient.assuranceNumber && (
                  <p className="text-emerald-600">
                    Assurance: {selectedPatient.assuranceNumber}
                  </p>
                )}
              </div>
              
              {/* Informations importantes */}
              <div className="mt-3 space-y-2">
                {selectedPatient.allergy && (
                  <div className="p-2 bg-orange-50 border border-orange-200 rounded">
                    <p className="text-xs font-medium text-orange-800 mb-1 flex items-center gap-1">
                      <AlertTriangle size={12} />
                      Allergies connues:
                    </p>
                    <p className="text-sm text-orange-700">{selectedPatient.allergy}</p>
                  </div>
                )}
                
                {(selectedPatient.height > 0 || selectedPatient.weight > 0) && (
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-xs font-medium text-blue-800 mb-1">Mesures:</p>
                    <div className="text-sm text-blue-700 flex gap-4">
                      {selectedPatient.height > 0 && (
                        <span>Taille: {selectedPatient.height} cm</span>
                      )}
                      {selectedPatient.weight > 0 && (
                        <span>Poids: {selectedPatient.weight} kg</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {selectedPatient.address && (
                <div className="mt-2">
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <MapPin size={12} />
                    {selectedPatient.address}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Message d'aide */}
      {!selectedPatient && !query && (
        <div className="text-center py-6 text-gray-500">
          <Search className="mx-auto h-8 w-8 text-gray-300 mb-2" />
          <p className="text-sm">Tapez au moins 2 caractères pour rechercher un patient</p>
        </div>
      )}
      
      {/* Statistiques de recherche */}
      {patients.length > 0 && (
        <div className="mt-4 text-xs text-gray-500 text-center border-t border-gray-200 pt-3">
          {patients.length} patients dans la base de données
        </div>
      )}
    </div>
  );
};