import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../assets/css/EditUserProfile.css"; 

const EditUserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [initialProfile, setInitialProfile] = useState(null);  
  const [serverError, setServerError] = useState(null); 
  const [loading, setLoading] = useState(true);
  const { userId } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch thông tin người dùng
  useEffect(() => {
    if (userId && token) {
      fetchUserData(token, userId);
    } else {
      setServerError("User is not logged in");
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
      setInitialProfile(profileData.data); // Lưu dữ liệu ban đầu
    } catch (error) {
      console.error("Error fetching user data:", error);
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getUpdatedData = () => {
    const updatedData = {};

    if (userProfile.firstName !== initialProfile.firstName) updatedData.firstName = userProfile.firstName;
    if (userProfile.lastName !== initialProfile.lastName) updatedData.lastName = userProfile.lastName;
    if (userProfile.phoneNumber !== initialProfile.phoneNumber) updatedData.phoneNumber = userProfile.phoneNumber;
    if (userProfile.gender !== initialProfile.gender) updatedData.gender = userProfile.gender;
    if (userProfile.birthDay !== initialProfile.birthDay) updatedData.birthDay = userProfile.birthDay;

    return updatedData;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    const updatedData = getUpdatedData();

    // Nếu không có thay đổi, không gửi request
    if (Object.keys(updatedData).length === 0) {
      alert("Không có thay đổi nào để cập nhật.");
      navigate("/user/profile");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8081/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Lấy lỗi từ server
        setServerError(errorData.message || "Failed to update profile");
        return;
      }

      alert("Cập nhật thông tin thành công!");
      navigate(`/user/profile`);
    } catch (error) {
      setServerError(error.message); // Hiển thị lỗi server trả về
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userProfile) {
    return <div>Error: {serverError}</div>;
  }

  return (
    <div className="edit-profile-container">
      <h2 style={{marginTop:15, color:'#3399CC', fontWeight:600}}>CẬP NHẬT THÔNG TIN CÁ NHÂN</h2>
      <form onSubmit={handleUpdateProfile}>
        <div>
          <label>Họ & Chữ lót:</label>
          <input
            type="text"
            value={userProfile.firstName}
            onChange={(e) => setUserProfile({ ...userProfile, firstName: e.target.value })}
          />
        </div>
        <div>
          <label>Tên:</label>
          <input
            type="text"
            value={userProfile.lastName}
            onChange={(e) => setUserProfile({ ...userProfile, lastName: e.target.value })}
          />
        </div>
        <div>
          <label>Số điện thoại:</label>
          <input
            type="text"
            value={userProfile.phoneNumber}
            onChange={(e) => setUserProfile({ ...userProfile, phoneNumber: e.target.value })}
          />
        </div>
        <div>
          <label>Giới tính:</label>
          <select
            value={userProfile.gender}
            onChange={(e) => setUserProfile({ ...userProfile, gender: e.target.value })}
          >
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
            <option value="OTHER">Khác</option>
          </select>
        </div>
        <div>
          <label>Ngày sinh:</label>
          <input
            type="date"
            value={userProfile.birthDay}
            onChange={(e) => setUserProfile({ ...userProfile, birthDay: e.target.value })}
          />
        </div>
        <button type="submit" className = "buttonSaveUser" style={{fontSize:17,fontWeight:600, marginTop:15,marginBottom:15}}>Lưu thay đổi</button>
        {serverError && <div className="error">{serverError}</div>}
      </form>
    </div>
  );
};

export default EditUserProfile;
