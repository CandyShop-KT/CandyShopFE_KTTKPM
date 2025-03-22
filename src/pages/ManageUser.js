import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../assets/css/manageUser.css";

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // State để lưu giá trị tìm kiếm
  const token = localStorage.getItem("token"); // Lấy token từ localStorage
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra vai trò ADMIN
    const role = localStorage.getItem("role");
    if (role !== "ADMIN") {
      alert("Bạn không có quyền truy cập trang này.");
      navigate("/"); // Chuyển hướng về trang chính
      return;
    }

    // Gọi API để lấy danh sách người dùng
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8081/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate, token]);

  const handleUserSelect = (userId) => {
    navigate("/user/manage/detailUser ", { state: { userId } }); // Chuyển hướng và truyền userId
  };

  // Hàm tìm kiếm người dùng
  const handleSearch = async (e) => {
    e.preventDefault(); // Ngăn hành vi mặc định của form
    if (searchTerm.trim()) {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:8081/api/users/${searchTerm}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUsers([response.data.data]); // Cập nhật danh sách người dùng với kết quả tìm kiếm
        setLoading(false);
      } catch (error) {
        console.error("Error searching users:", error);
        setLoading(false);
      }
    } else {
      alert("Vui lòng nhập id của người dùng.");
    }
  };

  // Hàm reset tìm kiếm
  const handleResetSearch = () => {
    setSearchTerm(""); // Reset thanh tìm kiếm
    // Gọi lại API để lấy danh sách toàn bộ người dùng
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8081/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  };

  if (loading) {
    return <div>Loading...</div>; // Hiển thị thông báo đang tải
  }

  return (
    <div className="manage-user-container mt-0">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>
          Danh sách người dùng
          <span className="text-muted"> {users.length}</span>
        </h4>
        <div className="btn-group">
          <button
            className="btn btn-outline-secondary"
            onClick={handleResetSearch}
          >
            <i className="fas fa-filter"></i> Filters
          </button>
          <button className="btn btn-primary">
            <i className="fas fa-plus"></i> Add user
          </button>
        </div>
      </div>
      <div className="table-header">
        <div className="search-bar">
          <form onSubmit={handleSearch}>
            <input
              className="form-control"
              placeholder="Find by Id"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // Cập nhật giá trị tìm kiếm
            />
            <button className="btn btn-outline-secondary" type="submit">
              <i className="fas fa-search"></i>
            </button>
          </form>
        </div>
      </div>
      <ul className="list-group">
        {users.map((user) => (
          <li
            key={user.userId}
            className="list-group-item d-flex align-items-center user-row"
            onClick={() => handleUserSelect(user.userId)}
          >
            <img
              alt={`Profile picture of ${user.firstName} ${user.lastName}`}
              className="user-avatar"
              src={
                user.avatarUrl
                  ? user.avatarUrl
                  : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDPm48Z3Xq23OFtzXd8KKaaA6HTF-J7faLxg&s"
              }
            />
            <div className="user-info flex-grow-1">
              <div className="name">
                {user.firstName} {user.lastName}
              </div>
              <div className="email">{user.userName}</div>
            </div>
            <div>
              <span
                className={`badge ${
                  user.role === "ADMIN" ? "bg-success" : "bg-info"
                }`}
              >
                {user.role}
              </span>
            </div>
            <div className="text-muted px-5">{user.status}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageUser;
