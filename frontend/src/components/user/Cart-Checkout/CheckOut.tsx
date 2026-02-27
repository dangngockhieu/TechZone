import { useState, useEffect } from 'react';
import './Checkout.scss'; 
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowCircleLeft } from "react-icons/fa";
import { BsCart4 } from "react-icons/bs";
import type { Item } from "../../../interfaces";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { checkoutItems, totalAmount } = location.state || {};

    const items: Item[] = Array.isArray(checkoutItems) ? checkoutItems : [];
    const total = typeof totalAmount === "number" ? totalAmount : 0;

    useEffect(() => {
      if (items.length === 0) {
        toast.warn(" Không tìm thấy dữ liệu giỏ hàng. Đang điều hướng lại.");
      }
    }, [items.length]);

    const methods = [{ label: "Thanh toán khi nhận hàng", value: "COD" },
    { label: "Thanh toán bằng VNPAY", value: "BANK" }
    ];
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [recipient, setRecipient] = useState({
        name: '',
        address: '',
        phone: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRecipient(prev => ({
        ...prev,
        [name]: value
        }));
    };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' đ';
  };
  

  return (
    <div className="checkout-confirmation-container">
      <div className="summary-wrapper"> 
          {items.length > 0 && (
              <div className="order-summary-list">
                  <h2 className="summary-title"><BsCart4 style={{ marginRight: '10px', marginBottom: '7px', fontSize: '24px' }} /> 
                    Tóm Tắt Đơn Hàng ({items.length} sản phẩm)
                  </h2>
                  <ul className="product-list-preview">
                    {items.map(item => (
                      <li key={item.id} className="summary-item">
                        <img src={item.imageUrl.startsWith("/") ? `${BASE_URL}${item.imageUrl}` : `${BASE_URL}/${item.imageUrl}`} alt={item.name} className="item-img-preview" />
                        <div className="product-details-content">
                          <span className="item-name">{item.name}</span>
                        </div>
                        <span className="item-qty">Số lượng: {item.number}</span> 
                        <span className="item-price">{formatCurrency(item.price * item.number)}</span>
                      </li>
                      ))}
                  </ul>
                  <hr className="divider" />
              </div>
          )}
      </div>
      <div className="two-column-layout">
      <div className="recipient-info-block"> 
        <h2 className="block-title">Thông Tin Người Nhận</h2>
        
        <div className="input-group">
          <label htmlFor="recipientName">Tên người nhận</label>
          <input 
            type="text" 
            id="recipientName" 
            name="name"
            value={recipient.name}
            onChange={handleInputChange}
            placeholder="Nhập tên người nhận"
          />
        </div>

        <div className="input-group">
          <label htmlFor="recipientAddress">Địa chỉ người nhận</label>
          <input 
            type="text" 
            id="recipientAddress" 
            name="address"
            value={recipient.address}
            onChange={handleInputChange}
            placeholder="Nhập địa chỉ đầy đủ"
          />
        </div>

        <div className="input-group">
          <label htmlFor="recipientPhone">Số điện thoại</label>
          <input 
            type="tel" 
            id="recipientPhone" 
            name="phone"
            value={recipient.phone}
            onChange={handleInputChange}
            placeholder="Nhập số điện thoại"
          />
        </div>

        <span className="back-to-cart-link" onClick={() => navigate('/cart')}>
          <FaArrowCircleLeft style={{ marginRight: '5px', fontSize: '20px' }} /> Quay lại giỏ hàng
        </span>
      </div>

      <div className="payment-summary-block">
        <h2 className="block-title">Thông Tin Thanh Toán</h2>

        <div className="payment-methods-selection">
            <h5 className="selection-title">Chọn phương thức thanh toán:</h5>
            {methods.map((method) => (
                <div key={method.value} className="method-option">
                    <input
                        type="radio"
                        id={method.value}
                        name="paymentMethod"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label htmlFor={method.value}>{method.label}</label>
                </div>
            ))}
        </div>

        <hr className="divider" />

        <div className="summary-row total">
          <span className="label">Tổng số tiền</span>
          <span className="value total-amount">{formatCurrency(total)}</span>
        </div>

      </div>
      </div>
      
    </div>
  );
};

export default Checkout;