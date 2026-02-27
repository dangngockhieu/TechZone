import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { doLogout } from '../../redux/slices/userSlice';
import { clearCart } from "../../redux/slices/cartSlice";
import { logout } from "../../services/apiServices";
import { toast } from 'react-toastify';
import { BsJustify, BsList } from "react-icons/bs";
type AdminHeaderProps = {
  onToggleCollapse: () => void;
  onToggleMobile?: () => void;
};

const AdminHeader = ({ onToggleCollapse, onToggleMobile }: AdminHeaderProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { account } = useAppSelector((state) => state.user);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
        await logout();
    } catch {
        toast.error('Logout request failed');
      }
    dispatch(doLogout());
    dispatch(clearCart());
    navigate('/login');
  };

  return (
    <header className="admin-header">
      <div className="admin-header__left">
        {!isMobile && (
          <button className="btn-toggle" onClick={onToggleCollapse} aria-label="Toggle sidebar">
            <BsJustify style={{ justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem' }} />
          </button>
        )}

        {isMobile && (
          <button className="btn-mobile" onClick={() => onToggleMobile && onToggleMobile()} aria-label="Open mobile menu">
            <BsList size={20} style={{ justifyContent: 'center', alignItems: 'center' }} />
          </button>
        )}

        <span className="header-title">Dashboard</span>
      </div>

      <div className="admin-header__right">
        <span className="admin-user">Xin chào, {account?.name || 'Admin'}</span>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
};

export default AdminHeader;
