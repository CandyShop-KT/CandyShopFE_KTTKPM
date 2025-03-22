import React, { useState, useEffect } from "react";
import axios from "axios";
import "../assets/css/addAddress.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
const AddAddress = () => {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get("http://localhost:8081/api/provinces");
        setProvinces(response.data.data.content);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };

    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (selectedProvince) {
        try {
          const response = await axios.get(
            `http://localhost:8081/api/provinces/${selectedProvince}/districts`
          );
          setDistricts(response.data.data.content);
        } catch (error) {
          console.error("Error fetching districts:", error);
        }
      }
    };

    fetchDistricts();
  }, [selectedProvince]);

  useEffect(() => {
    const fetchWards = async () => {
      if (selectedDistrict) {
        try {
          const response = await axios.get(
            `http://localhost:8081/api/districts/${selectedDistrict}/wards`
          );
          setWards(response.data.data.content);
        } catch (error) {
          console.error("Error fetching wards:", error);
        }
      }
    };

    fetchWards();
  }, [selectedDistrict]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error trước khi gửi

    if (!customerName || !phoneNumber || !address || !selectedWard) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    const newAddress = {
      customerName,
      phoneNumber,
      address,
      provinceId: selectedProvince,
      districtId: selectedDistrict,
      wardId: selectedWard,
    };

    try {
      const response = await axios.post(
        `http://localhost:8081/api/users/${userId}/addresses`,
        newAddress,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response.data.message);
      toast.success("Thêm địa chỉ thành công");
      // Kiểm tra trước khi sử dụng sessionStorage
      const key = "userAddress"; // Bạn cần xác định key phù hợp ở đây
      if (key) {
        // Kiểm tra xem key có hợp lệ không
        sessionStorage.setItem(key, JSON.stringify(newAddress));
      } else {
        console.error("Key is invalid.");
      }

      setCustomerName("");
      setPhoneNumber("");
      setAddress("");
      setSelectedProvince("");
      setSelectedDistrict("");
      setSelectedWard("");
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data.errors;
        let errorMessages = [];
        if (errorData) {
          if (errorData.customerName)
            errorMessages.push(`Tên khách hàng: ${errorData.customerName}`);
          if (errorData.phoneNumber)
            errorMessages.push(`Số điện thoại: ${errorData.phoneNumber}`);
          if (errorData.address)
            errorMessages.push(`Địa chỉ: ${errorData.address}`);
          if (errorData.provinceId)
            errorMessages.push(`Tỉnh: ${errorData.provinceId}`);
          if (errorData.districtId)
            errorMessages.push(`Quận/Huyện: ${errorData.districtId}`);
          if (errorData.wardId)
            errorMessages.push(`Phường/Xã: ${errorData.wardId}`);
          setError(errorMessages.join(", "));
        }
      } else {
        setError("Đã xảy ra lỗi khi thêm địa chỉ.");
      }
    }
  };

  return (
    <div className="address-container">
      <h2 className="address-title">Thêm địa chỉ</h2>
      {error && <div className="address-alert">{error}</div>}
      <form onSubmit={handleSubmit} className="address-form">
        <div className="address-form-group">
          <label className="address-label">Tên khách hàng</label>
          <input
            type="text"
            className="address-input"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
        </div>
        <div className="address-form-group">
          <label className="address-label">Số điện thoại</label>
          <input
            type="text"
            className="address-input"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>
        <div className="address-form-group">
          <label className="address-label">Tên đường, số nhà, tòa nhà</label>
          <input
            type="text"
            className="address-input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
        <div className="address-form-group">
          <label className="address-label">Tỉnh/Thành phố</label>
          <select
            className="address-select"
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            required
          >
            <option value="">Chọn tỉnh</option>
            {provinces.map((province) => (
              <option key={province.provinceId} value={province.provinceId}>
                {province.provinceName}
              </option>
            ))}
          </select>
        </div>
        <div className="address-form-group">
          <label className="address-label">Quận/Huyện</label>
          <select
            className="address-select"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            required
          >
            <option value="">Chọn quận/huyện</option>
            {districts.map((district) => (
              <option key={district.districtId} value={district.districtId}>
                {district.districtName}
              </option>
            ))}
          </select>
        </div>
        <div className="address-form-group">
          <label className="address-label">Phường/Xã</label>
          <select
            className="address-select"
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            required
          >
            <option value="">Chọn phường/xã</option>
            {wards.map((ward) => (
              <option key={ward.wardId} value={ward.wardId}>
                {ward.wardName}
              </option>
            ))}
          </select>
        </div>
        <div className="address-buttons">
          <button type="submit" className="address-btn address-btn-primary">
            Thêm địa chỉ
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAddress;
