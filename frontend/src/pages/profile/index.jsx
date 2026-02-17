import UserLayout from "@/layout/UserLayout";
import DashboardLayout from "@/layout/DashboardLayout";
import styles from "./index.module.css";
import React, { useEffect, useState } from "react";
import { getAboutUser } from "@/config/redux/action/authAction";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL, clientServer } from "@/config";
import { getAllPosts } from "@/config/redux/action/postAction";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const postReducer = useSelector((state) => state.postReducer)
  const [userPosts, setUserPosts] = useState([]);
  // const [companyName, setCompanyName] = useState("")

  // const [position, setPosition] = useState("")
  // const [years, setYears] = useState("")


  const [inputData, setInputData] = useState({ company: '', position: '', years: '', school: '', degree: '' })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setInputData({ ...inputData, [name]: value })
  }
const [modalType, setModalType] = useState(null);

  const [isModelOpen, setIsModelOpen] = useState(false)
  const [userProfile, setUserProfile] = useState({
    userId: {
      name: "",
      username: "",
      profilePicture: "",
    },
    bio: "",
    postWork: [],
  });


  useEffect(() => {
    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    dispatch(getAllPosts())
  }, [dispatch]);

  useEffect(() => {
    if (authState?.user) {
      setUserProfile(authState.user);
    }
  }, [authState.user]);

  useEffect(() => {
    if (!postReducer?.posts || !authState?.user?.userId) return;

    const posts = postReducer.posts.filter((post) => {
      return post.userId?.username === authState.user.userId.username;
    });

    setUserPosts(posts);
  }, [postReducer.posts, authState.user]);

  const updateProfilePicture = async (file) => {
    try {
      const formData = new FormData();
      console.log("Uploading file:", file);

      formData.append("profile_picture", file);
      formData.append("token", localStorage.getItem("token"));

      await clientServer.post("/users/update_profile_picture", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    } catch (err) {
      console.error("Profile picture update error", err);
    }
  };


  const updateProfileData = async () => {
    // USER table (name)
    await clientServer.post("/users/user_update", {
      token: localStorage.getItem("token"),
      name: userProfile.userId.name,
    });

    // PROFILE table (bio etc.)
    await clientServer.put("/users/update_profile_data", {
      token: localStorage.getItem("token"),
      bio: userProfile.bio,
      currentPost: userProfile.currentPost,
      postWork: userProfile.postWork,
      education: userProfile.education,
    });

    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
  };


  return (
    <UserLayout>
      <DashboardLayout>
        {authState.user && (
          <div className={styles.container}>
            <div className={styles.backdropContainer}>
              <label htmlFor="profilePictureUpload" className={styles.backDrop__overlay}>
                <p>Edit</p>
              </label>

              <input
                type="file"
                hidden
                id="profilePictureUpload"
                // accept="image/*"
                onChange={(e) => {
                  updateProfilePicture(e.target.files[0]);
                  // e.target.value = null;
                }}
              />


              <img
                src={`${BASE_URL}/${userProfile?.userId?.profilePicture}?t=${Date.now()}`}
                alt="profile"
              />



            </div>



            <div className={styles.profileContainer__details}>
              <div style={{ display: "flex", gap: "0.7rem" }}>
                <div style={{ flex: "0.8" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                    {/* <h2>{userProfile?.userId?.name}</h2> */}
                    <input
                      className={styles.nameEdit}
                      type="text"
                      value={userProfile?.userId?.name || ""}
                      onChange={(e) => {
                        setUserProfile({
                          ...userProfile,
                          userId: {
                            ...userProfile.userId,
                            name: e.target.value,
                          },
                        });
                      }}
                    />
                    <p style={{ color: "gray" }}>
                      @{userProfile?.userId?.username}
                    </p>
                  </div>
                  {/* <p>{userProfile?.bio}</p> */}
                  <div>
                    <textarea
                      value={userProfile?.bio || ""}
                      onChange={(e) => {
                        setUserProfile({ ...userProfile, bio: e.target.value });
                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                      }}
                      style={{ width: "100%", overflow: "hidden" }}
                    />

                  </div>



                </div>

                <div style={{ flex: "0.2" }}>
                  <h3>Recent Activity</h3>

                  {userPosts.map((post) => (
                    <div key={post._id} className={styles.postCard}>
                      <div className={styles.card}>
                        <div className={styles.card_profileContainer}>
                          {post.media && (
                            <img style={{ heigth: "2rem", width: "3rem", borderRadius: "15px", backgrounSize: "cover" }}
                              src={`${BASE_URL}/${post.media}`}
                              alt="post"
                            />
                          )}
                        </div>
                        <p>{post.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.workHistory}>
              <h4>Work History</h4>
              <div className={styles.workHistoryContainer}>
                {userProfile?.postWork?.map((work, index) => (
                  <div key={index} className={styles.workHistoryCard}>
                    <p style={{ fontWeight: "bold" }}>
                      {work.company} - {work.position}
                    </p>
                    <p>{work.years}</p>
                  </div>
                ))}



                <button
                  className={styles.addWorkBtn}
                  onClick={() => setModalType("work")}
                >
                  Add Work
                </button>

              </div>
            </div>


            <div className={styles.workHistory}>
              <h4>Education</h4>
              <div className={styles.workHistoryContainer}>
                {userProfile?.education?.map((education, index) => (
                  <div key={index} className={styles.workHistoryCard}>
                    <p style={{ fontWeight: "bold" }}>
                      {education.school}
                    </p>
                    <p>{education.degree}</p>
                  </div>
                ))}



                <button
                  className={styles.addWorkBtn}
                  onClick={() => setModalType("education")}
                >
                  Add Education
                </button>

              </div>
            </div>

            {userProfile != authState.user &&
              <div onClick={() => {
                updateProfileData()
              }} className={styles.updateBtn}>
                Update Profile
              </div>
            }
          </div>
        )}

        {modalType === "work" && (
          <div
            onClick={() => setModalType(null)}
            className={styles.commentsContainer}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={styles.allCommentsContainer}
            >
              <input
                className={styles.inputField}
                onChange={handleInputChange}
                type="text"
                name="company"
                placeholder="Add Company"
              />

              <input
                className={styles.inputField}
                onChange={handleInputChange}
                type="text"
                name="position"
                placeholder="Add Position"
              />

              <input
                className={styles.inputField}
                onChange={handleInputChange}
                type="number"
                name="years"
                placeholder="Years"
              />

              <div
                onClick={() => {
                  setUserProfile({
                    ...userProfile,
                    postWork: [...userProfile.postWork, inputData],
                  });
                  setModalType(null);
                }}
                className={styles.updateBtn}
              >
                Add Work
              </div>
            </div>
          </div>
        )}

        {modalType === "education" && (
          <div
            onClick={() => setModalType(null)}
            className={styles.commentsContainer}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={styles.allCommentsContainer}
            >
              <input
                className={styles.inputField}
                onChange={handleInputChange}
                type="text"
                name="school"
                placeholder="College/University name"
              />

              <input
                className={styles.inputField}
                onChange={handleInputChange}
                type="text"
                name="degree"
                placeholder="Add Course"
              />

              <div
                onClick={() => {
                  setUserProfile({
                    ...userProfile,
                    education: [...userProfile.education, inputData],
                  });
                  setModalType(null);
                }}
                className={styles.updateBtn}
              >
                Add Education
              </div>
            </div>
          </div>
        )}

      </DashboardLayout>
    </UserLayout>
  );
}
