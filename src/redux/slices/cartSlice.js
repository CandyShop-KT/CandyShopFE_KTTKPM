import { createSlice } from "@reduxjs/toolkit";

// Lấy thông tin người dùng từ localStorage
const userId = localStorage.getItem("userId"); // Lấy ID người dùng đã đăng nhập
const tempCartKey = "cart"; // Khóa giỏ hàng tạm thời
const userCartKey = `cart_${userId}`; // Khóa giỏ hàng của người dùng

// Lấy giỏ hàng từ localStorage
let initialCart = [];

// Kiểm tra nếu người dùng đã đăng nhập
if (userId) {
  // Nếu đã đăng nhập, lấy giỏ hàng của người dùng
  initialCart = JSON.parse(localStorage.getItem(userCartKey)) || [];

  // Kiểm tra xem có giỏ hàng tạm thời không
  const tempCartItems = JSON.parse(localStorage.getItem(tempCartKey)) || [];
  if (tempCartItems.length > 0) {
    // Gộp giỏ hàng tạm thời vào giỏ hàng của người dùng
    tempCartItems.forEach((item) => {
      // Kiểm tra xem sản phẩm đã có trong giỏ hàng của người dùng chưa
      const existingItem = initialCart.find(
        (cartItem) => cartItem.productId === item.productId
      );
      if (existingItem) {
        // Nếu đã có, cập nhật số lượng
        existingItem.quantity += item.quantity;
      } else {
        // Nếu chưa có, thêm sản phẩm mới vào giỏ hàng
        initialCart.push(item);
      }
    });

    // Lưu giỏ hàng của người dùng đã cập nhật vào localStorage
    localStorage.setItem(userCartKey, JSON.stringify(initialCart));

    // Xóa giỏ hàng tạm thời
    localStorage.removeItem(tempCartKey);
  }
} else {
  // Nếu chưa đăng nhập, lấy giỏ hàng tạm thời
  initialCart = JSON.parse(localStorage.getItem(tempCartKey)) || [];
}

const initialState = {
  cartCount: initialCart.reduce((acc, item) => acc + item.quantity, 0), // Tổng số lượng sản phẩm trong giỏ
  cartItems: initialCart, // Danh sách sản phẩm trong giỏ
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Thêm sản phẩm vào giỏ
    addToCart: (state, action) => {
      const product = action.payload;
      const existingProduct = state.cartItems.find(
        (item) => item.productId === product.productId
      );

      if (existingProduct) {
        // Nếu sản phẩm đã có trong giỏ hàng, tăng số lượng
        existingProduct.quantity += 1;
      } else {
        // Nếu chưa có, thêm sản phẩm mới vào giỏ hàng
        state.cartItems.push({ ...product, quantity: 1, selected: true });
      }

      // Cập nhật lại số lượng sản phẩm trong giỏ
      state.cartCount = state.cartItems.reduce(
        (acc, item) => acc + item.quantity,
        0
      );

      // Cập nhật giỏ hàng vào localStorage
      if (userId) {
        // Nếu người dùng đã đăng nhập, lưu giỏ hàng vào khóa theo userId
        localStorage.setItem(userCartKey, JSON.stringify(state.cartItems));
      } else {
        // Nếu chưa đăng nhập, lưu giỏ hàng vào khóa tạm thời
        localStorage.setItem(tempCartKey, JSON.stringify(state.cartItems));
      }
    },

    // Cập nhật số lượng sản phẩm trong giỏ hàng
    updateQuantity: (state, action) => {
      const { productId, delta } = action.payload;
      const existingProduct = state.cartItems.find(
        (item) => item.productId === productId
      );

      if (existingProduct) {
        existingProduct.quantity = Math.max(
          1,
          existingProduct.quantity + delta
        ); // Không cho phép số lượng < 1

        // Kiểm tra nếu số lượng nhỏ hơn 1 thì xóa sản phẩm khỏi giỏ hàng
        if (existingProduct.quantity < 1) {
          state.cartItems = state.cartItems.filter(
            (item) => item.productId !== productId
          );
        }
      }

      // Cập nhật lại số lượng sản phẩm trong giỏ
      state.cartCount = state.cartItems.reduce(
        (acc, item) => acc + item.quantity,
        0
      );

      // Cập nhật giỏ hàng vào localStorage
      if (userId) {
        localStorage.setItem(userCartKey, JSON.stringify(state.cartItems));
      } else {
        localStorage.setItem(tempCartKey, JSON.stringify(state.cartItems));
      }
    },

    // Đồng bộ giỏ hàng với localStorage khi ứng dụng khởi tạo
    syncCartWithLocalStorage: (state) => {
      const savedCart =
        JSON.parse(localStorage.getItem(userId ? userCartKey : tempCartKey)) ||
        [];
      state.cartItems = savedCart;
      state.cartCount = savedCart.reduce((acc, item) => acc + item.quantity, 0);
    },

    // Xóa giỏ hàng khi đăng xuất
    clearCart: (state) => {
      state.cartItems = [];
      state.cartCount = 0;
      // Xóa giỏ hàng trong localStorage khi đăng xuất
      if (userId) {
        localStorage.removeItem(userCartKey);
      } else {
        localStorage.removeItem(tempCartKey);
      }
    },

    // Toggle chọn sản phẩm (dành cho việc chọn/mở chọn sản phẩm trong giỏ)
    toggleSelectProduct: (state, action) => {
      const productId = action.payload;
      const product = state.cartItems.find(
        (item) => item.productId === productId
      );
      if (product) {
        product.selected = !product.selected;
      }
      // Cập nhật lại giỏ hàng vào localStorage
      if (userId) {
        localStorage.setItem(userCartKey, JSON.stringify(state.cartItems));
      } else {
        localStorage.setItem(tempCartKey, JSON.stringify(state.cartItems));
      }
    },

    // Xóa sản phẩm khỏi giỏ hàng
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.cartItems = state.cartItems.filter(
        (item) => item.productId !== productId
      );
      state.cartCount = state.cartItems.reduce(
        (acc, item) => acc + item.quantity,
        0
      );
      // Cập nhật giỏ hàng vào localStorage
      if (userId) {
        localStorage.setItem(userCartKey, JSON.stringify(state.cartItems));
      } else {
        localStorage.setItem(tempCartKey, JSON.stringify(state.cartItems));
      }
    },

    // Xóa các sản phẩm được chọn
    removeSelectedItems: (state) => {
      state.cartItems = state.cartItems.filter((item) => !item.selected);
      state.cartCount = state.cartItems.reduce(
        (acc, item) => acc + item.quantity,
        0
      );
      // Cập nhật localStorage
      if (userId) {
        localStorage.setItem(userCartKey, JSON.stringify(state.cartItems));
      } else {
        localStorage.setItem(tempCartKey, JSON.stringify(state.cartItems));
      }
    },
  },
});

// Xuất các action đã tạo để sử dụng trong component
export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  toggleSelectProduct,
  syncCartWithLocalStorage,
  removeSelectedItems,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
