import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Avatar,
  Tag,
  Space,
  Divider,
  message,
  Upload,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  EnvironmentOutlined,
  UploadOutlined,
  SaveOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import AdminLayout from "../layouts/AdminLayout";
import "../assets/css/userDetail.css"; // Updated CSS file

const { Option } = Select;

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [changeEmailModalVisible, setChangeEmailModalVisible] = useState(false);
  const [passwordForm] = Form.useForm();
  const [emailForm] = Form.useForm();

  const token = localStorage.getItem("token");
  const api = "http://localhost:8081/api/";

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${api}users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.data);
      form.setFieldsValue({
        firstName: response.data.data.firstName,
        lastName: response.data.data.lastName,
        email: response.data.data.email,
        phone: response.data.data.phoneNumber,
        gender: response.data.data.gender,
        birthDay: response.data.data.birthDay ? moment(response.data.data.birthDay) : null,
        role: response.data.data.role
      });
      setLoading(false);
    } catch (error) {
      message.error("Không thể tải thông tin người dùng");
      setLoading(false);
    }
  };

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    form.resetFields();
  };

  const handleSave = async (values) => {
    try {
      await axios.patch(`${api}users/${userId}`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Cập nhật thông tin thành công");
      setEditMode(false);
      fetchUserDetails();
    } catch (error) {
      message.error("Không thể cập nhật thông tin");
    }
  };

  const handleChangePassword = async (values) => {
    try {
      await axios.patch(`${api}users/${userId}/password`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Đổi mật khẩu thành công");
      setChangePasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      message.error("Không thể đổi mật khẩu");
    }
  };

  const handleChangeEmail = async (values) => {
    try {
      await axios.patch(`${api}users/${userId}/email`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Đổi email thành công");
      setChangeEmailModalVisible(false);
      emailForm.resetFields();
      fetchUserDetails();
    } catch (error) {
      message.error("Không thể đổi email");
    }
  };

  const handleUploadAvatar = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      await axios.patch(`${api}users/${userId}/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      message.success("Cập nhật ảnh đại diện thành công");
      onSuccess(); // báo hiệu thành công cho Upload
      fetchUserDetails(); // cập nhật lại avatar
    } catch (error) {
      message.error("Không thể cập nhật ảnh đại diện");
      onError(error); // báo lỗi cho Upload
    }
  };
  
  const handleRoleChange = async (newRole) => {
    try {
      await axios.patch(
        `${api}users/${userId}/role?role=${newRole}`, // Gửi role dưới dạng query param
        {}, // body rỗng
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      // message.success("Cập nhật vai trò thành công");
      fetchUserDetails(); 
    } catch (error) {
      console.error("Error during role change:", error);
      message.error("Không thể cập nhật vai trò");
    }
  };
  
  
  
  
  const getRoleTag = (role) => {
    switch (role) {
      case "ADMIN":
        return <Tag color="red">Admin</Tag>;
      case "USER":
        return <Tag color="blue">User</Tag>;
      default:
        return <Tag>{role}</Tag>;
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "ACTIVE":
        return <Tag color="green">Hoạt động</Tag>;
      case "INACTIVE":
        return <Tag color="gray">Không hoạt động</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <AdminLayout>
      <div className="user-detail-container">
        <Card className="user-detail-card">
          <div className="user-profile-header">
            <div className="user-avatar-section">
              <div className="avatar-wrapper">
              <Avatar size={120} key={user?.avatarUrl} src={user?.avatarUrl} icon={<UserOutlined />} />
              <Upload
                name="avatar"
                showUploadList={false}
                customRequest={handleUploadAvatar}
              >
                <Button icon={<UploadOutlined />} size="small" className="upload-button" type="primary">
                  Thay đổi ảnh
                </Button>
              </Upload>
              </div>
            </div>
            <div className="user-info-header">
              <h2 className="user-name">{`${user?.firstName} ${user?.lastName}`}</h2>
              <div style={{display:'flex', justifyContent:'center', marginTop:20}}>
              <Space>
              {editMode ? (
                    <Select

                      value={form.getFieldValue("role")} // Đảm bảo rằng role được set chính xác từ form
                      style={{ width: 120, color:'black' }}
                      onChange={(value) => {
                        form.setFieldValue("role", value); // Cập nhật role trong form
                        handleRoleChange(value); // Cập nhật role lên backend
                      }}
                    >
                      <Option value="USER">User</Option>
                      <Option value="ADMIN">Admin</Option>
                    </Select>
                  ) : (
                    getRoleTag(user?.role)
                  )}
              {getStatusTag(user?.status)}
              </Space>
              </div>
            </div>
          </div>

          <Divider />

          <div className="user-actions">
            <Space wrap>
              <Button
                type="primary"
                icon={<EnvironmentOutlined />}
                onClick={() => navigate(`/admin/users/${userId}/addresses`)}
              >
                Quản lý địa chỉ
              </Button>
              <Button
                type="primary"
                icon={<LockOutlined />}
                onClick={() => setChangePasswordModalVisible(true)}
              >
                Đổi mật khẩu
              </Button>
              <Button
                type="primary"
                icon={<MailOutlined />}
                onClick={() => setChangeEmailModalVisible(true)}
              >
                Đổi email
              </Button>
              {!editMode ? (
                <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
                  Chỉnh sửa
                </Button>
              ) : (
                <Space>
                  <Button onClick={handleCancel}
                  type="primary"
                  >Hủy</Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={() => form.submit()}
                  >
                    Lưu
                  </Button>
                </Space>
              )}
            </Space>
          </div>

          <Divider />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            disabled={!editMode}
            className="user-form"
          >
            <div className="form-row">
              <Form.Item
                name="firstName"
                label="Tên"
                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
              <Form.Item
                name="lastName"
                label="Họ"
                rules={[{ required: true, message: "Vui lòng nhập họ" }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </div>
            <div className="form-row">
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input prefix={<MailOutlined />} disabled />
              </Form.Item>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
            </div>
            <div className="form-row">
              <Form.Item name="gender" label="Giới tính">
                <Select className="grey-text-select">
                  <Option value="MALE">Nam</Option>
                  <Option value="FEMALE">Nữ</Option>
                  <Option value="OTHER">Khác</Option>
                </Select>
              </Form.Item>
              <Form.Item name="birthDay" label="Ngày sinh" className="grey-form-item">
                <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
              </Form.Item>
            </div>
          </Form>
        </Card>

        <Modal
          title="Đổi mật khẩu"
          open={changePasswordModalVisible}
          onCancel={() => setChangePasswordModalVisible(false)}
          footer={null}
        >
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handleChangePassword}
          >
            <Form.Item
              name="oldPassword"
              label="Mật khẩu cũ"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ" }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="Mật khẩu mới"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu mới"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Mật khẩu không khớp"));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Đổi mật khẩu
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Đổi email"
          open={changeEmailModalVisible}
          onCancel={() => setChangeEmailModalVisible(false)}
          footer={null}
        >
          <Form form={emailForm} layout="vertical" onFinish={handleChangeEmail}>
            <Form.Item
              name="newEmail"
              label="Email mới"
              rules={[
                { required: true, message: "Vui lòng nhập email mới" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="otp"
              label="Mã OTP"
              rules={[{ required: true, message: "Vui lòng nhập mã OTP" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Đổi email
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default UserDetail;