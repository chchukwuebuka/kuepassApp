import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import storage from "./customStorage";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { PersistConfig } from "redux-persist";
import loadingReducer from "./loadingSlice";
import eventReducer from "./eventSlice";

// Updated User interface to match SignupUser from backend
export interface User {
  id?: string; // or number, depending on your backend
  username: string; // Required (maxLength: 150, minLength: 1)
  email: string; // Required (maxLength: 254)
  phone_number?: string; // Optional (maxLength: 20)
  name?: string; // Optional field from frontend
  profilePicture?: string; // Optional field for profile picture
  profile_url?: string; // Alternative field for profile picture
  country?: string; // Optional (maxLength: 100, minLength: 1)
  currency?: string; // Optional (maxLength: 10, minLength: 1)
  language?: string; // Optional (maxLength: 20, minLength: 1)
  active?: boolean; // Optional
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
    // Add an update user action to update specific fields
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.userInfo) {
        state.userInfo = { ...state.userInfo, ...action.payload };
      }
    },
  },
});

export const { login, logout, updateUser } = userSlice.actions;

const persistConfig: PersistConfig<UserState> = {
  key: "user",
  storage,
};

const persistedUserReducer = persistReducer(persistConfig, userSlice.reducer);

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    loading: loadingReducer,
    event: eventReducer,
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
