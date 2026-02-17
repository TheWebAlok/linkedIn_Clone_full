import {
  getAboutUser,
  getAllUsers,
  getConnectionRequest,
  getMyConnectionRequests,
  loginUser,
  registerUser,
} from "../../action/authAction";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: undefined,
  isError: false,
  isSuccess: false,
  isLoading: false,
  loggedIn: false,
  message: "",
  isTokenThere: false,
  profileFetched: false,
  connections: [],
  connectionRequest: [],
  all_users: [],
  all_profiles_fetched: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    reset: () => initialState,

    emptyMessage: (state) => {
      state.message = "";
      state.isError = false;
      state.isSuccess = false;
    },

    setTokenIsThere: (state) => {
      state.isTokenThere = true;
    },

    setTokenIsNotThere: (state) => {
      state.isTokenThere = false;
    },
  },

  extraReducers: (builder) => {
    builder

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Knocking the door...";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = true;
        state.user = action.payload;
        state.message = "Login is Successful";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || "Login Failed";
      })

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Registering you...";
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = false;
        state.message = "Register is Successful! Please login.";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || "Register Failed";
      })

      // PROFILE
      .addCase(getAboutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.profileFetched = true;
        state.user = action.payload.profile;
      })

      // GET ALL USERS
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.all_profiles_fetched = true;
        state.all_users = action.payload.profiles;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || "Failed to load users";
      })
      // GET CONNECTION REQUESTS (accepted)
      .addCase(getConnectionRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getConnectionRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.connections = action.payload;
      })
      .addCase(getConnectionRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message =
          action.payload?.message || "Failed to fetch connections";
      })

      // MY CONNECTION REQUESTS (pending)
      .addCase(getMyConnectionRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyConnectionRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.connectionRequest = action.payload;
      })
      .addCase(getMyConnectionRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message =
          action.payload?.message || "Failed to fetch connection requests";
      });
  },
});

export const { reset, emptyMessage, setTokenIsThere, setTokenIsNotThere } =
  authSlice.actions;

export default authSlice.reducer;
