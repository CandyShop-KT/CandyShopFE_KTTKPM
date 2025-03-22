import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ShippingAddress from "../components/ShippingAddresess";
import {
  updateQuantity,
  removeFromCart,
  toggleSelectProduct,
} from "../redux/slices/cartSlice";

const App = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [paymentError, setPaymentError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const { checkoutData } = useSelector((state) => state.checkout);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!token) {
      // alert("Bạn cần đăng nhập để thực hiện tính năng này."); // Hiển thị thông báo
      navigate("/signin"); // Chuyển hướng đến trang đăng nhập
    }
  }, [token, navigate]);

  useEffect(() => {
    // Lấy địa chỉ đã chọn từ sessionStorage khi component được render
    const storedAddress = sessionStorage.getItem("selectedAddress");
    if (storedAddress) {
      setSelectedAddress(JSON.parse(storedAddress)); // Nếu có, set địa chỉ vào state
    } else {
      console.log("No address found in sessionStorage");
    }
  }, [navigate]);

  const subtotal = checkoutData.reduce((sum, product) => {
    // Kiểm tra nếu product và product.price không phải là undefined hoặc null
    if (product && product.currentPrice?.newPrice) {
      return sum + product.currentPrice?.newPrice * product.quantity;
    }
    return sum; // Trả về sum cũ nếu không có price
  }, 0);

  const shippingFee = 25000;
  const total = subtotal + shippingFee;

  const handlePlaceOrder = async () => {
    console.log("fdfdsfdfd");
    if (checkoutData.length === 0) {
      console.log("Giỏ hàng không có sản phẩm.");
      setPaymentError("Giỏ hàng không có sản phẩm.");
      setIsProcessing(false);
      return;
    }
    const storedAddress = sessionStorage.getItem("selectedAddress");
    if (storedAddress) {
      setSelectedAddress(JSON.parse(storedAddress)); // Nếu có, set địa chỉ vào state
    }
    if (!selectedAddress) {
      alert("Vui lòng chọn địa chỉ giao hàng.");
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true); // Bắt đầu xử lý đơn hàng
    console.log("Đang gửi yêu cầu đặt hàng..."); // Thêm dòng này để kiểm tra

    try {
      // Bước 1: Lấy priceId cho từng sản phẩm
      const priceHistoryPromises = checkoutData.map((product) =>
        fetch(
          `http://localhost:8081/api/products/${product.productId}/price-histories`
        )
          .then((response) => response.json())
          .then((data) => {
            // Kiểm tra dữ liệu trả về
            if (data?.data?.content?.length > 0) {
              // Lấy priceHistory gần nhất (sắp xếp theo priceChangeEffectiveDate desc)
              const latestPriceHistory = data.data.content[0];
              return latestPriceHistory.privateHistoryId; // Trả về privateHistoryId của giá mới nhất
            } else {
              return null; // Nếu không có lịch sử giá, trả về null
            }
          })
      );

      // Chờ tất cả lời gọi API hoàn tất
      const priceIds = await Promise.all(priceHistoryPromises);
      console.log("priceIds", priceIds);

      if (priceIds.some((id) => id === null)) {
        alert("Không thể lấy thông tin giá cho một số sản phẩm.");
        setIsProcessing(false);
        return;
      }
      console.log("testPrice2", priceIds[2]);

      // Bước 3: Tạo `orderDetails` với `priceId`
      const orderDetails = checkoutData.map((product, index) => ({
        productId: product.productId, // ID sản phẩm
        quantity: product.quantity, // Số lượng
        price: product.currentPrice?.newPrice, // Giá hiện tại
        priceHistoryId: priceIds[index], // `priceId` lấy từ API
      }));

      // Bước 4: Tạo đối tượng `orderRequestDTO`
      const orderRequestDTO = {
        note: note || "", // Ghi chú đơn hàng (có thể để trống)
        address: selectedAddress.address, // Địa chỉ
        customerName: selectedAddress.customerName, // Tên khách hàng
        phoneNumber: selectedAddress.phoneNumber, // Số điện thoại
        provinceId: selectedAddress.province.provinceId, // ID tỉnh
        districtId: selectedAddress.district.districtId, // ID quận/huyện
        wardId: selectedAddress.ward.wardId, // ID phường/xã
        userId: userId,
        orderDetails, // Chi tiết đơn hàng
      };

      // Bước 5: Gửi yêu cầu tạo đơn hàng
      const orderResponse = await fetch("http://localhost:8081/api/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderRequestDTO),
      });

      if (!orderResponse.ok) {
        throw new Error(
          `Error creating order! Status: ${orderResponse.status}`
        );
      }

      const orderData = await orderResponse.json();
      console.log("Đơn hàng đã được tạo thành công:", orderData);
      alert("Tạo đơn hàng thành công");
      // Xóa sản phẩm khỏi giỏ hàng sau khi tạo đơn hàng thành công
      checkoutData.forEach((product) => {
        dispatch(removeFromCart(product.productId));
      });
      navigate("/");
    } catch (error) {
      console.error("Lỗi trong quá trình xử lý đơn hàng:", error);
      setPaymentError("Đã xảy ra lỗi trong quá trình xử lý đơn hàng.");
    } finally {
      setIsProcessing(false); // Kết thúc quá trình xử lý
    }
  };

  return (
    <div className="container mt-4 py-5">
      <div className="row" style={{ paddingBottom: "500px" }}>
        <div className="col-md-8">
          <ShippingAddress />
          {/* Hiển thị các sản phẩm được chọn */}
          {checkoutData.length > 0 ? (
            checkoutData.map((product, index) => (
              <div key={index} className="product d-flex">
                <img
                  alt={product.name}
                  src={product.mainImageUrl}
                  className="me-2"
                  style={{
                    width: "70px",
                    height: "70px",
                    objectFit: "cover",
                  }}
                />
                <div className="details flex-grow-1">
                  <h5>{product.productName}</h5>
                  <div className="original-price">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(
                      (product.currentPrice?.newPrice || 0) * product.quantity
                    )}
                  </div>
                  <div className="quantity mt-2">Qty: {product.quantity}</div>
                </div>
              </div>
            ))
          ) : (
            <div>Không có sản phẩm nào được chọn trong giỏ hàng.</div>
          )}
        </div>
        <div className="col-md-4">
          <div className="payment-method border border-light p-3 mb-3">
            <h5 className="title font-weight-bold mb-2 mb-3">
              Chọn phương thức thanh toán
            </h5>
            <div>
              <input checked name="payment" type="radio" className="mb-3" />
              Thanh toán khi nhận hàng
            </div>
            <div>
              <input name="payment" type="radio" className="mb-3" />
              Thẻ tín dụng/ ghi nợ
            </div>
            <div>
              <input
                className="form-control"
                placeholder="Card Number"
                type="text"
              />
            </div>
          </div>
          <div className="order-summary border border-light p-3 mb-3">
            <h5 className="font-weight-bold mb-2">Tóm tắt đơn hàng</h5>

            <div className="d-flex justify-content-between mt-2">
              <strong>Tổng tiền sản phẩm: </strong>
              <strong>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(subtotal)}
              </strong>
            </div>
            <div className="d-flex justify-content-between mt-2">
              <strong>Phí ship: </strong>
              <strong>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(shippingFee)}
              </strong>
            </div>
            <div className="d-flex justify-content-between mt-2">
              <h4 className="total text-danger font-weight-bold">
                Tổng thanh toán:
              </h4>

              <strong>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(total)}
              </strong>
            </div>
            <div className="d-flex justify-content-between">
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="btn btn-dark mt-4 w-100 text-center"
              >
                Đặt hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
