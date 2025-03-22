// redux/slices/checkoutSlice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  checkoutData: [], // Lưu trữ sản phẩm đã chọn từ giỏ hàng
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setCheckoutData(state, action) {
      state.checkoutData = action.payload; // Lưu thông tin vào Redux store
    },
  },
});

export const { setCheckoutData } = checkoutSlice.actions;
export default checkoutSlice.reducer;
