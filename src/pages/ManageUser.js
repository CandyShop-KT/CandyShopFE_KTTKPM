import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Tag,
  Avatar,
  message,
  Modal,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  BoldOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import "../assets/css/manageUser.css";

const { Search } = Input;

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

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
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${api}users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.data);
      setLoading(false);
    } catch (error) {
      message.error("Lỗi khi tải danh sách người dùng");
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    if (!value.trim()) {
      fetchUsers();
      return;
    }
    const filteredUsers = users.filter(
      (user) =>
        user.userId.toLowerCase().includes(value.toLowerCase()) ||
        user.userName.toLowerCase().includes(value.toLowerCase()) ||
        (user.firstName + " " + user.lastName)
          .toLowerCase()
          .includes(value.toLowerCase())
    );
    setUsers(filteredUsers);
  };

  const handleViewDetails = (user) => {
    navigate(`/admin/users/${user.userId}`);
  };

  const handleViewAddresses = (userId) => {
    navigate(`/admin/users/${userId}/addresses`);
  };

  const handleAddUser = () => {
    navigate("/admin/users/add");
  };

  const getRoleTag = (role) => {
    switch (role) {
      case "ADMIN":
        return <Tag color="#5c3d2e">Admin</Tag>;
      case "USER":
        return <Tag color="#8b5e3c">User</Tag>;
      default:
        return <Tag color="default">{role}</Tag>;
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "ACTIVE":
        return <Tag color="#6b8e23">Hoạt động</Tag>;
      case "INACTIVE":
        return <Tag color="#8b4513">Không hoạt động</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const columns = [
    {
      title:"USER ID",
      dataIndex:"userId",
      key:"userId"
    },
    {
      title: "Họ và tên",
      key: "fullName",
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "SĐT",
      dataIndex:"phoneNumber",
      key:"phoneNumber"
    }
    ,
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => getRoleTag(role),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            >
              Chi tiết
            </Button>
          </Tooltip>
          <Tooltip title="Quản lý địa chỉ">
            <Button
              type="primary"
              icon={<EnvironmentOutlined />}
              onClick={() => handleViewAddresses(record.userId)}
            >
              Địa chỉ
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="manage-user-container">
        <Card
          title={<span style={{color:'brown', fontWeight:"bold",fontSize:"20px"}}>QUẢN LÝ NGƯỜI DÙNG</span>}
          className="user-card"
          extra={
            <div className="search-section">
              <Search
                placeholder="Tìm kiếm theo tên, email..."
                allowClear
                onSearch={handleSearch}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={handleAddUser}
              >
                Thêm người dùng
              </Button>
            </div>
          }
        >
          <Table
            className="user-table"
            columns={columns}
            dataSource={users}
            rowKey="userId"
            loading={loading}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Tổng ${total} người dùng`,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
          />
        </Card>

        <Modal
          title="Chi tiết người dùng"
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={800}
          className="user-modal"
        >
          {selectedUser && (
            <div className="user-details">
              <div className="user-detail-item">
                <span className="user-detail-label">ID:</span>
                {selectedUser.userId}
              </div>
              <div className="user-detail-item">
                <span className="user-detail-label">Họ và tên:</span>
                {selectedUser.firstName} {selectedUser.lastName}
              </div>
              <div className="user-detail-item">
                <span className="user-detail-label">Email:</span>
                {selectedUser.email}
              </div>
              <div className="user-detail-item">
                <span className="user-detail-label">Tên đăng nhập:</span>
                {selectedUser.userName}
              </div>
              <div className="user-detail-item">
                <span className="user-detail-label">Vai trò:</span>
                {getRoleTag(selectedUser.role)}
              </div>
              <div className="user-detail-item">
                <span className="user-detail-label">Trạng thái:</span>
                {getStatusTag(selectedUser.status)}
              </div>
              <div className="user-detail-item">
                <span className="user-detail-label">Số điện thoại:</span>
                {selectedUser.phone || "Chưa cập nhật"}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default ManageUser;
