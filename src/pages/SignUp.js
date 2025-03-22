import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    userName: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    gender: "",
    password: "",
    confirmPassword: "",
    birthDay: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleGenderChange = (e) => {
    setFormData({
      ...formData,
      gender: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrors({ password: "Password and Confirm Password must match" });
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8081/api/auth/register",
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      setMessage("Registration successful!");
      setErrors({});
      setFormData({
        userName: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        gender: "",
        password: "",
        confirmPassword: "",
        birthDay: "",
      });
      setTimeout(() => {
        navigate("/signin");
      }, 2000); //
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data.errors || {});
        setMessage(error.response.data.message || "Registration failed!");
      } else {
        setMessage("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center p-5 m-5">
      <div className="registration-form p-4 bg-white rounded shadow-sm col-8">
        <h3 className="mb-4">Register</h3>
        {message && <div className="alert alert-info">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <input
                type="text"
                className="form-control"
                id="firstName"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
              {errors.firstName && (
                <div className="text-danger">{errors.firstName}</div>
              )}
            </div>
            <div className="col-md-6">
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                type="text"
                className="form-control"
                id="lastName"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
              {errors.lastName && (
                <div className="text-danger">{errors.lastName}</div>
              )}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="userName" className="form-label">
                Username
              </label>
              <input
                type="text"
                className="form-control"
                id="userName"
                name="userName"
                placeholder="Username"
                value={formData.userName}
                onChange={handleInputChange}
                required
              />
              {errors.userName && (
                <div className="text-danger">{errors.userName}</div>
              )}
            </div>
            <div className="col-md-6">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              {errors.email && (
                <div className="text-danger">{errors.email}</div>
              )}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="phoneNumber" className="form-label">
                Phone Number
              </label>
              <input
                type="text"
                className="form-control"
                id="phoneNumber"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
              />
              {errors.phoneNumber && (
                <div className="text-danger">{errors.phoneNumber}</div>
              )}
            </div>
            <div className="col-md-6">
              <label htmlFor="birthDay" className="form-label">
                Birth Date
              </label>
              <input
                type="date"
                className="form-control"
                id="birthDay"
                name="birthDay"
                value={formData.birthDay}
                onChange={handleInputChange}
                required
              />
              {errors.birthDay && (
                <div className="text-danger">{errors.birthDay}</div>
              )}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              {errors.password && (
                <div className="text-danger">{errors.password}</div>
              )}
            </div>
            <div className="col-md-6">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
              {errors.confirmPassword && (
                <div className="text-danger">{errors.confirmPassword}</div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Gender</label>
            <div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="gender"
                  id="male"
                  value="MALE"
                  checked={formData.gender === "MALE"}
                  onChange={handleGenderChange}
                />
                <label className="form-check-label" htmlFor="male">
                  Male
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="gender"
                  id="female"
                  value="FEMALE"
                  checked={formData.gender === "FEMALE"}
                  onChange={handleGenderChange}
                />
                <label className="form-check-label" htmlFor="female">
                  Female
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="gender"
                  id="other"
                  value="OTHER"
                  checked={formData.gender === "OTHER"}
                  onChange={handleGenderChange}
                />
                <label className="form-check-label" htmlFor="other">
                  Other
                </label>
              </div>
            </div>
            {errors.gender && (
              <div className="text-danger">{errors.gender}</div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-register w-100 btn-lg"
            style={{
              background: "linear-gradient(to right, #432818, #825B32)",
              color: "white",
            }}
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
