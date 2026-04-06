import { configureStore, combineReducers } from "@reduxjs/toolkit";
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
import storage from "redux-persist/lib/storage"; // Ithu default-ah local storage use pannum
import authReducer from "./authSlices/authSlice";
import orgReducer from "./OrganizationSlice/orgSlice"; // Intha line add pannunga

// 1. Reducers-ah combine pannuvom
const rootReducer = combineReducers({
  auth: authReducer,
});

// 2. Persist configuration
const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["auth"], // Auth state-ah mattum thaan save pannanum (Security-kaga)
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// 3. Store configuration
export const store = configureStore({
  reducer: persistedReducer,
  organization: orgReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Redux Persist actions-ah ignore panna ithu mukkiyam
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
