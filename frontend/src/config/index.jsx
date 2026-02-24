// // const { default: axios } = require("axios");



// // export const BASE_URL = "https://linkedin-clone-full.onrender.com"
// //  export const clientServer = axios.create({
// //       baseURL: BASE_URL,
// // })

// // console.log(clientServer.defaults.baseURL);
// const { default: axios } = require("axios");



// export const BASE_URL = "http://localhost:9090"
// export const clientServer = axios.create({
//       baseURL: BASE_URL,
// })

// console.log(clientServer.defaults.baseURL);



import axios from "axios";

const isLocal =
  typeof window !== "undefined" &&
  window.location.hostname === "localhost";

export const BASE_URL = isLocal
  ? "http://localhost:9090"
  : "https://linkedin-clone-full.onrender.com";

export const clientServer = axios.create({
  baseURL: BASE_URL,
});

console.log("Current BASE_URL:", BASE_URL);