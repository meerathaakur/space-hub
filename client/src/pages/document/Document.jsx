import { useRef } from 'react';
import { FiUpload, FiFileText, FiImage, FiFile, FiDownload, FiTrash2, FiUsers } from 'react-icons/fi';

const documents = [
  {
    id: 1,
    name: 'Project Plan.pdf',
    type: 'pdf',
    uploader: 'John Doe',
    access: 'Team',
    url: '#',
  },
  {
    id: 2,
    name: 'Design Mockup.png',
    type: 'image',
    uploader: 'Jane Smith',
    access: 'Members',
    url: '#',
  },
  {
    id: 3,
    name: 'Meeting Notes.docx',
    type: 'word',
    uploader: 'Alex Lee',
    access: 'Admin',
    url: '#',
  },
];

const getFileIcon = (type) => {
  switch (type) {
    case 'pdf':
      return <FiFileText className="text-red-500 text-xl" />;
    case 'image':
      return <FiImage className="text-blue-500 text-xl" />;
    case 'word':
      return <FiFile className="text-blue-700 text-xl" />;
    default:
      return <FiFile className="text-gray-400 text-xl" />;
  }
};

const Document = () => {
  const fileInputRef = useRef();

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="p-4 mt-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Documents</h1>
        <button
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition text-sm"
          onClick={handleUploadClick}
        >
          <FiUpload /> <span>Upload Document</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif"
        />
      </div>
      <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-2 px-2">File</th>
              <th className="py-2 px-2">Uploader</th>
              <th className="py-2 px-2">Access</th>
              <th className="py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b last:border-b-0">
                <td className="py-2 px-2 flex items-center space-x-2">
                  {getFileIcon(doc.type)}
                  <span className="font-medium text-gray-900 truncate max-w-[180px]">{doc.name}</span>
                </td>
                <td className="py-2 px-2">{doc.uploader}</td>
                <td className="py-2 px-2 flex items-center space-x-1">
                  <FiUsers className="inline-block text-gray-500" />
                  <span>{doc.access}</span>
                </td>
                <td className="py-2 px-2 flex items-center space-x-2">
                  <a href={doc.url} download className="p-1 rounded hover:bg-gray-100" title="Download">
                    <FiDownload />
                  </a>
                  <button className="p-1 rounded hover:bg-red-100 text-red-600" title="Delete">
                    <FiTrash2 />
                  </button>
                  {/* Access control button (UI only) */}
                  <button className="p-1 rounded hover:bg-gray-100" title="Manage Access">
                    <FiUsers />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {documents.length === 0 && (
          <div className="text-center text-gray-400 py-8">No documents found.</div>
        )}
      </div>
    </div>
  );
};

export default Document; 