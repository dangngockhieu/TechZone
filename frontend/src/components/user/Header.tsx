import { useState, useRef, useEffect } from "react";
import { FaUserCircle, FaMapMarkerAlt } from "react-icons/fa";
import { BsCartPlusFill, BsEnvelopeFill, BsCaretDownFill } from "react-icons/bs";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { doLogout } from "../../redux/slices/userSlice";
import { clearCart, setCartCount } from "../../redux/slices/cartSlice";
import { logout } from "../../services/apiServices";
import { useNavigate } from "react-router-dom";
import "./Header.scss";
import ChangePassword from './ChangePassword';
import { NavLink, Link } from "react-router-dom";
import { getNumberCart} from "../../services/apiServices";
import { toast } from "react-toastify";

const Header = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, account } = useAppSelector((state) => state.user);
  const numberCart = useAppSelector((state) => state.cart.totalItems);

  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  

  // Ẩn menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      if (!isAuthenticated) return;
      
      try {
        const res = await getNumberCart();
        if (res?.data?.success && res?.data?.data?.totalCart) {
          dispatch(setCartCount(res.data.data.totalCart));
        }
      } catch (err) {
        console.error('Error fetching cart count:', err);
      }
    };

    fetchCart();
  }, [dispatch, isAuthenticated]);


  const handleLogout = async() => {
      try {
        await logout();
      } catch (err) {
        
        console.error('Logout request failed', err);
      }
      dispatch(doLogout());
      dispatch(clearCart());
      setShowMenu(false);
      navigate('/login');
  };

  const handleOpenCart = () => {
    if(isAuthenticated){
      navigate('/cart');
    }
    else{
      toast.info("Vui lòng đăng nhập để xem giỏ hàng");
    }
  };


  return (
    <header className="header">
      {/* ===== TOP BAR ===== */}
      <div className="header__top">
        <div className="header__top-container">
          <div className="header__top-left">
            <span>
              <FaMapMarkerAlt className="icon" />{" "}
              <span className="top-text">Hồ Chí Minh</span>
            </span>
            <span>
              <BsEnvelopeFill className="icon" />{" "}
              <span className="top-text">laptopshop8386@gmail.com</span>
            </span>
          </div>
          <div className="header__top-right">
            <Link to="privacy">Chính sách bảo mật</Link> / <Link to="warranty">Hỗ trợ Bảo hành</Link>
          </div>
        </div>
      </div>

      {/* ===== NAVBAR ===== */}
      <div className="header__nav">
        <div className="header__logo">
          <h2>
            <span>Tech</span>Zone
          </h2>
        </div>

        <div className="header__menu">
          <NavLink to="/" className="nav-item">
            Trang chủ
          </NavLink>
          <NavLink to="/product" className="nav-item">
            Sản phẩm
          </NavLink>
        </div>

        <div className="header__icons" ref={menuRef}>
          <button className="icon-btn cart left" onClick={handleOpenCart}>
            <BsCartPlusFill />
            <span className="badge">{numberCart ?? 0}</span>
          </button>
          <button
            className="icon-btn"
            onClick={() => setShowMenu((prev) => !prev)}
          > 
            {!isAuthenticated ? (
              <FaUserCircle />
            ) : (
            <img
              src={`https://ui-avatars.com/api/?name=${account?.name || "User"}&background=70b147`}
              alt="Avatar"
              className="avatar"
            />
          )}
            
          </button>

          {showMenu && (
            <div className="user-menu">
              {!isAuthenticated ? (
                <>
                  <Link to="/login" onClick={() => setShowMenu(false)}>
                    Đăng nhập
                  </Link>
                  <Link to="/register" onClick={() => setShowMenu(false)}>
                    Đăng ký
                  </Link>
                </>
              ) : (
                <>
                  <span className="user-name">Xin chào, {account?.name}</span>
                  <div className="setting-menu">
                    <button className="setting-btn" onClick={() => setShowSettings((prev) => !prev)}>
                      Cài đặt <BsCaretDownFill className={`${showSettings ? 'dropdown-icon1' : 'dropdown-icon2'}`} />
                    </button>
                    {showSettings && (
                      <div className="setting-dropdown">
                        <button className="link-btn" onClick={() => { setShowMenu(false); setShowSettings(false); setShowChangePassword(true); }}>- Đổi mật khẩu</button>
                        <button className="link-btn" onClick={() => { setShowMenu(false); setShowSettings(false); navigate('/orders'); }}>- Đơn hàng của tôi</button>
                        {account?.role === 'ADMIN' && (
                          <button className="link-btn" onClick={() => { setShowMenu(false); setShowSettings(false); navigate('/admin'); }}>- Trang quản trị</button>
                        )}
                      </div>
                    )}
                  </div>


                  <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {showChangePassword && (
        <ChangePassword onClose={() => setShowChangePassword(false)} />
      )}
    </header>
  );
};

export default Header;