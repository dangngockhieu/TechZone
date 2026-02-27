import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Product_Detail.scss";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
import { FaStar, FaRegCircleCheck } from "react-icons/fa6";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { setCartCount } from "../../../redux/slices/cartSlice";
import { addProductToCart, getNumberCart, getProductByID, buyNow } from "../../../services/apiServices";
import { toast } from "react-toastify";
import type { ProductDetail, Review } from "../../../interfaces/product.interface";

const Product_Detail = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const { id } = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviewsData, setReviewsData] = useState<Review[]>([]);
  const [filter, setFilter] = useState(0);
  const [indexImage, setIndexImage] = useState(0);
  const reviewsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        try {
          const response = await getProductByID(id);
          if (response && response?.data?.success && response?.data?.data) {
            setProduct(response.data.data.product);
            setReviewsData(response.data.data.reviews);
          }
        } catch (error) {
          console.error("Lỗi khi tải sản phẩm", error);
        }
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async (productID: number) => {
  if (!isAuthenticated) {
    toast.warning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
    return;
  }

    const res = await addProductToCart(productID);
    try{
    if (res?.data?.success) {
      toast.success("Đã thêm vào giỏ hàng!");
      const cartRes = await getNumberCart();
      if (cartRes?.data?.success) dispatch(setCartCount(cartRes.data.data.totalCart));
      } 
    } catch {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    }
};

const handleBuyNow = async (productID: number) => {
  if (!isAuthenticated) {
    toast.warning("Vui lòng đăng nhập để mua sản phẩm!");
    return;
  }

    const res = await buyNow(productID);
    try{
    if (res?.data?.success) {
      const cartRes = await getNumberCart();
      if (cartRes?.data?.success) dispatch(setCartCount(cartRes.data.data.totalCart));
      navigate('/cart');
    } 
    } catch {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    }
};

  const handleScrollToReviews = () => {
    if (reviewsRef.current) {
      reviewsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  if (!product) {
    return <div>Đang tải thông tin sản phẩm...</div>;
  }

  const hasDiscount = product?.coupon > 0;
  const newPrice = product?.price?.toLocaleString("vi-VN") + "đ";
  const oldPrice = product?.originalPrice?.toLocaleString("vi-VN") + "đ";
  const allReviews = reviewsData || [];
  const totalReviewsCount = allReviews.length;

  // Lọc theo số sao
  const filteredReviews =
    filter === 0 ? allReviews : allReviews.filter((r) => r.rating === filter);

  return (
    <div className="product-detail">
      <div className="product-header">
        {/* LEFT */}
        <div className="left-column">
          <div className="product-images">
            <img
              src={product.imageUrls[indexImage].startsWith("/") ? `${BASE_URL}${product.imageUrls[indexImage]}` : `${BASE_URL}/${product.imageUrls[indexImage]}`}
              alt={product.name}
              className="main-img"
            />
            <div className="thumbs">
              {product.imageUrls.map((url, idx) => (
                <img
                  key={idx}
                  onClick={() => setIndexImage(idx)}
                  src={url.startsWith("/") ? `${BASE_URL}${url}` : `${BASE_URL}/${url}`}
                  alt=""
                />
              ))}
            </div>
          </div>

          <div className="product-policies">
            <div className="policy-header">
              <h3>Chính sách sản phẩm</h3>
            </div>
            <div className="policy-grid">
              <div className="policy-item">
                <FaRegCircleCheck className="policy-icon" />
                Hàng chính hãng - Chất lượng tốt
              </div>
              <div className="policy-item">
                <FaRegCircleCheck className="policy-icon" />
                Giao hàng miễn phí toàn quốc
              </div>
              <div className="policy-item">
                <FaRegCircleCheck className="policy-icon" />
                Hỗ trợ cài đặt miễn phí
              </div>
              <div className="policy-item">
                <FaRegCircleCheck className="policy-icon" />
                Kỹ thuật viên hỗ trợ trực tuyến
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="product-info">
          <h1>{product.name}</h1>
          <div className="rating">
            <span>
              {product.avgRating} <FaStar className="star" /> (
              {product.totalReviews} đánh giá)
            </span>

            <span className="view-reviews" onClick={handleScrollToReviews}>
              Xem đánh giá
            </span>
          </div>

          <div className={`price ${!hasDiscount ? "center" : ""}`}>
            <span className="new">{newPrice}</span>
            {hasDiscount && <span className="old">{oldPrice}</span>}
            {hasDiscount && <span className="discount">-{product.coupon}%</span>}
          </div>

          <div className="specs">
            <div className="spec-item">
              <strong>CPU</strong>
              <span>{product.cpu}</span>
            </div>
            <div className="spec-item">
              <strong>RAM</strong>
              <span>{product.ram}</span>
            </div>
            <div className="spec-item">
              <strong>Ổ cứng</strong>
              <span>{product.storage}</span>
            </div>
            <div className="spec-item">
              <strong>Màn hình</strong>
              <span>{product.screen}</span>
            </div>
            <div className="spec-item">
              <strong>Card đồ họa</strong>
              <span>{product.graphicsCard}</span>
            </div>
            <div className="spec-item">
              <strong>Pin</strong>
              <span>{product.battery}</span>
            </div>
            <div className="spec-item">
              <strong>Trọng lượng</strong>
              <span>{product.weight}</span>
            </div>
            <div className="spec-item">
              <strong>Năm ra mắt</strong>
              <span>{product.releaseYear}</span>
            </div>
          </div>

          <div className="description">
            <h3>Thông tin sản phẩm</h3>
            <p>{product.infor}</p>
            <p>
              <strong>Bảo hành:</strong> {product.warranty}
            </p>
            <p>
              <strong>Còn lại:</strong> {product.quantity} sản phẩm
            </p>
          </div>

          <div className="actions">
            <button className="add-cart" onClick={() => handleAddToCart(product.id)}>Add To Cart</button>
            <button className="buy-now" onClick={() => handleBuyNow(product.id)}>Buy Now</button>
          </div>
        </div>
      </div>

      {/* ================== REVIEWS ================== */}
      <div className="reviews" ref={reviewsRef}>
        <h3>Đánh giá & Bình luận</h3>
        <div className="review-container">
          {/* LEFT - Tổng quan */}
          <div className="review-summary">
            <div className="score">
              {product.avgRating} <FaStar className="star" />
            </div>
            <p>{totalReviewsCount} lượt đánh giá</p>

            <div className="rating-breakdown">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = allReviews.filter((r) => r.rating === star).length;
                const percent =
                  totalReviewsCount > 0
                    ? Math.round((count / totalReviewsCount) * 100)
                    : 0;
                return (
                  <div key={star} className="rating-row">
                    <span className="star-breakdown">
                      <span style={{ marginRight: "4px" }}>{star}</span>
                      <FaStar className="star-gold" />
                    </span>
                    <div className="bar">
                      <div className="fill" style={{ width: `${percent}%` }}></div>
                    </div>
                    <span className="count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT - Danh sách review */}
          <div className="review-content">
            <div className="filter-buttons">
              {[0, 5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  className={filter === star ? "active" : ""}
                  onClick={() => setFilter(star)}
                >
                  {star === 0 ? (
                    "Tất cả"
                  ) : (
                    <>
                      <span style={{ marginRight: "4px" }}>{star}</span>
                      <FaStar className="filter-star" />
                    </>
                  )}
                </button>
              ))}
            </div>

            <div className="review-list">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((r) => (
                  <div key={r.id} className="review-item">
                    <div className="review-header">
                      <strong>{r.userName}:</strong>
                      <span className="review-date">
                        {new Date(r.createdAt).toLocaleDateString("vi-VN", {
                          timeZone: "Asia/Ho_Chi_Minh",
                        })}
                      </span>
                    </div>
                    <div className="stars">
                      {Array(r.rating)
                        .fill(null)
                        .map((_, idx) => (
                          <FaStar key={idx} className="star-review" />
                        ))}
                    </div>
                    <p>{r.comment}</p>
                  </div>
                ))
              ) : (
                <p>
                  Chưa có bình luận nào{" "}
                  {filter > 0 ? `với ${filter} sao.` : "."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product_Detail;
