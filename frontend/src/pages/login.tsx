import { useState } from 'react';
import './login.scss';
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { login, sendResetPassword } from '../services/apiServices';
import { useAppDispatch } from '../redux/hooks';
import { setAccount } from '../redux/slices/userSlice';
import { IoMdCheckboxOutline } from "react-icons/io";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const resetPassword = async () => {
    if (!email) {
      toast.warn("Vui lòng nhập email trước khi đặt lại mật khẩu.");
      return;
    }
    try {
      await sendResetPassword(email);
      toast.info("Vui lòng kiểm tra email để đặt lại mật khẩu.");
      navigate("/reset-password");
    } catch {
      toast.error("Gửi email đặt lại mật khẩu thất bại.");
    }
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    const validateEmail = (email: string) => {
      return String(email).toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
    };
    if (!validateEmail(email)) {
      toast.error("Vui lòng nhập đúng định dạng email.");
      return;
    }

    // const validatePassword = (pw) => {
    // return /[A-Z]/       .test(pw) &&
    //        /[a-z]/       .test(pw) &&
    //        /[0-9]/       .test(pw) &&
    //        /[^A-Za-z0-9]/.test(pw) &&
    //        pw.length > 6 && pw.length < 20;

    // };
    // if (!validatePassword(password)) {
    //   toast.error("Mật khẩu phải chứa chữ hoa, chữ thường, số, ký tự đặc biệt và từ 6-20 ký tự.");
    //   return;
    // }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await login(email, password);

      if (!res?.data?.success) {
        toast.error(res?.data?.message || "Đăng nhập thất bại.");
        return;
      }

      const access = res?.data?.data?.access_token;
      const user = res?.data?.data?.user;

      if (access) {
        localStorage.setItem('access_token', access);
      }

      toast.success("Đăng nhập thành công!");

      dispatch(
        setAccount({
          ...(user ?? {}),
          access_token: access,
        })
      );

      // Reset input
      setEmail('');
      setPassword('');

      if(user?.role === 'ADMIN') {
        navigate('/admin');
        return;
      }
      // Chuyển hướng về trang chủ
      navigate('/');
    } catch{
      toast.error("Đã có lỗi xảy ra khi đăng nhập");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <aside className="login-card__info" aria-hidden="true">
          <div className="brand">
            <h3 className="brand__title">TechZone</h3>
          </div>

          <div className="intro">
            <h4>Chào mừng trở lại!</h4>
            <p>
              Khám phá những sản phẩm công nghệ mới nhất với giá tốt nhất.
              Điện thoại và laptop chính hãng, bảo hành toàn diện.
            </p>
          </div>

          <ul className="benefits">
            <li><span className="check"><IoMdCheckboxOutline style={{ fontSize: "1.2rem"}} /></span> Sản phẩm chính hãng 100%</li>
            <li><span className="check"><IoMdCheckboxOutline style={{ fontSize: "1.2rem"}} /></span> Bảo hành uy tín</li>
            <li><span className="check"><IoMdCheckboxOutline style={{ fontSize: "1.2rem"}} /></span> Giao hàng miễn phí</li>
          </ul>
        </aside>

        <main className="login-card__form" aria-label="Login form">
          <header className="form-header">
            <h2>Đăng nhập</h2>
            <p className="muted">Đăng nhập để trải nghiệm mua sắm tốt nhất</p>
          </header>

          <form onSubmit={handleLogin} className="form">
            <label className="field">
              <span className="field__label">Địa chỉ Email</span>
              <div className="field__input">
                <i className="fa-regular fa-envelope" aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Nhập Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </label>

            <label className="field">
              <div className="field__label-row">
                <span className="field__label">Mật khẩu</span>
                <span className="forgot" onClick={resetPassword}>
                  Quên mật khẩu?
                </span>
              </div>
              <div className="field__input">
                <i className="fa-solid fa-lock" aria-hidden="true" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
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
            </label>

            <button type="submit" className="submit" disabled={isLoading}>
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <div className="divider"><span>hoặc</span></div>

            <p className="signup">
              Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </p>
          </form>
        </main>
      </div>
    </div>
  );
};

export default Login;
