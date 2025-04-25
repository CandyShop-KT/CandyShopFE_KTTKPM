// ManageOrder.js
import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Card,
  Tabs,
  message,
  Modal,
  Pagination,
} from "antd";
import { EyeOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import "../assets/css/ManageOrder.css";

const { TabPane } = Tabs;

const ManageOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const api = "http://localhost:8081/api/";

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "ADMIN") {
      message.error("Bạn không có quyền truy cập trang này");
      navigate("/");
      return;
    }
    fetchOrders();
  }, [currentPage, pageSize, activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${api}orders?page=${currentPage}&limit=${pageSize}&sortField=createdAt&sortOrder=desc`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrders(response.data.data.content);
      setTotal(response.data.data.totalElements);
      setLoading(false);
    } catch (error) {
      message.error("Lỗi khi tải danh sách đơn hàng");
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await axios.get(`${api}orders/${orderId}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrderDetails(response.data.data.content);
      setDetailsModalVisible(true);
    } catch (error) {
      message.error("Lỗi khi tải chi tiết đơn hàng");
    }
  };

  const confirmOrder = async (orderId) => {
    try {
      await axios.post(
        `${api}orders/${orderId}/confirm`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Xác nhận đơn hàng thành công");
      fetchOrders();
    } catch (error) {
      message.error("Lỗi khi xác nhận đơn hàng");
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      await axios.post(
        `${api}orders/${orderId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Hủy đơn hàng thành công");
      fetchOrders();
    } catch (error) {
      message.error("Lỗi khi hủy đơn hàng");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING_CONFIRMATION":
        return "orange";
      case "PENDING_PAYMENT":
        return "blue";
      case "COMPLETED":
        return "green";
      case "CANCELLED":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING_CONFIRMATION":
        return "Chờ xác nhận";
      case "PENDING_PAYMENT":
        return "Chờ thanh toán";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
    },
    {
      title:"Mã khách hàng",
      dataIndex:"userId",
      key:"userId"
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title:"Tên khách hàng",
      dataIndex:"customerName",
      key:"customerName"

    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(amount),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => fetchOrderDetails(record.orderId)}
          >
            Chi tiết
          </Button>
          {record.status === "PENDING_CONFIRMATION" && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => confirmOrder(record.orderId)}
                style={{ backgroundColor: "#52c41a" }}
              >
                Xác nhận
              </Button>
              
              <Button
                danger
                type="primary" 
                icon={<CloseOutlined />}
                onClick={() => cancelOrder(record.orderId)}
                style={{ backgroundColor: "#ff4d4f" }}
              >
                Hủy
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const handleTabChange = (key) => {
    setActiveTab(key);
    setCurrentPage(0);
  };

  return (
    <AdminLayout>
      <div className="manage-order-container">
        <Card title="Quản lý đơn hàng" className="order-card">
          <Tabs activeKey={activeTab} onChange={handleTabChange}>
            <TabPane tab="Tất cả" key="ALL">
              <Table
                columns={columns}
                dataSource={orders}
                loading={loading}
                rowKey="orderId"
                pagination={false}
              />
            </TabPane>
            <TabPane tab="Chờ xác nhận" key="PENDING_CONFIRMATION">
              <Table
                columns={columns}
                dataSource={orders.filter(
                  (order) => order.status === "PENDING_CONFIRMATION"
                )}
                loading={loading}
                rowKey="orderId"
                pagination={false}
              />
            </TabPane>
            <TabPane tab="Chờ thanh toán" key="PENDING_PAYMENT">
              <Table
                columns={columns}
                dataSource={orders.filter(
                  (order) => order.status === "PENDING_PAYMENT"
                )}
                loading={loading}
                rowKey="orderId"
                pagination={false}
              />
            </TabPane>
            <TabPane tab="Hoàn thành" key="COMPLETED">
              <Table
                columns={columns}
                dataSource={orders.filter(
                  (order) => order.status === "COMPLETED"
                )}
                loading={loading}
                rowKey="orderId"
                pagination={false}
              />
            </TabPane>
            <TabPane tab="Đã hủy" key="CANCELLED">
              <Table
                columns={columns}
                dataSource={orders.filter(
                  (order) => order.status === "CANCELLED"
                )}
                loading={loading}
                rowKey="orderId"
                pagination={false}
              />
            </TabPane>
          </Tabs>

          <div
            className="pagination-container"
            style={{ marginTop: "1rem", textAlign: "right" }}
          >
            <Pagination
              current={currentPage + 1}
              total={total}
              pageSize={pageSize}
              onChange={(page) => setCurrentPage(page - 1)}
              showSizeChanger
              onShowSizeChange={(current, size) => {
                setPageSize(size);
                setCurrentPage(0);
              }}
              showTotal={(total) => `Tổng ${total} đơn hàng`}
            />
          </div>
        </Card>

        <Modal
          title="Chi tiết đơn hàng"
          visible={detailsModalVisible}
          onCancel={() => setDetailsModalVisible(false)}
          width={800}
          footer={null}
        >
          <Table
            columns={[
              {
                title: "Sản phẩm",
                dataIndex: ["product", "name"],
                key: "productName",
              },
              {
                title: "Số lượng",
                dataIndex: "quantity",
                key: "quantity",
              },
              {
                title: "Đơn giá",
                dataIndex: "price",
                key: "price",
                render: (price) =>
                  new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(price),
              },
              {
                title: "Thành tiền",
                key: "total",
                render: (_, record) =>
                  new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(record.price * record.quantity),
              },
            ]}
            dataSource={orderDetails}
            rowKey="id"
            pagination={false}
          />
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default ManageOrder;
