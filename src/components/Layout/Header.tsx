import React from 'react';
import { User, Bell, Settings, LogOut } from 'lucide-react';

interface HeaderProps {
  medecinNom?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  medecinNom = "Dr. LIBANGA Jean-Baptiste" 
}) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Système de Gestion Médicale</h1>
            {/* <p className="text-sm text-gray-600">Système de Gestion Médicale</p> */}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-right">
          {/* <p className="text-sm font-medium text-gray-900">{medecinNom}</p> */}
          {/* <p className="text-xs text-gray-500">Médecin ORL</p> */}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button> */}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};