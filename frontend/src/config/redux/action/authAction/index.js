import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";

/* ================= LOGIN USER ================= */
export const loginUser = createAsyncThunk(
  "user/login",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/users/login", {
        email: user.email,
        password: user.password,
      });

      const { token } = response.data;

      if (!token) {
        return thunkAPI.rejectWithValue("Token not provided");
      }

      localStorage.setItem("token", token);

      return token;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Login failed",
      );
    }
  },
);

/* ================= REGISTER USER ================= */
export const registerUser = createAsyncThunk(
  "user/register",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/users/register", {
        username: user.username,
        password: user.password,
        email: user.email,
        name: user.name,
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Registration failed",
      );
    }
  },
);

export const getAboutUser = createAsyncThunk(
  "user/getAboutUser",
  async (user, thunkAPI) => {
    try {
      console.log("Calling API with token:", user.token);

      const response = await clientServer.get("/users/get_user_and_profile", {
        params: { token: user.token },
      });

      console.log("API response:", response.data);

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      console.error("API error:", err);

      return thunkAPI.rejectWithValue(
        err.response?.data || { message: "Error" },
      );
    }
  },
);

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return thunkAPI.rejectWithValue({ message: "No token found" });
      }

      console.log("Calling API with token:", token);

      const response = await clientServer.get("/users/user/get_all_users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { message: "Error fetching users" },
      );
    }
  },
);
export const sendConnectionRequest = createAsyncThunk(
  "user/sendConnectionRequest",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post(
        "/users/user/send_connection_request",
        {
          token: user.token,
          connectionId: user.user_id,
        },
      );
      thunkAPI.dispatch(getConnectionRequest({ token: user.token }));
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { message: "Error sending request" },
      );
    }
  },
);

export const getConnectionRequest = createAsyncThunk(
  "user/getConnectionRequest",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get(
        "/users/user/getConnectionRequest",
        {
          params: { token: user.token },
        },
      );

      return response.data.connections;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { message: "Error fetching connections" },
      );
    }
  },
);

export const getMyConnectionRequests = createAsyncThunk(
  "user/getMyConnectionRequests",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get(
        "/users/user/user_connection_request",
        {
          params: { token: user.token },
        },
      );
      
      return thunkAPI.fulfillWithValue( response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { message: "Error fetching requests" },
      );
    }
  },
);

export const acceptConnectionRequest = createAsyncThunk(
  "user/acceptConnectionRequest",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post(
        "/users/user/accept_connection_request",
        {
          token: user.token,
          requestId: user.connectionId,
          action_type: user.action,
        }
      );
      thunkAPI.dispatch(getConnectionRequest({token: user.token}))
      thunkAPI.dispatch(getMyConnectionRequests({token: user.token}))
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { message: "Error accepting request" }
      );
    }
  }
);

