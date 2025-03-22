// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify"; // Import ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import CSS cho toast

import Header from "./components/Header";
import Footer from "./components/Footer";
import AddAddress from "./components/addAddress";

import Product from "./pages/Product";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ProductDetail from "./pages/ProductDetail";
import Homepage from "./pages/Homepage";
import Cart from "./pages/Cart";
import Checkout from "./pages/CheckOut";
import UserProfile from "./pages/UserProfile";
import EditUserProfile from "./pages/EditUserProfile";

import ChangePassword from "./pages/ChangePassword";
import OrderHistory from "./pages/OrderHistory";
import OrderDetailPage from "./pages/OrderDetailPage";

import ManageProduct from "./pages/ManageProduct";
import ManageUser from "./pages/ManageUser";
import ManageUserDetail from "./pages/ManageUserDetail";
import ManageOrder from "./pages/ManageOrder";
function App() {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/addaddress" element={<AddAddress />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/product/:subCategoryId" element={<Product />} />
          <Route path="/product" element={<Product />} />
          <Route
            path="/product/manage/:productId"
            element={<ManageProduct />}
          />
          <Route path="/product/manage/" element={<ManageProduct />} />
          <Route path="/productDetail/:productId" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/user/profile" element={<UserProfile />} />
          <Route path="/edit-profile/:userId" element={<EditUserProfile />} />
          <Route path="/changePassword" element={<ChangePassword />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/order-detail/:orderId" element={<OrderDetailPage />} />
          <Route path="/user/address" element={<AddAddress />} />
          <Route
            path="/product/manage/:productId"
            element={<ManageProduct />}
          />
          <Route path="/product/manage/" element={<ManageProduct />} />
          <Route path="/productDetail/:productId" element={<ProductDetail />} />
          <Route path="/product/search/:keyword" element={<Product />} />
          <Route path="/user/manage" element={<ManageUser />} />
          <Route
            path="/user/manage/detailUser"
            element={<ManageUserDetail />}
          />
          <Route path="/order/manage" element={<ManageOrder />} />{" "}
          <Route path="/order/manage" element={<ManageOrder />} />
        </Routes>
        <Footer />
        <ToastContainer // Thêm ToastContainer tại đây
          position="top-right" // Vị trí thông báo
          autoClose={300} // Thời gian tự đóng (2 giây)
          hideProgressBar={false} // Hiển thị thanh tiến trình
          newestOnTop={true} // Thông báo mới nằm trên
          closeOnClick // Đóng khi người dùng nhấn
          pauseOnFocusLoss={false} // Không tạm dừng khi mất tiêu điểm
          draggable // Kéo thả thông báo
          pauseOnHover // Tạm dừng khi di chuột vào
          theme="light" // Chủ đề: light, dark, colored
        />
      </div>
    </Router>
  );
}

export default App;
