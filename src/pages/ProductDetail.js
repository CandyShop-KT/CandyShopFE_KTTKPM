import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../assets/css/ProductDetail.css";

import api from "../config/api";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";


const ProductDetail = () => {
  const { productId } = useParams(); // Lấy productId từ URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [role, setRole] = useState("");

  const [notification, setNotification] = useState(null);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem("role"); // Lấy vai trò từ localStorage
    setRole(userRole);
    const fetchProductDetail = async () => {
      try {
        const response = await axios.get(
          `${api}/products/${productId}`
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
    if (!product) return;
    dispatch(addToCart(product));
    setNotification("Đã thêm sản phẩm vào giỏ hàng!");
    setTimeout(() => setNotification(null), 800);
  };

  const handleBuyNow = () => {
    if (!product) return;
    // Lưu sản phẩm vào sessionStorage để checkout chỉ đúng sản phẩm này
    sessionStorage.setItem(
      "checkoutNowProduct",
      JSON.stringify({ ...product, quantity: 1 })
    );
    navigate("/checkout");
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
      {/* Notification Popup */}
      {notification && (
        <div className="notification-container p-3">
          <div className="notification-message">{notification}</div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;