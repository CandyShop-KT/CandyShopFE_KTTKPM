import "../assets/css/checkout.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddAddress from "./addAddress";

const ShippingAddress = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]); // Danh sách địa chỉ
  const [selectedAddress, setSelectedAddress] = useState(null); // Địa chỉ đã chọn
  const [showPopup, setShowPopup] = useState(false); // Trạng thái hiển thị popup
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // Helper để lưu và lấy dữ liệu từ sessionStorage
  const saveToSession = (key, data) => {
    sessionStorage.setItem(key, JSON.stringify(data));
  };

  const getFromSession = (key) => {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  };

  // Lấy danh sách địa chỉ khi component được mount
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!userId || !token) {
        alert("Bạn cần đăng nhập để truy cập tính năng này.");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8081/api/users/${userId}/addresses`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch addresses");

        const data = await response.json();
        setAddresses(data.data);

        // Kiểm tra nếu đã lưu trong sessionStorage, sử dụng giá trị đó
        const storedAddress = getFromSession("selectedAddress");
        if (storedAddress) {
          setSelectedAddress(storedAddress);
        } else if (data.data.length > 0) {
          setSelectedAddress(data.data[0]); // Mặc định chọn địa chỉ đầu tiên
          saveToSession("selectedAddress", data.data[0]);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };

    fetchAddresses();
  }, [userId, token]);

  // Đồng bộ selectedAddress với sessionStorage
  useEffect(() => {
    if (selectedAddress) {
      saveToSession("selectedAddress", selectedAddress);
    }
  }, [selectedAddress]);

  const handleAddressSelect = (address) => {
    setSelectedAddress(address); // Cập nhật địa chỉ đã chọn
    setShowPopup(false); // Đóng popup sau khi chọn
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  return (
    <div className="shipping-address border border-light p-3 mb-3">
      <h3 className="title font-weight-bold mb-2">Địa chỉ giao hàng</h3>
      <div
        className="edit text-primary float-end"
        style={{ cursor: "pointer" }}
        onClick={() => setShowPopup(true)} // Mở popup để chọn địa chỉ
      >
        Thay đổi
      </div>

      {/* Hiển thị địa chỉ đã chọn */}
      {selectedAddress && (
        <div>
          <div>
            <strong className="mr-2">{selectedAddress.customerName}</strong>
            {selectedAddress.phoneNumber}
          </div>
          <div>{selectedAddress.address}</div>
          <div>
            {selectedAddress.ward.wardName},{" "}
            {selectedAddress.district.districtName},{" "}
            {selectedAddress.province.provinceName}
          </div>
        </div>
      )}

      {/* Popup chọn địa chỉ */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3 className="popup-title">Chọn địa chỉ giao hàng</h3>
            <div className="address-list">
              {addresses.map((address) => (
                <div
                  key={address.addressId}
                  className={`address-item ${
                    selectedAddress?.addressId === address.addressId
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handleAddressSelect(address)}
                >
                  <input
                    type="radio"
                    name="selectedAddress"
                    checked={selectedAddress?.addressId === address.addressId}
                    onChange={() => handleAddressSelect(address)}
                  />
                  <div>
                    <strong>{address.customerName}</strong> -{" "}
                    {address.phoneNumber}
                  </div>
                  <div>
                    {address.address}, {address.ward.wardName},{" "}
                    {address.district.districtName},{" "}
                    {address.province.provinceName}
                  </div>
                </div>
              ))}
            </div>
            <div className="popup-footer">
              <button className="btn btn-secondary" onClick={handlePopupClose}>
                Đóng
              </button>

              <button
                className="btn btn-danger"
                onClick={() => navigate("/addaddress")}
              >
                Thêm địa chỉ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingAddress;
