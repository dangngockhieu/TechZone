import { useState } from 'react';
import './ChangePassword.scss'; 
import { changePassword } from '../../services/apiServices';
import { toast } from 'react-toastify';
import { BsEye, BsEyeSlash } from "react-icons/bs";

const ChangePassword = ({ onClose }:{ onClose: () => void }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu mới và xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword(oldPassword, newPassword);
      if (res?.data?.success) {
        toast.success('Đổi mật khẩu thành công.');
        onClose();
        return;
      }

      toast.error(res?.data?.message || 'Đổi mật khẩu thất bại');
    } catch {
      toast.error('Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Đổi mật khẩu</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          
          <label>
            Mật khẩu cũ
            <div className="password-input-wrapper">
              <input
                type={showOldPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu cũ"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowOldPassword(!showOldPassword)}>
                {showOldPassword ? <BsEyeSlash className="eye" /> : <BsEye className="eye" />}
              </button>
            </div>
          </label>

          <label>
            Mật khẩu mới
            <div className="password-input-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                placeholder="Nhập mật khẩu mới"
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}>
                {showNewPassword ? <BsEyeSlash className="eye" /> : <BsEye className="eye" />}
              </button>
            </div>
          </label>

          <label>
            Xác nhận mật khẩu mới
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <BsEyeSlash className="eye" /> : <BsEye className="eye" />}
              </button>
            </div> 
          </label>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Đang...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
