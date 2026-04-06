import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    // Intha puthu reducer-ai add pannunga
    updateSetupStatus: (state, action) => {
      if (state.user) {
        state.user.isSetupCompleted = action.payload;
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logout, updateSetupStatus } = authSlice.actions;
export default authSlice.reducer;
