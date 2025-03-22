import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  updateQuantity,
  removeFromCart,
  toggleSelectProduct,
} from "../redux/slices/cartSlice";
import { useNavigate } from "react-router-dom";
import { setCheckoutData } from "../redux/slices/checkOutSlide";

const Cart = () => {
  const ship = 25000;
  const { cartItems } = useSelector((state) => state.cart); // Lấy giỏ hàng từ Redux
  const dispatch = useDispatch();
  const [confirmDelete, setConfirmDelete] = useState(null); // Trạng thái cho thông báo xác nhận
  const navigate = useNavigate();

  // Tính tổng giá tiền các sản phẩm được chọn
  const calculateSelectedTotal = () => {
    return cartItems.reduce((total, item) => {
      if (item.selected) {
        return total + (item.currentPrice?.newPrice || 0) * item.quantity;
      }
      return total;
    }, 0);
  };
  const selectedTotal = calculateSelectedTotal();

  // Khi người dùng nhấn "Thanh toán", lưu thông tin giỏ hàng đã chọn vào Redux store
  const handleProceedToCheckout = () => {
    const token = localStorage.getItem("token"); // Lấy token từ localStorage
    if (!token) {
      alert("Bạn cần đăng nhập để thực hiện tính năng này.");
      navigate("/signin");
    } else {
      const selectedItems = cartItems.filter((item) => item.selected);
      dispatch(setCheckoutData(selectedItems)); // Lưu thông tin sản phẩm đã chọn vào Redux store
      navigate("/checkout"); // Điều hướng đến trang checkout
    }
  };

  return (
    <div className="container my-4 min-vh-100">
      <div className="card p-4 shadow-sm">
        {/* Header */}
        <div className="row mb-4">
          <div className="col">
            <a href="/product" className="text-secondary">
              Continue Shopping
            </a>
          </div>
          <div className="text-center">
            <h2>Giỏ hàng của tôi</h2>
          </div>
        </div>
        <hr />

        {/* Product List */}
        <div className="row">
          <div className="col-md-9">
            {cartItems.map((item) => (
              <div
                className="row border-bottom py-3 align-items-center position-relative"
                key={item.productId}
              >
                {/* Checkbox để chọn sản phẩm */}
                <div className="col-1">
                  <input
                    type="checkbox"
                    checked={item.selected || false}
                    onChange={() =>
                      dispatch(toggleSelectProduct(item.productId))
                    }
                  />
                </div>

                <div className="col-md-5 d-flex align-items-center">
                  <img
                    src={item.mainImageUrl}
                    alt={item.productName}
                    className="img-thumbnail mr-3"
                    style={{ width: "100px" }}
                  />
                  <div>
                    <h5>{item.productName}</h5>
                  </div>
                </div>
                <div className="col-md-6 d-flex justify-content-between align-items-center mr-2">
                  <div className="mr-2">
                    <p className="mb-1">Giá</p>
                    <p className="font-weight-bold">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(
                        (item.currentPrice?.newPrice || 0) * item.quantity
                      )}
                    </p>
                  </div>
                  <div className="d-flex ml-3">
                    <button
                      className="btn btn-outline-secondary border "
                      onClick={() => {
                        if (item.quantity > 1) {
                          dispatch(
                            updateQuantity({
                              productId: item.productId,
                              delta: -1,
                            })
                          );
                        } else {
                          setConfirmDelete(item.productId);
                        }
                      }}
                    >
                      <i className="fas fa-minus "></i>
                    </button>
                    <input
                      type="text"
                      value={item.quantity || 0}
                      className="form-control text-center mx-2"
                      style={{ width: "50px" }}
                    />
                    <button
                      className="btn btn-outline-secondary border"
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            productId: item.productId,
                            delta: 1,
                          })
                        )
                      }
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  <button
                    className="btn btn-outline-danger border "
                    onClick={() => setConfirmDelete(item.productId)}
                    style={{ width: 50 }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="col-md-3 mt-4">
            <div className="card p-3">
              <h4>Thanh toán</h4>
              <div className="d-flex justify-content-between mt-2">
                <strong>Tiền ship</strong>
                <strong>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(ship)}
                </strong>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <strong>Sản phẩm</strong>
                <strong>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(selectedTotal)}
                </strong>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <strong>Tổng</strong>
                <strong>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(selectedTotal + ship)}
                </strong>
              </div>
              <button
                onClick={handleProceedToCheckout}
                className="mt-5 p-2 text-white"
                style={{
                  backgroundColor: "#ECB159",
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                Thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Delete Popup */}
      {confirmDelete && (
        <div
          className="position-fixed d-flex justify-content-center align-items-center"
          style={{
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1050,
          }}
        >
          <div
            className="bg-white p-4 rounded shadow-lg"
            style={{
              minWidth: "300px",
            }}
          >
            <p className="mb-3">Bạn có chắc chắn muốn xóa sản phẩm này?</p>
            <div className="d-flex justify-content-end ml-2">
              <button
                className="btn btn-secondary btn-sm "
                onClick={() => setConfirmDelete(null)}
              >
                Hủy
              </button>
              <button
                className="btn btn-danger btn-sm ml-2"
                onClick={() => {
                  dispatch(removeFromCart(confirmDelete));
                  setConfirmDelete(null);
                }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
