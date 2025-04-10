import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Upload,
  message,
  DatePicker,
  Radio,
  Space,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  UploadOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";
import "../assets/css/manageUser.css";

const { Option } = Select;

const AddUser = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  const token = localStorage.getItem("token");
  const api = "http://localhost:8081/api/";

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();

      // Add user data
      Object.keys(values).forEach((key) => {
        if (key !== "avatar") {
          formData.append(key, values[key]);
        }
      });

      // Add avatar if exists
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await axios.post(`${api}users`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        message.success("Thêm người dùng thành công");
        navigate("/admin/users");
      }
    } catch (error) {
      message.error(
        error.response?.data?.message || "Không thể thêm người dùng"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (info) => {
    if (info.file.status === "done") {
      setAvatarFile(info.file.originFileObj);
      message.success(`${info.file.name} đã được tải lên thành công`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} tải lên thất bại`);
    }
  };

  const uploadProps = {
    name: "avatar",
    listType: "picture-card",
    showUploadList: false,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("Bạn chỉ có thể tải lên file ảnh!");
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("Ảnh phải nhỏ hơn 2MB!");
        return false;
      }
      setAvatarFile(file);
      return false;
    },
    onChange: handleAvatarChange,
  };

  return (
    <AdminLayout>
      <div className="add-user-container">
        <Card
          className="add-user-card"
          title="Thêm người dùng mới"
          extra={
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/admin/users")}
            >
              Quay lại
            </Button>
          }
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="add-user-form"
          >
            <div className="form-section">
              <h3>Thông tin cơ bản</h3>
              <Form.Item
                name="firstName"
                label="Họ"
                rules={[{ required: true, message: "Vui lòng nhập họ" }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item
                name="lastName"
                label="Tên"
                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>

              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                ]}
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
            </div>

            <div className="form-section">
              <h3>Thông tin đăng nhập</h3>
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[
                  { required: true, message: "Vui lòng nhập tên đăng nhập" },
                ]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu" },
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
            </div>

            <div className="form-section">
              <h3>Thông tin khác</h3>
              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
              >
                <Radio.Group>
                  <Radio value="MALE">Nam</Radio>
                  <Radio value="FEMALE">Nữ</Radio>
                  <Radio value="OTHER">Khác</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="birthday"
                label="Ngày sinh"
                rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name="role"
                label="Vai trò"
                rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
              >
                <Select>
                  <Option value="ADMIN">Admin</Option>
                  <Option value="USER">User</Option>
                </Select>
              </Form.Item>

              <Form.Item label="Ảnh đại diện">
                <Upload {...uploadProps}>
                  {avatarFile ? (
                    <img
                      src={URL.createObjectURL(avatarFile)}
                      alt="avatar"
                      style={{ width: "100%" }}
                    />
                  ) : (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Tải lên</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </div>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Thêm người dùng
                </Button>
                <Button onClick={() => navigate("/admin/users")}>Hủy</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AddUser;
