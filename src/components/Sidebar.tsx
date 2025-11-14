import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users,  Package, ShoppingCart, Shield} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Trang chủ' },
  { path: '/users', icon: Users, label: 'Quản lý Người dùng' },
  // { path: '/listings', icon: FileText, label: 'Quản lý Tin đăng' },
  { path: '/products', icon: Package, label: 'Quản lý Sản phẩm' },
  { path: '/orders', icon: ShoppingCart, label: 'Quản lý Đơn hàng' },
  { path: '/escrows', icon: Shield, label: 'Quản lý Escrow' },
  // { path: '/chats', icon: MessageSquare, label: 'Quản lý Chat' },
  // { path: '/media', icon: Image, label: 'Quản lý Media' },
  // { path: '/transactions', icon: Receipt, label: 'Quản lý Giao dịch' },
  // { path: '/fees', icon: DollarSign, label: 'Quản lý Phí & Hoa hồng' },
  // { path: '/reports', icon: BarChart3, label: 'Quản lý Báo cáo' }
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 glass-effect border-r border-slate-200/50 min-h-screen fixed left-0 top-0 shadow-xl">
      <div className="p-6 border-b border-slate-200/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">EV</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-800">EV Market</h1>
            <p className="text-xs text-gray-500">Admin Portal</p>
          </div>
        </div>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-400 to-primary-500 text-white font-medium shadow-lg shadow-primary-200'
                      : 'text-gray-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50 hover:text-primary-700 hover:shadow-md'
                  }`}
                >
                  <Icon size={20} className={`${isActive ? '' : 'group-hover:scale-110'} transition-transform duration-300`} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
