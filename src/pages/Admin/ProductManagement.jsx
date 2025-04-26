import React, { useState, useEffect } from "react";
import {
  Tabs,
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  message,
  Select,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminLayout from "../../layouts/AdminLayout";
import "./ProductManagement.css";

const { TabPane } = Tabs;
const { Search } = Input;

const ProductManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [form] = Form.useForm();
  const token = localStorage.getItem("token");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    // Check admin role when component mounts
    const role = localStorage.getItem("role");
    if (role !== "ADMIN") {
      message.error("Bạn không có quyền truy cập trang này");
      navigate("/");
      return;
    }
    fetchProducts();
    fetchCategories();
    fetchSubCategories();
  }, [pagination.current]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8081/api/products?page=${
          pagination.current - 1
        }&size=${pagination.pageSize}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProducts(response.data.data.content);
      setPagination({
        ...pagination,
        total: response.data.data.totalElements,
      });
    } catch (error) {
      message.error("Lỗi khi tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data.data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách danh mục");
    }
  };

  const fetchSubCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8081/api/subcategories",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSubCategories(response.data.data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách danh mục con");
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
    });
  };

  const handleSearch = async (value, type) => {
    if (!value || value.trim() === "") {
      message.error("Vui lòng nhập từ khóa tìm kiếm!");
      return;
    }

    try {
      setLoading(true);
      let response;
      switch (type) {
        case "product":
          response = await axios.get(
            `http://localhost:8081/api/products/search?keyword=${value}&page=${
              pagination.current - 1
            }&size=${pagination.pageSize}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setProducts(response.data.data.content);
          setPagination({
            ...pagination,
            total: response.data.data.totalElements,
          });
          break;
        case "category":
          response = await axios.get(
            `http://localhost:8081/api/categories/search?keyword=${value}&page=${
              pagination.current - 1
            }&size=${pagination.pageSize}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setCategories(response.data.data);
          break;
        case "subcategory":
          response = await axios.get(
            `http://localhost:8081/api/subcategories/search?keyword=${value}&page=${
              pagination.current - 1
            }&size=${pagination.pageSize}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setSubCategories(response.data.data);
          break;
        default:
          break;
      }
    } catch (error) {
      message.error("Lỗi khi tìm kiếm");
    } finally {
      setLoading(false);
    }
  };

  const showModal = (type) => {
    setModalType(type);
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      let response;
      switch (modalType) {
        case "category":
          if (values.categoryId) {
            // Update category
            response = await axios.patch(
              `http://localhost:8081/api/categories/${values.categoryId}`,
              { categoryName: values.categoryName },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
          } else {
            // Create new category
            response = await axios.post(
              "http://localhost:8081/api/categories",
              { categoryName: values.categoryName },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
          }
          break;
        case "subcategory":
          const subcategoryData = {
            subCategoryName: values.categoryName,
            categoryId: values.categoryId || values.parentCategory, // Sử dụng giá trị ban đầu nếu không có thay đổi
          };

          if (values.subCategoryId) {
            // Update subcategory
            response = await axios.patch(
              `http://localhost:8081/api/subcategories/${values.subCategoryId}`,
              subcategoryData,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
          } else {
            // Create new subcategory
            response = await axios.post(
              "http://localhost:8081/api/subcategories",
              subcategoryData,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
          }
          break;
      }
      message.success(
        `${
          values.categoryId || values.subCategoryId ? "Cập nhật" : "Thêm"
        } thành công`
      );
      setIsModalVisible(false);
      form.resetFields();
      fetchCategories();
      fetchSubCategories();
    } catch (error) {
      message.error(
        `Lỗi khi ${
          form.getFieldValue("categoryId") ||
          form.getFieldValue("subCategoryId")
            ? "cập nhật"
            : "thêm"
        }`
      );
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const productColumns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Danh mục sp",
      dataIndex: ["subCategory", "subCategoryName"],
      key: "subCategory",
    },
    {
      title: "Giá",
      dataIndex: ["currentPrice", "newPrice"],
      key: "price",
      render: (price) => `${price.toLocaleString()} VNĐ`,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/product/${record.productId}`)}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete("product", record.productId)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const categoryColumns = [
    {
      title: "Tên danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit("category", record)}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete("category", record.categoryId)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const subCategoryColumns = [
    {
      title: "Tên danh mục con",
      dataIndex: "subCategoryName",
      key: "subCategoryName",
    },
    {
      title: "Danh mục cha",
      dataIndex: ["category", "categoryName"],
      key: "category",
      render: (text, record) =>
        record.category?.categoryName || "Chưa có danh mục cha",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit("subcategory", record)}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete("subcategory", record.subCategoryId)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const handleDelete = async (type, id) => {
    try {
      let url;
      switch (type) {
        case "product":
          url = `http://localhost:8081/api/products/${id}`;
          break;
        case "category":
          url = `http://localhost:8081/api/categories/${id}`;
          break;
        case "subcategory":
          url = `http://localhost:8081/api/subcategories/${id}`;
          break;
        default:
          break;
      }
      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Xóa thành công");
      fetchProducts();
      fetchCategories();
      fetchSubCategories();
    } catch (error) {
      message.error("Lỗi khi xóa vì đã tồn tại sản phẩm dùng danh mục con");
    }
  };

  const handleEdit = (type, record) => {
    setModalType(type);
    if (type === "category") {
      form.setFieldsValue({
        categoryId: record.categoryId,
        categoryName: record.categoryName,
      });
    } else {
      form.setFieldsValue({
        subCategoryId: record.subCategoryId,
        categoryName: record.subCategoryName,
        categoryId: record.category?.categoryId, // Sử dụng optional chaining
        parentCategory: record.category?.categoryId, // Thêm trường này để lưu giá trị ban đầu
      });
    }
    setIsModalVisible(true);
  };

  return (
    <AdminLayout>
      <div className="container py-4">
        <Tabs defaultActiveKey="1">
          <TabPane tab="Quản lý sản phẩm" key="1">
            <div className="mb-3">
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate("/admin/product")}
                  className="custom-button"
                >
                  Thêm sản phẩm
                </Button>
                <Search
                  placeholder="Tìm kiếm sản phẩm"
                  onSearch={(value) => handleSearch(value, "product")}
                  style={{ width: 300 }}
                  className="custom-search"
                  allowClear
                />
              </Space>
            </div>
            <Table
              columns={productColumns}
              dataSource={products}
              loading={loading}
              rowKey="productId"
              pagination={pagination}
              onChange={handleTableChange}
            />
          </TabPane>

          <TabPane tab="Quản lý danh mục cha" key="2">
            <div className="mb-3">
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => showModal("category")}
                >
                  Thêm danh mục
                </Button>
                <Search
                  placeholder="Tìm kiếm danh mục"
                  onSearch={(value) => handleSearch(value, "category")}
                  style={{ width: 300 }}
                />
              </Space>
            </div>
            <Table
              columns={categoryColumns}
              dataSource={categories}
              loading={loading}
              rowKey="categoryId"
            />
          </TabPane>

          <TabPane tab="Quản lý danh mục con" key="3">
            <div className="mb-3">
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => showModal("subcategory")}
                >
                  Thêm danh mục con
                </Button>
                <Search
                  placeholder="Tìm kiếm danh mục con"
                  onSearch={(value) => handleSearch(value, "subcategory")}
                  style={{ width: 300 }}
                />
              </Space>
            </div>
            <Table
              columns={subCategoryColumns}
              dataSource={subCategories}
              loading={loading}
              rowKey="subCategoryId"
            />
          </TabPane>
        </Tabs>

        <Modal
          title={
            modalType === "category"
              ? `${form.getFieldValue("categoryId") ? "Sửa" : "Thêm"} danh mục`
              : `${
                  form.getFieldValue("subCategoryId") ? "Sửa" : "Thêm"
                } danh mục con`
          }
          visible={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
        >
          <Form form={form} layout="vertical">
            <Form.Item name="categoryId" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="subCategoryId" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="parentCategory" hidden>
              <Input />
            </Form.Item>
            <Form.Item
              name="categoryName"
              label={
                modalType === "category" ? "Tên danh mục" : "Tên danh mục con"
              }
              rules={[
                {
                  required: true,
                  message: `Vui lòng nhập tên danh mục ${
                    modalType === "category" ? "" : "con"
                  }`,
                },
              ]}
            >
              <Input />
            </Form.Item>
            {modalType === "subcategory" && (
              <Form.Item
                name="categoryId"
                label="Danh mục cha"
                rules={[
                  { required: true, message: "Vui lòng chọn danh mục cha" },
                ]}
              >
                <Select>
                  {categories.map((category) => (
                    <Select.Option
                      key={category.categoryId}
                      value={category.categoryId}
                    >
                      {category.categoryName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default ProductManagement;
