import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import mastersReducer from "./slices/mastersSlice";
import productsReducer from "./slices/productsSlice";
import ordersReducer from "./slices/ordersSlice";
import trackingReducer from "./slices/trackingSlice";
import notificationsReducer from "./slices/notificationsSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      masters: mastersReducer,
      products: productsReducer,
      orders: ordersReducer,
      tracking: trackingReducer,
      notifications: notificationsReducer,
    },
    middleware: (getDefault) => getDefault({ serializableCheck: false }),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
