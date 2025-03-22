// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice";
import checkoutReducer from "./slices/checkOutSlide";
const store = configureStore({
  reducer: {
    cart: cartReducer,
    checkout: checkoutReducer,
  },
});

export default store;
