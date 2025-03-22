import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../assets/css/orderHistory.css"; 

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL'); 
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const limit = 5;

  useEffect(() => {
    if (userId && token) {
      if (statusFilter === 'ALL') {
        fetchOrders(userId, token, currentPage);
      } else {
        fetchOrdersByStatus(userId, token, currentPage, statusFilter);
      }
    } else {
      setError("User not logged in");
      setLoading(false);
    }
  }, [userId, token, currentPage, statusFilter]); // Thêm statusFilter vào mảng dependency

  // Fetch đơn hàng theo userId
  const fetchOrders = async (userId, token, page) => {
    try {
      const response = await fetch(`http://localhost:8081/api/orders/user/${userId}?page=${page}&limit=5&sortField=createdAt&sortOrder=desc`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data.data.content);  
      setTotalPages(data.data.totalPages);  
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch đơn hàng theo trạng thái
  const fetchOrdersByStatus = async (userId, token, page, status) => {
    try {
      const response = await fetch(`http://localhost:8081/api/orders/${userId}/status?status=${status}&page=${page}&size=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch orders by status");
      }
      const data = await response.json();
      setOrders(data.data.content);  
      setTotalPages(data.data.totalPages);  
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);  
    setCurrentPage(0); 
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="order-history-container">
      <h2 className="order-history-title">Lịch sử mua hàng</h2>
      {error && <p className="error">{error}</p>}

      <div className="filter-container">
        <label htmlFor="statusFilter">Trạng thái đơn hàng: </label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={handleStatusChange}
        >
          <option value="ALL">Tất cả</option>
          <option value="PENDING_CONFIRMATION">Chờ xác nhận</option>
          <option value="PENDING_PAYMENT">Chờ thanh toán</option>
          <option value="PAYMENT_SUCCESS">Thanh toán thành công</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
      </div>

      <table className="order-table">
        <thead>
          <tr>
            <th>Số TT</th> 
            <th>Địa chỉ</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Ghi chú</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order, index) => (
              <tr key={order.orderId}>
                <td>{(currentPage * limit) + index + 1}</td> 
                <td>{order.address}, {order.ward?.wardName}, {order.district?.districtName}, {order.province?.provinceName}</td>
                <td>{order.totalAmount.toLocaleString()} VND</td>
                <td>{order.status}</td>
                <td>{order.note}</td>
                <td>{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                <td>
                  <button onClick={() => navigate(`/order-detail/${order.orderId}`)}>Xem chi tiết</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-orders">Không có đơn hàng nào.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Phân trang theo kiểu số */}
      {totalPages > 1 && (
        <div className="pagination">
          <ul className="pagination-list">
            {Array.from({ length: totalPages }, (_, index) => (
              <li
                key={index}
                className={`page-item ${currentPage === index ? 'active' : ''}`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(index)}
                >
                  {index + 1}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
