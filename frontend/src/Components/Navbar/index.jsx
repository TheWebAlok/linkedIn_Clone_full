import { useRouter } from "next/router"
import styles from "./styles.module.css"
import { useDispatch, useSelector } from "react-redux";
import { reset } from "@/config/redux/reducer/authReducer";   // ✅ ADD THIS

export default function NavbarComponent() {

  const router = useRouter();
  const authState = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <h1 style={{ cursor: "pointer" }} onClick={() => {
          router.push("/")
        }}>Pro Connect</h1>

        <div className={styles.navbarOptionContainer}>
          {authState.profileFetched && <div>
            <div onClick={()=>{
                  router.push("/profile")
            }} style={{ display: "flex", gap: "1.2rem" }}>
              {/* <p>Hey , {authState.user.userId.name}</p> */}
              <p style={{ fontWeight: "bold", cursor: "pointer" }}>Profile</p>

              <p
                onClick={() => {
                  localStorage.removeItem("token")
                  dispatch(reset())          //  now works
                  router.push("/login")
                }}
                style={{ fontWeight: "bold", cursor: "pointer" }}
              >
                Logout
              </p>
            </div>
          </div>}

          {!authState.profileFetched && (
            <div
              onClick={() => router.push("/login")}
              className={styles.buttonJoin}
            >
              <p>be a part</p>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}
