import { useState } from 'react';
import { FaShippingFast } from 'react-icons/fa';
import './Order.scss';
import OrderViewModal from './OrderViewModal';
import ReactPaginate from "react-paginate";
import { BsArrowRightCircleFill } from "react-icons/bs";
import type { OrderState } from '../../../interfaces';

const OrderShipping = ({ orders = [], pagination = { page: 1, limit: 5, totalPages: 1 }, setPage }: {
  orders?: OrderState[],
  pagination?: { page: number, limit: number, totalPages: number },
  setPage: (page: number) => void
}) => {
  const [viewOrder, setViewOrder] = useState<OrderState | null>(null);
  const ordersList = Array.isArray(orders) ? orders : [];

  const handlePageClick = (event: { selected: number }) => {
    const newPage = event.selected + 1;
    setPage(newPage);
  };

  const getSerialNumber = (index: number) => {
    return (pagination.page - 1) * pagination.limit + index + 1;
  };

  return (
    <div className="order-shipping-wrap">
      {ordersList.length === 0 ? (
        <div className="empty-state">
          <FaShippingFast size={48} />
          <p>Hiện không có đơn hàng đang giao.</p>
        </div>
      ) : (
        <>
          <div className="list-head shipping">
            <h3>Số đơn hàng đang giao ({ordersList.length})</h3>
          </div>

          <div className="table-wrap">
            <table className="order-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Người nhận</th>
                  <th>Tổng tiền</th>
                  <th>Phương thức</th>
                  <th>Trạng thái thanh toán</th>
                  <th>Ngày dự kiến giao</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {ordersList.map((order, index) => (
                  <tr key={index}>
                    <td className="mono">{getSerialNumber(index)}</td>
                    <td>{order.recipientName}</td>
                    <td className="amount">{Number(order.totalPrice || 0).toLocaleString()} ₫</td>
                    <td>{order.paymentMethod || '—'}</td>
                    <td>{order.paymentStatus || '—'}</td>
                    <td>
                        {order.expectedDate
                        ? new Date(order.expectedDate).toLocaleDateString('vi-VN', {
                            timeZone: 'Asia/Ho_Chi_Minh',
                            })
                            : '—'}
                        </td>
                    <td className="actions-col">
                      <button className="btn view" onClick={() => setViewOrder(order)}>Xem</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {pagination.totalPages > 0 && (
      <ReactPaginate
        nextLabel={<BsArrowRightCircleFill style={{ fontSize: "1.5rem" }} />}
        previousLabel={
          <BsArrowRightCircleFill
            style={{ fontSize: "1.5rem", transform: "scaleX(-1)" }}
          />
        }
        onPageChange={handlePageClick}
        pageCount={pagination.totalPages}
        forcePage={pagination.page - 1}
        containerClassName="pagination"
        activeClassName="active"
      />
      )}
      {viewOrder && (
        <OrderViewModal 
          order={viewOrder} 
          onClose={() => setViewOrder(null)} />
      )}
    </div>
  );
};

export default OrderShipping;
