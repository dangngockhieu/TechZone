import { useState} from "react";
import {useNavigate} from 'react-router-dom';
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { Link } from "react-router-dom";
import { BsFastForwardFill } from "react-icons/bs";
import { toast } from "react-toastify";
import { changePassword } from "../services/apiServices";
import "./changePassword.scss";


export default function ChangePassword() {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(newPassword.length < 6){
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }
    if(newPassword.length > 20){
      toast.error("Mật khẩu mới không được vượt quá 20 ký tự!");
      return;
    }
    const res = await changePassword(oldPassword, newPassword);
    if (res && res?.data?.success) {
      toast.success("Đặt lại mật khẩu thành công!.");
      setOldPassword("");
      setNewPassword("");
      navigate('/');
    } else {
      toast.error(res?.data?.message || "Đặt lại mật khẩu thất bại!");
    } 
  };

  return (
    <div className="reset-wrap">
      <div className="reset-card">
        <h2>Đổi mật khẩu</h2>
        <p className="muted">
          Nhập mật khẩu cũ và mật khẩu mới để đổi tài khoản của bạn.
        </p>

        <form onSubmit={handleSubmit} className="form">
          <div className="field password">
            <label>Mật khẩu cũ</label>
            <div className="input-wrap">
              <input
                type={showOldPassword ? "text" : "password"}
                name="oldPassword"
                placeholder="Nhập mật khẩu cũ"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                {showOldPassword ? (
                  <BsEyeSlash className="eye" />
                ) : (
                  <BsEye className="eye" />
                )}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="field password">
            <label>Mật khẩu mới</label>
            <div className="input-wrap">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <BsEyeSlash className="eye" />
                ) : (
                  <BsEye className="eye" />
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="submit">
            Xác đổi mật khẩu
          </button>
        </form>

        <Link to="/" className="back-to-login">
          <BsFastForwardFill className="icon" />Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
}
