import {
  FiHome,
  FiUsers,
  FiFileText,
  FiMessageSquare,
  FiCalendar,
  FiX,
  FiUpload,
  FiImage,
  FiFile,
  FiDownload,
  FiTrash2,
  FiGrid,
  FiLayout
} from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';

const LinkItems = [
  { name: 'Dashboard', icon: FiHome, path: '/dashboard' },
  { name: 'Workspaces', icon: FiLayout, path: '/workspace' },
  { name: 'Team', icon: FiUsers, path: '/team' },
  { name: 'Documents', icon: FiFileText, path: '/documents' },
  { name: 'Chat', icon: FiMessageSquare, path: '/chat' },
  { name: 'Calendar', icon: FiCalendar, path: '/calendar' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-900/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 w-60 h-screen transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 bg-white border-r border-gray-200`}
      >
        <div className="flex items-center justify-end h-16 px-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-2 text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {LinkItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                    location.pathname.startsWith(item.path)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar; 