import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import authService from '../services/authService';
import { AxiosError } from 'axios';
import { ApiError } from '../types/auth';
import Toast, { ToastType } from '../components/Toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);
    setLoading(true);

    try {
      // Gọi API login
      await authService.login({
        email,
        password,
      });

      // Đăng nhập thành công, hiển thị toast
      setToast({ message: 'Đăng nhập thành công!', type: 'success' });
      
      // Chuyển hướng đến dashboard sau 1 giây
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      // Xử lý lỗi
      const axiosError = err as AxiosError<ApiError>;
      if (axiosError.response?.data?.message) {
        setToast({ message: axiosError.response.data.message, type: 'error' });
      } else {
        setToast({ message: 'Đăng nhập thất bại. Vui lòng thử lại!', type: 'error' });
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl items-center justify-center mb-4 shadow-2xl shadow-primary-200 hover:scale-105 transition-transform duration-300">
            <span className="text-white font-bold text-3xl">EV</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">Đăng nhập Admin</h1>
          <p className="text-gray-600">Quản trị nền tảng mua bán xe điện & pin</p>
        </div>

        <div className="glass-effect rounded-3xl shadow-2xl border border-slate-200/50 p-8 hover:shadow-3xl transition-all duration-300">

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent bg-white/80 focus:bg-white shadow-sm hover:shadow-md transition-all"
                  placeholder="admin@evmarket.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent bg-white/80 focus:bg-white shadow-sm hover:shadow-md transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Nhớ mật khẩu</span>
              </label>
              <button type="button" className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3.5 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl disabled:from-primary-300 disabled:to-primary-400 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">Chưa có tài khoản? </span>
            <Link to="/register" className="text-sm text-primary-600 hover:text-primary-700 font-semibold transition-colors">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
