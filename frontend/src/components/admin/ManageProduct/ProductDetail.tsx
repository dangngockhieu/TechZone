import { useState} from "react";
import "./ProductDetail.scss";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { IoMdClose } from "react-icons/io";
import type { ProductPaginate } from '../../../interfaces';
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const ProductDetail = ({ show, setShow, product }:{show: boolean, setShow: React.Dispatch<React.SetStateAction<boolean>>, product: ProductPaginate}) => {
  const [zoomImg, setZoomImg] = useState<string | null>(null);

  if (!show || !product) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <button className="modal-close-btn" onClick={() => setShow(false)}>
          <IoMdClose />
        </button>
        <h4>Chi tiết sản phẩm</h4>

        {/* ========== ẢNH SẢN PHẨM ========== */}
        <div className="image-gallery">
          {/* Lọc các phần tử null/rỗng */}
          {product?.images?.filter(img => img)?.length > 0 ? (
          product.images.filter(img => img).map((img, i) => ( 
            <div key={i} className="gallery-item">
              <img
                src={`${BASE_URL}${img.url?.startsWith("/") ? img.url : "/" + img.url}`}
                alt={`img-${i}`}
                onClick={() =>
                  setZoomImg(`${BASE_URL}${img.url?.startsWith("/") ? img.url : "/" + img.url}`)
                }
                onError={(e) => ((e.target as HTMLImageElement).src = "/no-image.png")}
              />
            </div>
          ))
          ) : (
            <p>Không có ảnh</p>
          )}
        </div>

        {/* ========== THÔNG TIN SẢN PHẨM ========== */}
        <div className="detail-info">
          <h5>Thông tin chung</h5>
          <div className="detail-grid">
            <p><strong>Tên:</strong> {product.name}</p>
            <p><strong>Giá:</strong> {product.originalPrice?.toLocaleString()}₫</p>
            <p><strong>Giảm giá:</strong> {product.coupon ?? 0}%</p>
            <p><strong>Số lượng:</strong> {product.quantity}</p>
            <p><strong>Bảo hành:</strong> {product.warranty}</p>
            <p><strong>Năm phát hành:</strong> {product.releaseYear}</p>
            <p><strong>Danh mục:</strong> {product.category}</p>
            <p><strong>Hãng:</strong> {product.factory}</p>
          </div>

          <h5>Thông số kỹ thuật</h5>
          <div className="detail-grid">
            <p><strong>CPU:</strong> {product.cpu}</p>
            <p><strong>RAM:</strong> {product.ram}</p>
            <p><strong>Lưu trữ:</strong> {product.storage}</p>
            <p><strong>Màn hình:</strong> {product.screen}</p>
            <p><strong>Card đồ họa:</strong> {product.graphicsCard}</p>
            <p><strong>Pin:</strong> {product.battery}</p>
            <p><strong>Trọng lượng:</strong> {product.weight}</p>
          </div>

          <div className="detail-group-container">
              <div className="detail-group-item">
                  <h5>Đặc điểm phân loại</h5>
                  {product?.features?.filter(feature => feature)?.length > 0 ? (
                  product.features.filter(feature => feature).map((feature, i) => ( 
                    <div key={feature.id || i} className="detail-extra">{feature.name}</div>
                  ))
                  ) : (
                    <p>Không có Đặc điểm</p>
                  )}
              </div>
              
              {product.infor && (
                <div className="detail-group-item">
                  <h5>Thông tin thêm</h5>
                  <div className="detail-extra">{product.infor}</div>
                </div>
              )}
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShow(false)}
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Overlay zoom ảnh */}
      {zoomImg && (
        <div className="zoom-overlay" 
          onClick={() => setZoomImg(null)} 
        >
          <div  style={{ width: '100%', height: '100%' }}>
            <TransformWrapper wheel={{ step: 0.2 }} >
              <TransformComponent 
                wrapperStyle={{ width: "100%", height: "100%" }}
                contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <img src={zoomImg} 
                  alt="zoomed" 
                  className="zoomed-img" 
                  style={{ maxHeight: "90vh", maxWidth: "90vw" }} 
                />
              </TransformComponent>
            </TransformWrapper>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
