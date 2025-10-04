import  { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Stethoscope,
  Users,
  Calendar,
  FileText,
  // Activity,
  // Pill,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';
import { clsx } from 'clsx';

const menuItems = [
  { id: 'dashboard', label: 'Tableau de Bord', icon: Home, path: '/dashboard' },
  { id: 'consultation', label: 'Consultations', icon: Stethoscope, path: '/consultation' },
  { id: 'patients', label: 'Patients', icon: Users, path: '/patients' },
  { id: 'rendez-vous', label: 'Rendez-vous', icon: Calendar, path: '/rendez-vous' },
  { id: 'ordonnances', label: 'Ordonnances', icon: FileText, path: '/ordonnances' },
  // { id: 'examens', label: 'Examens', icon: Activity, path: '/examens' },
  // { id: 'medicaments', label: 'Médicaments', icon: Pill, path: '/medicaments' },
];

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={clsx(
        "h-screen border-r border-gray-200 bg-white transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex justify-end p-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex flex-col space-y-1 px-2">
        {menuItems.map(({ id, label, icon: Icon, path }) => {
          const isActive = location.pathname.startsWith(path);

          return (
            <NavLink
              key={id}
              to={path}
              className={clsx(
                "flex items-center px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
