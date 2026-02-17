import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import postRoutes from "./routes/post.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/posts", postRoutes);
app.use("/users", userRoutes);
app.use("/uploads", express.static("uploads"));
// app.use(express.static("uploads"))



app.get("/", (req, res) => {
  res.send("Server is running ");
});

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");
    
    const port = process.env.PORT || 9090;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Database connection failed ", error);
  }
};

start();
