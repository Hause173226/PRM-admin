import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users,  Package, ShoppingCart} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Trang chủ' },
  { path: '/users', icon: Users, label: 'Quản lý Người dùng' },
  // { path: '/listings', icon: FileText, label: 'Quản lý Tin đăng' },
  { path: '/products', icon: Package, label: 'Quản lý Sản phẩm' },
  { path: '/orders', icon: ShoppingCart, label: 'Quản lý Đơn hàng' },
  // { path: '/escrows', icon: Shield, label: 'Quản lý Escrow' },
  // { path: '/chats', icon: MessageSquare, label: 'Quản lý Chat' },
  // { path: '/media', icon: Image, label: 'Quản lý Media' },
  // { path: '/transactions', icon: Receipt, label: 'Quản lý Giao dịch' },
  // { path: '/fees', icon: DollarSign, label: 'Quản lý Phí & Hoa hồng' },
  // { path: '/reports', icon: BarChart3, label: 'Quản lý Báo cáo' }
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-50 to-white border-r border-blue-100 min-h-screen fixed left-0 top-0 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">EV</span>
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">EV Market</h1>
            <p className="text-xs text-gray-600">Admin Portal</p>
          </div>
        </div>
      </div>

      <nav className="p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-500 text-white font-medium shadow-md'
                      : 'text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
