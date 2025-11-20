import { createSlice } from "@reduxjs/toolkit";
// import type { PayloadAction } from "@reduxjs/toolkit";

interface ConstState {
  baseUrl: string;
}

const initialState: ConstState = {
  baseUrl: "https://scan2pay.direct/api",
};

const constSlice = createSlice({
  name: "constants",
  initialState,
  reducers: {},
});

export default constSlice.reducer;
