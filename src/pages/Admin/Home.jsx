import React, { useState, useEffect } from "react";
import { Card, Row, Col, Table, Button, Statistic } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import "./Home.css";

const AdminHome = () => {
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra quyền admin khi component mount
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "ADMIN") {
      navigate("/signin");
      return;
    }

    fetchStatistics();
    fetchRecentOrders();
  }, [navigate]);

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const [ordersRes, usersRes, productsRes] = await Promise.all([
        axios.get("http://localhost:8080/api/orders", config),
        axios.get("http://localhost:8080/api/users", config),
        axios.get("http://localhost:8080/api/products", config),
      ]);

      const totalRevenue = ordersRes.data.reduce(
        (sum, order) => sum + order.totalAmount,
        0
      );

      setStatistics({
        totalOrders: ordersRes.data.length,
        totalUsers: usersRes.data.length,
        totalRevenue: totalRevenue,
        totalProducts: productsRes.data.length,
      });
    } catch (error) {
      console.error("Lỗi khi tải thống kê:", error);
      if (error.response && error.response.status === 401) {
        navigate("/signin");
      }
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.get(
        "http://localhost:8080/api/orders",
        config
      );
      const recentOrders = response.data
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentOrders(recentOrders);
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng gần đây:", error);
      if (error.response && error.response.status === 401) {
        navigate("/signin");
      }
    }
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Khách hàng",
      dataIndex: ["user", "username"],
      key: "customer",
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => `${amount.toLocaleString("vi-VN")}đ`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "";
        let text = "";
        switch (status) {
          case "COMPLETED":
            color = "green";
            text = "Hoàn thành";
            break;
          case "PENDING":
            color = "orange";
            text = "Đang xử lý";
            break;
          default:
            color = "red";
            text = "Đã hủy";
        }
        return <span style={{ color }}>{text}</span>;
      },
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
  ];

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1>Bảng điều khiển</h1>
        </div>

        <Row gutter={[16, 16]} className="stats-container">
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card orders">
              <Statistic
                title="TỔNG ĐƠN HÀNG"
                value={statistics.totalOrders}
                prefix={<ShoppingCartOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card users">
              <Statistic
                title="TỔNG NGƯỜI DÙNG"
                value={statistics.totalUsers}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card revenue">
              <Statistic
                title="TỔNG DOANH THU"
                value={statistics.totalRevenue}
                prefix={<DollarOutlined />}
                suffix="đ"
                formatter={(value) => `${value.toLocaleString("vi-VN")}`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card products">
              <Statistic
                title="TỔNG SẢN PHẨM"
                value={statistics.totalProducts}
                prefix={<ShoppingOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Thao tác nhanh" className="quick-actions">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Button
                type="primary"
                block
                className="action-button add-product"
                onClick={() => navigate("/product/manage")}
              >
                Thêm sản phẩm mới
              </Button>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Button
                type="primary"
                block
                className="action-button view-orders"
                onClick={() => navigate("/order/manage")}
              >
                Xem đơn hàng
              </Button>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Button
                type="primary"
                block
                className="action-button manage-users"
                onClick={() => navigate("/user/manage")}
              >
                Quản lý người dùng
              </Button>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Button
                type="primary"
                block
                className="action-button manage-categories"
                onClick={() => navigate("/product/manage")}
              >
                Quản lý sản phẩm & danh mục
              </Button>
            </Col>
          </Row>
        </Card>

        <Card title="Đơn hàng gần đây" className="recent-orders">
          <Table
            columns={columns}
            dataSource={recentOrders}
            rowKey="id"
            pagination={false}
            className="orders-table"
          />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminHome;
