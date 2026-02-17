import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/authReducer"
import postReducer from "./reducer/postReducer"
/**
 * 
 * step for state Management
 * SubmitAction
 * Handle action in it's reducer
 * 
 * Register Here -> Reducer
 */
 
 export const store = configureStore({
       reducer: {
             auth: authReducer,
             postReducer: postReducer
       }
 })