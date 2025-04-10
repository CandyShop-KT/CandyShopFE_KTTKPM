import React from "react";
import { Layout, Menu } from "antd";
import { useNavigate } from "react-router-dom";
import {
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import "./AdminLayout.css";

const { Header, Sider, Content } = Layout;

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/signin");
  };

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Bảng điều khiển",
      onClick: () => navigate("/admin"),
    },
    {
      key: "products",
      icon: <ShoppingOutlined />,
      label: "Quản lý sản phẩm",
      onClick: () => navigate("/product/manage"),
    },
    {
      key: "orders",
      icon: <ShoppingCartOutlined />,
      label: "Quản lý đơn hàng",
      onClick: () => navigate("/order/manage"),
    },
    {
      key: "users",
      icon: <UserOutlined />,
      label: "Quản lý người dùng",
      onClick: () => navigate("/user/manage"),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <Layout className="admin-layout">
      <Sider width={250} theme="light" className="admin-sider">
        <div className="admin-logo">
          <span>Admin Panel</span>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          items={menuItems}
          className="admin-menu"
        />
      </Sider>
      <Layout>
        <Header className="admin-header">
          <div className="admin-header-content">
            <h1>Hệ thống quản lý Candy Shop</h1>
          </div>
        </Header>
        <Content className="admin-content">{children}</Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
