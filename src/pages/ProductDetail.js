import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../assets/css/ProductDetail.css";
import { useNavigate } from "react-router-dom";

const ProductDetail = () => {
  const { productId } = useParams(); // Lấy productId từ URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem("role"); // Lấy vai trò từ localStorage
    setRole(userRole);
    const fetchProductDetail = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8081/api/products/${productId}`
        );
        setProduct(response.data.data); // Lưu thông tin sản phẩm vào state
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product detail:", error);
        setError("Failed to fetch product details.");
        setLoading(false);
      }
    };

    fetchProductDetail(); // Gọi hàm để lấy thông tin sản phẩm
  }, [productId]); // Chạy lại khi productId thay đổi

  const handleAddToCart = () => {
    // Logic để thêm sản phẩm vào giỏ hàng
    console.log("Thêm vào giỏ hàng:", product);
  };

  const handleBuyNow = () => {
    // Logic để mua ngay sản phẩm
    console.log("Mua ngay sản phẩm:", product);
  };

  const handleEditProduct = () => {
    // Logic để xử lý sửa sản phẩm, có thể chuyển hướng đến trang sửa sản phẩm
    console.log("Sửa sản phẩm với ID:", productId);
    navigate(`/product/manage/${productId}`); // Chuyển hướng đến trang chỉnh sửa sản phẩm
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="container ">
      {product && (
        <div className="productShow " style={{ marginBottom: "200px" }}>
          <div className="left-column">
            <img
              src={product.mainImageUrl}
              alt={product.productName}
              className="product-image"
            />
          </div>
          <div className="right-column">
            <h2 className="product-title">{product.productName}</h2>
            <p className="product-description">{product.description}</p>
            <p className="product-price">
              Giá: {product.currentPrice.newPrice.toLocaleString()}₫
            </p>
            <p className="product-dimension">Kích thước: {product.dimension}</p>
            <p className="product-weight">Trọng lượng: {product.weight}g</p>

            <button className="btn btn-add-to-cart" onClick={handleAddToCart}>
              Thêm vào giỏ hàng
            </button>
            <button className="btn btn-buy-now" onClick={handleBuyNow}>
              Mua ngay
            </button>
            {/* Hiển thị nút "Sửa sản phẩm" chỉ cho admin */}
            {role === "ADMIN" && (
              <button className="btn btn-warning" onClick={handleEditProduct}>
                Sửa sản phẩm
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
