import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate} from "react-router-dom";
import { useAppDispatch } from "../../../redux/hooks";
import { setCartCount } from "../../../redux/slices/cartSlice";
import './OrderHistory.scss';
import img from '../../../assets/order.png';
import { getMyOrders, updateOrderForUser, buyAgain, getNumberCart, createReview, createVNPayment } from '../../../services/apiServices.js';
import ConfirmReceive from './ConfirmRecieve.js';
import type{HistoryOrder, ProductInOrder} from '../../../interfaces';
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const OrderHistory = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [orders, setOrders] = useState<HistoryOrder[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState('PENDING');
    const [confirmOrder, setConfirmOrder] = useState<HistoryOrder | null>(null);
    const [isOpenConfirm, setIsOpenConfirm] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewItem, setReviewItem] = useState<ProductInOrder | null>(null);

    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    const handleOpenReviewModal = (item: ProductInOrder ) => {
        setReviewItem(item);
        setReviewModalOpen(true);
        setReviewRating(5);
        setReviewComment('');
    }

    const closeReviewModal = () => {
        setReviewModalOpen(false);
        setReviewItem(null);
        setReviewRating(5);
        setReviewComment('');
    }

    const submitReview = async () => {
        if (!reviewItem) return;
        setSubmittingReview(true);
        try {
            const res = await createReview(reviewItem.productID, reviewRating, reviewComment, reviewItem.orderItemID);
            if (res?.data?.success) {
                toast.success("Gửi đánh giá thành công!");
                fetchOrders();
                closeReviewModal();
            } else {
                toast.error(res?.data?.message || "Gửi đánh giá thất bại");
            }
        } catch (err) {
            console.log(err);
            toast.error("Lỗi kết nối server");
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleOpenConfirm = (item: HistoryOrder) => {
        setConfirmOrder(item);
        setIsOpenConfirm(true);
    };

    const handlePayment = async (orderID: number) => {
        try {
            const res = await createVNPayment(orderID);
            if (res?.data?.success && res?.data?.paymentUrl) {
                window.location.href = res?.data?.paymentUrl;
            } else {
                toast.error(res?.data?.message || 'Không thể tạo link thanh toán');
            }
        } catch (err) {
            console.log(err);
            toast.error('Lỗi kết nối server');
        }
    };

    const tabs = [
        { id: 'PENDING', label: 'Chờ xác nhận' },
        { id: 'SHIPPING', label: 'Chờ giao hàng' },
        { id: 'COMPLETED', label: 'Hoàn thành' },
        { id: 'CANCELED', label: 'Đã hủy' },
    ];

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await getMyOrders(activeTab);
            if (res && res?.data?.success) {
                const sortedOrders = res.data.data.orders.sort(
                    (a: HistoryOrder, b: HistoryOrder) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
                );
                setOrders(sortedOrders);
            } else {
                console.log("Lỗi data:", res?.data?.message);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderID: number) => {
        try {
            const res = await updateOrderForUser(orderID, 'CANCELED');
            if (res && res?.data?.success) {
                toast.success("Đã hủy đơn hàng thành công.");
                fetchOrders(); 
            } else {
                toast.error(res?.data?.mesage || "Hủy đơn thất bại");
            }
        } catch {
            toast.error("Lỗi kết nối server");
        }
    };

    const handleConfirmReceive = async () => {
        if (!confirmOrder) return;
        try {
            const res = await updateOrderForUser(confirmOrder.orderID, 'COMPLETED');
            if (res && res?.data?.success) {
                toast.success("Đã xác nhận nhận hàng thành công.");
                fetchOrders();
                setIsOpenConfirm(false); 
            } else {
                toast.error(res?.data?.message || "Xác nhận nhận hàng thất bại");
            }
        } catch {
            toast.error("Lỗi kết nối server");
        }
    };

    const handleBuyAgain = async (products: ProductInOrder[]) => {
        try {
            const res = await buyAgain(products);
            if (res?.data?.success) {
                const cartRes = await getNumberCart();
                if (cartRes?.data?.success) dispatch(setCartCount(cartRes.data.data.totalCart));
                navigate('/cart');
            } else {
                toast.error(res?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
            }
        } catch {
            toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
        }
    };

    const formatCurrency = (amount: number) => {
        const value = amount ? amount : 0;
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <div className="order-history-container">
            <h2 className="title">Đơn Hàng Của Tôi</h2>
            <div className="tabs-container">
                {tabs.map(tab => (
                    <div 
                        key={tab.id}
                        className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="loading-text">Đang tải dữ liệu...</div>
            ) : (
                <div className="order-list-content">
                    {orders && orders.length > 0 ? (
                        <div className="order-items">
                            {orders.map((item: HistoryOrder) => (
                                <div key={item.orderID} className="order-card">
                                    <div className="card-body">
                                        <div className="info-column">
                                            <span><strong>Thanh toán:</strong> {item.paymentMethod === 'BANK' ? 'Bank' : 'COD'}</span>
                                            <span><strong>Ngày đặt:</strong> {new Date(item.orderDate).toLocaleDateString()}</span>
                                        </div>

                                        <div className="products-column">
                                        {item.products.map(prod => (
                                            <div key={prod.productID} className="product-item">
                                                <img src={prod.imageUrl ? (prod.imageUrl.startsWith("/") ? `${BASE_URL}${prod.imageUrl}` : `${BASE_URL}/${prod.imageUrl}`) : '/no-image.png'} alt={prod.name} className="item-img-preview"/>
                                                <div className="product-name">{prod.name}</div>
                                                <div className="product-quantity">x{prod.quantity}</div>
                                                {item.status === 'COMPLETED' && !prod.isReviewed &&(
                                                    <button className="btn btn-review" onClick={() => handleOpenReviewModal(prod)}>Đánh Giá</button>
                                                )}
                                            </div>
                                        ))}
                                        </div>

                                        <div className="action-column">
                                            <div className="total-money">
                                                Tổng tiền: <span>{formatCurrency(item.totalPrice)}</span>
                                            </div>
                                            <div className="action-buttons">
                                                {item.status === 'PENDING' && item.paymentMethod === 'BANK' && item.paymentStatus === 'UNPAID' && (
                                                    <button className="btn btn-payment" onClick={() => handlePayment(item.orderID)}>Thanh toán</button>
                                                )}
                                                {item.status === 'COMPLETED' && (
                                                    <button className="btn btn-buy-again" onClick={() => handleBuyAgain(item.products)}>Mua Lại</button>
                                                )}
                                                {item.status === 'SHIPPING' && (
                                                    <button className="btn btn-confirm" onClick={() => handleOpenConfirm(item)}>Đã nhận được hàng</button>
                                                )}
                                                {item.status === 'CANCELED' && (
                                                    <button className="btn btn-buy-again" onClick={() => handleBuyAgain(item.products)}>Mua Lại</button>
                                                )}
                                                {item.status === 'PENDING' && item.paymentMethod==='COD' && (
                                                    <button className="btn btn-cancel" onClick={() => handleCancelOrder(item.orderID)}>Hủy Đơn</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            ))}
                        </div>
                    ) : (
                        <div className="no-orders-img">
                            <img src={img} alt="empty" />
                            <p>Chưa có đơn hàng nào ở mục này</p>
                        </div>
                    )}
                </div>
            )}

            <ConfirmReceive 
                open={isOpenConfirm}
                confirmOrder={confirmOrder}
                onClose={() => setIsOpenConfirm(false)}
                onConfirm={handleConfirmReceive}
            />

            {reviewModalOpen && reviewItem && (
                <div className="review-modal-overlay">
                    <div className="review-modal">
                        <h3>Đánh giá sản phẩm</h3>

                        <div className="review-item-info">
                            <img
                                className="ri-thumb"
                                src={reviewItem.imageUrl ? (reviewItem.imageUrl.startsWith("/") ? `${BASE_URL}${reviewItem.imageUrl}` : `${BASE_URL}/${reviewItem.imageUrl}`) : '/no-image.png'}
                                alt={reviewItem.name}
                                onError={(e) => { (e.target as HTMLImageElement).src = '/no-image.png'; }}
                            />
                            <div className="ri-main">
                                <div className="ri-name">{reviewItem.name}</div>
                            </div>
                        </div>

                        <div className="review-form">
                            <label>Điểm</label>
                            <select
                                value={reviewRating}
                                onChange={(e) => setReviewRating(+e.target.value)}
                            >
                                <option value={5}>5 - Xuất sắc</option>
                                <option value={4}>4 - Tốt</option>
                                <option value={3}>3 - Trung bình</option>
                                <option value={2}>2 - Kém</option>
                                <option value={1}>1 - Rất kém</option>
                            </select>

                            <label>Bình luận (tùy chọn)</label>
                            <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Viết nhận xét của bạn..."
                            />

                            <div className="rf-actions">
                                <button
                                    className="btn btn-cancel"
                                    onClick={closeReviewModal}
                                >
                                    Đóng
                                </button>
                                <button
                                    className="btn btn-review"
                                    onClick={submitReview}
                                    disabled={submittingReview}
                                >
                                    {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
