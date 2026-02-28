import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaHome, FaBox } from 'react-icons/fa';
import './PaymentSuccess.scss';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  return (
    <div className="payment-success-container">
      <div className="success-card">
        <div className="success-icon-wrapper">
          <div className="success-circle">
            <FaCheckCircle className="success-icon" />
          </div>
        </div>

        <h1 className="success-title">Đặt hàng thành công!</h1>
        <p className="success-subtitle">
          Cảm ơn bạn đã tin tưởng và mua hàng tại cửa hàng. Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.
        </p>

        <div className="action-buttons">
          <button className="btn btn-home" onClick={handleGoHome}>
            <FaHome /> Về trang chủ
          </button>
          <button className="btn btn-orders" onClick={handleViewOrders}>
            <FaBox /> Xem đơn hàng
          </button>
        </div>

        <div className="next-steps">
          <h4>Các bước tiếp theo:</h4>
          <ul>
            <li>✓ Đơn hàng của bạn đã được xác nhận</li>
            <li>✓ Chúng tôi sẽ gửi email xác nhận đến bạn</li>
            <li>✓ Đơn hàng sẽ được giao trong 2-3 ngày làm việc</li>
            <li>✓ Bạn có thể theo dõi đơn hàng trong mục "Đơn hàng của tôi"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
