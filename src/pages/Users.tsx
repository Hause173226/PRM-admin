import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Search, Eye, Lock, Unlock, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { User } from '../types';
import userService from '../services/userService';
import Toast, { ToastType } from '../components/Toast';
import ConfirmPopover from '../components/ConfirmPopover';

type FilterStatus = 'all' | 'active' | 'inactive';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [confirmPopover, setConfirmPopover] = useState<{
    message: string;
    onConfirm: () => void;
    targetElement: HTMLElement;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getUsers();
      console.log('API Response:', response);
      console.log('Users data:', response.users);
      
      if (response && response.users) {
        setUsers(response.users);
        console.log('Users set successfully:', response.users.length, 'users');
      } else {
        console.warn('No users in response');
        setUsers([]);
      }
    } catch (err) {
      setError('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users?.filter((user) => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && user.isActive) || 
      (filter === 'inactive' && !user.isActive);
    const matchesSearch = (user.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  }) || [];

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}>
        {isActive ? 'Hoạt động' : 'Bị khóa'}
      </span>
    );
  };

  const getRoleBadge = (role: 'Admin' | 'User' | 'Staff') => {
    const labels = {
      Admin: 'Quản trị viên',
      User: 'Người dùng',
      Staff: 'Nhân viên'
    };
    return labels[role];
  };

  const handleBanUser = async (userId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    setConfirmPopover({
      message: 'Bạn có chắc chắn muốn khóa người dùng này?',
      targetElement: event.currentTarget,
      onConfirm: async () => {
        setConfirmPopover(null);
        try {
          await userService.banUser(userId);
          await fetchUsers(); // Reload danh sách
          setToast({ message: 'Đã khóa người dùng thành công', type: 'success' });
        } catch (err) {
          setToast({ message: 'Không thể khóa người dùng. Vui lòng thử lại.', type: 'error' });
          console.error('Error banning user:', err);
        }
      }
    });
  };

  const handleUnbanUser = async (userId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    setConfirmPopover({
      message: 'Bạn có chắc chắn muốn mở khóa người dùng này?',
      targetElement: event.currentTarget,
      onConfirm: async () => {
        setConfirmPopover(null);
        try {
          // Dùng PUT /api/users/:id với isActive: true để mở khóa
          await userService.updateUser(userId, { isActive: true });
          await fetchUsers(); // Reload danh sách
          setToast({ message: 'Đã mở khóa người dùng thành công', type: 'success' });
        } catch (err) {
          setToast({ message: 'Không thể mở khóa người dùng. Vui lòng thử lại.', type: 'error' });
          console.error('Error unbanning user:', err);
        }
      }
    });
  };

  const handleViewDetails = async (user: User) => {
    try {
      // Gọi API để lấy thông tin chi tiết mới nhất
      const detailedUser = await userService.getUserById(user.id);
      setSelectedUser(detailedUser);
    } catch (err) {
      // Nếu lỗi, vẫn hiển thị thông tin từ danh sách
      console.error('Error fetching user details:', err);
      setSelectedUser(user);
    }
  };

  const handleEditUser = async (user: User) => {
    try {
      // Gọi API để lấy thông tin chi tiết mới nhất
      const detailedUser = await userService.getUserById(user.id);
      setEditingUser(detailedUser);
    } catch (err) {
      console.error('Error fetching user details:', err);
      setEditingUser(user);
    }
  };

  const handleUpdateUser = async (userId: string, data: any) => {
    try {
      await userService.updateUser(userId, data);
      await fetchUsers();
      setEditingUser(null);
      setToast({ message: 'Cập nhật thông tin người dùng thành công', type: 'success' });
    } catch (err) {
      setToast({ message: 'Không thể cập nhật thông tin. Vui lòng thử lại.', type: 'error' });
      console.error('Error updating user:', err);
    }
  };

  return (
    <Layout>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {confirmPopover && (
        <ConfirmPopover
          message={confirmPopover.message}
          confirmText="OK"
          cancelText="Cancel"
          onConfirm={confirmPopover.onConfirm}
          onCancel={() => setConfirmPopover(null)}
          targetElement={confirmPopover.targetElement}
        />
      )}
      
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Người dùng</h1>
          <p className="text-gray-600 mt-1">Quản lý và kiểm duyệt người dùng trên nền tảng</p>
        </div>

        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-xl bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
              />
            </div>

            <div className="flex gap-2">
              {(['all', 'active', 'inactive'] as FilterStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    filter === status
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-blue-50 text-gray-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  {status === 'all' && 'Tất cả'}
                  {status === 'active' && 'Hoạt động'}
                  {status === 'inactive' && 'Bị khóa'}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchUsers}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Thử lại
              </button>
            </div>
          )}

          {!loading && !error && (
          <>
            {(() => {
              console.log('Rendering table. Users:', users.length, 'Filtered:', filteredUsers.length, 'Current Page:', currentPage, 'Showing:', currentUsers.length);
              return null;
            })()}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Họ tên</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Số điện thoại</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Vai trò</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Trạng thái</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      {filteredUsers.length === 0 ? 'Không có người dùng nào' : 'Không có dữ liệu'}
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-blue-50 hover:bg-blue-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img 
                            src={user.avatarUrl} 
                            alt={user.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {user.fullName?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{user.fullName }</div>
                          {user.displayName && (
                            <div className="text-xs text-gray-500">@{user.displayName}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{user.email}</td>
                    <td className="py-4 px-4 text-gray-600">{user.phone}</td>
                    <td className="py-4 px-4 text-gray-600">{user.role ? getRoleBadge(user.role) : 'N/A'}</td>
                    <td className="py-4 px-4">{getStatusBadge(user.isActive ?? false)}</td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(user)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} className="text-blue-600" />
                          </button>
                          {user.isActive ? (
                            <button
                              onClick={(e) => handleBanUser(user.id, e)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Khóa"
                            >
                              <Lock size={18} className="text-red-600" />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handleUnbanUser(user.id, e)}
                              className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                              title="Mở khóa"
                            >
                              <Unlock size={18} className="text-green-600" />
                            </button>
                          )}
                        </div>
                      </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && !error && filteredUsers.length > 0 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-600">
                Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{' '}
                <span className="font-medium">{Math.min(endIndex, filteredUsers.length)}</span> trong tổng số{' '}
                <span className="font-medium">{filteredUsers.length}</span> người dùng
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-50"
                >
                  <ChevronLeft size={20} className="text-blue-600" />
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Hiển thị trang đầu, trang cuối, và các trang xung quanh trang hiện tại
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'border border-blue-200 bg-blue-50 text-gray-700 hover:bg-blue-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2 py-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-50"
                >
                  <ChevronRight size={20} className="text-blue-600" />
                </button>
              </div>
            </div>
          )}
          </>
          )}
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-xl border-2 border-blue-100">
            <div className="p-4 border-b border-blue-100 flex items-center justify-between sticky top-0 bg-gradient-to-r from-blue-50 to-white z-10">
              <h3 className="text-lg font-bold text-gray-900">Chi tiết người dùng</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    setEditingUser(selectedUser);
                    setSelectedUser(null);
                  }}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                >
                  <Edit size={16} />
                  Chỉnh sửa
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                {selectedUser.avatarUrl ? (
                  <img 
                    src={selectedUser.avatarUrl} 
                    alt={selectedUser.fullName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-xl">
                      {selectedUser.fullName?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-gray-900 truncate">{selectedUser.fullName || 'N/A'}</h4>
                  {selectedUser.displayName && (
                    <p className="text-sm text-gray-500">@{selectedUser.displayName}</p>
                  )}
                  <p className="text-sm text-gray-600 truncate">{selectedUser.email || 'N/A'}</p>
                  <div className="mt-1.5">{getStatusBadge(selectedUser.isActive)}</div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-sm font-semibold text-gray-900">Thông tin cá nhân</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <p className="text-xs text-gray-600 mb-1">Vai trò</p>
                    <p className="text-sm font-semibold text-gray-900">{getRoleBadge(selectedUser.role)}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <p className="text-xs text-gray-600 mb-1">Trạng thái</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedUser.isActive ? 'Hoạt động' : 'Bị khóa'}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <p className="text-xs text-gray-600 mb-1">Tên hiển thị</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedUser.displayName || <span className="text-gray-400 italic">Chưa có</span>}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <p className="text-xs text-gray-600 mb-1">Số điện thoại</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedUser.phone || 'N/A'}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 col-span-2">
                    <p className="text-xs text-gray-600 mb-1">Địa chỉ</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedUser.address || 'N/A'}</p>
                  </div>
                  {selectedUser.bio && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 col-span-2">
                      <p className="text-xs text-gray-600 mb-1">Giới thiệu bản thân</p>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedUser.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border-2 border-blue-100">
            <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white">
              <h3 className="text-xl font-bold text-gray-900">Chỉnh sửa người dùng</h3>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                fullName: formData.get('fullName') as string,
                displayName: formData.get('displayName') as string,
                phone: formData.get('phone') as string,
                avatarUrl: formData.get('avatarUrl') as string,
                bio: formData.get('bio') as string,
                address: formData.get('address') as string,
              };
              handleUpdateUser(editingUser.id, data);
            }}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên đầy đủ *</label>
                  <input
                    type="text"
                    name="fullName"
                    defaultValue={editingUser.fullName}
                    className="w-full px-4 py-2 border border-blue-200 bg-blue-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên hiển thị</label>
                  <input
                    type="text"
                    name="displayName"
                    defaultValue={editingUser.displayName || ''}
                    placeholder="Nhập tên hiển thị"
                    className="w-full px-4 py-2 border border-blue-200 bg-blue-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingUser.phone || ''}
                    placeholder="Nhập số điện thoại"
                    className="w-full px-4 py-2 border border-blue-200 bg-blue-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Ảnh đại diện</label>
                  <input
                    type="url"
                    name="avatarUrl"
                    defaultValue={editingUser.avatarUrl || ''}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-4 py-2 border border-blue-200 bg-blue-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">Nhập đường dẫn URL đến ảnh đại diện</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ *</label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={editingUser.address || ''}
                    placeholder="Nhập địa chỉ"
                    className="w-full px-4 py-2 border border-blue-200 bg-blue-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu bản thân</label>
                  <textarea
                    name="bio"
                    defaultValue={editingUser.bio || ''}
                    placeholder="Nhập giới thiệu về bản thân"
                    rows={4}
                    className="w-full px-4 py-2 border border-blue-200 bg-blue-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Thông tin chỉ xem</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-600">Email</p>
                      <p className="text-sm font-semibold text-gray-900">{editingUser.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Vai trò</p>
                      <p className="text-sm font-semibold text-gray-900">{getRoleBadge(editingUser.role)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Trạng thái</p>
                      <div className="mt-1">{getStatusBadge(editingUser.isActive)}</div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">ID</p>
                      <p className="text-xs font-mono text-gray-900 break-all">{editingUser.id}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-blue-100 flex justify-end gap-3 bg-gradient-to-r from-blue-50 to-white">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-6 py-2 bg-white border-2 border-blue-200 text-gray-700 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition-all hover:shadow-lg"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
