import { useState, useRef, useEffect } from 'react';
import { FiSend, FiHash, FiPlus, FiUsers, FiX } from 'react-icons/fi';

const channels = [
  { id: 1, name: 'General' },
  { id: 2, name: 'Development' },
  { id: 3, name: 'Design' },
];

const dummyMessages = {
  1: [
    { id: 1, sender: 'John', text: 'Hello team!', time: '09:00' },
    { id: 2, sender: 'Jane', text: 'Hi John!', time: '09:01' },
  ],
  2: [
    { id: 1, sender: 'Alex', text: 'Pushed new code to repo.', time: '10:00' },
  ],
  3: [
    { id: 1, sender: 'Sam', text: 'Check out the new mockups.', time: '11:00' },
  ],
};

// Add dummy members data
const dummyMembers = {
  1: [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Member' },
    { id: 3, name: 'Alex Johnson', email: 'alex@example.com', role: 'Member' },
  ],
  2: [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Member' },
  ],
  3: [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 5, name: 'Mike Brown', email: 'mike@example.com', role: 'Member' },
  ],
};

const Chat = () => {
  const [selectedChannel, setSelectedChannel] = useState(channels[0].id);
  const [messages, setMessages] = useState(dummyMessages[selectedChannel]);
  const [input, setInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showMemberList, setShowMemberList] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [channelList, setChannelList] = useState(channels);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages(dummyMessages[selectedChannel] || []);
  }, [selectedChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMsg = {
      id: messages.length + 1,
      sender: 'You',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
  };

  const handleCreateChannel = (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    const newChannel = {
      id: channelList.length + 1,
      name: newChannelName.trim(),
    };

    setChannelList((prev) => [...prev, newChannel]);
    setNewChannelName('');
    setShowCreateModal(false);
    setSelectedChannel(newChannel.id);
    setMessages([]); // Clear messages for new channel
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;
    
    // Here you would typically make an API call to add the member
    // For now, we'll just close the modal and clear the input
    setNewMemberEmail('');
    setShowMemberModal(false);
  };

  const getMemberCount = (channelId) => {
    return dummyMembers[channelId]?.length || 0;
  };

  return (
    <div className="flex h-[70vh] bg-gray-50 rounded-lg shadow mt-16">
      {/* Channel List */}
      <aside className="w-48 bg-white border-r border-gray-200 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Channels</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="Create Channel"
          >
            <FiPlus className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <ul className="space-y-2 flex-1 overflow-y-auto">
          {channelList.map((ch) => (
            <li key={ch.id}>
              <button
                className={`flex items-center w-full px-3 py-2 rounded-lg transition text-left space-x-2 ${
                  selectedChannel === ch.id ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-700'
                }`}
                onClick={() => setSelectedChannel(ch.id)}
              >
                <FiHash /> <span>{ch.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Chat Window */}
      <section className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-4">
            <h3 className="text-xl font-bold">#{channelList.find((c) => c.id === selectedChannel)?.name}</h3>
            <button
              onClick={() => setShowMemberList(true)}
              className="flex items-center space-x-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="View Members"
            >
              <FiUsers className="w-5 h-5" />
              <span className="text-sm font-medium">{getMemberCount(selectedChannel)} members</span>
            </button>
          </div>
          <button
            onClick={() => setShowMemberModal(true)}
            className="flex items-center space-x-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Add Members"
          >
            <FiPlus className="w-5 h-5" />
            <span className="text-sm font-medium">Add Members</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col">
              <span className="font-semibold text-blue-700 text-sm">{msg.sender}</span>
              <div className="flex items-end space-x-2">
                <span className="bg-blue-100 text-gray-900 px-3 py-2 rounded-lg inline-block max-w-[70%]">{msg.text}</span>
                <span className="text-xs text-gray-400">{msg.time}</span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSend} className="flex items-center p-4 border-t border-gray-200 bg-white">
          <input
            type="text"
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="ml-3 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg flex items-center justify-center"
          >
            <FiSend />
          </button>
        </form>
      </section>

      {/* Create Channel Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create New Channel</h3>
            <form onSubmit={handleCreateChannel}>
              <div className="mb-4">
                <label htmlFor="channelName" className="block text-sm font-medium text-gray-700 mb-2">
                  Channel Name
                </label>
                <input
                  type="text"
                  id="channelName"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter channel name"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Members to #{channelList.find((c) => c.id === selectedChannel)?.name}</h3>
            <form onSubmit={handleAddMember}>
              <div className="mb-4">
                <label htmlFor="memberEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Member Email
                </label>
                <input
                  type="email"
                  id="memberEmail"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter member's email"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member List Modal */}
      {showMemberList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Members in #{channelList.find((c) => c.id === selectedChannel)?.name}</h3>
              <button
                onClick={() => setShowMemberList(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {dummyMembers[selectedChannel]?.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat; 