import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../assets/css/header.css";
import { clearCart } from "../redux/slices/cartSlice";
import { useDispatch } from "react-redux";

import CartIcon from "../components/CartIcon";
// import { clearCart } from "../redux/slices/cartSlice";
const Header = () => {
  const [cartCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState({});
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(""); // State để lưu tên người dùng
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Điều khiển dropdown
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const role = localStorage.getItem("role");
  const handleSearch = (e) => {
    e.preventDefault(); // Ngăn hành vi mặc định của form
    if (searchTerm.trim()) {
      navigate(`/product/search/${encodeURIComponent(searchTerm.trim())}`);
    } else {
      alert("Vui lòng nhập nội dung tìm kiếm.");
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:8081/api/categories");
        const data = await response.json();
        if (response.ok) {
          console.log("Categories fetched:", data.data);
          setCategories(data.data);
        } else {
          console.error("Failed to fetch categories:", data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();

    const checkLoginStatus = () => {
      const user = localStorage.getItem("userId");
      const storedUserName = localStorage.getItem("userName"); // Lấy tên người dùng từ localStorage
      setIsLoggedIn(user ? true : false);
      setUserName(storedUserName || ""); // Cập nhật tên người dùng vào state
    };
    checkLoginStatus();
  }, []);

  const handleCategoryHover = async (categoryId) => {
    try {
      const response = await fetch(
        `http://localhost:8081/api/categories/${categoryId}/subcategories`
      );
      const data = await response.json();
      if (response.ok) {
        setSubCategories((prev) => ({
          ...prev,
          [categoryId]: data.data,
        }));
      } else {
        console.error("Failed to fetch subcategories:", data);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("token");
    // // Xóa giỏ hàng tạm thời
    // localStorage.removeItem("cart");
    sessionStorage.removeItem("selectedAddress");
    // Gọi action để xóa giỏ hàng trong Redux
    dispatch(clearCart());

    setIsLoggedIn(false);
    setIsDropdownOpen(false); // Đóng dropdown
    navigate("/"); // Điều hướng về trang chủ
  };

  const handleProfileClick = () => {
    if (!isLoggedIn) {
      navigate("/signin"); // Nếu chưa đăng nhập, chuyển đến trang đăng nhập
    } else {
      navigate("/user/profile"); // Nếu đã đăng nhập, chuyển đến trang profile
    }
  };

  const handleSubCategoryClick = (subCategoryId) => {
    navigate(`/product/${subCategoryId}`);
  };

  return (
    <div className="container-fluid px-0">
      <div className="row header">
        <div className="d-flex menuTren ">
          <img
            src={require("../assets/images/logo.png")}
            alt="Logo"
            className="logoImg"
          />
          <form onSubmit={handleSearch}>
            <div className="search d-flex">
              <input
                type="text"
                className="input form-control"
                value={searchTerm}
                placeholder="Tìm kiếm theo tên sản phẩm"
                aria-label="Search"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="buttonSearch" type="submit">
                <i className="fa fa-search"></i>
              </button>
            </div>
          </form>
          <div className="link flex-grow-1">
            <nav className="navbar navbar-expand">
              <ul className="navbar-nav flex-grow-1 justify-content-between px-5">
                <li className="nav-item">
                  <a className="nav-link" href="/sign-in">
                    <i className="fa fa-phone"></i>
                    <span>0389780271</span>
                  </a>
                </li>
                <li className="nav-item">
                  <div
                    className="nav-link"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <i className="fa fa-user"></i>
                    <span>{isLoggedIn ? `${userName}` : "Tài Khoản"}</span>
                    {isDropdownOpen && (
                      <div
                        className="dropdown-menu dropdown-menu-end show"
                        style={{ marginTop: -20 }}
                      >
                        <a
                          className="dropdown-item"
                          href={isLoggedIn ? "/user/profile" : "/signin"}
                        >
                          {isLoggedIn ? "Profile" : "Đăng nhập"}
                        </a>
                        {isLoggedIn && (
                          <button
                            className="dropdown-item"
                            onClick={handleLogout} // Gọi handleLogout khi nhấn Đăng xuất
                          >
                            Đăng xuất
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </li>
                <li className="nav-item">
                  <CartIcon />
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom Menu */}
        <div className="menuDuoi">
          <nav className="navbar navbar-expand-sm menuHeader navbar-dark">
            <div className="container-fluid">
              <div className="collapse navbar-collapse">
                <ul className="navbar-nav">
                  <li className="nav-item text-center">
                    <a className="nav-link" href="/#">
                      Trang chủ
                    </a>
                  </li>
                  {role === "ADMIN" && (
                    <li className="nav-item text-center">
                      <p className="nav-link text-center">Quyền admin</p>
                      <ul className="dropdown-menu sub-menu text-center">
                        <li
                          className="nav-item text-center"
                          onClick={() => {
                            navigate("/user/manage");
                          }}
                        >
                          Quản lý người dùng
                        </li>
                        <li
                          className="nav-item text-center"
                          onClick={() => {
                            navigate("/order/manage");
                          }}
                        >
                          Quản lý đơn hàng
                        </li>
                        <li
                          className="nav-item text-center"
                          onClick={() => {
                            navigate("/product/manage");
                          }}
                        >
                          Thêm mới sản phẩm
                        </li>
                      </ul>
                    </li>
                  )}
                  {[...categories].reverse().map((category) => (
                    <li
                      className="nav-item text-center"
                      key={category.categoryId}
                      onMouseEnter={() => {
                        setHoveredCategory(category.categoryId);
                        handleCategoryHover(category.categoryId);
                      }}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <a className="nav-link text-center" href="/#">
                        {category.categoryName}
                      </a>
                      {hoveredCategory === category.categoryId &&
                        subCategories[category.categoryId] && (
                          <ul className="dropdown-menu sub-menu text-center">
                            {subCategories[category.categoryId].map(
                              (subCategory) => (
                                <li
                                  key={subCategory.subCategoryId}
                                  onClick={() =>
                                    handleSubCategoryClick(
                                      subCategory.subCategoryId
                                    )
                                  }
                                >
                                  {subCategory.subCategoryName}
                                </li>
                              )
                            )}
                          </ul>
                        )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Header;
