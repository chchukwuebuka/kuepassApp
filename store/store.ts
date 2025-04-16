

// // store.ts
// import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { useDispatch } from "react-redux";
// import storage from "redux-persist/lib/storage";
// import { persistStore, persistReducer } from "redux-persist";
// import { PersistConfig } from "redux-persist";
// import loadingReducer from "./loadingSlice";

// interface User {
//   name: string;
//   email: string;
//   profilePicture: string;
// }

// interface UserState {
//   isLogged: boolean;
//   userInfo: User | null;
// }

// const initialState: UserState = {
//   isLogged: false,
//   userInfo: null,
// };

// const userSlice = createSlice({
//   name: "user",
//   initialState,
//   reducers: {
//     login(state, action: PayloadAction<User>) {
//       state.isLogged = true;
//       state.userInfo = action.payload;
//     },
//     logout(state) {
//       state.isLogged = false;
//       state.userInfo = null;
//     },
//   },
// });
 
// export const { login, logout } = userSlice.actions;

// const persistConfig: PersistConfig<UserState> = {
//   key: "user",
//   storage,
// };

// const persistedUserReducer = persistReducer(persistConfig, userSlice.reducer);

// export const store = configureStore({
//   reducer: {
//     user: persistedUserReducer,
//     loading: loadingReducer, // Add the loading reducer
//   },
// });

// export const persistor = persistStore(store);
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
// export const useAppDispatch = () => useDispatch<AppDispatch>();

// store.ts
import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import storage from "redux-persist/lib/storage";
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from "redux-persist";
import { PersistConfig } from "redux-persist";
import loadingReducer from "./loadingSlice";

interface User {
  name: string;
  email: string;
  profilePicture: string;
}

interface UserState {
  isLogged: boolean;
  userInfo: User | null;
}

const initialState: UserState = {
  isLogged: false,
  userInfo: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login(state, action: PayloadAction<User>) {
      state.isLogged = true;
      state.userInfo = action.payload;
    },
    logout(state) {
      state.isLogged = false;
      state.userInfo = null;
    },
  },
});
 
export const { login, logout } = userSlice.actions;

const persistConfig: PersistConfig<UserState> = {
  key: "user",
  storage,
};

const persistedUserReducer = persistReducer(persistConfig, userSlice.reducer);

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    loading: loadingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();