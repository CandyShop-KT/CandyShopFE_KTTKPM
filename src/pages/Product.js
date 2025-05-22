import React, { useEffect, useState } from "react";
import axios from "axios";
import "../assets/css/product.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import { useParams } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import api from "../config/api";

const Product = ({ setCartCount }) => {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 15; // Số lượng sản phẩm tối đa trên mỗi trang
  const params = useParams();
  const subCategoryId = params.subCategoryId;
  const keyword = params.keyword;
  const [subCategory, setSubCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [notification, setNotification] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 1000000]); 
  const [isFilteringByPrice, setIsFilteringByPrice] = useState(false);
  const [sortField, setSortField] = useState("productName");
  const [sortOrder, setSortOrder] = useState("asc");




  const images = [
    require("../assets/images/banner1.jpg"),
    require("../assets/images/banner2.jpg"),
    require("../assets/images/banner3.jpg"),
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval); // Dọn dẹp khi component unmount
  }, [images.length]);

  const fetchSubCategory = async () => {
    try {
      const response = await fetch(
        `${api}/subcategories/${subCategoryId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch subcategory");
      }
      const data = await response.json();
      setSubCategory(data.data); // Giả sử API trả về tên phân loại trong data.name
    } catch (error) {
      console.error("Error fetching subcategory:", error);
    }
  };


  
  const fetchProductsByPriceRange = async (page) => {
  try {
    const [minPrice, maxPrice] = priceRange;

    const response = await axios.get(
      `http://localhost:8081/api/products/searchByPrice`,
      {
        params: {
          minPrice,
          maxPrice,
          page,
          limit,
          sortField: "productName",
          sortOrder: "asc",
        },

      }
    );

    const data = response.data.data;
    setProducts(data.content);
    setTotalPages(data.totalPages);
    setLoading(false);
  } catch (error) {
    console.error("Error fetching products by price range:", error);
    setLoading(false);
  }
};

  // const fetchProducts = async (page) => {
  //   console.log("Keyword:", keyword);
  //   try {
  //     let response;
  //     if (subCategoryId) {
  //       response = await axios.get(
  //         `http://localhost:8081/api/products/subcategory/${subCategoryId}?page=${page}&limit=${limit}`
  //       );
  //     } else if (keyword) {
  //       response = await axios.get(
  //         `http://localhost:8081/api/products/searchByName?name=${keyword}&page=${page}&limit=${limit}`
  //       );
  //     } else {
  //       response = await axios.get(
  //         `http://localhost:8081/api/products?limit=${limit}&page=${page}`
  //       );
  //     }
  //     const data = response.data.data;
  //     setProducts(data.content);
  //     setTotalPages(data.totalPages);
  //     setLoading(false);
  //   } catch (error) {
  //     console.error("Error fetching products:", error);
  //     console.error(
  //       "Error updating product price:",
  //       error.response ? error.response.data : error
  //     );
  //     setLoading(false);
  //   }
  // };
const fetchProducts = async (page) => {
  try {
    let response;
    const params = {
      page,
      limit,
      sortBy: `${sortField}_${sortOrder}`,
    };

    if (subCategoryId) {
      response = await axios.get(
        `http://localhost:8081/api/products/subcategory/${subCategoryId}`,
        { params }
      );
    } else if (keyword) {
      response = await axios.get(
        `http://localhost:8081/api/products/searchByName`,
        {
          params: {
            name: keyword,
            ...params,
          },
        }
      );
    } else {
      response = await axios.get(`http://localhost:8081/api/products`, {
        params,
      });
    }

    const data = response.data.data;
    setProducts(data.content);
    setTotalPages(data.totalPages);
    setLoading(false);
  } catch (error) {
    console.error("Error fetching products:", error);
    setLoading(false);
  }
};
useEffect(() => {
  if (!isFilteringByPrice) {
    fetchProducts(currentPage);
  }
}, [sortField, sortOrder, currentPage]); // THÊM currentPage



  const navigate = useNavigate();
  const handleViewDetail = (productId) => {
    // Chuyển hướng đến trang chi tiết sản phẩm với productId
    navigate(`/productDetail/${productId}`);
  };

useEffect(() => {
  const fetchAll = async () => {
    try {
      setLoading(true); // hiển thị loading

      // Reset lọc giá khi chuyển danh mục hoặc tìm kiếm
      if (subCategoryId || keyword) {
        setIsFilteringByPrice(false);
      }

      if (subCategoryId) {
        await fetchSubCategory(); // cần đợi lấy subCategory trước
        await fetchProducts(currentPage); // sau khi có subCategory mới fetch sản phẩm
      } else if (keyword) {
        await fetchProducts(currentPage);
      } else if (isFilteringByPrice) {
        await fetchProductsByPriceRange(currentPage);
      } else {
        await fetchProducts(currentPage);
      }
    } catch (err) {
      console.error("Lỗi khi fetch:", err);
    }
  };

  fetchAll();
}, [currentPage, subCategoryId, keyword, isFilteringByPrice]);
 
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };


  const handleAddToCart = (product) => {
    if (!product.productId || !product.productName || !product.currentPrice) {
      alert("Sản phẩm thiếu thông tin, không thể thêm vào giỏ hàng!");
      return;
    }

    dispatch(addToCart(product));
    // Hiển thị thông báo
    setNotification(`Đã thêm 1 sản phẩm vào giỏ hàng!`);
    setTimeout(() => setNotification(null), 500);
  };

  return (
    <div className="container-fluid px-0">
      <div className="banner row px-0 ">
        <div
          id="carouselExampleAutoplaying"
          className="carousel slide px-0"
          data-bs-ride="carousel"
        >
          <div className="carousel-inner px-0">
            {images.map((image, index) => (
              <div
                className={`carousel-item ${
                  index === activeIndex ? "active" : ""
                }`}
                key={index}
              >
                <img
                  src={image}
                  className="d-block w-100"
                  alt={`Banner ${index + 1}`}
                />
              </div>
            ))}
          </div>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#carouselExampleAutoplaying"
            data-bs-slide="prev"
          >
            <span
              className="carousel-control-prev-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#carouselExampleAutoplaying"
            data-bs-slide="next"
          >
            <span
              className="carousel-control-next-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>

      <div className="product mt-4">
        <h3>{subCategory.subCategoryName}</h3>
      
  {!subCategoryId && !keyword && (
  <div className="container mb-4">
    <div className="price-slider-inline d-flex align-items-center flex-wrap">
      <h6 className="me-3 mb-0">Lọc giá:</h6>
      <div className="flex-grow-1 me-3" style={{ padding: '0 10px' }}>
  <Slider
    range
    min={0}
    max={1000000}
    step={1000}
    defaultValue={priceRange}
    onChange={(value) => setPriceRange(value)}
    allowCross={false}
  />
  <div className="d-flex justify-content-between small text-muted mt-1">
    <span>{priceRange[0].toLocaleString()} VND</span>
    <span>{priceRange[1].toLocaleString()} VND</span>
  </div>
</div>

      <button
        onClick={() => {
    setIsFilteringByPrice(true);
    setCurrentPage(0);
    fetchProductsByPriceRange(0);
  }}
         className="btn btn-apply mt-3"
        style={{ whiteSpace: "nowrap" }}
      >
        Áp dụng
      </button>
    </div>
  </div>
)}

{/* Sắp xếp chỉ hiển thị khi không phải trang chủ */}
{subCategoryId || keyword ? (
  
  <div className="sort-dropdown" style={{ marginLeft: '1200px' }}>
  <img src="../assets/images/filter.png" alt="Filter" />
    <select
      value={`${sortField}_${sortOrder}`}
      onChange={(e) => {
        const [field, order] = e.target.value.split("_");
        setSortField(field);
        setSortOrder(order);
        setCurrentPage(0); // reset page về đầu
      }}
      className="form-select d-inline w-auto"
    >
      <option value="createdAt_desc">Hàng mới</option>
      <option value="price_asc">Giá thấp đến cao</option>
      <option value="price_desc">Giá cao đến thấp</option>
      <option value="productName_asc">Tên A-Z</option>
      <option value="productName_desc">Tên Z-A</option>
    </select>
  </div>
) : null}

        <div className="row">
          {products.length > 0 ? (
            products.map((product) => (
              <div className="product-card" key={product.productId}>
                <div className="image-container">
                  <img
                    src={product.mainImageUrl}
                    alt={product.productName}
                    className="product-image"
                  />
                  <div className="overlay">
                    <h3 onClick={() => handleViewDetail(product.productId)}>
                      Xem chi tiết
                    </h3>
                  </div>
                </div>

                <div className="product-info">
                  <h5 className="product-name">{product.productName}</h5>
                  <p className="product-price mt-2 ">
                    {product.currentPrice.newPrice.toLocaleString()} VND
                    <button
                      onClick={() => handleAddToCart(product)}
                      style={{ marginLeft: "10px" }}
                      className="buttonCartProduct"
                    >
                      <i className="fa fa-shopping-cart position-relative " />
                    </button>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col text-center">
              <h4>Loading</h4>
            </div>
          )}
        </div>

        {/* Hiển thị thanh chọn trang nếu có nhiều hơn 1 trang */}
        {totalPages > 1 && (
          <nav aria-label="Page navigation">
            <ul className="pagination">
              {Array.from({ length: totalPages }, (_, index) => (
                <li
                  className={`page-item ${
                    currentPage === index ? "active" : ""
                  }`}
                  key={index}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(index)}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      {/* Notification Popup */}
      {notification && (
        <div className="notification-container p-3">
          <div className="notification-message">{notification}</div>
        </div>
      )}
    </div>
  );
};

export default Product;
