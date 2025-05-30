import { FiUsers, FiFileText, FiMessageCircle, FiCalendar, FiPlus, FiUserPlus, FiClock, FiMail, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Team from '../team/Team';
import { useAuth } from '../../context/AuthContext';

// Dummy data
const stats = [
  { label: 'Team Members', value: 8, icon: <FiUsers className="text-blue-500 text-xl" /> },
  { label: 'Documents', value: 24, icon: <FiFileText className="text-green-500 text-xl" /> },
  { label: 'Messages', value: 132, icon: <FiMessageCircle className="text-purple-500 text-xl" /> },
  { label: 'Upcoming Events', value: 3, icon: <FiCalendar className="text-pink-500 text-xl" /> },
];

const activities = [
  { id: 1, user: 'John Doe', role: 'Admin', type: 'upload', icon: <FiFileText className="text-blue-500" />, text: 'uploaded "Project Plan.pdf"', date: '2024-06-10', time: '14:32', ago: '2 min ago' },
  { id: 2, user: 'Jane Smith', role: 'Member', type: 'join', icon: <FiUserPlus className="text-green-500" />, text: 'joined Workspace Alpha', date: '2024-06-10', time: '14:24', ago: '10 min ago' },
  { id: 3, user: 'You', role: 'Admin', type: 'schedule', icon: <FiClock className="text-purple-500" />, text: 'scheduled a meeting for Friday', date: '2024-06-10', time: '13:34', ago: '1 hour ago' },
  { id: 4, user: 'Alex Lee', role: 'Viewer', type: 'comment', icon: <FiMessageCircle className="text-pink-500" />, text: 'commented on "Design Mockup.png"', date: '2024-06-10', time: '12:32', ago: '2 hours ago' },
];

const workspaces = [
  { id: 1, name: 'Alpha', role: 'Admin' },
  { id: 2, name: 'Beta', role: 'Member' },
  { id: 3, name: 'Gamma', role: 'Viewer' },
];

const tasks = [
  { id: 1, title: 'Design homepage', status: 'To Do', due: '2024-06-10' },
  { id: 2, title: 'Set up database', status: 'In Progress', due: '2024-06-12' },
  { id: 3, title: 'Write documentation', status: 'Done', due: '2024-06-08' },
];

const teamMembers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', avatar: 'https://i.pravatar.cc/100?img=1' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Member', avatar: 'https://i.pravatar.cc/100?img=2' },
  { id: 3, name: 'Alex Lee', email: 'alex@example.com', role: 'Viewer', avatar: 'https://i.pravatar.cc/100?img=3' },
];

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-4 space-y-8 mt-16">
      {/* Welcome Banner */}
      <div className="pr-6 pt-6 pb-6">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Welcome back, {user?.name || 'User'}!</h1>
      </div>

      {/* Statistics Heading */}
      <h2 className="text-xl font-semibold text-gray-800 mb-2 ml-2">Overview</h2>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.10)] p-6 flex items-center space-x-4">
            <div>{stat.icon}</div>
            <div>
              <div className="font-semibold text-base text-gray-700 mb-1">{stat.label}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <ul className="divide-y divide-gray-100">
            {activities.map((activity) => (
              <li key={activity.id} className="py-3 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  {activity.icon}
                  <div>
                    <div className="font-medium text-gray-800">{activity.user} <span className="text-xs text-gray-400 font-normal">({activity.role})</span> {activity.text}</div>
                    <div className="text-xs text-gray-400">{activity.date}, {activity.time}</div>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{activity.ago}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-6 w-full flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Quick Actions</h2>
          <div className="space-y-4 w-full">
            <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition shadow-sm">
              <FiPlus /> <span>Create New Document</span>
            </button>
            <button className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition shadow-sm">
              <FiUserPlus /> <span>Invite Team Member</span>
            </button>
            <button className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition shadow-sm border-2 border-purple-400">
              <FiClock /> <span>Schedule Meeting</span>
            </button>
          </div>
        </div>
      </div>

      {/* Workspace List & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workspaces */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Your Workspaces</h2>
          <ul className="divide-y divide-gray-100">
            {workspaces.map((ws) => (
              <li key={ws.id} className="py-3 flex justify-between items-center">
                <Link to={`/workspace/${ws.id}`} className="text-blue-600 hover:underline font-medium">{ws.name}</Link>
                <span className="text-xs text-gray-500">{ws.role}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Tasks */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Your Tasks</h2>
          <ul className="divide-y divide-gray-100">
            {tasks.map((task) => (
              <li key={task.id} className="py-3 flex justify-between items-center">
                <div>
                  <div className="font-medium">{task.title}</div>
                  <div className="text-xs text-gray-400">Due: {task.due}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${task.status === 'Done' ? 'bg-green-100 text-green-700' : task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{task.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Team Section (reuse Team component) */}
      <Team />
    </div>
  );
};

export default Dashboard; 