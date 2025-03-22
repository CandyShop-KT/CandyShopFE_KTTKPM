import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const CartIcon = () => {
  const cartCount = useSelector((state) => state.cart.cartCount); // Lấy cartCount từ Redux
  const navigate = useNavigate();

  const handleCartClick = () => {
    navigate("/cart");
  };

  return (
    <div onClick={handleCartClick} style={{ cursor: "pointer" }}>
      <li className="nav-item">
        <a className="nav-link" href="/cart">
          <i className="fa fa-shopping-cart position-relative">
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {cartCount}
            </span>
          </i>
          <span>Giỏ hàng</span>
        </a>
      </li>
    </div>
  );
};

export default CartIcon;
