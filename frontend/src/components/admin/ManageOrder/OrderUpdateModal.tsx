import { useEffect, useState } from 'react';
import { FaTimes, FaSave, FaTruck, FaCalendarCheck } from 'react-icons/fa';
import './OrderUpdateModal.scss';
import { updatePendingtoShipping, getOrderItem } from '../../../services/apiServices';
import { toast } from 'react-toastify';
import type { OrderState, OrderViewDetail } from '../../../interfaces';

const OrderUpdateModal = ({ order, onClose, onSuccess }: {
  order: OrderState,
  onClose: () => void,
  onSuccess?: () => void
}) => {
  const [trackingCode, setTrackingCode] = useState(order.trackingCode || '');
  const [expectedDate, setExpectedDate] = useState(order.expectedDate || '');
  const [isSaving, setIsSaving] = useState(false);
  const [items, setItems] = useState<OrderViewDetail[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      setLoadingItems(true);
      try {
        const res = await getOrderItem(order.orderID);
        if (res?.data?.success && Array.isArray(res.data.data.products)) setItems(res.data.data.products);
        else if (Array.isArray(res)) setItems(res);
        else setItems([]);
      } catch {
        setItems([]);
      } finally {
        setLoadingItems(false);
      }
    };
    if (order?.orderID) fetchItems();
  }, [order]);

  const handleSave = async () => {
    if (!trackingCode.trim()) return toast.warn('Vui lòng nhập mã vận đơn.');
    setIsSaving(true);
    try {
      const res = await updatePendingtoShipping(order.orderID, trackingCode.trim(), expectedDate);
      if (res?.data?.success) {
        toast.success('Cập nhật đơn hàng thành công.');
        onSuccess?.();
      } else toast.error(res?.data?.message || 'Cập nhật thất bại.');
    } catch {
      toast.error('Lỗi khi cập nhật đơn hàng.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDateInput = (date: string | Date) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  return (
    <div className="oum-backdrop">
      <div className="oum-card">
        <button className="oum-close" onClick={onClose}><FaTimes /></button>
        <header className="oum-header">
          <h3>Cập nhật đơn hàng </h3>
          <p className="status">Trạng thái hiện tại: <strong>{order.orderStatus}</strong></p>
        </header>

        <section className="oum-body">
          <div className="form-row">
            <label><FaTruck /> Mã vận đơn</label>
            <input value={trackingCode} onChange={e => setTrackingCode(e.target.value)} placeholder="Nhập mã vận đơn" />
          </div>
          <div className="form-row">
            <label><FaCalendarCheck /> Ngày dự kiến nhận</label>
            <input type="date" value={formatDateInput(expectedDate)} onChange={e => setExpectedDate(e.target.value)} />
          </div>

          <div className="order-items-preview">
            <h4>Danh sách sản phẩm</h4>
            {loadingItems ? <p>Đang tải...</p> : (
              <ul>{items.map((it, i) => (
                <li key={i}><span>{it.name}</span><span>SL: {it.quantity}</span></li>
              ))}</ul>
            )}
          </div>
        </section>

        <footer className="oum-footer">
          <button className="btn neutral" onClick={onClose}>Hủy</button>
          <button className="btn primary" onClick={handleSave} disabled={isSaving}>
            <FaSave /> {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default OrderUpdateModal;
