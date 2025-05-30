import { useState, useEffect } from 'react';
import { useParams, Outlet, useNavigate, useLocation } from 'react-router-dom';
import Workboard from '../workboard/Workboard';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

const initialTasks = [
  { id: 1, title: "Design homepage", status: "todo", description: "Create wireframes and mockups", assignee: "John Doe", dueDate: "2024-03-20" },
  { id: 2, title: "Set up database", status: "in-progress", description: "Configure MongoDB and create schemas", assignee: "Jane Smith", dueDate: "2024-03-22" },
  { id: 3, title: "Write documentation", status: "done", description: "Document API endpoints and usage", assignee: "Alex Lee", dueDate: "2024-03-18" },
];

const columns = [
  { key: "todo", label: "To Do", color: "bg-gray-100" },
  { key: "in-progress", label: "In Progress", color: "bg-blue-100" },
  { key: "done", label: "Done", color: "bg-green-100" },
];

const Workspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname.includes('/board') ? 'board' : 'tasks');
  const [tasks, setTasks] = useState(initialTasks);
  const [draggedTask, setDraggedTask] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", status: "todo" });

  useEffect(() => {
    // Update active tab based on current location
    if (location.pathname.includes('/board')) {
      setActiveTab('board');
    } else {
      setActiveTab('tasks');
    }
  }, [location]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'board') {
      navigate(`/workspace/${id}/board`);
    } else {
      navigate(`/workspace/${id}`);
    }
  };

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (status) => {
    if (draggedTask) {
      setTasks(tasks.map(task => 
        task.id === draggedTask.id ? { ...task, status } : task
      ));
      setDraggedTask(null);
    }
  };

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      setTasks([...tasks, { ...newTask, id: Date.now() }]);
      setNewTask({ title: "", description: "", status: "todo" });
      setShowAddTask(false);
    }
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  return (
    <div className="h-[calc(100vh-4rem)] p-4 mt-16">
      <div className="bg-white rounded-lg shadow-lg h-full">
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <h1 className="text-2xl font-bold text-gray-900">Workspace {id}</h1>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => handleTabChange('board')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'board'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Whiteboard
            </button>
            <button
              onClick={() => handleTabChange('tasks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tasks
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-8rem)]">
          {activeTab === 'board' ? (
            <Workboard />
          ) : (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
                <button
                  onClick={() => setShowAddTask(true)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition text-sm"
                >
                  <FiPlus /> <span>Add Task</span>
                </button>
              </div>

              {/* Add Task Modal */}
              {showAddTask && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h2 className="text-xl font-bold mb-4">Add New Task</h2>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Task Title"
                        className="w-full p-2 border rounded"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      />
                      <textarea
                        placeholder="Task Description"
                        className="w-full p-2 border rounded"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setShowAddTask(false)}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddTask}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Add Task
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Kanban Board */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map((col) => (
                  <div
                    key={col.key}
                    className={`${col.color} rounded-lg p-4 min-h-[500px]`}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(col.key)}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">{col.label}</h2>
                      <span className="text-sm text-gray-500">
                        {tasks.filter((task) => task.status === col.key).length} tasks
                      </span>
                    </div>
                    <div className="space-y-4">
                      {tasks
                        .filter((task) => task.status === col.key)
                        .map((task) => (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={() => handleDragStart(task)}
                            className="bg-white rounded-lg shadow p-4 cursor-move"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium">{task.title}</h3>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>{task.assignee}</span>
                              <span>Due: {task.dueDate}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workspace; 