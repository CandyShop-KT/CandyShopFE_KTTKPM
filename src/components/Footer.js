import React from "react";

// Định nghĩa các style chung cho Footer
const footerStyle = {
  backgroundImage: `url(${require("../assets/images/banner2.jpg")})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  color: "white",
  padding: "20px",
};

const sectionStyle = {
  display: "flex",
  justifyContent: "space-between",
  width: "100%",
};

const columnStyle = {
  width: "23%",
  marginRight: "20px",
};

const titleStyle = {
  marginBottom: "15px",
  fontWeight: "bold",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "5px",
  border: "1px solid #ddd",
};

const socialIconStyle = {
  fontSize: "20px",
  color: "white",
  textDecoration: "none",
  padding: "5px",
};

const iconStyle = {
  marginRight: "10px",
};

const leftSectionParagraphStyle = {
  marginBottom: "5px", // Giảm khoảng cách giữa các đoạn
  lineHeight: "0.2", // Điều chỉnh khoảng cách dòng
};

const Footer = () => {
  return (
    <div style={footerStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          padding: "20px",
          marginTop: "20px",
        }}
      >
        <div style={sectionStyle}>
          {/* Left Section */}
          <div style={columnStyle}>
            <img
              src={require("../assets/images/logo.png")}
              alt="Logo"
              style={{ width: "100px", height: "auto", marginBottom: "10px" }}
            />
            <div>
              <p style={leftSectionParagraphStyle}>
                <span style={iconStyle}>📍</span> Số 09 Trần Thái Tông, P. Dịch
                Vọng, Q. Cầu Giấy, TP. Hà Nội
              </p>
              <p style={leftSectionParagraphStyle}>
                <span style={iconStyle}>📞</span> 0961452578
              </p>
              <p style={leftSectionParagraphStyle}>chocoshop@gmail.com</p>
            </div>
          </div>

          {/* Middle Section */}
          <div style={columnStyle}>
            <h5 style={titleStyle}>CHÍNH SÁCH</h5>
            <p>Chính sách và quy định chung</p>
            <p>Chính sách giao dịch, thanh toán</p>
            <p>Chính sách đổi trả</p>
            <p>Chính sách bảo mật</p>
            <p>Chính sách vận chuyển</p>
          </div>

          {/* Right Section */}
          <div style={columnStyle}>
            <h5 style={titleStyle}>NHÓM</h5>
            <p>Các thành viên trong nhóm:</p>
            <p>Ngô Thiên Phú</p>
            <p>Nguyên Ngọc Tường Vân</p>
            <p>Nguyễn Thị Thu Hồng</p>
            <p>Hồ Thị Thu Trầm</p>
          </div>

          {/* Newsletter Section */}
          <div style={columnStyle}>
            <h5 style={titleStyle}>NHẬP EMAIL ĐỂ NHẬN KHUYẾN MÃI</h5>
            <input
              type="email"
              placeholder="Nhập email của bạn..."
              style={inputStyle}
            />
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <a href="#" style={socialIconStyle}>
                📱
              </a>
              <a href="#" style={socialIconStyle}>
                🐦
              </a>
              <a href="#" style={socialIconStyle}>
                📸
              </a>
              <a href="#" style={socialIconStyle}>
                🔴
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
