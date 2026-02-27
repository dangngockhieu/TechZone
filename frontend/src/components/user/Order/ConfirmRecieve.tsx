import './ConfirmRecieve.scss';
import type { HistoryOrder } from '../../../interfaces';
const ConfirmReceive = ({ open, onClose, confirmOrder, onConfirm }
    : { open: boolean; onClose: () => void; confirmOrder: HistoryOrder | null; onConfirm: () => void }
) => {
    if (!open || !confirmOrder) return null;
    const formatCurrency = (amount: number) => {
        const value = amount ? amount : 0;
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };
    return (
        <div className="confirm-modal-overlay">
            <div className="confirm-modal">
                <button className="close-btn" onClick={onClose}>×</button>

                <h3>Xác nhận đã nhận hàng</h3>
                <p>Vui lòng thanh toán {confirmOrder.paymentMethod === 'COD' && confirmOrder.totalPrice 
                    ? formatCurrency(confirmOrder.totalPrice): formatCurrency(0)} cho Shipper</p> 
                <div className="confirm-actions">
                    <button className="btn cancel" onClick={onClose}>Hủy</button>
                    <button className="btn ok" onClick={onConfirm}>Xác nhận</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmReceive;
