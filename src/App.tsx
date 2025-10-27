import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Listings from './pages/Listings';
import Products from './pages/Products';
import Transactions from './pages/Transactions';
import Fees from './pages/Fees';
import Reports from './pages/Reports';
import Orders from './pages/Orders';
import Escrows from './pages/Escrows';
import Chats from './pages/Chats';
import Media from './pages/Media';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/products" element={<Products />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/escrows" element={<Escrows />} />
        <Route path="/chats" element={<Chats />} />
        <Route path="/media" element={<Media />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/fees" element={<Fees />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
