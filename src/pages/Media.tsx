import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Image as ImageIcon, 
  Search, 
  Eye,
  Trash2,
  File,
  Video,
  FileText,
  Filter
} from 'lucide-react';
import { Media } from '../types/media';
import mediaService from '../services/mediaService';
import toast, { Toaster } from 'react-hot-toast';

export default function MediaPage() {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Note: Since we don't have a "get all media" endpoint, 
  // you would need to fetch media when you have specific IDs
  // For demo purposes, this shows the UI structure
  
  const handleViewDetail = async (mediaId: string) => {
    setLoadingDetail(true);
    try {
      const media = await mediaService.getMediaById(mediaId);
      setSelectedMedia(media);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching media detail:', error);
      toast.error('Có lỗi xảy ra khi tải chi tiết media!');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDeleteClick = (media: Media) => {
    setSelectedMedia(media);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMedia) return;

    try {
      await mediaService.deleteMedia(selectedMedia.id);
      setMediaList(mediaList.filter(m => m.id !== selectedMedia.id));
      setShowDeleteModal(false);
      toast.success('Xóa media thành công!');
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('Có lỗi xảy ra khi xóa media!');
    }
  };

  const getMediaIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon size={20} className="text-blue-600" />;
    } else if (fileType.startsWith('video/')) {
      return <Video size={20} className="text-purple-600" />;
    } else if (fileType.includes('pdf') || fileType.includes('document')) {
      return <FileText size={20} className="text-red-600" />;
    } else {
      return <File size={20} className="text-gray-600" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      profile: { color: 'bg-blue-100 text-blue-800', label: '👤 Profile' },
      product: { color: 'bg-green-100 text-green-800', label: '📦 Product' },
      chat: { color: 'bg-purple-100 text-purple-800', label: '💬 Chat' },
      document: { color: 'bg-orange-100 text-orange-800', label: '📄 Document' },
      other: { color: 'bg-gray-100 text-gray-800', label: '📁 Other' },
    };

    const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.other;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredMedia = (mediaList || []).filter(media => {
    if (!media) return false;
    
    const matchesSearch = 
      media.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      media.fileType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      media.userId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || media.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#363636',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Media</h1>
              <p className="text-gray-600">Quản lý và theo dõi file media trên nền tảng</p>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl">
              <ImageIcon className="text-blue-600" size={20} />
              <span className="text-sm font-medium text-blue-600">Tổng: {filteredMedia.length} files</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên file, loại, user ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Tất cả danh mục</option>
                <option value="profile">Profile</option>
                <option value="product">Product</option>
                <option value="chat">Chat</option>
                <option value="document">Document</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Media Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {filteredMedia && filteredMedia.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
                  {filteredMedia.map((media) => (
                    <div key={media.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Preview */}
                      <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                        {media.fileType.startsWith('image/') ? (
                          <img 
                            src={media.thumbnailUrl || media.url} 
                            alt={media.fileName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`flex items-center justify-center w-full h-full ${media.fileType.startsWith('image/') ? 'hidden' : ''}`}>
                          {getMediaIcon(media.fileType)}
                        </div>
                        {getCategoryBadge(media.category)}
                        <div className="absolute top-2 right-2">
                          {getCategoryBadge(media.category)}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <h3 className="font-medium text-gray-900 truncate mb-1" title={media.fileName}>
                          {media.fileName}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">
                          {formatFileSize(media.fileSize)} • {media.fileType}
                        </p>
                        <div className="text-xs text-gray-500 mb-3">
                          {new Date(media.uploadedAt).toLocaleDateString('vi-VN')}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetail(media.id)}
                            disabled={loadingDetail}
                            className="flex-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                          >
                            <Eye size={14} />
                            Xem
                          </button>
                          <button
                            onClick={() => handleDeleteClick(media)}
                            className="flex-1 px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                          >
                            <Trash2 size={14} />
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <ImageIcon className="text-gray-400 mb-3" size={48} />
                    <p className="text-gray-500 text-lg font-medium">Không có media nào</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {mediaList.length === 0 
                        ? 'Bạn cần nhập ID media để xem chi tiết' 
                        : 'Thử thay đổi bộ lọc hoặc tìm kiếm'}
                    </p>
                  </div>
                </div>
              )}

              <div className="px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Hiển thị {filteredMedia.length} files
                </div>
              </div>
            </>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedMedia && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Chi tiết Media</h3>
              
              {/* Preview */}
              <div className="mb-6">
                {selectedMedia.fileType.startsWith('image/') ? (
                  <img 
                    src={selectedMedia.url} 
                    alt={selectedMedia.fileName}
                    className="w-full max-h-96 object-contain rounded-lg bg-gray-100"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getMediaIcon(selectedMedia.fileType)}
                    <span className="ml-2 text-gray-600">{selectedMedia.fileType}</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Mã Media</p>
                    <p className="font-semibold text-gray-900">{selectedMedia.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tên file</p>
                    <p className="font-semibold text-gray-900">{selectedMedia.fileName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Loại file</p>
                    <p className="font-semibold text-gray-900">{selectedMedia.fileType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Kích thước</p>
                    <p className="font-semibold text-gray-900">{formatFileSize(selectedMedia.fileSize)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">User ID</p>
                    <p className="font-semibold text-gray-900">{selectedMedia.userId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Danh mục</p>
                    {getCategoryBadge(selectedMedia.category)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày upload</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedMedia.uploadedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  {selectedMedia.metadata && (
                    <div>
                      <p className="text-sm text-gray-600">Metadata</p>
                      <p className="font-semibold text-gray-900">
                        {selectedMedia.metadata.width && selectedMedia.metadata.height && 
                          `${selectedMedia.metadata.width}x${selectedMedia.metadata.height}`}
                        {selectedMedia.metadata.duration && 
                          ` • ${selectedMedia.metadata.duration}s`}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">URL</p>
                  <a 
                    href={selectedMedia.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm break-all"
                  >
                    {selectedMedia.url}
                  </a>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
                <a
                  href={selectedMedia.url}
                  download={selectedMedia.fileName}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tải xuống
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedMedia && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Xác nhận xóa</h3>
              <p className="text-gray-600 mb-2">
                Bạn có chắc chắn muốn xóa media này?
              </p>
              <p className="text-sm text-gray-500 mb-4">
                File: <span className="font-semibold">{selectedMedia.fileName}</span>
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

