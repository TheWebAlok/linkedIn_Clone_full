import mongoose from "mongoose";

const eductionSchema = new mongoose.Schema({
  school: {
    type: String,
    default: "",
  },
  degree: {
    type: String,
    default: "",
  },
  fieldOfStudy: {
    type: String,
  },
});

const workSchema = new mongoose.Schema({
  company: {
    type: String,
    default: "",
  },
  position: {
    type: String,
    default: "",
  },
  years: {
    type: String,
    default: "",
  },
});

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  bio: {
    type: String,
    default: "",
  },
  currentPost: {
    type: String,
    default: "",
  },
  postWork: {
    type: [workSchema],
    default: [],
  },
  education: {
    type: [eductionSchema],
    default: "",
  },
});
const Profile = mongoose.model("Profile", profileSchema);

export default Profile;