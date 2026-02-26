import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { RootState } from '../redux/store';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, account } = useSelector((state: RootState) => state.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (account?.role !== 'ADMIN') {
    toast.error('Bạn không có quyền truy cập trang này!');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
