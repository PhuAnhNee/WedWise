import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AuthService from '../service/AuthService';

interface ProfileResponse {
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  avatarUrl: string;
  isActive: boolean;
  role: number;
}

interface UploadResponse {
  url: string;
  message: string;
}

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [profileData, setProfileData] = useState({
    userId: '',
    fullName: '',
    phone: '',
    email: '',
    avatarUrl: '',
    isActive: true
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = () => {
    const userData = AuthService.getCurrentUser();
    if (userData) {
      setProfileData({
        userId: userData.UserId,
        fullName: userData.Name,
        phone: userData.Phone,
        email: userData.Email,
        avatarUrl: userData.Avatar || '',
        isActive: true
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra kích thước file (giới hạn ở 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'File size exceeds 5MB limit', type: 'error' });
      return;
    }

    // Kiểm tra loại file
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setMessage({ text: 'Only JPEG, JPG, PNG, and GIF files are allowed', type: 'error' });
      return;
    }

    setIsUploading(true);
    setMessage({ text: '', type: '' });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = AuthService.getToken();
      const response = await axios.post<UploadResponse>(
        'https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Storage/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log("Upload response:", response.data);
      
      if (response.data.url) {
        setProfileData(prev => ({
          ...prev,
          avatarUrl: response.data.url
        }));
        setMessage({ text: 'Image uploaded successfully', type: 'success' });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      let errorMessage = 'Failed to upload image. Please try again later.';
      
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error response data:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const token = AuthService.getToken();
      
      const updateData = {
        userId: profileData.userId,
        fullName: profileData.fullName,
        phone: profileData.phone,
        avatarUrl: profileData.avatarUrl,
        isActive: profileData.isActive
      };
      
      console.log("Sending profile update data:", updateData);
      
      const response = await axios.post<ProfileResponse>(
        'https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Auth/Update_Profile',
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log("Profile update response:", response.data);
      
      if (response.data) {
        setProfileData({
          userId: response.data.userId,
          fullName: response.data.fullName,
          phone: response.data.phone,
          email: response.data.email,
          avatarUrl: response.data.avatarUrl,
          isActive: response.data.isActive
        });
        
        const userData = AuthService.getDecodedToken();
        if (userData) {
          const updatedUserData = {
            ...userData,
            UserId: response.data.userId,
            Name: response.data.fullName,
            Phone: response.data.phone,
            Email: response.data.email,
            Avatar: response.data.avatarUrl,
            Role: response.data.role.toString()
          };
          localStorage.setItem("decodedToken", JSON.stringify(updatedUserData));
        }
      }
      
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      let errorMessage = 'Failed to update profile. Please try again later.';
      
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error response data:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">My Profile</h2>
      
      {message.text && (
        <div className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div 
              className={`w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-4 ${isEditing ? 'cursor-pointer relative' : ''}`} 
              onClick={handleAvatarClick}
            >
              {isUploading ? (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : null}
              
              {profileData.avatarUrl ? (
                <img src={profileData.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl text-gray-400">{profileData.fullName.charAt(0)}</span>
              )}
              
              {isEditing && (
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs">Change Photo</span>
                </div>
              )}
              
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden"
                accept="image/*" 
                onChange={handleFileChange}
              />
            </div>
            <div>
              <h3 className="text-xl font-medium">{profileData.fullName}</h3>
              <p className="text-gray-500">{profileData.email}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
                <div className="flex">
                  <input
                    type="text"
                    name="avatarUrl"
                    value={profileData.avatarUrl}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/avatar.jpg"
                  />
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="px-4 py-2 bg-gray-200 rounded-r hover:bg-gray-300 transition"
                  >
                    Browse
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Click on your avatar image or the Browse button to upload a new photo</p>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={profileData.isActive}
                  onChange={(e) => setProfileData({...profileData, isActive: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active Account
                </label>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="mt-1">{profileData.fullName}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Email Address</p>
                <p className="mt-1">{profileData.email}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Phone Number</p>
                <p className="mt-1">{profileData.phone || 'Not provided'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Account Status</p>
                <p className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profileData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {profileData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;