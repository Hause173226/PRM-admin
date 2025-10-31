import { useState, useEffect } from 'react';
import {  Mail, Phone, MapPin, Shield, Camera, X, Save } from 'lucide-react';
import Layout from '../components/Layout';
import userService from '../services/userService';
import { User as UserType } from '../types';
import Toast from '../components/Toast';

export default function Profile() {
  const [profile, setProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    displayName: '',
    phone: '',
    address: '',
    avatarUrl: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getProfile();
      setProfile(data);
      setFormData({
        fullName: data.fullName,
        displayName: data.displayName || '',
        phone: data.phone,
        address: data.address || '',
        avatarUrl: data.avatarUrl || ''
      });
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.message || 'Không thể tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName,
        displayName: profile.displayName || '',
        phone: profile.phone,
        address: profile.address || '',
        avatarUrl: profile.avatarUrl || ''
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      const updatedUser = await userService.updateUser(profile.id, formData);
      setProfile(updatedUser);
      setIsEditing(false);
      setToast({ message: 'Cập nhật thông tin thành công!', type: 'success' });
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setToast({ 
        message: err.response?.data?.message || 'Không thể cập nhật thông tin', 
        type: 'error' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800';
      case 'Staff':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchProfile}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Thử lại
          </button>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Không tìm thấy thông tin hồ sơ</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
            <p className="text-gray-600 mt-1">Quản lý thông tin cá nhân của bạn</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Cover & Avatar */}
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="absolute -bottom-16 left-8">
              {profile.avatarUrl ? (
                <div className="relative">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    className="w-32 h-32 rounded-full border-4 border-white object-cover"
                  />
                  <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-lg">
                    <Camera size={16} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <div className="w-32 h-32 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">
                      {getInitials(profile.fullName)}
                    </span>
                  </div>
                  <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-lg">
                    <Camera size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-20 pb-6 px-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile.fullName}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(profile.role)}`}>
                    {profile.role}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profile.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {profile.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
                {profile.displayName && (
                  <p className="text-gray-600 mt-1">@{profile.displayName}</p>
                )}
                {profile.bio && (
                  <p className="text-gray-700 mt-3 max-w-2xl">{profile.bio}</p>
                )}
              </div>
            </div>

            {/* Contact Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Full Name */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <Shield size={20} className="text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Tên đầy đủ</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 mt-1">{profile.fullName}</p>
                  )}
                </div>
              </div>

              {/* Display Name */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-pink-100 p-2 rounded-lg">
                  <Shield size={20} className="text-pink-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Tên hiển thị</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      placeholder="Nhập tên hiển thị"
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 mt-1">{profile.displayName || 'Chưa có'}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Mail size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Email</p>
                  <p className="text-gray-900 mt-1">{profile.email}</p>
                  {isEditing && (
                    <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Phone size={20} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Số điện thoại</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 mt-1">{profile.phone}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg md:col-span-2">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <MapPin size={20} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Địa chỉ</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Nhập địa chỉ"
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 mt-1">{profile.address || 'Chưa có'}</p>
                  )}
                </div>
              </div>

              {/* Role */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Shield size={20} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Vai trò</p>
                  <p className="text-gray-900 mt-1">{profile.role}</p>
                  {isEditing && (
                    <p className="text-xs text-gray-500 mt-1">Vai trò không thể thay đổi</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        <span>Lưu thay đổi</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <X size={18} />
                    <span>Hủy</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Chỉnh sửa hồ sơ
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Layout>
  );
}

