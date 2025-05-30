import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiCamera, FiSave, FiEdit2 } from 'react-icons/fi';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    avatar: null,
    about: '',
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || null,
        about: user.about || '',
      });
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          avatar: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // TODO: Replace with actual API call
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user data in localStorage
      const updatedUser = {
        ...user,
        ...profileData
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setSuccess(true);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-sky-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-sky-50 to-sky-100 px-6 py-8 border-b border-sky-100">
            <h1 className="text-3xl font-bold text-sky-900">Profile Settings</h1>
            <p className="mt-2 text-sky-600">Manage your account settings and preferences</p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Avatar Section */}
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
                <div className="relative group">
                  {profileData.avatar ? (
                    <img
                      src={profileData.avatar}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover ring-4 ring-white shadow-lg group-hover:ring-sky-100 transition-all duration-200"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center ring-4 ring-white shadow-lg group-hover:ring-sky-100 transition-all duration-200">
                      <FiUser className="w-16 h-16 text-sky-400" />
                    </div>
                  )}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex flex-col items-center justify-center bg-gray-600/30 backdrop-blur-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                  >
                    <FiCamera className="w-8 h-8 text-white mb-2" />
                    <span className="text-white text-sm font-medium">Upload Image</span>
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-xl font-semibold text-sky-900">Profile Picture</h2>
                  <p className="mt-1 text-sm text-sky-600">Upload a new profile picture or change your current one</p>
                  <p className="mt-2 text-xs text-sky-500">Recommended: Square image, at least 400x400px</p>
                </div>
              </div>

              {/* Name and Email Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-sky-700">
                    Full Name
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-sky-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 sm:text-sm transition-colors duration-200"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-sky-700">
                    Email Address
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-sky-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 sm:text-sm transition-colors duration-200"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="space-y-2">
                <label htmlFor="about" className="block text-sm font-medium text-sky-700">
                  About
                </label>
                <div className="relative">
                  <textarea
                    id="about"
                    name="about"
                    rows={4}
                    value={profileData.about}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-3 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 sm:text-sm transition-colors duration-200"
                    placeholder="Tell us about yourself..."
                  />
                  <div className="absolute top-3 right-3 text-sky-400">
                    <FiEdit2 className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Success/Error Messages */}
              {success && (
                <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FiSave className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Profile updated successfully!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FiSave className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 transition-all duration-200 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2 h-5 w-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 