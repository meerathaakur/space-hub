import { FiUserPlus, FiMail, FiTrash2, FiEdit2 } from 'react-icons/fi';

const teamMembers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', avatar: 'https://i.pravatar.cc/100?img=1' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Member', avatar: 'https://i.pravatar.cc/100?img=2' },
  { id: 3, name: 'Alex Lee', email: 'alex@example.com', role: 'Viewer', avatar: 'https://i.pravatar.cc/100?img=3' },
];

const Team = () => {
  return (
    <div className="p-4 mt-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Team Members</h1>
        <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition text-sm">
          <FiUserPlus /> <span>Invite Member</span>
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
        <ul className="divide-y divide-gray-100 min-w-[350px]">
          {teamMembers.map((member) => (
            <li key={member.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3 min-w-0">
                <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium text-lg truncate">{member.name}</div>
                  <div className="text-xs text-gray-500 flex items-center space-x-1 break-all">
                    <FiMail className="inline-block mr-1 flex-shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                <span className={`text-xs px-2 py-1 rounded ${member.role === 'Admin' ? 'bg-blue-100 text-blue-700' : member.role === 'Member' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{member.role}</span>
                {/* Admin controls (UI only) */}
                {member.role !== 'Admin' && (
                  <>
                    <button className="p-1 rounded hover:bg-gray-100" title="Edit Role"><FiEdit2 /></button>
                    <button className="p-1 rounded hover:bg-red-100 text-red-600" title="Remove Member"><FiTrash2 /></button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Team; 