import { useEffect, useState } from 'react';
import { FaTimes, FaUser, FaBox} from 'react-icons/fa';
import './OrderViewModal.scss';
import { getOrderItem } from '../../../services/apiServices';
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
import type { OrderViewDetail, OrderState } from '../../../interfaces';

const OrderViewModal = ({ order, onClose}:{
  order: OrderState,
  onClose: () => void
}) => {
  const [items, setItems] = useState<OrderViewDetail[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const formatCurrency = (amount: number) => (amount ? Number(amount).toLocaleString('vi-VN') + ' ₫' : '0 ₫');

  useEffect(() => {
    const fetchItems = async () => {
      setLoadingItems(true);
      try {
        const res = await getOrderItem(order.orderID);
        if (res?.data?.success && Array.isArray(res?.data?.data?.products)) setItems(res?.data?.data?.products);
        else if (Array.isArray(res)) setItems(res);
        else setItems([]);
      } finally {
        setLoadingItems(false);
      }
    };
    if (order) fetchItems();
  }, [order]);

  return (
    <div className="ovm-backdrop">
      <div className="ovm-card">
        <button className="ovm-close" onClick={onClose}>
          <FaTimes />
        </button>

        <header className="ovm-header">
          <h2>Chi tiết đơn hàng</h2>
          <div className="ovm-status">
            Trạng thái: <strong>{order.orderStatus}</strong>
          </div>
        </header>

        <section className="ovm-body">
          <div className="ovm-left">
            <div className="card mini">
              <h4>
                <FaUser /> Thông tin khách hàng
              </h4>
              <p>
                <strong>Người nhận:</strong> {order.recipientName}
              </p>
              <p>
                <strong>Email:</strong> {order.userEmail}
              </p>
              <p>
                <strong>Điện thoại:</strong> {order.phone}
              </p>
              <p>
                <strong>Địa chỉ:</strong> {order.address}
              </p>
              <p>
                <strong>Ngày đặt:</strong>{' '}
                {order.orderDate
                  ? new Date(order.orderDate).toLocaleDateString('vi-VN', {
                      timeZone: 'Asia/Ho_Chi_Minh',
                    })
                  : '—'}
              </p>
            </div>

            <div className="card mini">
              <h4>
                <FaBox /> Sản phẩm ({items.length})
              </h4>
              {loadingItems ? (
                <p>Đang tải sản phẩm...</p>
              ) : (
                <ul className="item-list">
                  {items.map((it, idx) => (
                    <li key={idx} className="item">
                      <div className="item-img">
                        <img src={`${BASE_URL}${it.imageUrl}`  } alt={it.name} />
                      </div>
                      <div className="item-info">
                        <div className="item-name">{it.name}</div>
                        <div className="item-meta">SL: {it.quantity}</div>
                      </div>
                      <div className="item-price">
                        {formatCurrency(it.unitPrice * it.quantity)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <aside className="ovm-right">
            <div className="card summary">
              <h4>Tóm tắt</h4>
              <div className="summary-row">
                <span>Tổng tiền</span>
                <span className="amount">{formatCurrency(order.totalPrice)}</span>
              </div>
              <div className="summary-row">
                <span>Phương thức</span>
                <span>{order.paymentMethod || '—'}</span>
              </div>
              <div className="summary-row">
                <span>Thanh toán</span>
                <span>{order.paymentStatus || '—'}</span>
              </div>
              <div className="summary-row">
                <span>Mã vận đơn</span>
                <span className="mono">{order.trackingCode || '—'}</span>
              </div>
              <div className="summary-row">
                <span>Ngày giao</span>
                <span>
                  {order.deliveryDate
                    ? new Date(order.deliveryDate).toLocaleDateString('vi-VN', {
                        timeZone: 'Asia/Ho_Chi_Minh',
                      })
                    : '—'}
                </span>
              </div>
              <div className="summary-row">
                <span>Ngày nhận</span>
                <span>
                  {order.receivedDate
                    ? new Date(order.receivedDate).toLocaleDateString('vi-VN', {
                        timeZone: 'Asia/Ho_Chi_Minh',
                      })
                    : '—'}
                </span>
              </div>
            </div>

            <div className="card actions">
              <button className="btn neutral full" onClick={onClose}>
                Đóng
              </button>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};

export default OrderViewModal;
