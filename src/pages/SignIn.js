import React, { useState, useEffect, useRef } from "react";
import "../assets/css/signIn.css";
import { useSelector, useDispatch } from "react-redux";
import {
  addToCart,
  removeFromCart,
  toggleSelectProduct,
  updateQuantity,
  syncCart,
} from "../redux/slices/cartSlice";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const formRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    if (token && user) {
      if (user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8081/api/auth/login",
        {
          username,
          password,
        }
      );

      // Kiểm tra nếu đăng nhập thành công
      if (response.status === 200) {
        console.log(response.data); // Log toàn bộ dữ liệu trả về từ API
        const { data } = response.data; // Lấy dữ liệu từ phản hồi
        const token = data.token; // Lấy token
        const role = data.role; // Lấy vai trò
        const userId = data.userId;
        const userName = data.userName;
        const email = data.email; // Lấy email
        const status = data.status; // Lấy trạng thái người dùng

        // Lưu token và vai trò vào localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("userId", userId);
        localStorage.setItem("userName", userName);
        localStorage.setItem("email", email); // Lưu email
        localStorage.setItem("status", status); // Lưu trạng thái

        // Đồng bộ giỏ hàng sau khi đăng nhập
        dispatch(syncCart());

        if (role === "ADMIN") {
          toast.success("Đăng nhập thành công với quyền admin!", {
            onClose: () => {
              navigate("/admin");
              window.location.reload();
            },
          });
        } else {
          toast.success("Đăng nhập thành công!", {
            onClose: () => {
              // Chỉ chuyển đến trang OTP nếu trạng thái là INACTIVE
              if (status === "INACTIVE") {
                navigate("/verify-otp");
              } else {
                navigate("/");
                window.location.reload();
              }
            },
          });
        }
      }
    } catch (error) {
      if (error.response) {
        // Nếu có lỗi từ server
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.");
      }
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (formRef.current) {
        // Tính toán vị trí tuyệt đối của form trên trang
        const formPosition =
          formRef.current.getBoundingClientRect().top + window.pageYOffset;

        // Điều chỉnh vị trí muốn cuộn (có thể trừ chiều cao của header hoặc một giá trị cụ thể)
        const adjustPosition = 250; // Giá trị này có thể thay đổi để điều chỉnh độ cao muốn cuộn
        const adjustedPosition = formPosition - adjustPosition; // Trừ đi một khoảng (100px ở đây)

        // Cuộn tới vị trí đã điều chỉnh
        window.scrollTo({
          top: adjustedPosition,
          behavior: "smooth",
        });
      }
    }, 100); // Delay một chút để đảm bảo layout đã render xong

    return () => clearTimeout(timeout); // Cleanup timeout
  }, []);

  return (
    <div className="container-fluid px-0">
      <div
        className="d-flex justify-content-center align-items-center my-5"
        style={{ paddingTop: "70px", paddingBottom: "100px" }}
      >
        <div className="row border rounded-5 p-3 bg-white shadow box-area">
          {/* Left */}
          <div className="col-md-6 rounded-4 d-flex justify-content-center align-items-center flex-column left-box">
            <div className="featured-image mb-3">
              <img
                src={require("../assets/images/experience-gfx.webp")}
                alt="Experience"
                className="img-fluid"
                style={{ width: "500px" }}
              />
            </div>
          </div>

          {/* Right */}
          <div className="col-md-6 right-box">
            <div className="row align-items-center">
              <div className="header-text mb-4 text-center">
                <h2>Chào mừng bạn trở lại</h2>
                <p>Sô cô la – một món quà ngọt ngào dành cho chính bạn.</p>
              </div>

              {/* Form đăng nhập */}
              <form ref={formRef} onSubmit={handleSubmit}>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control form-control-lg bg-light fs-6"
                    name="username"
                    placeholder="Tên đăng nhập"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group mb-1">
                  <input
                    type="password"
                    className="form-control form-control-lg bg-light fs-6"
                    name="password"
                    placeholder="Mật Khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required // Thêm thuộc tính required
                  />
                </div>
                <div className="input-group mb-5 d-flex justify-content-between">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="formCheck"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                    />
                    <label
                      htmlFor="formCheck"
                      className="form-check-label text-secondary"
                    >
                      <small>Ghi nhớ mật khẩu</small>
                    </label>
                  </div>
                </div>
                {/* Hiển thị thông báo lỗi nếu đăng nhập thất bại */}
                {errorMessage && (
                  <div className="alert alert-danger" role="alert">
                    {errorMessage}
                  </div>
                )}

                <div className="input-group mb-3">
                  <button
                    className="btn btn-lg btn-dark w-100 fs-6"
                    type="submit"
                  >
                    Đăng nhập
                  </button>
                </div>
              </form>

              <div className="row">
                <small>
                  Bạn chưa có tài khoản?
                  <a href="/signup" name="signUp">
                    {/* Cập nhật đường dẫn */}
                    Đăng ký
                  </a>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
