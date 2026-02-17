const { default: axios } = require("axios");



export const BASE_URL = "https://linkedin-clone-full.onrender.com/"
 export const clientServer = axios.create({
      baseURL: BASE_URL,
})

console.log(clientServer.defaults.baseURL);
