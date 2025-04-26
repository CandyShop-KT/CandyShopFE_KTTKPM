import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Typography,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  UploadOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import AdminLayout from '../layouts/AdminLayout';
import moment from 'moment'; // Thêm moment để xử lý ngày tháng
import '../assets/css/manageUser.css';

const { Option } = Select;
const { Title } = Typography;

const AddUser = () => {
  const navigate = useNavigate();
  const { userId } = useParams(); 
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [userData, setUserData] = useState(null);

  const token = localStorage.getItem('token');
  const api = 'http://localhost:8081/api/';

  useEffect(() => {
    if (userId) {
      axios
        .get(`${api}users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUserData(response.data);
          // Chuyển đổi ngày sinh về định dạng yyyy-MM-dd
          const formattedDate = moment(response.data.birthDay).format('YYYY-MM-DD');
          form.setFieldsValue({ ...response.data, birthDay: formattedDate });
        })
        .catch((error) => {
          message.error('Không thể lấy dữ liệu người dùng');
        });
    }
  }, [userId, api, token]);

  // Xử lý gửi form
  const handleSubmit = async (values) => {
    setLoading(true);
    const formData = new FormData();

    // Chuyển đổi ngày sinh sang định dạng yyyy-MM-dd nếu có
    if (values.birthDay) {
      values.birthDay = moment(values.birthDay).format('YYYY-MM-DD');
    }

    // Thêm dữ liệu từ form vào FormData
    Object.keys(values).forEach((key) => {
      if (key !== 'avatar' && key !== 'avatarUrl') {
        formData.append(key, values[key]);
      }
    });

    // Nếu có avatar, thêm vào formData
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    try {
      const response = await axios.post(`${api}users/addUserFromAdmin`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        message.success('Thêm người dùng thành công');
        navigate('/admin/users');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể thêm người dùng');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thay đổi avatar
  const handleAvatarChange = (info) => {
    if (info.file.status === 'done') {
      setAvatarFile(info.file.originFileObj);
      message.success(`${info.file.name} đã được tải lên thành công`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} tải lên thất bại`);
    }
  };

  const uploadProps = {
    name: 'avatar',
    listType: 'picture-card',
    showUploadList: false,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Bạn chỉ có thể tải lên file ảnh!');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Ảnh phải nhỏ hơn 2MB!');
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
          title={<Title level={3}>{userId ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</Title>}
          extra={
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin/users')}
              style={{ backgroundColor: '#1890ff', color: '#fff' }}
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
              <Title level={5}>Thông tin cơ bản</Title>
              <Form.Item
                name="firstName"
                label="Họ"
                rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item
                name="lastName"
                label="Tên"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' },
                ]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>

              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
            </div>

            <div className="form-section">
              <Title level={5}>Thông tin đăng nhập</Title>
              <Form.Item
                name="userName"
                label="Tên đăng nhập"
                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  { required: !userId, message: 'Vui lòng nhập mật khẩu' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
            </div>

            <div className="form-section">
              <Title level={5}>Thông tin khác</Title>
              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
              >
                <Radio.Group>
                  <Radio value="MALE">Nam</Radio>
                  <Radio value="FEMALE">Nữ</Radio>
                  <Radio value="OTHER">Khác</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="birthDay"
                label="Ngày sinh"
                rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>

              <Form.Item
                name="role"
                label="Vai trò"
                rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
              >
                <Select>
                  <Option value="ADMIN">Admin</Option>
                  <Option value="USER">User</Option>
                </Select>
              </Form.Item>

              <Form.Item label="Ảnh đại diện">
                <Upload {...uploadProps}>
                  {userData && userData.avatarUrl ? (
                    <img src={userData.avatarUrl} alt="avatar" style={{ width: '100%' }} />
                  ) : avatarFile ? (
                    <img src={URL.createObjectURL(avatarFile)} alt="avatar" style={{ width: '100%' }} />
                  ) : (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Tải lên</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </div>

            <Form.Item style={{ textAlign: 'center' }}>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{
                    backgroundColor: '#1890ff',
                    borderColor: '#1890ff',
                    color: '#fff',
                  }}
                >
                  {userId ? 'Cập nhật người dùng' : 'Thêm người dùng'}
                </Button>
                <Button
                  onClick={() => navigate('/admin/users')}
                  style={{
                    backgroundColor: '#f5222d',
                    borderColor: '#f5222d',
                    color: '#fff',
                  }}
                >
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AddUser;
