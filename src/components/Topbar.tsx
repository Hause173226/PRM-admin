import { useState, useEffect } from 'react';
import { Search, Bell, LogOut, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import userService from '../services/userService';
import { AuthUser } from '../types/auth';

export default function Topbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy thông tin profile từ API
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profile = await userService.getProfile();
      setCurrentUser(profile as AuthUser);
      // Cập nhật lại localStorage
      localStorage.setItem('user', JSON.stringify(profile));
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to localStorage if API fails
      const user = authService.getCurrentUser();
      setCurrentUser(user);
    }
  };

  const handleLogout = async () => {
    try {
      // Gọi API logout
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Luôn chuyển về trang login dù API có lỗi
      setShowLogoutModal(false);
      navigate('/login');
    }
  };

  // Lấy initials từ fullName
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2);
  };

  return (
    <>
      <header className="h-16 glass-effect border-b border-slate-200/50 fixed top-0 right-0 left-64 z-10 shadow-lg">
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent focus:bg-white shadow-sm hover:shadow-md transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2.5 hover:bg-gradient-to-br hover:from-primary-50 hover:to-blue-50 rounded-xl transition-all duration-300 hover:shadow-md group">
              <Bell size={20} className="text-gray-500 group-hover:text-primary-600 transition-colors" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gradient-to-br from-red-400 to-red-600 rounded-full animate-pulse shadow-lg"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 p-2 hover:bg-gradient-to-br hover:from-primary-50 hover:to-blue-50 rounded-xl transition-all duration-300 hover:shadow-md"
              >
                {currentUser?.avatarUrl ? (
                  <img 
                    src={currentUser.avatarUrl} 
                    alt={currentUser.fullName}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-primary-200 hover:ring-primary-300 transition-all"
                  />
                ) : (
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-semibold">
                      {currentUser?.fullName ? getInitials(currentUser.fullName) : 'AD'}
                    </span>
                  </div>
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 glass-effect rounded-2xl shadow-2xl border border-slate-200/50 py-2 animate-scale-in">
                  <div className="px-4 py-3 border-b border-slate-200/50">
                    <p className="text-sm font-semibold text-gray-800">{currentUser?.fullName || 'User'}</p>
                    <p className="text-xs text-gray-500">{currentUser?.email || ''}</p>
                    <p className="text-xs text-primary-600 mt-1 font-medium">{currentUser?.role || ''}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/profile');
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50 flex items-center gap-2 mt-1 transition-all rounded-lg mx-1"
                  >
                    <User size={16} className="text-primary-600" />
                    Hồ sơ cá nhân
                  </button>
                  <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50 flex items-center gap-2 transition-all rounded-lg mx-1">
                    <Settings size={16} className="text-primary-600" />
                    Cài đặt
                  </button>
                  <hr className="my-2 border-slate-200/50" />
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-lg mx-1 transition-all"
                  >
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="glass-effect rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-slate-200/50 animate-scale-in">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Xác nhận đăng xuất</h3>
            <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-5 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 rounded-xl transition-all hover:shadow-md"
              >
                Hủy
              </button>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
