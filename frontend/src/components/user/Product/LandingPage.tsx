import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import banner1 from "../../../assets/banner_header1.jpg";
import banner2 from "../../../assets/banner_header2.jpg";
import banner3 from "../../../assets/banner_header3.jpg";
import banner4 from "../../../assets/banner_header4.png";
import "./LandingPage.scss";
import { FaStar } from "react-icons/fa6";
import { getTopSellingLaptop, getTopSellingPhone} from "../../../services/apiServices";
import { toast } from "react-toastify";
import { FcCellPhone } from "react-icons/fc";
import { ImFire } from "react-icons/im";
import type { ProductSummary } from "../../../interfaces";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const banners = [banner1, banner2, banner3, banner4];

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [topLaptops, setTopLaptops] = useState<ProductSummary[]>([]);
  const [topPhones, setTopPhones] = useState<ProductSummary[]>([]);



  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 15000);

    const fetchTopSelling = async () => {
      try {
        const [laptopRes, phoneRes] = await Promise.all([
          getTopSellingLaptop(),
          getTopSellingPhone(),
        ]);
        
        if (laptopRes?.data?.success && laptopRes.data?.data?.products) {
          setTopLaptops(laptopRes.data.data.products);
        }
        
        if (phoneRes?.data?.success && phoneRes.data?.data?.products) {
          setTopPhones(phoneRes.data.data.products);
        }
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm bán chạy:", err);
        toast.error("Không thể tải danh sách sản phẩm bán chạy");
      }
    };

    fetchTopSelling();
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (id: number) => {
    navigate(`/product/${id}`);
  };

  const navigateProduct = () =>{
    navigate('/product');
  }

  const renderProducts = (list: ProductSummary[] = []) =>
    list.map((item) => {
      const imgUrl = item.imageUrls?.length
  ? (item.imageUrls[0].startsWith("/") ? `${BASE_URL}${item.imageUrls[0]}` : item.imageUrls[0])
  : "/no-image.png";
      const avgRating = Number(item.avgRating || 0).toFixed(2);
      const totalReviews = item.totalReviews || "0";

      const hasDiscount = item.coupon > 0;
      const newPrice = item.price?.toLocaleString("vi-VN") + "đ";
      const oldPrice = item.originalPrice?.toLocaleString("vi-VN") + "đ";

      return (
        <div key={item.id} className="product-card">
          {hasDiscount && <div className="discount">-{item.coupon}%</div>}
          <img
            src={imgUrl}
            alt={item.name}
            onClick={() => handleNavigate(item.id)}
            style={{ cursor: "pointer" }}
          />
          <div className="info">
            <div className="rating">
              <FaStar className="star"/> {avgRating} <span>({totalReviews})</span>
            </div>
            <h3>{item.name}</h3>
            <div className={`price ${!hasDiscount ? "center" : ""}`}>
              <span className="new">{newPrice}</span>
              {hasDiscount && <span className="old">{oldPrice}</span>}
            </div>
          </div>
        </div>
      );
    });

  return (
    <div className="landing-page">
      {/* ===== HERO BANNER ===== */}
      <section className="header__hero">
        <div className="header__hero-content">
          <h4>100% Sản Phẩm Chính Hãng</h4>
          <h1>
            Trải nghiệm khác biệt <br />
            <span>Deal hot mỗi ngày</span>
          </h1>
          <button className="hero-btn" onClick={() => navigateProduct()}>Mua ngay</button>
        </div>
        <div className="header__hero-image">
          <img src={banners[currentBanner]} alt="Banner" />
        </div>
      </section>

      {/* ===== TOP LAPTOP ===== */}
      <section className="bestseller">
        <div className="bestseller__header">
          <h2><ImFire className="fire"/> Top Laptop Bán Chạy</h2>
        </div>
        <div className="bestseller__list">
          {topLaptops.length ? renderProducts(topLaptops) : <p>Đang tải dữ liệu...</p>}
        </div>
      </section>

      {/* ===== TOP PHONE ===== */}
      <section className="bestseller">
        <div className="bestseller__header">
          <h2><FcCellPhone className='phone'/> Top Điện Thoại Bán Chạy</h2>
        </div>
        <div className="bestseller__list">
          {topPhones.length ? renderProducts(topPhones) : <p>Đang tải dữ liệu...</p>}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
