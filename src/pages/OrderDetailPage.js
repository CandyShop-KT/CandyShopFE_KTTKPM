import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../assets/css/orderDetailPage.css";

const OrderDetailPage = () => {
  const { orderId } = useParams(); // Lấy orderId từ URL
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); // Theo dõi trang hiện tại
  const [totalPages, setTotalPages] = useState(1); // Tổng số trang
  const limit = 2; // Mỗi trang hiển thị 2 sản phẩm

  useEffect(() => {
    fetchOrderDetails(orderId, currentPage);
  }, [orderId, currentPage]);

  const fetchOrderDetails = async (orderId, page) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8081/api/orders/${orderId}/details?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }

      const data = await response.json();
      setOrderDetails(data.data.content); // Lưu thông tin chi tiết đơn hàng
      setTotalPages(data.data.totalPages); // Lưu tổng số trang
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Chuyển trang khi người dùng click vào trang tiếp theo hoặc trước đó
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Tạo một mảng chứa các số trang
  const pageNumbers = [];
  for (let i = 0; i < totalPages; i++) {
    pageNumbers.push(i);
  }

  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="order-detail-container">
      <h4 style={{ textAlign: "center" }}>CHI TIẾT ĐƠN HÀNG</h4>
      {orderDetails.length > 0 ? (
        orderDetails.map((detail, index) => (
          <div key={index} className="order-detail-item">
            <div className="pproduct-info-orderDetail">
              <div className="product-image-container">
                <img
                  src={detail.product.mainImageUrl}
                  alt={detail.product.productName}
                  className="product-image"
                />
              </div>
              <div className="product-details">
                <p>
                  <strong>Tên sản phẩm:</strong> {detail.product.productName}{" "}
                </p>
                <p>
                  <strong>Giá:</strong>{" "}
                  {detail.priceHistory.newPrice
                    ? detail.priceHistory.newPrice.toLocaleString()
                    : "Không có giá"}
                </p>
                <p>
                  <strong>Số lượng:</strong> {detail.quantity || 0}
                </p>
                <p>
                  <strong>Kích thước:</strong>
                  {detail.product.dimension}
                </p>
                <p>
                  <strong>Trọng lượng:</strong>
                  {detail.product.weight} gram
                </p>
                <p>
                  <strong>Thành tiền:</strong>{" "}
                  {detail.subTotal
                    ? detail.subTotal.toLocaleString()
                    : "Không có tổng tiền"}{" "}
                  VND
                </p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>Không có chi tiết đơn hàng.</p>
      )}

      {/* Phân trang */}
      <div className="pagination">
        <div className="page-numbers">
          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={`page-number ${
                currentPage === number ? "active" : ""
              }`}
            >
              {number + 1} {/* Số trang bắt đầu từ 1 */}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
