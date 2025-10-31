import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  MessageSquare, 
  Search, 
  Eye,
  Send,
  User,
  Clock
} from 'lucide-react';
import { Chat, ChatDetail } from '../types/chat';
import chatService from '../services/chatService';
import Toast, { ToastType } from '../components/Toast';

export default function Chats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedChat, setSelectedChat] = useState<ChatDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const response = await chatService.getAllChats();
      setChats(response.data || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (chatId: string) => {
    setLoadingDetail(true);
    try {
      const chatDetail = await chatService.getChatById(chatId);
      setSelectedChat(chatDetail);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching chat detail:', error);
      setToast({ message: 'Có lỗi xảy ra khi tải chi tiết chat!', type: 'error' });
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredChats = (chats || []).filter(chat => {
    if (!chat) return false;
    
    const matchesSearch = 
      chat.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.participants.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const totalUnread = filteredChats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);

  return (
    <Layout>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Chat</h1>
              <p className="text-gray-600">Theo dõi và quản lý cuộc trò chuyện trên nền tảng</p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-xl">
                <MessageSquare className="text-red-600" size={20} />
                <span className="text-sm font-medium text-red-600">
                  Chưa đọc: {totalUnread}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl">
                <MessageSquare className="text-blue-600" size={20} />
                <span className="text-sm font-medium text-blue-600">
                  Tổng: {filteredChats.length} cuộc trò chuyện
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo ID chat hoặc participants..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Chats Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Mã Chat
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Participants
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Tin nhắn cuối
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Chưa đọc
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Cập nhật
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredChats && filteredChats.length > 0 ? (
                      filteredChats.map((chat) => (
                        <tr key={chat.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">#{chat.id.slice(0, 8)}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <User size={16} className="text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {chat.participants.length} người
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {chat.lastMessage ? (
                              <div className="text-sm">
                                <div className="text-gray-900 truncate max-w-xs">
                                  {chat.lastMessage.content}
                                </div>
                                <div className="text-gray-500 text-xs mt-1">
                                  {chat.lastMessage.type === 'text' ? '💬 Text' : 
                                   chat.lastMessage.type === 'image' ? '🖼️ Image' : '📎 File'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">Chưa có tin nhắn</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {chat.unreadCount > 0 ? (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                {chat.unreadCount}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {new Date(chat.createdAt).toLocaleDateString('vi-VN')}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {new Date(chat.updatedAt).toLocaleDateString('vi-VN')}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => handleViewDetail(chat.id)}
                                disabled={loadingDetail}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Xem chi tiết"
                              >
                                <Eye size={20} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <MessageSquare className="text-gray-400 mb-3" size={48} />
                            <p className="text-gray-500 text-lg font-medium">Không có cuộc trò chuyện nào</p>
                            <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Hiển thị {filteredChats.length} cuộc trò chuyện
                </div>
              </div>
            </>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedChat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Chi tiết Chat</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Mã Chat</p>
                    <p className="font-semibold text-gray-900">#{selectedChat.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Số người tham gia</p>
                    <p className="font-semibold text-gray-900">{selectedChat.participants.length} người</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày tạo</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedChat.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cập nhật cuối</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedChat.updatedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Participants</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedChat.participants.map((participant, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {participant}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Tin nhắn ({selectedChat.messages?.length || 0})</h4>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto space-y-3">
                  {selectedChat.messages && selectedChat.messages.length > 0 ? (
                    selectedChat.messages.map((message) => (
                      <div key={message.id} className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {message.senderId.slice(0, 10)}...
                            </span>
                            {message.type !== 'text' && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                {message.type === 'image' ? '🖼️ Image' : '📎 File'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock size={12} />
                            {new Date(message.createdAt).toLocaleString('vi-VN')}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{message.content}</p>
                        {message.readAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            Đã đọc: {new Date(message.readAt).toLocaleString('vi-VN')}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Send className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-gray-500">Chưa có tin nhắn nào</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

