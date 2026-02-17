import { BASE_URL, clientServer } from "@/config";
import UserLayout from "@/layout/UserLayout";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/layout/DashboardLayout";
import styles from "./index.module.css";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "@/config/redux/action/postAction";
import {
  getConnectionRequest,
  getMyConnectionRequests,
  sendConnectionRequest,
} from "@/config/redux/action/authAction";

export default function ViewProfilePage({ userProfile }) {
  const router = useRouter();
  const { username } = router.query;

  const dispatch = useDispatch();
  const postReducer = useSelector((state) => state.postReducer);
  const authState = useSelector((state) => state.auth);

  const [isCurrentUserInConnection, setIsCurrentUserInConnection] =
    useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [isConnectionPending, setIsConnectionPending] = useState(true)

  /* FETCH POSTS + CONNECTIONS */
  useEffect(() => {
    dispatch(getAllPosts());
    dispatch(
      getConnectionRequest({ token: localStorage.getItem("token") })
    );
    dispatch(getMyConnectionRequests({token: localStorage.getItem("token")}))
  }, [dispatch]);

  /* FILTER USER POSTS */
  useEffect(() => {
    if (!postReducer.posts || !username) return;

    const filteredPosts = postReducer.posts.filter(
      (post) => post.userId?.username === username
    );

    setUserPosts(filteredPosts);
  }, [postReducer.posts, username]);

  /* CHECK CONNECTION STATUS */
  useEffect(() => {
    if (!authState?.connections || !userProfile?.userId?._id) return;

    const connection = authState.connections.find(
      (user) => user?.connectionId?._id === userProfile.userId._id
    );

    if (!connection) {
      setIsCurrentUserInConnection(false);
      setIsConnectionPending(true);
      return;
    }

    setIsCurrentUserInConnection(true);
    setIsConnectionPending(connection.status === "pending");

  }, [authState.connections, userProfile]);


  if (!userProfile) return <p>Loading...</p>;

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.backdropContainer}>
            <img
              src={`${BASE_URL}/${userProfile.userId.profilePicture}`}
              alt="backdrop"
            />
          </div>

          <div className={styles.profileContainer__details}>
            <div className={styles.profileContainer_flex}>
              <div style={{ flex: "0.8" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.2rem",
                  }}
                >
                  <h2>{userProfile.userId.name}</h2>
                  <p style={{ color: "gray" }}>
                    @{userProfile.userId.username}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                  {isCurrentUserInConnection ? (
                    <button className={styles.connectedButton}>
                      {isConnectionPending ? "pending" : "Connected"}
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        dispatch(
                          sendConnectionRequest({
                            token: localStorage.getItem("token"),
                            user_id: userProfile.userId._id,
                          })
                        )
                      }
                      className={styles.connectBtn}
                    >
                      Connect
                    </button>
                  )}
                  <div
                    onClick={() => {
                      window.open(
                        `${BASE_URL}/users/user/download_resume?id=${userProfile.userId._id}`,
                        "_blank"
                      );
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <svg
                      style={{ width: "1.4em" }}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                  </div>
                  
                </div>

                <p>{userProfile.bio}</p>
              </div>

              <div style={{ flex: "0.2" }}>
                <h3>Recent Activity</h3>

                {userPosts.map((post) => (
                  <div key={post._id} className={styles.postCard}>
                    <div className={styles.card}>
                      <div className={styles.card_profileContainer}>
                        {post.media ? (
                          <img
                            src={`${BASE_URL}/${post.media}`}
                            alt="post media"
                          />
                        ) : (
                          <div
                            style={{
                              width: "3.4rem",
                              height: "3.4rem",
                            }}
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
              {
                userProfile?.postWork?.map((work, index) => (
                  <div key={index} className={styles.workHistoryCard}>
                    <p style={{ fontWeight: "bold" }}>
                      {work.company} - {work.position}
                    </p>
                    <p>{work.years}</p>
                  </div>
                ))
              }
            </div>
          </div>
          <div className={styles.workHistory}>
            <h4>Education</h4>
            <div className={styles.workHistoryContainer}>
              {
                userProfile?.education?.map((education, index) => (
                  <div key={index} className={styles.workHistoryCard}>
                    <p style={{ fontWeight: "bold" }}>
                      {education.school}
                      
                    </p>
                    <p>{education.degree}</p>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}

export async function getServerSideProps(context) {
  try {
    const request = await clientServer.get(
      "/users/user/get_profile_based_on_username",
      {
        params: { username: context.query.username },
      }
    );

    return {
      props: {
        userProfile: request.data.profile,
      },
    };
  } catch (error) {
    return { notFound: true };
  }
}
