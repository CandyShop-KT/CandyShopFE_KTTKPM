import React, { useState, useEffect } from "react";
import "../assets/css/changePassword.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [oldPasswordError, setOldPasswordError] = useState(""); // Lỗi mật khẩu cũ
  const [newPasswordError, setNewPasswordError] = useState(""); // Lỗi mật khẩu mới
  const [loading, setLoading] = useState(false); // Trạng thái loading
  const [error, setError] = useState(null); // Lỗi tổng quát
  const navigate = useNavigate(); // Khởi tạo useNavigate

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!userId || !token) {
      setError("User is not logged in");
    }
  }, [userId, token]);

  const handleChangePassword = async () => {
    setOldPasswordError("");
    setNewPasswordError("");


    if (!oldPassword || !newPassword) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8081/api/users/${userId}/password`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message.includes("old password")) {
          setOldPasswordError(errorData.message);
        } else if (errorData.message.includes("new password")) {
          setNewPasswordError(errorData.message);
        } else {
          setError(errorData.message || "Failed to change password");
        }
        throw new Error(errorData.message || "Failed to change password");
      }

      const data = await response.json();
      alert(data.message); 
      navigate("/user/profile");
      setOldPassword("");
      setNewPassword("");


    } catch (error) {
      console.error("Error changing password:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="change-password-container">
      <h3 className="password-title">Đổi mật khẩu</h3>
      <div className="password-input-container">
        <input
          type="password"
          placeholder="Nhập mật khẩu cũ"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className={`password-input ${oldPasswordError ? "error" : ""}`}
        />
        {oldPasswordError && <p className="error-message">{oldPasswordError}</p>}
      </div>
      
      <div className="password-input-container">
        <input
          type="password"
          placeholder="Nhập mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={`password-input ${newPasswordError ? "error" : ""}`}
        />
        {newPasswordError && <p className="error-message">{newPasswordError}</p>}
      </div>
      <button onClick={handleChangePassword} className="update-button">Cập nhật mật khẩu</button>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default ChangePassword;
