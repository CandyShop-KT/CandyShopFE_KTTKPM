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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const { checkoutData } = useSelector((state) => state.checkout);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const dispatch = useDispatch();
  const [cardNumber, setCardNumber] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);

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
    console.log("Bắt đầu xử lý đơn hàng...");
    
    if (checkoutData.length === 0) {
      console.log("Giỏ hàng không có sản phẩm.");
      setPaymentError("Giỏ hàng không có sản phẩm.");
      setIsProcessing(false);
      return;
    }

    const storedAddress = sessionStorage.getItem("selectedAddress");
    if (storedAddress) {
      setSelectedAddress(JSON.parse(storedAddress));
    }
    
    if (!selectedAddress) {
      alert("Vui lòng chọn địa chỉ giao hàng.");
      setIsProcessing(false);
      return;
    }

    // Validate address data
    if (!selectedAddress.address || !selectedAddress.customerName || !selectedAddress.phoneNumber) {
      alert("Thông tin địa chỉ không đầy đủ. Vui lòng kiểm tra lại.");
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);

    try {
      // Bước 1: Lấy priceId cho từng sản phẩm
      const priceHistoryPromises = checkoutData.map((product) =>
        fetch(
          `http://localhost:8081/api/products/${product.productId}/price-histories`
        )
          .then((response) => response.json())
          .then((data) => {
            if (data?.data?.content?.length > 0) {
              const latestPriceHistory = data.data.content[0];
              return latestPriceHistory.privateHistoryId;
            } else {
              console.error(`Không tìm thấy lịch sử giá cho sản phẩm ${product.productId}`);
              return null;
            }
          })
          .catch(error => {
            console.error(`Lỗi khi lấy lịch sử giá cho sản phẩm ${product.productId}:`, error);
            return null;
          })
      );

      const priceIds = await Promise.all(priceHistoryPromises);
      console.log("Danh sách priceIds:", priceIds);

      // Kiểm tra xem có priceId nào bị null không
      const invalidPriceIds = priceIds.filter(id => id === null);
      if (invalidPriceIds.length > 0) {
        alert("Không thể lấy thông tin giá cho một số sản phẩm. Vui lòng thử lại sau.");
        setIsProcessing(false);
        return;
      }

      // Bước 3: Tạo `orderDetails` với `priceId`
      const orderDetails = checkoutData.map((product, index) => {
        if (!product.currentPrice?.newPrice) {
          console.error(`Sản phẩm ${product.productId} không có giá`);
          return null;
        }
        return {
          productId: product.productId,
          quantity: product.quantity,
          price: product.currentPrice.newPrice,
          priceHistoryId: priceIds[index],
        };
      }).filter(detail => detail !== null);

      if (orderDetails.length !== checkoutData.length) {
        alert("Có lỗi trong thông tin sản phẩm. Vui lòng kiểm tra lại.");
        setIsProcessing(false);
        return;
      }

      // Bước 4: Tạo đối tượng `orderRequestDTO`
      const orderRequestDTO = {
        note: note || "",
        address: selectedAddress.address,
        customerName: selectedAddress.customerName,
        phoneNumber: selectedAddress.phoneNumber,
        provinceId: selectedAddress.province.provinceId,
        districtId: selectedAddress.district.districtId,
        wardId: selectedAddress.ward.wardId,
        userId: userId,
        paymentMethod: paymentMethod,
        orderDetails: orderDetails.map(detail => ({
          productId: detail.productId,
          quantity: detail.quantity,
          price: detail.price,
          priceHistoryId: detail.priceHistoryId
        }))
      };

      // Validate orderRequestDTO
      const requiredFields = [
        'address',
        'customerName',
        'phoneNumber',
        'provinceId',
        'districtId',
        'wardId',
        'userId',
        'orderDetails'
      ];

      const missingFields = requiredFields.filter(field => !orderRequestDTO[field]);
      if (missingFields.length > 0) {
        console.error('Thiếu các trường bắt buộc:', missingFields);
        alert('Thiếu thông tin bắt buộc. Vui lòng kiểm tra lại.');
        setIsProcessing(false);
        return;
      }

      // Validate orderDetails
      if (!orderRequestDTO.orderDetails || orderRequestDTO.orderDetails.length === 0) {
        console.error('Không có chi tiết đơn hàng');
        alert('Không có sản phẩm trong đơn hàng');
        setIsProcessing(false);
        return;
      }

      const invalidOrderDetails = orderRequestDTO.orderDetails.filter(detail => 
        !detail.productId || 
        !detail.quantity || 
        !detail.price || 
        !detail.priceHistoryId
      );

      if (invalidOrderDetails.length > 0) {
        console.error('Chi tiết đơn hàng không hợp lệ:', invalidOrderDetails);
        alert('Có sản phẩm không hợp lệ trong đơn hàng');
        setIsProcessing(false);
        return;
      }

      console.log("Dữ liệu đơn hàng sẽ gửi:", JSON.stringify(orderRequestDTO, null, 2));

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
        const errorData = await orderResponse.json();
        console.error("Chi tiết lỗi từ server:", errorData);
        
        // Xử lý lỗi cụ thể
        if (errorData.errors?.status === 'Account is not active to create order') {
          alert('Tài khoản của bạn chưa được kích hoạt để tạo đơn hàng. Vui lòng liên hệ quản trị viên để được hỗ trợ.');
          setIsProcessing(false);
          return;
        }
        
        throw new Error(`Lỗi tạo đơn hàng! Status: ${orderResponse.status}`);
      }

      const orderData = await orderResponse.json();
      console.log("Đơn hàng đã được tạo thành công:", orderData);
      setOrderSuccess(orderData);
      setShowSuccessModal(true);
      
      // Xóa sản phẩm khỏi giỏ hàng sau khi tạo đơn hàng thành công
      checkoutData.forEach((product) => {
        dispatch(removeFromCart(product.productId));
      });
      
      navigate("/");
    } catch (error) {
      console.error("Lỗi trong quá trình xử lý đơn hàng:", error);
      alert(error.message || "Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Hàm xử lý khi đóng modal
  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate("/");
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
            <h5 className="title font-weight-bold mb-3">
              Chọn phương thức thanh toán
            </h5>
            <div className="payment-options">
              <div className="payment-option mb-3">
                <input
                  type="radio"
                  id="cod"
                  name="payment"
                  checked={paymentMethod === "COD"}
                  onChange={() => {
                    setPaymentMethod("COD");
                    setShowQRCode(false);
                  }}
                  className="me-2"
                />
                <label htmlFor="cod" className="d-flex align-items-center">
                  <i className="fas fa-money-bill-wave me-2"></i>
                  Thanh toán khi nhận hàng (COD)
                </label>
              </div>

              <div className="payment-option mb-3">
                <input
                  type="radio"
                  id="card"
                  name="payment"
                  checked={paymentMethod === "CARD"}
                  onChange={() => {
                    setPaymentMethod("CARD");
                    setShowQRCode(false);
                  }}
                  className="me-2"
                />
                <label htmlFor="card" className="d-flex align-items-center">
                  <i className="fas fa-credit-card me-2"></i>
                  Thẻ tín dụng/ghi nợ
                </label>
                {paymentMethod === "CARD" && (
                  <div className="card-details mt-2 ms-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Số thẻ"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength="16"
                    />
                    <div className="row mt-2">
                      <div className="col">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="MM/YY"
                          maxLength="5"
                        />
                      </div>
                      <div className="col">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="CVV"
                          maxLength="3"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="payment-option">
                <input
                  type="radio"
                  id="qr"
                  name="payment"
                  checked={paymentMethod === "QR"}
                  onChange={() => {
                    setPaymentMethod("QR");
                    setShowQRCode(true);
                  }}
                  className="me-2"
                />
                <label htmlFor="qr" className="d-flex align-items-center">
                  <i className="fas fa-qrcode me-2"></i>
                  Thanh toán qua mã QR
                </label>
                {showQRCode && (
                  <div className="qr-code-container mt-3 ms-4 text-center">
                    <div className="qr-code-placeholder p-3 border rounded">
                      <img
                        src="https://api.vietqr.io/image/VCB-1234567890-1234567890-compact2.png"
                        alt="QR Code"
                        style={{ maxWidth: "200px" }}
                      />
                      <p className="mt-2 mb-0">Quét mã QR để thanh toán</p>
                      <p className="text-muted small">Mã QR sẽ được tạo sau khi xác nhận đơn hàng</p>
                    </div>
                  </div>
                )}
              </div>
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <i className="fas fa-check-circle me-2"></i>
                  Đặt hàng thành công!
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-4">
                  <i className="fas fa-shopping-bag fa-3x text-success mb-3"></i>
                  <h4>Cảm ơn bạn đã đặt hàng!</h4>
                </div>
                <div className="order-details">
                  <h6 className="fw-bold">Chi tiết đơn hàng:</h6>
                  <p><strong>Địa chỉ giao hàng:</strong> {selectedAddress?.address}</p>
                  <p><strong>Người nhận:</strong> {selectedAddress?.customerName}</p>
                  <p><strong>Số điện thoại:</strong> {selectedAddress?.phoneNumber}</p>
                  <p><strong>Phương thức thanh toán:</strong> {paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : paymentMethod === 'CARD' ? 'Thẻ tín dụng/ghi nợ' : 'Thanh toán qua mã QR'}</p>
                  <div className="border-top pt-3 mt-3">
                    <p className="mb-1"><strong>Tổng giá trị đơn hàng:</strong></p>
                    <h5 className="text-danger">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(total)}
                    </h5>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Đóng
                </button>
                <button type="button" className="btn btn-primary" onClick={() => navigate('/product')}>
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
