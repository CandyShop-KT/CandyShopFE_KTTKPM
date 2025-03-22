import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'; 
import "../assets/css/UserProfile.css";

const UserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const navigate = useNavigate(); 

  useEffect(() => {
    if (userId && token) {
      fetchUserData(token, userId);
    } else {
      setError("User chưa đăng nhập");
      setLoading(false);  
    }
  }, [userId, token]);

  const fetchUserData = async (token, userId) => {
    try {
      const profileResponse = await fetch(`http://localhost:8081/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!profileResponse.ok) throw new Error("Failed to fetch profile data");
      const profileData = await profileResponse.json();
      setUserProfile(profileData.data);

      const addressesResponse = await fetch(`http://localhost:8081/api/users/${userId}/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!addressesResponse.ok) throw new Error("Failed to fetch addresses");
      const addressesData = await addressesResponse.json();
      setAddresses(addressesData.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  const handleAvatarUpload = async (e) => {
    e.preventDefault();
    
    if (!avatarFile) {
      alert("Vui lòng chọn 1 hình ảnh để upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", avatarFile); 

    try {
      const response = await fetch(`http://localhost:8081/api/users/${userId}/avatar`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Failed to upload avatar");
        return;
      }

      const updatedProfile = await response.json();
      setUserProfile(updatedProfile.data);
      alert("Avatar uploaded successfully!");
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const handleEditProfile = () => {
    navigate(`/edit-profile/${userId}`);
  };

  const handleChangePassword = () => {
    window.location.href = '/changePassword';
  };
  const handleOrderHistory = () => {
    window.location.href = '/order-history';
  }

  return (
    <div className="user-profile-container">
      {userProfile && (
        <div className="profile-layout">
          {/* Aside Section: User's Actions */}
          <aside className="profile-aside">
            <h3 className="aside-title">Tùy chọn</h3>
            <ul>
              <li><button onClick={handleEditProfile}>Chỉnh sửa thông tin</button></li>
              <li><button onClick={handleChangePassword}>Thay đổi mật khẩu</button></li>
              <li><button onClick={handleOrderHistory}>Lịch sử mua hàng</button></li>
            </ul>
          </aside>

          {/* Main Content Section: User Profile Information */}
          <article className="profile-article">
            <h2 className="profile-title">THÔNG TIN CÁ NHÂN</h2>
            <div className="profile-info">
              <div>
                <img 
                  src={userProfile.avatarUrl || "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/768px-User-avatar.svg.png"} 
                  alt="User Avatar" 
                  className="avatar-image" 
                />
                <div style={{marginTop: 10, marginLeft:20}}>
                  <input 
                    type="file" 
                    id="avatar-upload" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                    className="avatar-upload-input"
                  />
                  <div>
                    <button 
                      className="upload-avatar-button" 
                      onClick={handleAvatarUpload}
                    >
                      Upload Avatar
                    </button>
                  </div>
                </div>
              </div>

              <div className="profile-column">
                <p><strong>Họ tên:</strong> {userProfile.firstName} {userProfile.lastName}</p>
                <p><strong>Email:</strong> {userProfile.email}</p>
                <p><strong>Điện thoại:</strong> {userProfile.phoneNumber}</p>
              </div>
              <div className="profile-column">
                <p><strong>Ngày sinh:</strong> {new Date(userProfile.birthDay).toLocaleDateString('vi-VN')}</p>
                <p><strong>Giới tính:</strong> {userProfile.gender}</p>
              </div>

              {userProfile.role === "ADMIN" && (
                <div className="profile-column">
                  <p><strong>Vai trò:</strong> {userProfile.role}</p>
                </div>
              )}
            </div>

            {userProfile.role !== "ADMIN" && (
              <div className="address-section">
                <h3 className="address-title">Địa chỉ giao hàng</h3>
                {addresses.length > 0 ? (
                  <table className="address-table">
                    <thead>
                      <tr>
                        <th>Địa chỉ</th>
                        <th>Địa chỉ</th>
                        <th>Xã/Phường</th>
                        <th>Quận/Huyện</th>
                        <th>Thành phố</th>
                      </tr>
                    </thead>
                    <tbody>
                      {addresses.map((address,index) => (
                        <tr key={address.addressId}>
                          <td>{index+1}</td>
                          <td>{address.address}</td>
                          <td>{address.ward.wardName}</td>
                          <td>{address.district.districtName}</td>
                          <td>{address.province.provinceName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-address">Chưa có địa chỉ nào</p>
                )}
              </div>
            )}
          </article>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
