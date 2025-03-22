import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const ManageUserDetail = () => {
  const location = useLocation();
  const { userId } = location.state; // Lấy userId từ state
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // Trạng thái chỉnh sửa
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    gender: "",
    birthDay: "",
  });
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "ADMIN") {
      alert("Bạn không có quyền truy cập trang này.");
      navigate("/"); // Chuyển hướng về trang chính
      return;
    }
    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get(
          `http://localhost:8081/api/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(userResponse.data.data);
        setFormData({
          firstName: userResponse.data.data.firstName,
          lastName: userResponse.data.data.lastName,
          phoneNumber: userResponse.data.data.phoneNumber,
          gender: userResponse.data.data.gender,
          birthDay: userResponse.data.data.birthDay || "",
        });

        const ordersResponse = await axios.get(
          `http://localhost:8081/api/users/${userId}/orders?page=0&limit=10&sortField=createdAt&sortOrder=desc`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrders(ordersResponse.data.data.content);
      } catch (error) {
        console.error("Error fetching user data or orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, token]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleUpdateUser = async () => {
    console.log(formData);
    try {
      await axios.patch(`http://localhost:8081/api/users/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser((prevUser) => ({
        ...prevUser,
        ...formData,
      }));
      alert("Sửa thành công <3");
      setIsEditing(false); // Đóng form chỉnh sửa
    } catch (error) {
      alert("Vui lòng sửa trước khi nhấn ok");
      console.error("Error updating user:", error);
      console.error(
        "Error updating user:",
        error.response ? error.response.data : error
      );
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Hiển thị thông báo đang tải
  }

  return (
    <div className="container">
      {user && (
        <div>
          <h2>Thông tin người dùng</h2>
          {isEditing ? (
            <div>
              <label>Họ:</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
              />
              <label>Tên:</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
              />
              <label>Số điện thoại:</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
              />
              <label>Giới tính:</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
              >
                <option value="FEMALE">Nữ</option>
                <option value="MALE">Nam</option>
              </select>
              <label>Ngày sinh:</label>
              <input
                type="date"
                name="birthDay"
                value={formData.birthDay}
                onChange={handleInputChange}
              />
              <div className="mt-2">
                <button onClick={handleUpdateUser} className="btn btn-primary">
                  OK
                </button>
                <button
                  onClick={handleEditToggle}
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p>
                <strong>Tên người dùng:</strong> {user.userName}
              </p>
              <p>
                <strong>Họ:</strong> {user.firstName}
              </p>
              <p>
                <strong>Tên:</strong> {user.lastName}
              </p>
              <p>
                <strong>Số điện thoại:</strong> {user.phoneNumber}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Giới tính:</strong> {user.gender}
              </p>
              <p>
                <strong>Ngày sinh:</strong> {user.birthDay}
              </p>
              <p>
                <strong>Trạng thái:</strong> {user.status}
              </p>
              <button onClick={handleEditToggle} className="btn btn-warning">
                Chỉnh sửa
              </button>
            </div>
          )}
        </div>
      )}

      {orders.length > 0 && (
        <div>
          <h2>Lịch sử mua hàng</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Khách hàng</th>
                <th>Địa chỉ</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.orderId}>
                  <td>{order.orderId}</td>
                  <td>{order.customerName}</td>
                  <td>{order.address}</td>
                  <td>{order.totalAmount.toLocaleString()} VND</td>
                  <td>{order.status}</td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUserDetail;
