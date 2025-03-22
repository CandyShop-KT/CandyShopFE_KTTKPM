// ManageOrder.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../assets/css/ManageOrder.css";

const ManageOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token"); // Thay thế bằng token thực tế của bạn
  const role = localStorage.getItem("role");
  const api = "http://localhost:8081/api/";
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "ADMIN") {
      alert("Bạn không có quyền truy cập trang này.");
      navigate("/"); // Chuyển hướng về trang chính
      return;
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `${api}orders?page=0&limit=10&sortField=createdAt&sortOrder=desc`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOrders(response.data.data.content);
      setLoading(false);
      console.log(orders);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn hàng:", error);
      setLoading(false);
    }
  };

  const confirmOrder = async (orderId) => {
    try {
      console.log(`token ${token}`);
      console.log(`id:${orderId}`);
      await axios.post(
        `${api}orders/${orderId}/confirm`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Đơn hàng đã được xác nhận thành công!");
      fetchOrders(); // Tải lại danh sách đơn hàng
    } catch (error) {
      console.error("Lỗi khi xác nhận đơn hàng:", error);
    }
  };

  const cancelOrder = async (orderId) => {
    console.log(`token ${token}`);
    console.log(`id:${orderId}`);
    try {
      await axios.post(
        `${api}orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Đơn hàng đã được hủy thành công!");
      fetchOrders(); // Tải lại danh sách đơn hàng
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
    }
  };

  const viewOrder = async (orderId) => {
    // Logic để cập nhật đơn hàng
    navigate(`/order/manage/${orderId}`);
  };

  if (loading) {
    return <div className="text-center">Đang tải...</div>;
  }

  return (
    <div className="container mt-4">
      <nav className="order-manage nav nav-pills nav-fill">
        <a className="nav-link active">Tất cả</a>
        <a className="nav-link" href="#">
          ĐANG CHỜ XÁC NHẬN
        </a>
        <a className="nav-link" href="#">
          ĐANG CHỜ THANH TOÁN
        </a>
        <a className="nav-link" href="#">
          THANH TOÁN THÀNH CÔNG
        </a>
        <a className="nav-link" href="#">
          ĐÃ HỦY
        </a>
      </nav>

      {orders.map((order) => (
        <div className="order-card" key={order.orderId}>
          <div className="order-header">
            <strong>{order.orderId}</strong>
            <p>{order.customerName}</p>
          </div>
          <div className="order-body">
            <div className="order-footer">
              <div className="order-status">
                <span style={{ color: "blue", fontWeight: "bold" }}>
                  {order.status}
                </span>
              </div>
              <button className="btn btn-outline-success">
                Xem chi tiết đơn
              </button>
              {/* Kiểm tra trạng thái đơn hàng */}
              {order.status === "PENDING_CONFIRMATION" && (
                <>
                  <button
                    className="btn btn-info"
                    onClick={() => {
                      confirmOrder(order.orderId);
                    }}
                  >
                    Xác nhận đơn
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      cancelOrder(order.orderId);
                    }}
                  >
                    Hủy đơn
                  </button>
                </>
              )}

              <span className="original-price">Tổng tiền:</span>
              <span className="price">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })
                  .format(order.totalAmount)
                  .replace("₫", " vnd")}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ManageOrder;
