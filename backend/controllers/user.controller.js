import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import ConnectionRequest from "../models/connections.model.js";
import Post from "../models/posts.model.js";
import Comment from "../models/comments.model.js";
import path from "path";

// ----------------------
// Helper: Convert Profile to PDF
// ----------------------


const convertUserDataToPDF = async (userData) => {
  console.log("PROFILE PIC:", userData.userId.profilePicture);

  if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
  }

  const doc = new PDFDocument();
  const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
  const fullPath = `uploads/${outputPath}`;
  const stream = fs.createWriteStream(fullPath);

  doc.pipe(stream);

  // ---------------- IMAGE FIX ----------------
  let imagePath = null;

  if (userData.userId.profilePicture) {
    // Remove extra "uploads/" if already stored
    const cleanedPath =
      userData.userId.profilePicture.replace(/^uploads[\\/]/, "");

    // Absolute path build
    imagePath = path.join(process.cwd(), "uploads", cleanedPath);
  }

  if (imagePath && fs.existsSync(imagePath)) {
    doc.image(imagePath, {
      width: 200,
      height:200,
      align: "center",
    });

    doc.moveDown();
  } else {
    console.log("Image not found at:", imagePath);
  }
  // ------------------------------------------------

  doc.fontSize(14).text(`Name: ${userData.userId.name}`);
  doc.text(`Username: ${userData.userId.username}`);
  doc.text(`Email: ${userData.userId.email}`);
  doc.text(`Bio: ${userData.bio || "N/A"}`);
  doc.text(`Current Position: ${userData.currentPost || "N/A"}`);

  if (Array.isArray(userData.postWork) && userData.postWork.length > 0) {
    doc.moveDown().fontSize(16).text("Past Work:");

    userData.postWork.forEach((work) => {
      doc.fontSize(14).text(`Company: ${work.company}`);
      doc.text(`Position: ${work.position}`);
      doc.text(`Years: ${work.years}`);
      doc.moveDown(0.5);
    });
  }
  if (Array.isArray(userData.education) && userData.education.length > 0) {
    doc.moveDown().fontSize(16).text("Past Work:");

    userData.education.forEach((education) => {
      doc.fontSize(14).text(`College/University: ${education.school}`);
      doc.text(`Course/Stream: ${education.degree}`);
      doc.moveDown(0.5);
    });
  }

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(outputPath));
    stream.on("error", reject);
  });
};

// ----------------------
// const convertUserDataToPDF = async (userData) => {
//   console.log("PROFILE PIC:", userData.userId.profilePicture);
  
//   if (!fs.existsSync("uploads")) {
//     fs.mkdirSync("uploads");
//   }
//   const doc = new PDFDocument();
//   const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
//   const fullPath = `uploads/${outputPath}`;
//   const stream = fs.createWriteStream(fullPath);
//   doc.pipe(stream);
//   if (
//     userData.userId.profilePicture &&
//     fs.existsSync(`uploads/${userData.userId.profilePicture}`)
//   ) {
//     doc.image(`uploads/${userData.userId.profilePicture}`, {
//       align: "center",
//       width: 100,
//     });
//   }
//   doc.fontSize(14).text(`Name: ${userData.userId.name}`);
//   doc.text(`Username: ${userData.userId.username}`);
//   doc.text(`Email: ${userData.userId.email}`);
//   doc.text(`Bio: ${userData.bio || "N/A"}`);
//   doc.text(`Current Position: ${userData.currentPost || "N/A"}`);

//   if (Array.isArray(userData.postWork) && userData.postWork.length > 0) {
//     doc.moveDown().fontSize(16).text("Past Work:");
//     userData.postWork.forEach((work) => {
//       doc.fontSize(14).text(`Company: ${work.company}`);
//       doc.text(`Position: ${work.position}`);
//       doc.text(`Years: ${work.years}`);
//       doc.moveDown(0.5);
//     });
//   }

//   //  End and wait until writing completes
//   doc.end();

//   return new Promise((resolve, reject) => {
//     stream.on("finish", () => resolve(outputPath));
//     stream.on("error", reject);
//   });
// };

// ----------------------
// REGISTER
// ----------------------
export const register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    if (!name || !email || !password || !username)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      username,
    });
    await newUser.save();

    const profile = new Profile({ userId: newUser._id });
    await profile.save();

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ----------------------
// LOGIN
// ----------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User does not exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = crypto.randomBytes(32).toString("hex");
    await User.updateOne({ _id: user._id }, { token });

    return res.json({ token: token });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ----------------------
// UPLOAD PROFILE PICTURE
// ----------------------
export const uploadProfilePicture = async (req, res) => {
  try {
    const { token } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const imagePath = `uploads/${req.file.filename}`;

    //  UPDATE USER COLLECTION
    user.profilePicture = imagePath;
    await user.save();

    //  UPDATE PROFILE COLLECTION (embedded userId object)
    profile.userId.profilePicture = imagePath;
    await profile.save();

    res.json({
      message: "Profile picture updated successfully",
      profilePicture: imagePath,
    });
  } catch (error) {
    console.error("Upload profile picture error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ----------------------
// UPDATE USER BASIC INFO
// ----------------------
export const updateUserProfile = async (req, res) => {
  try {
    const { token, ...newUserData } = req.body;
    const user = await User.findOne({ token });

    if (!user) return res.status(404).json({ message: "User not found" });

    const { username, email } = newUserData;

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser && String(existingUser._id) !== String(user._id)) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    Object.assign(user, newUserData);
    await user.save();

    return res.json({ message: "User profile updated successfully", user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ----------------------
// GET USER + PROFILE
// ----------------------
export const getUserAndProfile = async (req, res) => {
  try {
    const { token } = req.query;
    console.log(`token:${token}`);

    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });

    const profile = await Profile.findOne({ userId: user._id })
      .populate("userId", "name email username profilePicture")
      .lean();

    return res.json({ user, profile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ----------------------
// UPDATE PROFILE DETAILS
// ----------------------
export const updateProfileData = async (req, res) => {
  try {
    const { token, ...newProfileData } = req.body;
    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });

    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    Object.assign(profile, newProfileData);
    await profile.save();

    return res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ----------------------
// GET ALL USERS + PROFILES
// ----------------------
export const getAllUserProfile = async (req, res) => {
  try {
    // const { token } = req.query;
    // console.log(`Token ${token}`);
    // const user = await User.findOne({ token: token });
    // if (!user) return res.status(404).json({ message: "User not found" });
    // console.log(user);
    const profiles = await Profile.find().populate(
      "userId",
      "name username email profilePicture",
    );
    return res.json({ profiles });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ----------------------
// DOWNLOAD PROFILE AS PDF
// ----------------------
export const downloadProfile = async (req, res) => {
  try {
    const user_id = req.query.id;
    const userProfile = await Profile.findOne({ userId: user_id }).populate(
      "userId",
      "name username email profilePicture",
    );

    if (!userProfile)
      return res.status(404).json({ message: "Profile not found" });

    const outputPath = await convertUserDataToPDF(userProfile);
    const fullPath = `uploads/${outputPath}`;

    res.download(fullPath, "profile.pdf", (err) => {
      if (err) console.error("Download error:", err);
      fs.unlinkSync(fullPath);
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to generate PDF" });
  }
};

export const sendConnectionRequest = async (req, res) => {
  const { token, connectionId } = req.body;

  try {
    if (!token || !connectionId) {
      return res.status(400).json({ message: "Missing data" });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connectionUser = await User.findById(connectionId);
    if (!connectionUser) {
      return res.status(404).json({ message: "Connection user not found" });
    }

    const existingRequest = await ConnectionRequest.findOne({
      userId: user._id,
      connectionId: connectionUser._id,
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Request already sent" });
    }

    const request = new ConnectionRequest({
      userId: user._id,
      connectionId: connectionUser._id,
    });

    await request.save();

    return res.status(200).json({
      message: "Connection request sent successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyConnectionRequests = async (req, res) => {
  const { token } = req.query;

  try {
    if (!token) {
      return res.status(400).json({ message: "Token missing" });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connections = await ConnectionRequest.find({
      userId: user._id,
    }).populate("connectionId", "name username email profilePicture");

    return res.status(200).json({ connections });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const whatAreMyConnections = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connections = await ConnectionRequest.find({
      connectionId: user._id,
    }).populate("userId", "name username email profilePicture");
    return res.json({ connections });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  const { token, requestId, action_type } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connection = await ConnectionRequest.findById(requestId);
    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }

    if (action_type === "accept") {
      connection.status = "accepted";
    } else {
      connection.status = "rejected";
    }

    await connection.save();

    return res.json({
      message: "Request Updated Successfully",
      status: connection.status,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const commentPost = async (req, res) => {
  const { token, post_id, commentBody } = req.body;
  try {
    const user = await User.findOne({ token }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findOne({
      _id: post_id,
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = new Comment({
      userId: user._id,
      postId: post_id,
      body: commentBody,
    });
    await comment.save();

    return res.status(200).json({ message: "Comment Added" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUserProfileAndUserBasedOnUsername = async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({
      username,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name username email profilePicture",
    );

    return res.json({ profile: userProfile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
