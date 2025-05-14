import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEnvelope, FaLock, FaClock } from "react-icons/fa";
import "../assets/css/otpVerification.css";

const OTPVerification = () => {
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Log token khi component được mount
    const token = localStorage.getItem("token");
    console.log("Current token:", token);

    let timer;
    if (countdown > 0 && showOtpForm) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown, showOtpForm]);

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      console.log("Verifying OTP with token:", token);
      console.log("User ID:", userId);
      console.log("OTP to verify:", otp);

      const response = await axios.post(
        `http://localhost:8081/api/users/${userId}/verify`,
        { otp: otp.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Verify OTP response:", response.data);

      if (response.status === 200) {
        toast.success("Xác thực thành công!");
        navigate("/");
      }
    } catch (error) {
      console.error("Verify OTP error:", error.response?.data);
      toast.error(error.response?.data?.message || "Xác thực thất bại");
    }
  };

  const handleSendOTP = async () => {
    try {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");

      console.log("Sending OTP with token:", token);
      console.log("Email to send OTP:", email);

      const response = await axios.post(
        "http://localhost:8081/api/auth/otp",
        { email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Send OTP response:", response.data);

      if (response.status === 200) {
        setShowOtpForm(true);
        setCountdown(60);
        setCanResend(false);
        toast.success("Mã OTP đã được gửi!");
      }
    } catch (error) {
      console.error("Send OTP error:", error.response?.data);
      toast.error(error.response?.data?.message || "Không thể gửi mã OTP");
    }
  };

  const handleResendOTP = async () => {
    try {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");

      console.log("Resending OTP with token:", token);
      console.log("Email to send OTP:", email);

      const response = await axios.post(
        "http://localhost:8081/api/auth/otp",
        { email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Resend OTP response:", response.data);

      if (response.status === 200) {
        setCountdown(60);
        setCanResend(false);
        toast.success("Mã OTP đã được gửi lại!");
      }
    } catch (error) {
      console.error("Resend OTP error:", error.response?.data);
      toast.error(error.response?.data?.message || "Không thể gửi lại mã OTP");
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-card">
        <div className="otp-icon">
          {!showOtpForm ? <FaEnvelope /> : <FaLock />}
        </div>
        <h3 className="otp-title">
          {!showOtpForm ? "Xác thực Email" : "Nhập mã OTP"}
        </h3>

        {!showOtpForm ? (
          <div>
            <p className="otp-description">
              Vui lòng nhấn nút bên dưới để nhận mã OTP qua email của bạn. Mã
              OTP sẽ hết hạn sau 60 giây.
            </p>
            <button className="otp-button" onClick={handleSendOTP}>
              Gửi mã OTP
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <div className="mb-3">
              <input
                type="text"
                className="otp-input"
                value={otp}
                onChange={handleOtpChange}
                placeholder="Nhập mã OTP"
                required
                maxLength={6}
              />
            </div>
            <div className="otp-timer">
              {countdown > 0 ? (
                <div>
                  <FaClock className="me-2" />
                  Mã OTP sẽ hết hạn sau: {countdown} giây
                </div>
              ) : (
                <button
                  type="button"
                  className="otp-resend"
                  onClick={handleResendOTP}
                  disabled={!canResend}
                >
                  Gửi lại mã OTP
                </button>
              )}
            </div>
            <button type="submit" className="otp-button">
              Xác thực
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default OTPVerification;
