import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeOrganization: null, // Ippo create panna org details inga irukkum
};

const orgSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {
    setOrganization: (state, action) => {
      state.activeOrganization = action.payload;
    },
    clearOrganization: (state) => {
      state.activeOrganization = null;
    },
  },
});

export const { setOrganization, clearOrganization } = orgSlice.actions;
export default orgSlice.reducer;
