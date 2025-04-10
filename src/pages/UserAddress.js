import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  List,
  Space,
  Tag,
  message,
  Modal,
  Form,
  Input,
  Select,
  Divider,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";
import "../assets/css/manageUser.css";

const { Option } = Select;

const UserAddress = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const token = localStorage.getItem("token");
  const api = "http://localhost:8081/api/";

  useEffect(() => {
    fetchUserDetails();
    fetchAddresses();
    fetchProvinces();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`${api}users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.data);
    } catch (error) {
      message.error("Không thể tải thông tin người dùng");
    }
  };

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${api}users/${userId}/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(response.data.data);
      setLoading(false);
    } catch (error) {
      message.error("Không thể tải danh sách địa chỉ");
      setLoading(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      const response = await axios.get(`${api}provinces`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProvinces(response.data.data);
    } catch (error) {
      message.error("Không thể tải danh sách tỉnh/thành phố");
    }
  };

  const fetchDistricts = async (provinceId) => {
    try {
      const response = await axios.get(
        `${api}provinces/${provinceId}/districts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDistricts(response.data.data);
    } catch (error) {
      message.error("Không thể tải danh sách quận/huyện");
    }
  };

  const fetchWards = async (districtId) => {
    try {
      const response = await axios.get(`${api}districts/${districtId}/wards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWards(response.data.data);
    } catch (error) {
      message.error("Không thể tải danh sách phường/xã");
    }
  };

  const handleAddAddress = async (values) => {
    try {
      await axios.post(`${api}users/${userId}/addresses`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Thêm địa chỉ thành công");
      setAddModalVisible(false);
      form.resetFields();
      fetchAddresses();
    } catch (error) {
      message.error("Không thể thêm địa chỉ");
    }
  };

  const handleEditAddress = async (values) => {
    try {
      await axios.patch(
        `${api}users/${userId}/addresses/${selectedAddress.addressId}`,
        values,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Cập nhật địa chỉ thành công");
      setEditModalVisible(false);
      editForm.resetFields();
      fetchAddresses();
    } catch (error) {
      message.error("Không thể cập nhật địa chỉ");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await axios.delete(`${api}users/${userId}/addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Xóa địa chỉ thành công");
      fetchAddresses();
    } catch (error) {
      message.error("Không thể xóa địa chỉ");
    }
  };

  const handleProvinceChange = (value) => {
    form.setFieldsValue({ districtId: undefined, wardId: undefined });
    editForm.setFieldsValue({ districtId: undefined, wardId: undefined });
    setDistricts([]);
    setWards([]);
    if (value) {
      fetchDistricts(value);
    }
  };

  const handleDistrictChange = (value) => {
    form.setFieldsValue({ wardId: undefined });
    editForm.setFieldsValue({ wardId: undefined });
    setWards([]);
    if (value) {
      fetchWards(value);
    }
  };

  const handleEditClick = (address) => {
    setSelectedAddress(address);
    editForm.setFieldsValue({
      customerName: address.customerName,
      phoneNumber: address.phoneNumber,
      address: address.address,
      provinceId: address.province.provinceId,
      districtId: address.district.districtId,
      wardId: address.ward.wardId,
    });
    fetchDistricts(address.province.provinceId);
    fetchWards(address.district.districtId);
    setEditModalVisible(true);
  };

  return (
    <AdminLayout>
      <div className="user-address-container">
        <Card
          className="user-address-card"
          title={`Địa chỉ của ${user?.firstName} ${user?.lastName}`}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAddModalVisible(true)}
            >
              Thêm địa chỉ
            </Button>
          }
          loading={loading}
        >
          <List
            className="address-list"
            itemLayout="vertical"
            dataSource={addresses}
            renderItem={(address) => (
              <List.Item
                className="address-item"
                actions={[
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => handleEditClick(address)}
                  >
                    Chỉnh sửa
                  </Button>,
                  <Popconfirm
                    title="Bạn có chắc chắn muốn xóa địa chỉ này?"
                    onConfirm={() => handleDeleteAddress(address.addressId)}
                    okText="Có"
                    cancelText="Không"
                  >
                    <Button danger icon={<DeleteOutlined />}>
                      Xóa
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <div className="address-item-header">
                  <span className="address-item-title">
                    {address.customerName}
                  </span>
                  <Tag icon={<PhoneOutlined />}>{address.phoneNumber}</Tag>
                </div>
                <div className="address-item-content">
                  {address.address}, {address.ward.wardName},{" "}
                  {address.district.districtName},{" "}
                  {address.province.provinceName}
                </div>
              </List.Item>
            )}
          />
        </Card>

        {/* Add Address Modal */}
        <Modal
          title="Thêm địa chỉ mới"
          visible={addModalVisible}
          onCancel={() => setAddModalVisible(false)}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleAddAddress}>
            <Form.Item
              name="customerName"
              label="Tên người nhận"
              rules={[
                { required: true, message: "Vui lòng nhập tên người nhận" },
              ]}
            >
              <Input prefix={<UserOutlined />} />
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
            <Form.Item
              name="provinceId"
              label="Tỉnh/Thành phố"
              rules={[
                { required: true, message: "Vui lòng chọn tỉnh/thành phố" },
              ]}
            >
              <Select
                placeholder="Chọn tỉnh/thành phố"
                onChange={handleProvinceChange}
              >
                {provinces.map((province) => (
                  <Option key={province.provinceId} value={province.provinceId}>
                    {province.provinceName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="districtId"
              label="Quận/Huyện"
              rules={[{ required: true, message: "Vui lòng chọn quận/huyện" }]}
            >
              <Select
                placeholder="Chọn quận/huyện"
                onChange={handleDistrictChange}
                disabled={!form.getFieldValue("provinceId")}
              >
                {districts.map((district) => (
                  <Option key={district.districtId} value={district.districtId}>
                    {district.districtName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="wardId"
              label="Phường/Xã"
              rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
            >
              <Select
                placeholder="Chọn phường/xã"
                disabled={!form.getFieldValue("districtId")}
              >
                {wards.map((ward) => (
                  <Option key={ward.wardId} value={ward.wardId}>
                    {ward.wardName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="address"
              label="Địa chỉ cụ thể"
              rules={[
                { required: true, message: "Vui lòng nhập địa chỉ cụ thể" },
              ]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Thêm địa chỉ
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* Edit Address Modal */}
        <Modal
          title="Chỉnh sửa địa chỉ"
          visible={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          footer={null}
        >
          <Form form={editForm} layout="vertical" onFinish={handleEditAddress}>
            <Form.Item
              name="customerName"
              label="Tên người nhận"
              rules={[
                { required: true, message: "Vui lòng nhập tên người nhận" },
              ]}
            >
              <Input prefix={<UserOutlined />} />
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
            <Form.Item
              name="provinceId"
              label="Tỉnh/Thành phố"
              rules={[
                { required: true, message: "Vui lòng chọn tỉnh/thành phố" },
              ]}
            >
              <Select
                placeholder="Chọn tỉnh/thành phố"
                onChange={handleProvinceChange}
              >
                {provinces.map((province) => (
                  <Option key={province.provinceId} value={province.provinceId}>
                    {province.provinceName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="districtId"
              label="Quận/Huyện"
              rules={[{ required: true, message: "Vui lòng chọn quận/huyện" }]}
            >
              <Select
                placeholder="Chọn quận/huyện"
                onChange={handleDistrictChange}
                disabled={!editForm.getFieldValue("provinceId")}
              >
                {districts.map((district) => (
                  <Option key={district.districtId} value={district.districtId}>
                    {district.districtName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="wardId"
              label="Phường/Xã"
              rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
            >
              <Select
                placeholder="Chọn phường/xã"
                disabled={!editForm.getFieldValue("districtId")}
              >
                {wards.map((ward) => (
                  <Option key={ward.wardId} value={ward.wardId}>
                    {ward.wardName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="address"
              label="Địa chỉ cụ thể"
              rules={[
                { required: true, message: "Vui lòng nhập địa chỉ cụ thể" },
              ]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Cập nhật địa chỉ
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default UserAddress;
