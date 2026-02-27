import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { Outlet } from 'react-router-dom';
import './Admin.scss';

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = () => setCollapsed((c) => !c);
  const toggleMobile = () => setMobileOpen((m) => !m);
  const closeMobile = () => setMobileOpen(false);

  return (
    <div className={`admin-root ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <AdminSidebar collapsed={collapsed} mobileOpen={mobileOpen} onCloseMobile={closeMobile} />
      <div className="admin-main">
        <AdminHeader onToggleCollapse={toggleCollapsed} onToggleMobile={toggleMobile} />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
      {mobileOpen && <div className="admin-overlay" onClick={closeMobile} aria-hidden="true" />}
    </div>
  );
};

export default AdminLayout;
 
