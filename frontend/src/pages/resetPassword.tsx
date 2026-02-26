import { useState } from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { Link } from "react-router-dom";
import { BsFastForwardFill } from "react-icons/bs";
import { toast } from "react-toastify";
import { sendResetPassword, resetPassword } from "../services/apiServices";
import "./resetPassword.scss";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }
    const res = await resetPassword(email, code, newPassword);
    if (res && res?.data?.success) {
      toast.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
    } else {
      toast.error(res?.data?.message || "Đặt lại mật khẩu thất bại!");
    } 
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Vui lòng nhập email trước khi gửi lại mã!");
      return;
    }
    const res = await sendResetPassword(email);
    setSending(true);
    if (res && res?.data?.success) {
      toast.success(`Đã gửi lại mã xác nhận đến ${email}`);
    } else {
      toast.error(res?.data?.message || "Gửi lại mã xác nhận thất bại!");
    }
    setSending(false);
  };

  return (
    <div className="reset-wrap">
      <div className="reset-card">
        <h2>Đặt lại mật khẩu</h2>
        <p className="muted">
          Nhập email, mã xác nhận và mật khẩu mới để đặt lại tài khoản của bạn.
        </p>

        <form onSubmit={handleSubmit} className="form">
          {/* Email */}
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="Nhập Email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field resend">
            <label>Mã xác nhận</label>
            <div className="code-group">
              <input
                type="text"
                name="code"
                placeholder="Nhập mã xác nhận"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
              <button
                type="button"
                className={`resend-btn ${sending ? "sending" : ""}`}
                onClick={handleResend}
                disabled={sending}
              >
                {sending ? "Đang gửi..." : "Gửi lại mã"}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="field password">
            <label>Mật khẩu mới</label>
            <div className="input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <BsEyeSlash className="eye" />
                ) : (
                  <BsEye className="eye" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm new password */}
          <div className="field password">
            <label>Xác nhận mật khẩu mới</label>
            <div className="input-wrap">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmNewPassword"
                placeholder="Xác nhận mật khẩu mới"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? (
                  <BsEyeSlash className="eye" />
                ) : (
                  <BsEye className="eye" />
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="submit">
            Xác nhận đặt lại mật khẩu
          </button>
        </form>

        <Link to="/login" className="back-to-login">
          <BsFastForwardFill className="icon" />Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}
