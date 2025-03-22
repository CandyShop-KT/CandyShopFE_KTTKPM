import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../assets/css/ManageProduct.css";

const ManageProducts = () => {
  const { productId } = useParams(); // Lấy productId từ URL
  const navigate = useNavigate(); // Khởi tạo useNavigate
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [dimension, setDimension] = useState("");
  const [weight, setWeight] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [publisherId, setPublisherId] = useState("");
  const [mainImage, setMainImage] = useState(null);
  const [price, setPrice] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isFetch, setIsFetch] = useState(false);
  const [categories, setCategories] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const token = localStorage.getItem("token"); // Thay thế bằng token thực tế của bạn
  const role = localStorage.getItem("role");
  const [currentPrice, setCurrentPrice] = useState(""); // Giá hiện tại

  useEffect(() => {
    if (role !== "ADMIN") {
      alert("Bạn không có quyền truy cập trang này.");
      navigate("/"); // Điều hướng về trang chính hoặc trang khác
    } else {
      fetchCategories();
      fetchPublishers();

      if (productId) {
        fetchProductDetails(productId); // Gọi hàm lấy thông tin sản phẩm nếu có productId
        setIsEditing(true); // Đặt trạng thái chỉnh sửa
      }
    }
  }, [role, productId]);

  // Hàm lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/categories");
      setCategories(response.data.data);
      setIsFetch(true);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Hàm lấy danh sách nhà xuất bản
  const fetchPublishers = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/publishers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPublishers(response.data.data.content);
    } catch (error) {
      console.error("Error fetching publishers:", error);
    }
  };

  // Hàm lấy thông tin sản phẩm
  const fetchProductDetails = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:8081/api/products/${id}`
      );
      const product = response.data.data;
      setProductName(product.productName);
      setDescription(product.description);
      setDimension(product.dimension);
      setWeight(product.weight);
      setSubCategory(product.subCategory);
      setCategoryId(product.categoryId);
      setSubCategoryId(product.subCategory.subCategoryId);
      setPublisherId(product.publisher.publisherId);
      setCurrentPrice(product.currentPrice.newPrice); // Lưu giá hiện tại vào state
      setPrice(product.currentPrice.newPrice); // Đặt giá mặc định là giá hiện tại
      setMainImage(product.mainImageUrl);
      setIsFetch(false);
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  const handleCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    setCategoryId(selectedCategoryId);
    setSubCategoryId(""); // Reset ID phân loại phụ
    fetchSubCategories(selectedCategoryId); // Lấy phân loại phụ cho danh mục đã chọn
    setIsFetch(true);
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      const response = await axios.get(
        `http://localhost:8081/api/categories/${categoryId}/subcategories`
      );
      setSubCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const updateProductPrice = async (newPrice) => {
    // if (parseFloat(currentPrice) !== parseFloat(newPrice)) {
    if (parseFloat(currentPrice) !== parseFloat(newPrice)) {
      const priceChangeReason = "Admin thay đổi giá sản phẩm";
      const now = new Date();
      const options = { timeZone: "Asia/Ho_Chi_Minh", hour12: false };
      const localDate = new Date(
        now.toLocaleString("sv-SE", options).replace(" ", "T")
      ); // Định dạng ISO 8601

      localDate.setSeconds(localDate.getSeconds() + 1);

      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, "0");
      const day = String(localDate.getDate()).padStart(2, "0");
      const hours = String(localDate.getHours()).padStart(2, "0");
      const minutes = String(localDate.getMinutes()).padStart(2, "0");
      const seconds = String(localDate.getSeconds()).padStart(2, "0");

      const priceChangeEffectiveDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

      try {
        const response = await axios.post(
          `http://localhost:8081/api/products/${productId}/price-histories`,
          {
            newPrice: parseFloat(newPrice),
            priceChangeReason,
            priceChangeEffectiveDate,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          alert("Đã cập nhật giá sản phẩm");
          return true; // Trả về true nếu cập nhật giá thành công
        }
      } catch (error) {
        console.error(
          "Error updating product price:",
          error.response ? error.response.data : error
        );
        alert("Đã xảy ra lỗi khi cập nhật giá sản phẩm.");
        return false; // Trả về false nếu có lỗi
      }
    }
    return true; // Nếu giá không thay đổi, coi như thành công
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("productName", productName);
    formData.append("description", description);
    formData.append("dimension", dimension);
    formData.append("weight", weight);
    formData.append("categoryId", categoryId);
    formData.append("subCategoryId", subCategoryId);
    formData.append("publisherId", publisherId);
    formData.append("mainImage", mainImage);
    formData.append("price", price);

    try {
      if (isEditing) {
        // Nếu đang ở chế độ chỉnh sửa, gọi hàm cập nhật giá trước
        const priceUpdateSuccess = await updateProductPrice(price);

        if (priceUpdateSuccess) {
          // Chỉ khi cập nhật giá thành công, mới gọi hàm cập nhật sản phẩm
          const response = await axios.patch(
            `http://localhost:8081/api/products/${productId}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.status === 200) {
            alert("Cập nhật sản phẩm thành công!");
            navigate(`/product`); // Điều hướng về trang sản phẩm
          }
        } else {
          alert("Cập nhật giá không thành công, không thể cập nhật sản phẩm.");
        }
      } else {
        // Nếu không, gọi hàm thêm sản phẩm
        const response = await axios.post(
          "http://localhost:8081/api/products",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 201) {
          alert(
            `Thêm sản phẩm thành công! ID sản phẩm: ${response.data.data.productId}`
          );
          resetForm();
          navigate(`/product`);
        }
      }
    } catch (error) {
      // Xử lý lỗi như trước
      if (error.response && error.response.data) {
        // Kiểm tra xem có phản hồi lỗi từ API không
        const errorMessage = error.response.data.message;
        const errorData = error.response.data.data;

        console.log(errorMessage);
        console.log(errorData);
        // Tạo một thông báo lỗi chi tiết
        let detailedErrorMessage = `${errorMessage}\n`;

        // Thêm từng lỗi cụ thể vào thông báo
        for (const [key, value] of Object.entries(errorData)) {
          detailedErrorMessage += `${key}: ${value}\n`;
        }

        alert(detailedErrorMessage); // Hiển thị thông báo lỗi
      } else {
        console.error("Error saving product:", error);
        alert("Đã xảy ra lỗi khi lưu sản phẩm.");
      }
    }
  };

  const handleDeleteProduct = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        const response = await axios.delete(
          `http://localhost:8081/api/products/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          alert("Xóa sản phẩm thành công!");
          navigate(`/product`); // Điều hướng về trang sản phẩm
        }
      } catch (error) {
        if (error.response && error.response.data) {
          // Kiểm tra xem có phản hồi lỗi từ API không
          const errorMessage = error.response.data.message;
          alert(errorMessage); // Hiển thị thông báo lỗi
        } else {
          console.error("Error deleting product:", error);
          alert("Đã xảy ra lỗi khi xóa sản phẩm.");
        }
      }
    }
  };

  const resetForm = () => {
    setProductName("");
    setDescription("");
    setDimension("");
    setWeight("");
    setCategoryId("");
    setSubCategoryId("");
    setPublisherId("");
    setMainImage(null);
    setPrice("");
    setIsEditing(false);
    navigate(`/product`); // Điều hướng về trang sản phẩm
  };

  return (
    <div className="manage-order-container container py-4">
      <h2 className="manage-order-header text-center mb-4">
        {isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
      </h2>
      <form onSubmit={handleSubmit} className="manage-order-form row g-3">
        {/* Dropdown cho danh mục chính */}
        <div className="col-md-12">
          <select
            value={categoryId}
            onChange={handleCategoryChange}
            className="form-select manage-order-category"
          >
            <option value="">Chọn danh mục chính</option>
            {categories.map((category) => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown cho danh mục phụ */}
        <div className="col-md-12">
          <select
            value={subCategoryId}
            onChange={(e) => setSubCategoryId(e.target.value)}
            className="form-select manage-order-subcategory"
          >
            {!isFetch ? (
              <option value="">{subCategory.subCategoryName}</option>
            ) : (
              <option value="">Chọn danh mục phụ</option>
            )}
            {subCategories.map((subCategory) => (
              <option
                key={subCategory.subCategoryId}
                value={subCategory.subCategoryId}
              >
                {subCategory.subCategoryName}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown cho ID Nhà xuất bản */}
        <div className="col-md-12">
          <select
            value={publisherId}
            onChange={(e) => setPublisherId(e.target.value)}
            className="form-select manage-order-publisher"
          >
            <option value="">Chọn nhà cung cấp</option>
            {publishers.map((publisher) => (
              <option key={publisher.publisherId} value={publisher.publisherId}>
                {publisher.publisherName}
              </option>
            ))}
          </select>
        </div>

        {/* Các trường khác */}
        <div className="col-md-12">
          <input
            type="text"
            className="form-control manage-order-name"
            placeholder="Tên sản phẩm"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>
        <div className="col-md-12">
          <textarea
            className="form-control manage-order-description"
            placeholder="Mô tả sản phẩm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <input
            type="text"
            className="form-control manage-order-dimension"
            placeholder="Kích thước (ví dụ: 10x20x30)"
            value={dimension}
            onChange={(e) => setDimension(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <input
            type="number"
            className="form-control manage-order-weight"
            placeholder="Trọng lượng (g)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>

        {!isEditing && (
          <div className="col-md-12">
            <input
              type="file"
              className="form-control manage-order-image"
              onChange={(e) => {
                setMainImage(e.target.files[0]);
              }}
              required
            />
          </div>
        )}

        <div className="col-md-12">
          <input
            type="text"
            className="form-control manage-order-price"
            placeholder="Giá (VNĐ)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div className="col-md-12 d-flex gap-2">
          <button type="submit" className="btn btn-success manage-order-submit">
            {isEditing ? "Cập nhật" : "Thêm sản phẩm"}
          </button>
          {isEditing && (
            <>
              <button
                type="button"
                className="btn btn-danger manage-order-delete"
                onClick={handleDeleteProduct}
              >
                Xóa sản phẩm
              </button>
              <button
                type="button"
                className="btn btn-secondary manage-order-reset"
                onClick={resetForm}
              >
                Hủy
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};
export default ManageProducts;
