import UserLayout from '@/layout/UserLayout'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import styles from "./styles.module.css";
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, loginUser } from '@/config/redux/action/authAction';
import { emptyMessage } from "@/config/redux/reducer/authReducer";



function LoginComponent() {

  const authState = useSelector((state) => state.auth)
  const router = useRouter();
  const dispatch = useDispatch();
  
  // false = Sign Up, true = Sign In
  const [userLoginMethod, setUserLoginMethod] = useState(false)

  const [email, setEmailAddress] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [name, setName] = useState("")

  useEffect(() => {
    if (authState.loggedIn) {
      router.push("/dashboard");
    }
  }, [authState.loggedIn, router]);

  useEffect(() => {
  dispatch(emptyMessage());
}, [userLoginMethod, dispatch]);

  
 useEffect(() => {
  if (localStorage.getItem("token")) {
    router.push("/dashboard");
  }
}, [router]);


  const handleRegister = () => {
    if (!name || !email || !password || !username) {
      alert("All fields are required");
      return;
    }
    dispatch(registerUser({ name, email, password, username }));
  };

  const handleLogin = () => {
    if (!email || !password) {
      alert("Email and password are required");
      return;
    }
    dispatch(loginUser({ email, password }));
  };

  
  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.cardContainer}>
          <div className={styles.cardContainer_left}>

            <p className={styles.cardLeft_heading}>
              {userLoginMethod ? "Sign In" : "Sign Up"}
            </p>
            <p style={{ color: authState.isError ? "red" : "green" }}>
              {typeof authState.message === "string"
                ? authState.message
                : authState?.message?.message}
            </p>

            <div className={styles.inputContainer}>

              {/* Show only in Sign Up */}
              {!userLoginMethod && (
                <div className={styles.inputRow}>
                  <input
                    className={styles.inputField}
                    onChange={(e) => setUsername(e.target.value)}
                    type="text"
                    name="username"
                    id="username"
                    placeholder='Username'
                  />
                  <input
                    className={styles.inputField}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    name="name"
                    id="name"
                    placeholder='Name'
                  />
                </div>
              )}

              <input
                className={styles.inputField}
                onChange={(e) => setEmailAddress(e.target.value)}
                type="email"
                name="email"
                id="email"
                placeholder='Email'
              />

              <input
                className={styles.inputField}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                name="password"
                id="password"
                placeholder='Password'
              />

              <div
                className={styles.buttonWithOutline}
                onClick={userLoginMethod ? handleLogin : handleRegister}
              >
                <p>{userLoginMethod ? "Sign In" : "Sign Up"}</p>
              </div>

              <p
                style={{ marginTop: "12px", cursor: "pointer" }}
                onClick={() => setUserLoginMethod(!userLoginMethod)}
              >
                {userLoginMethod
                  ? "Don't have an account? Sign Up"
                  : "Already have an account? Sign In"}
              </p>

            </div>
          </div>

          <div className={styles.cardContainer_right}>
            {userLoginMethod ? <p>Don`t Have an Account?</p> : <p>Already Have an Account</p>}

            <div
              onClick={() => setUserLoginMethod(!userLoginMethod)}
              style={{ color: "black", textAlign: "center", padding: "10px" }}
              className={styles.buttonWithOutline}
            >
              <p>{userLoginMethod ? "Sign Up" : "Sign In"}</p>
            </div>
          </div>

        </div>
      </div>
    </UserLayout>
  )
}

export default LoginComponent
