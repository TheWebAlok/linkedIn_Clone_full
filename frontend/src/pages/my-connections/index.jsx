import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import React, { useEffect } from "react";
import styles from "./index.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyConnectionRequests,
  acceptConnectionRequest,
} from "@/config/redux/action/authAction";
import { BASE_URL } from "@/config";
import { useRouter } from "next/router";

export default function MyConnectionsPage() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getMyConnectionRequests({ token }));
    }
  }, [dispatch]);

  const connections =
    authState.connectionRequest?.connections || [];

  // 🔹 Pending Requests
  const pendingConnections = connections.filter(
    (c) => c.status === "pending"
  );

  // 🔹 Accepted Connections (My Network)
  const acceptedConnections = connections.filter(
    (c) => c.status === "accepted"
  );

  return (
    <UserLayout>
      <DashboardLayout>
        <div>
          <h1>My Connections</h1>

          {/* ================= Pending Requests ================= */}
          {/* <h3>Pending Requests</h3> */}
          <div className={styles.myConnectionContainer}>
            {pendingConnections.length > 0 ? (
              pendingConnections.map((connection) => (
                <div
                  key={connection._id}
                  className={styles.userCard}
                  onClick={() =>
                    router.push(
                      `/view_profile/${connection.userId.username}`
                    )
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1.2rem",
                    }}
                  >
                    <div className={styles.profilePicture}>
                      <img
                        src={`${BASE_URL}/${connection.userId?.profilePicture || "default.jpg"}`}
                        alt="profile"
                      />
                    </div>

                    <div className={styles.userInfo}>
                      <h3>{connection.userId?.name}</h3>
                      <p>@{connection.userId?.username}</p>
                    </div>

                    <button
                      className={styles.connectedButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        const token = localStorage.getItem("token");
                        dispatch(
                          acceptConnectionRequest({
                            connectionId: connection._id,
                            token,
                            action: "accept",
                          })
                        ).then(() => {
                          dispatch(getMyConnectionRequests({ token }));
                        });
                      }}
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p style={{marginTop:"0.5rem", marginBottom:"1.5rem",color:"gray"}}>No pending requests</p>
            )}
          </div>

          {/* ================= My Network ================= */}
          <h3>My Network</h3>
          <div className={styles.myConnectionContainer}>
            {acceptedConnections.length > 0 ? (
              acceptedConnections.map((connection) => (
                <div
                  key={connection._id}
                  className={styles.userCard}
                  onClick={() =>
                    router.push(
                      `/view_profile/${connection.userId.username}`
                    )
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1.2rem",
                    }}
                  >
                    <div className={styles.profilePicture}>
                      <img
                        src={`${BASE_URL}/${connection.userId?.profilePicture || "default.jpg"}`}
                        alt="profile"
                      />
                    </div>

                    <div className={styles.userInfo}>
                      <h3>{connection.userId?.name}</h3>
                      <p>@{connection.userId?.username}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No connections yet</p>
            )}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
